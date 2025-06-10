const UserModel = require('../models/User')
const cloudinary = require('../config/cloudinary')
const bcrypt = require('bcryptjs')
const { checkAuthorization } = require('../middlewares/VerifyAuthorization')
const { translateToAllLanguages } = require('../languages/translate')
const {
  GenerateAuthCookie,
  generateVerificationCode,
  validateEmail,
  validateUsername,
} = require('../helpers/AuthHelpers')
const {
  sendVerificationEmail,
  sendResetPasswordSuccessfulEmail,
} = require('../utils/SendMail')
const {
  sendLocalizedError,
  sendLocalizedSuccess,
} = require('../utils/ResponseHelper')
//.env
require('dotenv').config()

//======== UPDATE AN ACCOUNT =========//

const updateAvatar = async (req, res) => {
  const { userId } = req.params
  const file = req.file // image envoyée via multer

  if (!file) {
    return sendLocalizedError(res, 400, 'errors.profile.no_file_provided')
  }

  if (checkAuthorization(req, res, userId)) return

  try {
    const user = await UserModel.findById(userId)

    // Supprimer l'ancien avatar s'il est sur Cloudinary
    if (user.avatarUrl && user.avatarUrl.includes('res.cloudinary.com')) {
      const publicId = user.avatarUrl.split('/').slice(-1)[0].split('.')[0] // extraire l'id
      await cloudinary.uploader.destroy(`stepify/avatars/${publicId}`)
    }

    // Uploader la nouvelle image
    const result = await cloudinary.uploader.upload_stream(
      {
        folder: 'stepify/avatars',
        public_id: `avatar-${userId}-${Date.now()}`,
        resource_type: 'image',
      },
      async (error, result) => {
        if (error)
          return sendLocalizedError(
            res,
            500,
            'errors.profile.avatar_update_error'
          )

        user.avatarUrl = result.secure_url
        await user.save()

        return sendLocalizedSuccess(
          res,
          'success.profile.updated',
          {},
          { avatarUrl: result.secure_url }
        )
      }
    )

    // Envoie le fichier à cloudinary
    result.end(file.buffer)
  } catch (error) {
    console.error('Error in updateAvatar:', error)
    return sendLocalizedError(res, 500, 'errors.profile.avatar_update_error')
  }
}

const updateProfile = async (req, res) => {
  const { userId } = req.params
  const updates = req.body

  if (checkAuthorization(req, res, userId)) return

  try {
    // Validation des champs
    if (updates.username) {
      if (!validateUsername(updates.username)) {
        return sendLocalizedError(res, 400, 'errors.profile.invalid_username')
      }

      const existingUser = await UserModel.findOne({
        username: updates.username,
      })
      if (existingUser && existingUser._id.toString() !== userId) {
        return sendLocalizedError(res, 400, 'errors.profile.username_exists')
      }
    }

    if (updates.firstName && updates.firstName.length < 2) {
      return sendLocalizedError(res, 400, 'errors.profile.firstName_min')
    }

    if (updates.lastName && updates.lastName.length < 2) {
      return sendLocalizedError(res, 400, 'errors.profile.lastName_min')
    }

    const user = await UserModel.findById(userId)
    if (!user) {
      return sendLocalizedError(res, 404, 'errors.generic.user_not_found')
    }

    if (updates.username) user.username = updates.username
    if (updates.firstName) user.firstName = updates.firstName
    if (updates.lastName) user.lastName = updates.lastName
    await user.save()

    return sendLocalizedSuccess(res, 'success.profile.updated', {}, { user })
  } catch (error) {
    console.error('Error in updateProfile:', error)
    return sendLocalizedError(res, 500, 'errors.profile.profile_update_error')
  }
}

const updateEmail = async (req, res) => {
  const { newEmail } = req.body
  const { userId } = req.params

  if (checkAuthorization(req, res, userId)) return

  try {
    const user = await UserModel.findById(req.userId)
    if (!user) {
      return sendLocalizedError(res, 404, 'errors.generic.user_not_found')
    }

    if (!newEmail || !validateEmail(newEmail)) {
      return sendLocalizedError(res, 400, 'errors.profile.email_required')
    }

    if (user.email === newEmail) {
      return sendLocalizedError(res, 400, 'errors.profile.same_email_change')
    }

    const existingUser = await UserModel.findOne({ email: newEmail })
    if (existingUser) {
      return sendLocalizedError(res, 400, 'errors.profile.email_exists')
    }

    user.email = newEmail
    user.isVerified = false
    user.verificationToken = generateVerificationCode()
    user.verificationTokenExpiresAt = Date.now() + 24 * 60 * 60 * 1000
    await user.save()

    res.clearCookie('jwtauth', {
      secure: process.env.NODE_ENV === 'production' ? true : false,
      httpOnly: process.env.NODE_ENV === 'production' ? true : false,
      sameSite: process.env.NODE_ENV === 'production' ? 'lax' : '',
      ...(process.env.NODE_ENV === 'production' && {
        domain: 'step-ify.vercel.app',
      }),
    })

    await sendVerificationEmail(newEmail, user.verificationToken)

    // Générer un nouveau cookie avec le nouvel email
    GenerateAuthCookie(res, user, false)

    return sendLocalizedSuccess(
      res,
      'success.profile.email_updated',
      {},
      {
        email: user.email,
        isVerified: user.isVerified,
      }
    )
  } catch (error) {
    console.error('Error in updateEmail:', error)
    return sendLocalizedError(res, 500, 'errors.profile.email_update_error')
  }
}

const updatePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body
  const { userId } = req.params

  if (checkAuthorization(req, res, userId)) return

  try {
    if (!currentPassword || !newPassword) {
      return sendLocalizedError(res, 400, 'errors.profile.passwords_required')
    }

    if (newPassword.length < 8) {
      return sendLocalizedError(res, 400, 'errors.profile.invalid_password')
    }

    const user = await UserModel.findById(req.userId)
    if (!user) {
      return sendLocalizedError(res, 404, 'errors.generic.user_not_found')
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password)
    if (!isMatch) {
      return sendLocalizedError(res, 401, 'errors.profile.password_incorrect')
    }

    if (await bcrypt.compare(newPassword, user.password)) {
      return sendLocalizedError(res, 400, 'errors.profile.same_password_change')
    }

    user.password = await bcrypt.hash(newPassword, 12)
    await user.save()

    await sendResetPasswordSuccessfulEmail(user.email, user.firstName)

    return sendLocalizedSuccess(res, 'success.profile.password_updated')
  } catch (error) {
    console.error('Error in updatePassword:', error)
    return sendLocalizedError(res, 500, 'errors.profile.password_update_error')
  }
}

const updateStatus = async (req, res) => {
  const { userId } = req.params
  const { status } = req.body

  if (checkAuthorization(req, res, userId)) return

  try {
    const statusTranslations = await translateToAllLanguages(status)
    const user = await UserModel.findByIdAndUpdate(
      userId,
      { status: statusTranslations },
      { new: true }
    )
    return sendLocalizedSuccess(
      res,
      'success.profile.status_updated',
      {},
      { status: user.status }
    )
  } catch (error) {
    console.error('Error in updateStatus:', error)
    return sendLocalizedError(res, 500, 'errors.profile.status_update_error')
  }
}

const updateDailyGoal = async (req, res) => {
  const { userId } = req.params
  const { dailyGoal } = req.body

  if (checkAuthorization(req, res, userId)) return

  try {
    if (dailyGoal < 1000 || dailyGoal > 50000) {
      return sendLocalizedError(res, 400, 'errors.profile.daily_goal_range')
    }

    const user = await UserModel.findByIdAndUpdate(
      userId,
      { dailyGoal },
      { new: true }
    )
    return sendLocalizedSuccess(
      res,
      'success.profile.daily_goal_updated',
      {},
      { dailyGoal: user.dailyGoal }
    )
  } catch (error) {
    console.error('Error in updateDailyGoal:', error)
    return sendLocalizedError(
      res,
      500,
      'errors.profile.daily_goal_update_error'
    )
  }
}

const getUserProfile = async (req, res) => {
  const { userId } = req.params

  try {
    const user = await UserModel.findById(userId).populate([
      {
        path: 'friends.userId',
        select: 'username avatarUrl firstName lastName',
      },
      {
        path: 'rewardsUnlocked.rewardId',
        select: 'name description iconUrl',
      },
    ])

    if (!user) {
      return sendLocalizedError(res, 404, 'errors.generic.user_not_found')
    }

    const isOwner = req.userId === userId
    const isFriend = user.friends.some((f) => f.userId === req.userId)
    const todayProgress = await user.calculateTodayProgress()

    const userResponse = user.toJSON()
    userResponse.todayProgress = todayProgress

    if (!isOwner) {
      delete userResponse.email
      delete userResponse.friendRequests
      delete userResponse.customGoals

      if (!isFriend && !userResponse.privacySettings.showStatsPublicly) {
        // A voir
      }
    }

    return sendLocalizedSuccess(res, null, {}, { user: userResponse })
  } catch (error) {
    console.error('Error in getUserProfile:', error)
    return sendLocalizedError(res, 500, 'errors.profile.get_profile_error')
  }
}

const getActiveSessions = async (req, res) => {
  const { userId } = req.params

  if (checkAuthorization(req, res, userId)) return

  try {
    const user = await UserModel.findById(userId).select('activeSessions')
    if (!user) {
      return sendLocalizedError(res, 404, 'errors.generic.user_not_found')
    }

    const currentSessions = user.activeSessions.filter(
      (session) => new Date(session.expiresAt) > new Date()
    )
    return sendLocalizedSuccess(res, null, {}, { sessions: currentSessions })
  } catch (error) {
    console.error('Error in getActiveSessions:', error)
    return sendLocalizedError(res, 500, 'errors.profile.get_sessions_error')
  }
}

const revokeSession = async (req, res) => {
  const { userId, sessionId } = req.params

  if (checkAuthorization(req, res, userId)) return

  try {
    const user = await UserModel.findById(userId)
    if (!user) {
      return sendLocalizedError(res, 404, 'errors.generic.user_not_found')
    }

    user.activeSessions = user.activeSessions.filter(
      (session) => session._id.toString() !== sessionId
    )
    await user.save()

    return sendLocalizedSuccess(
      res,
      'success.profile.session_revoked',
      {},
      { sessions: user.activeSessions }
    )
  } catch (error) {
    console.error('Error in revokeSession:', error)
    return sendLocalizedError(res, 500, 'errors.profile.revoke_session_error')
  }
}

const revokeAllSessions = async (req, res) => {
  const { userId } = req.params

  if (checkAuthorization(req, res, userId)) return

  try {
    const user = await UserModel.findById(userId)
    if (!user) {
      return sendLocalizedError(res, 404, 'errors.generic.user_not_found')
    }

    const currentSession = user.activeSessions.find(
      (session) =>
        session.fingerprint === req.fingerprint &&
        new Date(session.expiresAt) > new Date()
    )

    user.activeSessions = currentSession ? [currentSession] : []
    await user.save()

    return sendLocalizedSuccess(res, 'success.profile.all_sessions_revoked')
  } catch (error) {
    console.error('Error in revokeAllSessions:', error)
    return sendLocalizedError(
      res,
      500,
      'errors.profile.revoke_all_sessions_error'
    )
  }
}

module.exports = {
  updateAvatar,
  updateProfile,
  updateEmail,
  updatePassword,
  updateStatus,
  updateDailyGoal,
  getUserProfile,
  getActiveSessions,
  revokeSession,
  revokeAllSessions,
}
