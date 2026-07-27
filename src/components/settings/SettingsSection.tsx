import { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

import { colors } from "@/theme/colors";
import { Squircle } from "../Squircle";

type SettingsSectionProps = {
  title?: string;
  children: ReactNode;
};

export function SettingsSection({ title, children }: SettingsSectionProps) {
  return (
    <View style={styles.section}>
      {title ? <Text style={styles.title}>{title}</Text> : null}

      <Squircle
        style={styles.card}
        cornerRadius={20}
        fillColor={colors.surface}
        strokeColor={colors.secondary3}
        strokeWidth={1.5}
      >
        {children}
      </Squircle>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 16,
  },

  title: {
    marginBottom: 8,

    color: colors.textSecondary,
    fontFamily: "Nunito_700Bold",
    fontSize: 14,
  },

  card: {
    width: "100%",
  },
});
