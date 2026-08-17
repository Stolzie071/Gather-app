import { memo, useState, type ComponentType } from "react";
import {
  FlatList,
  type LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import type { SvgProps } from "react-native-svg";

import { PackCard, SetupStepNavigation } from "@/components";
import type { SpyContentCategoryId } from "@/games/spy/content/categories";
import { useAppHaptics } from "@/haptics/useAppHaptics";
import { useLocalization } from "@/localization/LocalizationProvider";
import { colors } from "@/theme/colors";

const DESIGN_WIDTH = 402;
const PAGE_HEADING_HEIGHT = 53;
const HEADING_GAP = 16;
const CARD_SHADOW_SPACE = 6;
const TOP_LIST_FADE_HEIGHT = 8;
const BOTTOM_LIST_FADE_HEIGHT = 16;
const NAVIGATION_HEIGHT = 48;
const NAVIGATION_BOTTOM_SPACE = 16;
const LIST_TO_NAVIGATION_GAP = 16;

export type SpyPackListItem = {
  id: string;
  title?: string;
  Illustration?: ComponentType<SvgProps>;
  wordCount: number;
  enabled: boolean;
  isCustom?: boolean;
};

type PacksStepProps = {
  top: number;
  sceneScale: number;
  bottomInset: number;
  categoryId: SpyContentCategoryId;
  packs: readonly SpyPackListItem[];
  selectedPackIds: ReadonlySet<string>;
  onPackPress: (packId: string) => void;
  onCreatePack?: () => void;
  onEditPack?: (packId: string) => void;
  onBack: () => void;
  onNext: () => void;
};

export const PacksStep = memo(function PacksStep({
  top,
  sceneScale,
  bottomInset,
  categoryId,
  packs,
  selectedPackIds,
  onPackPress,
  onCreatePack,
  onEditPack,
  onBack,
  onNext,
}: PacksStepProps) {
  const { t } = useLocalization();
  const { playPrimaryAction } = useAppHaptics();
  const [headingHeight, setHeadingHeight] = useState(PAGE_HEADING_HEIGHT);
  const listTop =
    (top + headingHeight + HEADING_GAP - CARD_SHADOW_SPACE) * sceneScale;
  const listBottom =
    bottomInset +
    NAVIGATION_BOTTOM_SPACE +
    NAVIGATION_HEIGHT +
    LIST_TO_NAVIGATION_GAP;

  const handleHeadingLayout = (event: LayoutChangeEvent) => {
    setHeadingHeight(event.nativeEvent.layout.height);
  };

  const categoryTranslationKey = `spySetup.category.${categoryId}`;
  const isCustomPacksCategory = categoryId === "mySets";

  return (
    <View pointerEvents="box-none" style={styles.container}>
      <View
        pointerEvents="none"
        style={[
          styles.headingScene,
          {
            transform: [{ scale: sceneScale }],
          },
        ]}
      >
        <View
          style={[styles.pageHeading, { top }]}
          onLayout={handleHeadingLayout}
        >
          <Text style={styles.pageTitle}>{t("spySetup.packs.title")}</Text>
          <Text style={styles.pageSubtitle}>
            {t(`${categoryTranslationKey}.packsSubtitle`)}
          </Text>
        </View>
      </View>

      <FlatList
        data={packs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const { id, title, Illustration, wordCount, enabled, isCustom } = item;
          const resolvedTitle = title ?? t(`spySetup.packs.items.${id}`);
          const hasManagement = Boolean(isCustom && onEditPack);

          return (
            <PackCard
              illustration={
                Illustration ? (
                  <Illustration
                    width={isCustomPacksCategory ? 76 : 116}
                    height={isCustomPacksCategory ? 64 : 84}
                  />
                ) : (
                  <View style={styles.fallbackIllustration} />
                )
              }
              title={resolvedTitle}
              wordCountLabel={t(`${categoryTranslationKey}.wordCount`, {
                count: wordCount,
              })}
              selected={selectedPackIds.has(id)}
              disabled={!enabled}
              managementExpanded={
                hasManagement && selectedPackIds.has(id)
              }
              editLabel={
                hasManagement ? t("spySetup.packs.editCustomPack") : undefined
              }
              onEdit={
                hasManagement
                  ? () => {
                      onEditPack?.(id);
                    }
                  : undefined
              }
              onPress={() => onPackPress(id)}
            />
          );
        }}
        ListHeaderComponent={
          isCustomPacksCategory ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t("spySetup.packs.createCustomPack")}
              onPress={() => {
                playPrimaryAction();
                onCreatePack?.();
              }}
              style={({ pressed }) => [
                styles.createPackButton,
                pressed && styles.createPackButtonPressed,
              ]}
            >
              <Text style={styles.createPackButtonText}>
                + {t("spySetup.packs.createCustomPack")}
              </Text>
            </Pressable>
          ) : null
        }
        ListEmptyComponent={
          isCustomPacksCategory ? (
            <Text style={styles.emptyCustomPacksText}>
              {t("spySetup.packs.noCustomPacks")}
            </Text>
          ) : null
        }
        style={[
          styles.packList,
          {
            top: listTop,
            right: (16 - CARD_SHADOW_SPACE) * sceneScale,
            bottom: listBottom,
            left: (16 - CARD_SHADOW_SPACE) * sceneScale,
          },
        ]}
        contentContainerStyle={[
          styles.packListContent,
          {
            paddingTop: CARD_SHADOW_SPACE * sceneScale,
            paddingHorizontal: CARD_SHADOW_SPACE * sceneScale,
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      />

      <LinearGradient
        pointerEvents="none"
        colors={[colors.background, "rgba(248, 244, 253, 0)"]}
        style={[
          styles.topListFade,
          {
            top: listTop,
            height: TOP_LIST_FADE_HEIGHT * sceneScale,
          },
        ]}
      />

      <LinearGradient
        pointerEvents="none"
        colors={["rgba(248, 244, 253, 0)", colors.background]}
        style={[
          styles.bottomListFade,
          {
            bottom: listBottom,
            height: BOTTOM_LIST_FADE_HEIGHT * sceneScale,
          },
        ]}
      />

      <SetupStepNavigation
        backLabel={t("spySetup.navigation.back")}
        nextLabel={t("spySetup.navigation.next")}
        nextDisabled={selectedPackIds.size === 0}
        bottomInset={bottomInset}
        onBack={onBack}
        onNext={onNext}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  headingScene: {
    position: "absolute",
    top: 0,
    alignSelf: "center",
    width: DESIGN_WIDTH,
    height: "100%",
    transformOrigin: "center top",
  },
  pageHeading: {
    position: "absolute",
    left: 16,
    width: 370,
    paddingHorizontal: 22,
  },
  pageTitle: {
    color: colors.textPrimary,
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 24,
    lineHeight: 33,
  },
  pageSubtitle: {
    marginTop: 1,
    color: colors.textSecondary,
    fontFamily: "Nunito_600SemiBold",
    fontSize: 14,
    lineHeight: 19,
  },
  packList: {
    position: "absolute",
  },
  packListContent: {
    gap: 16,
    paddingBottom: 16,
  },
  fallbackIllustration: {
    width: 84,
    height: 64,
    borderRadius: 16,
    backgroundColor: colors.secondary3,
  },
  createPackButton: {
    width: "100%",
    height: 112,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: colors.primary,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.secondary3,
  },
  createPackButtonPressed: {
    opacity: 0.72,
  },
  createPackButtonText: {
    color: colors.textSecondary,
    fontFamily: "Nunito_700Bold",
    fontSize: 18,
    lineHeight: 25,
  },
  emptyCustomPacksText: {
    paddingVertical: 12,
    color: colors.textSecondary,
    fontFamily: "Nunito_600SemiBold",
    fontSize: 14,
    lineHeight: 19,
    textAlign: "center",
    opacity: 0.7,
  },
  topListFade: {
    position: "absolute",
    right: 0,
    left: 0,
  },
  bottomListFade: {
    position: "absolute",
    right: 0,
    left: 0,
  },
});
