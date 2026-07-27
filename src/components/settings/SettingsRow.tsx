import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

import { colors } from "@/theme/colors";

type SettingsRowProps = {
  icon: ReactNode;
  title: string;
  rightContent?: ReactNode;
  showDivider?: boolean;
};

export function SettingsRow({
  icon,
  title,
  rightContent,
  showDivider,
}: SettingsRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.leftContent}>
        {icon}

        <Text style={styles.text}>{title}</Text>
      </View>

      {rightContent}
      {showDivider ? <View style={styles.divider} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    position: "relative",

    minHeight: 56,
    padding: 14,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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

    height: 1,
    backgroundColor: colors.secondary3,
  },
});
