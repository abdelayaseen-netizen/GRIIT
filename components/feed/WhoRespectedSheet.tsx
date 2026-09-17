import React, { useCallback } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { trpcQuery } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { useRouter } from "expo-router";
import { ROUTES } from "@/lib/routes";
import { useAuth } from "@/contexts/AuthContext";
import { DS_V3 } from "@/lib/design-system";
import Sheet from "@/components/ds/Sheet";
import MemberRow from "@/components/ds/MemberRow";
import Spinner from "@/components/ds/Spinner";

type RespectedUser = {
  userId: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
};

type Props = {
  visible: boolean;
  eventId: string;
  onClose: () => void;
};

export function WhoRespectedSheet({ visible, eventId, onClose }: Props) {
  const router = useRouter();
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ["whoRespected", eventId],
    queryFn: () => trpcQuery(TRPC.feed.getReactions, { eventId }) as Promise<RespectedUser[]>,
    enabled: visible && !!eventId,
    staleTime: 30_000,
  });

  const navigateToProfile = useCallback(
    (item: RespectedUser) => {
      onClose();
      if (item.userId === user?.id) {
        router.push(ROUTES.TABS_PROFILE as never);
        return;
      }
      const u = item.username?.trim();
      if (u && u !== "?" && u.length >= 2) {
        router.push(ROUTES.PROFILE_USERNAME(encodeURIComponent(u)) as never);
      } else {
        router.push(ROUTES.PROFILE_USERNAME(encodeURIComponent(item.userId)) as never);
      }
    },
    [onClose, router, user?.id]
  );

  const rows = query.data ?? [];

  return (
    <Sheet visible={visible} onDismiss={onClose} heading="Respects">
      {query.isPending ? (
        <View style={styles.center}>
          <Spinner size={44} />
        </View>
      ) : query.isError ? (
        <View style={styles.center}>
          <Text style={styles.meta}>{"Couldn't load respects"}</Text>
        </View>
      ) : rows.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.meta}>No respects yet</Text>
        </View>
      ) : (
        <FlatList
          style={styles.list}
          data={rows}
          keyExtractor={(item) => item.userId}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews
          renderItem={({ item }) => (
            <MemberRow
              displayName={item.displayName || item.username}
              caption={item.username ? `@${item.username}` : undefined}
              avatarUri={item.avatarUrl}
              avatarName={item.displayName || item.username}
              onPress={() => navigateToProfile(item)}
            />
          )}
        />
      )}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  list: {
    flexGrow: 0,
    maxHeight: DS_V3.space.xs * 90,
    marginHorizontal: -DS_V3.space.gutter,
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: DS_V3.space.section,
  },
  meta: {
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontWeight: DS_V3.type.secondary.fontWeight,
    color: DS_V3.color.textSecondary,
  },
});
