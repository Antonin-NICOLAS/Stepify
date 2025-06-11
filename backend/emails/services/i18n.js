const translations = {
  en: require('../translations/en.json'),
  fr: require('../translations/fr.json'),
  es: require('../translations/es.json'),
  de: require('../translations/de.json'),
}

function t(key, lang = 'fr') {
  // Fallback to French if language not supported
  if (!translations[lang]) {
    console.warn(`Language ${lang} not supported, falling back to French`)
    lang = 'fr'
  }

  const keys = key.split('.')
  let result = translations[lang]

  try {
    for (const k of keys) {
      result = result[k]
      if (result === undefined) break
    }
  } catch (e) {
    console.warn(`Error accessing translation for key ${key}`, e)
    result = undefined
  }

  if (result === undefined) {
    console.warn(`Translation key ${key} not found for language ${lang}`)
    return keys[keys.length - 1]
  }

  const withStrong = result.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')

  return withStrong
}

function interpolate(str, variables) {
  return str.replace(/\${([^}]+)}/g, (_, key) => variables[key] || '')
}

module.exports = { t, interpolate }
