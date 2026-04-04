import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { getRandomQuote } from "@/lib/quotes";
import { GRIIT_COLORS, DS_COLORS, DS_RADIUS } from "@/lib/design-system"

export default React.memo(function DailyQuote() {
  const [quote, setQuote] = useState(() => getRandomQuote());

  useFocusEffect(
    useCallback(() => {
      setQuote(getRandomQuote());
    }, [])
  );

  return (
    <View style={s.quoteContainer} accessibilityRole="text">
      <View style={s.quoteAccent} />
      <View style={s.quoteContent}>
        <Text style={s.quoteText}>&ldquo;{quote.text}&rdquo;</Text>
        <Text style={s.quoteAuthor}>— {quote.author}</Text>
      </View>
    </View>
  );
});

const s = StyleSheet.create({
  quoteContainer: {
    flexDirection: "row",
    marginBottom: 20,
    marginHorizontal: 16,
  },
  quoteAccent: {
    width: 3,
    borderRadius: DS_RADIUS.SM,
    backgroundColor: GRIIT_COLORS.primary,
    marginRight: 12,
  },
  quoteContent: {
    flex: 1,
  },
  quoteText: {
    fontSize: 14,
    fontStyle: "normal",
    color: DS_COLORS.textSecondary,
    lineHeight: 21,
    marginBottom: 4,
  },
  quoteAuthor: {
    fontSize: 12,
    color: DS_COLORS.TEXT_TERTIARY,
    fontWeight: "500",
  },
});
