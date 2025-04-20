const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatarUrl: { type: String, default: "https://step-ify.vercel.app/assets/account-B-Y-cm6M.png" },
  status: { type: String, default: "Salut, j'utilise Stepify !" },

  //authentification/autorisation
  isAdmin: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  verificationTokenExpiresAt: { type: Date },
  resetPasswordToken: { type: String },
  resetPasswordTokenExpiresAt: { type: Date },

  // Objectif et stats globales
  dailyGoal: { type: Number, default: 10000 }, // pas/jour
  totalSteps: { type: Number, default: 0 },
  totalDistance: { type: Number, default: 0 }, // en km
  dailyStats: [{
    date: { type: Date, required: true },
    steps: { type: Number, default: 0 },
    distance: { type: Number, default: 0 },
    calories: { type: Number },
    mode: { type: String, enum: ['walk', 'run', 'bike'], default: 'walk' },
    activeTime: { type: Number }
  }],
  customGoals: [{
    type: { type: String, enum: ['steps', 'distance', 'calories', 'time'] },
    target: Number,
    deadline: Date,
    createdAt: Date,
    isCompleted: Boolean
  }],

  // Récompenses gagnées
  rewardsUnlocked: [{
    reward: { type: Schema.Types.ObjectId, ref: 'Reward' },
    progress: { type: Number }, // en %
    unlockedAt: { type: Date, default: Date.now }
  }],
  challenges: [{
    challengeId: { type: Schema.Types.ObjectId, ref: 'Challenge' },
    joinedAt: Date,
    completed: { type: Boolean, default: false }
  }],
  totalChallengesCompleted: { type: Number, default: 0 },
  streak: {
    current: { type: Number, default: 0 },
    max: { type: Number, default: 0 },
    lastDay: { type: Date }
  },

  // Amis
  friends: [{
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    addedAt: { type: Date, default: Date.now }
  }],
  friendRequests: [{
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    sentAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' }
  }],

  // Expérience utilisateur
  themePreference: { type: String, enum: ['light', 'dark', 'auto'], default: 'auto' },
  languagePreference: { type: String, default: "fr" },
  lastLoginAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('User', userSchema)