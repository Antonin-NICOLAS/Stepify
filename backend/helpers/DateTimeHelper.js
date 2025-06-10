const moment = require('moment-timezone')

/**
 * Convertit une date locale en UTC en fonction du fuseau horaire
 * @param {Date|string} localDate - Date locale
 * @param {string} timezone - Fuseau horaire (ex: 'Europe/Paris')
 * @returns {Date} Date en UTC
 */
const convertLocalToUTC = (localDate, timezone = 'UTC') => {
  return moment.tz(localDate, timezone).utc().toDate()
}

/**
 * Convertit une date UTC en date locale en fonction du fuseau horaire
 * @param {Date|string} utcDate - Date UTC
 * @param {string} timezone - Fuseau horaire (ex: 'Europe/Paris')
 * @returns {Date} Date locale
 */
const convertUTCToLocal = (utcDate, timezone = 'UTC') => {
  return moment.utc(utcDate).tz(timezone).toDate()
}

/**
 * Vérifie si une date est dans le futur en tenant compte du fuseau horaire
 * @param {Date|string} date - Date à vérifier
 * @param {string} timezone - Fuseau horaire (ex: 'Europe/Paris')
 * @returns {boolean}
 */
const isDateInFuture = (date, timezone = 'UTC') => {
  const localNow = moment().tz(timezone)
  const localDate = moment(date).tz(timezone)
  return localDate.isAfter(localNow)
}

/**
 * Obtient le début de la journée en UTC pour une date et un fuseau horaire donnés
 * @param {Date|string} date - Date
 * @param {string} timezone - Fuseau horaire (ex: 'Europe/Paris')
 * @returns {Date} Date UTC du début de la journée
 */
const getStartOfDayUTC = (date, timezone = 'UTC') => {
  return moment.tz(date, timezone).startOf('day').utc().toDate()
}

module.exports = {
  convertLocalToUTC,
  convertUTCToLocal,
  isDateInFuture,
  getStartOfDayUTC,
}
