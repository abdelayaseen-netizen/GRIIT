import React from 'react';
import { View, Text, Image } from 'react-native';
import { avatarTints } from '../../tokens.v46';

// F2. Initials on one of six tints from hash(user_id). Never black, never "?".
function tintFor(id: string) { let h = 0; for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0; return avatarTints[Math.abs(h) % 6]; }
export function initials(displayName?: string | null, username?: string | null) {
  const p = (displayName || username || '').trim().split(/\s+/).filter(Boolean);
  if (!p.length) return (username || 'G').slice(0, 1).toUpperCase();
  return (p.length === 1 ? p[0][0] : p[0][0] + p[1][0]).toUpperCase();
}
export function Avatar({ userId, uri, displayName, username, size = 32 }: { userId: string; uri?: string | null; displayName?: string | null; username?: string | null; size?: 24 | 32 | 40 | 44 | 52 | 72 }) {
  const [bg, fg] = tintFor(userId);
  const [failed, setFailed] = React.useState(false);
  if (uri && !failed) return <Image source={{ uri }} onError={() => setFailed(true)} style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: bg }} />;
  return <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontSize: Math.round(size * 0.38), fontWeight: '600', color: fg }}>{initials(displayName, username)}</Text></View>;
}
