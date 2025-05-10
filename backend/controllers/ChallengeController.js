const Challenge = require('../models/Challenge');
const { checkAuthorization } = require('../middlewares/VerifyAuthorization');

// Get user's challenges (created or participating in)
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
    .populate('creator', 'username')
    .populate('participants.user', 'username');

    return res.status(200).json({
      success: true,
      challenges: challenges });
  } catch (error) {
    console.error('Error fetching challenges:', error);
    return res.status(500).json({
      success: false,
      error: 'Error retrieving challenges'
    });
  }
};

// Create a new challenge
const createChallenge = async (req, res) => {
  const { userId } = req.params;

  if (checkAuthorization(req, res, userId)) return;

  try {
    const { name, startDate, activityType, goal, xpReward } = req.body;
    if (!name || !startDate || !activityType || !goal || !xpReward) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields' 
      });
    }

    const now = new Date();
    const startDateObj = new Date(startDate);
    let status = 'upcoming';

    if (startDateObj <= now) {
      const endDateObj = req.body.endDate ? new Date(req.body.endDate) : null;
      status = endDateObj && endDateObj < now ? 'completed' : 'active';
    }

    const newChallenge = new Challenge({
      ...req.body,
      creator: userId,
      status
    });

    await newChallenge.save();
    return res.status(201).json({
      success: true,
      newchallenge: newChallenge });
  } catch (error) {
    console.error('Error creating challenge:', error);
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Update a challenge
const updateChallenge = async (req, res) => {
  const { userId, challengeId } = req.params;

  if (checkAuthorization(req, res, userId)) return;

  try {
    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({ success: false, error: 'Challenge introuvable' });
    }

    if (challenge.creator.toString() !== userId) {
      return res.status(403).json({ success: false, error: 'Seul le créateur du challenge peut le modifier' });
    }

    const updates = req.body;
    delete updates.creator;
    delete updates.participants;

    Object.keys(updates).forEach(key => challenge[key] = updates[key]);

    // Update status based on dates
    const now = new Date();
    if (updates.startDate || updates.endDate) {
      const startDate = new Date(challenge.startDate);
      const endDate = challenge.endDate ? new Date(challenge.endDate) : null;

      challenge.status = startDate > now ? 'upcoming' :
        (endDate && endDate <= now) ? 'completed' : 'active';
    }

    await challenge.save();
    return res.status(200).json({ success: true, data: challenge });
  } catch (error) {
    console.error('Error updating challenge:', error);
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// join a challenge (private or public)
const joinChallenge = async (req, res) => {
  const { userId, challengeId } = req.params;
  const { accessCode } = req.body;

  if (checkAuthorization(req, res, userId)) return;

  try {
    const challenge = await Challenge.findById(challengeId);
    if (!challenge) return res.status(404).json({ success: false,  error: 'Challenge introuvable' });

    if (challenge.isPrivate && challenge.accessCode !== accessCode) {
      return res.status(403).json({ success: false,  error: 'Le code d\'accès est invalide' });
    }

    const existingParticipant = challenge.participants.find(p => 
      p.user.toString() === userId
    );
    if (existingParticipant) {
      return res.status(400).json({ success: false,  error: 'Vous participez déjà à ce challenge' });
    }

    challenge.participants.push({
      user: userId,
      joinedAt: new Date()
    });

    await challenge.save();
    return res.status(200).json(challenge);
  } catch (error) {
    console.error('Join error:', error);
    return res.status(500).json({ success: false,  error: 'Error joining challenge' });
  }
};

// update progress
const updateProgress = async (req, res) => {
  const { userId, challengeId } = req.params;
  const { steps, time } = req.body;

  if (checkAuthorization(req, res, userId)) return;

  try {
    const challenge = await Challenge.findById(challengeId);
    if (!challenge) return res.status(404).json({ success: false,  error: 'Challenge introuvable' });

    const participant = challenge.participants.find(p => 
      p.user.toString() === userId
    );
    if (!participant) return res.status(404).json({ success: false,  error: 'Vous ne participez pas à ce challenge' });

    // Update metrics
    if (steps) participant.steps = steps;
    if (time) participant.time = time;

    // Calculate progress
    participant.progress = Math.min(
      ((challenge.activityType.includes('time') ? participant.time : participant.steps) / challenge.goal) * 100,
      100
    );
    participant.completed = participant.progress >= 100;
    participant.lastUpdated = new Date();

    await challenge.save();
    return res.status(200).json(participant);
  } catch (error) {
    console.error('Progress update error:', error);
    return res.status(500).json({ success: false,  error: 'Error updating progress' });
  }
};

// Delete a challenge
const deleteChallenge = async (req, res) => {
  const { userId, challengeId } = req.params;

  if (checkAuthorization(req, res, userId)) return;

  try {
    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({ success: false, error: 'Challenge introuvable' });
    }

    if (challenge.creator.toString() !== userId) {
      return res.status(403).json({ success: false, error: 'Seul le créateur du challenge peut le supprimer' });
    }

    await Challenge.deleteOne({ _id: challengeId });
    return res.status(200).json({ success: true, data: {} });
  } catch (error) {
    console.error('Error deleting challenge:', error);
    return res.status(500).json({
      success: false,
      error: 'Error deleting challenge'
    });
  }
};

const getChallengeDetails = async (req, res) => {
  const { challengeId } = req.params;

  try {
    const challenge = await Challenge.findById(challengeId)
      .populate('creator', 'username')
      .populate('participants.user', 'username');

    if (!challenge) {
      return res.status(404).json({ success: false,  error: 'Challenge introuvable' });
    }

    return res.status(200).json(challenge);
  } catch (error) {
    console.error('Error fetching challenge:', error);
    return res.status(500).json({ success: false,  error: 'Error retrieving challenge' });
  }
};

module.exports = {
  getMyChallenges,
  createChallenge,
  updateChallenge,
  joinChallenge,
  updateProgress,
  deleteChallenge,
  getChallengeDetails
};