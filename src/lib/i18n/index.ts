import type { Language, LocaleModule, TranslationBundle } from "./types";
import { common } from "./locales/common";
import { landing } from "./locales/landing";
import { auth } from "./locales/auth";
import { dashboard } from "./locales/dashboard";
import { announcements } from "./locales/announcements";
import { students } from "./locales/students";
import { documents } from "./locales/documents";
import { reports } from "./locales/reports";
import { gcse } from "./locales/gcse";
import { admin } from "./locales/admin";

export type { Language, TranslationBundle, LocaleModule };

export const LANGUAGES: Language[] = ["en", "pt"];
export const DEFAULT_LANGUAGE: Language = "en";
export const LANGUAGE_STORAGE_KEY = "educms.language";

const MODULES: LocaleModule[] = [
  common,
  landing,
  auth,
  dashboard,
  announcements,
  students,
  documents,
  reports,
  gcse,
  admin,
];

function mergeBundles(language: Language): TranslationBundle {
  return MODULES.reduce<TranslationBundle>(
    (accumulator, module) => Object.assign(accumulator, module[language]),
    {},
  );
}

export const translations: Record<Language, TranslationBundle> = {
  en: mergeBundles("en"),
  pt: mergeBundles("pt"),
};

/**
 * Resolves a translation key, falling back to English and then to the key itself.
 * Supports `{{name}}` interpolation.
 */
export function translate(
  language: Language,
  key: string,
  variables?: Record<string, string | number>,
): string {
  const template =
    translations[language]?.[key] ?? translations[DEFAULT_LANGUAGE][key] ?? key;

  if (!variables) {
    return template;
  }

  return Object.entries(variables).reduce(
    (text, [name, value]) => text.replaceAll(`{{${name}}}`, String(value)),
    template,
  );
}

export function isLanguage(value: unknown): value is Language {
  return typeof value === "string" && (LANGUAGES as string[]).includes(value);
}
