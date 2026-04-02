import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
  Modal,
} from "react-native";
import { X } from "lucide-react-native";
import { useQuery } from "@tanstack/react-query";
import { trpcQuery } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { Avatar } from "@/components/Avatar";
import { DS_COLORS, DS_RADIUS } from "@/lib/design-system";
import { useRouter } from "expo-router";
import { ROUTES } from "@/lib/routes";
import { useAuth } from "@/contexts/AuthContext";

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

  const navigateToProfile = (item: RespectedUser) => {
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
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Dismiss"
        />
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Respects</Text>
            <Pressable onPress={onClose} hitSlop={12} accessibilityRole="button" accessibilityLabel="Close">
              <X size={20} color={DS_COLORS.TEXT_SECONDARY} />
            </Pressable>
          </View>

          {query.isPending ? (
            <View style={styles.center}>
              <ActivityIndicator color={DS_COLORS.ACCENT} />
            </View>
          ) : query.isError ? (
            <View style={styles.center}>
              <Text style={styles.errorText}>{"Couldn't load respects"}</Text>
            </View>
          ) : (query.data ?? []).length === 0 ? (
            <View style={styles.center}>
              <Text style={styles.emptyText}>No respects yet</Text>
            </View>
          ) : (
            <FlatList
              style={styles.list}
              data={query.data}
              keyExtractor={(item) => item.userId}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.row}
                  onPress={() => navigateToProfile(item)}
                  accessibilityRole="button"
                >
                  <Avatar
                    url={item.avatarUrl}
                    name={item.displayName || item.username || "?"}
                    userId={item.userId}
                    size={36}
                  />
                  <View style={styles.rowText}>
                    <Text style={styles.displayName} numberOfLines={1}>
                      {item.displayName || item.username}
                    </Text>
                    {item.username ? (
                      <Text style={styles.username} numberOfLines={1}>
                        @{item.username}
                      </Text>
                    ) : null}
                  </View>
                </Pressable>
              )}
              contentContainerStyle={styles.listContent}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: DS_COLORS.OVERLAY_BLACK_40,
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: DS_COLORS.BG_CARD,
    borderTopLeftRadius: DS_RADIUS.card * 1.5,
    borderTopRightRadius: DS_RADIUS.card * 1.5,
    maxHeight: "60%",
    minHeight: 200,
    paddingBottom: 34,
  },
  list: {
    flexGrow: 0,
    maxHeight: 360,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: DS_COLORS.BORDER,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: DS_COLORS.TEXT_PRIMARY,
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  errorText: {
    fontSize: 14,
    color: DS_COLORS.TEXT_SECONDARY,
  },
  emptyText: {
    fontSize: 14,
    color: DS_COLORS.TEXT_MUTED,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
  },
  rowText: {
    flex: 1,
    minWidth: 0,
  },
  displayName: {
    fontSize: 14,
    fontWeight: "500",
    color: DS_COLORS.TEXT_PRIMARY,
  },
  username: {
    fontSize: 12,
    color: DS_COLORS.TEXT_MUTED,
    marginTop: 1,
  },
});
