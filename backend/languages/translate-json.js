const fs = require("fs");
const translate = require("google-translate-api-x");

// Charger le fichier JSON source
const original = JSON.parse(fs.readFileSync("common.fr.json", "utf8"));

// Fonction récursive pour traduire les textes
async function translateObject(obj, toLang) {
  const result = {};
  for (const key in obj) {
    if (typeof obj[key] === "string") {
      try {
        const res = await translate(obj[key], { to: toLang });
        result[key] = res.text;
      } catch (e) {
        result[key] = obj[key]; // fallback
        console.error("Erreur de traduction pour :", obj[key]);
      }
    } else if (typeof obj[key] === "object" && obj[key] !== null) {
      result[key] = await translateObject(obj[key], toLang);
    } else {
      result[key] = obj[key];
    }
  }
  return result;
}

// Fonction principale pour tout traduire
async function translateAll() {
  const languages = ["en", "es", "de"];
  for (const lang of languages) {
    const translated = await translateObject(original, lang);
    fs.writeFileSync(`common.${lang}.json`, JSON.stringify(translated, null, 2), "utf8");
    console.log(`Fichier traduit en ${lang} sauvegardé sous common.${lang}.json`);
  }
}

translateAll();