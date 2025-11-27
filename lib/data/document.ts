import { getSupabaseServiceRoleClient } from "@/lib/services/supabase/server";
import { executeQuery } from "./query";
import { Documento } from "./types/database";

export type DocumentoInput = Omit<Partial<Documento>, 'id' | 'created_at' | 'fecha_subida'>;

export const DocumentDAO = {
  async getById(id: string): Promise<Documento> {
    const supabase = await getSupabaseServiceRoleClient();
    const query = supabase.from("documentos").select("*").eq("id", id).single();
    return executeQuery(query);
  },

  async create(documentData: DocumentoInput): Promise<Documento> {
    const supabase = await getSupabaseServiceRoleClient();
    const query = supabase.from("documentos").insert(documentData).select().single();
    return executeQuery(query);
  },

  async delete(id: string): Promise<Documento[]> {
    const supabase = await getSupabaseServiceRoleClient();
    const query = supabase.from("documentos").delete().eq("id", id);
    return executeQuery(query);
  }
};