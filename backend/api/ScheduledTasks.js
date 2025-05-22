const cron = require('node-cron');
const Challenge = require('../models/Challenge');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { updateUserRewards } = require('../controllers/RewardController');

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
};

// Update rewards for all users daily at 3 AM
const scheduleDailyRewardUpdates = () => {
  cron.schedule('0 3 * * *', async () => {
    try {
      console.log('Starting daily reward updates for all users...');
      
      // Get all user IDs (just the IDs for efficiency)
      const users = await User.find({}, '_id');
      
      let processed = 0;
      const totalUsers = users.length;
      
      // Process users in batches to avoid memory issues
      const batchSize = 100;
      for (let i = 0; i < totalUsers; i += batchSize) {
        const batch = users.slice(i, i + batchSize);
        
        // Process each user in parallel
        await Promise.all(batch.map(async (user) => {
          try {
            await updateUserRewards(user._id);
            processed++;
            
            // Log progress every 100 users
            if (processed % 100 === 0) {
              console.log(`Processed ${processed} of ${totalUsers} users...`);
            }
          } catch (error) {
            console.error(`Error updating rewards for user ${user._id}:`, error);
          }
        }));
      }
      
      console.log(`[CRON] Completed reward updates for ${processed} users.`);
    } catch (error) {
      console.error('[CRON] Error in daily reward updates:', error);
    }
  });
};

module.exports = { 
  scheduleStatusUpdates, 
  deleteExpiredNotifications,
  scheduleDailyRewardUpdates
};