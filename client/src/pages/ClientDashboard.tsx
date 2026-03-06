import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { MapPin, DollarSign, Calendar, FileText, CheckCircle2, CreditCard, LogOut, User, Loader2, Clock, XCircle, AlertCircle, Maximize, ShoppingBag, MessageSquare, TrendingUp } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import type { Venta, Pago, Pqrs, Lote, Cuota } from "@shared/schema";

import lotImg1 from "@/assets/images/lotes/lot_image_1.jpg";
import lotImg2 from "@/assets/images/lotes/lot_image_2.jpg";
import lotImg3 from "@/assets/images/lotes/lot_image_3.jpg";
import lotImg4 from "@/assets/images/lotes/lot_image_4.jpg";
import lotImg5 from "@/assets/images/lotes/lot_image_5.jpg";
import lotImg6 from "@/assets/images/lotes/lot_image_6.jpg";
import lotImg7 from "@/assets/images/lotes/lot_image_7.jpg";
import lotImg8 from "@/assets/images/lotes/lot_image_8.jpg";

const lotImages = [lotImg1, lotImg2, lotImg3, lotImg4, lotImg5, lotImg6, lotImg7, lotImg8];

export default function ClientDashboard() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [pagoDialog, setPagoDialog] = useState<{ ventaId: number; valorCuota: string } | null>(null);
  const [pqrsDialog, setPqrsDialog] = useState(false);
  const [cronogramaVentaId, setCronogramaVentaId] = useState<number | null>(null);

  if (!user) {
    setLocation("/login");
    return null;
  }

  const { data: ventas = [] } = useQuery<Venta[]>({ queryKey: ["/api/ventas"] });
  const { data: pagos = [] } = useQuery<Pago[]>({ queryKey: ["/api/pagos"] });
  const { data: pqrsList = [] } = useQuery<Pqrs[]>({ queryKey: ["/api/pqrs"] });
  const { data: lotes = [] } = useQuery<Lote[]>({ queryKey: ["/api/lotes"] });

  const pagarMutation = useMutation({
    mutationFn: async (data: { ventaId: number; monto: string; concepto: string }) => {
      const res = await apiRequest("POST", "/api/pagos", data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Pago registrado", description: "Tu pago ha sido enviado y está en proceso de revisión por el administrador." });
      queryClient.invalidateQueries({ queryKey: ["/api/pagos"] });
      queryClient.invalidateQueries({ queryKey: ["/api/ventas"] });
      setPagoDialog(null);
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const pqrsMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/pqrs", data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Solicitud enviada", description: "Tu PQRS ha sido radicada exitosamente." });
      queryClient.invalidateQueries({ queryKey: ["/api/pqrs"] });
      setPqrsDialog(false);
    },
  });

  const formatPrice = (price: string | number) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(Number(price));
  };

  const getLoteForVenta = (loteId: number) => lotes.find(l => l.id === loteId);
  const getLoteImage = (loteId: number) => {
  const index = loteId - 1;
  return lotImages[index] || lotImages[0];
};

  const getTotalPagado = (ventaId: number) => {
    return pagos.filter(p => p.ventaId === ventaId && p.estado === "Aprobado").reduce((sum, p) => sum + Number(p.monto), 0);
  };

  const getCuotasPagadas = (ventaId: number) => {
    return pagos.filter(p => p.ventaId === ventaId && p.estado === "Aprobado").length;
  };

  const getPaymentStatusConfig = (estado: string) => {
    switch (estado) {
      case "Aprobado": return { icon: CheckCircle2, color: "text-green-600", bg: "bg-green-100", border: "border-green-200", label: "Aprobado" };
      case "Rechazado": return { icon: XCircle, color: "text-red-600", bg: "bg-red-100", border: "border-red-200", label: "Rechazado" };
      default: return { icon: Clock, color: "text-yellow-600", bg: "bg-yellow-100", border: "border-yellow-200", label: "En proceso" };
    }
  };

  const totalInvertido = ventas.reduce((sum, v) => sum + Number(v.valorTotal), 0);
  const totalPagadoGeneral = ventas.reduce((sum, v) => sum + getTotalPagado(v.id), 0);

  return (
    <Layout>
      <div className="bg-gray-50 min-h-[calc(100vh-200px)]">
        <div className="bg-gradient-to-br from-primary via-primary to-primary/90 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djZoLTJ2LTZoMnptMC0zMHY2aC0yVjRoMnptLTMwIDMwdjZINHYtNmgyem0wLTMwdjZINFY0aDJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50"></div>
          <div className="container mx-auto px-4 py-10 relative z-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-white/15 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/10 shadow-lg">
                  <User size={28} className="text-white" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-serif font-bold tracking-tight">{user.nombre} {user.apellido}</h1>
                  <p className="text-white/60 text-sm mt-0.5">Doc: {user.documento} &bull; {user.email}</p>
                </div>
              </div>
              <div className="flex gap-2">
                {user.role === "admin" && (
                  <Button variant="outline" className="border-white/20 hover:bg-white/10 text-white backdrop-blur-sm"
                    onClick={() => setLocation("/admin")}>
                    Panel Admin
                  </Button>
                )}
                <Button variant="outline" className="border-white/20 hover:bg-white/10 text-white backdrop-blur-sm"
                  onClick={logout} data-testid="button-logout">
                  <LogOut className="w-4 h-4 mr-2" /> Cerrar Sesión
                </Button>
              </div>
            </div>

            {ventas.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/15 rounded-lg flex items-center justify-center">
                      <ShoppingBag className="w-5 h-5 text-white/80" />
                    </div>
                    <div>
                      <p className="text-white/50 text-xs uppercase tracking-wider font-medium">Lotes Adquiridos</p>
                      <p className="text-2xl font-bold">{ventas.length}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/15 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-white/80" />
                    </div>
                    <div>
                      <p className="text-white/50 text-xs uppercase tracking-wider font-medium">Total Invertido</p>
                      <p className="text-2xl font-bold">{formatPrice(totalInvertido)}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/15 rounded-lg flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-white/80" />
                    </div>
                    <div>
                      <p className="text-white/50 text-xs uppercase tracking-wider font-medium">Total Pagado</p>
                      <p className="text-2xl font-bold">{formatPrice(totalPagadoGeneral)}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <Tabs defaultValue="lotes" className="w-full">
            <TabsList className="grid grid-cols-2 md:grid-cols-3 w-full h-auto gap-2 bg-transparent p-0 mb-8">
              <TabsTrigger value="lotes" className="data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-primary h-12 rounded-xl border border-gray-200/80 bg-white/50 font-medium transition-all" data-testid="tab-mis-lotes">
                <MapPin className="w-4 h-4 mr-2" /> Mis Lotes ({ventas.length})
              </TabsTrigger>
              <TabsTrigger value="pagos" className="data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-primary h-12 rounded-xl border border-gray-200/80 bg-white/50 font-medium transition-all" data-testid="tab-pagos">
                <DollarSign className="w-4 h-4 mr-2" /> Pagos y Estado
              </TabsTrigger>
              <TabsTrigger value="pqrs" className="data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-primary h-12 rounded-xl border border-gray-200/80 bg-white/50 font-medium transition-all" data-testid="tab-pqrs">
                <MessageSquare className="w-4 h-4 mr-2" /> Mis PQRS ({pqrsList.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="lotes" className="space-y-6">
              {ventas.length === 0 ? (
                <Card className="border-none shadow-sm">
                  <CardContent className="py-16 text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-5">
                      <MapPin className="w-10 h-10 text-gray-300" />
                    </div>
                    <h3 className="text-xl font-serif font-bold mb-2 text-gray-800">Aún no tienes lotes adquiridos</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">Explora nuestro catálogo y encuentra el lote perfecto para construir el hogar de tus sueños.</p>
                    <Button className="bg-accent hover:bg-accent/90 shadow-md" onClick={() => setLocation("/catalogo")} data-testid="button-ver-catalogo">Ver Catálogo</Button>
                  </CardContent>
                </Card>
              ) : (
                ventas.map((venta) => {
                  const lote = getLoteForVenta(venta.loteId);
                  const totalPagado = getTotalPagado(venta.id);
                  const progreso = Math.round((totalPagado / Number(venta.valorTotal)) * 100);
                  const saldo = Number(venta.valorTotal) - totalPagado;
                  return (
                    <Card key={venta.id} className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow" data-testid={`card-venta-${venta.id}`}>
                      <div className="flex flex-col md:flex-row">
                        <div className="bg-gradient-to-br from-primary/5 to-primary/10 p-8 md:w-1/3 flex flex-col justify-center items-center border-b md:border-b-0 md:border-r border-gray-100 relative">
                          <div className="absolute top-4 right-4">
                            <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100 font-medium">
                              <CheckCircle2 className="w-3 h-3 mr-1" /> Adquirido
                            </Badge>
                          </div>
                          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4 border border-gray-100">
                            <MapPin className="w-9 h-9 text-primary" />
                          </div>
                          <h2 className="text-3xl font-serif font-bold text-primary mb-1">Lote {lote?.codigo || "N/A"}</h2>
                          <p className="text-sm text-muted-foreground">{lote?.ubicacion} &bull; {lote?.area} m²</p>
                        </div>
                        <div className="p-6 md:p-8 md:w-2/3">
                          <div className="grid grid-cols-2 gap-5 mb-6">
                            <div className="bg-gray-50 rounded-xl p-4">
                              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-1">Valor Total</p>
                              <p className="font-bold text-lg text-gray-900">{formatPrice(venta.valorTotal)}</p>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-4">
                              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-1">Saldo Pendiente</p>
                              <p className="font-bold text-lg text-gray-900">{saldo > 0 ? formatPrice(saldo) : <span className="text-green-600">Pagado</span>}</p>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-2">
                              <span className="text-muted-foreground font-medium">Progreso de pago</span>
                              <span className="font-bold text-primary">{progreso}%</span>
                            </div>
                            <div className="relative">
                              <Progress value={progreso} className="h-3 rounded-full" />
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground mt-2">
                              <span>{formatPrice(totalPagado)} pagado</span>
                              <span>{getCuotasPagadas(venta.id)} / {venta.cuotas} cuotas</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })
              )}
            </TabsContent>

            <TabsContent value="pagos" className="space-y-6">
              {ventas.length === 0 ? (
                <Card className="border-none shadow-sm">
                  <CardContent className="py-16 text-center">
                    <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-muted-foreground">No tienes ventas activas.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {ventas.map((venta) => {
                      const lote = getLoteForVenta(venta.loteId);
                      const totalPagado = getTotalPagado(venta.id);
                      const saldoPendiente = Number(venta.valorTotal) - totalPagado;
                      const progreso = Math.round((totalPagado / Number(venta.valorTotal)) * 100);
                      const cuotasPagadas = getCuotasPagadas(venta.id);

                      return (
                        <Card key={venta.id} className="border-none shadow-sm">
                          <CardHeader className="pb-2">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                                <MapPin className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <CardTitle className="text-base">Lote {lote?.codigo}</CardTitle>
                                <CardDescription className="text-xs">{lote?.ubicacion}</CardDescription>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-5">
                            <div>
                              <div className="flex justify-between text-xs mb-1.5">
                                <span className="text-muted-foreground font-medium">Progreso</span>
                                <span className="font-bold text-primary">{progreso}%</span>
                              </div>
                              <Progress value={progreso} className="h-2.5 rounded-full" />
                            </div>
                            <div className="space-y-2.5 pt-3 border-t border-gray-100">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Valor Total</span>
                                <span className="font-semibold text-sm">{formatPrice(venta.valorTotal)}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Pagado</span>
                                <span className="font-semibold text-sm text-green-600">{formatPrice(totalPagado)}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Saldo</span>
                                <span className="font-semibold text-sm text-red-600">{formatPrice(saldoPendiente)}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Cuotas</span>
                                <span className="font-semibold text-sm">{cuotasPagadas} / {venta.cuotas}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Valor Cuota</span>
                                <span className="font-semibold text-sm text-accent">{formatPrice(venta.valorCuota)}</span>
                              </div>
                            </div>
                            {saldoPendiente > 0 && (
                              <div className="space-y-2">
                                <Button className="w-full bg-accent hover:bg-accent/90 shadow-sm"
                                  onClick={() => setPagoDialog({ ventaId: venta.id, valorCuota: venta.valorCuota })}
                                  data-testid={`button-pagar-${venta.id}`}>
                                  <CreditCard className="w-4 h-4 mr-2" /> Pagar Cuota
                                </Button>
                                {venta.cuotas > 1 && (
                                  <Button variant="outline" className="w-full" size="sm"
                                    onClick={() => setCronogramaVentaId(cronogramaVentaId === venta.id ? null : venta.id)}
                                    data-testid={`button-cronograma-${venta.id}`}>
                                    <Calendar className="w-4 h-4 mr-2" />
                                    {cronogramaVentaId === venta.id ? "Ocultar cronograma" : "Ver cronograma de pagos"}
                                  </Button>
                                )}
                              </div>
                            )}
                            {saldoPendiente <= 0 && venta.cuotas > 1 && (
                              <Button variant="outline" className="w-full" size="sm"
                                onClick={() => setCronogramaVentaId(cronogramaVentaId === venta.id ? null : venta.id)}
                                data-testid={`button-cronograma-${venta.id}`}>
                                <Calendar className="w-4 h-4 mr-2" />
                                {cronogramaVentaId === venta.id ? "Ocultar cronograma" : "Ver cronograma de pagos"}
                              </Button>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>

                  {cronogramaVentaId && <CronogramaCuotas ventaId={cronogramaVentaId} formatPrice={formatPrice} />}

                  <Card className="border-none shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Historial de Pagos</CardTitle>
                      <CardDescription>Registro de cuotas y abonos realizados</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {pagos.length === 0 ? (
                        <div className="text-center py-12">
                          <DollarSign className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                          <p className="text-muted-foreground">No hay pagos registrados aún.</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {pagos.map((pago) => {
                            const statusConfig = getPaymentStatusConfig(pago.estado);
                            const StatusIcon = statusConfig.icon;
                            return (
                            <div key={pago.id} className="p-4 rounded-xl border border-gray-100 bg-white hover:border-gray-200 transition-all" data-testid={`row-pago-${pago.id}`}>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <div className={`w-10 h-10 rounded-xl ${statusConfig.bg} flex items-center justify-center ${statusConfig.color}`}>
                                    <StatusIcon className="w-5 h-5" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900">{pago.concepto}</p>
                                    <div className="flex text-xs text-muted-foreground gap-2 mt-0.5">
                                      <span className="font-mono">P-{pago.id}</span>
                                      <span>&bull;</span>
                                      <span>{pago.fecha ? new Date(pago.fecha).toLocaleDateString('es-CO') : ""}</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-gray-900">{formatPrice(pago.monto)}</p>
                                  <Badge variant="outline" className={`${statusConfig.color} ${statusConfig.border} ${statusConfig.bg} mt-1 text-[10px] font-semibold`}>{statusConfig.label}</Badge>
                                </div>
                              </div>
                              {pago.estado === "Rechazado" && (pago as any).motivoRechazo && (
                                <div className="mt-3 bg-red-50 border border-red-100 rounded-lg p-3 flex items-start gap-2">
                                  <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                                  <div>
                                    <p className="text-xs font-semibold text-red-700">Motivo del rechazo:</p>
                                    <p className="text-xs text-red-600 mt-0.5">{(pago as any).motivoRechazo}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            <TabsContent value="pqrs">
              <Card className="border-none shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Mis Solicitudes (PQRS)</CardTitle>
                    <CardDescription>Peticiones, Quejas, Reclamos y Sugerencias</CardDescription>
                  </div>
                  <Button className="bg-accent hover:bg-accent/90 shadow-sm" onClick={() => setPqrsDialog(true)} data-testid="button-nueva-pqrs">
                    Nueva Solicitud
                  </Button>
                </CardHeader>
                <CardContent>
                  {pqrsList.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                      <p className="text-muted-foreground">No tienes solicitudes registradas.</p>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-gray-100 overflow-hidden">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50/80">
                            <th className="px-5 py-3.5 text-left font-semibold text-xs uppercase tracking-wider text-gray-500">ID</th>
                            <th className="px-5 py-3.5 text-left font-semibold text-xs uppercase tracking-wider text-gray-500">Tipo</th>
                            <th className="px-5 py-3.5 text-left font-semibold text-xs uppercase tracking-wider text-gray-500">Asunto</th>
                            <th className="px-5 py-3.5 text-left font-semibold text-xs uppercase tracking-wider text-gray-500">Fecha</th>
                            <th className="px-5 py-3.5 text-left font-semibold text-xs uppercase tracking-wider text-gray-500">Estado</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {pqrsList.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                              <td className="px-5 py-4 font-mono text-xs font-bold text-gray-700">PQ-{item.id}</td>
                              <td className="px-5 py-4">
                                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                                  item.tipo === "Petición" ? "bg-blue-50 text-blue-600" :
                                  item.tipo === "Queja" ? "bg-orange-50 text-orange-600" :
                                  item.tipo === "Reclamo" ? "bg-red-50 text-red-600" :
                                  "bg-purple-50 text-purple-600"
                                }`}>{item.tipo}</span>
                              </td>
                              <td className="px-5 py-4 text-gray-700">{item.asunto}</td>
                              <td className="px-5 py-4 text-gray-500 text-xs">{item.createdAt ? new Date(item.createdAt).toLocaleDateString('es-CO') : ""}</td>
                              <td className="px-5 py-4">
                                <Badge className={`font-medium ${
                                  item.estado === 'Resuelto' ? 'bg-green-100 text-green-700 border-green-200' :
                                  item.estado === 'En proceso' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                                  'bg-orange-100 text-orange-700 border-orange-200'
                                }`}>
                                  {item.estado}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Dialog open={!!pagoDialog} onOpenChange={() => setPagoDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Pago de Cuota</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            const form = new FormData(e.currentTarget);
            pagarMutation.mutate({
              ventaId: pagoDialog!.ventaId,
              monto: form.get("monto") as string,
              concepto: form.get("concepto") as string,
            });
          }}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Monto</Label>
                <Input name="monto" type="number" min={pagoDialog?.valorCuota} defaultValue={pagoDialog?.valorCuota} required data-testid="input-monto-pago" />
                <p className="text-xs text-muted-foreground">Monto mínimo: {pagoDialog ? new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(Number(pagoDialog.valorCuota)) : ""}</p>
              </div>
              <div className="space-y-2">
                <Label>Concepto</Label>
                <Input name="concepto" defaultValue="Pago de cuota mensual" required data-testid="input-concepto-pago" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setPagoDialog(null)}>Cancelar</Button>
              <Button type="submit" disabled={pagarMutation.isPending} data-testid="button-confirmar-pago">
                {pagarMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Registrar Pago
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={pqrsDialog} onOpenChange={setPqrsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva Solicitud PQRS</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            const form = new FormData(e.currentTarget);
            pqrsMutation.mutate({
              tipo: form.get("tipo"),
              asunto: form.get("asunto"),
              mensaje: form.get("mensaje"),
              nombre: `${user.nombre} ${user.apellido}`,
              email: user.email,
              userId: user.id,
              loteRef: form.get("loteRef") || null,
            });
          }}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Tipo de Solicitud</Label>
                <Select name="tipo" required>
                  <SelectTrigger><SelectValue placeholder="Selecciona" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Petición">Petición</SelectItem>
                    <SelectItem value="Queja">Queja</SelectItem>
                    <SelectItem value="Reclamo">Reclamo</SelectItem>
                    <SelectItem value="Sugerencia">Sugerencia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Asunto</Label>
                <Input name="asunto" required data-testid="input-pqrs-asunto" />
              </div>
              <div className="space-y-2">
                <Label>Mensaje</Label>
                <Textarea name="mensaje" required className="min-h-[100px]" data-testid="input-pqrs-mensaje" />
              </div>
              <div className="space-y-2">
                <Label>Lote Referencia (Opcional)</Label>
                <Input name="loteRef" data-testid="input-pqrs-lote" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setPqrsDialog(false)}>Cancelar</Button>
              <Button type="submit" disabled={pqrsMutation.isPending} data-testid="button-enviar-pqrs">
                {pqrsMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Enviar Solicitud
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}

function CronogramaCuotas({ ventaId, formatPrice }: { ventaId: number; formatPrice: (v: any) => string }) {
  const { data: cuotasList = [], isLoading } = useQuery<Cuota[]>({
    queryKey: ["/api/cuotas", ventaId],
    queryFn: () => apiRequest("GET", `/api/cuotas/${ventaId}`).then(r => r.json()),
  });

  if (isLoading) {
    return (
      <Card className="border-none shadow-sm">
        <CardContent className="py-12 text-center">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (cuotasList.length === 0) {
    return (
      <Card className="border-none shadow-sm">
        <CardContent className="py-8 text-center">
          <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-muted-foreground text-sm">No hay cronograma de cuotas para esta venta.</p>
        </CardContent>
      </Card>
    );
  }

  const now = new Date();

  return (
    <Card className="border-none shadow-sm" data-testid={`cronograma-venta-${ventaId}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-lg">Cronograma de Pagos</CardTitle>
            <CardDescription>Detalle de cuotas, vencimientos e intereses</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-2 font-semibold text-muted-foreground">#</th>
                <th className="text-left py-3 px-2 font-semibold text-muted-foreground">Vencimiento</th>
                <th className="text-right py-3 px-2 font-semibold text-muted-foreground">Base</th>
                <th className="text-right py-3 px-2 font-semibold text-muted-foreground">Interés</th>
                <th className="text-right py-3 px-2 font-semibold text-muted-foreground">Total</th>
                <th className="text-center py-3 px-2 font-semibold text-muted-foreground">Estado</th>
              </tr>
            </thead>
            <tbody>
              {cuotasList.map((cuota) => {
                const fechaVenc = new Date(cuota.fechaVencimiento);
                const isOverdue = cuota.estado !== "Pagada" && fechaVenc < now;
                const interes = parseFloat(cuota.interes);

                return (
                  <tr key={cuota.id}
                    className={`border-b border-gray-50 ${isOverdue ? "bg-red-50/50" : cuota.estado === "Pagada" ? "bg-green-50/30" : ""}`}
                    data-testid={`cuota-row-${cuota.id}`}>
                    <td className="py-3 px-2 font-medium">{cuota.numeroCuota}</td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-1.5">
                        {isOverdue && <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />}
                        <span className={isOverdue ? "text-red-600 font-medium" : ""}>
                          {fechaVenc.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      {isOverdue && (
                        <span className="text-[10px] text-red-500 font-medium">
                          {Math.floor((now.getTime() - fechaVenc.getTime()) / (1000 * 60 * 60 * 24))} días de mora
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-2 text-right font-mono">{formatPrice(cuota.valorBase)}</td>
                    <td className="py-3 px-2 text-right font-mono">
                      {interes > 0 ? (
                        <span className="text-red-600 font-semibold">{formatPrice(interes)}</span>
                      ) : (
                        <span className="text-muted-foreground">$0</span>
                      )}
                    </td>
                    <td className="py-3 px-2 text-right font-mono font-semibold">{formatPrice(cuota.valorTotal)}</td>
                    <td className="py-3 px-2 text-center">
                      {cuota.estado === "Pagada" ? (
                        <Badge className="bg-green-100 text-green-700 border-green-200 text-[10px]">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Pagada
                        </Badge>
                      ) : isOverdue ? (
                        <Badge className="bg-red-100 text-red-700 border-red-200 text-[10px]">
                          <AlertCircle className="w-3 h-3 mr-1" /> Vencida
                        </Badge>
                      ) : (
                        <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 text-[10px]">
                          <Clock className="w-3 h-3 mr-1" /> Pendiente
                        </Badge>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-700">
            Las cuotas vencidas generan un interés del 1.5% mensual sobre el valor base de la cuota.
            Realice sus pagos a tiempo para evitar recargos.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
