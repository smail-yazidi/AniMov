import mongoose, { Schema, Document, Types } from 'mongoose';

export interface User extends Document {
  email: string;
  username: string;
  displayName: string;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  preferences: {
    language: string;
    theme: string;
    timezone: string;
    dateFormat: string;
  };
  notifications: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    friendRequests: boolean;
    newReleases: boolean;
    recommendations: boolean;
    weeklyDigest: boolean;
  };
  privacy: {
    profileVisibility: "public" | "friends" | "private";
    showWatchlist: boolean;
    showFavorites: boolean;
    allowFriendRequests: boolean;
    showOnlineStatus: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<User>({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  displayName: { type: String, required: true },
  avatar: { type: String },
  bio: { type: String },
  location: { type: String },
  website: { type: String },
  preferences: {
    language: { type: String, default: "en" },
    theme: { type: String, default: "light" },
    timezone: { type: String, default: "UTC" },
    dateFormat: { type: String, default: "MM/DD/YYYY" },
  },
  notifications: {
    emailNotifications: { type: Boolean, default: true },
    pushNotifications: { type: Boolean, default: true },
    friendRequests: { type: Boolean, default: true },
    newReleases: { type: Boolean, default: true },
    recommendations: { type: Boolean, default: true },
    weeklyDigest: { type: Boolean, default: true },
  },
  privacy: {
    profileVisibility: { type: String, enum: ["public", "friends", "private"], default: "public" },
    showWatchlist: { type: Boolean, default: true },
    showFavorites: { type: Boolean, default: true },
    allowFriendRequests: { type: Boolean, default: true },
    showOnlineStatus: { type: Boolean, default: true },
  }
}, { timestamps: true });

export const UserModel = mongoose.models.User || mongoose.model<User>('User', UserSchema);
