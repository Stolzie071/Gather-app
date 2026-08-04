import {
  TwoOptionSelector,
  type TwoOptionValue,
} from "@/components/TwoOptionSelector";
import { useAppHaptics } from "@/haptics/useAppHaptics";

export type Language = "ru" | "en";

type LanguageSelectorProps = {
  value: Language;
  onValueChange: (language: Language) => void;
  compact?: boolean;
};

export function LanguageSelector({
  value,
  onValueChange,
  compact = false,
}: LanguageSelectorProps) {
  const { playToggle } = useAppHaptics();

  const handleValueChange = (nextValue: TwoOptionValue) => {
    const nextLanguage = nextValue === "left" ? "ru" : "en";

    if (nextLanguage === value) {
      return;
    }

    playToggle();
    onValueChange(nextLanguage);
  };

  return (
    <TwoOptionSelector
      value={value === "ru" ? "left" : "right"}
      leftLabel="Рус"
      rightLabel="Eng"
      compact={compact}
      onValueChange={handleValueChange}
    />
  );
}
