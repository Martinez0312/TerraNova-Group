import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, Leaf, Map, ShieldCheck, Star } from "lucide-react";
import heroBg from "@/assets/images/hero-bg.jpg";
import house1 from "@/assets/images/house-model-1.jpg";

export default function Home() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{ 
            backgroundImage: `url(${heroBg})`,
          }}
        >
          <div className="absolute inset-0 bg-black/50" />
        </div>
        
        <div className="container relative z-10 mx-auto px-4 text-center text-white">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold mb-6 text-white leading-tight animate-in fade-in slide-in-from-bottom-8 duration-1000">
            Construye tu futuro <br/> en armonía con la naturaleza
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10 text-gray-200 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150">
            Lotes campestres desde 100m² hasta 200m² con diseños de casas incluidos. 
            El lugar perfecto para la casa de tus sueños.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            <Link href="/catalogo">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-white min-w-[200px] text-lg h-14">
                Ver Lotes
              </Button>
            </Link>
            <Link href="/proyecto">
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/20 min-w-[200px] text-lg h-14 backdrop-blur-sm">
                Conocer el Proyecto
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">¿Por qué elegir TerraNova Group?</h2>
            <div className="w-24 h-1 bg-accent mx-auto mb-6"></div>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Diseñamos un entorno pensado en la calidad de vida, la seguridad de tu inversión y el contacto directo con la naturaleza.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Map, title: "Ubicación Privilegiada", desc: "A solo 15 minutos del centro urbano, con vías de acceso pavimentadas." },
              { icon: Leaf, title: "Entorno Natural", desc: "Más de 50.000m² de áreas verdes, senderos ecológicos y parques." },
              { icon: ShieldCheck, title: "Inversión Segura", desc: "Alta valorización garantizada. Respaldo legal y financiero." },
              { icon: Star, title: "Diseños Exclusivos", desc: "Te obsequiamos planos arquitectónicos diseñados por expertos." }
            ].map((feature, i) => (
              <div key={i} className="bg-white p-8 rounded-xl shadow-sm border border-border/50 hover:shadow-md transition-shadow text-center group">
                <div className="w-16 h-16 mx-auto bg-secondary/50 rounded-full flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors text-primary">
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Showcase */}
      <section className="py-24 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2 space-y-6">
              <h2 className="text-3xl md:text-4xl font-serif font-bold">Planos arquitectónicos incluidos con tu lote</h2>
              <div className="w-24 h-1 bg-accent mb-6"></div>
              <p className="text-lg text-muted-foreground">
                Por la compra de cualquier lote en TerraNova Group, te entregamos sin costo adicional tres opciones de diseños arquitectónicos modernos, optimizados para aprovechar al máximo el área y la iluminación natural de tu terreno.
              </p>
              <ul className="space-y-4 pt-4">
                {["Diseños modernos y sostenibles", "Aprobados para licencias de construcción", "Opciones de 1 y 2 pisos", "Distribución inteligente del espacio"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                    <span className="font-medium text-foreground/80">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="pt-6">
                <a href="/proyecto#modelos">
                  <Button className="flex items-center gap-2 group">
                    Ver modelos <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </a>
              </div>
            </div>
            <div className="lg:w-1/2">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img src={house1} alt="Modelo de casa" className="w-full h-auto object-cover aspect-video hover:scale-105 transition-transform duration-700" />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-8">
                  <p className="text-white font-serif text-2xl font-bold">Modelo "El Roble"</p>
                  <p className="text-gray-300">Área construida: 145m²</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-primary text-primary-foreground text-center">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl md:text-5xl font-serif font-bold mb-6 text-white">¿Listo para dar el primer paso?</h2>
          <p className="text-xl text-primary-foreground/80 mb-10">
            Regístrate hoy, explora nuestro catálogo de lotes disponibles y reserva el tuyo con facilidad.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/registro">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-white min-w-[200px] h-14 text-lg">
                Crear una cuenta
              </Button>
            </Link>
            <Link href="/catalogo">
              <Button size="lg" variant="outline" className="border-white text-primary-foreground hover:bg-white/10 min-w-[200px] h-14 text-lg">
                Ver disponibilidad
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}