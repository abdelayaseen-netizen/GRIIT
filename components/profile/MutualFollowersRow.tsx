/**
 * MutualFollowersRow — decorative social-proof row on the public profile.
 *
 * Shows up to 3 overlapping mini avatars + a sentence ("Alex, Jordan and 4
 * others follow @display"). Renders `null` when `totalCount === 0` so callers
 * don't have to guard. Whole row is non-interactive (`accessibilityRole="text"`).
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import {
  DS_COLORS_V2,
  DS_RADIUS_V2,
  DS_SPACING_V2,
} from '@/lib/design-system';

export type MutualFollowersRowProps = {
  topNames: string[];
  totalCount: number;
  targetDisplayName: string;
};

function buildSentence(topNames: string[], totalCount: number, target: string): string {
  if (topNames.length === 0 || totalCount === 0) return '';
  const t = target.trim() || 'them';
  if (topNames.length === 1 && totalCount === 1) {
    return `${topNames[0]} follows ${t}`;
  }
  if (topNames.length >= 2 && totalCount === 2) {
    return `${topNames[0]}, ${topNames[1]} follow ${t}`;
  }
  if (topNames.length >= 2 && totalCount > 2) {
    const others = totalCount - 2;
    return `${topNames[0]}, ${topNames[1]} and ${others} other${others === 1 ? '' : 's'} follow ${t}`;
  }
  // Fallback: 1 name, total > 1 (rare — list is shorter than count).
  const others = Math.max(0, totalCount - 1);
  if (others === 0) {
    return `${topNames[0]} follows ${t}`;
  }
  return `${topNames[0]} and ${others} other${others === 1 ? '' : 's'} follow ${t}`;
}

export const MutualFollowersRow = React.memo(function MutualFollowersRow({
  topNames,
  totalCount,
  targetDisplayName,
}: MutualFollowersRowProps) {
  if (totalCount === 0 || topNames.length === 0) return null;

  const visibleNames = topNames.slice(0, 3);
  const sentence = buildSentence(visibleNames, totalCount, targetDisplayName);

  return (
    <View
      accessibilityRole="text"
      accessibilityLabel={sentence}
      style={styles.row}
    >
      <View style={styles.avatarStack}>
        {visibleNames.map((name, i) => (
          <Avatar
            key={`${name}-${i}`}
            name={name}
            size={20}
            url={null}
            style={[
              styles.stackedAvatar,
              i === 0 ? null : styles.stackedAvatarOverlap,
            ]}
          />
        ))}
      </View>
      <Text style={styles.text} numberOfLines={2}>
        {renderStyledSentence(visibleNames, totalCount, targetDisplayName)}
      </Text>
    </View>
  );
});

/**
 * Inline-styled rendering of the mutuals sentence. The first 1–2 names render
 * in primary text weight; the suffix ("and N others follow @target") drops to
 * the secondary tone so the eye lands on the names first.
 */
function renderStyledSentence(
  visibleNames: string[],
  totalCount: number,
  target: string,
): React.ReactNode {
  const t = target.trim() || 'them';
  if (visibleNames.length === 0 || totalCount === 0) return null;

  if (visibleNames.length === 1 && totalCount === 1) {
    return (
      <Text>
        <Text style={styles.nameStrong}>{visibleNames[0]}</Text>
        <Text style={styles.suffix}> follows {t}</Text>
      </Text>
    );
  }

  if (visibleNames.length >= 2 && totalCount === 2) {
    return (
      <Text>
        <Text style={styles.nameStrong}>{visibleNames[0]}, {visibleNames[1]}</Text>
        <Text style={styles.suffix}> follow {t}</Text>
      </Text>
    );
  }

  if (visibleNames.length >= 2 && totalCount > 2) {
    const others = totalCount - 2;
    return (
      <Text>
        <Text style={styles.nameStrong}>{visibleNames[0]}, {visibleNames[1]}</Text>
        <Text style={styles.suffix}>
          {' '}and {others} other{others === 1 ? '' : 's'} follow {t}
        </Text>
      </Text>
    );
  }

  const others = Math.max(0, totalCount - 1);
  if (others === 0) {
    return (
      <Text>
        <Text style={styles.nameStrong}>{visibleNames[0]}</Text>
        <Text style={styles.suffix}> follows {t}</Text>
      </Text>
    );
  }
  return (
    <Text>
      <Text style={styles.nameStrong}>{visibleNames[0]}</Text>
      <Text style={styles.suffix}>
        {' '}and {others} other{others === 1 ? '' : 's'} follow {t}
      </Text>
    </Text>
  );
}

export default MutualFollowersRow;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DS_SPACING_V2.sm,
    backgroundColor: DS_COLORS_V2.surface.card,
    borderRadius: DS_RADIUS_V2.md,
    paddingVertical: 9,
    paddingHorizontal: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: DS_COLORS_V2.surface.divider,
  },
  avatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stackedAvatar: {
    borderWidth: 1.5,
    borderColor: DS_COLORS_V2.surface.card,
    borderRadius: 999,
  },
  stackedAvatarOverlap: {
    marginLeft: -6,
  },
  text: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
  },
  nameStrong: {
    fontWeight: '500',
    color: DS_COLORS_V2.text.primary,
    fontSize: 12,
  },
  suffix: {
    fontWeight: '400',
    color: DS_COLORS_V2.text.secondary,
    fontSize: 12,
  },
});
