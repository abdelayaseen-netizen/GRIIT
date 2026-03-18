import React from "react";
import { View, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Search, X } from "lucide-react-native";
import { colors, iconSizes } from "@/src/theme/tokens";
import { DS_COLORS } from "@/lib/design-system";

export function SearchBar(props: {
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  onClear?: () => void;
  editable?: boolean;
  containerStyle?: import("react-native").StyleProp<import("react-native").ViewStyle>;
}) {
  const { value, onChangeText, placeholder = "Search challenges…", onClear, editable = true, containerStyle } = props;
  return (
    <View style={[styles.container, containerStyle]}>
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
    height: 48,
    backgroundColor: DS_COLORS.CARD_ALT_BG,
    borderRadius: 12,
    paddingHorizontal: 14,
    borderWidth: 0,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: "400" as const,
    color: colors.textPrimary,
    paddingVertical: 0,
  },
});
