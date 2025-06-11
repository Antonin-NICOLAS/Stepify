const fs = require('fs')
const translate = require('google-translate-api-x')

const fr = require('./emails/translations/fr.json')
const targetLangs = ['en', 'es', 'de']

const translateObject = async (obj, lang) => {
  const result = {}
  for (const key in obj) {
    if (typeof obj[key] === 'object') {
      result[key] = await translateObject(obj[key], lang)
    } else {
      const res = await translate(obj[key], { to: lang })
      result[key] = res.text
    }
  }
  return result
}

;(async () => {
  for (const lang of targetLangs) {
    const translated = await translateObject(fr, lang)
    fs.writeFileSync(
      `./emails/translations/${lang}.json`,
      JSON.stringify(translated, null, 2),
    )
    console.log(`✅ ${lang}.json généré`)
  }
})()
