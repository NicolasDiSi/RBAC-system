import { enforceAuthentication } from "@/lib/services/auth/protection";
import { checkPermission } from "@/lib/services/auth/permissions";
import { getDocuments } from "@/app/actions/documents";
import { DocumentsTable } from "@/components/documents/documents-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import { redirect } from "next/navigation";

export default async function DocumentsPage() {
  await enforceAuthentication();
  const canView = await checkPermission("documents.read");

  if (!canView) {
    redirect("/unauthorized");
  }

  // Fetch all documents with employee information
  const documents = await getDocuments();

  const canCreate = await checkPermission("documents.create");

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Document Management</h1>
            <p className="text-muted-foreground">Manage employee documents and track expiration dates</p>
          </div>
          {canCreate && (
            <Link href="/documents/upload">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Upload Document
              </Button>
            </Link>
          )}
        </div>
        <DocumentsTable documents={documents || []} />
      </div>
  );
}
