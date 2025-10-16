import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

// This endpoint can be called by a cron job to check and update document expiration status
export async function GET() {
  const supabase = await getSupabaseServerClient()

  // Get all documents with expiration dates
  const { data: documents } = await supabase.from("documentos").select("*").not("fecha_vencimiento", "is", null)

  if (!documents) {
    return NextResponse.json({ message: "No documents found" })
  }

  const updates = []

  for (const doc of documents) {
    const daysUntilExpiry = Math.floor(
      (new Date(doc.fecha_vencimiento!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
    )

    let newStatus = doc.estado

    if (daysUntilExpiry < 0 && doc.estado !== "vencido") {
      newStatus = "vencido"
    } else if (daysUntilExpiry <= 30 && daysUntilExpiry >= 0 && doc.estado !== "por_vencer") {
      newStatus = "por_vencer"
    } else if (daysUntilExpiry > 30 && doc.estado !== "vigente") {
      newStatus = "vigente"
    }

    if (newStatus !== doc.estado) {
      updates.push(supabase.from("documentos").update({ estado: newStatus }).eq("id", doc.id))
    }
  }

  await Promise.all(updates)

  return NextResponse.json({
    message: "Document expiration check completed",
    updated: updates.length,
  })
}
