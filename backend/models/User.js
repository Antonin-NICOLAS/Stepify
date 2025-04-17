const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatarUrl: { type: String }, //TODO: add a default url
  status: { type: String, default: "Salut, j'utilise Stepify !" },

  //authentification/autorisation
  isAdmin: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  verificationTokenExpiresAt: { type: Date },
  resetPasswordToken: { type: String },
  resetPasswordTokenExpires: { type: Date },

  // Objectif et stats globales
  dailyGoal: { type: Number, default: 10000 }, // pas/jour
  totalSteps: { type: Number, default: 0 },
  totalDistance: { type: Number, default: 0 }, // en km
  totalChallengesCompleted: { type: Number, default: 0 },

  // Récompenses gagnées
  rewardsUnlocked: [{
    reward: { type: Schema.Types.ObjectId, ref: 'Reward' },
    unlockedAt: { type: Date, default: Date.now }
  }],

  createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('User', userSchema)