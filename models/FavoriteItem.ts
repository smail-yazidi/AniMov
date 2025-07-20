
import mongoose, { Schema, Document, Types } from 'mongoose';

export interface FavoriteItem extends Document {
  userId: Types.ObjectId;
  contentId: string;
  contentType: "movie" | "tv" | "anime" | "manga" | "book";
  createdAt: Date;
}

const FavoriteItemSchema = new Schema<FavoriteItem>({
  userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  contentId: { type: String, required: true },
  contentType: { type: String, enum: ["movie", "tv", "anime", "manga", "book"], required: true },
}, { timestamps: { createdAt: true, updatedAt: false } });

export const FavoriteItemModel = mongoose.models.FavoriteItem || mongoose.model<FavoriteItem>('FavoriteItem', FavoriteItemSchema);

