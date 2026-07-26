import { StyleSheet, Text } from "react-native";
import { colors } from "../theme/colors";

type TextProps = {
  text: string;
  compact?: boolean;
};

export function Title({ text, compact = false }: TextProps) {
  return (
    <Text style={[styles.bigText, compact && styles.bigTextCompact]}>
      {text}
    </Text>
  );
}

const styles = StyleSheet.create({
  bigText: {
    fontSize: 70,
    fontFamily: "Nunito_800ExtraBold",
    color: colors.textPrimary,
  },

  bigTextCompact: {
    fontSize: 58,
  },
});
