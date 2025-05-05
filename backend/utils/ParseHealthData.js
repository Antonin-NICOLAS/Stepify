const xml2js = require('xml2js');
const StepEntry = require('../models/StepEntry');

const parseAppleHealthData = async (xmlData, userId) => {
  const parser = new xml2js.Parser();
  const result = await parser.parseStringPromise(xmlData);
  const minDate = new Date('2025-05-01T00:00:00Z');

  const stepsByDay = {};
  const otherDataByDay = {};
  const workouts = [];

  const FIFTEEN_MIN_MS = 15 * 60 * 1000;

  result.HealthData.Record.forEach(record => {
    const type = record.$.type;
    const startDate = new Date(record.$.startDate);
    const endDate = new Date(record.$.endDate);
    const value = parseFloat(record.$.value);
    const source = record.$.sourceName;
    const dateKey = startDate.toISOString().split('T')[0];

    if (startDate < minDate) return;

    // 👣 Étapes
    if (type === 'HKQuantityTypeIdentifierStepCount') {
      if (!stepsByDay[dateKey]) stepsByDay[dateKey] = {};
      if (!stepsByDay[dateKey][source]) stepsByDay[dateKey][source] = [];
      stepsByDay[dateKey][source].push({ startDate, endDate, value });
      return;
    }

    // 🏋️‍♂️ Workout (pour mode = run / bike)
    if (type === 'HKWorkoutActivityType') {
      workouts.push({
        date: startDate,
        type: record.$.workoutActivityType,
        duration: parseFloat(record.$.duration)
      });
      return;
    }

    // 🔥 Autres données (calories, distance, activeTime)
    const supportedTypes = [
      'HKQuantityTypeIdentifierDistanceWalkingRunning',
      'HKQuantityTypeIdentifierActiveEnergyBurned',
      'HKQuantityTypeIdentifierAppleExerciseTime'
    ];
    if (supportedTypes.includes(type)) {
      if (!otherDataByDay[dateKey]) otherDataByDay[dateKey] = {};
      if (!otherDataByDay[dateKey][type]) {
        otherDataByDay[dateKey][type] = { watch: 0, iphone: 0 };
      }

      if (source.includes('Watch')) {
        otherDataByDay[dateKey][type].watch += value;
      } else if (source.includes('iPhone')) {
        otherDataByDay[dateKey][type].iphone += value;
      }
    }
  });

  const finalEntries = [];

  Object.entries(stepsByDay).forEach(([dateKey, sources]) => {
    const watchRecords = Object.entries(sources)
      .filter(([source]) => source.includes('Watch'))
      .flatMap(([, recs]) => recs)
      .sort((a, b) => a.startDate - b.startDate);

    const iphoneRecords = Object.entries(sources)
      .filter(([source]) => source.includes('iPhone'))
      .flatMap(([, recs]) => recs)
      .sort((a, b) => a.startDate - b.startDate);

    let totalSteps = 0;

    if (watchRecords.length === 0) {
      totalSteps = iphoneRecords.reduce((sum, r) => sum + r.value, 0);
    } else {
      for (let i = 0; i < watchRecords.length; i++) {
        totalSteps += watchRecords[i].value;

        const currentEnd = watchRecords[i].endDate;
        const nextStart = watchRecords[i + 1]?.startDate;

        if (nextStart && nextStart - currentEnd > FIFTEEN_MIN_MS) {
          const gapStart = currentEnd;
          const gapEnd = nextStart;

          iphoneRecords.forEach(r => {
            if (r.startDate >= gapStart && r.endDate <= gapEnd) {
              totalSteps += r.value;
            }
          });
        }
      }
    }

    // 🔍 Autres données avec priorité à la Watch
    const other = otherDataByDay[dateKey] || {};
    const distance = other['HKQuantityTypeIdentifierDistanceWalkingRunning'];
    const calories = other['HKQuantityTypeIdentifierActiveEnergyBurned'];
    const activeTime = other['HKQuantityTypeIdentifierAppleExerciseTime'];

    finalEntries.push({
      user: userId,
      date: new Date(dateKey),
      day: dateKey,
      steps: Math.round(totalSteps),
      distance: distance ? (distance.watch || distance.iphone || 0) : 0,
      calories: calories ? (calories.watch || calories.iphone || 0) : 0,
      activeTime: activeTime ? (activeTime.watch || activeTime.iphone || 0) : 0,
      mode: 'walk',
      isVerified: true
    });
  });

  // 🎯 Déterminer le mode dominant grâce aux workouts
  workouts.forEach(workout => {
    const dateKey = workout.date.toISOString().split('T')[0];
    const entry = finalEntries.find(e => e.day === dateKey);
    if (!entry) return;

    const currentDuration = workout.duration;
    const existingDuration = entry.workoutDuration || 0;

    if (currentDuration > existingDuration) {
      if (workout.type === 'HKWorkoutActivityTypeRunning') entry.mode = 'run';
      if (workout.type === 'HKWorkoutActivityTypeCycling') entry.mode = 'bike';
      entry.workoutDuration = currentDuration;
    }
  });

  // Supprimer l'entrée existante pour le jour le plus récent (s'il y en a une)
  const lastEntry = await StepEntry.findOne({ user: userId }).sort({ date: -1 });
  if (lastEntry) {
    const lastDay = lastEntry.day || lastEntry.date.toISOString().split('T')[0];
    await StepEntry.deleteMany({ user: userId, day: lastDay });
  }

  // Ne garder que les nouveaux jours à partir du jour du dernier import (inclus)
  const lastEntry2 = await StepEntry.findOne({ user: userId }).sort({ date: -1 });
  let filteredEntries = finalEntries;
  if (lastEntry2) {
    const lastDay = lastEntry2.day || lastEntry2.date.toISOString().split('T')[0];
    filteredEntries = finalEntries.filter(entry => entry.day >= lastDay);
  }

  return filteredEntries;
};

const parseSamsungHealthData = (csvData, userId) => {
  const entries = [];
  const minDate = new Date('2025-05-01T00:00:00Z');

  csvData.forEach(row => {
    if (row['DataType'] === 'com.samsung.health.exercise') {
      const recordDate = new Date(row['Start Time']);

      if (recordDate >= minDate) {
        entries.push({
          user: userId,
          date: recordDate,
          day: recordDate.toISOString().split('T')[0],
          steps: parseInt(row['Step Count'] || 0),
          distance: parseFloat(row['Distance'] || 0),
          calories: parseInt(row['Calorie'] || 0),
          mode: row['Exercise Type'] === 'running' ? 'run' : 'walk',
          activeTime: parseInt(row['Duration'] || 0) / 60000,
          isVerified: true
        });
      }
    }
  });

  return entries;
};

module.exports = { parseAppleHealthData, parseSamsungHealthData }