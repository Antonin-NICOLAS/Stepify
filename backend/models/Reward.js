const mongoose = require('mongoose');
const Schema = mongoose.Schema;
require('./User.js')

const rewardSchema = new Schema({
  name: { type: String, required: true },
  description: String,
  iconUrl: String,
  criteria: {
    type: String,
    enum: ['steps', 'distance', 'challenges'],
    required: true
  },
  earnedBy: [{
    type: Schema.Types.ObjectId, ref: 'User'
  }],
  tier: {
    type: String,
    enum: ['bronze', 'silver', 'gold', 'platinium', 'ruby', 'sapphire', 'diamond'],
    default: 'bronze'
  },
  target: { type: Number, required: true }, // ex: 10000 pas
})

module.exports = mongoose.model('Reward', rewardSchema)