import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { documentos } from "@/lib/db/schema"
import { isNotNull, eq } from "drizzle-orm"

// This endpoint can be called by a cron job to check and update document expiration status
export async function GET() {
  const db = await getDb()

  // Get all documents with expiration dates
  const docs = await db.select().from(documentos).where(isNotNull(documentos.fechaVencimiento));

  if (!docs.length) {
    return NextResponse.json({ message: "No documents found" })
  }

  const updates = []

  for (const doc of docs) {
    const daysUntilExpiry = Math.floor(
      (new Date(doc.fechaVencimiento!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
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
      updates.push(db.update(documentos).set({ estado: newStatus }).where(eq(documentos.id, doc.id)))
    }
  }

  await Promise.all(updates)

  return NextResponse.json({
    message: "Document expiration check completed",
    updated: updates.length,
  })
}
