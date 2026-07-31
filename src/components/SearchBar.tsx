import type { StyleProp, ViewStyle } from "react-native";
import { StyleSheet, TextInput } from "react-native";

import { SearchIcon } from "@assets/icons";
import { colors } from "@/theme/colors";

import { Squircle } from "./Squircle";

type SearchBarProps = {
  value: string;
  placeholder: string;
  onChangeText: (text: string) => void;
  style?: StyleProp<ViewStyle>;
  cornerRadius?: number;
  strokeWidth?: number;
};

export function SearchBar({
  value,
  placeholder,
  onChangeText,
  style,
  cornerRadius = 18,
  strokeWidth = 2,
}: SearchBarProps) {
  return (
    <Squircle
      style={[styles.container, style]}
      cornerRadius={cornerRadius}
      fillColor={colors.surface}
      strokeColor={colors.secondary3}
      strokeWidth={strokeWidth}
    >
      <SearchIcon width={19} height={19} />

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="rgba(111, 108, 164, 0.7)"
        style={styles.input}
        autoCorrect={false}
        returnKeyType="search"
      />
    </Squircle>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 44,
    paddingHorizontal: 20,

    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },

  input: {
    flex: 1,
    padding: 0,

    fontSize: 14,
    fontFamily: "Nunito_600SemiBold",
    color: colors.textPrimary,
  },
});
