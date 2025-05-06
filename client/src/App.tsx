import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import { useEffect } from "react";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
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
