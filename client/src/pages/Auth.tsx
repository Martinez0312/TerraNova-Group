import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";

export default function Auth() {
  const { user, login, register } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [loginLoading, setLoginLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);

  if (user) {
    setLocation(user.role === "admin" ? "/admin" : "/dashboard");
    return null;
  }

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoginLoading(true);
    const form = new FormData(e.currentTarget);
    try {
      await login(form.get("email") as string, form.get("password") as string);
    } catch (err: any) {
      toast({ title: "Error", description: err.message?.includes("401") ? "Credenciales incorrectas" : err.message, variant: "destructive" });
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setRegisterLoading(true);
    const form = new FormData(e.currentTarget);
    try {
      await register({
        nombre: form.get("firstName") as string,
        apellido: form.get("lastName") as string,
        documento: form.get("doc") as string,
        email: form.get("email") as string,
        password: form.get("password") as string,
        telefono: form.get("telefono") as string || null,
      });
      toast({ title: "Cuenta creada", description: "Bienvenido a TerraNova Group" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message?.includes("400") ? "El correo ya está registrado" : err.message, variant: "destructive" });
    } finally {
      setRegisterLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-200px)] py-12 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-serif font-bold text-primary mb-2">Bienvenido</h1>
            <p className="text-muted-foreground">Accede a tu cuenta para gestionar tus lotes y pagos</p>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login" data-testid="tab-login">Iniciar Sesión</TabsTrigger>
              <TabsTrigger value="register" data-testid="tab-register">Registrarse</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <Card>
                <form onSubmit={handleLogin}>
                  <CardHeader>
                    <CardTitle>Ingreso de Clientes</CardTitle>
                    <CardDescription>
                      Ingresa tus credenciales para acceder a tu panel.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Correo Electrónico</Label>
                      <Input id="email" name="email" type="email" placeholder="correo@ejemplo.com" required data-testid="input-login-email" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Contraseña</Label>
                      <Input id="password" name="password" type="password" required data-testid="input-login-password" />
                    </div>
                    <div className="bg-muted/50 p-3 rounded-lg text-xs text-muted-foreground">
                      <p className="font-medium mb-1">Cuentas de prueba:</p>
                      <p>Admin: admin@terranovagroup.com / admin123</p>
                      <p>Cliente: carlos@ejemplo.com / cliente123</p>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col gap-3">
                    <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white" disabled={loginLoading} data-testid="button-login">
                      {loginLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Ingresar
                    </Button>
                    <a href="/recuperar-password" className="text-sm text-primary hover:underline text-center" data-testid="link-forgot-password">
                      ¿Olvidó su contraseña?
                    </a>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
            
            <TabsContent value="register">
              <Card>
                <form onSubmit={handleRegister}>
                  <CardHeader>
                    <CardTitle>Crear Cuenta</CardTitle>
                    <CardDescription>
                      Regístrate para comprar lotes y hacer seguimiento.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">Nombre</Label>
                        <Input id="firstName" name="firstName" required data-testid="input-register-nombre" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Apellido</Label>
                        <Input id="lastName" name="lastName" required data-testid="input-register-apellido" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="doc">Documento de Identidad</Label>
                      <Input id="doc" name="doc" required data-testid="input-register-doc" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email-reg">Correo Electrónico</Label>
                      <Input id="email-reg" name="email" type="email" required data-testid="input-register-email" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="telefono">Teléfono (Opcional)</Label>
                      <Input id="telefono" name="telefono" data-testid="input-register-telefono" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password-reg">Contraseña</Label>
                      <Input id="password-reg" name="password" type="password" required minLength={4} data-testid="input-register-password" />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-white" disabled={registerLoading} data-testid="button-register">
                      {registerLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Registrarme
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}
