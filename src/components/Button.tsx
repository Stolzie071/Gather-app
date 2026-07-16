import { Pressable, StyleSheet, Text } from "react-native";

type ButtonProps = {
  text: string;
  onPress: () => void;
};

export function Button({ text, onPress }: ButtonProps) {
  return (
    <Pressable style={styles.button} onPress={onPress}>
      <Text style={styles.text}>{text}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#7C5CFC",
  },
  text: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});
