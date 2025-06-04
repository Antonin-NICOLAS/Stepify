const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const notificationSchema = new Schema(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    type: {
      type: String,
      enum: [
        "challenge_invite",
        "challenge_accept",
        "challenge_decline",
        "challenge_complete",
        "friend_request",
        "friend_accept",
        "friend_decline",
        "message",
        "badge_unlocked",
        "level_up",
        "other",
      ],
      required: true,
    },
    challenge: {
      type: Schema.Types.ObjectId,
      ref: "Challenge",
      required: function () {
        return ["challenge_invite", "challenge_accept"].includes(this.type);
      },
    },
    content: {
      fr: { type: String, default: "", required: true },
      en: { type: String, default: "", required: true },
      es: { type: String, default: "" },
      de: { type: String, default: "" },
    },
    status: {
      type: String,
      enum: ["unread", "read", "accepted", "declined"],
      default: "unread",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    DeleteAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Notification", notificationSchema);
