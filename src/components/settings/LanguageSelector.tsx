import {
  TwoOptionSelector,
  type TwoOptionValue,
} from "@/components/TwoOptionSelector";

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
  const handleValueChange = (nextValue: TwoOptionValue) => {
    onValueChange(nextValue === "left" ? "ru" : "en");
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
