const xml2js = require('xml2js')
const StepEntry = require('../models/StepEntry')
const UserModel = require('../models/User')
const { computeXpForEntry } = require('../utils/CalculateXP')

const parseAppleHealthData = async (xmlData, userId) => {
  const parser = new xml2js.Parser()
  const result = await parser.parseStringPromise(xmlData)
  const minDate = new Date('2025-05-01T00:00:00Z')

  const stepsByHour = {} // {dateKey: {hour: {source: [records]}}}
  const otherDataByHour = {} // {dateKey: {hour: {type: {watch, iphone}}}}
  const workouts = []

  const FIFTEEN_MIN_MS = 15 * 60 * 1000

  result.HealthData.Record.forEach((record) => {
    const type = record.$.type
    const startDate = new Date(record.$.startDate)
    const endDate = new Date(record.$.endDate)
    const value = parseFloat(record.$.value)
    const source = record.$.sourceName
    const dateKey = startDate.toISOString().split('T')[0]
    const hour = startDate.getHours()

    if (startDate < minDate) return

    // 👣 Étapes
    if (type === 'HKQuantityTypeIdentifierStepCount') {
      if (!stepsByHour[dateKey]) stepsByHour[dateKey] = {}
      if (!stepsByHour[dateKey][hour]) stepsByHour[dateKey][hour] = {}
      if (!stepsByHour[dateKey][hour][source])
        stepsByHour[dateKey][hour][source] = []
      stepsByHour[dateKey][hour][source].push({ startDate, endDate, value })
      return
    }

    // 🏋️‍♂️ Workout (pour mode = run / bike)
    if (type === 'HKWorkoutActivityType') {
      workouts.push({
        date: startDate,
        type: record.$.workoutActivityType,
        duration: parseFloat(record.$.duration),
      })
      return
    }

    // 🔥 Autres données (calories, distance, activeTime)
    const supportedTypes = [
      'HKQuantityTypeIdentifierDistanceWalkingRunning',
      'HKQuantityTypeIdentifierActiveEnergyBurned',
      'HKQuantityTypeIdentifierAppleExerciseTime',
    ]
    if (supportedTypes.includes(type)) {
      if (!otherDataByHour[dateKey]) otherDataByHour[dateKey] = {}
      if (!otherDataByHour[dateKey][hour]) otherDataByHour[dateKey][hour] = {}
      if (!otherDataByHour[dateKey][hour][type]) {
        otherDataByHour[dateKey][hour][type] = { watch: 0, iphone: 0 }
      }

      if (source.includes('Watch')) {
        otherDataByHour[dateKey][hour][type].watch += value
      } else if (source.includes('iPhone')) {
        otherDataByHour[dateKey][hour][type].iphone += value
      }
    }
  })

  const finalEntries = []

  Object.entries(stepsByHour).forEach(([dateKey, hours]) => {
    const hourlyData = []
    let totalSteps = 0
    let totalDistance = 0
    let totalCalories = 0
    let totalActiveTime = 0

    Object.entries(hours).forEach(([hour, sources]) => {
      const hourNum = parseInt(hour)
      const watchRecords = Object.entries(sources)
        .filter(([source]) => source.includes('Watch'))
        .flatMap(([, recs]) => recs)
        .sort((a, b) => a.startDate - b.startDate)

      const iphoneRecords = Object.entries(sources)
        .filter(([source]) => source.includes('iPhone'))
        .flatMap(([, recs]) => recs)
        .sort((a, b) => a.startDate - b.startDate)

      let hourSteps = 0

      if (watchRecords.length === 0) {
        hourSteps = iphoneRecords.reduce((sum, r) => sum + r.value, 0)
      } else {
        for (let i = 0; i < watchRecords.length; i++) {
          hourSteps += watchRecords[i].value

          const currentEnd = watchRecords[i].endDate
          const nextStart = watchRecords[i + 1]?.startDate

          if (nextStart && nextStart - currentEnd > FIFTEEN_MIN_MS) {
            const gapStart = currentEnd
            const gapEnd = nextStart

            iphoneRecords.forEach((r) => {
              if (r.startDate >= gapStart && r.endDate <= gapEnd) {
                hourSteps += r.value
              }
            })
          }
        }
      }

      // Autres données pour cette heure
      const other = otherDataByHour[dateKey]?.[hourNum] || {}
      const distance = other['HKQuantityTypeIdentifierDistanceWalkingRunning']
      const calories = other['HKQuantityTypeIdentifierActiveEnergyBurned']
      const activeTime = other['HKQuantityTypeIdentifierAppleExerciseTime']

      const hourDistance = distance ? distance.watch || distance.iphone || 0 : 0
      const hourCalories = calories ? calories.watch || calories.iphone || 0 : 0
      const hourActiveTime = activeTime
        ? activeTime.watch || activeTime.iphone || 0
        : 0

      hourlyData.push({
        hour: hourNum,
        steps: Math.round(hourSteps),
        distance: Math.round(hourDistance * 100) / 100,
        calories: Math.round(hourCalories * 100) / 100,
        activeTime: hourActiveTime,
        mode: 'walk', // sera mis à jour plus tard si workout
      })

      // Mise à jour des totaux
      totalSteps += hourSteps
      totalDistance += Math.round(hourDistance * 100) / 100
      totalCalories += Math.round(hourCalories * 100) / 100
      totalActiveTime += hourActiveTime
    })

    // Création de l'entrée finale pour la journée
    const entry = {
      user: userId,
      date: new Date(dateKey),
      day: dateKey,
      hourlyData,
      totalSteps: Math.round(totalSteps),
      totalDistance: parseFloat(totalDistance.toFixed(3)),
      totalCalories: Math.round(totalCalories),
      totalActiveTime: Math.round(totalActiveTime),
      dominantMode: 'walk',
      isVerified: true,
      xp: 0, // sera calculé plus tard
    }

    finalEntries.push(entry)
  })

  // 🎯 Déterminer le mode dominant grâce aux workouts
  workouts.forEach((workout) => {
    const dateKey = workout.date.toISOString().split('T')[0]
    const entry = finalEntries.find((e) => e.day === dateKey)
    if (!entry) return

    const currentDuration = workout.duration
    const existingDuration = entry.workoutDuration || 0

    if (currentDuration > existingDuration) {
      let workoutMode = 'walk'
      if (workout.type === 'HKWorkoutActivityTypeRunning') workoutMode = 'run'
      if (workout.type === 'HKWorkoutActivityTypeCycling') workoutMode = 'bike'

      entry.dominantMode = workoutMode
      entry.workoutDuration = currentDuration

      // Mettre à jour le mode dans les données horaires si nécessaire
      entry.hourlyData.forEach((hourData) => {
        hourData.mode = workoutMode
      })
    }
  })

  // Calculer l'XP pour chaque entrée
  finalEntries.forEach((entry) => {
    entry.xp = computeXpForEntry({
      mode: entry.dominantMode,
      steps: entry.totalSteps,
      distance: entry.totalDistance,
      calories: entry.totalCalories,
      activeTime: entry.totalActiveTime,
    })
  })

  // Supprimer l'entrée existante pour le jour le plus récent (s'il y en a une)
  const lastEntry = await StepEntry.findOne({ user: userId }).sort({
    date: -1,
  })
  if (lastEntry) {
    const lastDay = lastEntry.day || lastEntry.date.toISOString().split('T')[0]
    const user = await UserModel.findById(userId)
    user.totalSteps -= lastEntry.totalSteps
    user.totalDistance -= lastEntry.totalDistance
    user.totalCalories -= lastEntry.totalCalories
    user.totalXP -= lastEntry.xp
    await user.save()
    await StepEntry.deleteMany({ user: userId, day: lastDay })
  }

  // Ne garder que les nouveaux jours à partir du jour du dernier import (inclus)
  const lastEntry2 = await StepEntry.findOne({ user: userId }).sort({
    date: -1,
  })
  let filteredEntries = finalEntries
  if (lastEntry2) {
    const lastDay =
      lastEntry2.day || lastEntry2.date.toISOString().split('T')[0]
    filteredEntries = finalEntries.filter((entry) => entry.day > lastDay)
  }

  return filteredEntries
}

const parseSamsungHealthData = (csvData, userId) => {
  const entriesByDay = {}
  const minDate = new Date('2025-05-01T00:00:00Z')

  csvData.forEach((row) => {
    if (row['DataType'] === 'com.samsung.health.exercise') {
      const recordDate = new Date(row['Start Time'])
      if (recordDate < minDate) return

      const dateKey = recordDate.toISOString().split('T')[0]
      const hour = recordDate.getHours()

      if (!entriesByDay[dateKey]) {
        entriesByDay[dateKey] = {
          hourlyData: Array(24)
            .fill()
            .map(() => ({
              steps: 0,
              distance: 0,
              calories: 0,
              activeTime: 0,
              mode: 'walk',
            })),
          totalSteps: 0,
          totalDistance: 0,
          totalCalories: 0,
          totalActiveTime: 0,
          dominantMode: 'walk',
          workoutDuration: 0,
        }
      }

      const dayEntry = entriesByDay[dateKey]
      const mode = row['Exercise Type'] === 'running' ? 'run' : 'walk'
      const duration = parseInt(row['Duration'] || 0) / 60000 // en minutes
      const steps = parseInt(row['Step Count'] || 0)
      const distance = parseFloat(row['Distance'] || 0)
      const calories = parseInt(row['Calorie'] || 0)

      // Mettre à jour les données horaires
      dayEntry.hourlyData[hour] = {
        hour,
        steps: dayEntry.hourlyData[hour].steps + Math.round(steps * 100) / 100,
        distance:
          dayEntry.hourlyData[hour].distance + Math.round(distance * 100) / 100,
        calories:
          dayEntry.hourlyData[hour].calories + Math.round(calories * 100) / 100,
        activeTime: dayEntry.hourlyData[hour].activeTime + duration,
        mode,
      }

      // Mettre à jour les totaux
      dayEntry.totalSteps += Math.round(steps * 100) / 100
      dayEntry.totalDistance += Math.round(distance * 100) / 100
      dayEntry.totalCalories += Math.round(calories * 100) / 100
      dayEntry.totalActiveTime += duration

      // Déterminer le mode dominant (le plus long)
      if (duration > dayEntry.workoutDuration) {
        dayEntry.dominantMode = mode
        dayEntry.workoutDuration = duration
      }
    }
  })

  // Convertir en format final
  const finalEntries = Object.entries(entriesByDay).map(([dateKey, data]) => {
    // Filtrer les heures avec des données (steps > 0 ou activeTime > 0)
    const hourlyData = data.hourlyData.filter(
      (hour) => hour.steps > 0 || hour.activeTime > 0
    )

    return {
      user: userId,
      date: new Date(dateKey),
      day: dateKey,
      hourlyData,
      totalSteps: data.totalSteps,
      totalDistance: parseFloat(data.totalDistance.toFixed(2)),
      totalCalories: data.totalCalories,
      totalActiveTime: Math.round(data.totalActiveTime),
      dominantMode: data.dominantMode,
      isVerified: true,
      xp: computeXpForEntry({
        mode: data.dominantMode,
        steps: data.totalSteps,
        distance: data.totalDistance,
        calories: data.totalCalories,
        activeTime: data.totalActiveTime,
      }),
    }
  })

  return finalEntries
}

module.exports = { parseAppleHealthData, parseSamsungHealthData }
