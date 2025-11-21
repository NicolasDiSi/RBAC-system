import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/services/supabase/server";
import { linkGoogleAccountToUser } from "@/app/actions/user";
import { getUserById } from "@/lib/data/user"; // To verify userId if needed

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const userId = requestUrl.searchParams.get("userId"); // Get userId from query params

  if (code) {
    const supabase = await getSupabaseServerClient();

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error || !data.user) {
      console.error("Error exchanging code for session:", error);
      return NextResponse.redirect(new URL("/auth/login?error=google_auth_failed", request.url));
    }

    // If userId is provided, link the Google account to the existing inactive user
    if (userId) {
      const existingUser = await getUserById(userId);
      if (!existingUser || existingUser.is_active) {
        // If user doesn't exist or is already active, something is wrong with the flow
        await supabase.auth.signOut(); // Sign out the newly created session
        return NextResponse.redirect(new URL("/auth/enter-code?error=invalid_user_id", request.url));
      }

      try {
        await linkGoogleAccountToUser(
          userId,
          data.user.id,
          data.user.email || '',
          data.user.user_metadata.full_name || data.user.email?.split("@")[0] || '',
          data.user.user_metadata.avatar_url || null
        );
        await supabase.auth.signOut(); // Sign out the newly created session
        return NextResponse.redirect(new URL("/auth/login?message=google_linked_success", request.url));
      } catch (linkError) {
        console.error("Error linking Google account:", linkError);
        await supabase.auth.signOut();
        return NextResponse.redirect(new URL("/auth/login?error=google_link_failed", request.url));
      }
    } else {
      // If no userId, it's a direct Google signup attempt without a code.
      // This is not allowed in the new flow.
      await supabase.auth.signOut(); // Sign out the newly created session
      return NextResponse.redirect(new URL("/auth/enter-code?error=signup_code_required", request.url));
    }
  }

  // If no code, or other issues, redirect to login
  return NextResponse.redirect(new URL("/auth/login?error=auth_failed", request.url));
}
