import { useRef, useState, type ReactNode } from "react";
import { SquircleView } from "react-native-figma-squircle";
import {
  StyleSheet,
  View,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from "react-native";

type SquircleProps = {
  children: ReactNode;
  style: StyleProp<ViewStyle>;
  cornerRadius: number;
  fillColor: string;
  strokeColor?: string;
  strokeWidth?: number;
};

export function Squircle({
  children,
  style,
  cornerRadius,
  fillColor,
  strokeColor,
  strokeWidth,
}: SquircleProps) {
  const initialLayout = useRef<string | null>(null);
  const [layoutVersion, setLayoutVersion] = useState(0);

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    const nextLayoutKey = `${Math.round(width)}x${Math.round(height)}`;

    if (initialLayout.current === null) {
      initialLayout.current = nextLayoutKey;
      return;
    }

    if (initialLayout.current !== nextLayoutKey) {
      initialLayout.current = nextLayoutKey;
      setLayoutVersion((currentVersion) => currentVersion + 1);
    }
  };

  return (
    <View style={style} onLayout={handleLayout}>
      <SquircleView
        key={layoutVersion}
        pointerEvents="none"
        style={StyleSheet.absoluteFill}
        squircleParams={{
          cornerRadius,
          cornerSmoothing: 0.6,
          fillColor,
          strokeColor,
          strokeWidth,
        }}
      />

      {children}
    </View>
  );
}
