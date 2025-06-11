const UserModel = require('../models/User')
const Notification = require('../models/Notification')
const { checkAuthorization } = require('../middlewares/VerifyAuthorization')
const {
  sendLocalizedError,
  sendLocalizedSuccess,
} = require('../utils/ResponseHelper')

/** Get all friends of a user */
const getFriends = async (req, res) => {
  const { userId } = req.params

  if (checkAuthorization(req, res, userId)) return

  try {
    const user = await UserModel.findById(userId).populate(
      'friends.userId',
      'username avatarUrl firstName lastName status totalSteps totalDistance totalXP',
    )
    if (!user) {
      return sendLocalizedError(res, 404, 'errors.generic.user_not_found')
    }
    const friends = user.friends
    return sendLocalizedSuccess(res, null, {}, { friends })
  } catch (error) {
    console.error('Error fetching friends:', error)
    return sendLocalizedError(res, 500, 'errors.friends.fetch_error')
  }
}

/** Get pending friend requests */
const getFriendRequests = async (req, res) => {
  const { userId } = req.params

  if (checkAuthorization(req, res, userId)) return

  try {
    const user = await UserModel.findById(userId).populate({
      path: 'friendRequests.notificationId',
      populate: {
        path: 'sender',
        select: 'username avatarUrl firstName lastName',
      },
    })
    if (!user) {
      return sendLocalizedError(res, 404, 'errors.generic.user_not_found')
    }

    const sentRequests = await Notification.find({
      sender: userId,
      type: 'friend_request',
    }).populate('recipient', 'firstName lastName username avatarUrl')

    return sendLocalizedSuccess(
      res,
      null,
      {},
      { requests: user.friendRequests, sent: sentRequests },
    )
  } catch (error) {
    console.error('Error fetching pending friend requests:', error)
    return sendLocalizedError(
      res,
      500,
      'errors.notifications.pending_requests_error',
    )
  }
}

/** Search for users */
const searchUsers = async (req, res) => {
  const { userId } = req.params
  const { query } = req.query

  if (checkAuthorization(req, res, userId)) return

  if (!query || query.trim() === '') {
    return sendLocalizedError(
      res,
      400,
      'errors.notifications.search_query_required',
    )
  }

  try {
    const users = await UserModel.find({
      $or: [
        { firstName: { $regex: query, $options: 'i' } },
        { lastName: { $regex: query, $options: 'i' } },
        { username: { $regex: query, $options: 'i' } },
      ],
      _id: { $ne: userId }, // Exclude the current user
    })
      .select('firstName lastName username avatarUrl totalSteps totalXP level')
      .limit(10)

    // Check friend status for each user
    const currentUser = await UserModel.findById(userId)
    const results = users.map((user) => {
      const isFriend = currentUser.friends.some(
        (f) => f.userId.toString() === user._id.toString(),
      )
      const hasPendingRequest = currentUser.friendRequests.some(
        (r) => r.userId.toString() === user._id.toString(),
      )

      return {
        ...user.toObject(),
        requestStatus: isFriend
          ? 'friends'
          : hasPendingRequest
            ? 'sent'
            : 'none',
      }
    })

    return sendLocalizedSuccess(res, null, {}, { users: results })
  } catch (error) {
    console.error('Error searching users:', error)
    return sendLocalizedError(res, 500, 'errors.notifications.search_error')
  }
}

/** Remove a friend */
const removeFriend = async (req, res) => {
  const { userId, friendId } = req.params

  if (checkAuthorization(req, res, userId)) return

  try {
    const user = await UserModel.findById(userId)
    const friend = await UserModel.findById(friendId)

    if (!user || !friend) {
      return sendLocalizedError(res, 404, 'errors.generic.user_not_found')
    }

    user.friends = user.friends.filter((f) => f.userId.toString() !== friendId)
    friend.friends = friend.friends.filter(
      (f) => f.userId.toString() !== userId,
    )
    user.friendRequests = user.friendRequests.filter(
      (r) => r.userId.toString() !== friendId,
    )
    friend.friendRequests = friend.friendRequests.filter(
      (r) => r.userId.toString() !== userId,
    )

    await user.save()
    await friend.save()

    return sendLocalizedSuccess(res, 'success.notifications.friend_removed')
  } catch (error) {
    console.error('Error removing friend:', error)
    return sendLocalizedError(
      res,
      500,
      'errors.notifications.friend_remove_error',
    )
  }
}

module.exports = { getFriends, getFriendRequests, searchUsers, removeFriend }
