import React from 'react';
import { color, type, space, radius, border, displayFace, numberSize } from '../tokens';
import { WeekStrip } from './WeekStrip';

// The Secured screen for a day that can hold several camera proofs across
// several challenges.
//
// Two fixes over build 58:
//  1. No empty image card. Zero photos means no image area at all, and the
//     challenges are listed instead. A grey box is a picture of a proof that
//     does not exist.
//  2. No bare "Day 2." A day number belongs to a challenge, not to a day: with
//     three challenges running there are three of them. The hero is the streak,
//     which is the one number the day itself owns, and day numbers appear only
//     with a challenge name attached.

export type Proof = { uri: string; challengeName: string; day: number; length: number };

export type SecuredDayProps = {
  streakDays: number;
  proofs: Proof[];
  selfReportedChallenges: { name: string; day: number; length: number }[];
  taskCount: number;
  challengeCount: number;
  week: boolean[];
  todayIndex: number;
  onDone?: () => void;
};

const MAX_TILES = 3;

export function SecuredDay(p: SecuredDayProps) {
  const n = p.proofs.length;

  // Every string derived, nothing asserted.
  const across = p.challengeCount > 1 ? ` across ${p.challengeCount} challenges` : '';
  const line = n === 0
    ? `${p.taskCount} tasks${across}, all self-reported. Nothing was checked.`
    : `${p.taskCount} tasks${across}. ${n} camera proof${n === 1 ? '' : 's'}.`;

  return (
    <div style={{ position: 'relative', flex: 1, background: color.canvas }}>
      <div style={{ padding: `${space.gutter}px ${space.gutter}px 0`, display: 'flex', justifyContent: 'flex-end' }}>
        <div role="button" onClick={p.onDone} style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          <i data-lucide="x" style={{ width: 24, height: 24, color: color.textSecondary }} />
        </div>
      </div>

      <div style={{ padding: `${space.xs}px ${space.gutter}px 0`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <div style={{ ...type.label, color: color.textSecondary }}>Current streak</div>
        <div style={{ fontFamily: displayFace, fontSize: numberSize.moment, lineHeight: '130px', fontWeight: '600', fontVariantNumeric: 'tabular-nums', color: color.textPrimary }}>{p.streakDays}</div>
        <div style={{ ...type.body, color: color.textSecondary }}>{p.streakDays === 1 ? 'day' : 'days'}</div>
      </div>

      <div style={{ padding: `${space.lg}px ${space.gutter}px 0`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <div style={{ ...type.bodyStrong, color: color.textPrimary }}>Today is secured.</div>
        <div style={{ ...type.caption, color: color.textSecondary, textAlign: 'center' }}>{line}</div>
      </div>

      <div style={{ padding: `${space.gutter}px ${space.gutter}px 0` }}>
        <WeekStrip week={p.week} todayIndex={p.todayIndex} />
      </div>

      {n === 0 ? (
        // No photo: name the challenges and how each was recorded.
        <div style={{ padding: `${space.lg + 8}px ${space.gutter}px 0` }}>
          <div style={{ background: color.surface, border, borderRadius: radius.card, padding: space.lg, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {p.selfReportedChallenges.map(c => (
              <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <i data-lucide="shield-off" style={{ width: 16, height: 16, color: color.textSecondary, flex: 'none' }} />
                <div style={{ flex: 1, ...type.secondary, color: color.textSecondary }}>{c.name} · Day {c.day} of {c.length}</div>
                <div style={{ ...type.caption, color: color.textSecondary }}>Self-reported</div>
              </div>
            ))}
          </div>
        </div>
      ) : n === 1 ? (
        <>
          <div style={{ padding: `${space.lg + 8}px ${space.gutter}px 0` }}>
            <img src={p.proofs[0].uri} alt="" style={{ width: '100%', height: 240, objectFit: 'cover', borderRadius: radius.card, border, display: 'block' }} />
          </div>
          <div style={{ padding: `10px ${space.gutter}px 0`, ...type.caption, color: color.textSecondary, textAlign: 'center' }}>
            {p.proofs[0].challengeName} · Day {p.proofs[0].day} of {p.proofs[0].length}
          </div>
        </>
      ) : (
        <>
          {/* Three tiles and a +n. Six thumbnails at this size is a texture, not a record. */}
          <div style={{ padding: `${space.lg + 8}px ${space.gutter}px 0`, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
            {p.proofs.slice(0, MAX_TILES).map((pr, i) => {
              const overflow = i === MAX_TILES - 1 && n > MAX_TILES;
              return (
                <div key={pr.uri} style={{ position: 'relative' }}>
                  <img src={pr.uri} alt="" style={{ width: '100%', height: 112, objectFit: 'cover', borderRadius: radius.card, border, display: 'block' }} />
                  {overflow ? (
                    <div style={{ position: 'absolute', inset: 0, borderRadius: radius.card, background: 'rgba(15,15,15,0.62)', display: 'flex', alignItems: 'center', justifyContent: 'center', ...type.bodyStrong, color: color.textPrimary }}>
                      +{n - MAX_TILES + 1}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
          <div style={{ padding: `10px ${space.gutter}px 0`, ...type.caption, color: color.textSecondary, textAlign: 'center' }}>
            {p.proofs.map(x => x.challengeName).filter((v, i, a) => a.indexOf(v) === i).join(', ')}
          </div>
        </>
      )}

      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: `${space.lg}px ${space.gutter}px 28px` }}>
        <div role="button" onClick={p.onDone} style={{ height: 52, borderRadius: radius.pill, background: color.primary, color: color.textPrimary, display: 'flex', alignItems: 'center', justifyContent: 'center', ...type.bodyStrong }}>Done</div>
      </div>
    </div>
  );
}
