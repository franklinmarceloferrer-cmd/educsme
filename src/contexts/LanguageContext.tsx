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

const LANGUAGE_QUERY_PARAM = "lang";
const SITE_URL = "https://educsme.lovable.app";

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

function htmlLang(language: Language): string {
  return language === "pt" ? "pt-BR" : "en";
}

/** Keeps canonical + hreflang alternates in sync with the active route and language. */
function syncAlternateLinks(language: Language) {
  const { pathname } = window.location;
  const alternates: Array<{ hreflang: string; language: Language | null }> = [
    { hreflang: "en", language: "en" },
    { hreflang: "pt-BR", language: "pt" },
    { hreflang: "x-default", language: null },
  ];

  for (const alternate of alternates) {
    const selector = `link[rel="alternate"][hreflang="${alternate.hreflang}"]`;
    let link = document.head.querySelector<HTMLLinkElement>(selector);

    if (!link) {
      link = document.createElement("link");
      link.rel = "alternate";
      link.hreflang = alternate.hreflang;
      document.head.appendChild(link);
    }

    link.href = alternate.language
      ? `${SITE_URL}${pathname}?${LANGUAGE_QUERY_PARAM}=${alternate.language}`
      : `${SITE_URL}${pathname}`;
  }

  const canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (canonical) {
    canonical.href = `${SITE_URL}${pathname}?${LANGUAGE_QUERY_PARAM}=${language}`;
  }
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(readInitialLanguage);

  useEffect(() => {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    document.documentElement.lang = htmlLang(language);
    syncAlternateLinks(language);
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
