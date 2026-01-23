
import { eq } from 'drizzle-orm';
import { getDb } from '../db';
import schema from '../db/schema';

const { documentos } = schema;

export type Documento = typeof documentos.$inferSelect;
export type NewDocumento = typeof documentos.$inferInsert;

export async function getDocumentById(id: string): Promise<Documento | undefined> {
  const db = await getDb();
  return db.query.documentos.findFirst({
    where: eq(documentos.id, id),
  });
}

export async function createDocument(documentData: NewDocumento): Promise<Documento> {
  const db = await getDb();
  const [newDocument] = await db.insert(documentos).values(documentData).returning();
  return newDocument;
}

export async function deleteDocument(id: string): Promise<Documento> {
    const db = await getDb();
    const [deletedDocument] = await db.delete(documentos).where(eq(documentos.id, id)).returning();
    return deletedDocument;
}

export async function getDocumentsByEmployeeId(employeeId: string): Promise<Documento[]> {
    const db = await getDb();
    return db.query.documentos.findMany({
        where: eq(documentos.empleadoId, employeeId),
        orderBy: (documentos, { desc }) => [desc(documentos.fechaSubida)],
    });
}
