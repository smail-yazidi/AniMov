import mongoose, { Schema, Document, Types } from 'mongoose';

export interface WatchlistItem extends Document {
  userId: Types.ObjectId;
  contentId: string;
  contentType: "movie" | "tv" | "anime";
  title: string;
  poster?: string;
  status: "plan-to-watch" | "watching" | "completed" | "on-hold" | "dropped";
  rating?: number;
  progress?: {
    current: number;
    total?: number;
    unit: "episode" | "season" | "movie";
  };
  notes?: string;
  startDate?: Date;
  completedDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const WatchlistItemSchema = new Schema<WatchlistItem>({
  userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  contentId: { type: String, required: true },
  contentType: { type: String, enum: ["movie", "tv", "anime"], required: true },
  title: { type: String, required: true },
  poster: { type: String },
  status: { type: String, enum: ["plan-to-watch", "watching", "completed", "on-hold", "dropped"], required: true },
  rating: { type: Number },
  progress: {
    current: { type: Number },
    total: { type: Number },
    unit: { type: String, enum: ["episode", "season", "movie"] },
  },
  notes: { type: String },
  startDate: { type: Date },
  completedDate: { type: Date },
}, { timestamps: true });

export const WatchlistItemModel = mongoose.models.WatchlistItem || mongoose.model<WatchlistItem>('WatchlistItem', WatchlistItemSchema);
