import { memo, type ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  SpySummaryButtonDecor,
  SpySummaryCategoryIcon,
  SpySummaryDice,
  SpySummaryFingers,
  SpySummaryLikeHand,
  SpySummaryPackIcon,
  SpySummaryPenIcon,
  SpySummarySetupIcon,
} from "@assets/Spy_game/4_step";
import { InfoIcon } from "@assets/icons";
import { GameStartButton } from "@/components";
import { Squircle } from "@/components/Squircle";
import { getCountForm } from "@/localization/countForms";
import { useLocalization } from "@/localization/LocalizationProvider";
import { colors } from "@/theme/colors";

const DESIGN_WIDTH = 402;
const DESIGN_HEIGHT = 874;

type SummaryRowProps = {
  icon: ReactNode;
  title: string;
  value: string;
  onEdit: () => void;
};

function SummaryRow({ icon, title, value, onEdit }: SummaryRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}: ${value}`}
      onPress={onEdit}
      style={styles.summaryRow}
    >
      <Squircle
        style={styles.summaryIcon}
        cornerRadius={10}
        fillColor="#DECEF5"
      >
        {icon}
      </Squircle>

      <View style={styles.summaryText}>
        <Text style={styles.summaryLabel}>{title}</Text>
        <Text style={styles.summaryValue} numberOfLines={2}>
          {value}
        </Text>
      </View>

      <View pointerEvents="none" style={styles.editButton}>
        <SpySummaryPenIcon width={16} height={16} />
      </View>
    </Pressable>
  );
}

type SetupSummaryStepProps = {
  sceneScale: number;
  categoryTitle: string;
  selectedPackTitles: readonly string[];
  playerCount: number;
  spyCount: number;
  timerMinutes: number;
  timerDisabled: boolean;
  onEditCategory: () => void;
  onEditPacks: () => void;
  onEditOptions: () => void;
  onStart: () => void;
};

export const SetupSummaryStep = memo(function SetupSummaryStep({
  sceneScale,
  categoryTitle,
  selectedPackTitles,
  playerCount,
  spyCount,
  timerMinutes,
  timerDisabled,
  onEditCategory,
  onEditPacks,
  onEditOptions,
  onStart,
}: SetupSummaryStepProps) {
  const { language, t } = useLocalization();
  const playerForm = getCountForm(playerCount, language);
  const spyForm = getCountForm(spyCount, language);
  const playersLabel = t(`spySetup.summary.units.players.${playerForm}`, {
    count: playerCount,
  });
  const spiesLabel = t(`spySetup.summary.units.spies.${spyForm}`, {
    count: spyCount,
  });
  const timerLabel = timerDisabled
    ? t("spySetup.summary.noTimer")
    : t("spySetup.summary.minutes", { count: timerMinutes });
  const settingsValue = `${playersLabel} + ${spiesLabel} + ${timerLabel}`;
  const packsValue =
    selectedPackTitles.length > 0
      ? selectedPackTitles.join(", ")
      : t("spySetup.summary.noPacks");

  return (
    <View pointerEvents="box-none" style={styles.container}>
      <View
        style={[
          styles.designScene,
          {
            transform: [{ scale: sceneScale }],
          },
        ]}
      >
        <View pointerEvents="box-none" style={styles.composition}>
          <SpySummaryDice
            pointerEvents="none"
            width={142}
            height={137}
            style={styles.dice}
          />

          <View style={styles.cardShadow}>
            <Squircle
              style={styles.card}
              cornerRadius={30}
              fillColor={colors.background}
            >
              <View style={styles.cardHeading}>
                <Text style={styles.title}>{t("spySetup.summary.title")}</Text>
                <Text style={styles.subtitle}>
                  {t("spySetup.summary.subtitle")}
                </Text>
              </View>

              <View style={styles.summaryArea}>
                <View style={styles.summaryRows}>
                  <SummaryRow
                    icon={<SpySummaryCategoryIcon width={29} height={29} />}
                    title={t("spySetup.summary.category")}
                    value={categoryTitle}
                    onEdit={onEditCategory}
                  />
                  <View style={styles.divider} />
                  <SummaryRow
                    icon={<SpySummaryPackIcon width={29} height={29} />}
                    title={t("spySetup.summary.pack")}
                    value={packsValue}
                    onEdit={onEditPacks}
                  />
                  <View style={styles.divider} />
                  <SummaryRow
                    icon={<SpySummarySetupIcon width={29} height={29} />}
                    title={t("spySetup.summary.options")}
                    value={settingsValue}
                    onEdit={onEditOptions}
                  />
                </View>
              </View>

              <View style={styles.startButtonWrapper}>
                <GameStartButton
                  text={t("spySetup.summary.start")}
                  onPress={onStart}
                  style={styles.startButton}
                  textStyle={styles.startButtonText}
                  cornerRadius={10}
                  leftDecoration={
                    <SpySummaryButtonDecor
                      pointerEvents="none"
                      width={12}
                      height={29}
                      style={styles.buttonDecorLeft}
                    />
                  }
                  rightDecoration={
                    <SpySummaryButtonDecor
                      pointerEvents="none"
                      width={12}
                      height={29}
                    />
                  }
                />
              </View>

              <View style={styles.information}>
                <InfoIcon width={32} height={32} />
                <Text style={styles.informationText}>
                  {t("spySetup.summary.information")}
                </Text>
              </View>
            </Squircle>
          </View>

          <SpySummaryFingers
            pointerEvents="none"
            width={31}
            height={14}
            style={styles.fingers}
          />
          <SpySummaryLikeHand
            pointerEvents="none"
            width={51}
            height={71}
            style={styles.likeHand}
          />
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },

  designScene: {
    position: "absolute",
    top: 0,
    alignSelf: "center",
    width: DESIGN_WIDTH,
    height: DESIGN_HEIGHT,
    transformOrigin: "center top",
  },

  composition: {
    position: "absolute",
    top: 169,
    left: 0,
    width: DESIGN_WIDTH,
    height: 646,
  },

  dice: {
    position: "absolute",
    top: 0,
    left: 252,
  },

  cardShadow: {
    position: "absolute",
    top: 66,
    left: 45,
    width: 312,
    height: 580,
    borderRadius: 30,
    backgroundColor: colors.background,
    boxShadow: [
      {
        offsetX: 0,
        offsetY: 2,
        blurRadius: 12,
        spreadDistance: 0,
        color: "rgba(47, 37, 86, 0.5)",
      },
    ],
  },

  card: {
    width: "100%",
    height: "100%",
    paddingHorizontal: 16,
    paddingBottom: 24,
    overflow: "hidden",
  },

  cardHeading: {
    marginTop: 35,
    alignItems: "center",
  },

  title: {
    color: colors.textPrimary,
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 24,
    lineHeight: 33,
    textAlign: "center",
  },

  subtitle: {
    marginTop: 8,
    color: colors.textSecondary,
    fontFamily: "Nunito_600SemiBold",
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
  },

  summaryArea: {
    flex: 1,
    justifyContent: "center",
  },

  summaryRows: {
    width: "100%",
  },

  summaryRow: {
    minHeight: 80,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
  },

  summaryIcon: {
    width: 43,
    height: 43,
    alignItems: "center",
    justifyContent: "center",
  },

  summaryText: {
    flex: 1,
    minWidth: 0,
    marginLeft: 16,
  },

  summaryLabel: {
    color: colors.textPrimary,
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 14,
    lineHeight: 22,
  },

  summaryValue: {
    marginTop: 1,
    color: colors.textSecondary,
    fontFamily: "Nunito_600SemiBold",
    fontSize: 12,
    lineHeight: 19,
  },

  editButton: {
    width: 32,
    height: 40,
    marginLeft: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  divider: {
    height: 1,
    marginHorizontal: 0,
    backgroundColor: "rgba(111, 108, 164, 0.25)",
  },

  startButtonWrapper: {
    width: "100%",
    height: 64,
  },

  startButton: {
    width: "100%",
    height: "100%",
  },

  startButtonText: {
    fontSize: 22,
    lineHeight: 33,
  },

  buttonDecorLeft: {
    transform: [{ scaleX: -1 }],
  },

  information: {
    marginTop: 29,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  informationText: {
    flex: 1,
    color: colors.textSecondary,
    fontFamily: "Nunito_600SemiBold",
    fontSize: 12,
    lineHeight: 17,
  },

  fingers: {
    position: "absolute",
    top: 60,
    left: 223,
  },

  likeHand: {
    position: "absolute",
    top: 79,
    left: 342,
  },
});
