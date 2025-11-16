"use server"

import { revalidatePath } from "next/cache"
import { getAuthenticatedUser } from "@/lib/services/auth/user"
import { getSupabaseServerClient } from "@/lib/services/supabase/server"
import { checkPermission } from "@/lib/services/auth/permissions"

export async function uploadDocument(formData: FormData) {
  const user = await getAuthenticatedUser()
  const hasPermission = await checkPermission("documents.create")
  if (!hasPermission) {
    throw new Error("Unauthorized")
  }

  const supabase = await getSupabaseServerClient()

  const empleado_id = formData.get("empleado_id") as string
  const tipo_documento = formData.get("tipo_documento") as string
  const fecha_vencimiento = formData.get("fecha_vencimiento") as string
  const observaciones = formData.get("observaciones") as string
  const file = formData.get("file") as File

  if (!file) {
    throw new Error("No file provided")
  }

  // In a real implementation, you would upload to Vercel Blob or similar storage
  // For now, we'll create a placeholder URL
  const fileName = `${Date.now()}-${file.name}`
  const fileUrl = `/uploads/${fileName}` // Placeholder URL

  // Calculate document status based on expiration date
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

  const { data: document, error } = await supabase
    .from("documentos")
    .insert({
      empleado_id,
      tipo_documento,
      nombre_archivo: file.name,
      url_archivo: fileUrl,
      fecha_vencimiento: fecha_vencimiento || null,
      estado,
      observaciones: observaciones || null,
      uploaded_by: user?.id,
    })
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/documents")
  revalidatePath(`/employees/${empleado_id}`)
  return document
}

export async function deleteDocument(documentId: string) {
  const user = await getAuthenticatedUser()
  const hasPermission = await checkPermission("documents.delete")
  if (!hasPermission) {
    throw new Error("Unauthorized")
  }

  const supabase = await getSupabaseServerClient()

  // Get document info before deleting
  const { data: document } = await supabase.from("documentos").select("*").eq("id", documentId).single()

  if (!document) {
    throw new Error("Document not found")
  }

  // Delete from database
  const { error } = await supabase.from("documentos").delete().eq("id", documentId)

  if (error) {
    throw new Error(error.message)
  }

  // In a real implementation, you would also delete from storage (Vercel Blob)

  revalidatePath("/documents")
  revalidatePath(`/employees/${document.empleado_id}`)
}
