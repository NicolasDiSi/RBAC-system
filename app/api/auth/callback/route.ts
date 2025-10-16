import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (code) {
    const supabase = await getSupabaseServerClient()

    // Exchange code for session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Check if user exists in our users table
      const { data: existingUser } = await supabase.from("users").select("*").eq("google_id", data.user.id).single()

      if (!existingUser) {
        // Create new user record (inactive by default)
        await supabase.from("users").insert({
          email: data.user.email,
          google_id: data.user.id,
          name: data.user.user_metadata.full_name || data.user.email?.split("@")[0],
          avatar_url: data.user.user_metadata.avatar_url,
          is_active: false, // Requires admin activation
        })
      }
    }
  }

  // Redirect to dashboard or pending activation page
  return NextResponse.redirect(new URL("/dashboard", request.url))
}
