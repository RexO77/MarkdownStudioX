
import { useState, useEffect } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { FocusModeProvider } from "@/components/layout/FocusMode";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Analytics } from "@vercel/analytics/react";
import { WelcomeScreen, hasCompletedOnboarding } from "@/components/WelcomeScreen";
import Index from "./pages/Index";

const App = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Check onboarding status after mount to avoid hydration issues
    const completed = hasCompletedOnboarding();
    setShowOnboarding(!completed);
    setIsReady(true);
  }, []);

  if (!isReady) {
    return null; // Avoid flash while checking onboarding status
  }

  return (
    <ErrorBoundary>
      <TooltipProvider>
        <ThemeProvider defaultTheme="system">
          <FocusModeProvider>
            <Sonner />
            <Analytics />
            {showOnboarding ? (
              <WelcomeScreen onComplete={() => setShowOnboarding(false)} />
            ) : (
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                </Routes>
              </BrowserRouter>
            )}
          </FocusModeProvider>
        </ThemeProvider>
      </TooltipProvider>
    </ErrorBoundary>
  );
};

export default App;
