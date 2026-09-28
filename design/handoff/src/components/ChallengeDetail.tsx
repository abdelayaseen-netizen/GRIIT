import React from 'react';
import { color, type, space, radius, border, buttonHeight, hit } from '../tokens';
import { Divider } from './Primitives';

// The screen for a challenge the user has NOT joined. It answers one question:
// can I actually do this. Nothing here is earned, so the display face never appears
// and the Verified stamp never appears. Every gate shown is one the app can enforce.

export type Gate = 'camera' | 'time_window' | 'location';

export type DetailTask = {
  title: string;
  task_type: string;
  gates: Gate[];                 // empty means self-reported
  time_window?: string;          // creator's hours, e.g. "6-9am"
};

export type ChallengeDetailProps = {
  title: string;
  description?: string;          // one line, omitted when the creator wrote none
  duration_days: number;
  participation_type: 'solo' | 'duo' | 'team';
  participants_count: number;
  tasks: DetailTask[];
  // A default | B free_limit | C ended | C not_live
  state: 'default' | 'free_limit' | 'ended' | 'not_live';
  // challenges.is_hard_mode. The creator's setting, the same for everyone in the challenge.
  // Joiners do not choose it, so it is stated, not offered.
  is_hard_mode: boolean;
  active_count?: number;         // free_limit only
  free_limit?: number;           // free_limit only
  ends_on?: string;              // ended only, e.g. "12 August"
  starts_on?: string;            // not_live only, e.g. "14 September"
  onBack?: () => void;
  onMore?: () => void;
  onJoin?: () => void;
  onUpgrade?: () => void;
};

// The three gates the app can enforce, in this order, and nothing else.
const GATE_ICON: Record<Gate, string> = { camera: 'camera', time_window: 'clock', location: 'map-pin' };
const GATE_ORDER: Gate[] = ['camera', 'time_window', 'location'];

const TASK_ICON: Record<string, string> = {
  timer: 'timer', workout: 'dumbbell', outdoor: 'sunrise', reading: 'book-open',
  water: 'droplet', counter: 'hash', photo: 'camera', checkin: 'map-pin', journal: 'pencil',
};

const Icon = ({ name, size = 22, tone = color.textSecondary }: { name: string; size?: number; tone?: string }) =>
  <i data-lucide={name} style={{ width: size, height: size, color: tone, flex: 'none' }} />;

const Chip = ({ children }: { children: React.ReactNode }) => (
  <div style={{ padding: '6px 12px', borderRadius: radius.input, background: color.surface, border, ...type.caption, color: color.textPrimary }}>{children}</div>
);

// Gate labels never claim verification. The location label never prints the place.
const GateLabel = ({ gate, window, muted }: { gate?: Gate; window?: string; muted?: boolean }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 8px', borderRadius: radius.input, border, background: color.surface, fontSize: 12, lineHeight: '16px', color: muted ? color.textSecondary : color.textPrimary }}>
    {gate ? <Icon name={GATE_ICON[gate]} size={12} /> : null}
    {gate === 'camera' ? 'Camera' : gate === 'time_window' ? `Time window ${window}` : gate === 'location' ? 'Location' : 'Self-reported'}
  </div>
);

export function ChallengeDetail(p: ChallengeDetailProps) {
  const closed = p.state === 'ended' || p.state === 'not_live';
  const blocked = p.state === 'free_limit';

  return (
    <div style={{ position: 'relative', flex: 1, background: color.canvas }}>
      {/* No share button until joined. */}
      <div style={{ height: hit, paddingLeft: space.gutter, paddingRight: space.md, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div onClick={p.onBack} style={{ width: hit, height: hit, display: 'flex', alignItems: 'center' }}><Icon name="chevron-left" size={24} tone={color.textPrimary} /></div>
        <div onClick={p.onMore} style={{ width: hit, height: hit, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}><Icon name="ellipsis" size={24} tone={color.textPrimary} /></div>
      </div>

      <div style={{ padding: `10px ${space.gutter}px 0`, ...type.title, color: color.textPrimary }}>{p.title}</div>
      {/* No description row at all when the creator wrote none. */}
      {p.description ? <div style={{ padding: `6px ${space.gutter}px 0`, ...type.secondary, color: color.textSecondary }}>{p.description}</div> : null}

      {/* Facts the creator set. No difficulty: that is an opinion, and the gate list is the
          truth. No completion rate, no "joined today": too little data to be honest. */}
      <div style={{ padding: `12px ${space.gutter}px 0`, display: 'flex', flexWrap: 'wrap', gap: space.sm }}>
        <Chip>{p.duration_days} {p.duration_days === 1 ? 'day' : 'days'}</Chip>
        <Chip>{p.participation_type === 'solo' ? 'Solo' : p.participation_type === 'duo' ? 'Duo' : 'Team'}</Chip>
        <Chip>{p.participants_count} {p.participants_count === 1 ? 'person' : 'people'}</Chip>
      </div>

      <div style={{ padding: `18px ${space.gutter}px 0`, ...type.heading, color: color.textPrimary }}>What you'll post</div>
      <div style={{ padding: `0 ${space.gutter}px` }}>
        {p.tasks.map((t, i) => (
          <React.Fragment key={i}>
            {i > 0 ? <Divider /> : null}
            <div style={{ padding: '8px 0', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <Icon name={TASK_ICON[t.task_type] ?? 'circle'} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: space.sm }}>
                <div style={{ ...type.bodyStrong, color: color.textPrimary }}>{t.title}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {t.gates.length
                    ? GATE_ORDER.filter(g => t.gates.includes(g)).map(g => <GateLabel key={g} gate={g} window={t.time_window} />)
                    : <GateLabel muted />}
                </div>
              </div>
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* The creator's mode, stated in one line. Not a choice at join. */}
      <div style={{ padding: `12px ${space.gutter}px 0`, ...type.caption, color: color.textSecondary }}>
        {p.is_hard_mode
          ? 'Hard mode. Gates are enforced; a failed gate fails the day.'
          : 'Standard mode. Gates are recorded, not enforced.'}
      </div>

      <div style={{ height: 176 }} />

      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, background: color.canvas, borderTop: border, ...(closed
        ? { padding: `${space.lg}px ${space.gutter}px 28px`, display: 'flex', alignItems: 'center', justifyContent: 'center' }
        : blocked
          ? { padding: `14px ${space.gutter}px 24px`, display: 'flex', flexDirection: 'column', gap: space.sm, alignItems: 'center' }
          : { padding: `${space.lg}px ${space.gutter}px 28px`, display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }) }}>
        {closed ? (
          <div style={{ ...type.secondary, color: color.textSecondary }}>
            {p.state === 'ended' ? `This challenge ended on ${p.ends_on}.` : `This challenge starts on ${p.starts_on}.`}
          </div>
        ) : (
          <>
            <div onClick={blocked ? undefined : p.onJoin} style={{ width: '100%', height: buttonHeight.regular, borderRadius: radius.pill, ...(blocked ? { background: color.surface, border, color: color.textSecondary } : { background: color.primary, color: color.textPrimary }), display: 'flex', alignItems: 'center', justifyContent: 'center', ...type.bodyStrong }}>Join</div>
            {blocked ? (
              <>
                <div style={{ ...type.caption, color: color.textSecondary, textAlign: 'center' }}>You are in {p.active_count} challenges. Free accounts hold {p.free_limit} at a time.</div>
                <div onClick={p.onUpgrade} style={{ ...type.secondary, fontWeight: type.bodyStrong.fontWeight, color: color.brandText }}>Leave one, or upgrade</div>
              </>
            ) : (
              <div style={{ ...type.caption, color: color.textSecondary, textAlign: 'center' }}>
                {p.participation_type === 'solo' ? 'Day 1 is today.' : 'Join opens the invite step. You need a partner before Day 1.'}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
