export const LANGUAGE_CODES = ["en", "fr", "zh"] as const;

export type LanguageCode = (typeof LANGUAGE_CODES)[number];

export type Language = {
  code: LanguageCode;
  label: string;
  unit: "words" | "characters";
  min: number;
  max: number;
};

// Ranges target roughly 30 seconds of speech. Chinese has no spaces, so it is
// measured in characters instead of words.
export const LANGUAGES: Record<LanguageCode, Language> = {
  en: { code: "en", label: "English", unit: "words", min: 55, max: 90 },
  fr: { code: "fr", label: "French", unit: "words", min: 55, max: 90 },
  zh: { code: "zh", label: "Chinese", unit: "characters", min: 100, max: 170 },
};

export function measureScript(script: string, language: Language) {
  const text = script.trim();
  const count =
    language.unit === "characters"
      ? Array.from(text.replace(/[\s\p{P}]/gu, "")).length
      : text
        ? text.split(/\s+/).length
        : 0;

  return {
    count,
    unit: language.unit,
    min: language.min,
    max: language.max,
    withinRange: count >= language.min && count <= language.max,
  };
}

export type ScriptLength = ReturnType<typeof measureScript>;
