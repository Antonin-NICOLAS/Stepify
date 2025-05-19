const cron = require('node-cron');
const Challenge = require('../models/Challenge');
const Notification = require('../models/Notification');

// Update challenge statuses every hour
const scheduleStatusUpdates = () => {
  cron.schedule('0 * * * *', async () => { // Runs at the start of every hour
    try {
      console.log('Running challenge status updates...');
      await updateChallengeStatuses();
      console.log('Status updates completed');
    } catch (error) {
      console.error('Cron job error:', error);
    }
  });
};

// Your existing update function (modified for standalone use)
const updateChallengeStatuses = async () => {
  try {
    const challenges = await Challenge.find();
    const now = new Date();

    for (const challenge of challenges) {
      let newStatus = challenge.status;

      if (challenge.startDate > now) {
        newStatus = 'upcoming';
      } else if (challenge.endDate && challenge.endDate < now) {
        newStatus = 'completed';
      } else if (challenge.startDate <= now) {
        newStatus = 'active';
      }

      if (newStatus !== challenge.status) {
        challenge.status = newStatus;
        await challenge.save();
        console.log(`Updated challenge ${challenge._id} to ${newStatus}`);
      }
    }
  } catch (error) {
    console.error('Status update error:', error);
    throw error;
  }
};

// Delete Notification 1 week after the response - Every day at 1 AM
const deleteExpiredNotifications = () => {
  cron.schedule('0 1 * * *', async () => {
    try {
      const now = new Date();
      const result = await Notification.deleteMany({
        DeleteAt: { $lte: now }
      });

      console.log(`[CRON] Deleted ${result.deletedCount} expired invitations.`);
    } catch (error) {
      console.error('[CRON] Error deleting notifications:', error);
    }
  });
}

module.exports = { scheduleStatusUpdates, deleteExpiredNotifications };