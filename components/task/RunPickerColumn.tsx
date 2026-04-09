import React, { useRef, useLayoutEffect } from "react";
import { View, Text, ScrollView, type NativeSyntheticEvent, type NativeScrollEvent } from "react-native";
import { DS_COLORS, DS_TYPOGRAPHY } from "@/lib/design-system";

export const RUN_PICKER_ITEM_H = 40;
export const RUN_PICKER_PAD = 40;

export const RUN_WHOLE_KM = Array.from({ length: 51 }, (_, i) => String(i));
export const RUN_DEC_KM = Array.from({ length: 10 }, (_, i) => String(i));
export const RUN_DURATION_ITEMS = Array.from({ length: 181 }, (_, i) => String(i));

export function parseRunKmParts(s: string): { whole: number; dec: number } {
  const t = s.replace(",", ".").trim();
  if (!t) return { whole: 0, dec: 0 };
  const [w, d = "0"] = t.split(".");
  let whole = parseInt(w || "0", 10);
  if (!Number.isFinite(whole)) whole = 0;
  whole = Math.min(50, Math.max(0, whole));
  let dec = parseInt(String(d).slice(0, 1) || "0", 10);
  if (!Number.isFinite(dec)) dec = 0;
  dec = Math.min(9, Math.max(0, dec));
  return { whole, dec };
}

export function RunPickerColumn({
  data,
  selectedIndex,
  onSelectIndex,
}: {
  data: string[];
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
}) {
  const scrollRef = useRef<ScrollView>(null);
  const safeIdx = Math.max(0, Math.min(data.length - 1, selectedIndex));

  useLayoutEffect(() => {
    scrollRef.current?.scrollTo({ y: safeIdx * RUN_PICKER_ITEM_H, animated: false });
  }, [safeIdx, data.length]);

  return (
    <ScrollView
      ref={scrollRef}
      style={{ flex: 1, height: 120 }}
      showsVerticalScrollIndicator={false}
      snapToInterval={RUN_PICKER_ITEM_H}
      snapToAlignment="start"
      decelerationRate="fast"
      nestedScrollEnabled
      contentContainerStyle={{ paddingVertical: RUN_PICKER_PAD }}
      onMomentumScrollEnd={(e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const y = e.nativeEvent.contentOffset.y;
        let i = Math.round(y / RUN_PICKER_ITEM_H);
        i = Math.max(0, Math.min(data.length - 1, i));
        onSelectIndex(i);
      }}
    >
      {data.map((label, index) => (
        <View
          key={`${label}-${index}`}
          style={{
            height: RUN_PICKER_ITEM_H,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text
            style={
              index === safeIdx
                ? {
                    fontSize: 20,
                    fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD,
                    color: DS_COLORS.TEXT_PRIMARY,
                  }
                : { fontSize: 16, fontWeight: "400", color: DS_COLORS.TEXT_MUTED }
            }
          >
            {label}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}
