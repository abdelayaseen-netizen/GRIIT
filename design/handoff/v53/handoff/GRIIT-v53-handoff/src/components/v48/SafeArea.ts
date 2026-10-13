// v48 Part 2.2. Measured on 393 × 852 (iPhone 15/16 class). Use useSafeAreaInsets() at runtime;
// these are the design minimums the atlas draws and the floor if insets report 0.
export const SAFE = {
  top: 59,            // status bar 54 + 5; Dynamic Island 125 × 37 at y 11
  bottom: 34,         // home indicator
  tabBar: 49,         // tab bar height above the home indicator
  tabTotal: 83,       // 49 + 34
  gutter: 16,
  stickyGap: 12,      // sticky button sits 12pt above the bottom inset
  toastBottom: 95,    // 83 + 12 on tab screens
  scrollEndClearance: 83 + 16, // last content on a tab screen ends 16pt above the bar
  sheetTopMin: 59 + 12,
} as const;
// Rules: nothing tappable or textual inside top/bottom insets. On tab screens the primary lives in
// content (StreakStrip), never pinned over the tab bar. Sticky buttons only where the tab bar is hidden.
