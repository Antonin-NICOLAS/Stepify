const Challenge = require('../models/Challenge');
const Notification = require('../models/Notification');
const { checkAuthorization } = require('../middlewares/VerifyAuthorization');
const { calculateUserProgress, updateSingleChallengeProgress } = require('../utils/ChallengeHelpers');
const { sendLocalizedError, sendLocalizedSuccess } = require('../utils/ResponseHelper');


// Helper function to generate a random 6-character access code (A-Z, 0-9)
const generateAccessCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Helper function to validate challenge dates
const validateChallengeDates = (startDate, endDate) => {
  const now = new Date();
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : null;

  if (start < now) {
    return { valid: false, error: 'errors.challenges.past_start_date' };
  }
  if (end && end <= start) {
    return { valid: false, error: 'errors.challenges.invalid_end_date' };
  }
  return { valid: true };
};

// Helper function to determine challenge status
const determineChallengeStatus = (startDate, endDate) => {
  const now = new Date();
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : null;

  if (start > now) return 'upcoming';
  if (end && end < now) return 'completed';
  return 'active';
};

/** Get public challenges */
const getPublicChallenges = async (req, res) => {
  const { limit = 10, skip = 0 } = req.query;

  try {
    const challenges = await Challenge.find({ isPrivate: false })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .populate('creator', 'username avatarUrl firstName lastName')
      .populate('participants.user', 'username avatarUrl firstName lastName')
      .sort({ createdAt: -1 });

    const total = await Challenge.countDocuments({ isPrivate: false });

    return sendLocalizedSuccess(res, null, {}, {
      challenges,
      total,
      limit: parseInt(limit),
      skip: parseInt(skip)
    });
  } catch (error) {
    console.error('Error fetching challenges:', error);
    return sendLocalizedError(res, 500, 'errors.challenges.get_challenges_error');
  }
};

/** Get user's challenges (created or participating in) */
const getMyChallenges = async (req, res) => {
  const { userId } = req.params;
  const { limit = 10, skip = 0 } = req.query;

  if (checkAuthorization(req, res, userId)) return;

  try {
    const challenges = await Challenge.find({
      $or: [
        { creator: userId },
        { 'participants.user': userId }
      ]
    })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .populate('creator', 'username avatarUrl')
      .populate('participants.user', 'username avatarUrl')
      .sort({ createdAt: -1 });

    // Extract user-specific progress from each challenge
    const userProgress = challenges.map(challenge => {
      const participant = challenge.participants.find(p => p.user._id.toString() === userId);
      return {
        challengeId: challenge._id,
        progress: participant?.progress || 0,
        goal: participant?.goal || 0,
        xpEarned: participant?.xpEarned || 0,
        time: participant?.time || 0,
        completed: participant?.completed || false,
        joinedAt: participant?.joinedAt
      };
    });

    return sendLocalizedSuccess(res, null, {}, { challenges, userProgress });
  } catch (error) {
    console.error('Error fetching user challenges:', error);
    return sendLocalizedError(res, 500, 'errors.challenges.get_challenges_error');
  }
};

/** Create a new challenge */
const createChallenge = async (req, res) => {
  const { userId } = req.params;

  if (checkAuthorization(req, res, userId)) return;

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
      isPrivate
    } = req.body;

    // Validate required fields
    if (!name || !startDate || !activityType || !goal || !xpReward || isPrivate === undefined) {
      return sendLocalizedError(res, 400, 'errors.challenges.fields_missing');
    }

    // Validate dates
    const dateValidation = validateChallengeDates(startDate, endDate);
    if (!dateValidation.valid) {
      return sendLocalizedError(res, 400, dateValidation.error);
    }

    // Validate activity type specific requirements
    if (['steps-time', 'distance-time', 'calories-time', 'xp-time'].includes(activityType) && !time) {
      return sendLocalizedError(res, 400, 'errors.challenges.time_required', { activityType });
    }

    // Generate access code if challenge is private
    const accessCode = isPrivate ? generateAccessCode() : null;

    // Determine initial status
    const status = determineChallengeStatus(startDate, endDate);

    const newChallenge = new Challenge({
      ...req.body,
      creator: userId,
      accessCode,
      participants: [{
        user: userId,
        goal: 0,
        xpEarned: 0,
        time: 0,
        progress: 0,
        joinedAt: new Date(),
        completed: false,
        lastUpdated: new Date()
      }],
      status
    });

    await newChallenge.save();
    await updateSingleChallengeProgress(userId, newChallenge._id);

    // Send invitations if private and has participants
    if (isPrivate && participants && participants.length > 0) {
      const invitations = participants
        .filter(id => id !== userId)
        .map(toId => ({
          challenge: newChallenge._id,
          sender: userId,
          recipient: toId,
          type: 'challenge_invite',
          content: {
            en: `You've been invited to join the challenge "${name}"!`,
            fr: `Vous avez été invité à rejoindre le challenge "${name}" !`,
            es: `¡Has sido invitado a unirte al desafío "${name}"!`,
            de: `Du wurdest eingeladen, an der Challenge "${name}" teilzunehmen!`
          },
          status: 'unread',
          DeleteAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }));

      await Notification.insertMany(invitations);
    }

    return sendLocalizedSuccess(res, 'success.challenges.created', {}, { challenge: newChallenge });
  } catch (error) {
    console.error('Error creating challenge:', error);
    return sendLocalizedError(res, 500, 'errors.challenges.creation_error');
  }
};

/** Update a challenge */
const updateChallenge = async (req, res) => {
  const { userId, challengeId } = req.params;
  const updates = req.body;

  if (checkAuthorization(req, res, userId)) return;

  try {
    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return sendLocalizedError(res, 404, 'errors.challenges.not_found');
    }

    // Check if user is the creator
    if (challenge.creator.toString() !== userId) {
      return sendLocalizedError(res, 403, 'errors.challenges.creator_modify_only');
    }

    // Validate dates if they're being updated
    if (updates.startDate || updates.endDate) {
      const startDate = updates.startDate || challenge.startDate;
      const endDate = updates.endDate || challenge.endDate;

      const dateValidation = validateChallengeDates(startDate, endDate);
      if (!dateValidation.valid) {
        return sendLocalizedError(res, 400, dateValidation.error);
      }
    }

    if (updates.isPrivate !== undefined) {
      if (updates.isPrivate && !challenge.accessCode) {
        return sendLocalizedError(res, 400, 'errors.challenges.access_code_required');
      }
      if (!updates.isPrivate && challenge.accessCode) {
        updates.accessCode = null;
      }
    }

    // Update challenge fields
    Object.keys(updates).forEach(key => {
      challenge[key] = updates[key];
    });

    // Update status based on dates
    if (updates.startDate || updates.endDate) {
      challenge.status = determineChallengeStatus(
        challenge.startDate,
        challenge.endDate
      );
    }

    const updatedChallenge = await challenge.save();
    return sendLocalizedSuccess(res, 'success.challenges.updated', {}, { challenge: updatedChallenge });
  } catch (error) {
    console.error('Error updating challenge:', error);
    return sendLocalizedError(res, 500, 'errors.challenges.update_error');
  }
};

/** Join a challenge (private or public) */
const joinChallenge = async (req, res) => {
  const { userId, challengeId } = req.params;
  const { accessCode } = req.body;

  if (checkAuthorization(req, res, userId)) return;

  try {
    let challenge;
    if (accessCode) {
      challenge = await Challenge.findOne({ accessCode, isPrivate: true });
    } else {
      challenge = await Challenge.findById(challengeId);
    }

    if (!challenge) {
      return sendLocalizedError(res, 404, 'errors.challenges.not_found');
    }

    if (challenge.isPrivate && challenge.accessCode !== accessCode) {
      return sendLocalizedError(res, 403, 'errors.challenges.access_code_required');
    }

    // Check if user is already a participant
    const isParticipant = challenge.participants.some(p => p.user.toString() === userId);
    if (isParticipant) {
      return sendLocalizedError(res, 400, 'errors.challenges.already_participating');
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
      lastUpdated: new Date()
    });

    await challenge.save();
    await updateSingleChallengeProgress(userId, challenge._id);

    const populatedChallenge = await Challenge.findById(challengeId)
      .populate('creator participants.user');

    return sendLocalizedSuccess(res, 'success.challenges.joined', {}, { challenge: populatedChallenge });
  } catch (error) {
    console.error('Error joining challenge:', error);
    return sendLocalizedError(res, 500, 'errors.challenges.join_error');
  }
};

/** Leave a challenge */
const leaveChallenge = async (req, res) => {
  const { userId, challengeId } = req.params;

  if (checkAuthorization(req, res, userId)) return;

  try {
    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return sendLocalizedError(res, 404, 'errors.challenges.not_found');
    }

    // Check if user is a participant
    const participantIndex = challenge.participants.findIndex(
      p => p.user.toString() === userId
    );
    if (participantIndex === -1) {
      return sendLocalizedError(res, 400, 'errors.challenges.not_participating');
    }

    // Remove participant (creator cannot leave)
    if (challenge.creator.toString() === userId) {
      return sendLocalizedError(res, 400, 'errors.challenges.creator_cannot_leave');
    }

    challenge.participants.splice(participantIndex, 1);
    await challenge.save();

    return sendLocalizedSuccess(res, 'success.challenges.left');
  } catch (error) {
    console.error('Error leaving challenge:', error);
    return sendLocalizedError(res, 500, 'errors.challenges.leave_error');
  }
};

/** Delete a challenge */
const deleteChallenge = async (req, res) => {
  const { userId, challengeId } = req.params;

  if (checkAuthorization(req, res, userId)) return;

  try {
    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return sendLocalizedError(res, 404, 'errors.challenges.not_found');
    }

    if (challenge.creator.toString() !== userId) {
      return sendLocalizedError(res, 403, 'errors.challenges.creator_delete_only');
    }

    await Challenge.deleteOne({ _id: challengeId });

    // Delete related notifications
    await Notification.deleteMany({ challenge: challengeId });

    return sendLocalizedSuccess(res, 'success.challenges.deleted');
  } catch (error) {
    console.error('Error deleting challenge:', error);
    return sendLocalizedError(res, 500, 'errors.challenges.delete_error');
  }
};

/** Regenerate access code for a private challenge */
const regenerateAccessCode = async (req, res) => {
  const { userId, challengeId } = req.params;

  if (checkAuthorization(req, res, userId)) return;

  try {
    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return sendLocalizedError(res, 404, 'errors.challenges.not_found');
    }

    if (challenge.creator.toString() !== userId) {
      return sendLocalizedError(res, 403, 'errors.challenges.creator_regenerate_only');
    }

    if (!challenge.isPrivate) {
      return sendLocalizedError(res, 400, 'errors.challenges.private_only');
    }

    const newAccessCode = generateAccessCode();
    challenge.accessCode = newAccessCode;
    await challenge.save();

    return sendLocalizedSuccess(res, 'success.challenges.regenerated', {}, { accessCode: newAccessCode });
  } catch (error) {
    console.error('Error regenerating access code:', error);
    return sendLocalizedError(res, 500, 'errors.challenges.regenerate_error');
  }
};

/** Get challenge details */
const getChallengeDetails = async (req, res) => {
  const { challengeId } = req.params;

  try {
    const challenge = await Challenge.findById(challengeId)
      .populate('creator', 'username avatarUrl firstName lastName')
      .populate('participants.user', 'username avatarUrl firstName lastName');

    if (!challenge) {
      return sendLocalizedError(res, 404, 'errors.challenges.not_found');
    }

    return sendLocalizedSuccess(res, null, {}, { challenge });
  } catch (error) {
    console.error('Error getting challenge details:', error);
    return sendLocalizedError(res, 500, 'errors.challenges.get_details_error');
  }
};

// update challenge progress
const updateChallengeProgress = async (userId) => {
  try {
    const now = new Date();
    
    const userChallenges = await Challenge.find({
      'participants.user': userId,
      status: 'active',
      startDate: { $lte: now },
      $or: [
        { endDate: null },
        { endDate: { $gte: now } }
      ]
    }).populate('participants.user');
    
    try {
      for (const challenge of userChallenges) {
        const participant = challenge.participants.find(p => p.user._id.toString() === userId);
        if (!participant) continue;

        const progressData = await calculateUserProgress(userId, challenge);
        
        // Maj seulement si nécessaire
        if (participant.progress !== progressData.progress || 
            participant.completed !== progressData.completed) {
            
          participant.progress = progressData.progress;
          participant.completed = progressData.completed;
          participant.lastUpdated = now;

          if (progressData.completed && !participant.xpEarned) {
            participant.xpEarned = challenge.xpReward;
            await User.findByIdAndUpdate(
              userId, 
              { $inc: { totalXP: challenge.xpReward } }
            );
            
            await Notification.create({
              recipient: userId,
              type: 'challenge_complete',
              challenge: challenge._id,
              content: {
                en: `You completed "${challenge.name}"! +${challenge.xpReward}XP`,
                fr: `Défi "${challenge.name}" réussi ! +${challenge.xpReward}XP`,
                es: `¡Has completado "${challenge.name}"! +${challenge.xpReward}XP`,
                de: `Du hast "${challenge.name}" abgeschlossen! +${challenge.xpReward}XP`
              },
              status: 'unread',
              DeleteAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            });
          }

          await challenge.save();
        }
      }
    
    } catch (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error updating challenge progress:', error);
  }
};

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
  getChallengeDetails
};