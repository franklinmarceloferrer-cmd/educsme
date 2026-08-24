/**
 * Shared i18n types.
 *
 * A locale bundle is a flat map of dot-separated keys to translated strings.
 * Each feature area owns its own bundle file under `src/lib/i18n/locales`.
 */
export type Language = "en" | "pt";

export type TranslationBundle = Record<string, string>;

export interface LocaleModule {
  en: TranslationBundle;
  pt: TranslationBundle;
}
