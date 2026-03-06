import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { MapPin, DollarSign, LogOut, User, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import type { Venta, Pago, Lote } from "@shared/schema";

/* IMÁGENES DE LOTES */
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

if (!user) {
setLocation("/login");
return null;
}

const { data: ventas = [] } = useQuery<Venta[]>({ queryKey: ["/api/ventas"] });
const { data: pagos = [] } = useQuery<Pago[]>({ queryKey: ["/api/pagos"] });
const { data: lotes = [] } = useQuery<Lote[]>({ queryKey: ["/api/lotes"] });

/* FUNCIONES */

const formatPrice = (price: string | number) => {
return new Intl.NumberFormat("es-CO", {
style: "currency",
currency: "COP",
maximumFractionDigits: 0
}).format(Number(price));
};

const getLoteForVenta = (loteId: number) =>
lotes.find(l => l.id === loteId);

const getLoteImage = (loteId: number) => {
const index = loteId - 1;
return lotImages[index] || lotImages[0];
};

const getTotalPagado = (ventaId: number) => {
return pagos
.filter(p => p.ventaId === ventaId && p.estado === "Aprobado")
.reduce((sum, p) => sum + Number(p.monto), 0);
};

return (

<Layout>

<div className="bg-gray-50 min-h-screen">

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

<p className="text-sm opacity-80">
{user.email}
</p>

</div>

</div>

<Button variant="outline" onClick={logout}>
<LogOut className="w-4 h-4 mr-2" />
Cerrar sesión
</Button>

</div>

</div>

</div>

{/* CONTENIDO */}

<div className="container mx-auto px-4 py-8">

<Tabs defaultValue="lotes">

<TabsList className="grid grid-cols-1 mb-8">
<TabsTrigger value="lotes">
<MapPin className="w-4 h-4 mr-2" />
Mis lotes
</TabsTrigger>
</TabsList>

<TabsContent value="lotes">

{ventas.length === 0 ? (

<Card>

<CardContent className="text-center py-10">
<MapPin className="mx-auto mb-4 text-gray-300" size={40}/>
<p>No tienes lotes adquiridos.</p>
</CardContent>

</Card>

) : (

<div className="space-y-6">

{ventas.map((venta) => {

const lote = getLoteForVenta(venta.loteId);
const totalPagado = getTotalPagado(venta.id);
const progreso = Math.round((totalPagado / Number(venta.valorTotal)) * 100);

return (

<Card key={venta.id} className="overflow-hidden">

<div className="flex flex-col md:flex-row">

{/* PANEL IZQUIERDO CON IMAGEN DE FONDO */}

<div
className="p-8 md:w-1/3 flex flex-col justify-center items-center border-b md:border-b-0 md:border-r border-gray-100 relative bg-cover bg-center"
style={{
backgroundImage: `url(${getLoteImage(venta.loteId)})`
}}
>

<div className="absolute inset-0 bg-black/40"></div>

<div className="relative z-10 flex flex-col items-center text-white">

<div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow">
<MapPin className="w-9 h-9 text-primary" />
</div>

<h2 className="text-2xl font-bold mt-4">
Lote {lote?.codigo || "N/A"}
</h2>

<p className="text-sm opacity-90">
{lote?.ubicacion || ""} • {lote?.area || "0"} m²
</p>

</div>

</div>

{/* PANEL DERECHO */}

<div className="p-6 md:w-2/3">

<div className="flex justify-between mb-4">

<div>

<p className="text-xs text-gray-500">
Valor total
</p>

<p className="text-xl font-bold">
{formatPrice(venta.valorTotal)}
</p>

</div>

<div>

<p className="text-xs text-gray-500">
Saldo pendiente
</p>

<p className="text-xl font-bold text-green-600">
Pagado
</p>

</div>

</div>

<p className="text-sm text-gray-500 mb-2">
Progreso de pago
</p>

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
