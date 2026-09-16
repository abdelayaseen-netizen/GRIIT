import React from 'react';
import { color, type, space, radius, border, buttonHeight, hit } from '../../tokens';
import { OnboardingScreen, PrimaryButton, TextLink, Icon } from './OnboardingChrome';

export type AccountState = 'default' | 'email_taken' | 'confirm_email' | 'malformed';

function AuthButton({ icon, label, onPress }: { icon: string; label: string; onPress?: () => void }) {
  return (
    <div role="button" onClick={onPress} style={{
      height: buttonHeight.regular, borderRadius: radius.pill, background: color.surface, border,
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, ...type.bodyStrong, color: color.textPrimary,
    }}>
      <Icon name={icon} size={20} tone={color.textPrimary} />{label}
    </div>
  );
}

function Field({ label, value, error }: { label: string; value?: string; error?: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ ...type.label, color: color.textSecondary }}>{label}</div>
      <div style={{
        minHeight: buttonHeight.regular, borderRadius: radius.input, background: color.surface,
        border: error ? `1.5px solid ${color.danger}` : border, padding: '15px 16px',
        ...type.secondary, color: value ? color.textPrimary : color.textSecondary,
      }}>{value || label}</div>
    </div>
  );
}

function Notice({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <div style={{ background: color.surface, border, borderRadius: radius.card, padding: space.lg, display: 'flex', gap: space.md, alignItems: 'flex-start' }}>
      <Icon name={icon} size={20} tone={color.textPrimary} />
      <div style={{ ...type.secondary, color: color.textSecondary }}>{children}</div>
    </div>
  );
}

// The guest is already in. This is the upgrade, so the skip is honest about the cost
// and the "saved and waiting" list shows exactly what would be lost.
export function Account({ state, email, saved, onApple, onEmail, onLogIn, onContinue, onEditEmail, onSend, onSkip, onBack }: {
  state: AccountState; email?: string; saved: string[];
  onApple?: () => void; onEmail?: () => void; onLogIn?: () => void; onContinue?: () => void;
  onEditEmail?: () => void; onSend?: () => void; onSkip?: () => void; onBack?: () => void;
}) {
  const skip = <TextLink label="Skip — I'll risk losing my progress" onPress={onSkip} />;
  return (
    <OnboardingScreen
      step={6}
      onBack={onBack}
      title="Save your streak."
      subtitle="You are in already. An account is what makes your proof, streak and challenges survive this phone."
      footer={state === 'default' ? <><PrimaryButton label="Continue" onPress={onContinue} />{skip}</> : skip}
    >
      <div style={{ padding: `${space.gutter}px ${space.gutter}px 0`, display: 'flex', flexDirection: 'column', gap: space.md }}>
        {state === 'default' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: space.sm }}>
            <AuthButton icon="apple" label="Continue with Apple" onPress={onApple} />
            <AuthButton icon="mail" label="Continue with email" onPress={onEmail} />
            <TextLink label="Have an account? Log in" tone={color.brandText} onPress={onLogIn} />
          </div>
        ) : null}

        {state === 'email_taken' ? (
          <>
            <Field label="Email" value={email} />
            {/* Never a dead-end error: the path forward is the button. */}
            <Notice icon="info">That email already has a GRIIT account. Log in and today's progress comes with you.</Notice>
            <PrimaryButton label="Log in and bring my progress" onPress={onLogIn} />
          </>
        ) : null}

        {state === 'confirm_email' ? (
          <>
            <Field label="Email" value={email} />
            <Notice icon="help-circle">We'll confirm at {email} — correct?</Notice>
            <div style={{ display: 'flex', gap: space.sm }}>
              <div role="button" onClick={onEditEmail} style={{ flex: 1, height: buttonHeight.regular, borderRadius: radius.pill, background: color.surface, border, display: 'flex', alignItems: 'center', justifyContent: 'center', ...type.bodyStrong, color: color.textPrimary }}>Edit</div>
              <div role="button" onClick={onSend} style={{ flex: 1, height: buttonHeight.regular, borderRadius: radius.pill, background: color.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', ...type.bodyStrong, color: color.textPrimary }}>Send it</div>
            </div>
          </>
        ) : null}

        {state === 'malformed' ? (
          <>
            <Field label="Email" value={email} error />
            <div style={{ display: 'flex', alignItems: 'center', gap: space.sm, minHeight: 18 }}>
              <Icon name="circle-alert" size={16} tone={color.danger} />
              <div style={{ ...type.caption, color: color.danger }}>That is not a complete email address.</div>
            </div>
            <PrimaryButton label="Continue" disabled />
          </>
        ) : null}
      </div>

      {/* The best thing on the old screen, kept: the cost of skipping, itemised. */}
      <div style={{ padding: `${space.lg + 8}px ${space.gutter}px 0`, display: 'flex', flexDirection: 'column', gap: space.sm }}>
        <div style={{ ...type.label, color: color.textSecondary }}>Saved and waiting for you</div>
        {saved.map(s => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 10, minHeight: 24 }}>
            <Icon name="check" size={16} tone={color.brandText} />
            <div style={{ ...type.secondary, color: color.textSecondary }}>{s}</div>
          </div>
        ))}
      </div>
      <div style={{ height: hit }} />
    </OnboardingScreen>
  );
}
