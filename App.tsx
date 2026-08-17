import { useCallback, useState } from "react";
import { HomeScreen } from "./src/screens/HomeScreen";
import { useFonts } from "expo-font";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Nunito_600SemiBold } from "@expo-google-fonts/nunito/600SemiBold";
import { Nunito_700Bold } from "@expo-google-fonts/nunito/700Bold";
import { Nunito_800ExtraBold } from "@expo-google-fonts/nunito/800ExtraBold";
import { Nunito_900Black } from "@expo-google-fonts/nunito/900Black";
import {
  LocalizationProvider,
  useLocalization,
} from "@/localization/LocalizationProvider";
import {
  NavigationContainer,
  useNavigationContainerRef,
} from "@react-navigation/native";
import { createBlankStackNavigator } from "react-native-screen-transitions/blank-stack";
import { GameListScreen } from "./src/screens/GameListScreen";
import { StatisticsScreen } from "./src/screens/StatisticsScreen";
import { PlayerStatisticsScreen } from "./src/screens/PlayerStatisticsScreen";
import type { RootStackParamList } from "@/navigation/types";
import {
  SpyGameScreen,
  SpyRevealScreen,
  SpyResultsScreen,
  SpySetupScreen,
  SpyTimerScreen,
} from "@/games/spy";
import { AliasGameScreen } from "./src/screens/games/AliasGameScreen";
import { MafiaGameScreen } from "./src/screens/games/MafiaGameScreen";
import { iosPageTransition } from "@/navigation/transitions";
import { FavoritesProvider } from "@/favorites/FavoritesProvider";
import { PlayersProvider } from "@/players/PlayersProvider";
import { SettingsProvider } from "@/settings/SettingsProvider";
import { SpySessionProvider } from "@/games/spy/SpySessionProvider";
import { SpyContentProvider } from "@/games/spy/content/SpyContentProvider";
import { GameHistoryProvider } from "@/history/GameHistoryProvider";
import { useSpySession } from "@/games/spy/SpySessionProvider";
import { ExitGameDialog } from "@/components";
import { StyleSheet, useWindowDimensions, View } from "react-native";

const Stack = createBlankStackNavigator<RootStackParamList>();

function AppNavigation() {
  const { t } = useLocalization();
  const {
    activeSession,
    isSessionLoaded,
    needsRecovery,
    resumeSession,
    clearSession,
  } = useSpySession();
  const navigationRef = useNavigationContainerRef<RootStackParamList>();
  const { width, height } = useWindowDimensions();
  const [isNavigationReady, setIsNavigationReady] = useState(false);
  const compact = height < 700 || width < 350;

  const handleResumeSession = useCallback(() => {
    if (!activeSession || !navigationRef.isReady()) {
      return;
    }

    const targetRoute =
      activeSession.phase === "revealing"
        ? ("SpyReveal" as const)
        : activeSession.phase === "results"
          ? ("SpyResults" as const)
          : ("SpyTimer" as const);

    resumeSession();
    navigationRef.resetRoot({
      index: 3,
      routes: [
        { name: "Home" },
        { name: "GameList" },
        { name: "SpyGame" },
        { name: targetRoute },
      ],
    });
  }, [activeSession, navigationRef, resumeSession]);

  return (
    <View style={styles.appContainer}>
      <NavigationContainer
        ref={navigationRef}
        onReady={() => setIsNavigationReady(true)}
      >
        <Stack.Navigator initialRouteName="Home" nativeScreens={false}>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen
            name="Statistics"
            component={StatisticsScreen}
            options={iosPageTransition}
          />
          <Stack.Screen
            name="PlayerStatistics"
            component={PlayerStatisticsScreen}
            options={iosPageTransition}
          />
          <Stack.Screen
            name="GameList"
            component={GameListScreen}
            options={iosPageTransition}
          />
          <Stack.Screen
            name="SpyGame"
            component={SpyGameScreen}
            options={iosPageTransition}
          />
          <Stack.Screen
            name="SpySetup"
            component={SpySetupScreen}
            options={iosPageTransition}
          />
          <Stack.Screen
            name="SpyReveal"
            component={SpyRevealScreen}
            options={iosPageTransition}
          />
          <Stack.Screen
            name="SpyTimer"
            component={SpyTimerScreen}
            options={iosPageTransition}
          />
          <Stack.Screen
            name="SpyResults"
            component={SpyResultsScreen}
            options={iosPageTransition}
          />
          <Stack.Screen
            name="AliasGame"
            component={AliasGameScreen}
            options={iosPageTransition}
          />
          <Stack.Screen
            name="MafiaGame"
            component={MafiaGameScreen}
            options={iosPageTransition}
          />
        </Stack.Navigator>
      </NavigationContainer>

      <ExitGameDialog
        visible={
          isSessionLoaded && isNavigationReady && needsRecovery
        }
        onStay={clearSession}
        onExit={handleResumeSession}
        compact={compact}
        title={t("resumeGameDialog.title")}
        message={t("resumeGameDialog.message")}
        stayLabel={t("resumeGameDialog.leave")}
        exitLabel={t("resumeGameDialog.resume")}
      />
    </View>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
    Nunito_900Black,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SettingsProvider>
          <LocalizationProvider>
            <FavoritesProvider>
              <PlayersProvider>
                <SpyContentProvider>
                  <GameHistoryProvider>
                    <SpySessionProvider>
                      <AppNavigation />
                    </SpySessionProvider>
                  </GameHistoryProvider>
                </SpyContentProvider>
              </PlayersProvider>
            </FavoritesProvider>
          </LocalizationProvider>
        </SettingsProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
  },
});
