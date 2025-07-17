import { type NextRequest, NextResponse } from "next/server"
import { friendsService } from "@/lib/database/friends"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const type = searchParams.get("type") // "friends", "pending", "sent"

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    let result
    switch (type) {
      case "pending":
        result = await friendsService.getPendingRequests(userId)
        break
      case "sent":
        result = await friendsService.getSentRequests(userId)
        break
      case "stats":
        result = await friendsService.getFriendStats(userId)
        break
      default:
        result = await friendsService.getUserFriends(userId)
    }

    return NextResponse.json({ data: result })
  } catch (error) {
    console.error("Get friends error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, friendId } = await request.json()

    if (!userId || !friendId) {
      return NextResponse.json({ error: "User ID and Friend ID are required" }, { status: 400 })
    }

    const friendRequest = await friendsService.sendFriendRequest(userId, friendId)
    return NextResponse.json({ friendRequest }, { status: 201 })
  } catch (error) {
    console.error("Send friend request error:", error)
    if (error instanceof Error && error.message.includes("already exists")) {
      return NextResponse.json({ error: error.message }, { status: 409 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
