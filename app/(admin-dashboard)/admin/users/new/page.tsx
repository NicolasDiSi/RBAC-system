import { AdminLayout } from "@/components/admin/admin-layout";
import { UserForm } from "@/components/admin/user-form";

export default function NewUserPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Create New User</h1>
          <p className="text-muted-foreground">
            Fill out the form to create a new user account.
          </p>
        </div>
        <UserForm />
      </div>
    </AdminLayout>
  );
}
