import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export interface Friend {
  _id?: ObjectId
  userId: ObjectId
  friendId: ObjectId
  status: "pending" | "accepted" | "blocked"
  requestedBy: ObjectId
  createdAt: Date
  acceptedAt?: Date
}

export class FriendsService {
  private async getCollection() {
    const db = await getDatabase()
    return db.collection<Friend>("friends")
  }

  async sendFriendRequest(userId: string, friendId: string): Promise<Friend> {
    const collection = await this.getCollection()

    // Check if friendship already exists
    const existing = await collection.findOne({
      $or: [
        { userId: new ObjectId(userId), friendId: new ObjectId(friendId) },
        { userId: new ObjectId(friendId), friendId: new ObjectId(userId) },
      ],
    })

    if (existing) {
      throw new Error("Friend request already exists or users are already friends")
    }

    const friendRequest: Friend = {
      userId: new ObjectId(userId),
      friendId: new ObjectId(friendId),
      status: "pending",
      requestedBy: new ObjectId(userId),
      createdAt: new Date(),
    }

    const result = await collection.insertOne(friendRequest)
    return { ...friendRequest, _id: result.insertedId }
  }

  async acceptFriendRequest(requestId: string): Promise<Friend | null> {
    const collection = await this.getCollection()
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(requestId), status: "pending" },
      {
        $set: {
          status: "accepted",
          acceptedAt: new Date(),
        },
      },
      { returnDocument: "after" },
    )
    return result.value
  }

  async rejectFriendRequest(requestId: string): Promise<boolean> {
    const collection = await this.getCollection()
    const result = await collection.deleteOne({
      _id: new ObjectId(requestId),
      status: "pending",
    })
    return result.deletedCount > 0
  }

  async removeFriend(userId: string, friendId: string): Promise<boolean> {
    const collection = await this.getCollection()
    const result = await collection.deleteOne({
      $or: [
        { userId: new ObjectId(userId), friendId: new ObjectId(friendId), status: "accepted" },
        { userId: new ObjectId(friendId), friendId: new ObjectId(userId), status: "accepted" },
      ],
    })
    return result.deletedCount > 0
  }

  async getUserFriends(userId: string): Promise<ObjectId[]> {
    const collection = await this.getCollection()
    const friends = await collection
      .find({
        $or: [
          { userId: new ObjectId(userId), status: "accepted" },
          { friendId: new ObjectId(userId), status: "accepted" },
        ],
      })
      .toArray()

    return friends.map((friend) => (friend.userId.toString() === userId ? friend.friendId : friend.userId))
  }

  async getPendingRequests(userId: string): Promise<Friend[]> {
    const collection = await this.getCollection()
    return await collection
      .find({
        friendId: new ObjectId(userId),
        status: "pending",
      })
      .toArray()
  }

  async getSentRequests(userId: string): Promise<Friend[]> {
    const collection = await this.getCollection()
    return await collection
      .find({
        userId: new ObjectId(userId),
        status: "pending",
      })
      .toArray()
  }

  async areFriends(userId: string, friendId: string): Promise<boolean> {
    const collection = await this.getCollection()
    const friendship = await collection.findOne({
      $or: [
        { userId: new ObjectId(userId), friendId: new ObjectId(friendId), status: "accepted" },
        { userId: new ObjectId(friendId), friendId: new ObjectId(userId), status: "accepted" },
      ],
    })
    return !!friendship
  }

  async getMutualFriends(userId: string, otherUserId: string): Promise<ObjectId[]> {
    const userFriends = await this.getUserFriends(userId)
    const otherUserFriends = await this.getUserFriends(otherUserId)

    return userFriends.filter((friendId) =>
      otherUserFriends.some((otherFriendId) => friendId.toString() === otherFriendId.toString()),
    )
  }

  async getFriendStats(userId: string): Promise<{
    totalFriends: number
    pendingRequests: number
    sentRequests: number
  }> {
    const [friends, pending, sent] = await Promise.all([
      this.getUserFriends(userId),
      this.getPendingRequests(userId),
      this.getSentRequests(userId),
    ])

    return {
      totalFriends: friends.length,
      pendingRequests: pending.length,
      sentRequests: sent.length,
    }
  }
}

export const friendsService = new FriendsService()
