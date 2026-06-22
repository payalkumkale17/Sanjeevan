import { createContext, useContext, useState, ReactNode } from 'react';
import { palette, darkPalette } from '../theme';

type ThemeContextValue = {
  isDark: boolean;
  toggleTheme: () => void;
  colors: typeof palette;
};

const ThemeContext = createContext<ThemeContextValue>({
  isDark: false,
  toggleTheme: () => {},
  colors: palette,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(false);
  const toggleTheme = () => setIsDark((prev) => !prev);
  const colors = isDark ? darkPalette : palette;
  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}