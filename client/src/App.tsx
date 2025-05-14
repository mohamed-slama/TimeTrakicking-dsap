import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import TimeEntries from "@/pages/TimeEntries";
import Reports from "@/pages/Reports";
import Clients from "@/pages/Clients";
import Projects from "@/pages/Projects";
import Team from "@/pages/Team";
import AuthPage from "@/pages/auth-page";
import AppLayout from "@/layout/AppLayout";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={Dashboard} />
      <ProtectedRoute path="/time-entries" component={TimeEntries} />
      <ProtectedRoute path="/reports" component={Reports} />
      <ProtectedRoute path="/clients" component={Clients} />
      <ProtectedRoute path="/projects" component={Projects} />
      <ProtectedRoute path="/team" component={Team} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppRoutes() {
  return (
    <AppLayout>
      <Router />
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <AppRoutes />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
