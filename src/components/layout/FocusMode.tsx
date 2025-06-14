
import React, { createContext, useContext, useState } from 'react';
import { cn } from '@/lib/utils';

type FocusMode = 'default' | 'zen' | 'distraction-free' | 'presentation';

interface FocusModeContextType {
  mode: FocusMode;
  setMode: (mode: FocusMode) => void;
  isZenMode: boolean;
  isDistractionFree: boolean;
  isPresentationMode: boolean;
}

const FocusModeContext = createContext<FocusModeContextType | undefined>(undefined);

export function FocusModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<FocusMode>('default');

  const value = {
    mode,
    setMode,
    isZenMode: mode === 'zen',
    isDistractionFree: mode === 'distraction-free',
    isPresentationMode: mode === 'presentation',
  };

  return (
    <FocusModeContext.Provider value={value}>
      <div className={cn(
        'transition-all duration-500 ease-in-out',
        mode === 'zen' && 'zen-mode',
        mode === 'distraction-free' && 'distraction-free-mode',
        mode === 'presentation' && 'presentation-mode'
      )}>
        {children}
      </div>
    </FocusModeContext.Provider>
  );
}

export function useFocusMode() {
  const context = useContext(FocusModeContext);
  if (!context) {
    throw new Error('useFocusMode must be used within a FocusModeProvider');
  }
  return context;
}
