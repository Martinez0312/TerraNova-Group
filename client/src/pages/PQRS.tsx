import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { MessageSquare, Mail, Phone, Loader2, CheckCircle2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useState } from "react";

export default function PQRS() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [sent, setSent] = useState(false);

  const pqrsMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/pqrs", data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Solicitud enviada", description: "Tu PQRS ha sido radicada con éxito. Te contactaremos pronto." });
      setSent(true);
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    pqrsMutation.mutate({
      tipo: form.get("tipo"),
      asunto: form.get("asunto"),
      mensaje: form.get("mensaje"),
      nombre: form.get("nombre"),
      email: form.get("email"),
      loteRef: form.get("loteRef") || null,
      userId: user?.id || null,
    });
  };

  return (
    <Layout>
      <div className="bg-secondary/30 py-16 min-h-[calc(100vh-200px)]">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-serif font-bold text-primary mb-4">Atención al Cliente</h1>
            <p className="text-lg text-muted-foreground">
              Sistema de Peticiones, Quejas, Reclamos y Sugerencias. Estamos aquí para escucharte.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Canales Directos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-accent" />
                    <div>
                      <p className="font-medium">Línea Nacional</p>
                      <p className="text-sm text-muted-foreground">01 8000 123 456</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-accent" />
                    <div>
                      <p className="font-medium">Correo Electrónico</p>
                      <p className="text-sm text-muted-foreground">servicioalcliente@terranovagroup.com</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-5 h-5 text-accent" />
                    <div>
                      <p className="font-medium">Horario de Atención</p>
                      <p className="text-sm text-muted-foreground">Lunes a Viernes: 8am - 6pm</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-primary text-primary-foreground border-none">
                <CardContent className="p-6">
                  <h3 className="font-serif font-bold text-xl mb-2">¿Ya tienes una cuenta?</h3>
                  <p className="text-sm text-primary-foreground/80 mb-4">
                    Inicia sesión para hacer seguimiento en tiempo real al estado de tus solicitudes.
                  </p>
                  <Button variant="secondary" className="w-full" onClick={() => setLocation(user ? "/dashboard" : "/login")}
                    data-testid="button-ir-dashboard">
                    {user ? "Ir a Mi Dashboard" : "Iniciar Sesión"}
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="md:col-span-2">
              {sent ? (
                <Card>
                  <CardContent className="py-16 text-center">
                    <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-2xl font-serif font-bold text-primary mb-2">¡Solicitud Enviada!</h3>
                    <p className="text-muted-foreground mb-6">Tu solicitud ha sido radicada exitosamente. Te responderemos en un plazo máximo de 15 días hábiles.</p>
                    <Button onClick={() => setSent(false)} data-testid="button-nueva-solicitud">Enviar otra solicitud</Button>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Radicar nueva solicitud</CardTitle>
                    <CardDescription>
                      Completa el formulario y te responderemos en un plazo máximo de 15 días hábiles.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="tipo">Tipo de Solicitud</Label>
                          <Select name="tipo" required>
                            <SelectTrigger data-testid="select-pqrs-tipo">
                              <SelectValue placeholder="Selecciona el tipo" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Petición">Petición (P)</SelectItem>
                              <SelectItem value="Queja">Queja (Q)</SelectItem>
                              <SelectItem value="Reclamo">Reclamo (R)</SelectItem>
                              <SelectItem value="Sugerencia">Sugerencia (S)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="id_lote">ID de Lote (Opcional)</Label>
                          <Input id="id_lote" name="loteRef" placeholder="Ej. L01" data-testid="input-pqrs-lote-ref" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="nombre">Nombre Completo</Label>
                          <Input id="nombre" name="nombre" required defaultValue={user ? `${user.nombre} ${user.apellido}` : ""} data-testid="input-pqrs-nombre" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Correo Electrónico</Label>
                          <Input id="email" name="email" type="email" required defaultValue={user?.email || ""} data-testid="input-pqrs-email" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="asunto">Asunto</Label>
                        <Input id="asunto" name="asunto" required placeholder="Breve descripción del tema" data-testid="input-pqrs-asunto" />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="mensaje">Mensaje Detallado</Label>
                        <Textarea 
                          id="mensaje" 
                          name="mensaje"
                          required 
                          placeholder="Escribe aquí los detalles de tu solicitud..." 
                          className="min-h-[150px]"
                          data-testid="input-pqrs-mensaje"
                        />
                      </div>

                      <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-white" disabled={pqrsMutation.isPending}
                        data-testid="button-enviar-pqrs">
                        {pqrsMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Enviar Solicitud
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
