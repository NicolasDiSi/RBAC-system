import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "./user";

/**
 * Enforces authentication for a page or layout.
 *
 * This server-side function performs the following checks:
 * 1. Retrieves the authenticated user via the session.
 * 2. If no user is found (invalid session), it redirects to the login page.
 * 3. If the user is found but is not active, it redirects to a pending activation page.
 *
 * This should be called at the beginning of any Server Component that requires
 * an active, authenticated user.
 *
 * @returns {Promise<User>} The fully authenticated and active user object.
 * @throws {RedirectError} Throws a redirect to the login or pending page, which Next.js will handle.
 */
export async function enforceAuthentication() {
  const user = await getAuthenticatedUser();

  if (!user) {
    // The session is invalid or the user doesn't exist in the DB.
    redirect("/auth/login");
  }

  if (!user.isActive) {
    // The user exists but is awaiting admin approval.
    redirect("/auth/pending-activation");
  }

  return user;
}
