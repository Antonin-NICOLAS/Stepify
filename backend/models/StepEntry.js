const mongoose = require('mongoose')
const Schema = mongoose.Schema

const hourlyDataSchema = new Schema(
  {
    hour: { type: Number, min: 0, max: 23, required: true },
    steps: { type: Number, min: 0, default: 0 },
    distance: { type: Number, min: 0, default: 0 }, // en km
    calories: { type: Number, min: 0, default: 0 },
    activeTime: { type: Number, min: 0, default: 0 }, // en minutes
    mode: { type: String, enum: ['walk', 'run', 'bike'], default: 'walk' },
  },
  { _id: false }
)

const stepEntrySchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    date: { type: Date, required: true, index: true }, // Date du jour
    day: { type: String, index: true }, // YYYY-MM-DD

    // Données horaires
    hourlyData: [hourlyDataSchema],

    // Totaux journaliers (calculés)
    totalSteps: { type: Number, min: 0, default: 0 },
    totalDistance: { type: Number, min: 0, default: 0 },
    totalCalories: { type: Number, min: 0, default: 0 },
    totalActiveTime: { type: Number, min: 0, default: 0 }, // en minutes

    // Mode dominant de la journée
    dominantMode: {
      type: String,
      enum: ['walk', 'run', 'bike'],
      default: 'walk',
    },

    // Métadonnées
    xp: { type: Number, default: 0 },
    isFavorite: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

module.exports = mongoose.model('StepEntry', stepEntrySchema)
