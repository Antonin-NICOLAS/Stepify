import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import CommonEN from '../languages/en/common.json'
import CommonFR from '../languages/fr/common.json'
import CommonES from '../languages/es/common.json'
import CommonDE from '../languages/de/common.json'
import AccountEN from '../languages/en/account.json'
import AccountFR from '../languages/fr/account.json'
import AccountES from '../languages/es/account.json'
import AccountDE from '../languages/de/account.json'
import AuthEN from '../languages/en/auth.json'
import AuthFR from '../languages/fr/auth.json'
import AuthES from '../languages/es/auth.json'
import AuthDE from '../languages/de/auth.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: true,
    fallbackLng: 'fr',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['cookie', 'localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
    defaultNS: 'common',
    nsSeparator: '.',
    ns: [
      'common',
      'account',
      'auth',
      'challenges',
      'leaderboard',
      'rewards',
      'friends',
      'about',
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
  })

export default i18n
