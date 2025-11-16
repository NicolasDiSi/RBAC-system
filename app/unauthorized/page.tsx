import { AdminLayout } from "@/components/admin/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <AdminLayout>
      <div className="flex h-full flex-col items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <ShieldAlert className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-red-600">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground">
              You do not have the necessary permissions to view this page. Please contact your administrator if you
              believe this is an error.
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}