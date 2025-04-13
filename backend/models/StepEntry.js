const stepEntrySchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    date: { type: Date, required: true },

    steps: { type: Number, required: true },
    distance: { type: Number }, // En km

    isVerified: { type: Boolean, default: false, required: true },
    createdAt: { type: Date, default: Date.now }
  })
  
  module.exports = mongoose.model('StepEntry', stepEntrySchema)