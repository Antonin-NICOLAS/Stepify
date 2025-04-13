const rewardSchema = new Schema({
    name: { type: String, required: true },
    description: String,
    iconUrl: String,
    criteria: {
      type: String,
      enum: ['steps', 'distance', 'challenges'],
      required: true
    },
    EarnedBy: [{
        user: Schema.Types.ObjectId, ref: 'User'
    }],
    target: { type: Number, required: true }, // ex: 10000 pas
  })