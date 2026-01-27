"use server"

import { revalidatePath } from "next/cache"
import { getAuthenticatedUser } from "@/lib/services/auth/user"
import { checkPermission } from "@/lib/services/auth/permissions"
import  * as DocumentDAO from "@/lib/data/document"

export async function uploadDocument(formData: FormData) {
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

  if (!file) {
    throw new Error("No file provided")
  }

  const fileName = `${Date.now()}-${file.name}`
  const fileUrl = `/uploads/${fileName}` // Placeholder URL

  let estado = "vigente"
  if (fechaVencimiento) {
    const daysUntilExpiry = Math.floor(
      (new Date(fechaVencimiento).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
    )
    if (daysUntilExpiry < 0) {
      estado = "vencido"
    } else if (daysUntilExpiry <= 30) {
      estado = "por_vencer"
    }
  }

  const documentData = {
    empleadoId,
    tipoDocumento,
    nombreArchivo: file.name,
    urlArchivo: fileUrl,
    fechaVencimiento: fechaVencimiento || null,
    estado,
    observaciones: observaciones || null,
    uploadedBy: user?.id,
  }

  const document = await DocumentDAO.createDocument(documentData)

  revalidatePath("/documents")
  revalidatePath(`/employees/${empleadoId}`)
  return document
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

  await DocumentDAO.deleteDocument(documentId)

  revalidatePath("/documents")
  revalidatePath(`/employees/${document.empleadoId}`)
}
