const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const stepEntrySchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  date: { type: Date, required: true, index: true },
  day: {
    type: String, // Format YYYY-MM-DD
    index: true
  },

  steps: { type: Number, required: true },
  distance: { type: Number },
  calories: { type: Number, min: 0 },
  mode: {
    type: String,
    enum: ['walk', 'run', 'bike'],
    default: 'walk'
  },
  activeTime: { type: Number, min: 0 },

  isVerified: { type: Boolean, default: false, required: true },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true })

stepEntrySchema.pre('save', function (next) {
  if (this.date) {
    this.day = this.date.toISOString().split('T')[0];
  }
  next();
});

module.exports = mongoose.model('StepEntry', stepEntrySchema)