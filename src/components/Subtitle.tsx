import { StyleSheet, Text } from "react-native";
import { colors } from "../theme/colors";

type TextProps = {
  text: string;
};

export function SubTitle({ text }: TextProps) {
  return <Text style={styles.smallText}>{text}</Text>;
}

const styles = StyleSheet.create({
  smallText: {
    fontSize: 15,
    opacity: 0.6,
    fontFamily: "Nunito_600SemiBold",
    color: colors.textSecondary,
  },
});
