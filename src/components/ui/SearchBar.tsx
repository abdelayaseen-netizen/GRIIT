import React from "react";
import { View, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Search, X } from "lucide-react-native";
import {
  colors,
  radius,
  borders,
  iconSizes,
  measures,
  spacing,
  typography,
} from "@/src/theme/tokens";

export function SearchBar(props: {
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  onClear?: () => void;
  editable?: boolean;
}) {
  const { value, onChangeText, placeholder = "Search challenges…", onClear, editable = true } = props;
  return (
    <View style={styles.container}>
      <Search size={iconSizes.search} color={colors.searchIcon} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={colors.searchPlaceholder}
        value={value}
        onChangeText={onChangeText}
        editable={editable}
        returnKeyType="search"
        accessibilityLabel="Search challenges"
        accessibilityRole="search"
      />
      {value.length > 0 && onClear && (
        <TouchableOpacity onPress={onClear} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} accessibilityLabel="Clear search" accessibilityRole="button">
          <X size={16} color={colors.searchIcon} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    height: measures.searchHeight,
    backgroundColor: colors.surface,
    borderRadius: radius.searchBar,
    paddingHorizontal: spacing.lg,
    borderWidth: borders.search.borderWidth,
    borderColor: borders.search.borderColor,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: typography.cardDescription.fontSize,
    fontWeight: "600",
    color: colors.textPrimary,
    paddingVertical: 0,
  },
});
