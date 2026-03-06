import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Users, MapPin, DollarSign, MessageSquare, Plus, LogOut, BarChart, Loader2, Pencil, Trash2, CheckCircle2, XCircle, Clock, TrendingUp, ShieldCheck, Eye } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useState } from "react";
import type { Lote, Venta, Pago, Pqrs } from "@shared/schema";

type Stats = { lotesDisponibles: number; lotesVendidos: number; ingresosMes: number; pqrsPendientes: number };
type SafeUser = { id: number; email: string; nombre: string; apellido: string; documento: string; telefono: string | null; role: string; createdAt: string | null };

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [loteDialog, setLoteDialog] = useState<Partial<Lote> | null>(null);
  const [editingLote, setEditingLote] = useState<Lote | null>(null);
  const [pqrsUpdate, setPqrsUpdate] = useState<{ id: number; estado: string; respuesta: string } | null>(null);
  const [pagoAction, setPagoAction] = useState<{ id: number; action: "Aprobado" | "Rechazado"; motivoRechazo: string } | null>(null);

  if (!user || user.role !== "admin") {
    setLocation("/login");
    return null;
  }

  const { data: stats } = useQuery<Stats>({ queryKey: ["/api/admin/stats"] });
  const { data: lotes = [] } = useQuery<Lote[]>({ queryKey: ["/api/lotes"] });
  const { data: ventas = [] } = useQuery<Venta[]>({ queryKey: ["/api/ventas"] });
  const { data: pagos = [] } = useQuery<Pago[]>({ queryKey: ["/api/pagos"] });
  const { data: pqrsList = [] } = useQuery<Pqrs[]>({ queryKey: ["/api/pqrs"] });
  const { data: usersList = [] } = useQuery<SafeUser[]>({ queryKey: ["/api/admin/users"] });

  const createLoteMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/lotes", data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Lote creado" });
      queryClient.invalidateQueries({ queryKey: ["/api/lotes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      setLoteDialog(null);
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const updateLoteMutation = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const res = await apiRequest("PATCH", `/api/lotes/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Lote actualizado" });
      queryClient.invalidateQueries({ queryKey: ["/api/lotes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      setEditingLote(null);
    },
  });

  const deleteLoteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/lotes/${id}`);
    },
    onSuccess: () => {
      toast({ title: "Lote eliminado" });
      queryClient.invalidateQueries({ queryKey: ["/api/lotes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
    },
  });

  const updatePagoEstadoMutation = useMutation({
    mutationFn: async ({ id, estado, motivoRechazo }: { id: number; estado: string; motivoRechazo?: string }) => {
      const res = await apiRequest("PATCH", `/api/pagos/${id}/estado`, { estado, motivoRechazo });
      return res.json();
    },
    onSuccess: (_data, variables) => {
      toast({ title: variables.estado === "Aprobado" ? "Pago aprobado" : "Pago rechazado", description: variables.estado === "Aprobado" ? "El comprobante fue enviado al cliente." : "La notificación de rechazo fue enviada al cliente." });
      queryClient.invalidateQueries({ queryKey: ["/api/pagos"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/ventas"] });
      setPagoAction(null);
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const updatePqrsMutation = useMutation({
    mutationFn: async ({ id, estado, respuesta }: { id: number; estado: string; respuesta?: string }) => {
      const res = await apiRequest("PATCH", `/api/pqrs/${id}`, { estado, respuesta });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "PQRS actualizado" });
      queryClient.invalidateQueries({ queryKey: ["/api/pqrs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      setPqrsUpdate(null);
    },
  });

  const formatPrice = (price: string | number) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(Number(price));

  const getStatusColor = (status: string) => {
    switch(status) {
      case "Disponible": return "bg-green-50 text-green-600 border-green-200";
      case "Reservado": return "bg-yellow-50 text-yellow-600 border-yellow-200";
      case "Vendido": return "bg-red-50 text-red-600 border-red-200";
      default: return "";
    }
  };

  const getUserName = (userId: number) => {
    const u = usersList.find(u => u.id === userId);
    return u ? `${u.nombre} ${u.apellido}` : `Usuario #${userId}`;
  };

  const getLoteCodigo = (loteId: number) => lotes.find(l => l.id === loteId)?.codigo || `#${loteId}`;

  const pagosPendientes = pagos.filter(p => p.estado === "En proceso").length;

  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart },
    { id: "lotes", label: "Gestión de Lotes", icon: MapPin },
    { id: "usuarios", label: "Usuarios / Clientes", icon: Users },
    { id: "pagos", label: "Pagos y Finanzas", icon: DollarSign, badge: pagosPendientes },
    { id: "pqrs", label: "PQRS", icon: MessageSquare, badge: stats?.pqrsPendientes },
  ];

  return (
    <Layout>
      <div className="bg-gray-50 min-h-screen">
        <div className="flex h-full min-h-screen">
          <div className="w-72 bg-gradient-to-b from-primary via-primary to-primary/90 text-white hidden md:flex flex-col shadow-xl">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center gap-3 mb-3">
                <img src="/logo-terranova.png" alt="TerraNova Group" className="w-10 h-10 rounded-lg object-contain brightness-0 invert" />
                <div>
                  <h2 className="font-serif text-lg font-bold tracking-tight">TerraNova Group</h2>
                  <p className="text-[11px] text-white/50 uppercase tracking-wider">Panel Administrativo</p>
                </div>
              </div>
            </div>
            <nav className="p-3 space-y-1 flex-1">
              {sidebarItems.map((item) => (
                <button key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                    activeSection === item.id
                      ? "bg-white/15 text-white shadow-lg shadow-black/10 backdrop-blur-sm"
                      : "text-white/60 hover:bg-white/5 hover:text-white"
                  }`}
                  data-testid={`nav-admin-${item.id}`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-5 h-5" /> <span className="text-sm">{item.label}</span>
                  </div>
                  {item.badge ? (
                    <span className="bg-accent text-white text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">{item.badge}</span>
                  ) : null}
                </button>
              ))}
            </nav>
            <div className="p-3 border-t border-white/10 space-y-1">
              <Button variant="ghost" className="w-full justify-start text-white/60 hover:text-white hover:bg-white/5 rounded-xl h-11"
                onClick={() => setLocation("/dashboard")}>
                <Eye className="w-4 h-4 mr-3" /> Vista Cliente
              </Button>
              <Button variant="ghost" className="w-full justify-start text-white/60 hover:text-white hover:bg-white/5 rounded-xl h-11"
                onClick={logout} data-testid="button-admin-logout">
                <LogOut className="w-4 h-4 mr-3" /> Cerrar Sesión
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-200/60 px-6 md:px-8 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl md:text-2xl font-serif font-bold text-gray-900">
                    {activeSection === "dashboard" && "Vista General"}
                    {activeSection === "lotes" && "Gestión de Lotes"}
                    {activeSection === "usuarios" && "Usuarios / Clientes"}
                    {activeSection === "pagos" && "Pagos y Finanzas"}
                    {activeSection === "pqrs" && "Gestión de PQRS"}
                  </h1>
                  <p className="text-sm text-muted-foreground mt-0.5">Bienvenido, {user.nombre}</p>
                </div>
                {activeSection === "dashboard" && (
                  <Button className="bg-accent hover:bg-accent/90 text-white shadow-md shadow-accent/20"
                    onClick={() => { setActiveSection("lotes"); setLoteDialog({}); }}
                    data-testid="button-nuevo-lote">
                    <Plus className="w-4 h-4 mr-2" /> Nuevo Lote
                  </Button>
                )}
                {activeSection === "lotes" && (
                  <Button className="bg-accent hover:bg-accent/90 text-white shadow-md shadow-accent/20" onClick={() => setLoteDialog({})} data-testid="button-crear-lote">
                    <Plus className="w-4 h-4 mr-2" /> Nuevo Lote
                  </Button>
                )}
              </div>
            </div>

            <div className="p-6 md:p-8">
              {activeSection === "dashboard" && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                    {[
                      { title: "Lotes Disponibles", value: stats?.lotesDisponibles || 0, icon: MapPin, gradient: "from-blue-500 to-blue-600", lightBg: "bg-blue-50" },
                      { title: "Lotes Vendidos", value: stats?.lotesVendidos || 0, icon: TrendingUp, gradient: "from-emerald-500 to-emerald-600", lightBg: "bg-emerald-50" },
                      { title: "Ingresos (Mes)", value: formatPrice(stats?.ingresosMes || 0), icon: DollarSign, gradient: "from-amber-500 to-orange-500", lightBg: "bg-amber-50" },
                      { title: "PQRS Pendientes", value: stats?.pqrsPendientes || 0, icon: MessageSquare, gradient: "from-rose-500 to-rose-600", lightBg: "bg-rose-50" },
                    ].map((stat, i) => (
                      <Card key={i} className="border-none shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                        <CardContent className="p-0">
                          <div className="flex items-stretch">
                            <div className={`w-2 bg-gradient-to-b ${stat.gradient}`}></div>
                            <div className="flex-1 p-5 flex items-center justify-between">
                              <div>
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">{stat.title}</p>
                                <h3 className="text-2xl font-bold text-gray-900" data-testid={`stat-${i}`}>{stat.value}</h3>
                              </div>
                              <div className={`w-11 h-11 rounded-xl ${stat.lightBg} flex items-center justify-center`}>
                                <stat.icon className={`w-5 h-5 bg-gradient-to-br ${stat.gradient} bg-clip-text`} style={{ color: 'transparent', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }} />
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {pagosPendientes > 0 && (
                    <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                          <Clock className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-amber-800">Tienes {pagosPendientes} pago{pagosPendientes > 1 ? "s" : ""} pendiente{pagosPendientes > 1 ? "s" : ""} de revisión</p>
                          <p className="text-sm text-amber-600">Revisa y aprueba o rechaza los pagos en la sección de Pagos y Finanzas.</p>
                        </div>
                      </div>
                      <Button variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-100"
                        onClick={() => setActiveSection("pagos")}>
                        Revisar
                      </Button>
                    </div>
                  )}

                  <Card className="border-none shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Últimas Ventas</CardTitle>
                      <CardDescription>Transacciones más recientes del sistema</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {ventas.length === 0 ? (
                        <div className="text-center py-12">
                          <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-muted-foreground">No hay ventas registradas.</p>
                        </div>
                      ) : (
                        <div className="rounded-xl border border-gray-100 overflow-hidden">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-gray-50/80">
                                <th className="px-5 py-3.5 text-left font-semibold text-xs uppercase tracking-wider text-gray-500">Lote</th>
                                <th className="px-5 py-3.5 text-left font-semibold text-xs uppercase tracking-wider text-gray-500">Cliente</th>
                                <th className="px-5 py-3.5 text-left font-semibold text-xs uppercase tracking-wider text-gray-500">Valor</th>
                                <th className="px-5 py-3.5 text-left font-semibold text-xs uppercase tracking-wider text-gray-500">Fecha</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {ventas.slice(0, 10).map((v) => (
                                <tr key={v.id} className="hover:bg-gray-50/50 transition-colors">
                                  <td className="px-5 py-4">
                                    <span className="inline-flex items-center gap-1.5 font-bold text-primary">
                                      <MapPin className="w-3.5 h-3.5" /> {getLoteCodigo(v.loteId)}
                                    </span>
                                  </td>
                                  <td className="px-5 py-4 text-gray-700">{getUserName(v.userId)}</td>
                                  <td className="px-5 py-4 font-semibold text-gray-900">{formatPrice(v.valorTotal)}</td>
                                  <td className="px-5 py-4 text-gray-500">{v.fecha ? new Date(v.fecha).toLocaleDateString('es-CO') : ""}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </>
              )}

              {activeSection === "lotes" && (
                <Card className="border-none shadow-sm">
                  <CardContent className="p-0">
                    <div className="rounded-xl border border-gray-100 overflow-hidden">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50/80">
                            <th className="px-5 py-3.5 text-left font-semibold text-xs uppercase tracking-wider text-gray-500">Código</th>
                            <th className="px-5 py-3.5 text-left font-semibold text-xs uppercase tracking-wider text-gray-500">Etapa</th>
                            <th className="px-5 py-3.5 text-left font-semibold text-xs uppercase tracking-wider text-gray-500">Área</th>
                            <th className="px-5 py-3.5 text-left font-semibold text-xs uppercase tracking-wider text-gray-500">Precio</th>
                            <th className="px-5 py-3.5 text-left font-semibold text-xs uppercase tracking-wider text-gray-500">Estado</th>
                            <th className="px-5 py-3.5 text-left font-semibold text-xs uppercase tracking-wider text-gray-500">Ubicación</th>
                            <th className="px-5 py-3.5 text-right font-semibold text-xs uppercase tracking-wider text-gray-500">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {lotes.map((lote) => (
                            <tr key={lote.id} className="hover:bg-gray-50/50 transition-colors" data-testid={`row-lote-${lote.id}`}>
                              <td className="px-5 py-4 font-bold text-primary">{lote.codigo}</td>
                              <td className="px-5 py-4">
                                <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">{lote.etapa}</span>
                              </td>
                              <td className="px-5 py-4 text-gray-700">{lote.area} m²</td>
                              <td className="px-5 py-4 font-semibold text-gray-900">{formatPrice(lote.precio)}</td>
                              <td className="px-5 py-4"><Badge variant="outline" className={`${getStatusColor(lote.estado)} font-medium`}>{lote.estado}</Badge></td>
                              <td className="px-5 py-4 text-gray-600">{lote.ubicacion}</td>
                              <td className="px-5 py-4 text-right">
                                <div className="flex gap-1.5 justify-end">
                                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600" onClick={() => setEditingLote(lote)} data-testid={`button-edit-lote-${lote.id}`}>
                                    <Pencil className="w-3.5 h-3.5" />
                                  </Button>
                                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600" onClick={() => {
                                    if (confirm("¿Eliminar este lote?")) deleteLoteMutation.mutate(lote.id);
                                  }} data-testid={`button-delete-lote-${lote.id}`}>
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeSection === "usuarios" && (
                <Card className="border-none shadow-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">Todos los Usuarios</CardTitle>
                        <CardDescription>{usersList.length} usuarios registrados en el sistema</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0 pb-1">
                    <div className="rounded-xl border border-gray-100 overflow-hidden mx-6 mb-6">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50/80">
                            <th className="px-5 py-3.5 text-left font-semibold text-xs uppercase tracking-wider text-gray-500">ID</th>
                            <th className="px-5 py-3.5 text-left font-semibold text-xs uppercase tracking-wider text-gray-500">Nombre</th>
                            <th className="px-5 py-3.5 text-left font-semibold text-xs uppercase tracking-wider text-gray-500">Email</th>
                            <th className="px-5 py-3.5 text-left font-semibold text-xs uppercase tracking-wider text-gray-500">Documento</th>
                            <th className="px-5 py-3.5 text-left font-semibold text-xs uppercase tracking-wider text-gray-500">Rol</th>
                            <th className="px-5 py-3.5 text-left font-semibold text-xs uppercase tracking-wider text-gray-500">Registro</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {usersList.map((u) => (
                            <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                              <td className="px-5 py-4 text-gray-500 font-mono text-xs">{u.id}</td>
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                    {u.nombre[0]}{u.apellido[0]}
                                  </div>
                                  <span className="font-medium text-gray-900">{u.nombre} {u.apellido}</span>
                                </div>
                              </td>
                              <td className="px-5 py-4 text-gray-600">{u.email}</td>
                              <td className="px-5 py-4 text-gray-600 font-mono text-xs">{u.documento}</td>
                              <td className="px-5 py-4">
                                <Badge className={u.role === "admin" ? "bg-primary/10 text-primary border-primary/20 hover:bg-primary/10" : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-100"}>
                                  {u.role === "admin" ? "Administrador" : "Cliente"}
                                </Badge>
                              </td>
                              <td className="px-5 py-4 text-gray-500 text-xs">{u.createdAt ? new Date(u.createdAt).toLocaleDateString('es-CO') : ""}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeSection === "pagos" && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-3">
                      <Clock className="w-8 h-8 text-yellow-500" />
                      <div>
                        <p className="text-2xl font-bold text-yellow-700">{pagos.filter(p => p.estado === "En proceso").length}</p>
                        <p className="text-xs text-yellow-600 font-medium">Pendientes</p>
                      </div>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                      <CheckCircle2 className="w-8 h-8 text-green-500" />
                      <div>
                        <p className="text-2xl font-bold text-green-700">{pagos.filter(p => p.estado === "Aprobado").length}</p>
                        <p className="text-xs text-green-600 font-medium">Aprobados</p>
                      </div>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                      <XCircle className="w-8 h-8 text-red-400" />
                      <div>
                        <p className="text-2xl font-bold text-red-700">{pagos.filter(p => p.estado === "Rechazado").length}</p>
                        <p className="text-xs text-red-600 font-medium">Rechazados</p>
                      </div>
                    </div>
                  </div>

                  <Card className="border-none shadow-sm">
                    <CardContent className="p-0">
                      <div className="rounded-xl border border-gray-100 overflow-hidden">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-gray-50/80">
                              <th className="px-5 py-3.5 text-left font-semibold text-xs uppercase tracking-wider text-gray-500">Ref</th>
                              <th className="px-5 py-3.5 text-left font-semibold text-xs uppercase tracking-wider text-gray-500">Cliente</th>
                              <th className="px-5 py-3.5 text-left font-semibold text-xs uppercase tracking-wider text-gray-500">Monto</th>
                              <th className="px-5 py-3.5 text-left font-semibold text-xs uppercase tracking-wider text-gray-500">Concepto</th>
                              <th className="px-5 py-3.5 text-left font-semibold text-xs uppercase tracking-wider text-gray-500">Fecha</th>
                              <th className="px-5 py-3.5 text-left font-semibold text-xs uppercase tracking-wider text-gray-500">Estado</th>
                              <th className="px-5 py-3.5 text-center font-semibold text-xs uppercase tracking-wider text-gray-500">Acciones</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {pagos.length === 0 ? (
                              <tr><td colSpan={7} className="text-center py-12 text-muted-foreground">
                                <DollarSign className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                                No hay pagos registrados.
                              </td></tr>
                            ) : pagos.map((p) => (
                              <tr key={p.id} className={`hover:bg-gray-50/50 transition-colors ${p.estado === "En proceso" ? "bg-yellow-50/30" : ""}`} data-testid={`row-admin-pago-${p.id}`}>
                                <td className="px-5 py-4 font-mono text-xs font-bold text-gray-700">P-{p.id}</td>
                                <td className="px-5 py-4 text-gray-700">{getUserName(p.userId)}</td>
                                <td className="px-5 py-4 font-bold text-gray-900">{formatPrice(p.monto)}</td>
                                <td className="px-5 py-4 text-gray-600 text-xs">{p.concepto}</td>
                                <td className="px-5 py-4 text-gray-500 text-xs">{p.fecha ? new Date(p.fecha).toLocaleDateString('es-CO') : ""}</td>
                                <td className="px-5 py-4">
                                  <Badge className={`font-medium ${
                                    p.estado === 'Aprobado' ? 'bg-green-100 text-green-700 border-green-200' :
                                    p.estado === 'Rechazado' ? 'bg-red-100 text-red-700 border-red-200' :
                                    'bg-yellow-100 text-yellow-700 border-yellow-200 animate-pulse'
                                  }`}>
                                    {p.estado === 'En proceso' && <Clock className="w-3 h-3 mr-1" />}
                                    {p.estado === 'Aprobado' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                                    {p.estado === 'Rechazado' && <XCircle className="w-3 h-3 mr-1" />}
                                    {p.estado}
                                  </Badge>
                                </td>
                                <td className="px-5 py-4">
                                  {p.estado === "En proceso" ? (
                                    <div className="flex gap-2 justify-center">
                                      <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white shadow-sm h-8 px-3"
                                        onClick={() => {
                                          updatePagoEstadoMutation.mutate({ id: p.id, estado: "Aprobado" });
                                        }}
                                        disabled={updatePagoEstadoMutation.isPending}
                                        data-testid={`button-aprobar-pago-${p.id}`}>
                                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Aprobar
                                      </Button>
                                      <Button size="sm" variant="outline" className="text-red-600 border-red-300 hover:bg-red-50 h-8 px-3"
                                        onClick={() => setPagoAction({ id: p.id, action: "Rechazado", motivoRechazo: "" })}
                                        data-testid={`button-rechazar-pago-${p.id}`}>
                                        <XCircle className="w-3.5 h-3.5 mr-1" /> Rechazar
                                      </Button>
                                    </div>
                                  ) : (
                                    <span className="text-xs text-muted-foreground block text-center">
                                      {p.estado === "Rechazado" && (p as any).motivoRechazo ? (
                                        <span className="text-red-500 italic">Motivo: {(p as any).motivoRechazo}</span>
                                      ) : (
                                        <span className="text-gray-400">Procesado</span>
                                      )}
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              {activeSection === "pqrs" && (
                <Card className="border-none shadow-sm">
                  <CardContent className="p-0">
                    <div className="rounded-xl border border-gray-100 overflow-hidden">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50/80">
                            <th className="px-5 py-3.5 text-left font-semibold text-xs uppercase tracking-wider text-gray-500">ID</th>
                            <th className="px-5 py-3.5 text-left font-semibold text-xs uppercase tracking-wider text-gray-500">Tipo</th>
                            <th className="px-5 py-3.5 text-left font-semibold text-xs uppercase tracking-wider text-gray-500">Nombre</th>
                            <th className="px-5 py-3.5 text-left font-semibold text-xs uppercase tracking-wider text-gray-500">Asunto</th>
                            <th className="px-5 py-3.5 text-left font-semibold text-xs uppercase tracking-wider text-gray-500">Fecha</th>
                            <th className="px-5 py-3.5 text-left font-semibold text-xs uppercase tracking-wider text-gray-500">Estado</th>
                            <th className="px-5 py-3.5 text-right font-semibold text-xs uppercase tracking-wider text-gray-500">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {pqrsList.length === 0 ? (
                            <tr><td colSpan={7} className="text-center py-12 text-muted-foreground">
                              <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                              No hay PQRS registrados.
                            </td></tr>
                          ) : pqrsList.map((p) => (
                            <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                              <td className="px-5 py-4 font-mono text-xs font-bold text-gray-700">PQ-{p.id}</td>
                              <td className="px-5 py-4">
                                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                                  p.tipo === "Petición" ? "bg-blue-50 text-blue-600" :
                                  p.tipo === "Queja" ? "bg-orange-50 text-orange-600" :
                                  p.tipo === "Reclamo" ? "bg-red-50 text-red-600" :
                                  "bg-purple-50 text-purple-600"
                                }`}>{p.tipo}</span>
                              </td>
                              <td className="px-5 py-4 text-gray-700">{p.nombre}</td>
                              <td className="px-5 py-4 text-gray-600 max-w-[200px] truncate">{p.asunto}</td>
                              <td className="px-5 py-4 text-gray-500 text-xs">{p.createdAt ? new Date(p.createdAt).toLocaleDateString('es-CO') : ""}</td>
                              <td className="px-5 py-4">
                                <Badge className={`font-medium ${
                                  p.estado === 'Resuelto' ? 'bg-green-100 text-green-700 border-green-200' :
                                  p.estado === 'En proceso' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                                  'bg-orange-100 text-orange-700 border-orange-200'
                                }`}>
                                  {p.estado}
                                </Badge>
                              </td>
                              <td className="px-5 py-4 text-right">
                                <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => setPqrsUpdate({ id: p.id, estado: p.estado, respuesta: p.respuesta || "" })}
                                  data-testid={`button-update-pqrs-${p.id}`}>
                                  Gestionar
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-200 p-1.5 flex justify-around z-50 shadow-lg shadow-black/5">
              {sidebarItems.map((item) => (
                <button key={item.id} onClick={() => setActiveSection(item.id)}
                  className={`flex flex-col items-center gap-0.5 p-2 rounded-xl text-[10px] font-medium transition-colors relative ${activeSection === item.id ? "text-primary bg-primary/5" : "text-gray-400"}`}>
                  <item.icon className="w-5 h-5" />
                  <span>{item.label.split(" ")[0]}</span>
                  {item.badge ? (
                    <span className="absolute -top-0.5 -right-0.5 bg-accent text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{item.badge}</span>
                  ) : null}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={!!loteDialog} onOpenChange={() => setLoteDialog(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Crear Nuevo Lote</DialogTitle></DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            const form = new FormData(e.currentTarget);
            createLoteMutation.mutate({
              codigo: form.get("codigo"),
              etapa: form.get("etapa"),
              area: Number(form.get("area")),
              precio: form.get("precio"),
              estado: form.get("estado"),
              ubicacion: form.get("ubicacion"),
              descripcion: form.get("descripcion") || null,
            });
          }}>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label>Código</Label>
                <Input name="codigo" required placeholder="Ej. L09" data-testid="input-lote-codigo" />
              </div>
              <div className="space-y-2">
                <Label>Etapa</Label>
                <Select name="etapa" defaultValue="Preventa">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Lanzamiento">Lanzamiento</SelectItem>
                    <SelectItem value="Preventa">Preventa</SelectItem>
                    <SelectItem value="Construcción">Construcción</SelectItem>
                    <SelectItem value="Entrega">Entrega</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Área (m²)</Label>
                <Input name="area" type="number" required data-testid="input-lote-area" />
              </div>
              <div className="space-y-2">
                <Label>Precio (COP)</Label>
                <Input name="precio" type="number" required data-testid="input-lote-precio" />
              </div>
              <div className="space-y-2">
                <Label>Estado</Label>
                <Select name="estado" defaultValue="Disponible">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Disponible">Disponible</SelectItem>
                    <SelectItem value="Reservado">Reservado</SelectItem>
                    <SelectItem value="Vendido">Vendido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Ubicación</Label>
                <Input name="ubicacion" required placeholder="Ej. Manzana D" data-testid="input-lote-ubicacion" />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Descripción</Label>
                <Input name="descripcion" placeholder="Opcional" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setLoteDialog(null)}>Cancelar</Button>
              <Button type="submit" disabled={createLoteMutation.isPending} data-testid="button-guardar-lote">
                {createLoteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Crear Lote
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingLote} onOpenChange={() => setEditingLote(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Editar Lote {editingLote?.codigo}</DialogTitle></DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            const form = new FormData(e.currentTarget);
            updateLoteMutation.mutate({
              id: editingLote!.id,
              etapa: form.get("etapa"),
              area: Number(form.get("area")),
              precio: form.get("precio"),
              estado: form.get("estado"),
              ubicacion: form.get("ubicacion"),
              descripcion: form.get("descripcion") || null,
            });
          }}>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label>Etapa</Label>
                <Select name="etapa" defaultValue={editingLote?.etapa}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Lanzamiento">Lanzamiento</SelectItem>
                    <SelectItem value="Preventa">Preventa</SelectItem>
                    <SelectItem value="Construcción">Construcción</SelectItem>
                    <SelectItem value="Entrega">Entrega</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Área (m²)</Label>
                <Input name="area" type="number" defaultValue={editingLote?.area} required />
              </div>
              <div className="space-y-2">
                <Label>Precio</Label>
                <Input name="precio" type="number" defaultValue={editingLote?.precio} required />
              </div>
              <div className="space-y-2">
                <Label>Estado</Label>
                <Select name="estado" defaultValue={editingLote?.estado}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Disponible">Disponible</SelectItem>
                    <SelectItem value="Reservado">Reservado</SelectItem>
                    <SelectItem value="Vendido">Vendido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Ubicación</Label>
                <Input name="ubicacion" defaultValue={editingLote?.ubicacion} required />
              </div>
              <div className="space-y-2">
                <Label>Descripción</Label>
                <Input name="descripcion" defaultValue={editingLote?.descripcion || ""} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setEditingLote(null)}>Cancelar</Button>
              <Button type="submit" disabled={updateLoteMutation.isPending}>
                {updateLoteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Guardar Cambios
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!pagoAction} onOpenChange={() => setPagoAction(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle className="text-red-700">Rechazar Pago P-{pagoAction?.id}</DialogTitle></DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            const form = new FormData(e.currentTarget);
            const motivo = form.get("motivoRechazo") as string;
            if (!motivo.trim()) {
              toast({ title: "Error", description: "Debe indicar el motivo del rechazo", variant: "destructive" });
              return;
            }
            updatePagoEstadoMutation.mutate({
              id: pagoAction!.id,
              estado: "Rechazado",
              motivoRechazo: motivo,
            });
          }}>
            <div className="space-y-4 py-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-700">Esta acción no se puede deshacer. El cliente será notificado por correo electrónico con el motivo del rechazo.</p>
              </div>
              <div className="space-y-2">
                <Label>Motivo del Rechazo *</Label>
                <Textarea name="motivoRechazo" required placeholder="Indique el motivo por el cual se rechaza este pago..." className="min-h-[100px]" data-testid="input-motivo-rechazo" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setPagoAction(null)}>Cancelar</Button>
              <Button type="submit" variant="destructive" disabled={updatePagoEstadoMutation.isPending} data-testid="button-confirmar-rechazo">
                {updatePagoEstadoMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Confirmar Rechazo
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!pqrsUpdate} onOpenChange={() => setPqrsUpdate(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Gestionar PQRS #{pqrsUpdate?.id}</DialogTitle></DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            const form = new FormData(e.currentTarget);
            updatePqrsMutation.mutate({
              id: pqrsUpdate!.id,
              estado: form.get("estado") as string,
              respuesta: form.get("respuesta") as string,
            });
          }}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Estado</Label>
                <Select name="estado" defaultValue={pqrsUpdate?.estado}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pendiente">Pendiente</SelectItem>
                    <SelectItem value="En proceso">En proceso</SelectItem>
                    <SelectItem value="Resuelto">Resuelto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Respuesta</Label>
                <Textarea name="respuesta" defaultValue={pqrsUpdate?.respuesta} placeholder="Respuesta al cliente..." className="min-h-[100px]" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setPqrsUpdate(null)}>Cancelar</Button>
              <Button type="submit" disabled={updatePqrsMutation.isPending}>
                {updatePqrsMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Actualizar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
