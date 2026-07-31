import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "@/theme/colors";

type SettingsRowProps = {
  icon: ReactNode;
  title: string;
  rightContent?: ReactNode;
  showDivider?: boolean;
  onPress?: () => void;
};

export function SettingsRow({
  icon,
  title,
  rightContent,
  showDivider,
  onPress,
}: SettingsRowProps) {
  return (
    <Pressable
      accessibilityRole={onPress ? "button" : undefined}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        pressed && onPress && styles.rowPressed,
      ]}
    >
      <View style={styles.leftContent}>
        {icon}

        <Text style={styles.text}>{title}</Text>
      </View>

      {rightContent}
      {showDivider ? <View style={styles.divider} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    position: "relative",

    minHeight: 56,
    padding: 16,
    columnGap: 16,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  rowPressed: {
    borderRadius: 20,
    backgroundColor: colors.secondary3,
  },

  leftContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },

  text: {
    flexShrink: 1,

    color: colors.textPrimary,
    fontFamily: "Nunito_700Bold",
    fontSize: 15,
  },

  divider: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,

    height: 1.5,
    backgroundColor: colors.secondary3,
  },
});
