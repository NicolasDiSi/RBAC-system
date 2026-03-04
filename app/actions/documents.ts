"use server"

import { revalidatePath } from "next/cache"
import { getAuthenticatedUser } from "@/lib/services/auth/user"
import { checkPermission } from "@/lib/services/auth/permissions"
import  * as DocumentDAO from "@/lib/data/document"
import { getDb } from "@/lib/db"
import { documentos } from "@/lib/db/schema"
import { storageService } from "@/lib/services/storage"
import { desc, eq } from "drizzle-orm"

export async function uploadDocument(formData: FormData) {
  try{
    const user = await getAuthenticatedUser()
    const hasPermission = await checkPermission("documents.create")
    if (!hasPermission) {
      throw new Error("Unauthorized")
    }
  
    const empleadoId = formData.get("empleadoId") as string
    const tipoDocumento = formData.get("tipoDocumento") as string
    const fechaVencimiento = formData.get("fechaVencimiento") as string
    const observaciones = formData.get("observaciones") as string
    const file = formData.get("file") as File
    const folder = (formData.get("folder") as string) || undefined
  
    if (!file) {
      throw new Error("No file provided")
    }

    const ACCEPTED_MIME_TYPES = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/png",
    ];

    if (!ACCEPTED_MIME_TYPES.includes(file.type)) {
      throw new Error("Invalid file type.")
    }
    
    // use optional folder, defaulting to root "documents"
    const targetFolder = folder ? `documents/${folder}` : "documents"
    const { key, provider } = await storageService.upload(file, targetFolder)
  
    let estado = "vigente"
    if (fechaVencimiento) {
      const daysUntilExpiry = Math.floor(
        (new Date(fechaVencimiento).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24), 
      )
      if (daysUntilExpiry < 0) {
        estado = "vencido"
      } else if (daysUntilExpiry <= 30) {
        estado = "por_vencer"
      }
    }
  
    const documentData = {
      name: file.name,
      storageKey: key,
      storageProvider: provider,
      fileType: tipoDocumento,
      empleadoId,
      fechaVencimiento: fechaVencimiento || null,
      estado,
      observaciones: observaciones || null,
      uploadedBy: user?.id,
    }
  
    const document = await DocumentDAO.createDocument(documentData)
  
    revalidatePath("/documents")
    revalidatePath(`/employees/${empleadoId}`)
    return document
  }catch(error){
    console.error(error);
    throw new Error("Failed to upload document")
  }
}

export async function deleteDocument(documentId: string) {
  const hasPermission = await checkPermission("documents.delete")
  if (!hasPermission) {
    throw new Error("Unauthorized")
  }

  const document = await DocumentDAO.getDocumentById(documentId)
  if (!document) {
    throw new Error("Document not found")
  }

  try {
    await storageService.deleteFile(document.storageKey)
  } catch (error) {
    console.error(
      `Failed to delete file from storage with key: ${document.storageKey}`,
      error,
    )
    throw new Error(
      "Failed to delete the document from storage. Please try again.",
    )
  }

  await DocumentDAO.deleteDocument(documentId)

  revalidatePath("/documents")
  revalidatePath(`/employees/${document.empleadoId}`)
}

export async function getDocuments() {
  const hasPermission = await checkPermission("documents.read");
  if (!hasPermission) {
    throw new Error("Unauthorized");
  }
  const db = await getDb();
  return db.query.documentos.findMany({
    with: {
      empleado: {
        columns: { nombre: true, apellido: true, dni: true },
      },
    },
    orderBy: [desc(documentos.fechaSubida)],
  });
}

export async function getDocumentsByEmployeeId(employeeId: string) {
  const hasPermission = await checkPermission("documents.read");
  if (!hasPermission) {
    throw new Error("Unauthorized");
  }
  const db = await getDb();
  return db.query.documentos.findMany({
    where: eq(documentos.empleadoId, employeeId),
    orderBy: [desc(documentos.fechaSubida)]
  });
}

// ----------- folder helpers used by client-side components -----------

export async function listDocumentFolders(path: string = "documents") {
  const hasPermission = await checkPermission("documents.read");
  if (!hasPermission) {
    throw new Error("Unauthorized");
  }
  const items = await storageService.listFolderContents(path);
  return items;
}

export async function createDocumentFolder(path: string) {
  const hasPermission = await checkPermission("documents.create");
  if (!hasPermission) {
    throw new Error("Unauthorized");
  }
  return storageService.createFolder(path);
}
