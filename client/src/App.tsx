import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import TimeEntries from "@/pages/TimeEntries";
import Reports from "@/pages/Reports";
import Clients from "@/pages/Clients";
import Projects from "@/pages/Projects";
import Team from "@/pages/Team";
import AppLayout from "@/layout/AppLayout";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/time-entries" component={TimeEntries} />
      <Route path="/reports" component={Reports} />
      <Route path="/clients" component={Clients} />
      <Route path="/projects" component={Projects} />
      <Route path="/team" component={Team} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AppLayout>
          <Router />
        </AppLayout>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
