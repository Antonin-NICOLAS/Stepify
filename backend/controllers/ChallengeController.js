const Challenge = require('../models/Challenge')
const Notification = require('../models/Notification')
const { checkAuthorization } = require('../middlewares/VerifyAuthorization')
const {
  generateAccessCode,
  validateChallengeDates,
  determineChallengeStatus,
  calculateUserProgress,
  updateSingleChallengeProgress,
} = require('../helpers/ChallengeHelpers')
const {
  sendLocalizedError,
  sendLocalizedSuccess,
} = require('../utils/ResponseHelper')
const { translateToAllLanguages } = require('../languages/translate')
const { convertLocalToUTC } = require('../helpers/DateTimeHelper')
const moment = require('moment-timezone')

/** Get public challenges */
const getPublicChallenges = async (req, res) => {
  const { limit = 10, skip = 0 } = req.query

  try {
    const challenges = await Challenge.find({ isPrivate: false })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .populate('creator', 'username avatarUrl firstName lastName')
      .populate('participants.user', 'username avatarUrl firstName lastName')
      .sort({ createdAt: -1 })

    const total = await Challenge.countDocuments({ isPrivate: false })

    return sendLocalizedSuccess(
      res,
      null,
      {},
      {
        challenges,
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
      },
    )
  } catch (error) {
    console.error('Error fetching challenges:', error)
    return sendLocalizedError(
      res,
      500,
      'errors.challenges.get_challenges_error',
    )
  }
}

/** Get user's challenges (created or participating in) */
const getMyChallenges = async (req, res) => {
  const { userId } = req.params
  const { limit = 10, skip = 0 } = req.query

  if (checkAuthorization(req, res, userId)) return

  try {
    const challenges = await Challenge.find({
      $or: [{ creator: userId }, { 'participants.user': userId }],
    })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .populate('creator', 'username avatarUrl')
      .populate('participants.user', 'username avatarUrl')
      .sort({ createdAt: -1 })

    // Extract user-specific progress from each challenge
    const userProgress = challenges.map((challenge) => {
      const participant = challenge.participants.find(
        (p) => p.user._id.toString() === userId,
      )
      return {
        challengeId: challenge._id,
        progress: participant?.progress || 0,
        goal: participant?.goal || 0,
        xpEarned: participant?.xpEarned || 0,
        time: participant?.time || 0,
        completed: participant?.completed || false,
        joinedAt: participant?.joinedAt,
      }
    })

    return sendLocalizedSuccess(res, null, {}, { challenges, userProgress })
  } catch (error) {
    console.error('Error fetching user challenges:', error)
    return sendLocalizedError(
      res,
      500,
      'errors.challenges.get_challenges_error',
    )
  }
}

/** Create a new challenge */
const createChallenge = async (req, res) => {
  const { userId } = req.params

  if (checkAuthorization(req, res, userId)) return

  try {
    const {
      name,
      description,
      startDate,
      endDate,
      activityType,
      goal,
      time,
      xpReward,
      participants,
      isPrivate,
      difficulty = 'hard',
      timezone = 'UTC',
    } = req.body

    // Validate required fields
    if (
      !name ||
      !startDate ||
      !activityType ||
      !goal ||
      !xpReward ||
      isPrivate === undefined ||
      !difficulty ||
      !timezone
    ) {
      return sendLocalizedError(res, 400, 'errors.generic.fields_missing')
    }

    // Convertir les dates en UTC
    const startDateUTC = convertLocalToUTC(startDate, timezone)
    const endDateUTC = endDate ? convertLocalToUTC(endDate, timezone) : null

    // Validate dates
    const dateValidation = validateChallengeDates(startDateUTC, endDateUTC)
    if (!dateValidation.valid) {
      return sendLocalizedError(res, 400, dateValidation.error)
    }

    // Validate activity type specific requirements
    if (
      ['steps-time', 'distance-time', 'calories-time', 'xp-time'].includes(
        activityType,
      ) &&
      !time
    ) {
      return sendLocalizedError(res, 400, 'errors.challenges.time_required', {
        activityType,
      })
    }

    // Traduire le nom et la description avec détection automatique de la langue
    const [nameTranslations, descriptionTranslations] = await Promise.all([
      translateToAllLanguages(name),
      description ? translateToAllLanguages(description) : null,
    ])

    // Generate access code if challenge is private
    const accessCode = isPrivate ? generateAccessCode() : null

    // Determine initial status
    const status = determineChallengeStatus(startDateUTC, endDateUTC)

    const newChallenge = new Challenge({
      name: nameTranslations,
      description: descriptionTranslations,
      startDate: startDateUTC,
      endDate: endDateUTC,
      creator: userId,
      activityType,
      goal,
      time,
      xpReward,
      difficulty,
      isPrivate,
      accessCode,
      timezone,
      participants: [
        {
          user: userId,
          goal: 0,
          xpEarned: 0,
          time: 0,
          progress: 0,
          joinedAt: new Date(),
          completed: false,
          lastUpdated: new Date(),
        },
      ],
      status,
    })

    await newChallenge.save()
    await updateSingleChallengeProgress(userId, newChallenge._id)

    // Send invitations if private and has participants
    if (isPrivate && participants && participants.length > 0) {
      const invitations = participants
        .filter((id) => id !== userId)
        .map((toId) => ({
          challenge: newChallenge._id,
          sender: userId,
          recipient: toId,
          type: 'challenge_invite',
          content: {
            en: `You've been invited to join the challenge "${newChallenge.name.en}"!`,
            fr: `Vous avez été invité à rejoindre le challenge "${newChallenge.name.fr}" !`,
            es: `¡Has sido invitado a unirte al desafío "${newChallenge.name.es}"!`,
            de: `Du wurdest eingeladen, an der Challenge "${newChallenge.name.de}" teilzunehmen!`,
          },
          status: 'unread',
          DeleteAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        }))

      await Notification.insertMany(invitations)
    }

    return sendLocalizedSuccess(
      res,
      'success.challenges.created',
      {},
      { challenge: newChallenge },
    )
  } catch (error) {
    console.error('Error creating challenge:', error)
    return sendLocalizedError(res, 500, 'errors.challenges.creation_error')
  }
}

/** Update a challenge */
const updateChallenge = async (req, res) => {
  const { userId, challengeId } = req.params
  const updates = req.body

  if (checkAuthorization(req, res, userId)) return

  try {
    const challenge = await Challenge.findById(challengeId)
    if (!challenge) {
      return sendLocalizedError(res, 404, 'errors.challenges.not_found')
    }

    // Check if user is the creator
    if (challenge.creator.toString() !== userId) {
      return sendLocalizedError(
        res,
        403,
        'errors.challenges.creator_modify_only',
      )
    }

    // Validate and convert dates if they're being updated
    if (updates.startDate || updates.endDate) {
      const timezone = updates.timezone || challenge.timezone

      // Convertir les dates en UTC
      if (updates.startDate) {
        updates.startDate = convertLocalToUTC(updates.startDate, timezone)
      }
      if (updates.endDate) {
        updates.endDate = convertLocalToUTC(updates.endDate, timezone)
      }

      const startDate = updates.startDate || challenge.startDate
      const endDate = updates.endDate || challenge.endDate

      const dateValidation = validateChallengeDates(startDate, endDate)
      if (!dateValidation.valid) {
        return sendLocalizedError(res, 400, dateValidation.error)
      }

      // Mettre à jour le statut en fonction des nouvelles dates
      updates.status = determineChallengeStatus(startDate, endDate)
    }

    if (updates.isPrivate !== undefined) {
      if (updates.isPrivate && !challenge.accessCode) {
        return sendLocalizedError(
          res,
          400,
          'errors.challenges.access_code_required',
        )
      }
      if (!updates.isPrivate && challenge.accessCode) {
        updates.accessCode = null
      }
    }

    // Update challenge fields
    Object.keys(updates).forEach((key) => {
      challenge[key] = updates[key]
    })

    const updatedChallenge = await challenge.save()
    return sendLocalizedSuccess(
      res,
      'success.challenges.updated',
      {},
      { challenge: updatedChallenge },
    )
  } catch (error) {
    console.error('Error updating challenge:', error)
    return sendLocalizedError(res, 500, 'errors.challenges.update_error')
  }
}

/** Join a challenge (private or public) */
const joinChallenge = async (req, res) => {
  const { userId } = req.params
  const { accessCode, challengeId } = req.body

  if (checkAuthorization(req, res, userId)) return

  try {
    let challenge
    if (accessCode) {
      challenge = await Challenge.findOne({ accessCode, isPrivate: true })
    } else {
      challenge = await Challenge.findById(challengeId)
    }

    if (!challenge) {
      return sendLocalizedError(res, 404, 'errors.challenges.not_found')
    }

    if (challenge.isPrivate && challenge.accessCode !== accessCode) {
      return sendLocalizedError(
        res,
        403,
        'errors.challenges.access_code_required',
      )
    }

    // Check if user is already a participant
    const isParticipant = challenge.participants.some(
      (p) => p.user.toString() === userId,
    )
    if (isParticipant) {
      return sendLocalizedError(
        res,
        400,
        'errors.challenges.already_participating',
      )
    }

    // Add user as participant
    challenge.participants.push({
      user: userId,
      goal: 0,
      xpEarned: 0,
      time: 0,
      progress: 0,
      joinedAt: new Date(),
      completed: false,
      lastUpdated: new Date(),
    })

    await challenge.save()
    await updateSingleChallengeProgress(userId, challenge._id)

    const populatedChallenge = await Challenge.findById(challengeId).populate(
      'creator participants.user',
    )

    return sendLocalizedSuccess(
      res,
      'success.challenges.joined',
      {},
      { challenge: populatedChallenge },
    )
  } catch (error) {
    console.error('Error joining challenge:', error)
    return sendLocalizedError(res, 500, 'errors.challenges.join_error')
  }
}

/** Leave a challenge */
const leaveChallenge = async (req, res) => {
  const { userId, challengeId } = req.params

  if (checkAuthorization(req, res, userId)) return

  try {
    const challenge = await Challenge.findById(challengeId)
    if (!challenge) {
      return sendLocalizedError(res, 404, 'errors.challenges.not_found')
    }

    // Check if user is a participant
    const participantIndex = challenge.participants.findIndex(
      (p) => p.user.toString() === userId,
    )
    if (participantIndex === -1) {
      return sendLocalizedError(res, 400, 'errors.challenges.not_participating')
    }

    // Remove participant (creator cannot leave)
    if (challenge.creator.toString() === userId) {
      return sendLocalizedError(
        res,
        400,
        'errors.challenges.creator_cannot_leave',
      )
    }

    challenge.participants.splice(participantIndex, 1)
    await challenge.save()

    return sendLocalizedSuccess(res, 'success.challenges.left')
  } catch (error) {
    console.error('Error leaving challenge:', error)
    return sendLocalizedError(res, 500, 'errors.challenges.leave_error')
  }
}

/** Delete a challenge */
const deleteChallenge = async (req, res) => {
  const { userId, challengeId } = req.params

  if (checkAuthorization(req, res, userId)) return

  try {
    const challenge = await Challenge.findById(challengeId)
    if (!challenge) {
      return sendLocalizedError(res, 404, 'errors.challenges.not_found')
    }

    if (challenge.creator.toString() !== userId) {
      return sendLocalizedError(
        res,
        403,
        'errors.challenges.creator_delete_only',
      )
    }

    await Challenge.deleteOne({ _id: challengeId })

    // Delete related notifications
    await Notification.deleteMany({ challenge: challengeId })

    return sendLocalizedSuccess(res, 'success.challenges.deleted')
  } catch (error) {
    console.error('Error deleting challenge:', error)
    return sendLocalizedError(res, 500, 'errors.challenges.delete_error')
  }
}

/** Regenerate access code for a private challenge */
const regenerateAccessCode = async (req, res) => {
  const { userId, challengeId } = req.params

  if (checkAuthorization(req, res, userId)) return

  try {
    const challenge = await Challenge.findById(challengeId)
    if (!challenge) {
      return sendLocalizedError(res, 404, 'errors.challenges.not_found')
    }

    if (challenge.creator.toString() !== userId) {
      return sendLocalizedError(
        res,
        403,
        'errors.challenges.creator_regenerate_only',
      )
    }

    if (!challenge.isPrivate) {
      return sendLocalizedError(res, 400, 'errors.challenges.private_only')
    }

    const newAccessCode = generateAccessCode()
    challenge.accessCode = newAccessCode
    await challenge.save()

    return sendLocalizedSuccess(
      res,
      'success.challenges.regenerated',
      {},
      { accessCode: newAccessCode },
    )
  } catch (error) {
    console.error('Error regenerating access code:', error)
    return sendLocalizedError(res, 500, 'errors.challenges.regenerate_error')
  }
}

/** Get challenge details */
const getChallengeDetails = async (req, res) => {
  const { challengeId } = req.params

  try {
    const challenge = await Challenge.findById(challengeId)
      .populate('creator', 'username avatarUrl firstName lastName')
      .populate('participants.user', 'username avatarUrl firstName lastName')

    if (!challenge) {
      return sendLocalizedError(res, 404, 'errors.challenges.not_found')
    }

    return sendLocalizedSuccess(res, null, {}, { challenge })
  } catch (error) {
    console.error('Error getting challenge details:', error)
    return sendLocalizedError(res, 500, 'errors.challenges.get_details_error')
  }
}

/** Update challenge status internal function */
const ChallengeStatusUpdatesInternal = async () => {
  console.log('[CRON] Running challenge status updates...')
  try {
    const now = moment.utc()

    // Mettre à jour les défis qui doivent démarrer
    const upcomingChallenges = await Challenge.find({
      status: 'upcoming',
      startDate: { $lte: now.toDate() },
    })

    for (const challenge of upcomingChallenges) {
      await Challenge.updateOne(
        { _id: challenge._id },
        { $set: { status: 'active' } },
        { validateBeforeSave: false },
      )
      console.log(`[CRON] Challenge ${challenge._id} status updated to active`)
    }

    // Mettre à jour les défis qui doivent se terminer
    const activeChallenges = await Challenge.find({
      status: 'active',
      endDate: { $lte: now.toDate() },
    })

    for (const challenge of activeChallenges) {
      await Challenge.updateOne(
        { _id: challenge._id },
        { $set: { status: 'completed' } },
        { validateBeforeSave: false },
      )
      console.log(
        `[CRON] Challenge ${challenge._id} status updated to completed`,
      )
    }

    console.log('[CRON] Status updates completed')
  } catch (error) {
    console.error(
      '[CRON] Erreur lors de la mise à jour des statuts des défis',
      error,
    )
  }
}

/** Update challenge progress */
const updateChallengeProgress = async (userId) => {
  try {
    const now = moment.utc()

    const userChallenges = await Challenge.find({
      'participants.user': userId,
      status: 'active',
      startDate: { $lte: now.toDate() },
      $or: [{ endDate: null }, { endDate: { $gte: now.toDate() } }],
    }).populate('participants.user')

    for (const challenge of userChallenges) {
      const participant = challenge.participants.find(
        (p) => p.user._id.toString() === userId,
      )
      if (!participant) continue

      // Convertir les dates en tenant compte du fuseau horaire du challenge
      const progressData = await calculateUserProgress(userId, challenge)

      if (
        participant.progress !== progressData.progress ||
        participant.completed !== progressData.completed
      ) {
        participant.progress = progressData.progress
        participant.completed = progressData.completed
        participant.lastUpdated = now.toDate()

        if (progressData.completed && !participant.xpEarned) {
          participant.xpEarned = challenge.xpReward
          await User.findByIdAndUpdate(userId, {
            $inc: { totalXP: challenge.xpReward },
          })

          await Notification.create({
            recipient: userId,
            type: 'challenge_complete',
            challenge: challenge._id,
            content: {
              en: `You completed "${challenge.name.en}"! +${challenge.xpReward}XP`,
              fr: `Défi "${challenge.name.fr}" réussi ! +${challenge.xpReward}XP`,
              es: `¡Has completado "${challenge.name.es}"! +${challenge.xpReward}XP`,
              de: `Du hast "${challenge.name.de}" abgeschlossen! +${challenge.xpReward}XP`,
            },
            status: 'unread',
            DeleteAt: moment().add(7, 'days').toDate(),
          })
        }

        await challenge.save()
      }
    }
  } catch (error) {
    console.error('Error updating challenge progress:', error)
  }
}

/** Get challenge leaderboard */
const getChallengeLeaderboard = async (req, res) => {
  const { challengeId } = req.params
  const { limit = 10, skip = 0 } = req.query

  try {
    const challenge = await Challenge.findById(challengeId)
      .populate(
        'participants.user',
        'username avatarUrl firstName lastName totalXP',
      )
      .select('participants status activityType')

    if (!challenge) {
      return sendLocalizedError(res, 404, 'errors.challenges.not_found')
    }

    // Trier les participants par progression
    const sortedParticipants = challenge.participants
      .sort((a, b) => {
        // D'abord par progression
        if (b.progress !== a.progress) {
          return b.progress - a.progress
        }
        // Ensuite par XP total en cas d'égalité
        return b.user.totalXP - a.user.totalXP
      })
      .slice(parseInt(skip), parseInt(skip) + parseInt(limit))
      .map((participant, index) => ({
        rank: parseInt(skip) + index + 1,
        userId: participant.user._id,
        username: participant.user.username,
        firstName: participant.user.firstName,
        lastName: participant.user.lastName,
        avatarUrl: participant.user.avatarUrl,
        progress: participant.progress,
        completed: participant.completed,
        xpEarned: participant.xpEarned,
      }))

    return sendLocalizedSuccess(
      res,
      null,
      {},
      {
        leaderboard: sortedParticipants,
        total: challenge.participants.length,
        challengeStatus: challenge.status,
        activityType: challenge.activityType,
      },
    )
  } catch (error) {
    console.error('Error getting challenge leaderboard:', error)
    return sendLocalizedError(
      res,
      500,
      'errors.challenges.get_leaderboard_error',
    )
  }
}

module.exports = {
  getPublicChallenges,
  getMyChallenges,
  createChallenge,
  updateChallenge,
  updateChallengeProgress,
  joinChallenge,
  leaveChallenge,
  deleteChallenge,
  regenerateAccessCode,
  getChallengeDetails,
  getChallengeLeaderboard,
  ChallengeStatusUpdatesInternal,
}
