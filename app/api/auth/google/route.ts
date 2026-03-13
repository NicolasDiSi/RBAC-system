import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/services/supabase/server"

export async function GET(request: Request) {
  const supabase = await getSupabaseServerClient()
  const requestUrl = new URL(request.url)
  const origin = requestUrl.origin
  const userId = requestUrl.searchParams.get('userId'); // Extract userId

  let redirectToUrl = `${origin}/api/auth/callback`;
  if (userId) {
    redirectToUrl += `?userId=${userId}`; // Append userId to redirect URL
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: redirectToUrl, // Use the modified redirect URL
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.redirect(data.url)
}
