import { enforceAuthentication } from "@/lib/services/auth/protection";
import { checkPermission } from "@/lib/services/auth/permissions";
import { redirect } from "next/navigation";
import { getAllSignupCodes } from "@/lib/data/signupCode";
import { SignupCodesTable } from "@/components/admin/signup-codes-table";
import { UserDAO } from "@/lib/data/user"; // To get users for signup code generation

export default async function AdminSignupCodesPage() {
  await enforceAuthentication();
  const canView = await checkPermission("users.read_signup_codes");

  if (!canView) {
    redirect("/unauthorized");
  }

  const signupCodes = await getAllSignupCodes();
  const users = await UserDAO.getAll(); // Fetch all users for the form

  const permissions = {
    canGenerate: await checkPermission("users.generate_signup_code"),
    canDelete: await checkPermission("users.delete_signup_code"),
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Signup Code Management</h1>
        <p className="text-muted-foreground">
          Generate, view, and manage signup codes for user registration.
        </p>
      </div>
      <SignupCodesTable signupCodes={signupCodes || []} users={users || []} permissions={permissions} />
    </div>
  );
}
