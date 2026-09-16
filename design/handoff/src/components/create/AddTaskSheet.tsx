import React from 'react';
import { color, type, space, radius, border, hit } from '../../tokens';
import { Button, Chip } from '../Primitives';

export const PROOF_TYPES = [
  { id: 'check', label: 'Check off', description: 'Tap to confirm the task is done, with no proof attached.' },
  { id: 'photo', label: 'Photo', description: 'A photo taken in the app completes the day.' },
  { id: 'timer', label: 'Timer', description: 'A countdown runs in the app and the day counts when it reaches zero.' },
  { id: 'text', label: 'Text', description: 'A short written note completes the day.' },
  { id: 'run', label: 'Run', description: 'Run records distance and time from the phone, and the day counts only when both are recorded.' },
  { id: 'counter', label: 'Counter', description: 'Count up to a daily target and the day counts when the target is met.' },
] as const;

export function AddTaskSheet({ name, typeId, verified, showMore, onName, onType, onVerified, onShowMore, onCancel, onSave, icons }: {
  name: string; typeId: string; verified: boolean; showMore: boolean;
  onName: (v: string) => void; onType: (id: string) => void; onVerified: (v: boolean) => void;
  onShowMore: () => void; onCancel: () => void; onSave: () => void;
  icons: Record<string, React.ReactNode>;
}) {
  const valid = name.trim().length > 0;
  const selected = PROOF_TYPES.find(t => t.id === typeId);
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: 140, bottom: 0, background: color.surface, borderTopLeftRadius: radius.card, borderTopRightRadius: radius.card, borderTop: border }}>
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: space.sm }}>
        <div style={{ width: 36, height: 4, borderRadius: radius.input, background: color.border }} />
      </div>
      <div style={{ height: hit, paddingInline: space.gutter, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div onClick={onCancel} style={{ height: hit, display: 'flex', alignItems: 'center', ...type.bodyStrong, color: color.brandText }}>Cancel</div>
        <div style={type.bodyStrong}>Add task</div>
        <div onClick={valid ? onSave : undefined} style={{ height: hit, display: 'flex', alignItems: 'center', ...type.bodyStrong, color: valid ? color.brandText : color.textSecondary }}>Save</div>
      </div>
      <div style={{ padding: `${space.gutter}px ${space.gutter}px 0`, display: 'flex', flexDirection: 'column', gap: space.md }}>
        <div style={type.heading}>Task name</div>
        <div style={{ background: color.canvas, border, borderRadius: radius.input, padding: space.lg }}>
          <input value={name} onChange={e => onName(e.target.value)} placeholder="Morning run, Read 10 pages"
            style={{ ...type.body, color: color.textPrimary, background: 'transparent', border: 'none', outline: 'none', width: '100%' }} />
        </div>
      </div>
      <div style={{ padding: `${space.section}px ${space.gutter}px 0`, display: 'flex', flexDirection: 'column', gap: space.md }}>
        <div style={type.heading}>Proof type</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: space.sm }}>
          {PROOF_TYPES.slice(0, showMore ? PROOF_TYPES.length : 6).map(t => (
            <Chip key={t.id} label={t.label} selected={t.id === typeId} onPress={() => onType(t.id)} />
          ))}
        </div>
        {/* One full sentence, only for the selected type. Nothing truncates. */}
        <div style={{ ...type.secondary, color: color.textSecondary }}>{selected?.description}</div>
        {!showMore ? <Button label="4 more types" variant="tertiary" size="small" onPress={onShowMore} /> : null}
      </div>
      <div style={{ padding: `${space.gutter}px ${space.gutter}px 0`, display: 'flex', alignItems: 'flex-start', gap: space.lg, minHeight: hit }}>
        {icons.verified}
        <div style={{ flex: 1 }}>
          <div style={type.bodyStrong}>Verified proof</div>
          <div style={{ ...type.secondary, color: color.textSecondary }}>Requires a photo taken in the app to complete this task each day.</div>
        </div>
        <div onClick={() => onVerified(!verified)} style={{ width: 52, height: 32, borderRadius: radius.pill, background: verified ? color.brand : color.border, display: 'flex', alignItems: 'center', justifyContent: verified ? 'flex-end' : 'flex-start', padding: 2 }}>
          <div style={{ width: 28, height: 28, borderRadius: radius.pill, background: color.textPrimary }} />
        </div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: `${space.gutter}px ${space.gutter}px 32px` }}>
        <Button label="Add task" onPress={valid ? onSave : undefined} />
      </div>
    </div>
  );
}
