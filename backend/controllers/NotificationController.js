const Notification = require('../models/Notification');
const UserModel = require('../models/User');
const Challenge = require('../models/Challenge');
const { checkAuthorization } = require('../middlewares/VerifyAuthorization')

/** Send a friend request */
const sendFriendRequest = async (req, res) => {
  const { userId } = req.params;
  const fromId = req.body.userId;

  if (checkAuthorization(req, res, fromId)) return;

  if (fromId === userId) {
    return res.status(400).json({ success: false, error: "Vous ne pouvez pas vous ajouter vous-même." });
  }

  try {
    const recipient = await UserModel.findById(userId);
    const sender = await UserModel.findById(fromId);

    if (!recipient || !sender) {
      return res.status(404).json({ success: false, error: "Utilisateur introuvable." });
    }
    if (recipient.friendRequests.some(f => f.userId.toString() === fromId)) {
      return res.status(400).json({ success: false, error: "Demande déjà envoyée." });
    }
    if (recipient.friends.some(f => f.userId.toString() === fromId)) {
      return res.status(400).json({ success: false, error: "Vous êtes déjà amis." });
    }

    const notification = await Notification.create({
      recipient: userId,
      sender: fromId,
      type: 'friend_request',
      content: `${sender.username} vous a envoyé une demande d'ami !`,
      status: 'unread',
      DeleteAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    recipient.friendRequests.push({ notificationId: notification._id });
    await recipient.save();

    res.status(200).json({ success: true, message: 'Demande d\'ami envoyée.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/** Accept a friend request */
const acceptFriendRequest = async (req, res) => {
  const { userId, notificationId } = req.params;
  const requesterId = req.body.requesterId;

  if (checkAuthorization(req, res, userId)) return;

  try {
    const user = await UserModel.findById(userId);
    const requester = await UserModel.findById(requesterId);
    const notification = await Notification.findById(notificationId);

    if (!user || !requester || !notification) {
      return res.status(404).json({ success: false, error: "Utilisateur ou notification introuvable." });
    }

    if (notification.recipient.toString() !== userId || notification.sender.toString() !== requesterId) {
      return res.status(403).json({ success: false, error: "Notification non valide pour cette action." });
    }

    if (user.friends.some(f => f.userId.toString() === requesterId)) {
      await Notification.findByIdAndDelete(notificationId);
      return res.status(400).json({ success: false, error: "Vous êtes déjà amis." });
    }

    user.friends.push({ userId: requesterId, since: new Date() });
    requester.friends.push({ userId: userId, since: new Date() });

    // Supprime la demande de la liste
    user.friendRequests = user.friendRequests.filter(f => f.notificationId.toString() !== notificationId);
    await user.save();
    await requester.save();

    await Notification.findByIdAndDelete(notificationId);

    await Notification.create({
      recipient: requesterId,
      sender: userId,
      type: 'friend_accept',
      content: `${user.username} a accepté votre demande d'ami !`,
      status: 'unread',
      DeleteAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    res.status(200).json({ success: true, message: "Ami ajouté avec succès." });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/** Cancel a sent friend request */
const cancelFriendRequest = async (req, res) => {
  const { userId, notificationId } = req.params;

  if (checkAuthorization(req, res, userId)) return;

  try {
    const notification = await Notification.findById(notificationId);
    if (!notification || notification.sender.toString() !== userId || notification.type !== 'friend_request') {
      return res.status(404).json({ success: false, error: 'Demande introuvable ou non valide' });
    }

    const recipient = await UserModel.findById(notification.recipient);
    recipient.friendRequests = recipient.friendRequests.filter(r => r.notificationId.toString() !== notificationId);
    await recipient.save();

    await notification.deleteOne();

    return res.status(200).json({ success: true, message: 'Demande d\'ami annulée.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Erreur lors de l\'annulation de la demande.' });
  }
};

/** Decline a friend request */
const declineFriendRequest = async (req, res) => {
  const { userId, notificationId } = req.params;

  if (checkAuthorization(req, res, userId)) return;

  try {
    const notification = await Notification.findById(notificationId);
    if (!notification || notification.recipient.toString() !== userId || notification.type !== 'friend_request') {
      return res.status(404).json({ success: false, error: 'Demande introuvable ou non valide' });
    }

    const user = await UserModel.findById(userId);
    user.friendRequests = user.friendRequests.filter(r => r.notificationId.toString() !== notificationId);
    await user.save();

    // Create a decline notification for the sender
    await Notification.create({
      recipient: notification.sender,
      sender: userId,
      type: 'friend_decline',
      content: `${user.username} a refusé votre demande d'ami !`,
      status: 'unread',
      DeleteAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    await notification.deleteOne();

    return res.status(200).json({ success: true, message: 'Demande refusée.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Erreur lors du refus de la demande.' });
  }
};

/** Remove a friend */
const removeFriend = async (req, res) => {
  const { userId, friendId } = req.params;

  if (checkAuthorization(req, res, userId)) return;

  try {
    const user = await UserModel.findById(userId);
    const friend = await UserModel.findById(friendId);

    if (!user || !friend) {
      return res.status(404).json({ success: false, error: 'Utilisateur introuvable.' });
    }

    user.friends = user.friends.filter(f => f.userId.toString() !== friendId);
    friend.friends = friend.friends.filter(f => f.userId.toString() !== userId);
    user.friendRequests = user.friendRequests.filter(r => r.userId.toString() !== friendId);
    friend.friendRequests = friend.friendRequests.filter(r => r.userId.toString() !== userId);

    await user.save();
    await friend.save();

    return res.status(200).json({ success: true, message: 'Ami supprimé.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Erreur lors de la suppression de l\'ami.' });
  }
};

/** Delete a notification */
const deleteNotification = async (req, res) => {
  const { userId, notificationId } = req.params;

  if (checkAuthorization(req, res, userId)) return;

  try {
    const notification = await Notification.findById(notificationId);
    if (!notification || notification.recipient.toString() !== userId) {
      return res.status(404).json({ success: false, error: 'Notification introuvable ou non autorisée' });
    }

    await notification.deleteOne();
    return res.status(200).json({ success: true, message: 'Notification supprimée' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Erreur lors de la suppression de la notification' });
  }
};

/** Mark all notifications as read */
const markAllNotificationsAsRead = async (req, res) => {
  const { userId } = req.params;

  if (checkAuthorization(req, res, userId)) return;

  try {
    await Notification.updateMany({ recipient: userId, status: 'unread' }, { $set: { status: 'read' } });
    return res.status(200).json({ success: true, message: 'Toutes les notifications ont été marquées comme lues' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Erreur lors de la mise à jour des notifications' });
  }
};

/** Get all friends of a user */
const getFriendsList = async (req, res) => {
  const { userId } = req.params;

  if (checkAuthorization(req, res, userId)) return;

  try {
    const user = await UserModel.findById(userId).populate('friends.userId', 'username avatarUrl firstName lastName');
    if (!user) {
      return res.status(404).json({ success: false, error: 'Utilisateur introuvable' });
    }

    return res.status(200).json({ success: true, friends: user.friends });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Erreur lors de la récupération des amis' });
  }
};

/** Get pending friend requests */
const getPendingFriendRequests = async (req, res) => {
  const { userId } = req.params;

  if (checkAuthorization(req, res, userId)) return;

  try {
    const user = await UserModel.findById(userId).populate('friendRequests.notificationId');
    if (!user) {
      return res.status(404).json({ success: false, error: 'Utilisateur introuvable' });
    }

    return res.status(200).json({ success: true, requests: user.friendRequests });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Erreur lors de la récupération des demandes' });
  }
};

/** accpet or decline challenge invitation */
const respondToChallengeInvite = async (req, res) => {
  const { userId, notificationId } = req.params;
  const { action } = req.body;

  if (checkAuthorization(req, res, userId)) return;

  try {
    const invitation = await Notification.findById(notificationId);
    const user = await UserModel.findById(userId);
    if (!invitation) {
      return res.status(404).json({ success: false, error: 'Invitation introuvable' });
    }

    if (invitation.recipient.toString() !== userId) {
      return res.status(403).json({ success: false, error: 'Cette invitation ne vous est pas destinée' });
    }

    if (invitation.status === 'accepted' || invitation.status === 'declined') {
      await Notification.findByIdAndDelete(notificationId);
      return res.status(400).json({ success: false, error: 'Cette invitation a déjà été traitée' });
    }

    const challenge = await Challenge.findById(invitation.challenge);
    if (!challenge) {
      return res.status(404).json({ success: false, error: 'Challenge introuvable' });
    }

    if (action === 'accept') {
      // Add user to challenge participants
      const alreadyParticipant = challenge.participants.find(p => p.user.toString() === userId);
      if (alreadyParticipant) {
        await Notification.findByIdAndDelete(notificationId);
        return res.status(400).json({ success: false, error: 'Vous participez déjà à ce challenge' });
      }

      challenge.participants.push({
        user: userId,
        steps: 0,
        xpEarned: 0,
        time: 0,
        progress: 0,
        joinedAt: new Date(),
        completed: false,
        lastUpdated: new Date()
      });

      invitation.status = 'accepted';
      await challenge.save();

      // Delete the notification
      await Notification.findByIdAndDelete(notificationId);

      // Create acceptance notification for sender
      await Notification.create({
        recipient: invitation.sender,
        sender: userId,
        challenge: challenge._id,
        type: 'challenge_accept',
        content: `${user.username} a accepté votre invitation au challenge "${challenge.name}"`,
        status: 'unread',
        DeleteAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });

    } else if (action === 'decline') {
      invitation.status = 'declined';

      // Delete the notification
      await Notification.findByIdAndDelete(notificationId);

      // Create decline notification for sender
      await Notification.create({
        recipient: invitation.sender,
        sender: userId,
        challenge: challenge._id,
        type: 'challenge_decline',
        content: `${user.username} a décliné votre invitation au challenge "${challenge.name}"`,
        status: 'unread',
        DeleteAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });
    } else {
      return res.status(400).json({ success: false, error: 'Action invalide' });
    }

    await invitation.save();

    return res.status(200).json({ success: true, message: `Invitation ${action}ée avec succès.` });
  } catch (error) {
    console.error('Error handling invitation response:', error);
    return res.status(500).json({ success: false, error: 'Erreur lors du traitement de l\'invitation' });
  }
};

/** Mark notification as read */
const markNotificationAsRead = async (req, res) => {
  const { userId, notificationId } = req.params;

  if (checkAuthorization(req, res, userId)) return;

  try {
    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ success: false, error: 'Notification not found' });
    }

    if (notification.recipient.toString() !== userId) {
      return res.status(403).json({ success: false, error: 'This notification does not belong to you' });
    }

    notification.status = 'read';
    await notification.save();

    return res.status(200).json({ success: true, notification: notification });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return res.status(500).json({ success: false, error: 'Error updating notification' });
  }
};

/** Get all notifications for a user */
const getNotifications = async (req, res) => {
  const { userId } = req.params;

  if (checkAuthorization(req, res, userId)) return;

  try {
    const notifications = await Notification.find({ recipient: userId })
      .populate('sender', 'username avatarUrl firstName lastName')
      .populate('recipient', 'username avatarUrl firstName lastName')
      .populate('challenge', 'name')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      notifications: notifications
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return res.status(500).json({
      success: false,
      error: 'Error retrieving notifications'
    });
  }
};

/** Get challenge-related notifications only */
const getChallengeNotifications = async (req, res) => {
  const { userId } = req.params;

  if (checkAuthorization(req, res, userId)) return;

  try {
    const notifications = await Notification.find({ recipient: userId, type: 'challenge_invite' })
      .populate('sender', 'username avatarUrl firstName lastName')
      .populate('recipient', 'username avatarUrl firstName lastName')
      .populate('challenge', 'name')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      notifications: notifications
    });
  } catch (error) {
    console.error('Error fetching challenge notifications:', error);
    return res.status(500).json({
      success: false,
      error: 'Error retrieving challenge notifications'
    });
  }
};

module.exports = {
  sendFriendRequest,
  acceptFriendRequest,
  cancelFriendRequest,
  declineFriendRequest,
  removeFriend,
  deleteNotification,
  markAllNotificationsAsRead,
  respondToChallengeInvite,
  markNotificationAsRead,
  getNotifications,
  getChallengeNotifications,
  getFriendsList,
  getPendingFriendRequests,
};