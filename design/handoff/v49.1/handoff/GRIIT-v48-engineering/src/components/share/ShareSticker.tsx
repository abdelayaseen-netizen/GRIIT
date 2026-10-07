import React from 'react';
import { color, displayFace, displayWeight } from '../../tokens';
import { BadgeStamp, BADGES } from '../BadgeStamp';

// v37.1. Transparent PNG stickers for Instagram Stories, rendered off-screen at 3x with
// react-native-view-shot. Every value comes from the record.
//
// SIZE: sticker is 300pt, exported 900px, placed at 810px in a 1080px story (1pt = 2.7px).
// On a 393pt phone the story shows at 0.364, so the sticker reads at ~0.98x design size.
// Minimums: display 64pt, secondary 18-20pt, mark and "Secured." 16pt, wordmark 15pt,
// eyebrow 13pt. Nothing under 13pt.

export type StickerBackground = 'clear' | 'card' | 'photo';
export type ProofKind = 'camera' | 'camera_place' | 'self';

// NEW TOKEN — stickerShadow. Not in tokens.dense.ts. Two stacked 2px ink rings (a dense
// outline for small type on near-white), a 3px contact shadow, a 16px soft scrim.
export const stickerShadow = {
  text: '0 0 2px rgba(15,15,15,0.9), 0 0 2px rgba(15,15,15,0.9), 0 1px 3px rgba(15,15,15,0.55), 0 4px 16px rgba(15,15,15,0.3)',
  glyph: 'drop-shadow(0 0 1px rgba(15,15,15,0.9)) drop-shadow(0 1px 2px rgba(15,15,15,0.6)) drop-shadow(0 4px 12px rgba(15,15,15,0.25))',
  track: '0 0 0 1px rgba(15,15,15,0.55), 0 2px 8px rgba(15,15,15,0.3)',
};

const DISPLAY = displayFace;
// SF Pro Display Heavy is wider than the old condensed face. Measured on the 260pt line in
// frame 113: "Day 67 of 75" at 64 fills 260/260, at 58 uses 241; "Day 100 of 100" at 46 uses 244.
export function fitNumeral(n: number) { return n >= 100 ? 46 : n >= 10 ? 58 : 64; }
const W = 300;
const on = (bg: StickerBackground) => bg !== 'card';
const ts = (bg: StickerBackground) => (on(bg) ? { textShadow: stickerShadow.text } : {});
const soft = (bg: StickerBackground) => (on(bg) ? color.textPrimary : color.textSecondary);
const shell = (bg: StickerBackground, gap = 12): React.CSSProperties => ({
  width: W, padding: 20, display: 'flex', flexDirection: 'column', gap,
  ...(bg === 'card' ? { background: color.canvas, border: `1px solid ${color.border}`, borderRadius: 20 } : {}),
});

/** Brand bar + letterspaced wordmark. Recognisable at story size, smaller than every number. */
export function Wordmark({ bg }: { bg: StickerBackground }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ width: 4, height: 15, borderRadius: 1, background: color.brand, filter: on(bg) ? stickerShadow.glyph : undefined }} />
      <div style={{ fontSize: 15, lineHeight: '16px', fontWeight: '500', letterSpacing: '0.2em', color: color.textPrimary, ...ts(bg) }}>GRIIT</div>
    </div>
  );
}

function Eyebrow({ bg, children }: { bg: StickerBackground; children: React.ReactNode }) {
  return <div style={{ fontSize: 13, lineHeight: '16px', fontWeight: '500', letterSpacing: '0.08em', textTransform: 'uppercase', color: soft(bg), ...ts(bg) }}>{children}</div>;
}

function Proof({ bg, proof, suffix }: { bg: StickerBackground; proof: ProofKind; suffix?: string }) {
  if (proof === 'self') return <div style={{ fontSize: 16, lineHeight: '20px', color: soft(bg), ...ts(bg) }}>Self-reported</div>;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
      <div style={{ width: 18, height: 18, borderRadius: 999, background: color.brand, display: 'flex', alignItems: 'center', justifyContent: 'center', filter: on(bg) ? stickerShadow.glyph : undefined }}>
        <i data-lucide="check" style={{ width: 12, height: 12, color: color.canvas }} />
      </div>
      <div style={{ fontSize: 16, lineHeight: '20px', fontWeight: '500', color: on(bg) ? color.textPrimary : color.brandText, ...ts(bg) }}>
        {proof === 'camera' ? 'Camera' : 'Camera · Place'}{suffix}
      </div>
    </div>
  );
}

/** (a) Signature: the challenge's progress bar, calendar position day/N. Only for a secured day. */
export function DaySticker(p: { bg: StickerBackground; challenge: string; day: number; durationDays: number; proof: ProofKind }) {
  const n = Math.min(p.day, p.durationDays);
  // Never wraps. SF Pro Display Heavy is wider than the old condensed face: the numeral
  // shrinks to fit the 260pt line (fitNumeral), it never wraps and "of {N}" never detaches.
  // worst case "Day 365 of 365" ~249pt. Longer durations must shrink the numeral, not wrap.
  return (
    <div style={shell(p.bg)}>
      <Eyebrow bg={p.bg}>{p.challenge}</Eyebrow>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'nowrap', whiteSpace: 'nowrap' }}>
        <div style={{ fontFamily: DISPLAY, fontSize: fitNumeral(n), lineHeight: '56px', fontWeight: displayWeight, letterSpacing: -1, color: color.textPrimary, ...ts(p.bg) }}>Day {n}</div>
        <div style={{ fontSize: 20, lineHeight: '24px', color: soft(p.bg), ...ts(p.bg) }}>of {p.durationDays}</div>
      </div>
      <div style={{ height: 8, borderRadius: 4, overflow: 'hidden', background: on(p.bg) ? 'rgba(245,243,238,0.35)' : color.border, boxShadow: on(p.bg) ? stickerShadow.track : undefined }}>
        <div style={{ width: `${(n / p.durationDays) * 100}%`, height: '100%', background: color.brand }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ fontSize: 16, lineHeight: '20px', fontWeight: '500', color: color.textPrimary, ...ts(p.bg) }}>Secured.</div>
          <Proof bg={p.bg} proof={p.proof} />
        </div>
        <Wordmark bg={p.bg} />
      </div>
    </div>
  );
}

/**
 * (b) Signature: the last 28 closed days, two states only — secured or not. 4 x 7, always
 * full, so no orphan cells. Held days render as not secured. Today is never on it unless
 * secured (then it is the last cell). With fewer than 28 closed days: one row of N cells.
 */
export function ConsistencySticker(p: { bg: StickerBackground; secured: number; closed: number; cameraSecured: number; last28: boolean[] }) {
  const cells = p.last28.slice(-28);
  const cols = cells.length >= 28 ? 7 : cells.length;
  const suffix = p.cameraSecured === p.secured ? `, all ${p.secured}` : `, ${p.cameraSecured} of ${p.secured}`;
  return (
    <div style={shell(p.bg)}>
      <Eyebrow bg={p.bg}>Consistency</Eyebrow>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <div style={{ fontFamily: DISPLAY, fontSize: 64, lineHeight: '56px', fontWeight: displayWeight, color: color.textPrimary, ...ts(p.bg) }}>{p.secured}</div>
        <div style={{ fontSize: 18, lineHeight: '22px', color: soft(p.bg), ...ts(p.bg) }}>of {p.closed} days secured</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 6 }}>
        {cells.map((s, i) => (
          <div key={i} style={{
            aspectRatio: '1', borderRadius: 6, filter: on(p.bg) ? stickerShadow.glyph : undefined,
            ...(s ? { background: color.brand } : { border: `1.5px solid ${on(p.bg) ? color.textPrimary : color.border}` }),
          }} />
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 2 }}>
        {p.cameraSecured > 0
          ? <Proof bg={p.bg} proof="camera" suffix={suffix} />
          : <div style={{ fontSize: 16, lineHeight: '20px', color: soft(p.bg), ...ts(p.bg) }}>All self-reported</div>}
        <Wordmark bg={p.bg} />
      </div>
    </div>
  );
}

/** (c) Signature: the stamp, 132pt. Earned badges only. */
export function BadgeSticker(p: { bg: StickerBackground; count: number; secured: number; byCamera: number; earnedOn: string }) {
  const name = BADGES.find(b => b.count === p.count)?.name ?? '';
  return (
    <div style={{ ...shell(p.bg, 14), alignItems: 'center' }}>
      <BadgeStamp count={p.count} earned size={132} onPhoto={on(p.bg)} />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, textAlign: 'center' }}>
        <div style={{ fontSize: 24, lineHeight: '29px', fontWeight: '500', color: color.textPrimary, ...ts(p.bg) }}>{name} secured {p.count === 1 ? 'day' : 'days'}</div>
        <div style={{ fontSize: 16, lineHeight: '20px', color: soft(p.bg), ...ts(p.bg) }}>{p.secured} secured · {p.byCamera} by camera</div>
        <div style={{ fontSize: 15, lineHeight: '20px', color: soft(p.bg), ...ts(p.bg) }}>Earned {p.earnedOn}</div>
      </div>
      <Wordmark bg={p.bg} />
    </div>
  );
}
