import { type NextRequest, NextResponse } from "next/server"
import { friendsService } from "@/lib/database/friends"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const friendship = await friendsService.acceptFriendRequest(params.id)

    if (!friendship) {
      return NextResponse.json({ error: "Friend request not found" }, { status: 404 })
    }

    return NextResponse.json({ friendship })
  } catch (error) {
    console.error("Accept friend request error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
