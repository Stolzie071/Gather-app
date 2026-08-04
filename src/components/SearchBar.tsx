import { useRef } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { Pressable, StyleSheet, TextInput } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { SearchIcon } from "@assets/icons";
import { colors } from "@/theme/colors";

import { Squircle } from "./Squircle";

type SearchBarProps = {
  value: string;
  placeholder: string;
  onChangeText: (text: string) => void;
  style?: StyleProp<ViewStyle>;
  cornerRadius?: number;
  strokeWidth?: number;
};

export function SearchBar({
  value,
  placeholder,
  onChangeText,
  style,
  cornerRadius = 18,
  strokeWidth = 2,
}: SearchBarProps) {
  const inputRef = useRef<TextInput>(null);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withTiming(0.98, { duration: 70 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {
      damping: 18,
      stiffness: 320,
      mass: 0.7,
    });
  };

  return (
    <Pressable
      style={[styles.pressable, style]}
      onPress={() => inputRef.current?.focus()}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={[styles.animatedContainer, animatedStyle]}>
        <Squircle
          style={styles.container}
          cornerRadius={cornerRadius}
          fillColor={colors.surface}
          strokeColor={colors.secondary3}
          strokeWidth={strokeWidth}
        >
          <SearchIcon width={19} height={19} />

          <TextInput
            ref={inputRef}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor="rgba(111, 108, 164, 0.7)"
            style={styles.input}
            autoCorrect={false}
            returnKeyType="search"
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
          />
        </Squircle>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    width: "100%",
    height: 44,
  },
  animatedContainer: {
    width: "100%",
    height: "100%",
  },
  container: {
    width: "100%",
    height: "100%",
    paddingHorizontal: 20,

    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },

  input: {
    flex: 1,
    padding: 0,

    fontSize: 14,
    fontFamily: "Nunito_600SemiBold",
    color: colors.textPrimary,
  },
});
