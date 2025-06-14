
import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system' | 'cyberpunk' | 'forest' | 'ocean' | 'sunset' | 'minimal' | 'high-contrast';

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  themes: { name: Theme; label: string; description: string }[];
};

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => null,
  themes: [
    { name: 'light', label: 'Light', description: 'Clean and bright interface' },
    { name: 'dark', label: 'Dark', description: 'Easy on the eyes' },
    { name: 'system', label: 'System', description: 'Follow system preference' },
    { name: 'cyberpunk', label: 'Cyberpunk', description: 'Neon-inspired design' },
    { name: 'forest', label: 'Forest', description: 'Nature-inspired greens' },
    { name: 'ocean', label: 'Ocean', description: 'Deep blue tranquility' },
    { name: 'sunset', label: 'Sunset', description: 'Warm orange gradients' },
    { name: 'minimal', label: 'Minimal', description: 'Ultra-clean interface' },
    { name: 'high-contrast', label: 'High Contrast', description: 'Accessibility-focused' },
  ],
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'markdown-studio-theme',
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove(
      'light',
      'dark',
      'cyberpunk',
      'forest',
      'ocean',
      'sunset',
      'minimal',
      'high-contrast'
    );

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
        .matches
        ? 'dark'
        : 'light';

      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
    themes: initialState.themes,
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider');

  return context;
};
