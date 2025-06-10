// preferencesController.js
const UserModel = require('../models/User')
const { checkAuthorization } = require('../middlewares/VerifyAuthorization')
const {
  sendLocalizedError,
  sendLocalizedSuccess,
} = require('../utils/ResponseHelper')

const updateThemePreference = async (req, res) => {
  const { userId } = req.params
  const { themePreference } = req.body

  if (checkAuthorization(req, res, userId)) return

  try {
    if (!['light', 'dark', 'auto'].includes(themePreference)) {
      return sendLocalizedError(res, 400, 'errors.preferences.invalid_theme')
    }

    const user = await UserModel.findByIdAndUpdate(
      userId,
      { themePreference },
      { new: true }
    ).select('-password -verificationToken')

    return sendLocalizedSuccess(
      res,
      'success.preferences.theme_updated',
      {},
      {
        themePreference: user.themePreference,
      }
    )
  } catch (error) {
    console.error('Error updating theme preference:', error)
    return sendLocalizedError(res, 500, 'errors.preferences.theme_update_error')
  }
}

const updateLanguagePreference = async (req, res) => {
  const { userId } = req.params
  const { languagePreference } = req.body

  if (checkAuthorization(req, res, userId)) return

  try {
    // Liste des langues supportées - à adapter selon vos besoins
    const supportedLanguages = ['fr', 'en', 'es', 'de']
    if (!supportedLanguages.includes(languagePreference)) {
      return sendLocalizedError(
        res,
        400,
        'errors.preferences.unsupported_language'
      )
    }

    const user = await UserModel.findByIdAndUpdate(
      userId,
      { languagePreference },
      { new: true }
    ).select('-password -verificationToken')

    return sendLocalizedSuccess(
      res,
      'success.preferences.language_updated',
      {},
      {
        languagePreference: user.languagePreference,
      }
    )
  } catch (error) {
    console.error('Error updating language preference:', error)
    return sendLocalizedError(
      res,
      500,
      'errors.preferences.language_update_error'
    )
  }
}

const updatePrivacySettings = async (req, res) => {
  const { userId } = req.params
  const { privacySettings } = req.body

  if (checkAuthorization(req, res, userId)) return

  try {
    const updates = {
      privacySettings: {
        showActivityToFriends: privacySettings.showActivityToFriends,
        showStatsPublicly: privacySettings.showStatsPublicly,
        allowFriendRequests: privacySettings.allowFriendRequests,
        allowChallengeInvites: privacySettings.allowChallengeInvites,
        showLastLogin: privacySettings.showLastLogin,
      },
    }

    const user = await UserModel.findByIdAndUpdate(userId, updates, {
      new: true,
    }).select('-password -verificationToken')

    return sendLocalizedSuccess(
      res,
      'success.preferences.privacy_updated',
      {},
      {
        privacySettings: user.privacySettings,
      }
    )
  } catch (error) {
    console.error('Error updating privacy settings:', error)
    return sendLocalizedError(
      res,
      500,
      'errors.preferences.privacy_update_error'
    )
  }
}

const updateNotificationPreferences = async (req, res) => {
  const { userId } = req.params
  const { notificationPreferences } = req.body

  if (checkAuthorization(req, res, userId)) return

  try {
    const updates = {
      notificationPreferences: {
        activitySummary: notificationPreferences.activitySummary,
        newChallenges: notificationPreferences.newChallenges,
        friendRequests: notificationPreferences.friendRequests,
        goalAchieved: notificationPreferences.goalAchieved,
        friendActivity: notificationPreferences.friendActivity,
      },
    }

    const user = await UserModel.findByIdAndUpdate(userId, updates, {
      new: true,
    }).select('-password -verificationToken')

    return sendLocalizedSuccess(
      res,
      'success.preferences.notifications_updated',
      {},
      {
        notificationPreferences: user.notificationPreferences,
      }
    )
  } catch (error) {
    console.error('Error updating notification preferences:', error)
    return sendLocalizedError(
      res,
      500,
      'errors.preferences.notifications_update_error'
    )
  }
}

module.exports = {
  updateThemePreference,
  updateLanguagePreference,
  updatePrivacySettings,
  updateNotificationPreferences,
}
