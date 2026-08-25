import {
  BackHandler,
  FlatList,
  Keyboard,
  type ListRenderItem,
  Pressable,
  type StyleProp,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
  type ViewStyle,
} from "react-native";
import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  Easing,
  FadeInRight,
  interpolate,
  LinearTransition,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { SpySummaryPenIcon } from "@assets/Spy_game/4_step";
import { BinIcon } from "@assets/icons";
import { ExitGameDialog } from "@/components/games/ExitGameDialog";
import { Squircle } from "@/components/Squircle";
import { DuplicateCustomPackWordAlert } from "@/games/spy/components/DuplicateCustomPackWordAlert";
import { normalizeCustomSpyText } from "@/games/spy/customPacks/customPackUtils";
import type {
  CustomSpyPack,
  CustomSpyPackInput,
} from "@/games/spy/customPacks/types";
import { useAppHaptics } from "@/haptics/useAppHaptics";
import { useLocalization } from "@/localization/LocalizationProvider";
import { colors } from "@/theme/colors";

const DESIGN_WINDOW_WIDTH = 370;
const DESIGN_WINDOW_HEIGHT = 641;
const MAX_PACK_NAME_LENGTH = 40;
const MAX_WORD_LENGTH = 50;

type DraftWord = {
  id: string;
  value: string;
};

type DuplicateWord = {
  id: string;
  value: string;
};

function findDuplicateWord(words: readonly DraftWord[]) {
  const usedWords = new Set<string>();

  for (const word of words) {
    const normalizedWord = normalizeCustomSpyText(word.value);

    if (!normalizedWord) {
      continue;
    }

    const comparableWord = normalizedWord.toLocaleLowerCase("ru-RU");

    if (usedWords.has(comparableWord)) {
      return { id: word.id, value: normalizedWord } satisfies DuplicateWord;
    }

    usedWords.add(comparableWord);
  }

  return null;
}

type AnimatedButtonProps = {
  children: ReactNode;
  disabled?: boolean;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  onPress: () => void;
};

function AnimatedButton({
  children,
  disabled = false,
  accessibilityLabel,
  style,
  onPress,
}: AnimatedButtonProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      onPressIn={() => {
        scale.value = withTiming(0.97, { duration: 70 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, {
          damping: 18,
          stiffness: 320,
          mass: 0.7,
        });
      }}
      style={style}
    >
      <Animated.View
        style={[
          disabled && styles.disabled,
          animatedStyle,
        ]}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
}

type WordRowProps = {
  word: DraftWord;
  editing: boolean;
  editLabel: string;
  deleteLabel: string;
  placeholder: string;
  onChange: (wordId: string, value: string) => void;
  onEdit: (wordId: string) => void;
  onFinishEditing: (wordId: string) => void;
  onDelete: (wordId: string) => void;
};

const WordRow = memo(function WordRow({
  word,
  editing,
  editLabel,
  deleteLabel,
  placeholder,
  onChange,
  onEdit,
  onFinishEditing,
  onDelete,
}: WordRowProps) {
  return (
    <Animated.View
      entering={FadeInRight.duration(220).easing(Easing.out(Easing.cubic))}
      layout={LinearTransition.duration(180).easing(Easing.out(Easing.cubic))}
      style={styles.wordShadow}
    >
      <Squircle
        style={styles.wordRow}
        cornerRadius={12}
        fillColor={colors.surface}
      >
        <View style={styles.wordValue}>
          {editing ? (
            <TextInput
              value={word.value}
              onChangeText={(value) => onChange(word.id, value)}
              onBlur={() => onFinishEditing(word.id)}
              onSubmitEditing={() => onFinishEditing(word.id)}
              placeholder={placeholder}
              placeholderTextColor="rgba(111, 108, 164, 0.55)"
              style={styles.wordInput}
              autoFocus
              autoCorrect={false}
              autoCapitalize="sentences"
              enterKeyHint="done"
              maxLength={MAX_WORD_LENGTH}
              selectTextOnFocus
            />
          ) : (
            <Text style={styles.wordText} numberOfLines={2}>
              {word.value}
            </Text>
          )}
        </View>

        <View style={styles.wordActions}>
          <AnimatedButton
            accessibilityLabel={editLabel}
            onPress={() => onEdit(word.id)}
          >
            <View style={styles.editButton}>
              <SpySummaryPenIcon
                width={16}
                height={16}
                color={colors.secondary}
              />
            </View>
          </AnimatedButton>

          <AnimatedButton
            accessibilityLabel={deleteLabel}
            onPress={() => onDelete(word.id)}
          >
            <View style={styles.deleteButton}>
              <View pointerEvents="none" style={styles.deleteIcon}>
                <View
                  style={[styles.deleteIconLine, styles.deleteIconLineForward]}
                />
                <View
                  style={[styles.deleteIconLine, styles.deleteIconLineBackward]}
                />
              </View>
            </View>
          </AnimatedButton>
        </View>
      </Squircle>
    </Animated.View>
  );
});

type CustomPackEditorDialogProps = {
  visible: boolean;
  pack?: CustomSpyPack;
  onClose: () => void;
  onHidden?: () => void;
  onSubmit: (input: CustomSpyPackInput) => void;
  onDelete?: (packId: string) => void;
};

export function CustomPackEditorDialog({
  visible,
  pack,
  onClose,
  onHidden,
  onSubmit,
  onDelete,
}: CustomPackEditorDialogProps) {
  const { t } = useLocalization();
  const {
    playCompletion,
    playNextStep,
    playPrimaryAction,
    playSelection,
  } = useAppHaptics();
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [packName, setPackName] = useState("");
  const [words, setWords] = useState<readonly DraftWord[]>([]);
  const [editingWordId, setEditingWordId] = useState<string | null>(null);
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] =
    useState(false);
  const [duplicateWord, setDuplicateWord] = useState<DuplicateWord | null>(
    null,
  );
  const [isDuplicateWordAlertOpen, setIsDuplicateWordAlertOpen] =
    useState(false);
  const wasVisible = useRef(false);
  const wordSequence = useRef(0);
  const listRef = useRef<FlatList<DraftWord>>(null);
  const stableScreenHeight = useRef(screenHeight).current;
  const visibilityProgress = useSharedValue(0);
  const onHiddenRef = useRef(onHidden);

  const windowWidth = Math.min(DESIGN_WINDOW_WIDTH, screenWidth - 32);
  const windowHeight = Math.min(
    DESIGN_WINDOW_HEIGHT,
    stableScreenHeight - insets.top - insets.bottom - 32,
  );
  const windowTop = Math.max(
    insets.top + 16,
    (stableScreenHeight - windowHeight) / 2,
  );
  const normalizedPackName = normalizeCustomSpyText(packName);
  const normalizedWords = useMemo(() => {
    const usedWords = new Set<string>();

    return words.reduce<string[]>((result, { value }) => {
      const word = normalizeCustomSpyText(value);
      const comparableWord = word.toLocaleLowerCase("ru-RU");

      if (!word || usedWords.has(comparableWord)) {
        return result;
      }

      usedWords.add(comparableWord);
      result.push(word);
      return result;
    }, []);
  }, [words]);
  const currentDuplicateWord = useMemo(() => findDuplicateWord(words), [words]);
  const saveDisabled =
    normalizedPackName.length === 0 || normalizedWords.length === 0;
  const isEditingPack = Boolean(pack);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: visibilityProgress.value * 0.5,
  }));
  const windowStyle = useAnimatedStyle(() => ({
    opacity: visibilityProgress.value,
    transform: [
      { translateY: interpolate(visibilityProgress.value, [0, 1], [14, 0]) },
      { scale: interpolate(visibilityProgress.value, [0, 1], [0.98, 1]) },
    ],
  }));

  const notifyHidden = useCallback(() => {
    onHiddenRef.current?.();
  }, []);

  const handleClose = useCallback(() => {
    playNextStep();
    Keyboard.dismiss();
    setIsDeleteConfirmationOpen(false);
    setIsDuplicateWordAlertOpen(false);
    onClose();
  }, [onClose, playNextStep]);

  const showDuplicateWordAlert = useCallback((word: DuplicateWord) => {
    setEditingWordId(null);
    Keyboard.dismiss();
    setDuplicateWord(word);
    setIsDuplicateWordAlertOpen(true);
  }, []);

  const handleWordChange = useCallback((wordId: string, value: string) => {
    setWords((currentWords) =>
      currentWords.map((word) =>
        word.id === wordId ? { ...word, value } : word,
      ),
    );
  }, []);

  const handleEditWord = useCallback(
    (wordId: string) => {
      playSelection();
      setWords((currentWords) => {
        const wordIndex = currentWords.findIndex((word) => word.id === wordId);

        if (wordIndex <= 0) {
          return currentWords;
        }

        const nextWords = [...currentWords];
        const [word] = nextWords.splice(wordIndex, 1);

        return word ? [word, ...nextWords] : currentWords;
      });
      setEditingWordId(wordId);

      requestAnimationFrame(() => {
        listRef.current?.scrollToOffset({ animated: true, offset: 0 });
      });
    },
    [playSelection],
  );

  const handleFinishEditing = useCallback(
    (wordId: string) => {
      const editedWord = words.find((word) => word.id === wordId);
      const normalizedValue = normalizeCustomSpyText(editedWord?.value ?? "");
      const comparableValue = normalizedValue.toLocaleLowerCase("ru-RU");
      const isDuplicate =
        normalizedValue.length > 0 &&
        words.some(
          (word) =>
            word.id !== wordId &&
            normalizeCustomSpyText(word.value).toLocaleLowerCase("ru-RU") ===
              comparableValue,
        );

      setWords((currentWords) =>
        currentWords.map((word) =>
          word.id === wordId ? { ...word, value: normalizedValue } : word,
        ),
      );

      if (isDuplicate) {
        showDuplicateWordAlert({ id: wordId, value: normalizedValue });
        return;
      }

      setEditingWordId((currentId) =>
        currentId === wordId ? null : currentId,
      );
    },
    [showDuplicateWordAlert, words],
  );

  const handleDeleteWord = useCallback(
    (wordId: string) => {
      playSelection();
      setWords((currentWords) =>
        currentWords.filter((word) => word.id !== wordId),
      );
      setEditingWordId((currentId) =>
        currentId === wordId ? null : currentId,
      );
    },
    [playSelection],
  );

  const handleAddWord = useCallback(() => {
    if (currentDuplicateWord) {
      showDuplicateWordAlert(currentDuplicateWord);
      return;
    }

    playPrimaryAction();
    wordSequence.current += 1;
    const wordId = `draft_word_${wordSequence.current}`;

    setWords((currentWords) => [
      { id: wordId, value: "" },
      ...currentWords,
    ]);
    setEditingWordId(wordId);

    requestAnimationFrame(() => {
      listRef.current?.scrollToOffset({ animated: true, offset: 0 });
    });
  }, [currentDuplicateWord, playPrimaryAction, showDuplicateWordAlert]);

  const handleSubmit = useCallback(() => {
    if (saveDisabled) {
      return;
    }

    if (currentDuplicateWord) {
      showDuplicateWordAlert(currentDuplicateWord);
      return;
    }

    Keyboard.dismiss();
    onSubmit({
      name: normalizedPackName,
      words: normalizedWords,
    });
    playCompletion();
    onClose();
  }, [
    currentDuplicateWord,
    normalizedPackName,
    normalizedWords,
    onClose,
    onSubmit,
    playCompletion,
    saveDisabled,
    showDuplicateWordAlert,
  ]);

  const handleDuplicateWordAlertHidden = useCallback(() => {
    const wordId = duplicateWord?.id;
    setDuplicateWord(null);

    if (!visible || !wordId) {
      return;
    }

    requestAnimationFrame(() => {
      setEditingWordId(wordId);
      listRef.current?.scrollToOffset({ animated: true, offset: 0 });
    });
  }, [duplicateWord, visible]);

  const handleConfirmDelete = useCallback(() => {
    if (!pack || !onDelete) {
      return;
    }

    onDelete(pack.id);
    setIsDeleteConfirmationOpen(false);
    onClose();
  }, [onClose, onDelete, pack]);

  const renderWord = useCallback<ListRenderItem<DraftWord>>(
    ({ item }) => (
      <WordRow
        word={item}
        editing={editingWordId === item.id}
        editLabel={t("spySetup.customPackDialog.editWord")}
        deleteLabel={t("spySetup.customPackDialog.deleteWord")}
        placeholder={t("spySetup.customPackDialog.wordPlaceholder")}
        onChange={handleWordChange}
        onEdit={handleEditWord}
        onFinishEditing={handleFinishEditing}
        onDelete={handleDeleteWord}
      />
    ),
    [
      editingWordId,
      handleDeleteWord,
      handleEditWord,
      handleFinishEditing,
      handleWordChange,
      t,
    ],
  );

  useEffect(() => {
    onHiddenRef.current = onHidden;
  }, [onHidden]);

  useEffect(() => {
    const justOpened = visible && !wasVisible.current;
    const visibilityChanged = visible !== wasVisible.current;
    let openingAnimationFrame: number | null = null;

    if (justOpened) {
      setPackName(pack?.name ?? "");
      setWords(
        pack?.words.map((word) => ({ id: word.id, value: word.name })) ?? [],
      );
      setEditingWordId(null);
      setIsDeleteConfirmationOpen(false);
      setDuplicateWord(null);
      setIsDuplicateWordAlertOpen(false);
      wordSequence.current = pack?.words.length ?? 0;
    }

    const animateVisibility = () => {
      visibilityProgress.value = withTiming(
        visible ? 1 : 0,
        {
          duration: visible ? 220 : 170,
          easing: Easing.out(Easing.cubic),
        },
        (finished) => {
          if (finished && !visible) {
            runOnJS(notifyHidden)();
          }
        },
      );
    };

    if (visibilityChanged) {
      if (visible) {
        visibilityProgress.value = 0;
        openingAnimationFrame = requestAnimationFrame(animateVisibility);
      } else {
        animateVisibility();
      }
    }

    wasVisible.current = visible;

    return () => {
      if (openingAnimationFrame !== null) {
        cancelAnimationFrame(openingAnimationFrame);
      }
    };
  }, [notifyHidden, pack, visibilityProgress, visible]);

  useEffect(() => {
    if (!visible) {
      return;
    }

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (isDuplicateWordAlertOpen) {
          setIsDuplicateWordAlertOpen(false);
          return true;
        }

        if (isDeleteConfirmationOpen) {
          setIsDeleteConfirmationOpen(false);
          return true;
        }

        handleClose();
        return true;
      },
    );

    return () => subscription.remove();
  }, [
    handleClose,
    isDeleteConfirmationOpen,
    isDuplicateWordAlertOpen,
    visible,
  ]);

  return (
    <View pointerEvents={visible ? "auto" : "none"} style={styles.container}>
      <Animated.View style={[styles.overlay, overlayStyle]}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={handleClose} />
      </Animated.View>

      <View pointerEvents="box-none" style={styles.windowPositioner}>
        <Animated.View
          style={[
            {
              top: windowTop,
              width: windowWidth,
              height: windowHeight,
            },
            windowStyle,
          ]}
        >
          <Squircle
            style={styles.window}
            cornerRadius={20}
            fillColor={colors.background}
          >
            <Text style={styles.title}>
              {t(
                isEditingPack
                  ? "spySetup.customPackDialog.editTitle"
                  : "spySetup.customPackDialog.title",
              )}
            </Text>

            {pack && onDelete && (
              <AnimatedButton
                accessibilityLabel={t(
                  "spySetup.customPackDialog.deletePack",
                )}
                style={styles.deletePackAction}
                onPress={() => {
                  Keyboard.dismiss();
                  setIsDeleteConfirmationOpen(true);
                }}
              >
                <View style={styles.deletePackButton}>
                  <BinIcon width={14} height={19} />
                </View>
              </AnimatedButton>
            )}

            <Text style={[styles.fieldLabel, styles.nameLabel]}>
              {t("spySetup.customPackDialog.packName")}
            </Text>

            <Squircle
              style={styles.nameField}
              cornerRadius={12}
              fillColor={colors.surface}
              strokeColor={colors.secondary4}
              strokeWidth={1}
            >
              <TextInput
                value={packName}
                onChangeText={setPackName}
                placeholder={t("spySetup.customPackDialog.namePlaceholder")}
                placeholderTextColor="rgba(111, 108, 164, 0.65)"
                style={styles.nameInput}
                autoCorrect={false}
                autoCapitalize="sentences"
                enterKeyHint="next"
                maxLength={MAX_PACK_NAME_LENGTH}
                onSubmitEditing={handleAddWord}
              />
            </Squircle>

            <View style={styles.wordsHeading}>
              <Text style={styles.fieldLabel}>
                {t("spySetup.customPackDialog.words")}
              </Text>
              <Text style={styles.wordsCount}>
                {t("spySetup.customPackDialog.wordsCount", {
                  count: normalizedWords.length,
                })}
              </Text>
            </View>

            <FlatList
              ref={listRef}
              data={words}
              keyExtractor={(word) => word.id}
              renderItem={renderWord}
              ListEmptyComponent={
                <View style={styles.emptyList}>
                  <Text style={styles.emptyText}>
                    {t("spySetup.customPackDialog.emptyWords")}
                  </Text>
                </View>
              }
              style={styles.wordsList}
              contentContainerStyle={[
                styles.wordsListContent,
                words.length === 0 && styles.emptyListContent,
              ]}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            />

            <AnimatedButton
              accessibilityLabel={t("spySetup.customPackDialog.addWord")}
              style={styles.fullWidthAction}
              onPress={handleAddWord}
            >
              <View style={styles.addWordButton}>
                <Text style={styles.addWordIcon}>+</Text>
                <Text style={styles.addWordLabel}>
                  {t("spySetup.customPackDialog.addWord")}
                </Text>
              </View>
            </AnimatedButton>

            <View style={styles.footer}>
              <AnimatedButton style={styles.footerAction} onPress={handleClose}>
                <Squircle
                  style={styles.footerButton}
                  cornerRadius={10}
                  fillColor={colors.secondary3}
                  strokeColor={colors.secondary4}
                  strokeWidth={1}
                >
                  <Text style={styles.cancelLabel}>
                    {t("spySetup.customPackDialog.cancel")}
                  </Text>
                </Squircle>
              </AnimatedButton>

              <AnimatedButton
                disabled={saveDisabled}
                style={styles.footerAction}
                onPress={handleSubmit}
              >
                <Squircle
                  style={styles.footerButton}
                  cornerRadius={10}
                  fillColor={colors.primary}
                >
                  <Text style={styles.createLabel}>
                    {t(
                      isEditingPack
                        ? "spySetup.customPackDialog.save"
                        : "spySetup.customPackDialog.create",
                    )}
                  </Text>
                </Squircle>
              </AnimatedButton>
            </View>
          </Squircle>
        </Animated.View>
      </View>

      <ExitGameDialog
        visible={visible && isDeleteConfirmationOpen}
        compact
        title={t("spySetup.customPackDialog.deleteDialog.title")}
        message={t("spySetup.customPackDialog.deleteDialog.message", {
          name: pack?.name ?? "",
        })}
        stayLabel={t("spySetup.customPackDialog.deleteDialog.cancel")}
        exitLabel={t("spySetup.customPackDialog.deleteDialog.confirm")}
        confirmColor="#ED1818"
        onStay={() => setIsDeleteConfirmationOpen(false)}
        onExit={handleConfirmDelete}
      />

      <DuplicateCustomPackWordAlert
        visible={visible && isDuplicateWordAlertOpen}
        word={duplicateWord?.value ?? ""}
        onClose={() => setIsDuplicateWordAlertOpen(false)}
        onHidden={handleDuplicateWordAlertHidden}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 250,
    elevation: 25,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000000",
  },
  windowPositioner: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
  },
  window: {
    flex: 1,
    width: "100%",
    padding: 16,
    overflow: "hidden",
  },
  title: {
    color: colors.textPrimary,
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 24,
    lineHeight: 33,
    textAlign: "center",
  },
  deletePackAction: {
    position: "absolute",
    top: 14,
    right: 14,
    zIndex: 2,
  },
  deletePackButton: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: "#ED1818",
    alignItems: "center",
    justifyContent: "center",
  },
  fieldLabel: {
    color: colors.textSecondary,
    fontFamily: "Nunito_700Bold",
    fontSize: 14,
    lineHeight: 19,
  },
  nameLabel: {
    marginTop: 16,
  },
  nameField: {
    width: "100%",
    height: 52,
    marginTop: 8,
    paddingHorizontal: 16,
    justifyContent: "center",
    overflow: "hidden",
  },
  nameInput: {
    flex: 1,
    padding: 0,
    color: colors.textPrimary,
    fontFamily: "Nunito_600SemiBold",
    fontSize: 16,
  },
  wordsHeading: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  wordsCount: {
    color: colors.textSecondary,
    fontFamily: "Nunito_600SemiBold",
    fontSize: 12,
    lineHeight: 17,
    opacity: 0.75,
  },
  wordsList: {
    flex: 1,
    marginTop: 8,
    marginHorizontal: -4,
  },
  wordsListContent: {
    padding: 4,
    gap: 8,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  emptyList: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    color: colors.textSecondary,
    fontFamily: "Nunito_600SemiBold",
    fontSize: 14,
    lineHeight: 19,
    textAlign: "center",
    opacity: 0.7,
  },
  wordShadow: {
    width: "100%",
    minHeight: 58,
    borderRadius: 12,
    backgroundColor: colors.surface,
    boxShadow: [
      {
        offsetX: 0,
        offsetY: 0,
        blurRadius: 5,
        spreadDistance: 0,
        color: "rgba(118, 92, 172, 0.2)",
      },
    ],
  },
  wordRow: {
    width: "100%",
    minHeight: 58,
    paddingVertical: 8,
    paddingLeft: 16,
    paddingRight: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    overflow: "hidden",
  },
  wordValue: {
    flex: 1,
    minHeight: 38,
    justifyContent: "center",
  },
  wordText: {
    color: colors.textPrimary,
    fontFamily: "Nunito_700Bold",
    fontSize: 16,
    lineHeight: 21,
  },
  wordInput: {
    width: "100%",
    minHeight: 38,
    padding: 0,
    color: colors.textPrimary,
    fontFamily: "Nunito_700Bold",
    fontSize: 16,
    lineHeight: 21,
  },
  wordActions: {
    flexDirection: "row",
    gap: 6,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.secondary3,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#FDC7C7",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteIcon: {
    width: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteIconLine: {
    position: "absolute",
    width: 2,
    height: 18,
    borderRadius: 1,
    backgroundColor: "#ED1818",
  },
  deleteIconLineForward: {
    transform: [{ rotate: "45deg" }],
  },
  deleteIconLineBackward: {
    transform: [{ rotate: "-45deg" }],
  },
  fullWidthAction: {
    width: "100%",
  },
  disabled: {
    opacity: 0.5,
  },
  addWordButton: {
    width: "100%",
    height: 48,
    marginTop: 12,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderStyle: "dashed",
    borderRadius: 10,
    backgroundColor: colors.secondary3,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  addWordIcon: {
    color: colors.textSecondary,
    fontFamily: "Nunito_600SemiBold",
    fontSize: 26,
    lineHeight: 28,
  },
  addWordLabel: {
    color: colors.textSecondary,
    fontFamily: "Nunito_700Bold",
    fontSize: 16,
    lineHeight: 22,
  },
  footer: {
    height: 49,
    marginTop: 11,
    flexDirection: "row",
    gap: 8,
  },
  footerAction: {
    flex: 1,
    height: "100%",
  },
  footerButton: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  cancelLabel: {
    color: colors.textSecondary,
    fontFamily: "Nunito_700Bold",
    fontSize: 16,
    lineHeight: 22,
  },
  createLabel: {
    color: colors.surface,
    fontFamily: "Nunito_700Bold",
    fontSize: 16,
    lineHeight: 22,
  },
});
