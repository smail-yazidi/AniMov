import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export interface WatchlistItem {
  _id?: ObjectId
  userId: ObjectId
  contentId: string // External API ID (e.g., "movie-123", "tv-456", "anime-789")
  contentType: "movie" | "tv" | "anime"
  title: string
  poster?: string
  status: "plan-to-watch" | "watching" | "completed" | "on-hold" | "dropped"
  rating?: number
  progress?: {
    current: number
    total?: number
    unit: "episode" | "season" | "movie"
  }
  notes?: string
  startDate?: Date
  completedDate?: Date
  createdAt: Date
  updatedAt: Date
}

export class WatchlistsService {
  private async getCollection() {
    const db = await getDatabase()
    return db.collection<WatchlistItem>("watchlists")
  }

  async addToWatchlist(item: Omit<WatchlistItem, "_id" | "createdAt" | "updatedAt">): Promise<WatchlistItem> {
    const collection = await this.getCollection()
    const now = new Date()

    const watchlistItem: WatchlistItem = {
      ...item,
      createdAt: now,
      updatedAt: now,
    }

    const result = await collection.insertOne(watchlistItem)
    return { ...watchlistItem, _id: result.insertedId }
  }

  async getUserWatchlist(userId: string, status?: WatchlistItem["status"]): Promise<WatchlistItem[]> {
    const collection = await this.getCollection()
    const filter: any = { userId: new ObjectId(userId) }

    if (status) {
      filter.status = status
    }

    return await collection.find(filter).sort({ updatedAt: -1 }).toArray()
  }

  async updateWatchlistItem(itemId: string, updates: Partial<WatchlistItem>): Promise<WatchlistItem | null> {
    const collection = await this.getCollection()
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(itemId) },
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

  async removeFromWatchlist(itemId: string): Promise<boolean> {
    const collection = await this.getCollection()
    const result = await collection.deleteOne({ _id: new ObjectId(itemId) })
    return result.deletedCount > 0
  }

  async getWatchlistItem(userId: string, contentId: string): Promise<WatchlistItem | null> {
    const collection = await this.getCollection()
    return await collection.findOne({
      userId: new ObjectId(userId),
      contentId,
    })
  }

  async getUserStats(userId: string): Promise<{
    total: number
    planToWatch: number
    watching: number
    completed: number
    onHold: number
    dropped: number
  }> {
    const collection = await this.getCollection()
    const pipeline = [
      { $match: { userId: new ObjectId(userId) } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]

    const results = await collection.aggregate(pipeline).toArray()
    const stats = {
      total: 0,
      planToWatch: 0,
      watching: 0,
      completed: 0,
      onHold: 0,
      dropped: 0,
    }

    results.forEach((result) => {
      const status = result._id
      const count = result.count
      stats.total += count

      switch (status) {
        case "plan-to-watch":
          stats.planToWatch = count
          break
        case "watching":
          stats.watching = count
          break
        case "completed":
          stats.completed = count
          break
        case "on-hold":
          stats.onHold = count
          break
        case "dropped":
          stats.dropped = count
          break
      }
    })

    return stats
  }
}

export const watchlistsService = new WatchlistsService()
