import { useState, useEffect, lazy, Suspense } from "react";
import { MotionConfig } from "framer-motion";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Analytics } from "@vercel/analytics/react";
import { WelcomeScreen, hasCompletedOnboarding } from "@/components/WelcomeScreen";
import { applyTypography } from "@/lib/typography";
import Index from "./pages/Index";

// Prototype route — the WASM TeX engine only loads when /latex is visited.
const LatexLab = lazy(() => import("./pages/LatexLab"));

const App = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    applyTypography();
    const completed = hasCompletedOnboarding();
    setShowOnboarding(!completed);
    setIsReady(true);
  }, []);

  if (!isReady) {
    return null; // Avoid flash while checking onboarding status
  }

  return (
    <ErrorBoundary>
      <MotionConfig reducedMotion="user">
      <TooltipProvider delayDuration={300}>
        <ThemeProvider defaultTheme="system">
          <Sonner />
          <Analytics />
          {showOnboarding ? (
            <WelcomeScreen onComplete={() => setShowOnboarding(false)} />
          ) : (
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route
                  path="/latex"
                  element={
                    <Suspense fallback={null}>
                      <LatexLab />
                    </Suspense>
                  }
                />
              </Routes>
            </BrowserRouter>
          )}
        </ThemeProvider>
      </TooltipProvider>
      </MotionConfig>
    </ErrorBoundary>
  );
};

export default App;
