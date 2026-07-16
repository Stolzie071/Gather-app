import { StyleSheet, Text } from "react-native";

type TitleProps = {
  text: string;
};

export function Title({ text }: TitleProps) {
  return <Text style={styles.bigText}>{text}</Text>;
}

const styles = StyleSheet.create({
  bigText: {
    fontSize: 64,
    fontFamily: "Nunito_800ExtraBold",
  },
});
