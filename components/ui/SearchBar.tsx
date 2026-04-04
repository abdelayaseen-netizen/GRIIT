import React from "react";
import { View, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Search, X } from "lucide-react-native";
import { DS_COLORS, DS_RADIUS } from "@/lib/design-system"

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
      <Search size={16} color={DS_COLORS.TEXT_MUTED} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={DS_COLORS.TEXT_MUTED}
        value={value}
        onChangeText={onChangeText}
        editable={editable}
        returnKeyType="search"
        accessibilityLabel="Search challenges"
        accessibilityRole="search"
      />
      {value.length > 0 && onClear && (
        <TouchableOpacity onPress={onClear} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} accessibilityLabel="Clear search" accessibilityRole="button">
          <X size={16} color={DS_COLORS.TEXT_MUTED} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    height: 44,
    backgroundColor: DS_COLORS.BG_CARD,
    borderRadius: DS_RADIUS.MD,
    paddingHorizontal: 14,
    borderWidth: 0,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: "400" as const,
    color: DS_COLORS.TEXT_PRIMARY,
    paddingVertical: 0,
  },
});
