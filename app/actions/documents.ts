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

  const empleado_id = formData.get("empleado_id") as string
  const tipo_documento = formData.get("tipo_documento") as string
  const fecha_vencimiento = formData.get("fecha_vencimiento") as string
  const observaciones = formData.get("observaciones") as string
  const file = formData.get("file") as File

  if (!file) {
    throw new Error("No file provided")
  }

  const fileName = `${Date.now()}-${file.name}`
  const fileUrl = `/uploads/${fileName}` // Placeholder URL

  let estado = "vigente"
  if (fecha_vencimiento) {
    const daysUntilExpiry = Math.floor(
      (new Date(fecha_vencimiento).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
    )
    if (daysUntilExpiry < 0) {
      estado = "vencido"
    } else if (daysUntilExpiry <= 30) {
      estado = "por_vencer"
    }
  }

  const documentData = {
    empleado_id,
    tipo_documento,
    nombre_archivo: file.name,
    url_archivo: fileUrl,
    fecha_vencimiento: fecha_vencimiento || null,
    estado,
    observaciones: observaciones || null,
    uploaded_by: user?.id,
  }

  const document = await DocumentDAO.createDocument(documentData)

  revalidatePath("/documents")
  revalidatePath(`/employees/${empleado_id}`)
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
