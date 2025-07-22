import mongoose, { Document, Schema } from "mongoose";

// Define the interface
export interface IReadingListItem extends Document {
  userId: mongoose.Types.ObjectId;
  contentId: string; // ID from a manga/book source (e.g., Google Books, MangaDex)
  contentType: "manga" | "book";
  status: "plan-to-read" | "reading" | "completed" | "on-hold" | "dropped";
  like?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Define the schema
const ReadingListItemSchema: Schema<IReadingListItem> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    contentId: {
      type: String,
      required: true,
    },
    contentType: {
      type: String,
      required: true,
      enum: ["manga", "book"],
    },
    status: {
      type: String,
      required: true,
      enum: ["plan-to-read", "reading", "completed", "on-hold", "dropped"],
      default: "plan-to-read",
    },
    like: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate entries
ReadingListItemSchema.index(
  { userId: 1, contentId: 1, contentType: 1 },
  { unique: true }
);

// Export the model
export const ReadingListItemModel =
  (mongoose.models.ReadingListItem as mongoose.Model<IReadingListItem>) ||
  mongoose.model<IReadingListItem>("ReadingListItem", ReadingListItemSchema);
