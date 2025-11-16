import { getSupabaseServerClient } from "@/lib/services/supabase/server";
import { executeQuery } from "./query";
import { Role } from "./types/database";

export const RoleDAO = {
  async getAll(): Promise<Role[]> {
    const supabase = await getSupabaseServerClient();
    const query = supabase.from("roles").select("id, name");
    return executeQuery(query);
  },

  async updatePermissions(roleId: string, permissionIds: string[]): Promise<void> {
    const supabase = await getSupabaseServerClient();
    
    // Delete existing permissions for this role
    const deleteQuery = supabase.from("role_permissions").delete().eq("role_id", roleId);
    await executeQuery(deleteQuery);

    // Insert new permissions
    if (permissionIds.length > 0) {
      const rolePermissions = permissionIds.map((permissionId) => ({
        role_id: roleId,
        permission_id: permissionId,
      }));
      const insertQuery = supabase.from("role_permissions").insert(rolePermissions);
      await executeQuery(insertQuery);
    }
  }
};
