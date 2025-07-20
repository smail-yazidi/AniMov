import mongoose, { Schema, Document, Types } from 'mongoose';

export interface FavoriteItem extends Document {
  userId: Types.ObjectId;
  contentId: string;
  contentType: "movie" | "tv" | "anime" | "manga" | "book";
  title: string;
  poster?: string;
  rating?: number;
  year?: number;
  genres?: string[];
  createdAt: Date;
}

const FavoriteItemSchema = new Schema<FavoriteItem>({
  userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  contentId: { type: String, required: true },
  contentType: { type: String, enum: ["movie", "tv", "anime", "manga", "book"], required: true },
  title: { type: String, required: true },
  poster: { type: String },
  rating: { type: Number },
  year: { type: Number },
  genres: [{ type: String }],
}, { timestamps: { createdAt: true, updatedAt: false } });

export const FavoriteItemModel = mongoose.models.FavoriteItem || mongoose.model<FavoriteItem>('FavoriteItem', FavoriteItemSchema);
