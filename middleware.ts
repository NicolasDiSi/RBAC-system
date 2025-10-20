import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { hasPermission } from "@/lib/auth/permissions"; // Asumimos que esta función existe

// Define las rutas y los permisos que requieren
const protectedRoutes = {
  "/admin/users": "users.read",
  "/admin/roles": "roles.read",
  "/employees": "employees.read",
  "/employees/new": "employees.create",
  "/projects": "projects.read",
  "/projects/new": "projects.create",
  "/documents": "documents.read",
  "/documents/upload": "documents.create",
  "/reports": "reports.view",
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  // 1. Refresca la sesión del usuario.
  const { data: { user } } = await supabase.auth.getUser();

  // 2. Define las rutas públicas que no requieren ninguna acción.
  const publicRoutes = ["/login", "/verification", "/api/auth/callback", "/api/auth/google"];
  if (publicRoutes.includes(pathname)) {
    return response;
  }

  // 3. Si no hay usuario autenticado, redirige al login.
  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 4. Si hay usuario, verifica su estado en nuestra tabla 'users'.
  const { data: userProfile } = await supabase
    .from("users")
    .select("id, is_active") // Obtenemos el ID para usarlo en hasPermission
    .eq("google_id", user.id)
    .single();

  // 5. Si el perfil no existe o está inactivo, CIERRA SU SESIÓN y lo redirige.
  if (!userProfile || !userProfile.is_active) {
    await supabase.auth.signOut();
    return NextResponse.redirect(new URL("/verification", request.url));
  }

  // 6. Si el usuario está activo, comprueba los permisos para la ruta.
  const requiredPermission = protectedRoutes[pathname as keyof typeof protectedRoutes];
  if (requiredPermission) {
    const userHasPermission = await hasPermission(userProfile.id, requiredPermission);
    if (!userHasPermission) {
      // Si no tiene permiso, lo enviamos al dashboard (ya que es un usuario activo y válido)
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // 7. Si pasa todas las validaciones, permite el acceso.
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};