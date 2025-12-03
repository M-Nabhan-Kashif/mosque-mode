import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import MosqueList from "./pages/MosqueList";
import SettingsPage from "./pages/SettingsPage";
import AddMosque from "./pages/AddMosque";
import MosqueDetails from "./pages/MosqueDetails";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/mosques" element={<MosqueList />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/add-mosque" element={<AddMosque />} />
          <Route path="/mosque/:id" element={<MosqueDetails />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
