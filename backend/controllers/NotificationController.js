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

    recipient.friendRequests.push({ userId: fromId, sentAt: new Date(), status: 'unread' });
    await recipient.save();

    await Notification.create({
      recipient: userId,
      sender: fromId,
      type: 'friend_request',
      content: `${sender.username} vous a envoyé une demande d'ami !`,
      status: 'unread',
      DeleteAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    res.status(200).json({ success: true, message: 'Demande d\'ami envoyée.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/** Accept a friend request */
const acceptFriendRequest = async (req, res) => {
  const { userId, inviteId } = req.params; // Celui qui accepte
  const requesterId = req.body.requesterId;

  if (checkAuthorization(req, res, userId)) return;

  try {
    const user = await UserModel.findById(userId);
    const requester = await UserModel.findById(requesterId);

    if (!user || !requester) {
      return res.status(404).json({ success: false, error: "Utilisateur introuvable." });
    }
    if (!user.friendRequests.some(f => f.userId.toString() === requesterId)) {
      await Notification.findByIdAndDelete(inviteId);
      return res.status(400).json({ success: false, error: "Aucune demande à accepter." });
    }
    if (user.friends.some(f => f.userId.toString() === requesterId)) {
      await Notification.findByIdAndDelete(inviteId);
      return res.status(400).json({ success: false, error: "Vous êtes déjà amis." });
    }

    // Ajout réciproque
    user.friends.push({ userId: requesterId, since: new Date() });
    requester.friends.push({ userId: userId, since: new Date() });

    user.friendRequests = user.friendRequests.filter(id => id.toString() !== requesterId);
    await user.save();
    await requester.save();

    // Delete the notification
    await Notification.findByIdAndDelete(inviteId);

    // Create notification for the requester
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

/** accpet or decline challenge invitation */
const respondToChallengeInvite = async (req, res) => {
  const { userId, inviteId } = req.params;
  const { action } = req.body;

  if (checkAuthorization(req, res, userId)) return;

  try {
    const invitation = await Notification.findById(inviteId);
    const user = await UserModel.findById(userId);
    if (!invitation) {
      return res.status(404).json({ success: false, error: 'Invitation introuvable' });
    }

    if (invitation.recipient.toString() !== userId) {
      return res.status(403).json({ success: false, error: 'Cette invitation ne vous est pas destinée' });
    }

    if (invitation.status === 'accepted' || invitation.status === 'declined') {
      await Notification.findByIdAndDelete(inviteId);
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
        await Notification.findByIdAndDelete(inviteId);
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
      await Notification.findByIdAndDelete(inviteId);

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
      await Notification.findByIdAndDelete(inviteId);

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
  respondToChallengeInvite,
  markNotificationAsRead,
  getNotifications,
  getChallengeNotifications,
};