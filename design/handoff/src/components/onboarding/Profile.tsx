import React from 'react';
import { color, type, space, radius, border, buttonHeight } from '../../tokens';
import { OnboardingScreen, PrimaryButton, TextLink, Icon } from './OnboardingChrome';

// Greeting fallback, used by Home. Never the literal string "User".
export function greetingName(p: { display_name?: string | null; username?: string | null; first_name?: string | null }): string | null {
  return p.display_name?.trim() || p.username?.trim() || p.first_name?.trim() || null;
}

function Field({ label, value, placeholder }: { label: string; value?: string; placeholder?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ ...type.label, color: color.textSecondary }}>{label}</div>
      <div style={{
        minHeight: buttonHeight.regular, borderRadius: radius.input, background: color.surface, border,
        padding: '15px 16px', ...type.secondary, color: value ? color.textPrimary : color.textSecondary,
      }}>{value || placeholder || label}</div>
    </div>
  );
}

// Everything here is optional, and both exits finish onboarding: continue and skip
// both set onboarding_completed and land on Home with the joined challenge in the
// Today card. Nobody gets trapped.
export function Profile({ displayName, username, bio, photoUrl, onPickPhoto, onContinue, onSkip, onBack }: {
  displayName?: string; username?: string; bio?: string; photoUrl?: string | null;
  onPickPhoto?: () => void; onContinue?: () => void; onSkip?: () => void; onBack?: () => void;
}) {
  return (
    <OnboardingScreen
      step={7}
      onBack={onBack}
      skipLabel="Skip"
      onSkip={onSkip}
      title="What should we call you?"
      subtitle="All of this is optional. The feed shows your display name, or your username if you leave it blank."
      footer={<><PrimaryButton label="Continue" onPress={onContinue} /><TextLink label="Skip for now" onPress={onSkip} /></>}
    >
      <div style={{ padding: `${space.gutter}px ${space.gutter}px 0`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: space.sm }}>
        <div role="button" onClick={onPickPhoto} style={{ width: 88, height: 88, borderRadius: radius.pill, background: color.surface, border, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          {photoUrl ? <img src={photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Icon name="camera" size={28} />}
        </div>
        <div style={{ ...type.caption, color: color.textSecondary }}>Photo optional</div>
      </div>
      <div style={{ padding: `${space.gutter}px ${space.gutter}px 0`, display: 'flex', flexDirection: 'column', gap: space.md }}>
        <Field label="Display name" value={displayName} placeholder="Your name" />
        <Field label="Username" value={username} placeholder="username" />
        <Field label="Bio" value={bio} placeholder="One line, optional" />
      </div>
    </OnboardingScreen>
  );
}
