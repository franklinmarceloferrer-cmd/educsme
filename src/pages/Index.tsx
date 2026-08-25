import { useTranslation } from "@/contexts/LanguageContext";

const Index = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">{t("index.title")}</h1>
        <p className="text-xl text-muted-foreground">{t("index.subtitle")}</p>
      </div>
    </div>
  );
};

export default Index;
