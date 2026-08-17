import { useEffect, useState, type ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { SpySummaryPenIcon } from "@assets/Spy_game/4_step";
import { SelectionIndicator } from "@/components/SelectionIndicator";
import { Squircle } from "@/components/Squircle";
import { useAppHaptics } from "@/haptics/useAppHaptics";
import { colors } from "@/theme/colors";

const MANAGEMENT_HEIGHT = 76;
const MANAGEMENT_TOP_OVERLAP = 20;

type EditActionProps = {
  label: string;
  onPress: () => void;
};

function EditAction({ label, onPress }: EditActionProps) {
  const { playTopAction } = useAppHaptics();
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={() => {
        playTopAction();
        onPress();
      }}
      onPressIn={() => {
        scale.value = withTiming(0.98, { duration: 70 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, {
          damping: 18,
          stiffness: 330,
          mass: 0.7,
        });
      }}
      style={styles.editActionPressable}
    >
      <Animated.View style={[styles.editActionAnimated, animatedStyle]}>
        <Squircle
          style={styles.editAction}
          cornerRadius={12}
          fillColor={colors.background}
          strokeColor={colors.secondary4}
          strokeWidth={1}
        >
          <SpySummaryPenIcon
            width={17}
            height={17}
            color={colors.secondary}
          />
          <Text style={styles.editActionLabel}>{label}</Text>
        </Squircle>
      </Animated.View>
    </Pressable>
  );
}

type PackCardProps = {
  illustration: ReactNode;
  title: string;
  wordCountLabel: string;
  selected: boolean;
  disabled?: boolean;
  managementExpanded?: boolean;
  editLabel?: string;
  onEdit?: () => void;
  onPress: () => void;
};

export function PackCard({
  illustration,
  title,
  wordCountLabel,
  selected,
  disabled = false,
  managementExpanded = false,
  editLabel,
  onEdit,
  onPress,
}: PackCardProps) {
  const { playSelection } = useAppHaptics();
  const scale = useSharedValue(1);
  const expansionProgress = useSharedValue(managementExpanded ? 1 : 0);
  const [managementMounted, setManagementMounted] =
    useState(managementExpanded);
  const hasManagement = Boolean(onEdit && editLabel);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const managementStyle = useAnimatedStyle(() => ({
    height: MANAGEMENT_HEIGHT * expansionProgress.value,
    marginTop: -MANAGEMENT_TOP_OVERLAP * expansionProgress.value,
    opacity: expansionProgress.value,
  }));

  useEffect(() => {
    if (!hasManagement) {
      return;
    }

    if (managementExpanded) {
      setManagementMounted(true);
      expansionProgress.value = withTiming(1, { duration: 220 });
      return;
    }

    expansionProgress.value = withTiming(0, { duration: 200 });

    if (!managementMounted) {
      return;
    }

    const unmountTimer = setTimeout(() => {
      setManagementMounted(false);
    }, 210);

    return () => clearTimeout(unmountTimer);
  }, [
    expansionProgress,
    hasManagement,
    managementExpanded,
    managementMounted,
  ]);

  const handleHeaderPress = () => {
    playSelection();
    onPress();
  };

  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityLabel={title}
        accessibilityState={{
          checked: selected,
          disabled,
          ...(hasManagement ? { expanded: managementExpanded } : {}),
        }}
        disabled={disabled}
        onPress={handleHeaderPress}
        onPressIn={() => {
          scale.value = withTiming(0.97, { duration: 75 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, {
            damping: 18,
            stiffness: 320,
            mass: 0.7,
          });
        }}
        style={styles.pressable}
      >
        <Animated.View
          style={[
            styles.headerLayer,
            styles.shadow,
            selected && styles.shadowSelected,
            disabled && styles.disabled,
            animatedStyle,
          ]}
        >
          <Squircle
            style={styles.card}
            cornerRadius={20}
            fillColor={selected ? colors.secondary3 : colors.surface}
            strokeColor={selected ? colors.primary : undefined}
            strokeWidth={selected ? 1.5 : undefined}
          >
            <View pointerEvents="none" style={styles.illustration}>
              {illustration}
            </View>

            <View style={styles.information}>
              <Text style={styles.title} numberOfLines={hasManagement ? 2 : 1}>
                {title}
              </Text>
              <Text style={styles.wordCount} numberOfLines={1}>
                {wordCountLabel}
              </Text>
            </View>

            <View pointerEvents="none" style={styles.selection}>
              <SelectionIndicator selected={selected} />
            </View>
          </Squircle>
        </Animated.View>
      </Pressable>

      {managementMounted && editLabel && onEdit && (
        <Animated.View
          pointerEvents={managementExpanded ? "auto" : "none"}
          style={[styles.managementClip, managementStyle]}
        >
          <Squircle
            style={styles.management}
            cornerRadius={20}
            fillColor={colors.secondary3}
            strokeColor={colors.secondary4}
            strokeWidth={1}
          >
            <EditAction label={editLabel} onPress={onEdit} />
          </Squircle>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  headerLayer: {
    zIndex: 2,
  },
  pressable: {
    position: "relative",
    zIndex: 2,
    width: "100%",
  },
  shadow: {
    width: "100%",
    borderRadius: 20,
    backgroundColor: colors.surface,
    boxShadow: [
      {
        offsetX: 0,
        offsetY: 0,
        blurRadius: 5,
        spreadDistance: 0,
        color: "rgba(118, 92, 172, 0.25)",
      },
    ],
  },
  shadowSelected: {
    backgroundColor: colors.secondary3,
  },
  disabled: {
    opacity: 0.45,
  },
  card: {
    width: "100%",
    height: 112,
    paddingLeft: 14,
    paddingRight: 22,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
  },
  illustration: {
    width: 116,
    height: 84,
    borderRadius: 10,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  information: {
    flex: 1,
    marginLeft: 12,
    paddingRight: 32,
    gap: 2,
  },
  title: {
    color: colors.textPrimary,
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 16,
    lineHeight: 22,
  },
  wordCount: {
    color: colors.textSecondary,
    fontFamily: "Nunito_600SemiBold",
    fontSize: 12,
    lineHeight: 17,
  },
  selection: {
    position: "absolute",
    top: 46,
    right: 22,
  },
  managementClip: {
    overflow: "hidden",
  },
  management: {
    width: "100%",
    height: MANAGEMENT_HEIGHT,
    paddingTop: MANAGEMENT_TOP_OVERLAP + 8,
    paddingRight: 12,
    paddingBottom: 8,
    paddingLeft: 12,
  },
  editActionPressable: {
    flex: 1,
    width: "100%",
  },
  editActionAnimated: {
    flex: 1,
    width: "100%",
  },
  editAction: {
    flex: 1,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    overflow: "hidden",
  },
  editActionLabel: {
    color: colors.secondary,
    fontFamily: "Nunito_700Bold",
    fontSize: 14,
    lineHeight: 19,
  },
});
