
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

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
  resolvedTheme: 'light' | 'dark'; // Actual light/dark value
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
  resolvedTheme: 'light',
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

// Helper to determine if a theme is "dark" based
function isDarkTheme(theme: Theme, systemIsDark: boolean): boolean {
  if (theme === 'system') return systemIsDark;
  if (theme === 'light' || theme === 'minimal') return false;
  return true; // dark, cyberpunk, forest, ocean, sunset, high-contrast are dark
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'markdown-studio-theme',
  ...props
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  const applyTheme = useCallback((newTheme: Theme) => {
    const root = window.document.documentElement;
    const systemIsDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    // Disable transitions temporarily for instant theme switch
    root.style.setProperty('--theme-transition', 'none');
    root.classList.add('theme-switching');

    // Remove all theme classes
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

    // Determine resolved theme
    const isDark = isDarkTheme(newTheme, systemIsDark);
    setResolvedTheme(isDark ? 'dark' : 'light');

    // Set color-scheme for browser-native elements (scrollbars, form controls)
    root.style.colorScheme = isDark ? 'dark' : 'light';

    if (newTheme === 'system') {
      root.classList.add(systemIsDark ? 'dark' : 'light');
    } else {
      root.classList.add(newTheme);
    }

    // Re-enable transitions after a frame
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        root.style.removeProperty('--theme-transition');
        root.classList.remove('theme-switching');
      });
    });
  }, []);

  useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  // Listen for system theme changes when using system theme
  useEffect(() => {
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

      const handleChange = () => {
        applyTheme('system');
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme, applyTheme]);

  const setTheme = useCallback((newTheme: Theme) => {
    localStorage.setItem(storageKey, newTheme);
    setThemeState(newTheme);
  }, [storageKey]);

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

