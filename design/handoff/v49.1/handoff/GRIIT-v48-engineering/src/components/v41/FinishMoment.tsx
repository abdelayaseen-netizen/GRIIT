import React from 'react';
import { color, type, space, radius, border, buttonHeight, hit, displayFace, displayWeight } from '../../tokens';

// Frame 114. Shown the instant "I did it" is tapped. The save runs underneath.
// The status line follows the server, never the tap. The share block lives here
// until the server says the day is secured; then it moves to Secured (frame 59)
// and this screen is replaced. It is never on both.

export type SaveState = 'saving' | 'slow' | 'saved' | 'failed';   // 'slow' = saving for more than 3 s
export type ShareIntent = 'none' | 'feed_held';                  // feed share tapped before the save landed

export type FinishTask = {
  title: string;
  challenge_title: string;
  day_n: number;            // calendar position from start_at, member timezone
  duration_days: number;
  gate_line: string;        // gateLabel(task): "Camera · 5:00–6:30 am" | "Self-reported"
  proof_photo_url?: string | null;  // camera tasks only
};

export type AlsoTodayRow = { id: string; title: string; gate_line: string };

export type FinishMomentProps = {
  task: FinishTask;
  save: SaveState;
  share: ShareIntent;
  alsoToday: AlsoTodayRow[];   // remaining required tasks across every active enrollment
  onRetry: () => void;
  onShareFeed: () => void;     // held until save === 'saved'; dropped on 'failed'
  onStory: () => void;         // v37 sticker set; photo sticker or text card
  onCopy: () => void; onSave: () => void; onMore: () => void;
  onNextTask: (id: string) => void;
  onLeave: () => void;         // "Keep it to the record" and any dismissal. Leaves `shared` false.
};

const STATUS: Record<SaveState, string> = {
  saving: 'Saving…',
  slow: 'Still saving. It keeps going if you leave.',
  saved: 'Task saved.',
  failed: "Didn't save. Try again.",
};

export function FinishMoment(p: FinishMomentProps) {
  const t = p.task;
  const pending = p.save === 'saving' || p.save === 'slow';
  const failed = p.save === 'failed';
  const next = p.alsoToday[0];
  // Anything that posts is disabled on failure. A share never goes out for a proof the server rejected.
  const shareDisabled = failed;

  return (
    <div style={{ flex: 1, background: color.canvas, position: 'relative' }}>
      <div style={{ padding: `4px ${space.card}px 0`, minHeight: 32, display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ ...type.secondary, fontWeight: '500', flex: 1, color: failed ? color.danger : color.textSecondary }}>{STATUS[p.save]}</div>
        {failed ? <div onClick={p.onRetry} style={{ minHeight: hit, display: 'flex', alignItems: 'center', ...type.secondary, fontWeight: '500', color: color.textPrimary }}>Try again</div> : null}
      </div>

      <div style={{ padding: `10px ${space.card}px 0` }}>
        <div style={{ ...type.label, color: color.textSecondary }}>Done</div>
        <div style={{ ...type.title, color: color.textPrimary }}>{t.title}</div>
        <div style={{ ...type.secondary, color: color.textSecondary }}>{t.challenge_title} · Day {t.day_n} of {t.duration_days}</div>
      </div>

      {/* Share preview. Camera: the photo. Every other type: a text card, same size. */}
      <div style={{ padding: `12px ${space.card}px 0` }}>
        {t.proof_photo_url ? (
          <img src={t.proof_photo_url} style={{ width: '100%', height: p.save === 'saved' && p.alsoToday.length ? 170 : 252, objectFit: 'cover', borderRadius: radius.card }} />
        ) : (
          <div style={{ height: 252, borderRadius: radius.card, background: color.surface, border, padding: 18, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ ...type.label, color: color.textSecondary }}>{t.challenge_title}</div>
            <div>
              <div style={{ fontSize: 26, lineHeight: '30px', fontWeight: '500', color: color.textPrimary }}>{t.title}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontFamily: displayFace, fontWeight: displayWeight, fontSize: 32, fontVariantNumeric: 'tabular-nums', color: color.textPrimary }}>Day {t.day_n}</span>
                <span style={{ ...type.secondary, color: color.textSecondary }}>of {t.duration_days}</span>
              </div>
            </div>
            <div style={{ ...type.caption, color: color.textSecondary }}>{t.gate_line}</div>
          </div>
        )}
      </div>

      <div style={{ padding: `12px ${space.card}px 0`, display: 'flex', gap: 8 }}>
        <Btn kind={p.share === 'feed_held' || shareDisabled ? 'disabled' : 'secondary'} onPress={p.share === 'feed_held' ? undefined : p.onShareFeed}>
          {p.share === 'feed_held' ? 'Shares when saved' : 'Share to the feed'}
        </Btn>
        <Btn kind={shareDisabled ? 'disabled' : 'secondary'} onPress={p.onStory}>Story</Btn>
      </div>
      {/* Copy / Save / More: icon row, each 64 x 44 */}

      {p.save === 'saved' && p.alsoToday.length ? (
        <div style={{ padding: `10px ${space.card}px 0` }}>
          <div style={{ ...type.label, color: color.textSecondary }}>Also today · {p.alsoToday.length} {p.alsoToday.length === 1 ? 'task' : 'tasks'}</div>
          {/* TaskRow status="pending" for each; tap → that task's flow */}
        </div>
      ) : null}

      {failed ? (
        <div style={{ padding: `10px ${space.card}px 0`, ...type.secondary, color: color.textSecondary }}>
          Nothing was saved and nothing was shared. The photo stays on this screen until it saves.
        </div>
      ) : null}

      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: `12px ${space.card}px 30px`, borderTop: border, background: color.canvas }}>
        {p.save === 'slow' ? <Btn kind="secondary" onPress={p.onLeave}>Leave it saving</Btn>
          : failed ? null
          : <Btn kind={pending || !next ? 'disabled' : 'primary'} onPress={next ? () => p.onNextTask(next.id) : undefined}>{next && !pending ? `Next task · ${next.title}` : 'Next task'}</Btn>}
        <Btn kind="tertiary" onPress={p.onLeave}>{failed ? 'Back to today' : 'Keep it to the record'}</Btn>
      </div>
    </div>
  );
}

function Btn({ kind, onPress, children }: { kind: 'primary' | 'secondary' | 'tertiary' | 'disabled'; onPress?: () => void; children: React.ReactNode }) {
  const s = kind === 'primary' ? { background: color.primary, color: color.textPrimary }
    : kind === 'secondary' ? { background: color.surface, border, color: color.textPrimary }
    : kind === 'disabled' ? { background: color.surface, border, color: color.textSecondary }
    : { color: color.textSecondary };
  return <div onClick={kind === 'disabled' ? undefined : onPress} style={{ flex: 1, minHeight: buttonHeight.regular, borderRadius: radius.pill, display: 'flex', alignItems: 'center', justifyContent: 'center', ...type.bodyStrong, ...s }}>{children}</div>;
}
