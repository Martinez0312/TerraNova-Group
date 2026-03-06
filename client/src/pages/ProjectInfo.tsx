import { Layout } from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Home, Ruler, Layers, Sun, Trees, Car, CheckCircle2 } from "lucide-react";

import houseModel1 from "@/assets/images/house-model-1.jpg";

export default function ProjectInfo() {
  return (
    <Layout>
      <div className="bg-primary text-white py-20">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <Badge className="bg-accent text-white hover:bg-accent/90 mb-6 text-sm px-4 py-1">Proyecto Inmobiliario</Badge>
          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6">El Proyecto TerraNova Group</h1>
          <p className="text-xl text-primary-foreground/80 leading-relaxed">
            Concebido bajo los más altos estándares de urbanismo sostenible, TerraNova Group es un 
            desarrollo habitacional que integra confort moderno con la tranquilidad de la naturaleza.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
          <div className="space-y-6">
            <h2 className="text-3xl font-serif font-bold text-primary">Nuestra Visión</h2>
            <div className="w-16 h-1 bg-accent"></div>
            <p className="text-lg text-muted-foreground">
              Buscamos ofrecer a las familias no solo un pedazo de tierra, sino un estilo de vida. 
              Nuestros lotes, que oscilan entre 100m² y 200m², están estratégicamente distribuidos para 
              garantizar privacidad, excelente iluminación y vistas privilegiadas.
            </p>
            <p className="text-lg text-muted-foreground">
              Al adquirir un lote en TerraNova Group, no estás solo. Te acompañamos en el proceso de construir 
              tu hogar entregándote sin costo diseños arquitectónicos de vanguardia, listos para ser materializados.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-secondary rounded-2xl h-48 sm:h-64 mt-8 bg-cover bg-center" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80)' }}></div>
            <div className="bg-secondary rounded-2xl h-48 sm:h-64 bg-cover bg-center" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80)' }}></div>
          </div>
        </div>

        {/* Etapas del proyecto */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-serif font-bold text-primary mb-4">Etapas del Proyecto</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Conoce el avance y planificación de TerraNova Group. Transparencia total en cada paso de tu inversión.
          </p>
        </div>

        <div className="relative">
          {/* Timeline line */}
          <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-border z-0"></div>

          <div className="space-y-12 relative z-10">
            {/* Etapa 1 */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="md:w-5/12 md:text-right order-2 md:order-1">
                <h3 className="text-2xl font-bold text-primary">1. Lanzamiento</h3>
                <p className="text-accent font-medium mb-2">Completado</p>
                <p className="text-muted-foreground">Presentación del proyecto, apertura de sala de ventas y estructuración de precios iniciales con altos márgenes de valorización.</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-accent text-white flex items-center justify-center font-bold text-xl order-1 md:order-2 shadow-lg z-10">1</div>
              <div className="md:w-5/12 order-3"></div>
            </div>

            {/* Etapa 2 */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="md:w-5/12 order-2 md:order-1"></div>
              <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xl order-1 md:order-2 shadow-lg z-10">2</div>
              <div className="md:w-5/12 md:text-left order-3">
                <h3 className="text-2xl font-bold text-primary">2. Preventa</h3>
                <p className="text-primary font-medium mb-2">Etapa Actual</p>
                <p className="text-muted-foreground">Comercialización activa. Separación de lotes con facilidades de pago por cuotas. Trámites de licencias de urbanismo.</p>
              </div>
            </div>

            {/* Etapa 3 */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="md:w-5/12 md:text-right order-2 md:order-1">
                <h3 className="text-2xl font-bold text-gray-400">3. Construcción</h3>
                <p className="text-gray-400 font-medium mb-2">Próximamente (2024)</p>
                <p className="text-muted-foreground">Movimiento de tierras, instalación de redes de servicios públicos (acueducto, energía), pavimentación y adecuación de zonas comunes.</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-bold text-xl order-1 md:order-2 shadow-inner z-10">3</div>
              <div className="md:w-5/12 order-3"></div>
            </div>

            {/* Etapa 4 */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="md:w-5/12 order-2 md:order-1"></div>
              <div className="w-12 h-12 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-bold text-xl order-1 md:order-2 shadow-inner z-10">4</div>
              <div className="md:w-5/12 md:text-left order-3">
                <h3 className="text-2xl font-bold text-gray-400">4. Entrega</h3>
                <p className="text-gray-400 font-medium mb-2">Estimado (Finales 2024)</p>
                <p className="text-muted-foreground">Escrituración individual, entrega física del terreno al propietario y permisos listos para inicio de construcción de viviendas.</p>
              </div>
            </div>
          </div>
        </div>

        <div id="modelos" className="mt-24">
          <div className="text-center mb-16">
            <Badge className="bg-accent text-white hover:bg-accent/90 mb-4 text-sm px-4 py-1">Incluidos con tu lote</Badge>
            <h2 className="text-3xl font-serif font-bold text-primary mb-4">Modelos Arquitectónicos</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Al adquirir tu lote, recibes sin costo adicional uno de nuestros tres diseños arquitectónicos exclusivos, 
              optimizados para aprovechar el área y la iluminación natural de tu terreno.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <Card className="overflow-hidden hover:shadow-xl transition-all group border-2 border-transparent hover:border-accent/30">
              <div className="h-56 overflow-hidden relative">
                <img
                  src={houseModel1}
                  alt="Modelo El Roble"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <p className="text-2xl font-serif font-bold">El Roble</p>
                  <p className="text-sm text-white/80">Área construida: 145 m²</p>
                </div>
              </div>
              <CardContent className="p-6 space-y-4">
                <p className="text-muted-foreground text-sm">
                  Diseño de dos pisos con amplios espacios sociales, ideal para familias que buscan confort y funcionalidad.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm"><Home className="w-4 h-4 text-accent" /> 3 habitaciones + estudio</div>
                  <div className="flex items-center gap-2 text-sm"><Layers className="w-4 h-4 text-accent" /> 2 pisos</div>
                  <div className="flex items-center gap-2 text-sm"><Ruler className="w-4 h-4 text-accent" /> Lote mínimo: 120 m²</div>
                  <div className="flex items-center gap-2 text-sm"><Car className="w-4 h-4 text-accent" /> Garaje para 2 vehículos</div>
                  <div className="flex items-center gap-2 text-sm"><Sun className="w-4 h-4 text-accent" /> Terraza con vista panorámica</div>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden hover:shadow-xl transition-all group border-2 border-transparent hover:border-accent/30">
              <div className="h-56 overflow-hidden relative bg-secondary">
                <div
                  className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                  style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80)' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <p className="text-2xl font-serif font-bold">El Cedro</p>
                  <p className="text-sm text-white/80">Área construida: 95 m²</p>
                </div>
              </div>
              <CardContent className="p-6 space-y-4">
                <p className="text-muted-foreground text-sm">
                  Modelo compacto de un piso, perfecto para parejas jóvenes o como inversión para renta. Diseño moderno y eficiente.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm"><Home className="w-4 h-4 text-accent" /> 2 habitaciones + sala de estar</div>
                  <div className="flex items-center gap-2 text-sm"><Layers className="w-4 h-4 text-accent" /> 1 piso</div>
                  <div className="flex items-center gap-2 text-sm"><Ruler className="w-4 h-4 text-accent" /> Lote mínimo: 100 m²</div>
                  <div className="flex items-center gap-2 text-sm"><Trees className="w-4 h-4 text-accent" /> Jardín interior</div>
                  <div className="flex items-center gap-2 text-sm"><Sun className="w-4 h-4 text-accent" /> Iluminación natural cenital</div>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden hover:shadow-xl transition-all group border-2 border-transparent hover:border-accent/30">
              <div className="h-56 overflow-hidden relative bg-secondary">
                <div
                  className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                  style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80)' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <p className="text-2xl font-serif font-bold">El Nogal</p>
                  <p className="text-sm text-white/80">Área construida: 180 m²</p>
                </div>
              </div>
              <CardContent className="p-6 space-y-4">
                <p className="text-muted-foreground text-sm">
                  Nuestra propuesta premium de dos pisos con acabados de alta gama, zonas sociales amplias y espacios para toda la familia.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm"><Home className="w-4 h-4 text-accent" /> 4 habitaciones + sala de TV</div>
                  <div className="flex items-center gap-2 text-sm"><Layers className="w-4 h-4 text-accent" /> 2 pisos</div>
                  <div className="flex items-center gap-2 text-sm"><Ruler className="w-4 h-4 text-accent" /> Lote mínimo: 150 m²</div>
                  <div className="flex items-center gap-2 text-sm"><Car className="w-4 h-4 text-accent" /> Garaje cubierto para 2 vehículos</div>
                  <div className="flex items-center gap-2 text-sm"><Trees className="w-4 h-4 text-accent" /> Patio trasero con zona BBQ</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="bg-primary/5 rounded-2xl p-8 md:p-12">
            <h3 className="text-2xl font-serif font-bold text-primary mb-6 text-center">Todos los modelos incluyen</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                "Planos arquitectónicos completos",
                "Planos estructurales",
                "Diseño de redes hidráulicas y sanitarias",
                "Diseño eléctrico",
                "Aprobación para licencia de construcción",
                "Asesoría técnica personalizada",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-white rounded-lg p-4 shadow-sm">
                  <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0" />
                  <span className="text-sm font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}