import React from 'react';
import { color, type, space, radius, border, selectedBorder } from '../../tokens';
import { Button, Chip } from '../Primitives';
import { WizardHeader, WizardFooter } from '../Chrome';

export const MODES = [
  { id: 'standard', title: 'Standard', caption: 'Recommended for your first challenge', line: 'Streak freezes on. Miss a day and you do not reset.' },
  { id: 'hard', title: 'Hard mode', caption: '75 Hard style. No exceptions.', line: 'No freezes. Miss a day, restart from day 1.' },
] as const;
export const PUBLIC_PROOF = ['Off', 'Optional', 'Required'] as const;
export const CATEGORIES = ['Fitness', 'Mind', 'Faith', 'Discipline'] as const;

export function StepThree({ mode, publicProof, category, onMode, onPublic, onCategory, onBack, onReview, icons }: {
  mode: string; publicProof: string; category: string;
  onMode: (id: string) => void; onPublic: (v: string) => void; onCategory: (v: string) => void;
  onBack: () => void; onReview: () => void; icons: Record<string, React.ReactNode>;
}) {
  return (
    <>
      <WizardHeader step={3} total={3} onCancel={onBack} />
      <div style={{ padding: `${space.section}px ${space.gutter}px 0` }}>
        <div style={type.title}>How strict?</div>
        <div style={{ ...type.secondary, color: color.textSecondary }}>Pick your accountability level.</div>
      </div>
      <div style={{ padding: `${space.gutter}px ${space.gutter}px 0`, display: 'flex', flexDirection: 'column', gap: space.md }}>
        {MODES.map(m => {
          const on = m.id === mode;
          return (
            <div key={m.id} onClick={() => onMode(m.id)} style={{
              background: color.surface, border: on ? selectedBorder : border,
              borderRadius: radius.card, padding: space.gutter, display: 'flex', flexDirection: 'column', gap: space.sm,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: space.md }}>{icons[m.id]}<div style={type.bodyStrong}>{m.title}</div></div>
              <div style={{ ...type.caption, color: color.textSecondary }}>{m.caption}</div>
              <div style={{ ...type.secondary, color: color.textSecondary }}>{m.line}</div>
            </div>
          );
        })}
      </div>
      <div style={{ padding: `${space.section}px ${space.gutter}px 0`, display: 'flex', flexDirection: 'column', gap: space.md }}>
        <div style={type.heading}>Public proof on feed</div>
        <div style={{ display: 'flex', gap: space.xs }}>
          {PUBLIC_PROOF.map(p => <Chip key={p} label={p} selected={p === publicProof} onPress={() => onPublic(p)} />)}
        </div>
        <div style={{ ...type.caption, color: color.textSecondary }}>
          Public accountability lifted goal completion from 43% to 76% (Matthews, 2015).
        </div>
      </div>
      <div style={{ padding: `${space.section}px ${space.gutter}px 140px`, display: 'flex', flexDirection: 'column', gap: space.md }}>
        <div style={type.heading}>Category</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: space.sm }}>
          {CATEGORIES.map(c => <Chip key={c} label={c} selected={c === category} onPress={() => onCategory(c)} />)}
        </div>
      </div>
      <WizardFooter><Button label="Review" onPress={onReview} /></WizardFooter>
    </>
  );
}
