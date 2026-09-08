import React from 'react';
import { color, type, space, radius } from '../../tokens';
import { Button, SegmentedControl, Divider } from '../Primitives';
import { WizardHeader, WizardFooter } from '../Chrome';

export type Pack = { id: string; title: string; meta: string; tasks: string[]; icon: React.ReactNode };
export type Task = { id: string; title: string; meta: string; icon: React.ReactNode };

// Packs are rows on the canvas: no card, no icon tile, selection announced once as a
// brandTint row with the contents inline beneath it.
export function StepTwo({ mode, packs, selectedPack, tasks, onMode, onPack, onEdit, onAddTask, onBack, onNext }: {
  mode: 'Starter packs' | 'Custom'; packs: Pack[]; selectedPack?: string; tasks: Task[];
  onMode: (m: 'Starter packs' | 'Custom') => void; onPack: (id: string) => void;
  onEdit: (id: string) => void; onAddTask: () => void; onBack: () => void; onNext: () => void;
}) {
  return (
    <>
      <WizardHeader step={2} total={3} onCancel={onBack} />
      <div style={{ padding: `${space.section}px ${space.gutter}px 0` }}>
        <div style={type.title}>What must get done daily?</div>
        <div style={{ ...type.secondary, color: color.textSecondary }}>Pick a starter pack or build from scratch.</div>
      </div>
      <div style={{ padding: `${space.gutter}px ${space.gutter}px 0` }}>
        <SegmentedControl items={['Starter packs', 'Custom']} value={mode} onChange={v => onMode(v as any)} />
      </div>
      <div style={{ padding: `${space.md}px ${space.gutter}px 140px` }}>
        {mode === 'Starter packs' ? packs.map((p, i) => {
          const on = p.id === selectedPack;
          return (
            <div key={p.id}>
              <div onClick={() => onPack(p.id)} style={{
                display: 'flex', alignItems: 'center', gap: space.lg, minHeight: 44,
                padding: on ? `${space.gutter}px ${space.lg}px` : `${space.gutter}px 0`,
                background: on ? color.brandTint : undefined,
                borderRadius: on ? radius.input : undefined,
              }}>
                {p.icon}
                <div style={{ flex: 1 }}>
                  <div style={{ ...type.bodyStrong, color: on ? color.brandText : color.textPrimary }}>{p.title}</div>
                  <div style={{ ...type.caption, color: on ? color.brandText : color.textSecondary }}>{p.meta}</div>
                </div>
              </div>
              {on ? (
                <div style={{ padding: `0 ${space.lg}px ${space.md}px 56px`, display: 'flex', flexDirection: 'column', gap: space.xs }}>
                  {p.tasks.map(t => <div key={t} style={{ ...type.caption, color: color.textSecondary }}>{t}</div>)}
                </div>
              ) : i < packs.length - 1 ? <Divider /> : null}
            </div>
          );
        }) : (
          <>
            {tasks.map((t, i) => (
              <div key={t.id}>
                <div style={{ display: 'flex', alignItems: 'center', gap: space.lg, minHeight: 44, padding: `${space.gutter}px 0` }}>
                  {t.icon}
                  <div style={{ flex: 1 }}>
                    <div style={type.bodyStrong}>{t.title}</div>
                    <div style={{ ...type.caption, color: color.textSecondary }}>{t.meta}</div>
                  </div>
                  <div onClick={() => onEdit(t.id)} style={{ height: 44, display: 'flex', alignItems: 'center', ...type.bodyStrong, color: color.brandText }}>Edit</div>
                </div>
                {i < tasks.length - 1 ? <Divider /> : null}
              </div>
            ))}
            <div style={{ marginTop: space.gutter }}><Button label="Add a task" variant="secondary" onPress={onAddTask} /></div>
          </>
        )}
      </div>
      <WizardFooter><Button label="Continue" onPress={onNext} /></WizardFooter>
    </>
  );
}
