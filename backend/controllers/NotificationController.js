const Notification = require('../models/Notification')
const UserModel = require('../models/User')
const Challenge = require('../models/Challenge')
const { checkAuthorization } = require('../middlewares/VerifyAuthorization')
const {
  sendLocalizedError,
  sendLocalizedSuccess,
} = require('../utils/ResponseHelper')

/** Send a friend request */
const sendFriendRequest = async (req, res) => {
  const { userId } = req.params
  const fromId = req.body.userId

  if (checkAuthorization(req, res, fromId)) return

  if (fromId === userId) {
    return sendLocalizedError(res, 400, 'errors.notifications.cannot_add_self')
  }

  try {
    const recipient = await UserModel.findById(userId)
    const sender = await UserModel.findById(fromId)

    if (!recipient || !sender) {
      return sendLocalizedError(res, 404, 'errors.generic.user_not_found')
    }

    if (recipient.friendRequests.some((f) => f.userId.toString() === fromId)) {
      return sendLocalizedError(
        res,
        400,
        'errors.notifications.request_already_sent'
      )
    }

    if (recipient.friends.some((f) => f.userId.toString() === fromId)) {
      return sendLocalizedError(
        res,
        400,
        'errors.notifications.already_friends'
      )
    }

    const notification = await Notification.create({
      recipient: userId,
      sender: fromId,
      type: 'friend_request',
      content: {
        en: `${sender.username} sent you a friend request!`,
        fr: `${sender.username} vous a envoyé une demande d'ami !`,
        es: `${sender.username} te envió una solicitud de amistad!`,
        de: `${sender.username} hat dir eine Freundschaftsanfrage gesendet!`,
      },
      status: 'unread',
      DeleteAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    })

    recipient.friendRequests.push({ notificationId: notification._id })
    await recipient.save()

    return sendLocalizedSuccess(
      res,
      'success.notifications.friend_request_sent'
    )
  } catch (error) {
    console.error('Error sending friend request:', error)
    return sendLocalizedError(
      res,
      500,
      'errors.notifications.friend_request_error'
    )
  }
}

/** Accept a friend request */
const acceptFriendRequest = async (req, res) => {
  const { userId, notificationId } = req.params
  const requesterId = req.body.requesterId

  if (checkAuthorization(req, res, userId)) return

  try {
    const user = await UserModel.findById(userId)
    const requester = await UserModel.findById(requesterId)
    const notification = await Notification.findById(notificationId)

    if (!user || !requester || !notification) {
      return sendLocalizedError(
        res,
        404,
        'errors.notifications.request_not_found'
      )
    }

    if (
      notification.recipient.toString() !== userId ||
      notification.sender.toString() !== requesterId
    ) {
      return sendLocalizedError(
        res,
        403,
        'errors.notifications.invalid_request'
      )
    }

    if (user.friends.some((f) => f.userId.toString() === requesterId)) {
      await Notification.findByIdAndDelete(notificationId)
      return sendLocalizedError(
        res,
        400,
        'errors.notifications.already_friends'
      )
    }

    user.friends.push({ userId: requesterId, since: new Date() })
    requester.friends.push({ userId: userId, since: new Date() })

    // Supprime la demande de la liste
    user.friendRequests = user.friendRequests.filter(
      (f) => f.notificationId.toString() !== notificationId
    )
    await user.save()
    await requester.save()

    await Notification.findByIdAndDelete(notificationId)

    await Notification.create({
      recipient: requesterId,
      sender: userId,
      type: 'friend_accept',
      content: {
        en: `${user.username} accepted your friend request!`,
        fr: `${user.username} a accepté votre demande d'ami !`,
        es: `${user.username} aceptó tu solicitud de amistad!`,
        de: `${user.username} hat deine Freundschaftsanfrage angenommen!`,
      },
      status: 'unread',
      DeleteAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    })

    return sendLocalizedSuccess(
      res,
      'success.notifications.friend_request_accepted'
    )
  } catch (error) {
    console.error('Error accepting friend request:', error)
    return sendLocalizedError(
      res,
      500,
      'errors.notifications.friend_request_accept_error'
    )
  }
}

/** Cancel a sent friend request */
const cancelFriendRequest = async (req, res) => {
  const { userId, notificationId } = req.params

  if (checkAuthorization(req, res, userId)) return

  try {
    const notification = await Notification.findById(notificationId)
    if (
      !notification ||
      notification.sender.toString() !== userId ||
      notification.type !== 'friend_request'
    ) {
      return sendLocalizedError(
        res,
        404,
        'errors.notifications.request_not_found'
      )
    }

    const recipient = await UserModel.findById(notification.recipient)
    recipient.friendRequests = recipient.friendRequests.filter(
      (r) => r.notificationId.toString() !== notificationId
    )
    await recipient.save()

    await notification.deleteOne()

    return sendLocalizedSuccess(
      res,
      'success.notifications.friend_request_cancelled'
    )
  } catch (error) {
    console.error('Error cancelling friend request:', error)
    return sendLocalizedError(
      res,
      500,
      'errors.notifications.friend_request_cancel_error'
    )
  }
}

/** Decline a friend request */
const declineFriendRequest = async (req, res) => {
  const { userId, notificationId } = req.params

  if (checkAuthorization(req, res, userId)) return

  try {
    const notification = await Notification.findById(notificationId)
    if (
      !notification ||
      notification.recipient.toString() !== userId ||
      notification.type !== 'friend_request'
    ) {
      return sendLocalizedError(
        res,
        404,
        'errors.notifications.request_not_found'
      )
    }

    const user = await UserModel.findById(userId)
    user.friendRequests = user.friendRequests.filter(
      (r) => r.notificationId.toString() !== notificationId
    )
    await user.save()

    // Create a decline notification for the sender
    await Notification.create({
      recipient: notification.sender,
      sender: userId,
      type: 'friend_decline',
      content: {
        en: `${user.username} declined your friend request!`,
        fr: `${user.username} a refusé votre demande d'ami !`,
        es: `${user.username} rechazó tu solicitud de amistad!`,
        de: `${user.username} hat deine Freundschaftsanfrage abgelehnt!`,
      },
      status: 'unread',
      DeleteAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    })

    await notification.deleteOne()

    return sendLocalizedSuccess(
      res,
      'success.notifications.friend_request_declined'
    )
  } catch (error) {
    console.error('Error declining friend request:', error)
    return sendLocalizedError(
      res,
      500,
      'errors.notifications.friend_request_decline_error'
    )
  }
}

/** Delete a notification */
const deleteNotification = async (req, res) => {
  const { userId, notificationId } = req.params

  if (checkAuthorization(req, res, userId)) return

  try {
    const notification = await Notification.findById(notificationId)
    if (!notification || notification.recipient.toString() !== userId) {
      return sendLocalizedError(res, 404, 'errors.notifications.not_found')
    }

    await notification.deleteOne()
    return sendLocalizedSuccess(res, 'success.notifications.deleted')
  } catch (error) {
    console.error('Error deleting notification:', error)
    return sendLocalizedError(res, 500, 'errors.notifications.delete_error')
  }
}

/** Mark all notifications as read */
const markAllNotificationsAsRead = async (req, res) => {
  const { userId } = req.params

  if (checkAuthorization(req, res, userId)) return

  try {
    await Notification.updateMany(
      { recipient: userId, status: 'unread' },
      { $set: { status: 'read' } }
    )
    return sendLocalizedSuccess(res, 'success.notifications.all_marked_read')
  } catch (error) {
    return sendLocalizedError(res, 500, 'errors.notifications.mark_read_error')
  }
}

/** accpet or decline challenge invitation */
const respondToChallengeInvite = async (req, res) => {
  const { userId, notificationId } = req.params
  const { action } = req.body

  if (checkAuthorization(req, res, userId)) return

  try {
    const invitation = await Notification.findById(notificationId)
    const user = await UserModel.findById(userId)
    if (!invitation) {
      return sendLocalizedError(
        res,
        404,
        'errors.notifications.invitation_not_found'
      )
    }

    if (invitation.recipient.toString() !== userId) {
      return sendLocalizedError(
        res,
        403,
        'errors.notifications.unauthorized_invitation'
      )
    }

    if (invitation.status === 'accepted' || invitation.status === 'declined') {
      await Notification.findByIdAndDelete(notificationId)
      return sendLocalizedError(
        res,
        400,
        'errors.notifications.invitation_already_handled'
      )
    }

    const challenge = await Challenge.findById(invitation.challenge)
    if (!challenge) {
      return sendLocalizedError(res, 404, 'errors.challenges.not_found')
    }

    if (action === 'accept') {
      // Add user to challenge participants
      const alreadyParticipant = challenge.participants.find(
        (p) => p.user.toString() === userId
      )
      if (alreadyParticipant) {
        await Notification.findByIdAndDelete(notificationId)
        return sendLocalizedError(
          res,
          400,
          'errors.challenges.already_participating'
        )
      }

      challenge.participants.push({
        user: userId,
        steps: 0,
        xpEarned: 0,
        time: 0,
        progress: 0,
        joinedAt: new Date(),
        completed: false,
        lastUpdated: new Date(),
      })

      invitation.status = 'accepted'
      await challenge.save()

      // Delete the notification
      await Notification.findByIdAndDelete(notificationId)

      // Create acceptance notification for sender
      await Notification.create({
        recipient: invitation.sender,
        sender: userId,
        challenge: challenge._id,
        type: 'challenge_accept',
        content: {
          en: `${user.username} accepted your invitation to the challenge "${challenge.name}"!`,
          fr: `${user.username} a accepté votre invitation au challenge "${challenge.name}" !`,
          es: `${user.username} aceptó tu invitación al desafío "${challenge.name}"!`,
          de: `${user.username} hat deine Einladung zur Challenge "${challenge.name}" angenommen!`,
        },
        status: 'unread',
        DeleteAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      })

      return sendLocalizedSuccess(
        res,
        'success.notifications.challenge_accepted'
      )
    } else if (action === 'decline') {
      invitation.status = 'declined'

      // Delete the notification
      await Notification.findByIdAndDelete(notificationId)

      // Create decline notification for sender
      await Notification.create({
        recipient: invitation.sender,
        sender: userId,
        challenge: challenge._id,
        type: 'challenge_decline',
        content: {
          en: `${user.username} declined your invitation to the challenge "${challenge.name}"!`,
          fr: `${user.username} a décliné votre invitation au challenge "${challenge.name}" !`,
          es: `${user.username} rechazó tu invitación al desafío "${challenge.name}"!`,
          de: `${user.username} hat deine Einladung zur Challenge "${challenge.name}" abgelehnt!`,
        },
        status: 'unread',
        DeleteAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      })

      return sendLocalizedSuccess(
        res,
        'success.notifications.challenge_declined'
      )
    } else {
      return sendLocalizedError(res, 400, 'errors.notifications.invalid_action')
    }
  } catch (error) {
    console.error('Error handling invitation response:', error)
    return sendLocalizedError(
      res,
      500,
      'errors.notifications.invitation_response_error'
    )
  }
}

/** Mark notification as read */
const markNotificationAsRead = async (req, res) => {
  const { userId, notificationId } = req.params

  if (checkAuthorization(req, res, userId)) return

  try {
    const notification = await Notification.findById(notificationId)
    if (!notification) {
      return sendLocalizedError(res, 404, 'errors.notifications.not_found')
    }

    if (notification.recipient.toString() !== userId) {
      return sendLocalizedError(res, 403, 'errors.notifications.unauthorized')
    }

    notification.status = 'read'
    await notification.save()

    return sendLocalizedSuccess(
      res,
      'success.notifications.marked_read',
      {},
      { notification }
    )
  } catch (error) {
    console.error('Error marking notification as read:', error)
    return sendLocalizedError(res, 500, 'errors.notifications.mark_read_error')
  }
}

/** Get all notifications for a user */
const getNotifications = async (req, res) => {
  const { userId } = req.params

  if (checkAuthorization(req, res, userId)) return

  try {
    const notifications = await Notification.find({ recipient: userId })
      .populate('sender', 'username avatarUrl firstName lastName')
      .populate('recipient', 'username avatarUrl firstName lastName')
      .populate('challenge', 'name')
      .sort({ createdAt: -1 })

    return sendLocalizedSuccess(res, null, {}, { notifications })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return sendLocalizedError(res, 500, 'errors.notifications.fetch_error')
  }
}

/** Get challenge-related notifications only */
const getChallengeNotifications = async (req, res) => {
  const { userId } = req.params

  if (checkAuthorization(req, res, userId)) return

  try {
    const notifications = await Notification.find({
      recipient: userId,
      type: 'challenge_invite',
    })
      .populate('sender', 'username avatarUrl firstName lastName')
      .populate('recipient', 'username avatarUrl firstName lastName')
      .populate('challenge', 'name')
      .sort({ createdAt: -1 })

    return sendLocalizedSuccess(res, null, {}, { notifications })
  } catch (error) {
    console.error('Error fetching challenge notifications:', error)
    return sendLocalizedError(res, 500, 'errors.notifications.fetch_error')
  }
}

module.exports = {
  sendFriendRequest,
  acceptFriendRequest,
  cancelFriendRequest,
  declineFriendRequest,
  deleteNotification,
  markAllNotificationsAsRead,
  respondToChallengeInvite,
  markNotificationAsRead,
  getNotifications,
  getChallengeNotifications,
}
