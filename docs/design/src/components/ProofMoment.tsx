import React from 'react';
import { color, type, space, radius, border, buttonHeight, hit } from '../tokens';

// The screen after a single task completes and the day is NOT yet secured.
// Replaces the text-only list. For a camera task the photo the user just took
// leads the screen: it is the artefact they made, and a text list throws it away.
//
// This never coexists with the Secured screen. Branch on the server's
// secured_today after the check-in resolves; if the day is secured, route to
// Secured instead and do not render this at all.

export type ProofMomentProps = {
  taskName: string;
  proofUri?: string | null;        // present iff the completion carried camera proof
  remainingToday: number;          // required tasks left across every active challenge
  challengeName: string;
  challengeDay: number;
  challengeLength: number;
  challengeDoneToday: boolean;     // this challenge has nothing left, the day does not
  remaining: { name: string; gate: string }[];   // same challenge, pending only
  onShare?: () => void;
  onKeep?: () => void;
  onNext?: () => void;
  onDone?: () => void;
};

export function ProofMoment(p: ProofMomentProps) {
  const hasPhoto = Boolean(p.proofUri);

  // One sentence, assembled from what is true. Never "1 challenge left".
  const status = [
    hasPhoto ? 'Camera proof, recorded.' : 'Self-reported, recorded.',
    p.challengeDoneToday ? `${p.challengeName} is done for today.` : null,
    `${p.remainingToday} left to secure today.`,
  ].filter(Boolean).join(' ');

  return (
    <div style={{ position: 'relative', flex: 1, background: color.canvas }}>
      <div style={{ height: 12 }} />

      {hasPhoto ? (
        <div style={{ padding: `${space.sm}px ${space.gutter}px 0` }}>
          <img src={p.proofUri!} alt="" style={{ width: '100%', height: 300, objectFit: 'cover', borderRadius: radius.card, border, display: 'block' }} />
        </div>
      ) : null}

      <div style={{ padding: `${hasPhoto ? space.lg + 8 : space.section}px ${space.gutter}px 0`, display: 'flex', flexDirection: 'column', gap: space.sm }}>
        <div style={{ ...type.title, color: color.textPrimary }}>{p.taskName} done.</div>
        <div style={{ ...type.secondary, color: color.textSecondary }}>{status}</div>
      </div>

      {/* With a photo the screen is the photo. Without one there is room for the
          remaining rows, which is the frame 48 shape. */}
      {!hasPhoto && p.remaining.length ? (
        <>
          <div style={{ padding: `${space.lg + 8}px ${space.gutter}px ${space.xs}px`, ...type.label, color: color.textSecondary }}>
            {p.challengeName} · Day {p.challengeDay} of {p.challengeLength}
          </div>
          <div style={{ padding: `${space.sm}px ${space.gutter}px 0`, display: 'flex', flexDirection: 'column', gap: space.xs }}>
            {p.remaining.map(t => <TaskRow key={t.name} name={t.name} gate={t.gate} />)}
          </div>
        </>
      ) : null}

      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: `${space.lg}px ${space.gutter}px 28px`, background: color.canvas, borderTop: border, display: 'flex', flexDirection: 'column', gap: space.sm }}>
        {/* Two buttons, both one tap, both advancing. Nothing defaults silently:
            a photo is private until this choice is made. A self-reported task has
            nothing to show, so it gets the ordinary next/done pair instead. */}
        {hasPhoto ? (
          <>
            <Button label="Share to the feed" icon="arrow-up-right" onPress={p.onShare} />
            <Button label="Keep it to the record" variant="secondary" onPress={p.onKeep} />
          </>
        ) : (
          <>
            <Button label="Next task" onPress={p.onNext} />
            <Button label="Done" variant="tertiary" onPress={p.onDone} />
          </>
        )}
      </div>
    </div>
  );
}

function TaskRow({ name, gate }: { name: string; gate: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: space.md, minHeight: hit }}>
      <div style={{ width: 20, height: 20, borderRadius: radius.pill, border: `1.5px solid ${color.textSecondary}`, flex: 'none' }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div style={{ ...type.bodyStrong, color: color.textPrimary }}>{name}</div>
        <div style={{ ...type.caption, color: color.textSecondary }}>{gate}</div>
      </div>
      <i data-lucide="chevron-right" style={{ width: 20, height: 20, color: color.textSecondary, flex: 'none' }} />
    </div>
  );
}

function Button({ label, icon, variant = 'primary', onPress }: { label: string; icon?: string; variant?: 'primary' | 'secondary' | 'tertiary'; onPress?: () => void }) {
  const isPrimary = variant === 'primary';
  const isTertiary = variant === 'tertiary';
  return (
    <div role="button" onClick={onPress} style={{
      height: isTertiary ? hit : buttonHeight.regular,
      borderRadius: radius.pill,
      background: isPrimary ? color.primary : isTertiary ? 'transparent' : color.surface,
      border: variant === 'secondary' ? border : undefined,
      color: isTertiary ? color.textSecondary : color.textPrimary,
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
      ...(isTertiary ? { ...type.secondary, fontWeight: '500' } : type.bodyStrong),
    }}>
      {icon ? <i data-lucide={icon} style={{ width: 20, height: 20, color: color.textPrimary, flex: 'none' }} /> : null}
      {label}
    </div>
  );
}
