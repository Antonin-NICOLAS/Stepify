const Challenge = require('../models/Challenge');
const Notification = require('../models/Notification');
const { checkAuthorization } = require('../middlewares/VerifyAuthorization');

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
    return { valid: false, error: 'Start date cannot be in the past' };
  }
  if (end && end <= start) {
    return { valid: false, error: 'End date must be after start date' };
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

/** Get all challenges */
const getPublicChallenges = async (req, res) => {
  const { userId } = req.params;

  if (checkAuthorization(req, res, userId)) return;

  try {
    const challenges = await Challenge.find({ isPrivate: false })
      .populate('creator', 'username avatarUrl firstName lastName')
      .populate('participants.user', 'username avatarUrl firstName lastName')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      challenges: challenges
    });
  } catch (error) {
    console.error('Error fetching challenges:', error);
    return res.status(500).json({
      success: false,
      error: 'Error retrieving challenges'
    });
  }
};

/** Get user's challenges (created or participating in) */
const getMyChallenges = async (req, res) => {
  const { userId } = req.params;

  if (checkAuthorization(req, res, userId)) return;

  try {
    const challenges = await Challenge.find({
      $or: [
        { creator: userId },
        { 'participants.user': userId }
      ]
    })
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

    return res.status(200).json({
      success: true,
      challenges,
      userProgress
    });
  } catch (error) {
    console.error('Error fetching user challenges:', error);
    return res.status(500).json({
      success: false,
      error: 'Error retrieving user challenges'
    });
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
      return res.status(400).json({
        success: false,
        error: 'Des champs sont manquants'
      });
    }

    // Validate dates
    const dateValidation = validateChallengeDates(startDate, endDate);
    if (!dateValidation.valid) {
      return res.status(400).json({
        success: false,
        error: dateValidation.error
      });
    }

    // Validate activity type specific requirements
    if (['steps-time', 'distance-time', 'calories-time', 'xp-time'].includes(activityType) && !time) {
      return res.status(400).json({
        success: false,
        error: `Time is required for activity type: ${activityType}`
      });
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

    // Send invitations if private and has participants
    if (isPrivate && participants && participants.length > 0) {
      const invitations = participants
        .filter(id => id !== userId)
        .map(toId => ({
          challenge: newChallenge._id,
          sender: userId,
          recipient: toId,
          type: 'challenge_invite',
          content: `You've been invited to join the challenge "${name}"!`,
          status: 'unread',
          DeleteAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }));

      await Notification.insertMany(invitations);
    }

    return res.status(201).json({
      success: true,
      challenge: newChallenge
    });
  } catch (error) {
    console.error('Error creating challenge:', error);
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

/** Update a challenge */
const updateChallenge = async (req, res) => {
  const { userId, challengeId } = req.params;

  if (checkAuthorization(req, res, userId)) return;

  try {
    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({ 
        success: false, 
        error: 'Challenge not found' 
      });
    }

    // Check if user is the creator
    if (challenge.creator.toString() !== userId) {
      return res.status(403).json({ 
        success: false, 
        error: 'Only the challenge creator can modify it' 
      });
    }

    // Prevent modification of certain fields
    const updates = { ...req.body };
    delete updates.creator;
    delete updates.participants;
    delete updates.accessCode;
    delete updates.createdAt;

    // Validate dates if they're being updated
    if (updates.startDate || updates.endDate) {
      const startDate = updates.startDate || challenge.startDate;
      const endDate = updates.endDate || challenge.endDate;
      
      const dateValidation = validateChallengeDates(startDate, endDate);
      if (!dateValidation.valid) {
        return res.status(400).json({
          success: false,
          error: dateValidation.error
        });
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

    await challenge.save();
    return res.status(200).json({ 
      success: true, 
      challenge: challenge 
    });
  } catch (error) {
    console.error('Error updating challenge:', error);
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

/** Join a challenge (private or public) */
const joinChallenge = async (req, res) => {
  const { userId } = req.params;
  const { accessCode } = req.body;

  if (checkAuthorization(req, res, userId)) return;

  try {
    const challenge = await Challenge.findOne({ accessCode, isPrivate: true });
    if (!challenge) {
      return res.status(404).json({ 
        success: false, 
        error: 'Challenge not found' 
      });
    }

    // Check if user is already a participant
    const existingParticipant = challenge.participants.find(
      p => p.user.toString() === userId
    );
    if (existingParticipant) {
      return res.status(400).json({ 
        success: false, 
        error: 'You are already participating in this challenge' 
      });
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
    
    return res.status(200).json({ 
      success: true, 
      challenge: challenge 
    });
  } catch (error) {
    console.error('Error joining challenge:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Error joining challenge' 
    });
  }
};

/** Leave a challenge */
const leaveChallenge = async (req, res) => {
  const { userId, challengeId } = req.params;

  if (checkAuthorization(req, res, userId)) return;

  try {
    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({ 
        success: false, 
        error: 'Challenge not found' 
      });
    }

    // Check if user is a participant
    const participantIndex = challenge.participants.findIndex(
      p => p.user.toString() === userId
    );
    if (participantIndex === -1) {
      return res.status(400).json({ 
        success: false, 
        error: 'You are not participating in this challenge' 
      });
    }

    // Remove participant (creator cannot leave)
    if (challenge.creator.toString() === userId) {
      return res.status(403).json({ 
        success: false, 
        error: 'Challenge creator cannot leave. Please delete the challenge instead.' 
      });
    }

    challenge.participants.splice(participantIndex, 1);
    await challenge.save();
    
    return res.status(200).json({ 
      success: true, 
      challenge: challenge 
    });
  } catch (error) {
    console.error('Error leaving challenge:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Error leaving challenge' 
    });
  }
};

/** Update challenge progress */
const updateProgress = async (req, res) => {
  const { userId, challengeId } = req.params;
  const { goal, time } = req.body;

  if (checkAuthorization(req, res, userId)) return;

  try {
    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({ 
        success: false, 
        error: 'Challenge not found' 
      });
    }

    // Find participant
    const participant = challenge.participants.find(
      p => p.user.toString() === userId
    );
    if (!participant) {
      return res.status(404).json({ 
        success: false, 
        error: 'You are not participating in this challenge' 
      });
    }

    // Update metrics
    if (goal !== undefined) participant.goal = goal;
    if (time !== undefined) participant.time = time;

    // Calculate progress based on activity type
    let progressValue;
    if (challenge.activityType.includes('time')) {
      progressValue = (participant.time / challenge.goal) * 100;
    } else {
      progressValue = (participant.goal / challenge.goal) * 100;
    }

    participant.progress = Math.min(progressValue, 100);
    participant.completed = participant.progress >= 100;
    participant.lastUpdated = new Date();

    await challenge.save();
    
    return res.status(200).json({ 
      success: true, 
      user: participant 
    });
  } catch (error) {
    console.error('Error updating progress:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Error updating progress' 
    });
  }
};

/** Delete a challenge */
const deleteChallenge = async (req, res) => {
  const { userId, challengeId } = req.params;

  if (checkAuthorization(req, res, userId)) return;

  try {
    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({ 
        success: false, 
        error: 'Challenge not found' 
      });
    }

    if (challenge.creator.toString() !== userId) {
      return res.status(403).json({ 
        success: false, 
        error: 'Only the challenge creator can delete it' 
      });
    }

    await Challenge.deleteOne({ _id: challengeId });
    
    // Delete related notifications
    await Notification.deleteMany({ challenge: challengeId });
    
    return res.status(200).json({ 
      success: true, 
      data: {} 
    });
  } catch (error) {
    console.error('Error deleting challenge:', error);
    return res.status(500).json({
      success: false,
      error: 'Error deleting challenge'
    });
  }
};

/** Regenerate access code for a private challenge */
const regenerateAccessCode = async (req, res) => {
  const { userId, challengeId } = req.params;

  if (checkAuthorization(req, res, userId)) return;

  try {
    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({ success: false, error: 'Challenge not found' });
    }

    if (challenge.creator.toString() !== userId) {
      return res.status(403).json({ success: false, error: 'Only the challenge creator can regenerate the access code' });
    }

    if (!challenge.isPrivate) {
      return res.status(400).json({ success: false, error: 'Only private challenges can have access codes' });
    }

    const newAccessCode = generateAccessCode();
    challenge.accessCode = newAccessCode;
    await challenge.save();

    return res.status(200).json({ 
      success: true, 
      code: { accessCode: newAccessCode } 
    });
  } catch (error) {
    console.error('Error regenerating access code:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Error regenerating access code' 
    });
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
      return res.status(404).json({ 
        success: false, 
        error: 'Challenge not found' 
      });
    }

    return res.status(200).json({
      success: true,
      challenge: challenge
    });
  } catch (error) {
    console.error('Error fetching challenge:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Error retrieving challenge' 
    });
  }
};

module.exports = {
  getPublicChallenges,
  getMyChallenges,
  createChallenge,
  updateChallenge,
  joinChallenge,
  leaveChallenge,
  updateProgress,
  deleteChallenge,
  regenerateAccessCode,
  getChallengeDetails
};