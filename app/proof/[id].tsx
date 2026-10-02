import { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { X } from "lucide-react-native";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Button from "@/components/ds/Button";
import { DS_V3 } from "@/lib/design-system";
import { firstString } from "@/lib/task-helpers";
import { trpcMutate } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { PROOF_SHARE, PROOF_SHARE_FAILED } from "@/lib/proof-moment";
import { SECURED_PILL_SELF } from "@/lib/simple-log";
import { SELF_REPORTED } from "@/lib/task-ui";
import {
  proofsDateLabel,
  proofsFullBody,
  proofsGatePill,
  readOpenProof,
} from "@/lib/proofs-grid";

function ProofFullViewInner() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id?: string }>();
  const held = readOpenProof();
  const id = firstString(params.id);
  const item = held && (held.id === id || held.eventId === id) ? held : held;
  const [shareFailed, setShareFailed] = useState(false);
  const [sharing, setSharing] = useState(false);

  if (!item) {
    return (
      <View style={[styles.root, { paddingTop: insets.top + DS_V3.space.gutter }]}>
        <Button label="Done" variant="tertiary" ink onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <View style={[styles.top, { paddingTop: insets.top + DS_V3.space.sm }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close"
          onPress={() => router.back()}
          style={styles.side}
        >
          <X size={DS_V3.space.gutter} color={DS_V3.color.textPrimary} />
        </Pressable>
        <Text style={styles.header}>{proofsDateLabel(item.dateKey)}</Text>
        <View style={styles.side} />
      </View>
      {item.uri ? (
        <Image source={{ uri: item.uri }} style={styles.photo} resizeMode="cover" />
      ) : (
        <View style={styles.textPanel}>
          <Text style={styles.panelEyebrow}>{SELF_REPORTED}</Text>
          <Text style={styles.task}>{item.taskName}</Text>
          <Text style={styles.body}>{SECURED_PILL_SELF}</Text>
        </View>
      )}
      <View style={styles.copy}>
        {item.uri ? <Text style={styles.task}>{item.taskName}</Text> : null}
        <Text style={styles.body}>
          {item.uri ? proofsFullBody(item) : `${proofsFullBody(item)} · ${SELF_REPORTED}`}
        </Text>
        <View style={styles.pill}>
          <Text style={styles.pillText}>{item.uri ? proofsGatePill(item) : SELF_REPORTED}</Text>
        </View>
        {shareFailed ? <Text style={styles.fail}>{PROOF_SHARE_FAILED}</Text> : null}
      </View>
      <View style={[styles.footer, { bottom: insets.bottom + DS_V3.space.gutter }]}>
        <Button
          label={PROOF_SHARE}
          variant="secondary"
          submitting={sharing}
          onPress={() => {
            if (sharing) return;
            if (!item.eventId) {
              setShareFailed(true);
              return;
            }
            setSharing(true);
            void trpcMutate(TRPC.checkins.shareProof, { eventId: item.eventId })
              .then(() => {
                setSharing(false);
                router.back();
              })
              .catch(() => {
                setSharing(false);
                setShareFailed(true);
              });
          }}
        />
      </View>
    </View>
  );
}

export default function ProofFullViewScreen() {
  return (
    <ErrorBoundary>
      <ProofFullViewInner />
    </ErrorBoundary>
  );
}

const PT = DS_V3.space.xs / 4;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: DS_V3.color.canvas,
  },
  top: {
    height: DS_V3.size.tap + DS_V3.space.lg,
    paddingHorizontal: DS_V3.space.gutter,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  header: {
    fontSize: DS_V3.type.bodyStrong.fontSize,
    lineHeight: DS_V3.type.bodyStrong.lineHeight,
    fontWeight: DS_V3.type.bodyStrong.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  side: {
    width: DS_V3.size.tap,
  },
  photo: {
    width: "100%",
    aspectRatio: 4 / 5,
    backgroundColor: DS_V3.color.surface,
  },
  textPanel: {
    marginHorizontal: DS_V3.space.gutter,
    borderRadius: DS_V3.radius.card,
    backgroundColor: DS_V3.color.surface,
    borderWidth: PT,
    borderColor: DS_V3.color.border,
    padding: DS_V3.space.gutter,
    gap: DS_V3.space.sm,
  },
  panelEyebrow: {
    fontSize: DS_V3.type.label.fontSize,
    lineHeight: DS_V3.type.label.lineHeight,
    fontWeight: DS_V3.type.label.fontWeight,
    letterSpacing: DS_V3.type.label.letterSpacing,
    textTransform: "uppercase",
    color: DS_V3.color.textSecondary,
  },
  copy: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.lg,
    gap: DS_V3.space.sm,
  },
  task: {
    fontSize: DS_V3.type.bodyStrong.fontSize,
    lineHeight: DS_V3.type.bodyStrong.lineHeight,
    fontWeight: DS_V3.type.bodyStrong.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  body: {
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontWeight: DS_V3.type.secondary.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  pill: {
    alignSelf: "flex-start",
    minHeight: DS_V3.size.tap,
    paddingHorizontal: DS_V3.space.lg,
    borderRadius: DS_V3.radius.pill,
    backgroundColor: DS_V3.color.surface,
    borderWidth: PT,
    borderColor: DS_V3.color.border,
    justifyContent: "center",
  },
  pillText: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  fail: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  footer: {
    position: "absolute",
    left: DS_V3.space.gutter,
    right: DS_V3.space.gutter,
  },
});
