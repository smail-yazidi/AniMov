import mongoose, { Schema, Document, Types } from 'mongoose';

export interface Friend extends Document {
  userId: Types.ObjectId;
  friendId: Types.ObjectId;
  status: "pending" | "accepted" | "blocked";
  requestedBy: Types.ObjectId;
  createdAt: Date;
  acceptedAt?: Date;
}

const FriendSchema = new Schema<Friend>({
  userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  friendId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  status: { type: String, enum: ["pending", "accepted", "blocked"], required: true },
  requestedBy: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  acceptedAt: { type: Date },
}, { timestamps: { createdAt: true, updatedAt: false } });

export const FriendModel = mongoose.models.Friend || mongoose.model<Friend>('Friend', FriendSchema);
