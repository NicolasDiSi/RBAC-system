import { redirect } from 'next/navigation';
import { SignupForm } from '@/components/auth/signup-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SignupPage({ searchParams }: { searchParams: { code?: string } }) {
  const { code } = searchParams;

  if (!code) {
    redirect('/auth/enter-code');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle>Create Your Account</CardTitle>
          <CardDescription>Fill in your details to complete the registration.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SignupForm code={code} />
        </CardContent>
      </Card>
    </div>
  );
}
