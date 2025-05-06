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
  // Add event listener to handle Gemini API key from environment variable
  useEffect(() => {
    // This is a client-side check only - the actual key will be used server-side
    if (!import.meta.env.VITE_GEMINI_API_KEY) {
      console.warn('No Gemini API key found in environment variables');
    }
  }, []);

  return (
    <>
      <Router />
      <Toaster />
    </>
  );
}

export default App;
