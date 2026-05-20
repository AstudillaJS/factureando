import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'cyberpunk' | 'matrix' | 'minimal' | 'deep-ocean' | 'harry-potter' | 'marvel' | 'loki' | 'winamp';
type DisplayMode = 'floating' | 'topbar';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  displayMode: DisplayMode;
  setDisplayMode: (mode: DisplayMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('cyberpunk');
  const [displayMode, setDisplayMode] = useState<DisplayMode>('topbar');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, displayMode, setDisplayMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
