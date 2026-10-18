import { useRef } from 'react';
// 1.5 · double-tap likes (never unlikes); single tap opens full screen after 250 ms. Disabled on your own posts.
export function useDoubleTapLike({ own, like, openFull }: { own: boolean; like: () => void; openFull: () => void }) {
  const last = useRef(0); const t = useRef<ReturnType<typeof setTimeout> | null>(null);
  return () => {
    const now = Date.now();
    if (now - last.current < 250) { if (t.current) clearTimeout(t.current); last.current = 0; if (!own) like(); return; }
    last.current = now; t.current = setTimeout(openFull, 250);
  };
}
export const BURST_MS = 600; // white heart over the photo, never orange
