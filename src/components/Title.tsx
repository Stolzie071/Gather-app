import { StyleSheet, Text } from "react-native";
import { colors } from "../theme/colors";

type TextProps = {
  text: string;
};

export function Title({ text }: TextProps) {
  return <Text style={styles.bigText}>{text}</Text>;
}

const styles = StyleSheet.create({
  bigText: {
    fontSize: 70,
    fontFamily: "Nunito_800ExtraBold",
    color: colors.textPrimary,
  },
});
