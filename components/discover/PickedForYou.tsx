import React, { useCallback } from "react";
import { View, Text, FlatList, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { BookOpen, Flame, Target } from "lucide-react-native";
import { DS_COLORS, DS_RADIUS, getCategoryColors } from "@/lib/design-system";
import { ROUTES } from "@/lib/routes";
import { Avatar } from "@/components/Avatar";

export type PickedChallenge = {
  id: string;
  title: string;
  duration: number;
  difficulty: "EASY" | "MED" | "HARD";
  category: string;
  participantCount: number;
  previewUsers: { user_id: string; username: string | null; avatar_url: string | null }[];
  badgeLabel?: string;
};

function CategoryIcon({ category }: { category: string }) {
  const cat = String(category ?? "discipline").toLowerCase();
  const colors = getCategoryColors(cat);
  const Icon = cat.includes("mind") || cat.includes("faith") ? BookOpen : cat.includes("fitness") ? Flame : Target;
  return (
    <View style={[styles.cardIconWrap, { backgroundColor: colors.tagBorder }]}>
      <Icon size={22} color={colors.header} strokeWidth={1.5} />
    </View>
  );
}

function diffLabel(d: "EASY" | "MED" | "HARD"): string {
  if (d === "EASY") return "Easy";
  if (d === "HARD") return "Hard";
  return "Medium";
}

function PickedForYouCardInner({
  c,
  onOpenChallenge,
}: {
  c: PickedChallenge;
  onOpenChallenge: (id: string) => void;
}) {
  const colors = getCategoryColors(String(c.category ?? "discipline").toLowerCase());
  return (
    <Pressable
      onPress={() => onOpenChallenge(c.id)}
      accessibilityRole="button"
      accessibilityLabel={`${c.title}, ${c.duration} days, ${diffLabel(c.difficulty)}`}
      style={[styles.card, { borderColor: colors.tagBorder }]}
    >
      <View style={[styles.cardTop, { backgroundColor: colors.tagBorder }]}>
        <CategoryIcon category={c.category} />
        <Text style={styles.matchTag} numberOfLines={1}>
          Matches: {String(c.category).charAt(0).toUpperCase() + String(c.category).slice(1)}
        </Text>
      </View>
      <Text style={styles.cardTitle} numberOfLines={2}>
        {c.title}
      </Text>
      <Text style={styles.cardMeta}>
        {c.duration}d · {diffLabel(c.difficulty)}
      </Text>
      <View style={styles.avatarRow}>
        {c.previewUsers.slice(0, 3).map((u, i) => (
          <Avatar
            key={u.user_id}
            url={u.avatar_url}
            name={u.username ?? "?"}
            userId={u.user_id}
            size={22}
            style={{ marginLeft: i > 0 ? -6 : 0, borderWidth: 2, borderColor: DS_COLORS.WHITE }}
          />
        ))}
        {c.participantCount >= 10 ? (
          <Text style={styles.activeHint}>{`${c.participantCount} active`}</Text>
        ) : null}
      </View>
      {c.badgeLabel ? <Text style={styles.earn}>Earns: {c.badgeLabel}</Text> : null}
    </Pressable>
  );
}

const PickedForYouCard = React.memo(PickedForYouCardInner);

export function PickedForYou({ challenges }: { challenges: PickedChallenge[] }) {
  const router = useRouter();
  const onOpenChallenge = useCallback(
    (id: string) => {
      router.push(ROUTES.CHALLENGE_ID(id) as never);
    },
    [router]
  );
  if (!challenges.length) return null;

  return (
    <View style={styles.section}>
      <View style={styles.headerBlock}>
        <Text style={styles.sectionTitle}>Picked for you</Text>
        <Text style={styles.sectionSub}>Based on your goals</Text>
      </View>
      <FlatList
        horizontal
        data={challenges}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        renderItem={({ item: c }) => <PickedForYouCard c={c} onOpenChallenge={onOpenChallenge} />}
        maxToRenderPerBatch={10}
        windowSize={5}
        initialNumToRender={5}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 20,
  },
  headerBlock: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: DS_COLORS.TEXT_PRIMARY,
  },
  sectionSub: {
    fontSize: 12,
    color: DS_COLORS.TEXT_MUTED,
    marginTop: 2,
  },
  scroll: {
    paddingHorizontal: 16,
    gap: 12,
    paddingBottom: 4,
    flexDirection: "row",
  },
  card: {
    width: 200,
    backgroundColor: DS_COLORS.WHITE,
    borderRadius: DS_RADIUS.LG,
    borderWidth: 0.5,
    overflow: "hidden",
    paddingBottom: 12,
  },
  cardTop: {
    height: 100,
    padding: 10,
    justifyContent: "space-between",
  },
  cardIconWrap: {
    alignSelf: "center",
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  matchTag: {
    fontSize: 10,
    fontWeight: "600",
    color: DS_COLORS.TEXT_PRIMARY,
    marginTop: 5,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: DS_COLORS.TEXT_PRIMARY,
    paddingHorizontal: 12,
    marginTop: 10,
    minHeight: 36,
  },
  cardMeta: {
    fontSize: 11,
    color: DS_COLORS.TEXT_SECONDARY,
    paddingHorizontal: 12,
    marginTop: 5,
  },
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    marginTop: 8,
    gap: 6,
  },
  activeHint: {
    fontSize: 10,
    color: DS_COLORS.TEXT_MUTED,
    marginLeft: 4,
  },
  earn: {
    fontSize: 10,
    color: DS_COLORS.TEXT_SECONDARY,
    paddingHorizontal: 12,
    marginTop: 6,
  },
});
