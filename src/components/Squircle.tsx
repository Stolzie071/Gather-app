import { useState, type ReactNode } from "react";
import { SquircleView } from "react-native-figma-squircle";
import type {
  LayoutChangeEvent,
  StyleProp,
  ViewStyle,
} from "react-native";

type SquircleProps = {
  children: ReactNode;
  style: StyleProp<ViewStyle>;
  cornerRadius: number;
  fillColor: string;
};

export function Squircle({
  children,
  style,
  cornerRadius,
  fillColor,
}: SquircleProps) {
  const [layoutKey, setLayoutKey] = useState("initial");

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    const nextLayoutKey = `${Math.round(width)}x${Math.round(height)}`;

    setLayoutKey((currentLayoutKey) =>
      currentLayoutKey === nextLayoutKey ? currentLayoutKey : nextLayoutKey,
    );
  };

  return (
    <SquircleView
      key={layoutKey}
      style={style}
      onLayout={handleLayout}
      squircleParams={{
        cornerRadius,
        cornerSmoothing: 0.6,
        fillColor,
      }}
    >
      {children}
    </SquircleView>
  );
}
