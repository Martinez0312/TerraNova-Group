import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { MapPin, DollarSign, Calendar, FileText, CheckCircle2, CreditCard, LogOut, User, Loader2, Clock, XCircle, AlertCircle, ShoppingBag, MessageSquare, TrendingUp } from "lucide-react";
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

/* IMÁGENES LOTES */
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

if (!user) {
setLocation("/login");
return null;
}

const { data: ventas = [] } = useQuery<Venta[]>({ queryKey: ["/api/ventas"] });
const { data: pagos = [] } = useQuery<Pago[]>({ queryKey: ["/api/pagos"] });
const { data: pqrsList = [] } = useQuery<Pqrs[]>({ queryKey: ["/api/pqrs"] });
const { data: lotes = [] } = useQuery<Lote[]>({ queryKey: ["/api/lotes"] });

/* FUNCIONES */

const formatPrice = (price: string | number) => {
return new Intl.NumberFormat("es-CO", {
style: "currency",
currency: "COP",
maximumFractionDigits: 0,
}).format(Number(price));
};

const getLoteForVenta = (loteId: number) => lotes.find(l => l.id === loteId);

const getLoteImage = (loteId: number) => {
const index = loteId - 1;
return lotImages[index] || lotImages[0];
};

const getTotalPagado = (ventaId: number) => {
return pagos
.filter(p => p.ventaId === ventaId && p.estado === "Aprobado")
.reduce((sum, p) => sum + Number(p.monto), 0);
};

const getCuotasPagadas = (ventaId: number) => {
return pagos.filter(p => p.ventaId === ventaId && p.estado === "Aprobado").length;
};

const totalInvertido = ventas.reduce((sum, v) => sum + Number(v.valorTotal), 0);
const totalPagadoGeneral = ventas.reduce((sum, v) => sum + getTotalPagado(v.id), 0);

return (

<Layout>

<div className="bg-gray-50 min-h-[calc(100vh-200px)]">

{/* HEADER */}

<div className="bg-primary text-white">

<div className="container mx-auto px-4 py-10">

<div className="flex justify-between items-center">

<div className="flex items-center gap-4">

<User size={28} />

<div>

<h1 className="text-2xl font-bold">

{user.nombre} {user.apellido}

</h1>

<p className="text-sm opacity-80">{user.email}</p>

</div>

</div>

<Button variant="outline" onClick={logout}>

<LogOut className="w-4 h-4 mr-2" />

Cerrar Sesión

</Button>

</div>

<div className="grid md:grid-cols-3 gap-4 mt-6">

<div className="bg-white/10 p-4 rounded">

<p className="text-xs uppercase">Lotes Adquiridos</p>

<p className="text-2xl font-bold">{ventas.length}</p>

</div>

<div className="bg-white/10 p-4 rounded">

<p className="text-xs uppercase">Total Invertido</p>

<p className="text-2xl font-bold">{formatPrice(totalInvertido)}</p>

</div>

<div className="bg-white/10 p-4 rounded">

<p className="text-xs uppercase">Total Pagado</p>

<p className="text-2xl font-bold">{formatPrice(totalPagadoGeneral)}</p>

</div>

</div>

</div>

</div>

{/* CONTENIDO */}

<div className="container mx-auto px-4 py-8">

<Tabs defaultValue="lotes">

<TabsList className="grid grid-cols-3 mb-8">

<TabsTrigger value="lotes">

<MapPin className="w-4 h-4 mr-2" />

Mis Lotes

</TabsTrigger>

<TabsTrigger value="pagos">

<DollarSign className="w-4 h-4 mr-2" />

Pagos

</TabsTrigger>

<TabsTrigger value="pqrs">

<MessageSquare className="w-4 h-4 mr-2" />

PQRS

</TabsTrigger>

</TabsList>

{/* MIS LOTES */}

<TabsContent value="lotes">

{ventas.length === 0 ? (

<Card>

<CardContent className="text-center py-10">

<MapPin className="mx-auto mb-4 text-gray-300" size={40} />

<p>No tienes lotes adquiridos.</p>

</CardContent>

</Card>

) : (

<div className="space-y-6">

{ventas.map((venta) => {

const lote = getLoteForVenta(venta.loteId);

const totalPagado = getTotalPagado(venta.id);

const progreso = Math.round((totalPagado / Number(venta.valorTotal)) * 100);

const saldo = Number(venta.valorTotal) - totalPagado;

return (

<Card key={venta.id} className="overflow-hidden">

<div className="flex flex-col md:flex-row">

{/* IMAGEN DEL LOTE */}

<div className="md:w-1/3">

<img

src={getLoteImage(venta.loteId)}

alt="lote"

className="w-full h-full object-cover min-h-[220px]"

/>

</div>

{/* INFORMACIÓN */}

<div className="p-6 md:w-2/3">

<h2 className="text-xl font-bold mb-1">

Lote {lote?.codigo}

</h2>

<p className="text-sm text-gray-500 mb-4">

{lote?.ubicacion} • {lote?.area} m²

</p>

<div className="grid grid-cols-2 gap-4 mb-4">

<div>

<p className="text-xs text-gray-500">Valor Total</p>

<p className="font-bold">

{formatPrice(venta.valorTotal)}

</p>

</div>

<div>

<p className="text-xs text-gray-500">Saldo</p>

<p className="font-bold">

{saldo > 0 ? formatPrice(saldo) : "Pagado"}

</p>

</div>

</div>

<Progress value={progreso} />

</div>

</div>

</Card>

);

})}

</div>

)}

</TabsContent>

</Tabs>

</div>

</div>

</Layout>

);

}
