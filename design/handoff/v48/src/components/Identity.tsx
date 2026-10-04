import React from 'react';
import { color, type, radius, avatarSize, space } from '../tokens';

// One identity fallback: initials from the DISPLAY NAME only, else a person glyph.
// Never derive initials from a "user_" handle.
export function initialsFrom(displayName?: string | null): string | null {
  if (!displayName) return null;
  if (/^user_/i.test(displayName)) return null;
  const parts = displayName.trim().split(/\s+/).slice(0, 2);
  const s = parts.map(p => p[0]).join('');
  return s ? s.toUpperCase() : null;
}

export function greeting(u: { displayName?: string; username?: string; firstName?: string }) {
  return u.displayName || u.username || u.firstName || 'Today';
}

const initialsType = {
  [avatarSize.xs]: type.caption, [avatarSize.sm]: type.secondary,
  [avatarSize.md]: type.bodyStrong, [avatarSize.lg]: type.title,
} as const;

export function Avatar({ size = avatarSize.sm, uri, displayName, ring, glyph }: {
  size?: 32 | 40 | 56 | 96; uri?: string | null; displayName?: string | null; ring?: boolean; glyph?: React.ReactNode;
}) {
  const initials = initialsFrom(displayName);
  const frame: React.CSSProperties = {
    width: size, height: size, borderRadius: radius.pill, flex: 'none',
    background: color.border, color: color.textPrimary, overflow: 'hidden',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: ring ? `2px solid ${color.surface}` : undefined,
    ...(initialsType[size] as React.CSSProperties),
    fontWeight: type.bodyStrong.fontWeight,
  };
  if (uri) return <img src={uri} alt="" style={{ ...frame, objectFit: 'cover' }} />;
  return <div style={frame}>{initials ?? glyph}</div>;
}

// Max three, 2pt surface ring, never overlapping text.
export function AvatarStack({ people, glyph }: { people: { uri?: string; displayName?: string }[]; glyph?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', marginRight: space.md }}>
      {people.slice(0, 3).map((p, i) => (
        <div key={i} style={{ marginLeft: i === 0 ? 0 : -12 }}>
          <Avatar size={avatarSize.sm} uri={p.uri} displayName={p.displayName} ring glyph={glyph} />
        </div>
      ))}
    </div>
  );
}
