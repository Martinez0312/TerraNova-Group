import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";

import Home from "@/pages/Home";
import Catalog from "@/pages/Catalog";
import Auth from "@/pages/Auth";
import ClientDashboard from "@/pages/ClientDashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import ProjectInfo from "@/pages/ProjectInfo";
import PQRS from "@/pages/PQRS";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/catalogo" component={Catalog} />
      <Route path="/login" component={Auth} />
      <Route path="/registro" component={Auth} />
      <Route path="/dashboard" component={ClientDashboard} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/proyecto" component={ProjectInfo} />
      <Route path="/pqrs" component={PQRS} />
      <Route path="/recuperar-password" component={ForgotPassword} />
      <Route path="/restablecer-password" component={ResetPassword} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
