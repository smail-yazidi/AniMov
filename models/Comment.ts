import mongoose, { Schema, Document, Types } from 'mongoose';

export interface Comment extends Document {
  userId: Types.ObjectId;
  contentId: string;
  contentType: "movie" | "tv" | "anime" | "manga" | "book";
  rating?: number;
  comment: string;
  likes: Types.ObjectId[];
  parentId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<Comment>({
  userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  contentId: { type: String, required: true },
  contentType: { type: String, enum: ["movie", "tv", "anime", "manga", "book"], required: true },
  rating: { type: Number, min: 1, max: 10 },
  comment: { type: String, required: true },
  likes: [{ type: Schema.Types.ObjectId, ref: 'User', default: [] }],
  parentId: { type: Schema.Types.ObjectId, ref: 'Comment', default: null },
}, { timestamps: true });

export const CommentModel = mongoose.models.Comment || mongoose.model<Comment>('Comment', CommentSchema);
