import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

type Theme = 'light' | 'dark' | 'system';

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  themes: { name: Theme; label: string; description: string }[];
  resolvedTheme: 'light' | 'dark';
};

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => null,
  themes: [
    { name: 'light', label: 'Light', description: 'Paper' },
    { name: 'dark', label: 'Dark', description: 'Machine room' },
    { name: 'system', label: 'System', description: 'Follow system preference' },
  ],
  resolvedTheme: 'light',
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

const LEGACY_THEMES = ['cyberpunk', 'forest', 'ocean', 'sunset', 'minimal', 'high-contrast'];

function normalizeTheme(value: string | null): Theme {
  if (value === 'light' || value === 'dark' || value === 'system') return value;
  // Legacy themes from earlier versions map to their light/dark base
  if (value === 'minimal') return 'light';
  if (value && LEGACY_THEMES.includes(value)) return 'dark';
  return 'system';
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'markdown-studio-theme',
  ...props
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? normalizeTheme(stored) : defaultTheme;
    } catch {
      return defaultTheme;
    }
  });
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  const applyTheme = useCallback((newTheme: Theme) => {
    const root = window.document.documentElement;
    const systemIsDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    // Disable transitions temporarily for instant theme switch
    root.classList.add('theme-switching');
    root.classList.remove('light', 'dark', ...LEGACY_THEMES);

    const isDark = newTheme === 'system' ? systemIsDark : newTheme === 'dark';
    setResolvedTheme(isDark ? 'dark' : 'light');

    // Browser-native surfaces (scrollbars, form controls) follow the theme
    root.style.colorScheme = isDark ? 'dark' : 'light';
    root.classList.add(isDark ? 'dark' : 'light');

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        root.classList.remove('theme-switching');
      });
    });
  }, []);

  useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  useEffect(() => {
    if (theme !== 'system') return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => applyTheme('system');
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, applyTheme]);

  const setTheme = useCallback(
    (newTheme: Theme) => {
      try {
        localStorage.setItem(storageKey, newTheme);
      } catch {
        // Storage may be unavailable; theme still applies for the session
      }
      setThemeState(newTheme);
    },
    [storageKey]
  );

  const value = {
    theme,
    setTheme,
    themes: initialState.themes,
    resolvedTheme,
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
