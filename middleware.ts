import { NextResponse, type NextRequest } from "next/server";
import { getSessionFromMiddleware } from "@/lib/services/auth/session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes and API routes to pass through.
  // This is a more robust check than a simple array inclusion.
  const publicRoutes = ["/auth/login", "/auth/signup", "/auth/recover-password", "/api/"];
  if (publicRoutes.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const session = await getSessionFromMiddleware(request);

  // If no session exists, redirect to the login page.
  if (!session) {
    // Preserve the original URL for a better user experience after login.
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login';
    url.searchParams.set('redirect_to', pathname);
    return NextResponse.redirect(url);
  }

  // If a session exists, let the request proceed.
  // The actual validation of the user's status (e.g., is_active) and permissions
  // will be handled in the protected Server Components themselves.
  return NextResponse.next();
}


export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - and any files with extensions (e.g., .svg, .png, .jpg)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
  runtime: "nodejs", // Opt-in to the Node.js runtime
};