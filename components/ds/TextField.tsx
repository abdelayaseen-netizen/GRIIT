/**
 * TextField — Chunk K auth inputs.
 * surface, radius.input, 1pt border, type.body. No focus token in DS_V3.
 */
import React, { forwardRef } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";
import { DS_V3 } from "@/lib/design-system";

const PT = DS_V3.space.xs / 4;

export type TextFieldProps = {
  label?: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  trailing?: React.ReactNode;
  accessibilityLabel?: string;
  /** Default surface. Canvas on a surface sheet so the field stays one step from its ground. */
  ground?: "surface" | "canvas";
} & Pick<
  TextInputProps,
  | "secureTextEntry"
  | "keyboardType"
  | "autoCapitalize"
  | "autoCorrect"
  | "autoComplete"
  | "editable"
  | "returnKeyType"
  | "onSubmitEditing"
  | "onFocus"
  | "onBlur"
  | "textContentType"
  | "multiline"
  | "maxLength"
  | "numberOfLines"
>;

const TextField = forwardRef<TextInput, TextFieldProps>(function TextField(
  {
    label,
    value,
    onChangeText,
    placeholder,
    trailing,
    accessibilityLabel,
    ground = "surface",
    editable = true,
    ...input
  },
  ref
) {
  return (
    <View>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.field, ground === "canvas" && styles.fieldCanvas]}>
        <TextInput
          ref={ref}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={DS_V3.color.textSecondary}
          style={styles.input}
          accessibilityLabel={accessibilityLabel ?? label}
          editable={editable}
          {...input}
        />
        {trailing ? <View style={styles.trailing}>{trailing}</View> : null}
      </View>
    </View>
  );
});

export default TextField;

const styles = StyleSheet.create({
  label: {
    marginBottom: DS_V3.space.sm,
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  field: {
    minHeight: DS_V3.size.button,
    borderRadius: DS_V3.radius.input,
    backgroundColor: DS_V3.color.surface,
    borderWidth: PT,
    borderColor: DS_V3.color.border,
    paddingHorizontal: DS_V3.space.lg,
    flexDirection: "row",
    alignItems: "center",
  },
  fieldCanvas: {
    backgroundColor: DS_V3.color.canvas,
  },
  input: {
    flex: 1,
    fontSize: DS_V3.type.body.fontSize,
    lineHeight: DS_V3.type.body.lineHeight,
    fontWeight: DS_V3.type.body.fontWeight,
    color: DS_V3.color.textPrimary,
    paddingVertical: 0,
  },
  trailing: {
    width: DS_V3.size.tap,
    height: DS_V3.size.tap,
    alignItems: "center",
    justifyContent: "center",
    marginRight: -DS_V3.space.sm,
  },
});
