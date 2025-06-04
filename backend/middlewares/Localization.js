const UserModel = require("../models/User");
const fr = require("../languages/fr.json");
const en = require("../languages/en.json");
const es = require("../languages/es.json");
const de = require("../languages/de.json");

const locales = { fr, en, es, de };
const defaultLocale = "en";

/**
 * Récupère un message localisé en fonction du chemin fourni
 * @param {string} locale - Code de la langue (fr, en, es, de)
 * @param {string} path - Chemin du message (e.g., "errors.auth.email_required")
 * @param {Object} params - Paramètres à remplacer dans le message
 * @returns {string} Message localisé
 */
const getLocalizedMessage = (locale, path, params = {}) => {
  const messages = locales[locale] || locales[defaultLocale];
  const pathParts = path.split(".");
  let message = pathParts.reduce((obj, part) => obj?.[part], messages);

  if (!message) {
    console.warn(`Message not found for path: ${path} in locale: ${locale}`);
    // Essayer avec la locale par défaut
    message = pathParts.reduce(
      (obj, part) => obj?.[part],
      locales[defaultLocale]
    );
    if (!message) {
      return path; // Retourner le chemin si le message n'est pas trouvé
    }
  }

  // Remplacer les paramètres dans le message
  return message.replace(/\${(\w+)}/g, (match, key) => {
    return params[key] !== undefined ? params[key] : match;
  });
};

/**
 * Middleware pour gérer l'internationalisation
 */
const localization = async (req, res, next) => {
  try {
    // Récupérer la langue préférée de l'utilisateur s'il est connecté
    if (req.userId) {
      const user = await UserModel.findById(req.userId).select(
        "languagePreference"
      );
      if (user?.languagePreference) {
        req.locale = user.languagePreference;
      }
    }

    // Si pas de langue définie, utiliser l'en-tête Accept-Language
    if (!req.locale) {
      const acceptLanguage = req.headers["accept-language"];
      if (acceptLanguage) {
        const preferredLocale = acceptLanguage
          .split(",")[0]
          .trim()
          .substring(0, 2);
        if (locales[preferredLocale]) {
          req.locale = preferredLocale;
        }
      }
    }

    // Si toujours pas de langue définie, utiliser la langue par défaut
    if (!req.locale) {
      req.locale = defaultLocale;
    }

    // Ajouter la fonction getLocalizedMessage à l'objet res.locals
    res.locals.t = (path, params) =>
      getLocalizedMessage(req.locale, path, params);

    next();
  } catch (error) {
    console.error("Error in localization middleware:", error);
    next();
  }
};

module.exports = {
  localization,
  getLocalizedMessage,
};
