import { GoogleSignInButton } from "@/components/auth/google-sign-in-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { redirect } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default async function LoginPage() {
    const supabase = await getSupabaseServerClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle>Recover your password</CardTitle>
                    <CardDescription>Enter your email below to recover your password</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <form>
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="email">Email</FieldLabel>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="email@domain.com"
                                    required
                                />
                                <FieldDescription>We'll send you a link to reset your password</FieldDescription>
                            </Field>
                            <Field>
                                <Button type="submit">Submit</Button>
                            </Field>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}