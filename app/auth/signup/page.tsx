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

    if (user) {
        redirect("/dashboard")
    }

    return (
        <div className="flex flex-col space-y-2 min-h-screen items-center justify-center bg-muted/30 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle>Create an account</CardTitle>
                    <CardDescription>Enter your credentials below</CardDescription>
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
                            </Field>
                            <Field>
                                <div className="flex items-center">
                                    <FieldLabel htmlFor="password">Password</FieldLabel>
                                </div>
                                <Input id="password" type="password" required />
                            </Field>
                            <Field>
                                <Button type="submit">Login</Button>
                                <div className="relative mt-10">
                                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                        <div className="w-full border-t border-gray-200"></div>
                                    </div>
                                    <div className="relative flex justify-center text-sm leading-6 font-medium">
                                        <span className="bg-white px-6 text-gray-900">Or continue with</span>
                                    </div>
                                </div>
                                <GoogleSignInButton>Your Google Account</GoogleSignInButton>
                            </Field>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}