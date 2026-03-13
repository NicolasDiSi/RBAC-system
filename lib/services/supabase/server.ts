import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { getSessionFromCookie } from "@/lib/services/auth/session";
import jwt from 'jsonwebtoken';
import { getUserWithRoleById } from "@/lib/data/user";

// A simple, request-scoped cache for the Supabase client.
let supabaseClient: SupabaseClient | null = null;

export async function getSupabaseServerClient(): Promise<SupabaseClient> {
  // If a client has already been created for this server-side request, reuse it.
  if (supabaseClient) {
    return supabaseClient;
  }

  const session = await getSessionFromCookie();
  let supabaseAccessToken: string | undefined = undefined;

  if (session) {
    // Use the Drizzle function to get the user's real role from the database
    const userWithRole = await getUserWithRoleById(session.userId);

    if (!userWithRole) {
      throw new Error(`Failed to fetch user role for user ID: ${session.userId}`);
    }

    const userRole = userWithRole.role?.name;
    if (!userRole) {
      throw new Error("User does not have a role assigned.");
    }

    if (!process.env.SUPABASE_JWT_SECRET) {
      throw new Error("SUPABASE_JWT_SECRET is not set in environment variables.");
    }
    
    const payload = {
      sub: session.userId,
      app_role: userRole,
      email: session.email,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours expiration
    };

    supabaseAccessToken = jwt.sign(payload, process.env.SUPABASE_JWT_SECRET);
  }

  // Create a new client for this request.
  supabaseClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          // If we have a token, set the Authorization header.
          ...(supabaseAccessToken && { Authorization: `Bearer ${supabaseAccessToken}` }),
        },
      },
    }
  );

  return supabaseClient;
}