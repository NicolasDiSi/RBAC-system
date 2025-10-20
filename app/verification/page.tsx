import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import Link from "next/link";

export default function VerificationPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="space-y-2">
          <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
            <Clock className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold pt-2">Registro Completo</CardTitle>
          <CardDescription>Tu cuenta ha sido creada y está pendiente de aprobación.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Recibirás una notificación una vez que un administrador haya activado tu cuenta.
            Hasta entonces, no podrás acceder al sistema.
          </p>
          <Link href="/login">
            <Button variant="outline" className="w-full bg-transparent">
              Volver al inicio
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}