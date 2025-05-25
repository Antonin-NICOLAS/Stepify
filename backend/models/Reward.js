const mongoose = require('mongoose');
const Schema = mongoose.Schema;
require('./User.js')

const rewardSchema = new Schema({
  name: {
    fr: { type: String, required: true },
    en: { type: String, required: true },
    es: { type: String },
    de: { type: String }
  },
  description: {
    fr: { type: String },
    en: { type: String },
    es: { type: String },
    de: { type: String }
  },
  iconUrl: String,
  criteria: {
    type: String,
    enum: ['steps', 'steps-time', 'distance', 'distance-time', 'calories', 'calories-time',
      'streak', 'level', 'customgoal', 'challenges', 'challenges-time', 'rank', 'friend'],
    required: true
  },
  tier: {
    type: String,
    enum: ['bronze', 'silver', 'gold', 'platinum', 'ruby', 'sapphire', 'diamond'],
    default: 'bronze'
  },
  time: { type: Number, min: 0 }, //days

  earnedBy: [{
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    times: { type: Number, min: 1, default: 1 }, // combien de fois la récompense a été gagnée
    date: { type: Date, default: Date.now }, // débloquée à 
  }],
  //isBadge: { type: Boolean, default: true }
  //isHiddenUntilUnlocked: { type: Boolean, default: false }
  minLevel: { type: Number, default: 0 }, //level minimum pour débloquer
  isRepeatable: { type: Boolean, default: false },
  target: { type: Number, required: true }, // ex: 10000 pas
})

module.exports = mongoose.model('Reward', rewardSchema)