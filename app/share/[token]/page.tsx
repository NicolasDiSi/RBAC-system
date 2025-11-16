
import { getSupabaseServerClient } from "@/lib/services/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { headers } from "next/headers";

async function getCredentials(token: string, region: string) {
  const supabase = await getSupabaseServerClient();

  const { data: share, error: shareError } = await supabase
    .from("secure_shares")
    .select("*, user:users(*)")
    .eq("token", token)
    .single();

  if (shareError || !share) {
    return { error: "Invalid or expired link." };
  }

  if (new Date(share.expires_at) < new Date()) {
    return { error: "This link has expired." };
  }

  if (share.region_scope !== region) {
    return { error: `This link is only accessible from the ${share.region_scope} region.` };
  }

  // This is a simplified example. In a real-world scenario, you would not expose the hashed password.
  // This endpoint should reveal a one-time password that the user is forced to change on first login.
  // For the purpose of this implementation, we will just show a message.

  return { email: share.user.email };
}

export default async function SharePage({ params }: { params: { token: string } }) {
  const headersList = headers();
  const country = headersList.get('x-vercel-ip-country') || 'US'; // Default to US for local dev

  const { email, error } = await getCredentials(params.token, country);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Secure Credentials</CardTitle>
          <CardDescription>Your account details are below.</CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <p className="text-destructive">{error}</p>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="font-semibold">Email:</p>
                <p>{email}</p>
              </div>
              <div>
                <p className="font-semibold">Password:</p>
                <p className="text-sm text-muted-foreground">
                  The password was shared with you securely. Please check your communication channel for the password.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
