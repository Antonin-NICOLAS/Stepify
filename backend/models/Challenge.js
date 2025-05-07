const mongoose = require('mongoose');
const Schema = mongoose.Schema;
require('./User.js')

const challengeSchema = new Schema({
    name: { type: String, required: true },
    description: String,
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    creator: { type: Schema.Types.ObjectId, ref: 'User' },

    goalSteps: { type: Number, required: true },

    participants: [{
      user: { type: Schema.Types.ObjectId, ref: 'User' },
      steps: { type: Number, default: 0 },
      joinedAt: { type: Date, default: Date.now }
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