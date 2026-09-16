import React from 'react';
import { color, type, space, radius, border } from '../../tokens';
import { OnboardingScreen, PrimaryButton, Icon } from './OnboardingChrome';

// What a witness actually sees. The row is the real feed post: same header, same
// 4:5 proof, same secured line. The photo is a placeholder because this user has
// not taken one yet — never a stock image and never someone else's face.
export function WhyCircle({ challengeName, day, taskSummary, onBack, onSkip, onContinue }: {
  challengeName: string; day: number; taskSummary: string;
  onBack?: () => void; onSkip?: () => void; onContinue?: () => void;
}) {
  return (
    <OnboardingScreen
      step={2}
      onBack={onBack}
      skipLabel="Skip"
      onSkip={onSkip}
      title="Discipline, witnessed."
      subtitle="This is your row in the feed once you post."
      footer={<PrimaryButton label="Continue" onPress={onContinue} />}
    >
      <div style={{ padding: `${space.gutter}px ${space.gutter}px 0` }}>
        <div style={{ background: color.surface, border, borderRadius: radius.card, overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: space.md }}>
            <div style={{ width: 40, height: 40, borderRadius: radius.pill, background: color.border, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
              <Icon name="user" size={20} />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <div style={{ ...type.bodyStrong, color: color.textPrimary }}>your username</div>
              {/* SF Pro, not the display face: the day is an example, not something earned. */}
              <div style={{ ...type.caption, color: color.textSecondary }}>{challengeName} · Day {day}</div>
            </div>
          </div>
          {/* Capped, not 4:5. A true 4:5 crop at this width pushes the secured line and the
              visibility sentence under the pinned footer, and those two are the screen. */}
          <div style={{ height: 200, background: color.canvas, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: space.sm }}>
            <Icon name="camera" size={28} />
            <div style={{ ...type.caption, color: color.textSecondary }}>Your proof photo</div>
          </div>
          <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: space.sm }}>
            <div style={{ ...type.secondary, fontWeight: type.bodyStrong.fontWeight, color: color.brandText }}>Day secured.</div>
            <div style={{ ...type.caption, color: color.textSecondary }}>{taskSummary}</div>
          </div>
        </div>
      </div>

      {/* The real rule, not a privacy promise the app cannot keep. */}
      <div style={{ padding: `${space.lg}px ${space.gutter}px 0`, ...type.secondary, color: color.textSecondary }}>
        Everyone in the challenge sees your proofs. Outside it, they go to the feed you post to: Friends, or Everyone.
      </div>
    </OnboardingScreen>
  );
}
