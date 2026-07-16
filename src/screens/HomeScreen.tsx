import { StatusBar } from "expo-status-bar";
import { StyleSheet, View, Text } from "react-native";
import { Title } from "../components/Title";
import { Button } from "../components/Button";
import DiceIcon from "../../assets/icons/mini_dice_1.svg";
import CupIcon from "../../assets/icons/Cup.svg";
import ArrowIcon from "../../assets/icons/Arrow.svg";
import { colors } from "../theme/colors";

export function HomeScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.mainContent}>
        <View style={styles.titleBlock}>
          <Title text="Gather" />
          <Text>Игры для компании</Text>
        </View>

        <View style={styles.buttonsBlock}>
          <Button
            text="Играть"
            onPress={() => {}}
            icon={<DiceIcon width={36} height={36} />}
            rightIcon={
              <ArrowIcon width={13} height={23} color={colors.surface} />
            }
          />
          <Button
            text="Статистика"
            onPress={() => {}}
            variant="secondary"
            icon={<CupIcon width={36} height={36} />}
            rightIcon={
              <ArrowIcon width={13} height={23} color={colors.textPrimary} />
            }
          />
        </View>
      </View>

      <Text style={styles.version}>v.0.1</Text>

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 350,
    paddingBottom: 20,
    backgroundColor: "#fff",
  },

  titleBlock: {
    alignItems: "center",
    gap: 16,
  },

  buttonsBlock: {
    gap: 16,
    width: 320,
  },

  mainContent: {
    alignItems: "center",
    gap: 36,
  },

  version: {},
});
