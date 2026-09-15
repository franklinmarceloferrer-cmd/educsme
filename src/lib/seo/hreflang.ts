import type { Language } from "@/lib/i18n";

export const LANGUAGE_QUERY_PARAM = "lang";
export const SITE_URL = "https://educsme.lovable.app";

const ALTERNATES: Array<{ hreflang: string; language: Language | null }> = [
  { hreflang: "en", language: "en" },
  { hreflang: "pt-BR", language: "pt" },
  { hreflang: "x-default", language: null },
];

export function htmlLang(language: Language): string {
  return language === "pt" ? "pt-BR" : "en";
}

export function languageUrl(pathname: string, language: Language | null): string {
  return language
    ? `${SITE_URL}${pathname}?${LANGUAGE_QUERY_PARAM}=${language}`
    : `${SITE_URL}${pathname}`;
}

/** Keeps the canonical link and hreflang alternates in sync with the route and language. */
export function syncAlternateLinks(pathname: string, language: Language) {
  if (typeof document === "undefined") {
    return;
  }

  for (const alternate of ALTERNATES) {
    const selector = `link[rel="alternate"][hreflang="${alternate.hreflang}"]`;
    let link = document.head.querySelector<HTMLLinkElement>(selector);

    if (!link) {
      link = document.createElement("link");
      link.rel = "alternate";
      link.hreflang = alternate.hreflang;
      document.head.appendChild(link);
    }

    link.href = languageUrl(pathname, alternate.language);
  }

  const canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (canonical) {
    canonical.href = languageUrl(pathname, language);
  }

  const ogUrl = document.head.querySelector<HTMLMetaElement>('meta[property="og:url"]');
  if (ogUrl) {
    ogUrl.content = languageUrl(pathname, language);
  }

  const ogLocale = document.head.querySelector<HTMLMetaElement>('meta[property="og:locale"]');
  if (ogLocale) {
    ogLocale.content = language === "pt" ? "pt_BR" : "en_US";
  }
}
