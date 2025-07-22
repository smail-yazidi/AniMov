// src/models/WatchlistItem.ts

import mongoose, { Document, Schema } from "mongoose";

// Define the interface for a Watchlist Item document
export interface IWatchlistItem extends Document {
  userId: mongoose.Types.ObjectId;
  contentId: string; // The ID from TMDB, Jikan, etc.
  contentType: "movie" | "tv" | "anime"; // Specific types for watchlist
  status: "plan-to-watch" | "watching" | "completed" | "on-hold" | "dropped";
  progress?: string; // e.g., "Episode 5/12", "Chapter 100/200"
  createdAt: Date;
  updatedAt: Date;
}

// Define the Mongoose schema for a Watchlist Item
const WatchlistItemSchema: Schema<IWatchlistItem> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User", // Assuming you have a 'User' model
      required: true,
    },
    contentId: {
      type: String,
      required: true,
    },
    contentType: {
      type: String,
      required: true,
      enum: ["movie", "tv", "anime"], // Restrict content types
    },
    status: {
      type: String,
      required: true,
      enum: ["plan-to-watch", "watching", "completed", "on-hold", "dropped"],
      default: "plan-to-watch",
    },
    progress: {
      type: String,
      default: "", // Optional progress string
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Add a compound unique index to prevent duplicate watchlist entries for a user
WatchlistItemSchema.index({ userId: 1, contentId: 1, contentType: 1 }, { unique: true });

// Export the Mongoose model
export const WatchlistItemModel =
  (mongoose.models.WatchlistItem as mongoose.Model<IWatchlistItem>) ||
  mongoose.model<IWatchlistItem>("WatchlistItem", WatchlistItemSchema);