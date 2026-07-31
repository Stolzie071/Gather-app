import type { Language } from "@/localization/i18n";

export type CountForm = "one" | "few" | "many";

export function getCountForm(count: number, language: Language): CountForm {
  if (language === "en") {
    return count === 1 ? "one" : "many";
  }

  const lastTwoDigits = count % 100;
  const lastDigit = count % 10;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return "many";
  }

  if (lastDigit === 1) {
    return "one";
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return "few";
  }

  return "many";
}
