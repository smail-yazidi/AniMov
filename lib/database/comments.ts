import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export interface Comment {
  _id?: ObjectId
  userId: ObjectId
  contentId: string // External API ID (e.g., "movie-123", "tv-456", etc.)
  contentType: "movie" | "tv" | "anime" | "manga" | "book"
  rating?: number // 1-10 scale
  comment: string
  likes: ObjectId[] // Array of user IDs who liked this comment
  parentId?: ObjectId // For reply comments
  createdAt: Date
  updatedAt: Date
}

export class CommentsService {
  private async getCollection() {
    const db = await getDatabase()
    return db.collection<Comment>("comments")
  }

  async addComment(commentData: Omit<Comment, "_id" | "likes" | "createdAt" | "updatedAt">): Promise<Comment> {
    const collection = await this.getCollection()
    const now = new Date()

    const comment: Comment = {
      ...commentData,
      likes: [],
      createdAt: now,
      updatedAt: now,
    }

    const result = await collection.insertOne(comment)
    return { ...comment, _id: result.insertedId }
  }

  async getContentComments(contentId: string, parentId?: string): Promise<Comment[]> {
    const collection = await this.getCollection()
    const filter: any = { contentId }

    if (parentId) {
      filter.parentId = new ObjectId(parentId)
    } else {
      filter.parentId = { $exists: false }
    }

    return await collection.find(filter).sort({ createdAt: -1 }).toArray()
  }

  async getUserComments(userId: string): Promise<Comment[]> {
    const collection = await this.getCollection()
    return await collection
      .find({ userId: new ObjectId(userId) })
      .sort({ createdAt: -1 })
      .toArray()
  }

  async updateComment(
    commentId: string,
    updates: Partial<Pick<Comment, "comment" | "rating">>,
  ): Promise<Comment | null> {
    const collection = await this.getCollection()
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(commentId) },
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

  async deleteComment(commentId: string, userId: string): Promise<boolean> {
    const collection = await this.getCollection()
    const result = await collection.deleteOne({
      _id: new ObjectId(commentId),
      userId: new ObjectId(userId),
    })
    return result.deletedCount > 0
  }

  async likeComment(commentId: string, userId: string): Promise<boolean> {
    const collection = await this.getCollection()
    const result = await collection.updateOne(
      { _id: new ObjectId(commentId) },
      { $addToSet: { likes: new ObjectId(userId) } },
    )
    return result.modifiedCount > 0
  }

  async unlikeComment(commentId: string, userId: string): Promise<boolean> {
    const collection = await this.getCollection()
    const result = await collection.updateOne(
      { _id: new ObjectId(commentId) },
      { $pull: { likes: new ObjectId(userId) } },
    )
    return result.modifiedCount > 0
  }

  async getCommentReplies(parentId: string): Promise<Comment[]> {
    const collection = await this.getCollection()
    return await collection
      .find({ parentId: new ObjectId(parentId) })
      .sort({ createdAt: 1 })
      .toArray()
  }

  async getContentRating(contentId: string): Promise<{
    averageRating: number
    totalRatings: number
    ratingDistribution: { [key: number]: number }
  }> {
    const collection = await this.getCollection()
    const pipeline = [
      {
        $match: {
          contentId,
          rating: { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          totalRatings: { $sum: 1 },
          ratings: { $push: "$rating" },
        },
      },
    ]

    const result = await collection.aggregate(pipeline).toArray()

    if (result.length === 0) {
      return {
        averageRating: 0,
        totalRatings: 0,
        ratingDistribution: {},
      }
    }

    const data = result[0]
    const ratingDistribution: { [key: number]: number } = {}

    // Initialize distribution
    for (let i = 1; i <= 10; i++) {
      ratingDistribution[i] = 0
    }

    // Count ratings
    data.ratings.forEach((rating: number) => {
      ratingDistribution[rating] = (ratingDistribution[rating] || 0) + 1
    })

    return {
      averageRating: Math.round(data.averageRating * 10) / 10,
      totalRatings: data.totalRatings,
      ratingDistribution,
    }
  }

  async getUserRating(userId: string, contentId: string): Promise<number | null> {
    const collection = await this.getCollection()
    const comment = await collection.findOne({
      userId: new ObjectId(userId),
      contentId,
      rating: { $exists: true, $ne: null },
    })
    return comment?.rating || null
  }
}

export const commentsService = new CommentsService()
