import React from 'react';
import { color, type, space, radius, hit, shutter, motion } from '../tokens';
import { Button } from './Primitives';
import { DisplayNumber, useCountUp } from './DisplayNumber';
import { Stamp } from './Stamp';
import { WeekStrip } from './Chrome';
import { ContactSheet, Proof } from './ContactSheet';

type Variant = 'capture' | 'secured' | 'selfReported' | 'complete';

// Full bleed ink, permitted for these two screens by the amended law 7. No tab bar.
export function MomentScreen({ variant, challenge, task, proofUri, allProofs, revealedRows, streak, week, onCancel, onShoot, onShare, onDone, onNext, flipIcon }: {
  variant: Variant;
  challenge: string;
  task?: string;
  proofUri?: string;
  allProofs?: Proof[];        // complete variant: the whole challenge
  revealedRows?: number;
  streak?: number;
  week?: { letter: string; filled: boolean }[];
  onCancel?: () => void; onShoot?: () => void; onShare?: () => void; onDone?: () => void; onNext?: () => void;
  flipIcon?: React.ReactNode;
}) {
  const verified = variant === 'secured' || variant === 'complete';
  const stampLabel = variant === 'complete' ? 'Complete' : 'Verified';
  const n = useCountUp(streak ?? 0, (streak ?? 0) - 1, motion.daySecuredMs, verified);

  return (
    <div style={{ position: 'relative', flex: 1, background: color.textPrimary, display: 'flex', flexDirection: 'column' }}>
      {variant === 'capture' ? (
        <>
          <div style={{ height: hit, paddingInline: space.gutter, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div onClick={onCancel} style={{ height: hit, display: 'flex', alignItems: 'center', ...type.bodyStrong, color: color.textPrimary }}>Cancel</div>
            <div style={{ width: hit, height: hit, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{flipIcon}</div>
          </div>
          <div style={{ padding: `${space.gutter}px ${space.gutter}px 0` }}>
            <div style={{ ...type.bodyStrong, color: color.textPrimary }}>{challenge}</div>
            <div style={{ ...type.secondary, color: color.textPrimarySecondary }}>{task}</div>
          </div>
        </>
      ) : (
        <div style={{ padding: `${space.gutter}px ${space.gutter}px 0`, display: 'flex', flexDirection: 'column', gap: space.sm }}>
          <DisplayNumber value={verified ? n : streak ?? 0} size="moment" onInk />
          <div style={{ ...type.bodyStrong, color: color.textPrimary }}>
            {variant === 'complete'
              ? `${streak} of ${streak}. Verified.`
              : `Day ${streak}. ${verified ? 'Verified.' : 'Self reported.'}`}
          </div>
        </div>
      )}

      <div style={{ padding: space.gutter }}>
        <div style={{ position: 'relative', aspectRatio: '4 / 5', borderRadius: radius.card, overflow: 'hidden', background: color.textPrimary }}>
          {proofUri ? <img src={proofUri} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
        </div>
      </div>

      {variant === 'capture' ? (
        <div style={{ paddingInline: space.gutter, display: 'flex', justifyContent: 'center' }}>
          <div onClick={onShoot} style={{ width: shutter, height: shutter, borderRadius: radius.pill, background: color.surface }} />
        </div>
      ) : (
        <>
          {/* The stamp lands at the END of the count up, never before it. */}
          {verified ? <div style={{ paddingInline: space.gutter }}><Stamp onInk label={stampLabel} /></div> : null}
          {week ? <div style={{ padding: `${space.gutter}px ${space.gutter}px 0` }}><WeekStrip days={week} todayIndex={6} /></div> : null}
          <div style={{ position: 'absolute', left: space.gutter, right: space.gutter, bottom: 32, display: 'flex', flexDirection: 'column', gap: space.sm }}>
            {variant === 'complete' ? <Button label="Start the next one" onPress={onNext} /> : null}
            {variant === 'complete'
              ? <div style={{ display: 'flex', gap: space.sm }}>
                  <div style={{ flex: 1 }}><Button label="Share" variant="secondary" onPress={onShare} /></div>
                  <div style={{ flex: 1 }}><Button label="Done" variant="tertiary" onPress={onDone} /></div>
                </div>
              : <>
                  {verified ? <Button label="Share" onPress={onShare} /> : null}
                  <Button label="Done" variant="tertiary" onPress={onDone} />
                </>}
          </div>
        </>
      )}
    </div>
  );
}
