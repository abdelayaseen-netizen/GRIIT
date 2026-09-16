import React from 'react';
import { color, type, space, radius, border } from '../../tokens';
import { OnboardingScreen, PrimaryButton, TextLink, Icon } from './OnboardingChrome';

export const PRESETS = [
  { id: 'am6', h: '6:00', mer: 'AM' },
  { id: 'am8', h: '8:00', mer: 'AM' },
  { id: 'pm6', h: '6:00', mer: 'PM' },
  { id: 'pm9', h: '9:00', mer: 'PM' },
] as const;

// The only OS permission prompt in the flow. The copy states what the reminder is
// and how to stop it. It does not promise never to nag.
export function Reminders({ presetId, notificationBody, timeLabel, permission, onPick, onCustom, onEnable, onSkip, onOpenSettings, onBack }: {
  presetId: string; notificationBody: string; timeLabel: string;
  permission: 'undetermined' | 'denied';
  onPick?: (id: string) => void; onCustom?: () => void; onEnable?: () => void;
  onSkip?: () => void; onOpenSettings?: () => void; onBack?: () => void;
}) {
  const denied = permission === 'denied';
  return (
    <OnboardingScreen
      step={5}
      onBack={onBack}
      title="One reminder a day."
      subtitle="It tells you what is still open. Turn it off in Settings whenever you want."
      footer={denied ? (
        <>
          <PrimaryButton label="Open Settings" onPress={onOpenSettings} />
          <TextLink label="Continue without reminders" onPress={onSkip} />
        </>
      ) : (
        <>
          <PrimaryButton label="Turn on reminders" onPress={onEnable} />
          <TextLink label="No reminders for now" onPress={onSkip} />
        </>
      )}
    >
      <div style={{ padding: `${space.gutter}px ${space.gutter}px 0` }}>
        {denied ? (
          <div style={{ background: color.surface, border, borderRadius: radius.card, padding: space.gutter, display: 'flex', gap: space.lg, alignItems: 'flex-start' }}>
            <Icon name="bell-off" tone={color.textPrimary} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: space.xs }}>
              <div style={{ ...type.bodyStrong, color: color.textPrimary }}>Notifications are off for GRIIT</div>
              <div style={{ ...type.secondary, color: color.textSecondary }}>iOS is blocking them, so nothing can be sent. Turn them on in Settings and the time you pick here will be used.</div>
            </div>
          </div>
        ) : (
          // A real notification, with the real body string the scheduler sends.
          <div style={{ background: color.surface, border, borderRadius: radius.card, padding: '14px 16px', display: 'flex', gap: space.md, alignItems: 'flex-start' }}>
            <div style={{ width: 40, height: 40, borderRadius: 11, background: color.brandTint, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
              <Icon name="shield" size={20} tone={color.brandText} />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <div style={{ ...type.secondary, fontWeight: type.bodyStrong.fontWeight, color: color.textPrimary }}>GRIIT</div>
              <div style={{ ...type.caption, color: color.textSecondary }}>{notificationBody}</div>
            </div>
            <div style={{ ...type.caption, color: color.textSecondary }}>{timeLabel}</div>
          </div>
        )}
      </div>

      <div style={{ padding: `${space.gutter}px ${space.gutter}px 0`, ...type.label, color: color.textSecondary }}>Send it at</div>
      <div style={{ padding: `${space.sm}px ${space.gutter}px 0`, display: 'flex', gap: space.sm, opacity: denied ? 0.5 : 1 }}>
        {PRESETS.map(p => {
          const on = p.id === presetId;
          return (
            <div key={p.id} role="button" onClick={denied ? undefined : () => onPick?.(p.id)} style={{
              flex: 1, minHeight: 60, borderRadius: radius.input,
              background: on ? color.brandTint : color.surface,
              border: on ? `1.5px solid ${color.brand}` : border,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
            }}>
              <div style={{ ...type.secondary, fontWeight: type.bodyStrong.fontWeight, color: on ? color.brandText : color.textPrimary }}>{p.h}</div>
              <div style={{ fontSize: 12, lineHeight: '16px', fontWeight: '400', color: on ? color.brandText : color.textSecondary }}>{p.mer}</div>
            </div>
          );
        })}
      </div>
      {denied ? null : (
        <div style={{ padding: `${space.sm}px ${space.gutter}px 0` }}>
          <TextLink label="Pick a custom time" tone={color.brandText} onPress={onCustom} />
        </div>
      )}
    </OnboardingScreen>
  );
}
