import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export interface User {
  _id?: ObjectId
  email: string
  username: string
  displayName: string
  avatar?: string
  bio?: string
  location?: string
  website?: string
  preferences: {
    language: string
    theme: string
    timezone: string
    dateFormat: string
  }
  notifications: {
    emailNotifications: boolean
    pushNotifications: boolean
    friendRequests: boolean
    newReleases: boolean
    recommendations: boolean
    weeklyDigest: boolean
  }
  privacy: {
    profileVisibility: "public" | "friends" | "private"
    showWatchlist: boolean
    showFavorites: boolean
    allowFriendRequests: boolean
    showOnlineStatus: boolean
  }
  createdAt: Date
  updatedAt: Date
}

export class UsersService {
  private async getCollection() {
    const db = await getDatabase()
    return db.collection<User>("users")
  }

  async createUser(userData: Omit<User, "_id" | "createdAt" | "updatedAt">): Promise<User> {
    const collection = await this.getCollection()
    const now = new Date()

    const user: User = {
      ...userData,
      createdAt: now,
      updatedAt: now,
    }

    const result = await collection.insertOne(user)
    return { ...user, _id: result.insertedId }
  }

  async getUserById(userId: string): Promise<User | null> {
    const collection = await this.getCollection()
    return await collection.findOne({ _id: new ObjectId(userId) })
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const collection = await this.getCollection()
    return await collection.findOne({ email })
  }

  async getUserByUsername(username: string): Promise<User | null> {
    const collection = await this.getCollection()
    return await collection.findOne({ username })
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
    const collection = await this.getCollection()
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      {
        $set: {
          ...updates,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" },
    )
    return result.value
  }

  async deleteUser(userId: string): Promise<boolean> {
    const collection = await this.getCollection()
    const result = await collection.deleteOne({ _id: new ObjectId(userId) })
    return result.deletedCount > 0
  }

  async searchUsers(query: string, limit = 10): Promise<User[]> {
    const collection = await this.getCollection()
    return await collection
      .find({
        $or: [{ username: { $regex: query, $options: "i" } }, { displayName: { $regex: query, $options: "i" } }],
        "privacy.profileVisibility": { $ne: "private" },
      })
      .limit(limit)
      .toArray()
  }
}

export const usersService = new UsersService()
