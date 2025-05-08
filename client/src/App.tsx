import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import ApplicationPage from "@/pages/app";
import { useEffect } from "react";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/app" component={ApplicationPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Remove client-side check for API keys as they are handled server-side only
  useEffect(() => {
    // The API keys are properly configured on the server side
    // No need to check them on the client side anymore
  }, []);

  return (
    <>
      <Router />
      <Toaster />
    </>
  );
}

export default App;
