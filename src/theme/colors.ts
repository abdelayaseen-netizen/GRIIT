/**
 * Single source of truth for app colors. Match Rork reference.
 * Only theme files may contain hex codes; screens use these tokens.
 */
export const colors = {
  bg: "#F7F4EF",
  surface: "#FFFFFF",
  surfaceMuted: "#F3F1EC",
  text: "#0B0B0F",
  textMuted: "#6B6B73",
  textSubtle: "#9A9AA3",
  border: "#E7E3DC",
  borderStrong: "#0B0B0F",
  shadow: "rgba(0,0,0,0.10)",

  accent: "#E97B4E",
  accentSoft: "#F7D2C3",
  success: "#27B35B",
  successSoft: "#DDF6E8",
  danger: "#D94343",
  dangerSoft: "#FADADA",

  blackBtn: "#0B0B0F",
  white: "#FFFFFF",

  // Legacy compatibility (map to new names where used)
  background: "#F7F4EF",
  card: "#FFFFFF",
  accentLight: "#F7D2C3",
} as const;

export type Colors = typeof colors;
