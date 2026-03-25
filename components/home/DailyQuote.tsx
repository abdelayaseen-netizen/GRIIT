import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { getDailyQuote } from "@/lib/quotes";
import { DS_COLORS } from "@/lib/design-system";

export default React.memo(function DailyQuote() {
  return (
    <View style={s.wrap}>
      <Text style={s.text}>{`"${getDailyQuote()}"`}</Text>
    </View>
  );
});

const s = StyleSheet.create({
  wrap: {
    paddingHorizontal: 24,
    paddingTop: 12,
    borderLeftWidth: 2,
    borderLeftColor: DS_COLORS.DISCOVER_CORAL,
    paddingLeft: 12,
    marginLeft: 24,
  },
  text: {
    fontSize: 14,
    color: DS_COLORS.textSecondary,
    fontStyle: "normal",
    lineHeight: 21,
  },
});
