const StepEntry = require('../models/StepEntry')
const User = require('../models/User')
const Notification = require('../models/Notification')
const { checkAuthorization } = require('../middlewares/VerifyAuthorization')
const {
  parseAppleHealthData,
  parseSamsungHealthData,
} = require('../utils/ParseHealthData')
const {
  updateUserStatsAfterImport,
  updateUserStats,
} = require('../helpers/StepHelpers')
const { updateChallengeProgress } = require('./ChallengeController')
const { computeXpForEntry } = require('../utils/CalculateXP')
const { updateUserRewards } = require('../controllers/RewardController')
const { calculateLevel } = require('../utils/LevelSystem')
const {
  sendLocalizedError,
  sendLocalizedSuccess,
} = require('../utils/ResponseHelper')
const csv = require('csv-parser')

// Récupérer toutes les entrées de l'utilisateur
const getMySteps = async (req, res) => {
  const { userId } = req.params

  if (checkAuthorization(req, res, userId)) return

  try {
    const entries = await StepEntry.find({ user: userId })
      .sort({ date: -1 })
      .lean()

    return sendLocalizedSuccess(res, null, {}, { steps: entries })
  } catch (error) {
    console.error('Error retrieving steps:', error)
    return sendLocalizedError(res, 500, 'errors.steps.retrieve_error')
  }
}

// Créer une nouvelle entrée
const createStepEntry = async (req, res) => {
  const { userId } = req.params
  const entryData = req.body

  if (checkAuthorization(req, res, userId)) return

  try {
    const { hourlyData, date, day } = entryData

    // Validate hourlyData exists and has at least one entry
    if (!hourlyData || hourlyData.length === 0) {
      return sendLocalizedError(res, 400, 'errors.steps.no_hourly_data')
    }

    // Extract the first hourly entry (assuming one entry per request)
    const [hourlyEntry] = hourlyData
    const { hour, steps, distance, calories, activeTime, mode } = hourlyEntry

    // Validate required fields in the hourly entry
    if (hour === undefined) {
      return sendLocalizedError(res, 400, 'errors.steps.hour_required')
    }

    const parsedHour = parseInt(hour, 10)
    const parsedSteps = parseFloat(steps)
    const parsedDistance = parseFloat(distance)
    const parsedCalories = parseFloat(calories)
    const parsedActiveTime = parseFloat(activeTime)

    if (isNaN(parsedHour) || parsedHour < 0 || parsedHour > 23) {
      return sendLocalizedError(res, 400, 'errors.steps.invalid_hour')
    }

    if (isNaN(parsedSteps) || parsedSteps < 0) {
      return sendLocalizedError(res, 400, 'errors.steps.invalid_steps')
    }

    if (isNaN(parsedDistance) || parsedDistance < 0) {
      return sendLocalizedError(res, 400, 'errors.steps.invalid_distance')
    }

    if (isNaN(parsedCalories) || parsedCalories < 0) {
      return sendLocalizedError(res, 400, 'errors.steps.invalid_calories')
    }

    if (isNaN(parsedActiveTime) || parsedActiveTime < 0) {
      return sendLocalizedError(res, 400, 'errors.steps.invalid_active_time')
    }

    if (!mode || !date || !day) {
      return sendLocalizedError(res, 400, 'errors.steps.invalid_mode')
    }

    const existingEntry = await StepEntry.findOne({ user: userId, day })

    if (existingEntry) {
      const hourExists = existingEntry.hourlyData.some(
        (data) => data.hour === hour,
      )
      if (hourExists) {
        return sendLocalizedError(res, 409, 'errors.steps.existing_entry', {
          hour,
        })
      }

      existingEntry.hourlyData.push(hourlyEntry)
      existingEntry.hourlyData.sort((a, b) => a.hour - b.hour)

      existingEntry.totalSteps += parsedSteps || 0
      existingEntry.totalDistance += parsedDistance || 0
      existingEntry.totalCalories += parsedCalories || 0
      existingEntry.totalActiveTime += parsedActiveTime || 0
      existingEntry.xp += computeXpForEntry(hourlyEntry)

      await existingEntry.save()
      await updateUserStats(userId)
      await updateChallengeProgress(userId)
      await updateUserLevel(userId)
      await updateUserRewards(userId)

      return sendLocalizedSuccess(
        res,
        'success.steps.updated',
        {},
        { entry: existingEntry },
      )
    } else {
      const newEntry = await StepEntry.create({
        user: userId,
        date: new Date(date),
        day,
        hourlyData: [hourlyEntry],
        totalSteps: parsedSteps || 0,
        totalDistance: parsedDistance || 0,
        totalCalories: parsedCalories || 0,
        totalActiveTime: parsedActiveTime || 0,
        xp: computeXpForEntry(hourlyEntry),
        isVerified: false,
      })

      await updateUserStats(userId)
      await updateChallengeProgress(userId)
      await updateUserLevel(userId)
      await updateUserRewards(userId)

      return sendLocalizedSuccess(
        res,
        'success.steps.created',
        {},
        { entry: newEntry },
      )
    }
  } catch (error) {
    console.error('Error creating step entry:', error)
    return sendLocalizedError(res, 500, 'errors.steps.creation_error')
  }
}

// Modifier une entrée existante
const updateStepEntry = async (req, res) => {
  const { userId, entryId } = req.params
  const updateData = req.body

  if (checkAuthorization(req, res, userId)) return

  try {
    const entry = await StepEntry.findOne({ _id: entryId, user: userId })

    if (!entry) {
      return sendLocalizedError(res, 404, 'errors.steps.not_found')
    }

    const allowedUpdates = [
      'totalSteps',
      'totalDistance',
      'totalCalories',
      'totalActiveTime',
      'dominantMode',
    ]
    allowedUpdates.forEach((field) => {
      if (updateData[field] !== undefined) {
        entry[field] = updateData[field]
      }
    })
    entry.isVerified = false
    entry.xp = computeXpForEntry(entry)

    await entry.save()
    await updateUserStats(userId)
    await updateChallengeProgress(userId)
    await updateUserLevel(userId)
    await updateUserRewards(userId)

    return sendLocalizedSuccess(res, 'success.steps.updated', {}, { entry })
  } catch (error) {
    console.error('Error updating step entry:', error)
    return sendLocalizedError(res, 500, 'errors.steps.update_error')
  }
}

// Rendre une entrée favorite
const FavoriteStepEntry = async (req, res) => {
  const { userId, entryId } = req.params

  if (checkAuthorization(req, res, userId)) return

  try {
    const entry = await StepEntry.findOne({ _id: entryId, user: userId })

    if (!entry) {
      return sendLocalizedError(res, 404, 'errors.steps.not_found')
    }

    entry.isFavorite = !entry.isFavorite
    await entry.save()

    return sendLocalizedSuccess(res, null, {}, { entry })
  } catch (error) {
    console.error('Error favoriting step entry:', error)
    return sendLocalizedError(res, 500, 'errors.steps.favorite_error')
  }
}

// Supprimer une entrée
const deleteStepEntry = async (req, res) => {
  const { userId, entryId } = req.params

  if (checkAuthorization(req, res, userId)) return

  try {
    const entry = await StepEntry.findOne({ _id: entryId, user: userId })

    if (!entry) {
      return sendLocalizedError(res, 404, 'errors.steps.not_found')
    }

    await entry.remove()
    await updateUserStats(userId)
    await updateUserRewards(userId)
    await updateChallengeProgress(userId)

    return sendLocalizedSuccess(res, 'success.steps.deleted')
  } catch (error) {
    console.error('Error deleting step entry:', error)
    return sendLocalizedError(res, 500, 'errors.steps.delete_error')
  }
}

// Endpoint pour l'importation
const importHealthData = async (req, res) => {
  const { userId } = req.params
  const file = req.file // image envoyée via multer

  if (!file) {
    return sendLocalizedError(res, 400, 'errors.profile.no_file_provided')
  }

  if (file.size > 100 * 1024 * 1024) {
    // 100MB
    return sendLocalizedError(res, 400, 'errors.steps.file_too_big')
  }

  if (checkAuthorization(req, res, userId)) return

  try {
    let entries = []

    if (
      req.file.mimetype === 'text/xml' ||
      req.file.originalname.endsWith('.xml')
    ) {
      // Utilisez directement le buffer
      const xmlData = req.file.buffer.toString('utf8')
      entries = await parseAppleHealthData(xmlData, userId)
    } else if (
      req.file.mimetype === 'text/csv' ||
      req.file.originalname.endsWith('.csv')
    ) {
      // Pour CSV, utilisez le buffer avec csv-parser
      const csvData = []
      const stream = require('stream')
      const bufferStream = new stream.PassThrough()
      bufferStream.end(req.file.buffer)

      await new Promise((resolve, reject) => {
        bufferStream
          .pipe(csv())
          .on('data', (row) => csvData.push(row))
          .on('end', resolve)
          .on('error', reject)
      })

      entries = parseSamsungHealthData(csvData, userId)
    }

    const filteredEntries = entries.filter(
      (entry) => new Date(entry.date) >= new Date('2025-05-01T00:00:00Z'),
    )

    // Sauvegarder en base
    await StepEntry.insertMany(filteredEntries)
    await updateUserStatsAfterImport(userId, filteredEntries)
    await updateChallengeProgress(userId)
    await updateUserLevel(userId)
    await updateUserRewards(userId)

    return sendLocalizedSuccess(
      res,
      'success.steps.created',
      {},
      { entries: filteredEntries },
    )
  } catch (error) {
    console.error('Error importing health data:', error)
    return sendLocalizedError(res, 500, 'errors.steps.creation_error')
  }
}

const updateUserLevel = async (userId) => {
  try {
    const user = await User.findById(userId)
    if (!user) return

    const currentLevel = user.level
    const newLevel = calculateLevel(user.totalXP)

    if (newLevel > currentLevel) {
      user.level = newLevel
      await user.save()
      await createLevelUpNotification(userId, newLevel)
    }
  } catch (error) {
    console.error('Error updating user level:', error)
  }
}

const createLevelUpNotification = async (userId, newLevel) => {
  try {
    await Notification.create({
      recipient: userId,
      sender: null,
      type: 'level_up',
      content: {
        en: `Congratulations! You've reached level ${newLevel}!`,
        fr: `Félicitations ! Vous avez atteint le niveau ${newLevel} !`,
        es: `¡Felicitaciones! ¡Has alcanzado el nivel ${newLevel}!`,
        de: `Herzlichen Glückwunsch! Du hast Level ${newLevel} erreicht!`,
      },
      status: 'unread',
      DeleteAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    })
  } catch (error) {
    console.error('Error creating level up notification:', error)
  }
}

module.exports = {
  getMySteps,
  createStepEntry,
  updateStepEntry,
  FavoriteStepEntry,
  deleteStepEntry,
  importHealthData,
}
