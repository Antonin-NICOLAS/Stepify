const mongoose = require('mongoose')
const Schema = mongoose.Schema
const {
  isDateInFuture,
  convertLocalToUTC,
} = require('../helpers/DateTimeHelper')
require('./User.js')

// Validateurs personnalisés
const validateDates = function (value) {
  if (!this.startDate) return true
  const endDateUTC = convertLocalToUTC(value, this.timezone)
  const startDateUTC = convertLocalToUTC(this.startDate, this.timezone)
  return !value || endDateUTC > startDateUTC
}

const validateXPReward = function (value) {
  const minRewards = {
    easy: 50,
    medium: 100,
    hard: 200,
    extreme: 500,
  }
  return value >= minRewards[this.difficulty]
}

const validateGoal = function (value) {
  const minGoals = {
    steps: 1000,
    distance: 0.5, // en km
    calories: 100,
    xp: 50,
  }
  const baseType = this.activityType.split('-')[0]
  return value >= minGoals[baseType] || baseType === 'any'
}

const challengeSchema = new Schema({
  name: {
    fr: { type: String, minlength: 3, maxlength: 100 },
    en: { type: String, minlength: 3, maxlength: 100 },
    es: { type: String, minlength: 3, maxlength: 100 },
    de: { type: String, minlength: 3, maxlength: 100 },
  },
  description: {
    fr: { type: String, maxlength: 500 },
    en: { type: String, maxlength: 500 },
    es: { type: String, maxlength: 500 },
    de: { type: String, maxlength: 500 },
  },
  startDate: {
    type: Date,
    required: true,
    validate: {
      validator: function (value) {
        return isDateInFuture(value, this.timezone)
      },
      message: 'La date de début doit être dans le futur',
    },
  },
  endDate: {
    type: Date,
    validate: [
      validateDates,
      'La date de fin doit être après la date de début',
    ],
  },

  creator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  activityType: {
    type: String,
    enum: [
      'steps',
      'steps-time',
      'distance',
      'distance-time',
      'calories',
      'calories-time',
      'xp',
      'xp-time',
      'any',
    ],
    default: 'steps',
  },
  goal: {
    type: Number,
    required: true,
    min: 1,
    validate: [
      validateGoal,
      "L'objectif minimum n'est pas atteint pour ce type d'activité",
    ],
  },
  time: {
    type: Number,
    min: 1,
    required: function () {
      return [
        'steps-time',
        'distance-time',
        'calories-time',
        'xp-time',
      ].includes(this.activityType)
    },
  },
  xpReward: {
    type: Number,
    required: true,
    validate: [
      validateXPReward,
      "La récompense XP minimum n'est pas atteinte pour ce niveau de difficulté",
    ],
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard', 'extreme'],
    required: true,
  },

  participants: [
    {
      user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      goal: { type: Number, default: 0 },
      xpEarned: { type: Number, default: 0 },
      time: { type: Number, min: 0 },
      progress: { type: Number, default: 0 },
      joinedAt: { type: Date, default: Date.now },
      completed: { type: Boolean, default: false },
      lastUpdated: { type: Date, default: Date.now },
    },
  ],

  status: {
    type: String,
    enum: ['upcoming', 'active', 'completed'],
    default: 'upcoming',
  },

  isPrivate: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },
  accessCode: { type: String },
  createdAt: { type: Date, default: Date.now },

  timezone: {
    type: String,
    required: true,
    default: 'UTC',
  },
})

// Middleware pre-save pour copier le texte original dans la langue source
challengeSchema.pre('save', function (next) {
  if (this.isModified('name') || this.isModified('description')) {
    if (this.name?.original) {
      this.name[this.sourceLang] = this.name.original
    }
    if (this.description?.original) {
      this.description[this.sourceLang] = this.description.original
    }
  }
  next()
})

challengeSchema.index({
  createdAt: 1,
  creator: 1,
})

// Index pour la recherche de challenges publics
challengeSchema.index({
  isPrivate: 1,
  status: 1,
  startDate: -1,
})

// Index pour la recherche de participants
challengeSchema.index({
  'participants.user': 1,
  status: 1,
  startDate: -1,
})

// Index pour le classement
challengeSchema.index({
  'participants.progress': -1,
  status: 1,
})

module.exports = mongoose.model('Challenge', challengeSchema)
