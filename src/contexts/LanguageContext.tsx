import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  DEFAULT_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
  isLanguage,
  translate,
  type Language,
} from "@/lib/i18n";

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, variables?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

/** URL language parameter wins over the stored preference so shared links keep their language. */
function readInitialLanguage(): Language {
  if (typeof window === "undefined") {
    return DEFAULT_LANGUAGE;
  }

  const fromUrl = new URLSearchParams(window.location.search).get(LANGUAGE_QUERY_PARAM);
  if (isLanguage(fromUrl)) {
    return fromUrl;
  }

  const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return isLanguage(stored) ? stored : DEFAULT_LANGUAGE;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(readInitialLanguage);

  useEffect(() => {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    document.documentElement.lang = htmlLang(language);
    syncAlternateLinks(window.location.pathname, language);
  }, [language]);

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next);

    const url = new URL(window.location.href);
    url.searchParams.set(LANGUAGE_QUERY_PARAM, next);
    window.history.replaceState(null, "", url.toString());
  }, []);

  const t = useCallback(
    (key: string, variables?: Record<string, string | number>) =>
      translate(language, key, variables),
    [language],
  );

  const value = useMemo(
    () => ({ language, setLanguage, t }),
    [language, setLanguage, t],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }

  return context;
}

/** Convenience hook for components that only need the translate function. */
export function useTranslation() {
  return useLanguage();
}
