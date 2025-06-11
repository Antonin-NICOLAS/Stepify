const mongoose = require('mongoose')
const Schema = mongoose.Schema
require('./StepEntry.js')
require('./Reward.js')
require('./Challenge.js')

const userSchema = new Schema(
  {
    // --- Informations de base ---
    firstName: {
      type: String,
      required: [true, 'Le prénom est requis'],
      minlength: [2, 'Le prénom doit contenir au moins 2 caractères'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Le nom est requis'],
      minlength: [2, 'Le nom doit contenir au moins 2 caractères'],
      trim: true,
    },
    username: {
      type: String,
      required: [true, "Le nom d'utilisateur est requis"],
      unique: true,
      minlength: [
        3,
        "Le nom d'utilisateur doit contenir au moins 3 caractères",
      ],
      maxlength: [
        30,
        "Le nom d'utilisateur ne peut pas dépasser 30 caractères",
      ],
      match: [
        /^[a-zA-Z0-9_]+$/,
        "Le nom d'utilisateur ne peut contenir que des lettres, chiffres et underscores",
      ],
      trim: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: [true, "L'email est requis"],
      unique: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Veuillez entrer un email valide'],
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, 'Le mot de passe est requis'],
      minlength: [8, 'Le mot de passe doit contenir au moins 8 caractères'],
    },
    avatarUrl: {
      type: String,
      default:
        'https://res.cloudinary.com/dpqhhckyj/image/upload/v1748295671/account_hpeh3t.png',
      match: [
        /^https?:\/\/.+\..+$/,
        "L'URL de l'avatar doit être une URL valide",
      ],
    },
    status: {
      fr: {
        type: String,
        default: "Salut, j'utilise Stepify !",
        maxlength: [150, 'Le statut ne peut pas dépasser 150 caractères'],
      },
      en: {
        type: String,
        default: 'Hi, I am using Stepify!',
        maxlength: [150, 'Status cannot exceed 150 characters'],
      },
      es: {
        type: String,
        default: '¡Hola, uso Stepify!',
        maxlength: [150, 'El estado no puede superar los 150 caracteres'],
      },
      de: {
        type: String,
        default: 'Hallo, ich benutze Stepify!',
        maxlength: [150, 'Der Status kann nicht länger als 150 Zeichen sein'],
      },
    },

    // --- Authentification & Sécurité ---
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
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
    activeSessions: [
      {
        ipAddress: String,
        userAgent: String,
        fingerprint: String,
        createdAt: { type: Date, default: Date.now },
        expiresAt: {
          type: Date,
          default: () => Date.now() + 7 * 24 * 60 * 60 * 1000,
        },
      },
    ],
    twoFactorAuth: {
      attempts: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      lastAttempt: Date,
      lastVerified: Date,
      lockUntil: Date,
      preferredMethod: {
        type: String,
        enum: ['app', 'email', 'webauthn'],
        default: undefined,
      },
      appEnabled: {
        type: Boolean,
        default: false,
      },
      secret: {
        type: String,
      },
      emailEnabled: {
        type: Boolean,
        default: false,
      },
      emailCode: {
        type: String,
        default: null,
      },
      emailCodeExpires: {
        type: Date,
        default: null,
      },
      webauthnEnabled: {
        type: Boolean,
        default: false,
      },
      challenge: {
        type: String,
      },
      challengeExpiresAt: {
        type: Date,
        default: null,
      },
      webauthnCredentials: [
        {
          credentialId: String,
          publicKey: String,
          counter: Number,
          deviceType: String,
          deviceName: String,
          transports: [String],
          lastUsed: {
            type: Date,
            default: Date.now,
          },
          createdAt: {
            type: Date,
            default: Date.now,
          },
          revoked: {
            type: Boolean,
            default: false,
          },
        },
      ],
      backupCodes: [
        {
          code: String,
          used: {
            type: Boolean,
            default: false,
          },
        },
      ],
    },

    // --- Objectifs & Statistiques ---
    dailyGoal: {
      type: Number,
      default: 10000,
      min: [1000, "L'objectif quotidien doit être d'au moins 1000 pas"],
      max: [50000, "L'objectif quotidien ne peut pas dépasser 50000 pas"],
    },
    totalXP: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalSteps: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalDistance: {
      type: Number,
      default: 0, // en km
      min: 0,
    },
    totalCalories: {
      type: Number,
      default: 0,
      min: 0,
    },
    customGoals: [
      {
        type: {
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
            'streak',
            'challenges',
            'challenges-time',
            'rank',
          ],
          required: true,
        },
        target: {
          type: Number,
          required: true,
          min: 1,
        },
        progress: {
          type: Number,
          min: 0,
          max: 100,
        },
        time: {
          type: Number,
          min: 0,
          required: function () {
            return [
              'steps-time',
              'distance-time',
              'calories-time',
              'xp-time',
              'challenges-time',
            ].includes(this.type)
          },
        },
        deadline: {
          type: Date,
          required: true,
          validate: {
            validator: function (v) {
              return v > new Date()
            },
            message: 'La date limite doit être dans le futur',
          },
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
        isCompleted: {
          type: Boolean,
          default: false,
        },
      },
    ],
    totalCustomGoalsCompleted: {
      type: Number,
      default: 0,
      min: 0,
    },

    // --- Classement ---
    rankingHistory: [
      {
        time: { type: Number }, // temps passé à la position en heure
        globalRank: { type: Number },
        challengeRank: { type: Schema.Types.ObjectId }, // Challenge associé si besoin
      },
    ],
    level: {
      type: Number,
      min: 0,
      default: 0,
    },
    // --- Récompenses & Défis ---
    rewardsUnlocked: [
      {
        rewardId: {
          type: Schema.Types.ObjectId,
          ref: 'Reward',
          required: true,
        },
        progress: {
          type: Number,
          min: 0,
          max: 100,
        },
        isInVitrine: {
          type: Boolean,
          default: false,
        },
        unlockedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    challenges: [
      {
        challengeId: {
          type: Schema.Types.ObjectId,
          ref: 'Challenge',
          required: true,
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
        completed: {
          type: Boolean,
          default: false,
        },
        progress: {
          type: Number,
          default: 0,
        },
        lastUpdated: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    totalChallengesCompleted: {
      type: Number,
      default: 0,
      min: 0,
    },
    streak: {
      current: { type: Number, default: 0 },
      max: { type: Number, default: 0 },
      lastAchieved: { type: Date },
      startDate: { type: Date },
      endDate: { type: Date },
    },

    // --- Réseau social ---
    friends: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    friendRequests: [
      {
        notificationId: {
          type: Schema.Types.ObjectId,
          ref: 'Notification',
          required: true,
        },
      },
    ],
    privacySettings: {
      showActivityToFriends: {
        type: Boolean,
        default: true,
      },
      allowFriendRequests: {
        type: Boolean,
        default: true,
      },
      allowChallengeInvites: {
        type: Boolean,
        default: true,
      },
      showLastLogin: {
        type: Boolean,
        default: false,
      },
      showStatsPublicly: {
        type: Boolean,
        default: false,
      },
    },

    // --- Préférences utilisateur ---
    themePreference: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto',
    },
    languagePreference: {
      type: String,
      enum: ['fr', 'en', 'es', 'de'],
      default: 'fr',
    },
    notificationPreferences: {
      activitySummary: { type: Boolean, default: true },
      newChallenges: { type: Boolean, default: true },
      friendRequests: { type: Boolean, default: true },
      goalAchieved: { type: Boolean, default: true },
      friendActivity: { type: Boolean, default: true },
    },

    // --- Métadonnées ---
    lastLoginAt: {
      type: Date,
    },
    loginAttempts: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastLoginAttempt: Date,
    lockUntil: Date,
    createdAt: {
      type: Date,
      default: Date.now,
      immutable: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.password
        delete ret.verificationToken
        delete ret.resetPasswordToken
        delete ret.activeSessions
        delete ret.loginAttempts
        delete ret.lockUntil
        if (ret.twoFactorAuth) {
          delete ret.twoFactorAuth.secret
          delete ret.twoFactorAuth.backupCodes
        }
        return ret
      },
    },
    toObject: {
      virtuals: true,
    },
  },
)

// Virtual pour le nom complet
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`
})

// fonction pour envoyer l'utilisateur avec le minimum de données
userSchema.methods.toMinimal = function () {
  const userObj = this.toObject({ virtuals: true })
  // sensible
  delete userObj.password
  delete userObj.verificationToken
  delete userObj.resetPasswordToken
  delete userObj.activeSessions
  delete userObj.loginAttempts
  delete userObj.lockUntil
  delete userObj.twoFactorAuth.secret
  delete userObj.twoFactorAuth.backupCodes
  //delete userObj.privacySettings;
  //delete userObj.notificationPreferences;
  // Arrays
  delete userObj.rewardsUnlocked
  delete userObj.friendRequests
  delete userObj.customGoals
  delete userObj.challenges
  // Stats
  delete userObj.totalCalories
  delete userObj.totalDistance
  delete userObj.totalSteps
  delete userObj.totalXP
  delete userObj.totalCustomGoalsCompleted
  delete userObj.totalChallengesCompleted
  delete userObj.rankingHistory
  delete userObj.streak
  delete userObj.level
  return userObj
}

// Méthode pour le progrès de l'objectif quotidien
userSchema.methods.calculateTodayProgress = async function () {
  const StepEntry = mongoose.model('StepEntry')
  const today = new Date().toISOString().split('T')[0]

  const entry = await StepEntry.findOne({ user: this._id, day: today })
  const todaySteps = entry?.totalSteps || 0
  return Math.min(Math.round((todaySteps / this.dailyGoal) * 1000) / 10, 100) // max 100%
}

// Index pour améliorer les performances
userSchema.index({ 'customGoals.deadline': 1 })

module.exports = mongoose.model('User', userSchema)
