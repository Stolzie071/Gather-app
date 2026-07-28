import AsyncStorage from "@react-native-async-storage/async-storage";

const FAVORITE_GAME_IDS_KEY = "@gather/favorite-game-ids";

export async function loadFavoriteGameIds() {
  const storedValue = await AsyncStorage.getItem(FAVORITE_GAME_IDS_KEY);

  if (!storedValue) {
    return [];
  }

  const parsedValue: unknown = JSON.parse(storedValue);

  if (!Array.isArray(parsedValue)) {
    return [];
  }

  return parsedValue.filter(
    (gameId): gameId is string => typeof gameId === "string",
  );
}

export async function saveFavoriteGameIds(gameIds: ReadonlySet<string>) {
  await AsyncStorage.setItem(
    FAVORITE_GAME_IDS_KEY,
    JSON.stringify([...gameIds]),
  );
}
