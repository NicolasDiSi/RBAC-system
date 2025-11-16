import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function PendingActivationPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Account Pending Activation</CardTitle>
          <CardDescription>Your account is awaiting administrator approval.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Access Restricted</AlertTitle>
            <AlertDescription>
              Your account has been created successfully, but you need to wait for an administrator to
              activate it and assign you a role before you can access the system.
            </AlertDescription>
          </Alert>
          <form action="/api/auth/logout" method="POST">
            <Button type="submit" variant="outline" className="w-full bg-transparent">
              Sign Out
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
