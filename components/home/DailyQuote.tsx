import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { getDailyQuote } from "@/lib/quotes";

export default function DailyQuote() {
  return (
    <View style={s.wrap}>
      <Text style={s.text}>{`"${getDailyQuote()}"`}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    paddingHorizontal: 24,
    paddingTop: 12,
    borderLeftWidth: 2,
    borderLeftColor: "#E8593C",
    paddingLeft: 12,
    marginLeft: 24,
  },
  text: {
    fontSize: 13,
    color: "#888",
    fontStyle: "italic",
    lineHeight: 18,
  },
});
