import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export interface ReadlistItem {
  _id?: ObjectId
  userId: ObjectId
  contentId: string // External API ID (e.g., "manga-123", "book-456")
  contentType: "manga" | "book"
  title: string
  poster?: string
  status: "plan-to-read" | "reading" | "completed" | "on-hold" | "dropped"
  rating?: number
  progress?: {
    current: number
    total?: number
    unit: "chapter" | "volume" | "page"
  }
  notes?: string
  startDate?: Date
  completedDate?: Date
  createdAt: Date
  updatedAt: Date
}

export class ReadlistsService {
  private async getCollection() {
    const db = await getDatabase()
    return db.collection<ReadlistItem>("readlists")
  }

  async addToReadlist(item: Omit<ReadlistItem, "_id" | "createdAt" | "updatedAt">): Promise<ReadlistItem> {
    const collection = await this.getCollection()
    const now = new Date()

    const readlistItem: ReadlistItem = {
      ...item,
      createdAt: now,
      updatedAt: now,
    }

    const result = await collection.insertOne(readlistItem)
    return { ...readlistItem, _id: result.insertedId }
  }

  async getUserReadlist(userId: string, status?: ReadlistItem["status"]): Promise<ReadlistItem[]> {
    const collection = await this.getCollection()
    const filter: any = { userId: new ObjectId(userId) }

    if (status) {
      filter.status = status
    }

    return await collection.find(filter).sort({ updatedAt: -1 }).toArray()
  }

  async updateReadlistItem(itemId: string, updates: Partial<ReadlistItem>): Promise<ReadlistItem | null> {
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

  async removeFromReadlist(itemId: string): Promise<boolean> {
    const collection = await this.getCollection()
    const result = await collection.deleteOne({ _id: new ObjectId(itemId) })
    return result.deletedCount > 0
  }

  async getReadlistItem(userId: string, contentId: string): Promise<ReadlistItem | null> {
    const collection = await this.getCollection()
    return await collection.findOne({
      userId: new ObjectId(userId),
      contentId,
    })
  }

  async getUserStats(userId: string): Promise<{
    total: number
    planToRead: number
    reading: number
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
      planToRead: 0,
      reading: 0,
      completed: 0,
      onHold: 0,
      dropped: 0,
    }

    results.forEach((result) => {
      const status = result._id
      const count = result.count
      stats.total += count

      switch (status) {
        case "plan-to-read":
          stats.planToRead = count
          break
        case "reading":
          stats.reading = count
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

export const readlistsService = new ReadlistsService()
