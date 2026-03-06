import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Lock, CheckCircle, XCircle, ArrowLeft, Eye, EyeOff } from "lucide-react";

export default function ResetPassword() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [token, setToken] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");
    if (!t) {
      setError("Enlace inválido. No se encontró el token de restablecimiento.");
    } else {
      setToken(t);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({ title: "Error", description: "Las contraseñas no coinciden", variant: "destructive" });
      return;
    }

    if (password.length < 4) {
      toast({ title: "Error", description: "La contraseña debe tener al menos 4 caracteres", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Error", description: data.message, variant: "destructive" });
        if (data.message.includes("expirado") || data.message.includes("utilizado") || data.message.includes("válido")) {
          setError(data.message);
        }
      } else {
        setSuccess(true);
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
            <h1 className="text-3xl font-serif font-bold text-primary mb-2">Nueva Contraseña</h1>
            <p className="text-muted-foreground">Crea una nueva contraseña para tu cuenta</p>
          </div>

          <Card>
            {error ? (
              <>
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <XCircle className="w-16 h-16 text-red-500" />
                  </div>
                  <CardTitle className="text-red-600">Enlace Inválido</CardTitle>
                  <CardDescription className="text-base mt-2">
                    {error}
                  </CardDescription>
                </CardHeader>
                <CardFooter className="flex flex-col gap-3">
                  <a href="/recuperar-password" className="w-full">
                    <Button className="w-full bg-primary hover:bg-primary/90 text-white" data-testid="button-request-new">
                      Solicitar Nuevo Enlace
                    </Button>
                  </a>
                  <a href="/login" className="text-sm text-primary hover:underline text-center" data-testid="link-back-login-error">
                    <ArrowLeft className="w-3 h-3 inline mr-1" />
                    Volver al inicio de sesión
                  </a>
                </CardFooter>
              </>
            ) : success ? (
              <>
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <CheckCircle className="w-16 h-16 text-green-600" />
                  </div>
                  <CardTitle className="text-green-700">Contraseña Actualizada</CardTitle>
                  <CardDescription className="text-base mt-2">
                    Tu contraseña ha sido restablecida exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <a href="/login" className="w-full">
                    <Button className="w-full bg-primary hover:bg-primary/90 text-white" data-testid="button-go-login">
                      Ir a Iniciar Sesión
                    </Button>
                  </a>
                </CardFooter>
              </>
            ) : (
              <form onSubmit={handleSubmit}>
                <CardHeader>
                  <div className="flex justify-center mb-2">
                    <Lock className="w-12 h-12 text-primary" />
                  </div>
                  <CardTitle className="text-center">Crear Nueva Contraseña</CardTitle>
                  <CardDescription className="text-center">
                    Ingrese su nueva contraseña. Debe tener al menos 4 caracteres.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Nueva Contraseña</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        required
                        minLength={4}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        data-testid="input-new-password"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowPassword(!showPassword)}
                        data-testid="button-toggle-password"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirm ? "text" : "password"}
                        required
                        minLength={4}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        data-testid="input-confirm-password"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowConfirm(!showConfirm)}
                        data-testid="button-toggle-confirm"
                      >
                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  {password && confirmPassword && password !== confirmPassword && (
                    <p className="text-sm text-red-500" data-testid="text-password-mismatch">Las contraseñas no coinciden</p>
                  )}
                </CardContent>
                <CardFooter className="flex flex-col gap-3">
                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-white"
                    disabled={loading || !password || !confirmPassword || password !== confirmPassword}
                    data-testid="button-reset-password"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
                    Restablecer Contraseña
                  </Button>
                  <a href="/login" className="text-sm text-primary hover:underline text-center" data-testid="link-back-login-form">
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
