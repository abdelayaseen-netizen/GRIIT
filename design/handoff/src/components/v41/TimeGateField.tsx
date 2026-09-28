import React from 'react';
import { color, type, radius, border, hit } from '../../tokens';

// Frame 115. Times are never typed. The field opens the native iOS wheel
// (@react-native-community/datetimepicker, mode="time", display="spinner") inside ds/Sheet.
// Display: 12-hour with am/pm. Storage: "HH:MM", 24-hour, member's profile timezone.

export type TimeGate =
  | { kind: 'by'; gate_time_end: string }                               // default "07:00"
  | { kind: 'between'; gate_time_start: string; gate_time_end: string }; // default "05:00" – "06:30"

export const DEFAULT_BY: TimeGate = { kind: 'by', gate_time_end: '07:00' };
export const DEFAULT_BETWEEN: TimeGate = { kind: 'between', gate_time_start: '05:00', gate_time_end: '06:30' };

const toMin = (hhmm: string) => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; };

// "07:00" → "7:00 am", "18:30" → "6:30 pm", "00:00" → "12:00 am"
export function fmt12(hhmm: string) {
  const [h, m] = hhmm.split(':').map(Number);
  const ap = h < 12 ? 'am' : 'pm';
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${hh}:${String(m).padStart(2, '0')} ${ap}`;
}

// "5:00–6:30 am" when both share am/pm, else "11:00 am–1:00 pm"
export function fmtWindow(a: string, b: string) {
  const A = fmt12(a), B = fmt12(b);
  return A.slice(-2) === B.slice(-2) ? `${A.slice(0, -3)}–${B}` : `${A}–${B}`;
}

// The gate line the preview row, Home, detail and feed all read.
export function timeGateLabel(g: TimeGate) {
  return g.kind === 'by' ? `By ${fmt12(g.gate_time_end)}` : fmtWindow(g.gate_time_start, g.gate_time_end);
}

// Same-day window only: the end must be strictly after the start. No crossing midnight.
export function validate(g: TimeGate): string | null {
  if (g.kind === 'between' && toMin(g.gate_time_end) <= toMin(g.gate_time_start)) {
    return `End has to be after ${fmt12(g.gate_time_start)}. The window can't cross midnight.`;
  }
  return null;
}

export function durationLine(g: TimeGate) {
  if (g.kind === 'by') return `Counts from midnight until ${fmt12(g.gate_time_end)}, your time.`;
  const d = toMin(g.gate_time_end) - toMin(g.gate_time_start);
  const h = Math.floor(d / 60), m = d % 60;
  const parts = [h ? `${h} ${h === 1 ? 'hour' : 'hours'}` : '', m ? `${m} ${m === 1 ? 'minute' : 'minutes'}` : ''].filter(Boolean).join(' ');
  return `Today, ${fmt12(g.gate_time_start)} to ${fmt12(g.gate_time_end)}, your time. ${parts}.`;
}

export function TimeField({ label, value, invalid, active, onPress }: { label: 'By' | 'From' | 'To'; value: string; invalid?: boolean; active?: boolean; onPress: () => void }) {
  return (
    <div onClick={onPress} accessibilityRole="button" accessibilityLabel={`${label}, ${fmt12(value)}`} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
      <div style={{ ...type.label, color: color.textSecondary }}>{label}</div>
      <div style={{ minHeight: hit + 2, borderRadius: radius.input, background: color.surface, border: invalid ? `1.5px solid ${color.danger}` : active ? `1.5px solid ${color.brand}` : border, padding: '0 14px', display: 'flex', alignItems: 'center' }}>
        <div style={{ ...type.body, color: color.textPrimary, fontVariantNumeric: 'tabular-nums' }}>{fmt12(value)}</div>
      </div>
    </div>
  );
}
