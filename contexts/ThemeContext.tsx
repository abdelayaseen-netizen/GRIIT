import React, { createContext, useContext, useMemo } from "react";
import { useColorScheme } from "react-native";
import { LIGHT_THEME, DARK_THEME, type ThemeColors } from "@/lib/theme-palettes";

type ThemeContextValue = {
  colors: ThemeColors;
  colorScheme: "light" | "dark";
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

/** Serves light or dark theme based on system preference (useColorScheme). Foundation only; screens can adopt dark tokens gradually. */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const colorScheme = systemScheme === "dark" ? "dark" : "light";
  const colors = colorScheme === "dark" ? DARK_THEME : LIGHT_THEME;
  const value = useMemo<ThemeContextValue>(() => ({ colors, colorScheme }), [colorScheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (ctx === undefined) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}
