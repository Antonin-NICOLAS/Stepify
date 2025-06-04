const translate = require("google-translate-api-x");

// Helper function pour la traduction avec détection de langue
const translateToAllLanguages = async (text) => {
  if (!text) return null;

  try {
    const detectionResult = await translate(text, { to: "en" });
    const sourceLang = detectionResult.from?.language?.iso || "en";

    const targetLanguages = ["fr", "en", "es", "de"].filter(
      (lang) => lang !== sourceLang
    );

    const translations = {
      [sourceLang]: text,
    };

    const translationPromises = targetLanguages.map(async (lang) => {
      try {
        const result = await translate(text, { to: lang });
        translations[lang] = result.text;
      } catch (error) {
        console.error(`Erreur de traduction vers ${lang}:`, error);
        translations[lang] = text;
      }
    });

    await Promise.all(translationPromises);
    return translations;
  } catch (error) {
    console.error("Erreur de traduction:", error);
    return {
      fr: text,
      en: text,
      es: text,
      de: text,
    };
  }
};

module.exports = { translateToAllLanguages };
