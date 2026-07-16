import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
import { Title } from "../components/Title";
import { Button } from "../components/Button";
import { useState } from "react";

export function HomeScreen() {
  const [title, setTitle] = useState("Gather");
  const [counter, setCount] = useState(0);
  return (
    <View style={styles.container}>
      <Title text={`${title}  ${counter}`} />
      <Button text="Играть" onPress={() => setTitle("Выберите игру")} />
      <Button
        text="Сброс"
        onPress={() => {
          setTitle("Gather");
          setCount(0);
        }}
      />
      <Button text="Прибавить 1" onPress={() => setCount(counter + 1)} />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 16,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
