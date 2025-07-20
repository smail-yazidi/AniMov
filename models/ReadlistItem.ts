import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ReadlistItem extends Document {
  userId: Types.ObjectId;
  contentId: string;
  contentType: "manga" | "book";
  title: string;
  poster?: string;
  status: "plan-to-read" | "reading" | "completed" | "on-hold" | "dropped";
  rating?: number;
  progress?: {
    current: number;
    total?: number;
    unit: "chapter" | "volume" | "page";
  };
  notes?: string;
  startDate?: Date;
  completedDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ReadlistItemSchema = new Schema<ReadlistItem>({
  userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  contentId: { type: String, required: true },
  contentType: { type: String, enum: ["manga", "book"], required: true },
  title: { type: String, required: true },
  poster: { type: String },
  status: { type: String, enum: ["plan-to-read", "reading", "completed", "on-hold", "dropped"], required: true },
  rating: { type: Number },
  progress: {
    current: { type: Number },
    total: { type: Number },
    unit: { type: String, enum: ["chapter", "volume", "page"] },
  },
  notes: { type: String },
  startDate: { type: Date },
  completedDate: { type: Date },
}, { timestamps: true });

export const ReadlistItemModel = mongoose.models.ReadlistItem || mongoose.model<ReadlistItem>('ReadlistItem', ReadlistItemSchema);
