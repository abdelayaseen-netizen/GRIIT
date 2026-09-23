import React from 'react';
import { color, type, radius, space } from '../tokens';

// Every state a day can be in. The GLYPH carries the state; colour only reinforces it, so
// the grid survives greyscale and colour-blind readers (WCAG 1.4.1).
export type DayState =
  | 'camera'      // secured, at least one camera proof
  | 'self'        // secured, all self-reported
  | 'freeze'      // held by a freeze. NOT a secured day
  | 'laststand'   // held by a Last Stand. NOT a secured day
  | 'missed'
  | 'today'       // open
  | 'notdue'      // enrolled later, or challenge had not started
  | 'beforejoin'; // nothing to say

const GLYPH: Record<DayState, { icon?: string; fill?: string; border?: string; dot?: boolean }> = {
  camera:     { icon: 'check', fill: color.brand },
  self:       { dot: true, fill: color.brandTint, border: color.brand },
  freeze:     { icon: 'snowflake', fill: color.surface, border: color.border },
  laststand:  { icon: 'shield', fill: color.surface, border: color.brand },
  missed:     { border: color.border },          // plus a centred dash
  today:      { border: color.brand },           // dashed
  notdue:     {},                                // 3pt dot
  beforejoin: {},                                // empty cell
};

export const LEGEND: Array<[DayState, string]> = [
  ['camera', 'Camera proof'],
  ['self', 'Self-reported'],
  ['freeze', 'Freeze held it'],
  ['laststand', 'Last Stand held it'],
  ['missed', 'Missed'],
  ['today', 'Open, today'],
  ['notdue', 'Not due yet'],   // render its swatch with legend={true}
];

export function DayCell({ state, size = 30, legend = false }: { state: DayState; size?: number; legend?: boolean }) {
  const g = GLYPH[state];
  const base: React.CSSProperties = {
    width: size, height: size, borderRadius: 6, flex: 'none',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: g.fill ?? 'transparent',
    border: g.border ? `${state === 'laststand' ? 1.5 : 1}px ${state === 'today' ? 'dashed' : 'solid'} ${g.border}` : undefined,
  };
  return (
    <div style={base} aria-hidden="true">
      {g.icon ? <i data-lucide={g.icon} style={{ width: size * 0.47, height: size * 0.47, color: state === 'camera' ? color.canvas : state === 'laststand' ? color.brandText : color.textPrimary }} /> : null}
      {g.dot ? <div style={{ width: Math.round(size * 0.2), height: Math.round(size * 0.2), borderRadius: radius.pill, background: color.brandText }} /> : null}
      {state === 'missed' ? <div style={{ width: Math.round(size * 0.36), height: 1.5, background: color.textSecondary }} /> : null}
      {/* In the grid this dot is deliberately quiet. In the LEGEND it must be readable, so
          the legend renders at legendTone — color.border there is 1.36:1 on canvas and the
          legend's whole job is to be matchable. */}
      {state === 'notdue' ? <div style={{ width: 3, height: 3, borderRadius: radius.pill, background: legend ? color.textSecondary : color.border }} /> : null}
    </div>
  );
}

// Weekday-aligned, Monday first. NOT a year heatmap: GRIIT day states are categorical, and
// a heatmap's only channel is intensity, which can rank but cannot name. See the research
// page in README.md.
export function MonthGrid({ days, leadingBlanks }: { days: DayState[]; leadingBlanks: number }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 6, justifyItems: 'center' }}>
      {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
        <div key={i} style={{ ...type.label, letterSpacing: 'normal', textTransform: 'none', color: color.textSecondary }}>{d}</div>
      ))}
      {Array.from({ length: leadingBlanks }, (_, i) => <DayCell key={`b${i}`} state="beforejoin" />)}
      {days.map((s, i) => <DayCell key={i} state={s} />)}
    </div>
  );
}

export function ConsistencyHeadline({ secured, elapsed, joinedLabel }: { secured: number; elapsed: number; joinedLabel: string }) {
  return (
    <>
      <div style={{ padding: `${space.lg}px ${space.gutter}px 0`, display: 'flex', alignItems: 'flex-end', gap: 9 }}>
        {/* The one earned number on this screen, so the one display-face number. */}
        <div style={{ fontFamily: "'Barlow Condensed','SF Pro Display',sans-serif", fontSize: 58, lineHeight: '52px', fontWeight: '600', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.01em', color: color.textPrimary }}>{secured}</div>
        <div style={{ ...type.secondary, color: color.textSecondary, paddingBottom: 9 }}>of {elapsed} days secured</div>
      </div>
      {/* The denominator is never left implied. "3 of 6 days" with no definition was the bug. */}
      <div style={{ padding: `8px ${space.gutter}px 0`, ...type.caption, color: color.textSecondary }}>
        Every day since you joined on {joinedLabel}, not counting today.
      </div>
    </>
  );
}
