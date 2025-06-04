import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import CommonEN from "./locales/en/common.json";
import CommonFR from "./locales/fr/common.json";
import CommonES from "./locales/es/common.json";
import CommonDE from "./locales/de/common.json";
import AccountEN from "./locales/en/account.json";
import AccountFR from "./locales/fr/account.json";
import AccountES from "./locales/es/account.json";
import AccountDE from "./locales/de/account.json";
import AuthEN from "./locales/en/auth.json";
import AuthFR from "./locales/fr/auth.json";
import AuthES from "./locales/es/auth.json";
import AuthDE from "./locales/de/auth.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: true,
    fallbackLng: "fr",
    interpolation: {
      escapeValue: false,
    },
    defaultNS: "common",
    ns: [
      "common",
      "account",
      "auth",
      "challenges",
      "leaderboard",
      "rewards",
      "friends",
      "settings",
      "about",
    ],
    resources: {
      en: {
        common: CommonEN,
        account: AccountEN,
        auth: AuthEN,
      },
      fr: {
        common: CommonFR,
        account: AccountFR,
        auth: AuthFR,
      },
      es: {
        common: CommonES,
        account: AccountES,
        auth: AuthES,
      },
      de: {
        common: CommonDE,
        account: AccountDE,
        auth: AuthDE,
      },
    },
  });

export default i18n;
