import React from 'react';
import { Text, View } from 'react-native';
import { DS_V3 } from '@/ds';
import { resultLine, verifyLabel } from './format';

// 1.4 · each task type shows its own result. Solid surface, never glass.
export function PostResult({ completion, compact }: { completion: any; compact?: boolean }) {
  const r = resultLine(completion);
  return (
    <View style={{ borderRadius: 16, backgroundColor: DS_V3.color.surface, padding: compact ? 16 : 20, gap: 6 }} accessible accessibilityLabel={[r.kind, r.big, r.sub, r.short, verifyLabel(completion)].filter(Boolean).join(', ')}>
      <Text style={DS_V3.type.caption}>{r.kind}</Text>
      <Text style={DS_V3.type.earnedNumber /* Barlow Condensed 600 */}>{r.big}</Text>
      {r.sub ? <Text style={DS_V3.type.secondary}>{r.sub}</Text> : null}
      {r.short ? <Text style={DS_V3.type.secondaryStrong}>{r.short}</Text> : null}
      <Text style={DS_V3.type.captionStrong}>{verifyLabel(completion)}</Text>
    </View>
  );
}
