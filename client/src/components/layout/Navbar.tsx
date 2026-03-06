import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut, User } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";

export function Navbar() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();

  const navLinks = [
    { href: "/", label: "Inicio" },
    { href: "/catalogo", label: "Lotes Disponibles" },
    { href: "/proyecto", label: "El Proyecto" },
    { href: "/pqrs", label: "PQRS" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-20 items-center justify-between px-4">
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer">
            <img src="/logo-terranova.png" alt="TerraNova Group" className="h-10 w-10 rounded-lg object-contain" />
            <span className="font-serif text-xl font-bold text-primary hidden sm:inline-block">
              TerraNova Group
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <span className={`text-sm font-medium transition-colors hover:text-primary cursor-pointer ${
                location === link.href ? "text-primary border-b-2 border-primary py-1" : "text-muted-foreground"
              }`}>
                {link.label}
              </span>
            </Link>
          ))}
          <div className="flex items-center gap-4 ml-4 border-l pl-4">
            {user ? (
              <>
                <Link href={user.role === "admin" ? "/admin" : "/dashboard"}>
                  <Button variant="ghost" className="font-medium gap-2" data-testid="link-dashboard">
                    <User className="w-4 h-4" />
                    {user.nombre}
                  </Button>
                </Link>
                <Button variant="outline" className="font-medium gap-2" onClick={logout} data-testid="button-logout">
                  <LogOut className="w-4 h-4" /> Salir
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="font-medium" data-testid="link-login">Ingresar</Button>
                </Link>
                <Link href="/registro">
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium" data-testid="link-register">
                    Registrarse
                  </Button>
                </Link>
              </>
            )}
          </div>
        </nav>

        <button 
          className="md:hidden p-2 text-foreground"
          onClick={() => setIsOpen(!isOpen)}
          data-testid="button-mobile-menu"
        >
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden border-t bg-background p-4 animate-in slide-in-from-top-2">
          <nav className="flex flex-col space-y-4">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <span 
                  className={`text-sm font-medium cursor-pointer block py-2 ${
                    location === link.href ? "text-primary" : "text-muted-foreground"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </span>
              </Link>
            ))}
            <div className="pt-4 border-t flex flex-col gap-2">
              {user ? (
                <>
                  <Link href={user.role === "admin" ? "/admin" : "/dashboard"}>
                    <Button variant="outline" className="w-full" onClick={() => setIsOpen(false)}>
                      Mi Cuenta
                    </Button>
                  </Link>
                  <Button className="w-full" onClick={() => { logout(); setIsOpen(false); }}>
                    Cerrar Sesión
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="outline" className="w-full" onClick={() => setIsOpen(false)}>
                      Ingresar
                    </Button>
                  </Link>
                  <Link href="/registro">
                    <Button className="w-full" onClick={() => setIsOpen(false)}>
                      Registrarse
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
