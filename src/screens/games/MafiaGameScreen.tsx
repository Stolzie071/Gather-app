import { StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BackButton } from "@/components";
import { useLocalization } from "@/localization/LocalizationProvider";
import type { RootStackParamList } from "@/navigation/types";
import { colors } from "@/theme/colors";

type MafiaGameScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "MafiaGame"
>;

export function MafiaGameScreen({ navigation }: MafiaGameScreenProps) {
  const { t } = useLocalization();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("gameList.games.mafia.title")}</Text>

      <BackButton
        onPress={() => navigation.goBack()}
        style={{
          position: "absolute",
          top: insets.top + 16,
          left: 16,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },

  title: {
    fontSize: 28,
    fontFamily: "Nunito_800ExtraBold",
    color: colors.textPrimary,
  },
});
