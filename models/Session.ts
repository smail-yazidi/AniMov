import mongoose, { Schema, model, models } from "mongoose"

const SessionSchema = new Schema({
  sessionId: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 1000 * 60 * 60 * 24) }, // 24 hours
})

export const SessionModel = models.Session || model("Session", SessionSchema)
