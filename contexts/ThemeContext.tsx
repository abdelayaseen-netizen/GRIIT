import React, { createContext, useContext, useMemo } from "react";
import { LIGHT_THEME, type ThemeColors } from "@/lib/theme-palettes";

type ThemeContextValue = {
  colors: ThemeColors;
  colorScheme: "light";
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

/** GRIIT is always light mode (warm cream). No dark mode. */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const value = useMemo<ThemeContextValue>(
    () => ({ colors: LIGHT_THEME, colorScheme: "light" }),
    []
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (ctx === undefined) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}
