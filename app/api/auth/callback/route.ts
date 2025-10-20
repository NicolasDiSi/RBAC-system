import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const supabase = await getSupabaseServerClient();

    // Intercambia el código por una sesión
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Revisa si el usuario ya existe en nuestra tabla 'users'
      const { data: existingUser } = await supabase
        .from("users")
        .select("id, is_active") // Solo necesitamos saber si existe y si está activo
        .eq("google_id", data.user.id)
        .single();

      // Si el usuario NO existe, lo creamos como inactivo
      if (!existingUser) {
        await supabase.from("users").insert({
          email: data.user.email,
          google_id: data.user.id,
          name: data.user.user_metadata.full_name || data.user.email?.split("@")[0],
          avatar_url: data.user.user_metadata.avatar_url,
          is_active: false, // El nuevo usuario requiere activación
        });

        // IMPORTANTE: Cerramos la sesión que acabamos de crear
        await supabase.auth.signOut();
        // Y lo redirigimos a la página de verificación
        return NextResponse.redirect(new URL("/verification", request.url));
      }

      // Si el usuario ya existe pero NO está activo
      if (existingUser && !existingUser.is_active) {
        // También cerramos su sesión y lo enviamos a la página de verificación
        await supabase.auth.signOut();
        return NextResponse.redirect(new URL("/verification", request.url));
      }
    }
  }

  // Si el usuario ya existía y estaba activo, o si hubo un error,
  // la sesión se mantiene y se le redirige al dashboard.
  return NextResponse.redirect(new URL("/dashboard", request.url));
}
