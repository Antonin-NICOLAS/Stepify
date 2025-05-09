const mongoose = require('mongoose');
const Schema = mongoose.Schema;
require('./User.js')

const rewardSchema = new Schema({
  name: {
    type: String,
    fr: String,
    en: String,
    es: String,
    de: String,
    required: true
  },
  description: {
    type: String,
    fr: String,
    en: String,
    es: String,
    de: String
  },
  iconUrl: String,
  criteria: {
    type: String,
    enum: ['steps', 'steps-time', 'distance', 'distance-time', 'calories', 'calories-time',
      'streak', 'level','dailygoal-time', 'customgoal', 'challenges', 'challenges-time', 'rank', 'friend'],
    required: true
  },
  earnedBy: [{
    user: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    times: {type: Number, min:1, default: 1}
  }],
  //isBadge: { type: Boolean, default: true }
  //isHiddenUntilUnlocked: { type: Boolean, default: false }
  minLevel: { type: Number, default: 0 }, //level minimum pour débloquer
  tier: {
    type: String,
    enum: ['bronze', 'silver', 'gold', 'platinium', 'ruby', 'sapphire', 'diamond'],
    default: 'bronze'
  },
  isInVitrine: { type: Boolean, default: false},
  isRepeatable: { type: Boolean, default: false },
  target: { type: Number, required: true }, // ex: 10000 pas
  time: {type: Number, min: 0} //days
})

module.exports = mongoose.model('Reward', rewardSchema)