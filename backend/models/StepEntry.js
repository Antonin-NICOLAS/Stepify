const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const hourlyDataSchema = new Schema({
  hour: { type: Number, min: 0, max: 23, required: true },
  steps: { type: Number, min: 0, default: 0 },
  distance: { type: Number, min: 0, default: 0 }, // en km
  calories: { type: Number, min: 0, default: 0 },
  activeTime: { type: Number, min: 0, default: 0 }, // en minutes
  mode: { type: String, enum: ['walk', 'run', 'bike'], default: 'walk' }
}, { _id: false });

const stepEntrySchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
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
  dominantMode: { type: String, enum: ['walk', 'run', 'bike'], default: 'walk' },
  
  // Métadonnées
  xp: { type: Number, default: 0 },
  isFavorite: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false, required: true },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

stepEntrySchema.pre('save', function(next) {
  // Calcul des totaux
  this.totalSteps = this.hourlyData.reduce((sum, h) => sum + h.steps, 0);
  this.totalDistance = this.hourlyData.reduce((sum, h) => sum + h.distance, 0);
  this.totalCalories = this.hourlyData.reduce((sum, h) => sum + h.calories, 0);
  this.totalActiveTime = this.hourlyData.reduce((sum, h) => sum + h.activeTime, 0);
  
  // Calcul du mode dominant
  const modeCounts = this.hourlyData.reduce((acc, h) => {
      acc[h.mode] = (acc[h.mode] || 0) + 1;
      return acc;
  }, {});
  
  this.dominantMode = Object.entries(modeCounts).sort((a, b) => b[1] - a[1])[0][0];
  
  next();
});

module.exports = mongoose.model('StepEntry', stepEntrySchema);