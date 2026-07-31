import { HomeScreen } from "./src/screens/HomeScreen";
import { useFonts } from "expo-font";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Nunito_600SemiBold } from "@expo-google-fonts/nunito/600SemiBold";
import { Nunito_700Bold } from "@expo-google-fonts/nunito/700Bold";
import { Nunito_800ExtraBold } from "@expo-google-fonts/nunito/800ExtraBold";
import { Nunito_900Black } from "@expo-google-fonts/nunito/900Black";
import { LocalizationProvider } from "@/localization/LocalizationProvider";
import { NavigationContainer } from "@react-navigation/native";
import { createBlankStackNavigator } from "react-native-screen-transitions/blank-stack";
import { GameListScreen } from "./src/screens/GameListScreen";
import type { RootStackParamList } from "@/navigation/types";
import { SpyGameScreen, SpySetupScreen } from "@/games/spy";
import { AliasGameScreen } from "./src/screens/games/AliasGameScreen";
import { MafiaGameScreen } from "./src/screens/games/MafiaGameScreen";
import { iosPageTransition } from "@/navigation/transitions";
import { FavoritesProvider } from "@/favorites/FavoritesProvider";
import { PlayersProvider } from "@/players/PlayersProvider";
import { SettingsProvider } from "@/settings/SettingsProvider";

const Stack = createBlankStackNavigator<RootStackParamList>();

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
                <NavigationContainer>
                  <Stack.Navigator
                    initialRouteName="Home"
                    nativeScreens={false}
                  >
                    <Stack.Screen name="Home" component={HomeScreen} />
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
              </PlayersProvider>
            </FavoritesProvider>
          </LocalizationProvider>
        </SettingsProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
