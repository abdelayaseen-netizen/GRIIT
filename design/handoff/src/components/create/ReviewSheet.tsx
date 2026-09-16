import React from 'react';
import { color, type, space, radius, border, hit } from '../../tokens';
import { Button, Divider } from '../Primitives';
import { EmptyState } from '../States';

export type ReviewRow = { text: string; step: 1 | 2 | 3 };

export function ReviewSheet({ rows, state, onEdit, onClose, onLaunch, closeIcon, errorIcon }: {
  rows: ReviewRow[]; state: 'idle' | 'loading' | 'error';
  onEdit: (step: 1 | 2 | 3) => void; onClose: () => void; onLaunch: () => void;
  closeIcon: React.ReactNode; errorIcon: React.ReactNode;
}) {
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: state === 'error' ? 200 : 300, bottom: 0, background: color.surface, borderTopLeftRadius: radius.card, borderTopRightRadius: radius.card, borderTop: border }}>
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: space.sm }}>
        <div style={{ width: 36, height: 4, borderRadius: radius.input, background: color.border }} />
      </div>
      <div style={{ padding: `${space.md}px ${space.gutter}px 0`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={type.bodyStrong}>Review and launch</div>
        <div onClick={onClose} style={{ width: hit, height: hit, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>{closeIcon}</div>
      </div>
      <div style={{ padding: `${space.sm}px ${space.gutter}px 0` }}>
        {rows.map((r, i) => (
          <div key={r.text}>
            <div style={{ padding: `${space.gutter}px 0`, display: 'flex', alignItems: 'center', gap: space.lg, minHeight: hit }}>
              <div style={{ flex: 1, ...type.body }}>{r.text}</div>
              <div onClick={() => onEdit(r.step)} style={{ height: hit, display: 'flex', alignItems: 'center', ...type.bodyStrong, color: color.brandText }}>Edit</div>
            </div>
            {i < rows.length - 1 ? <Divider /> : null}
          </div>
        ))}
      </div>
      {/* Never a raw error string: the empty state pattern, rows kept. */}
      {state === 'error' ? (
        <div style={{ padding: `${space.section}px ${space.gutter}px 0` }}>
          <EmptyState icon={errorIcon} heading="Could not launch" body="Check your connection and try again." actionLabel="Retry" onAction={onLaunch} />
        </div>
      ) : null}
      {state !== 'error' ? (
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: `${space.gutter}px ${space.gutter}px 32px` }}>
          <Button label={state === 'loading' ? 'Launching' : 'Launch'} submitting={state === 'loading'} onPress={state === 'loading' ? undefined : onLaunch} />
        </div>
      ) : null}
    </div>
  );
}
