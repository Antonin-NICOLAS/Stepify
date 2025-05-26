const mongoose = require('mongoose');
const Schema = mongoose.Schema;
require('./User.js')

const challengeSchema = new Schema({
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
  startDate: { type: Date, required: true },
  endDate: { type: Date },

  creator: { type: Schema.Types.ObjectId, ref: 'User' },
  activityType: {
    type: String,
    enum: ['steps', 'steps-time', 'distance', 'distance-time', 'calories', 'calories-time', 'xp', 'xp-time', 'any'],
    default: 'steps'
  },
  goal: { type: Number, required: true },
  time: {
    type: Number,
    min: 1,
    required: function () {
      return ['steps-time', 'distance-time', 'calories-time', 'xp-time'].includes(this.activityType);
    }
  }, // jours
  xpReward: { type: Number, required: true },

  participants: [{
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    goal: { type: Number, default: 0 },
    xpEarned: { type: Number, default: 0 },
    time: { type: Number, min: 0 }, //days
    progress: { type: Number, default: 0 }, // % de l'objectif
    joinedAt: { type: Date, default: Date.now },
    completed: { type: Boolean, default: false },
    lastUpdated: { type: Date, default: Date.now }
  }],

  status: {
    type: String,
    enum: ['upcoming', 'active', 'completed'],
    default: 'upcoming'
  },

  isPrivate: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },
  accessCode: { type: String }, // pour rejoindre si privé
  createdAt: { type: Date, default: Date.now }
})

challengeSchema.index({ 
  createdAt: 1,
  creator: 1 
})

module.exports = mongoose.model('Challenge', challengeSchema)