/**
 * Last share colour per style. Device local storage only.
 * A failed read or write leaves the default (Ink) or the in-memory pick.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  SHARE_COLOURS,
  colourForStyle,
  rememberColour,
  type ColourMemory,
  type ShareColourId,
  type ShareStyleId,
} from "@/lib/share-image";

export const SHARE_COLOUR_KEY = "griit.shareColour.v1";

const STYLES: readonly ShareStyleId[] = ["A", "B", "C", "D", "E", "F", "G"];

type ColourStore = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
};

export function parseShareColours(raw: string | null): ColourMemory {
  if (!raw) return {};
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return {};
  }
  if (!parsed || typeof parsed !== "object") return {};
  const memory: ColourMemory = {};
  for (const style of STYLES) {
    const value = (parsed as Record<string, unknown>)[style];
    if (typeof value === "string" && (SHARE_COLOURS as readonly string[]).includes(value)) {
      memory[style] = value as ShareColourId;
    }
  }
  return memory;
}

export async function readShareColours(store: ColourStore = AsyncStorage): Promise<ColourMemory> {
  try {
    return parseShareColours(await store.getItem(SHARE_COLOUR_KEY));
  } catch {
    return {};
  }
}

export async function writeShareColour(
  memory: ColourMemory,
  style: ShareStyleId,
  colour: ShareColourId,
  store: ColourStore = AsyncStorage,
): Promise<ColourMemory> {
  const next = rememberColour(memory, style, colour);
  try {
    await store.setItem(SHARE_COLOUR_KEY, JSON.stringify(next));
  } catch {
    /* the sheet still uses `next` for this session */
  }
  return next;
}

export function colourOrInk(memory: ColourMemory, style: ShareStyleId): ShareColourId {
  return colourForStyle(memory, style);
}
