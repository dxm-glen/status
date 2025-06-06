import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CyberpunkLayout } from "@/components/cyberpunk-layout";
import Home from "@/pages/home";
import Login from "@/pages/login";
import Questionnaire from "@/pages/questionnaire";
import GptAnalysis from "@/pages/gpt-analysis";
import Registration from "@/pages/registration";
import Dashboard from "@/pages/dashboard";
import Quests from "@/pages/quests";
import Achievements from "@/pages/achievements";
import Profile from "@/pages/profile";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <CyberpunkLayout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/login" component={Login} />
        <Route path="/questionnaire" component={Questionnaire} />
        <Route path="/gpt-analysis" component={GptAnalysis} />
        <Route path="/registration" component={Registration} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/quests" component={Quests} />
        <Route path="/achievements" component={Achievements} />
        <Route path="/profile" component={Profile} />
        <Route component={NotFound} />
      </Switch>
    </CyberpunkLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-background text-foreground">
          <Toaster />
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
