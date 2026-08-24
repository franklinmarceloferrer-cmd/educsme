import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/contexts/LanguageContext";
import { LANGUAGES, type Language } from "@/lib/i18n";

const LANGUAGE_LABELS: Record<Language, { short: string; key: string }> = {
  en: { short: "EN", key: "language.en" },
  pt: { short: "PT", key: "language.pt" },
};

/**
 * Global EN/PT language switcher. The selection is persisted in localStorage.
 */
export function LanguageSwitcher({ className }: { className?: string }) {
  const { language, setLanguage, t } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={className}
          aria-label={t("language.label")}
        >
          <Languages className="h-4 w-4" />
          <span className="ml-2 text-xs font-semibold">
            {LANGUAGE_LABELS[language].short}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40 bg-popover">
        <DropdownMenuLabel>{t("language.label")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {LANGUAGES.map((option) => (
          <DropdownMenuItem
            key={option}
            onSelect={() => setLanguage(option)}
            className={option === language ? "font-semibold" : undefined}
          >
            {LANGUAGE_LABELS[option].short} — {t(LANGUAGE_LABELS[option].key)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
