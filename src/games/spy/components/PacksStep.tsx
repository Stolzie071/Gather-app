import { memo, useMemo, useState, type ComponentType } from "react";
import {
  FlatList,
  type LayoutChangeEvent,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import type { SvgProps } from "react-native-svg";

import { PackCard, SetupStepNavigation } from "@/components";
import { SPY_LOCATION_PACKS } from "@/games/spy/data/packs";
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
  Illustration: ComponentType<SvgProps>;
  wordCount: number;
  enabled: boolean;
};

type PacksStepProps = {
  top: number;
  sceneScale: number;
  bottomInset: number;
  packs?: readonly SpyPackListItem[];
  selectedPackIds: ReadonlySet<string>;
  onPackPress: (packId: string) => void;
  onBack: () => void;
  onNext: () => void;
};

export const PacksStep = memo(function PacksStep({
  top,
  sceneScale,
  bottomInset,
  packs,
  selectedPackIds,
  onPackPress,
  onBack,
  onNext,
}: PacksStepProps) {
  const { t } = useLocalization();
  const [headingHeight, setHeadingHeight] = useState(PAGE_HEADING_HEIGHT);
  const displayedPacks = useMemo<readonly SpyPackListItem[]>(
    () =>
      packs ??
      SPY_LOCATION_PACKS.map(({ id, Illustration, wordIds, enabled }) => ({
        id,
        Illustration,
        wordCount: wordIds.length,
        enabled,
      })),
    [packs],
  );
  const showsCharacterPacks = displayedPacks.some(
    ({ id }) => id === "dota-2-heroes",
  );
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
            {t(
              showsCharacterPacks
                ? "spySetup.packs.charactersSubtitle"
                : "spySetup.packs.subtitle",
            )}
          </Text>
        </View>
      </View>

      <FlatList
        data={displayedPacks}
        keyExtractor={(item) => item.id}
        renderItem={({ item: { id, Illustration, wordCount, enabled } }) => (
          <PackCard
            illustration={<Illustration width={116} height={84} />}
            title={t(`spySetup.packs.items.${id}`)}
            wordCountLabel={t(
              showsCharacterPacks
                ? "spySetup.packs.characterCount"
                : "spySetup.packs.locationCount",
              { count: wordCount },
            )}
            selected={selectedPackIds.has(id)}
            disabled={!enabled}
            onPress={() => onPackPress(id)}
          />
        )}
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
