import { Link } from "wouter";
import { Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img src="/logo-terranova.png" alt="TerraNova Group" className="h-10 w-10 rounded-lg object-contain brightness-0 invert" />
              <span className="font-serif text-xl font-bold">TerraNova Group</span>
            </div>
            <p className="text-sm text-primary-foreground/80 leading-relaxed">
              Desarrollamos proyectos habitacionales pensados para tu bienestar y el de tu familia. Construye la casa de tus sueños.
            </p>
          </div>
          
          <div>
            <h3 className="font-serif text-lg font-semibold mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li><Link href="/"><span className="hover:text-white cursor-pointer transition-colors">Inicio</span></Link></li>
              <li><Link href="/proyecto"><span className="hover:text-white cursor-pointer transition-colors">El Proyecto</span></Link></li>
              <li><Link href="/catalogo"><span className="hover:text-white cursor-pointer transition-colors">Lotes</span></Link></li>
              <li><Link href="/pqrs"><span className="hover:text-white cursor-pointer transition-colors">Atención al Cliente</span></Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-serif text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li><a href="#" className="hover:text-white transition-colors">Términos y Condiciones</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Política de Privacidad</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Tratamiento de Datos</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-serif text-lg font-semibold mb-4">Contacto</h3>
            <ul className="space-y-3 text-sm text-primary-foreground/80">
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>Vía Principal, Km 5, Oficina de Ventas</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>+57 300 123 4567</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>ventas@terranovagroup.com</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-primary-foreground/20 mt-12 pt-8 text-center text-sm text-primary-foreground/60">
          <p>© {new Date().getFullYear()} TerraNova Group - Sistema Web Inmobiliario ADSO-19. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}