import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Analytics from "./pages/Analytics";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Consumer from "./pages/Consumer";
import Farmer from "./pages/Farmer";
import Collector from "./pages/Collector";
import Processor from "./pages/Processor";
import Laboratory from "./pages/Laboratory";
import Manufacturer from "./pages/Manufacturer";
import SampleData from "./pages/SampleData";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/consumer" element={<Consumer />} />
            <Route path="/farmer" element={<Farmer />} />
            <Route path="/collector" element={<Collector />} />
            <Route path="/processor" element={<Processor />} />
            <Route path="/laboratory" element={<Laboratory />} />
            <Route path="/manufacturer" element={<Manufacturer />} />
            <Route path="/demo-data" element={<SampleData />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
