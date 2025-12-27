
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { FocusModeProvider } from "@/components/layout/FocusMode";
import { Analytics } from "@vercel/analytics/react";
import Index from "./pages/Index";

const App = () => (
  <TooltipProvider>
    <ThemeProvider defaultTheme="system">
      <FocusModeProvider>
        <Toaster />
        <Sonner />
        <Analytics />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
          </Routes>
        </BrowserRouter>
      </FocusModeProvider>
    </ThemeProvider>
  </TooltipProvider>
);

export default App;
