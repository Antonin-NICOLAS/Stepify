const mongoose = require('mongoose');
const Schema = mongoose.Schema;
require('./StepEntry.js');
require('./Reward.js');
require('./Challenge.js')

const userSchema = new Schema({
  // --- Informations de base ---
  firstName: {
    type: String,
    required: [true, "Le prénom est requis"],
    minlength: [2, "Le prénom doit contenir au moins 2 caractères"],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, "Le nom est requis"],
    minlength: [2, "Le nom doit contenir au moins 2 caractères"],
    trim: true
  },
  username: {
    type: String,
    required: [true, "Le nom d'utilisateur est requis"],
    unique: true,
    minlength: [3, "Le nom d'utilisateur doit contenir au moins 3 caractères"],
    maxlength: [30, "Le nom d'utilisateur ne peut pas dépasser 30 caractères"],
    match: [/^[a-zA-Z0-9_]+$/, "Le nom d'utilisateur ne peut contenir que des lettres, chiffres et underscores"],
    trim: true,
    lowercase: true
  },
  email: {
    type: String,
    required: [true, "L'email est requis"],
    unique: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Veuillez entrer un email valide"],
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: [true, "Le mot de passe est requis"],
    minlength: [8, "Le mot de passe doit contenir au moins 8 caractères"]
  },
  avatarUrl: {
    type: String,
    default: "https://step-ify.vercel.app/assets/account-B-Y-cm6M.png",
    match: [/^https?:\/\/.+\..+$/, "L'URL de l'avatar doit être une URL valide"]
  },
  status: {
    type: String,
    default: "Salut, j'utilise Stepify !",
    maxlength: [150, "Le statut ne peut pas dépasser 150 caractères"]
  },

  // --- Authentification & Sécurité ---
  isAdmin: {
    type: Boolean,
    default: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: {
    type: String,
  },
  verificationTokenExpiresAt: {
    type: Date,
  },
  resetPasswordToken: {
    type: String,
  },
  resetPasswordTokenExpiresAt: {
    type: Date,
  },
  activeSessions: [{
    ipAddress: String,
    userAgent: String,
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, default: () => Date.now() + 7 * 24 * 60 * 60 * 1000 }
  }],

  // --- Objectifs & Statistiques ---
  dailyGoal: {
    type: Number,
    default: 10000,
    min: [1000, "L'objectif quotidien doit être d'au moins 1000 pas"],
    max: [50000, "L'objectif quotidien ne peut pas dépasser 50000 pas"]
  },
  totalXP: {
    type: Number,
    default: 0,
    min: 0
  },
  totalSteps: {
    type: Number,
    default: 0,
    min: 0
  },
  totalDistance: {
    type: Number,
    default: 0, // en km
    min: 0
  },
  customGoals: [{
    type: {
      type: String,
      enum: ['steps', 'distance', 'calories', 'time'],
      required: true
    },
    target: {
      type: Number,
      required: true,
      min: 1
    },
    deadline: {
      type: Date,
      required: true,
      validate: {
        validator: function (v) {
          return v > new Date();
        },
        message: "La date limite doit être dans le futur"
      }
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    isCompleted: {
      type: Boolean,
      default: false
    }
  }],

  // --- Récompenses & Défis ---
  rewardsUnlocked: [{
    rewardId: {
      type: Schema.Types.ObjectId,
      ref: 'Reward',
      required: true
    },
    progress: {
      type: Number,
      min: 0,
      max: 100
    },
    unlockedAt: {
      type: Date,
      default: Date.now
    }
  }],
  challenges: [{
    challengeId: {
      type: Schema.Types.ObjectId,
      ref: 'Challenge',
      required: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    completed: {
      type: Boolean,
      default: false
    }
  }],
  totalChallengesCompleted: {
    type: Number,
    default: 0,
    min: 0
  },
  streak: {
    current: { type: Number, default: 0 },
    max: { type: Number, default: 0 },
    lastAchieved: { type: Date },
    startDate: { type: Date },
    endDate: { type: Date }
  },

  // --- Réseau social ---
  friends: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  friendRequests: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    sentAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending'
    }
  }],
  privacySettings: {
    showActivityToFriends: {
      type: Boolean,
      default: true
    },
    showStatsPublicly: {
      type: Boolean,
      default: false
    },
    allowFriendRequests: {
      type: Boolean,
      default: true
    },
    showLastLogin: {
      type: Boolean,
      default: false
    }
  },

  // --- Préférences utilisateur ---
  themePreference: {
    type: String,
    enum: ['light', 'dark', 'auto'],
    default: 'auto'
  },
  languagePreference: {
    type: String,
    enum: ['fr', 'en', 'es', 'de'],
    default: 'fr'
  },
  notificationPreferences: {
    activitySummary: { type: Boolean, default: true },
    newChallenges: { type: Boolean, default: true },
    friendRequests: { type: Boolean, default: true },
    goalAchieved: { type: Boolean, default: true },
    friendActivity: { type: Boolean, default: true }
  },

  // --- Métadonnées ---
  lastLoginAt: {
    type: Date
  },
  loginAttempts: {
    type: Number,
    default: 0,
    min: 0
  },
  lastLoginAttempt: Date,
  lockUntil: Date,
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function (doc, ret) {
      delete ret.password;
      delete ret.verificationToken;
      delete ret.resetPasswordToken;
      delete ret.activeSessions;
      delete ret.loginAttempts;
      delete ret.lockUntil;
      return ret;
    }
  },
  toObject: {
    virtuals: true
  }
});

// Virtual pour le nom complet
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual pour le progrès de l'objectif quotidien
userSchema.virtual('todayProgress').get(async function() {
  const today = new Date().toISOString().split('T')[0];
  const result = await mongoose.model('StepEntry').aggregate([
    { $match: { user: this._id, day: today } },
    { $group: { _id: null, totalSteps: { $sum: "$steps" } } }
  ]);
  
  const todaySteps = result[0]?.totalSteps || 0;
  return (todaySteps / this.dailyGoal) * 100;
});

// Index pour améliorer les performances
userSchema.index({ 'customGoals.deadline': 1 });

module.exports = mongoose.model('User', userSchema);