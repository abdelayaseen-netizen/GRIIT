import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { color, type, space, radius, border, hit, displayFace, displayWeight } from '../../tokens';
import { Image } from 'react-native';

// G2. Never a blank circle. Two initials from display_name (one if a single word), then username.
// Tint from a hash of user_id: brandTint + brandText, or border + textPrimary.
export function initials(displayName?: string | null, username?: string | null) {
  const src = (displayName || username || '').trim();
  const parts = src.split(/\s+/).filter(Boolean);
  if (!parts.length) return '·';
  return (parts.length === 1 ? parts[0].slice(0, 1) : parts[0][0] + parts[1][0]).toUpperCase();
}
function tint(userId: string) {
  let h = 0; for (let i = 0; i < userId.length; i++) h = (h * 31 + userId.charCodeAt(i)) | 0;
  return Math.abs(h) % 2 === 0 ? { bg: color.brandTint, fg: color.brandText } : { bg: color.border, fg: color.textPrimary };
}
export function Avatar({ userId, uri, displayName, username, size = 32 }: { userId: string; uri?: string | null; displayName?: string | null; username?: string | null; size?: 24 | 32 | 40 | 80 }) {
  const t = tint(userId);
  if (uri) return <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: t.bg }} />;
  return (
    <View accessibilityLabel={displayName || username || 'Profile'} style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: t.bg, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: Math.round(size * 0.38), fontWeight: '500', color: t.fg }}>{initials(displayName, username)}</Text>
    </View>
  );
}
