import { enforceAuthentication } from "@/lib/services/auth/protection";
import { checkPermission } from "@/lib/services/auth/permissions";
import { getSupabaseServerClient } from "@/lib/services/supabase/server";
import { DocumentUploadForm } from "@/components/documents/document-upload-form";
import { redirect } from "next/navigation";

export default async function UploadDocumentPage() {
  await enforceAuthentication();
  const canCreate = await checkPermission("documents.create");

  if (!canCreate) {
    redirect("/unauthorized");
  }

  const supabase = await getSupabaseServerClient();

  // Fetch all employees for the dropdown
  const { data: employees } = await supabase.from("empleados").select("*").order("apellido");

  return (
      <div className="max-w-3xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Upload Document</h1>
          <p className="text-muted-foreground">Upload a new document for an employee</p>
        </div>
        <DocumentUploadForm employees={employees || []} />
      </div>
  );
}
