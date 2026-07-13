import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'cyberpunk' | 'matrix' | 'minimal' | 'deep-ocean' | 'harry-potter' | 'marvel' | 'loki' | 'winamp' | 'light' | 'brand';
type DisplayMode = 'floating' | 'topbar';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  displayMode: DisplayMode;
  setDisplayMode: (mode: DisplayMode) => void;
  themeColor: string | null;
  setThemeColor: (color: string | null) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('cyberpunk');
  const [displayMode, setDisplayMode] = useState<DisplayMode>('topbar');
  const [themeColor, setThemeColorState] = useState<string | null>(null);

  const setThemeColor = (color: string | null) => {
    setThemeColorState(color);
    if (color && theme === 'brand') {
      document.documentElement.style.setProperty('--primary', color);
      document.documentElement.style.setProperty('--primary-dark', color + 'cc');
    }
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    if (newTheme === 'brand' && themeColor) {
      document.documentElement.style.setProperty('--primary', themeColor);
      document.documentElement.style.setProperty('--primary-dark', themeColor + 'cc');
    } else {
      document.documentElement.style.removeProperty('--primary');
      document.documentElement.style.removeProperty('--primary-dark');
    }
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    // Load config on mount to fetch themeColor and theme preference
    fetch("/api/config")
      .then(res => res.json())
      .then(data => {
        if (data.themeColor) {
          setThemeColorState(data.themeColor);
        }
        if (data.theme) {
          setThemeState(data.theme);
          if (data.theme === 'brand' && data.themeColor) {
            document.documentElement.style.setProperty('--primary', data.themeColor);
            document.documentElement.style.setProperty('--primary-dark', data.themeColor + 'cc');
          }
        }
      })
      .catch(console.error);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, displayMode, setDisplayMode, themeColor, setThemeColor }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
