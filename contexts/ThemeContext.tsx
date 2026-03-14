import React, { createContext, useContext, useMemo } from "react";
import { LIGHT_THEME, type ThemeColors } from "@/lib/theme-palettes";

type ThemeContextValue = {
  colors: ThemeColors;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

/** Light theme only. No dark mode, no toggling. */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const value = useMemo<ThemeContextValue>(() => ({ colors: LIGHT_THEME }), []);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (ctx === undefined) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}
