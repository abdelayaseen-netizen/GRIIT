/**
 * Build 92 12b.1: a sheet with a text field must never close while its keyboard is up. With the
 * keyboard open, a tap outside or a swipe down only drops the keyboard; the next one closes.
 */
export type SheetOutsideAction = "dismiss-keyboard" | "close";

export function sheetOutsideAction(keyboardOpen: boolean, avoidKeyboard: boolean): SheetOutsideAction {
  return avoidKeyboard && keyboardOpen ? "dismiss-keyboard" : "close";
}

/**
 * How far to lift the sheet so its last control sits `gap` above the keyboard. The sheet already
 * pads its bottom by `bottomPad` (the home-indicator inset), which the keyboard now covers.
 */
export function sheetKeyboardLift(keyboardHeight: number, bottomPad: number, gap: number): number {
  if (keyboardHeight <= 0) return 0;
  return Math.max(0, keyboardHeight - bottomPad + gap);
}
