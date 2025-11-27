import { getSupabaseServiceRoleClient } from "@/lib/services/supabase/server";
import { executeQuery } from "./query";
import { Role, Permission } from "./types/database";

export const RoleDAO = {
  async getAll(): Promise<Role[]> {
    const supabase = await getSupabaseServiceRoleClient();
    const query = supabase.from("roles").select("id, name, description");
    return executeQuery(query);
  },

  async getAllWithPermissionCount(): Promise<any[]> {
    const supabase = await getSupabaseServiceRoleClient();
    const query = supabase
      .from("roles")
      .select(
        `
        *,
        role_permissions(count)
      `
      )
      .order("name");
    return executeQuery(query);
  },

  async getAllPermissions(): Promise<Permission[]> {
    const supabase = await getSupabaseServiceRoleClient();
    const query = supabase.from("permissions").select("*").order("resource, action");
    return executeQuery(query);
  },

  async getById(roleId: string): Promise<Role | null> {
    const supabase = await getSupabaseServiceRoleClient();
    const query = supabase.from("roles").select("*").eq("id", roleId).single();
    return executeQuery(query);
  },

  async create(roleData: { name: string; description?: string }): Promise<Role> {
    const supabase = await getSupabaseServiceRoleClient();
    const query = supabase.from("roles").insert(roleData).select().single();
    return executeQuery(query);
  },

  async update(roleId: string, roleData: { name?: string; description?: string }): Promise<Role> {
    const supabase = await getSupabaseServiceRoleClient();
    const query = supabase.from("roles").update(roleData).eq("id", roleId).select().single();
    return executeQuery(query);
  },

  async delete(roleId: string): Promise<void> {
    const supabase = await getSupabaseServiceRoleClient();
    const query = supabase.from("roles").delete().eq("id", roleId);
    await executeQuery(query);
  },

  async updatePermissions(roleId: string, permissionIds: string[]): Promise<void> {
    const supabase = await getSupabaseServiceRoleClient();
    
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
  },

  async getPermissions(roleId: string): Promise<string[]> {
    const supabase = await getSupabaseServiceRoleClient();
    const { data, error } = await supabase
      .from("role_permissions")
      .select("permission_id")
      .eq("role_id", roleId);

    if (error) {
      console.error("Error fetching role permissions:", error);
      return [];
    }
    return data.map((rp) => rp.permission_id);
  },
};
