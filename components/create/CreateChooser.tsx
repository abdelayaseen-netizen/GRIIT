/**
 * Build 92 01.3 · Create chooser (P0-14).
 * Opens from the Create tab and the shrunk bar's "+ Create". Two rows:
 * "Log today's task" (the next open task; disabled with "Every task today is done." when
 * today is secured) and "Create a challenge" (the Create wizard). Never a post sheet.
 * The previously selected tab stays selected behind the sheet.
 */
import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { ChevronRight, CircleCheck, CirclePlus } from "lucide-react-native";
import { GlassSheet } from "@/components/ds/glass";
import { DS_V3 } from "@/lib/design-system";
import { GLASS_RADIUS, GLASS_STATE } from "@/lib/glass";
import { ROUTES } from "@/lib/routes";
import {
  CREATE_CHOOSER_COPY,
  closeCreateChooser,
  createChooserRows,
  subscribeCreateChooser,
  type CreateChooserRow,
} from "@/lib/create-chooser";

export default function CreateChooser() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<CreateChooserRow[]>(() => createChooserRows());

  useEffect(
    () =>
      subscribeCreateChooser((next) => {
        setOpen(next);
        setRows(createChooserRows());
      }),
    [],
  );

  const onRow = (row: CreateChooserRow) => {
    if (row.disabled) return;
    closeCreateChooser();
    if (row.id === "create") {
      router.push(ROUTES.CREATE_WIZARD as never);
      return;
    }
    if (row.href) router.push(row.href as never);
  };

  return (
    <GlassSheet
      visible={open}
      onClose={closeCreateChooser}
      label={CREATE_CHOOSER_COPY.title}
      title={CREATE_CHOOSER_COPY.title}
      testID="create-chooser"
    >
      {rows.map((row, i) => (
        <Pressable
          key={row.id}
          testID={`create-chooser-${row.id}`}
          accessibilityRole="button"
          accessibilityLabel={row.subtitle ? `${row.title}. ${row.subtitle}` : row.title}
          accessibilityState={{ disabled: row.disabled }}
          disabled={row.disabled}
          onPress={() => onRow(row)}
          style={({ pressed }) => [
            styles.row,
            i > 0 ? styles.rowDivider : null,
            pressed ? styles.rowPressed : null,
            row.disabled ? styles.rowDisabled : null,
          ]}
        >
          <View style={styles.icon}>
            {row.id === "log" ? (
              <CircleCheck size={22} color={DS_V3.color.textPrimary} />
            ) : (
              <CirclePlus size={22} color={DS_V3.color.textPrimary} />
            )}
          </View>
          <View style={styles.text}>
            <Text style={styles.title} numberOfLines={1}>
              {row.title}
            </Text>
            {row.subtitle ? (
              <Text style={styles.subtitle} numberOfLines={2}>
                {row.subtitle}
              </Text>
            ) : null}
          </View>
          <ChevronRight size={20} color={DS_V3.color.textSecondary} />
        </Pressable>
      ))}
    </GlassSheet>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  rowDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: GLASS_STATE.rowDivider,
  },
  rowPressed: { opacity: 0.8 },
  rowDisabled: { opacity: GLASS_STATE.disabledOpacity },
  icon: {
    width: DS_V3.size.tap,
    height: DS_V3.size.tap,
    borderRadius: GLASS_RADIUS.rowIcon,
    backgroundColor: GLASS_STATE.secondaryFill,
    alignItems: "center",
    justifyContent: "center",
  },
  text: { flex: 1, minWidth: 0, gap: 2 },
  title: {
    fontSize: DS_V3.type.body.fontSize,
    lineHeight: DS_V3.type.body.lineHeight,
    fontWeight: "500",
    color: DS_V3.color.textPrimary,
  },
  subtitle: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: "400",
    color: DS_V3.color.textSecondary,
  },
});
