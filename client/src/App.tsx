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
      <Route path="/auth" component={AuthPage} />
      <Route path="/time-entries">
        <AppLayout>
          <ProtectedRoute path="/time-entries" component={TimeEntries} />
        </AppLayout>
      </Route>
      <Route path="/reports">
        <AppLayout>
          <ProtectedRoute path="/reports" component={Reports} />
        </AppLayout>
      </Route>
      <Route path="/clients">
        <AppLayout>
          <ProtectedRoute path="/clients" component={Clients} />
        </AppLayout>
      </Route>
      <Route path="/projects">
        <AppLayout>
          <ProtectedRoute path="/projects" component={Projects} />
        </AppLayout>
      </Route>
      <Route path="/team">
        <AppLayout>
          <ProtectedRoute path="/team" component={Team} />
        </AppLayout>
      </Route>
      <Route path="/">
        <AppLayout>
          <ProtectedRoute path="/" component={Dashboard} />
        </AppLayout>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Router />
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
