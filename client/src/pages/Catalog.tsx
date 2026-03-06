
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Maximize, DollarSign, Loader2 } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import type { Lote } from "@shared/schema";

import lotImg1 from "@/assets/images/lotes/lot_image_1.jpg";
import lotImg2 from "@/assets/images/lotes/lot_image_2.jpg";
import lotImg3 from "@/assets/images/lotes/lot_image_3.jpg";
import lotImg4 from "@/assets/images/lotes/lot_image_4.jpg";
import lotImg5 from "@/assets/images/lotes/lot_image_5.jpg";
import lotImg6 from "@/assets/images/lotes/lot_image_6.jpg";
import lotImg7 from "@/assets/images/lotes/lot_image_7.jpg";
import lotImg8 from "@/assets/images/lotes/lot_image_8.jpg";

const lotImages = [lotImg1, lotImg2, lotImg3, lotImg4, lotImg5, lotImg6, lotImg7, lotImg8];

export default function Catalog() {
  const [filterEstado, setFilterEstado] = useState("all");
  const [filterEtapa, setFilterEtapa] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLote, setSelectedLote] = useState<Lote | null>(null);
  const [cuotas, setCuotas] = useState("12");
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const { data: lotes = [], isLoading } = useQuery<Lote[]>({
    queryKey: ["/api/lotes"],
  });

  const comprarMutation = useMutation({
    mutationFn: async (data: { loteId: number; cuotas: number }) => {
      const res = await apiRequest("POST", "/api/ventas", data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Compra exitosa", description: "El lote ha sido adquirido. Revisa tu dashboard." });
      queryClient.invalidateQueries({ queryKey: ["/api/lotes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/ventas"] });
      queryClient.invalidateQueries({ queryKey: ["/api/pagos"] });
      setSelectedLote(null);
      setLocation("/dashboard");
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const filteredLotes = lotes.filter(lote => {
    if (filterEstado !== "all" && lote.estado.toLowerCase() !== filterEstado) return false;
    if (filterEtapa !== "all" && lote.etapa.toLowerCase() !== filterEtapa) return false;
    if (searchQuery && !lote.codigo.toLowerCase().includes(searchQuery.toLowerCase()) && !lote.ubicacion.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const formatPrice = (price: string | number) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(Number(price));
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case "Disponible": return "bg-green-100 text-green-800 border-green-200";
      case "Reservado": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Vendido": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleComprar = (lote: Lote) => {
    if (!user) {
      toast({ title: "Inicia sesión", description: "Debes estar registrado para comprar un lote.", variant: "destructive" });
      setLocation("/login");
      return;
    }
    setSelectedLote(lote);
  };

  return (
    <Layout>
      <div className="bg-primary/5 py-16 border-b border-border">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-4">Catálogo de Lotes</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explora nuestra oferta de lotes. Filtra por etapa, tamaño o disponibilidad para encontrar el terreno perfecto para tu proyecto de vida.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-border mb-10 flex flex-col md:flex-row gap-4 items-end">
          <div className="w-full md:w-1/3">
            <label className="block text-sm font-medium mb-2">Buscar por Manzana/ID</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Ej. L01, Manzana A..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} data-testid="input-search-lotes" />
            </div>
          </div>
          <div className="w-full md:w-1/4">
            <label className="block text-sm font-medium mb-2">Estado</label>
            <Select value={filterEstado} onValueChange={setFilterEstado}>
              <SelectTrigger data-testid="select-estado">
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="disponible">Disponibles</SelectItem>
                <SelectItem value="reservado">Reservados</SelectItem>
                <SelectItem value="vendido">Vendidos</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-full md:w-1/4">
            <label className="block text-sm font-medium mb-2">Etapa del Proyecto</label>
            <Select value={filterEtapa} onValueChange={setFilterEtapa}>
              <SelectTrigger data-testid="select-etapa">
                <SelectValue placeholder="Todas las etapas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las etapas</SelectItem>
                <SelectItem value="lanzamiento">Lanzamiento</SelectItem>
                <SelectItem value="preventa">Preventa</SelectItem>
                <SelectItem value="construcción">Construcción</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">
            {isLoading ? "Cargando..." : `Mostrando ${filteredLotes.length} lotes`}
          </h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-green-500"></div> Disponible</div>
            <div className="flex items-center gap-1 ml-3"><div className="w-3 h-3 rounded-full bg-yellow-500"></div> Reservado</div>
            <div className="flex items-center gap-1 ml-3"><div className="w-3 h-3 rounded-full bg-red-500"></div> Vendido</div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredLotes.map((lote) => (
              <div key={lote.id} className="bg-white rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all group" data-testid={`card-lote-${lote.id}`}>
                <div className="h-48 relative overflow-hidden">
                  <img 
                    src={lotImages[(lote.id - 1) % lotImages.length]} 
                    alt={`Lote ${lote.codigo}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
                    <Badge className={`font-normal border ${getStatusColor(lote.estado)}`}>
                      {lote.estado}
                    </Badge>
                    <Badge variant="outline" className="bg-white/80 backdrop-blur">
                      {lote.etapa}
                    </Badge>
                  </div>
                  <h3 className="absolute bottom-3 left-4 text-3xl font-serif font-bold text-white drop-shadow-lg">{lote.codigo}</h3>
                </div>
                
                <div className="p-6">
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>Ubicación: <b>{lote.ubicacion}</b></span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Maximize className="w-4 h-4 mr-2" />
                      <span>Área: <b>{lote.area} m²</b></span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <DollarSign className="w-4 h-4 mr-2" />
                      <span>Valor: <b>{formatPrice(lote.precio)}</b></span>
                    </div>
                    {lote.descripcion && (
                      <p className="text-xs text-muted-foreground italic">{lote.descripcion}</p>
                    )}
                  </div>
                  
                  {user?.role === "admin" ? (
                    <Button className="w-full" variant="secondary" disabled data-testid={`button-comprar-${lote.id}`}>
                      Solo clientes pueden comprar
                    </Button>
                  ) : (
                    <Button 
                      className="w-full" 
                      variant={lote.estado === "Disponible" ? "default" : "secondary"}
                      disabled={lote.estado !== "Disponible"}
                      onClick={() => handleComprar(lote)}
                      data-testid={`button-comprar-${lote.id}`}
                    >
                      {lote.estado === "Disponible" ? "Comprar Lote" : `No Disponible (${lote.estado})`}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!selectedLote} onOpenChange={() => setSelectedLote(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Compra - Lote {selectedLote?.codigo}</DialogTitle>
            <DialogDescription>
              Estás a punto de adquirir el lote {selectedLote?.codigo} ubicado en {selectedLote?.ubicacion} ({selectedLote?.area} m²)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-secondary/50 p-4 rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">Valor total:</span>
                <span className="font-bold text-lg">{selectedLote && formatPrice(selectedLote.precio)}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cuotas">Número de cuotas</Label>
              <Select value={cuotas} onValueChange={setCuotas}>
                <SelectTrigger data-testid="select-cuotas">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 cuota (Contado)</SelectItem>
                  <SelectItem value="6">6 cuotas</SelectItem>
                  <SelectItem value="12">12 cuotas</SelectItem>
                  <SelectItem value="24">24 cuotas</SelectItem>
                  <SelectItem value="36">36 cuotas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {selectedLote && (
              <div className="bg-primary/5 p-3 rounded-lg text-sm">
                <p>Valor por cuota: <b>{formatPrice(Number(selectedLote.precio) / Number(cuotas))}</b></p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedLote(null)}>Cancelar</Button>
            <Button 
              className="bg-accent hover:bg-accent/90"
              disabled={comprarMutation.isPending}
              onClick={() => selectedLote && comprarMutation.mutate({ loteId: selectedLote.id, cuotas: Number(cuotas) })}
              data-testid="button-confirm-compra"
            >
              {comprarMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Confirmar Compra
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
