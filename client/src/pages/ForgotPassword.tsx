import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, ArrowLeft, CheckCircle } from "lucide-react";

export default function ForgotPassword() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Error", description: data.message, variant: "destructive" });
      } else {
        setSent(true);
      }
    } catch {
      toast({ title: "Error", description: "No se pudo conectar con el servidor", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-200px)] py-12 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-serif font-bold text-primary mb-2">Recuperar Contraseña</h1>
            <p className="text-muted-foreground">Te enviaremos un enlace para restablecer tu contraseña</p>
          </div>

          <Card>
            {sent ? (
              <>
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <CheckCircle className="w-16 h-16 text-green-600" />
                  </div>
                  <CardTitle className="text-green-700">Correo Enviado</CardTitle>
                  <CardDescription className="text-base mt-2">
                    Si el correo <strong>{email}</strong> está registrado en nuestro sistema, recibirás un enlace para restablecer tu contraseña.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
                    <p className="font-medium mb-1">Revisa tu bandeja de entrada</p>
                    <p>El enlace expira en 1 hora. Si no lo encuentras, revisa tu carpeta de spam.</p>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-3">
                  <a href="/login" className="w-full">
                    <Button variant="outline" className="w-full" data-testid="button-back-login">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Volver al inicio de sesión
                    </Button>
                  </a>
                </CardFooter>
              </>
            ) : (
              <form onSubmit={handleSubmit}>
                <CardHeader>
                  <div className="flex justify-center mb-2">
                    <Mail className="w-12 h-12 text-primary" />
                  </div>
                  <CardTitle className="text-center">¿Olvidó su contraseña?</CardTitle>
                  <CardDescription className="text-center">
                    Ingrese su correo electrónico y le enviaremos un enlace para restablecer su contraseña.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Correo Electrónico</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="correo@ejemplo.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      data-testid="input-forgot-email"
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-3">
                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white" disabled={loading} data-testid="button-send-reset">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Mail className="w-4 h-4 mr-2" />}
                    Enviar Enlace
                  </Button>
                  <a href="/login" className="text-sm text-primary hover:underline text-center" data-testid="link-back-login">
                    <ArrowLeft className="w-3 h-3 inline mr-1" />
                    Volver al inicio de sesión
                  </a>
                </CardFooter>
              </form>
            )}
          </Card>
        </div>
      </div>
    </Layout>
  );
}
