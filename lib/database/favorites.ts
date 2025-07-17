import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export interface FavoriteItem {
  _id?: ObjectId
  userId: ObjectId
  contentId: string // External API ID (e.g., "movie-123", "tv-456", "anime-789", "manga-123", "book-456")
  contentType: "movie" | "tv" | "anime" | "manga" | "book"
  title: string
  poster?: string
  rating?: number
  year?: number
  genres?: string[]
  createdAt: Date
}

export class FavoritesService {
  private async getCollection() {
    const db = await getDatabase()
    return db.collection<FavoriteItem>("favorites")
  }

  async addToFavorites(item: Omit<FavoriteItem, "_id" | "createdAt">): Promise<FavoriteItem> {
    const collection = await this.getCollection()

    // Check if item already exists in favorites
    const existing = await collection.findOne({
      userId: item.userId,
      contentId: item.contentId,
    })

    if (existing) {
      throw new Error("Item already in favorites")
    }

    const favoriteItem: FavoriteItem = {
      ...item,
      createdAt: new Date(),
    }

    const result = await collection.insertOne(favoriteItem)
    return { ...favoriteItem, _id: result.insertedId }
  }

  async getUserFavorites(userId: string, contentType?: FavoriteItem["contentType"]): Promise<FavoriteItem[]> {
    const collection = await this.getCollection()
    const filter: any = { userId: new ObjectId(userId) }

    if (contentType) {
      filter.contentType = contentType
    }

    return await collection.find(filter).sort({ createdAt: -1 }).toArray()
  }

  async removeFromFavorites(userId: string, contentId: string): Promise<boolean> {
    const collection = await this.getCollection()
    const result = await collection.deleteOne({
      userId: new ObjectId(userId),
      contentId,
    })
    return result.deletedCount > 0
  }

  async isFavorite(userId: string, contentId: string): Promise<boolean> {
    const collection = await this.getCollection()
    const item = await collection.findOne({
      userId: new ObjectId(userId),
      contentId,
    })
    return !!item
  }

  async getFavoritesByType(userId: string): Promise<{
    movies: number
    tv: number
    anime: number
    manga: number
    books: number
    total: number
  }> {
    const collection = await this.getCollection()
    const pipeline = [
      { $match: { userId: new ObjectId(userId) } },
      {
        $group: {
          _id: "$contentType",
          count: { $sum: 1 },
        },
      },
    ]

    const results = await collection.aggregate(pipeline).toArray()
    const stats = {
      movies: 0,
      tv: 0,
      anime: 0,
      manga: 0,
      books: 0,
      total: 0,
    }

    results.forEach((result) => {
      const type = result._id
      const count = result.count
      stats.total += count

      switch (type) {
        case "movie":
          stats.movies = count
          break
        case "tv":
          stats.tv = count
          break
        case "anime":
          stats.anime = count
          break
        case "manga":
          stats.manga = count
          break
        case "book":
          stats.books = count
          break
      }
    })

    return stats
  }
}

export const favoritesService = new FavoritesService()
