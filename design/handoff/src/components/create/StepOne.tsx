import React from 'react';
import { color, type, space, radius, border, selectedBorder } from '../../tokens';
import { Button, Card, Chip, HintBox } from '../Primitives';
import { WizardHeader, WizardFooter } from '../Chrome';

export const DURATIONS = ['7 days', '14 days', '21 days', '30 days', '75 days', 'Custom'] as const;

export function StepOne({ name, days, group, onName, onDays, onGroup, onCancel, onNext, lightbulb, soloIcon, groupIcon }: {
  name: string; days: string; group: boolean;
  onName: (v: string) => void; onDays: (v: string) => void; onGroup: (v: boolean) => void;
  onCancel: () => void; onNext: () => void;
  lightbulb: React.ReactNode; soloIcon: React.ReactNode; groupIcon: React.ReactNode;
}) {
  const valid = name.trim().length >= 3 && name.length <= 60;
  return (
    <>
      <WizardHeader step={1} total={3} onCancel={onCancel} />
      <div style={{ padding: `${space.section}px ${space.gutter}px 0` }}>
        <div style={type.title}>Name your challenge</div>
        <div style={{ ...type.secondary, color: color.textSecondary }}>One sentence. Be specific.</div>
      </div>
      <div style={{ padding: `${space.gutter}px ${space.gutter}px 0`, display: 'flex', flexDirection: 'column', gap: space.sm }}>
        <Card>
          <div style={{ display: 'flex', flexDirection: 'column', gap: space.md }}>
            <input value={name} onChange={e => onName(e.target.value)} placeholder="Read 30 min before phone"
              style={{ ...type.body, color: color.textPrimary, background: 'transparent', border: 'none', outline: 'none' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ ...type.caption, color: valid ? color.brandText : color.textSecondary }}>
                {valid ? 'Looks good' : 'Min 3 characters'}
              </div>
              <div style={{ ...type.caption, color: color.textSecondary }}>{name.length}/60</div>
            </div>
          </div>
        </Card>
        <div style={{ ...type.caption, color: color.textSecondary }}>
          Examples: read 30 min before phone · workout 5x weekly · 30 days no alcohol
        </div>
      </div>
      <div style={{ padding: `${space.section}px ${space.gutter}px 0`, display: 'flex', flexDirection: 'column', gap: space.md }}>
        <div style={type.heading}>How long?</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: space.md }}>
          {DURATIONS.map(d => <Chip key={d} label={d} selected={d === days} onPress={() => onDays(d)} />)}
        </div>
      </div>
      <div style={{ padding: `${space.section}px ${space.gutter}px 0`, display: 'flex', flexDirection: 'column', gap: space.md }}>
        <div style={type.heading}>Solo or with friends?</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: space.md }}>
          {[{ t: 'Solo', c: 'Just you', on: !group, icon: soloIcon, set: false },
            { t: 'Group', c: 'Up to 10', on: group, icon: groupIcon, set: true }].map(o => (
            <div key={o.t} onClick={() => onGroup(o.set)} style={{
              background: color.surface, border: o.on ? selectedBorder : border,
              borderRadius: radius.card, padding: space.gutter,
              display: 'flex', flexDirection: 'column', gap: space.sm,
            }}>
              {o.icon}
              <div style={type.bodyStrong}>{o.t}</div>
              <div style={{ ...type.caption, color: color.textSecondary }}>{o.c}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: `${space.gutter}px ${space.gutter}px 140px` }}>
        <HintBox icon={lightbulb}>30 days is the sweet spot. Build the habit, prove you can.</HintBox>
      </div>
      <WizardFooter>
        <Button label="Continue" onPress={valid ? onNext : undefined} submitting={false} />
      </WizardFooter>
    </>
  );
}
