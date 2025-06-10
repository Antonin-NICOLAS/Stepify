const Notification = require('../models/Notification')

const NotificationType = {
  CHALLENGE_INVITE: 'challenge_invite',
  CHALLENGE_ACCEPT: 'challenge_accept',
  CHALLENGE_DECLINE: 'challenge_decline',
  CHALLENGE_COMPLETE: 'challenge_complete',
  FRIEND_REQUEST: 'friend_request',
  FRIEND_ACCEPT: 'friend_accept',
  FRIEND_DECLINE: 'friend_decline',
  REWARD_UNLOCKED: 'reward_unlocked',
  GOAL_ACHIEVED: 'goal_achieved',
  LEVEL_UP: 'level_up',
  STREAK_MILESTONE: 'streak_milestone',
  CUSTOM_GOAL_ADDED: 'custom_goal_added',
  CUSTOM_GOAL_COMPLETED: 'custom_goal_completed',
}

const createSystemNotification = async ({
  recipient,
  sender = null,
  type,
  content,
}) => {
  try {
    const notification = new Notification({
      recipient,
      sender,
      type,
      content,
      status: 'unread',
    })
    await notification.save()
    return notification
  } catch (error) {
    console.error('Error creating notification:', error)
    throw error
  }
}

const createMultipleNotifications = async (notifications) => {
  try {
    return await Notification.insertMany(notifications)
  } catch (error) {
    console.error('Error creating multiple notifications:', error)
    throw error
  }
}

module.exports = {
  NotificationType,
  createSystemNotification,
  createMultipleNotifications,
}
