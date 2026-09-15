import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { syncAlternateLinks } from "@/lib/seo/hreflang";

/**
 * Keeps hreflang alternates and the canonical URL aligned with the current
 * route and language. Must be rendered inside the router.
 */
export function HreflangLinks() {
  const { pathname } = useLocation();
  const { language } = useLanguage();

  useEffect(() => {
    syncAlternateLinks(pathname, language);
  }, [pathname, language]);

  return null;
}
