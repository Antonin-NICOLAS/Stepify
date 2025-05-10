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
    enum: ['walk', 'run', 'bike','xp', 'walk-time', 'run-time', 'bike-time', 'xp-time', 'any'],
    default: 'walk'
  },
  goal: { type: Number, required: true },
  time: {type: Number, min: 0},
  xpReward: { type: Number, required: true },

  participants: [{
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    steps: { type: Number, default: 0 },
    xpEarned: { type: Number, default: 0 },
    time: {type: Number, min: 0}, //days
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
  accessCode: { type: String }, // pour rejoindre si privé
  createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Challenge', challengeSchema)