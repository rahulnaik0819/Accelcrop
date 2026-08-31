import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

export type AppTheme = 'day' | 'night';

interface ThemeContextType {
  theme: AppTheme;
  isNight: boolean;
  isDark: boolean; // Alias for isNight
  toggleTheme: () => void;
  setTheme: (theme: AppTheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<AppTheme>(() => {
    const saved = localStorage.getItem('agrivision_theme_mode');
    if (saved === 'night' || saved === 'day') return saved;
    // Fallback check legacy
    const legacy = localStorage.getItem('agrivision_theme');
    if (legacy === 'dark') return 'night';
    if (legacy === 'light') return 'day';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'night' : 'day';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'night') {
      root.classList.add('dark');
      root.classList.add('theme-night');
      root.classList.remove('theme-day');
    } else {
      root.classList.remove('dark');
      root.classList.add('theme-day');
      root.classList.remove('theme-night');
    }
    localStorage.setItem('agrivision_theme_mode', theme);
    localStorage.setItem('agrivision_theme', theme === 'night' ? 'dark' : 'light');
  }, [theme]);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'night' ? 'day' : 'night'));
  };

  const setTheme = (t: AppTheme) => {
    setThemeState(t);
  };

  const isNight = theme === 'night';

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isNight,
        isDark: isNight,
        toggleTheme,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
