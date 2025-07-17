import { type NextRequest, NextResponse } from "next/server"
import { friendsService } from "@/lib/database/friends"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const success = await friendsService.rejectFriendRequest(params.id)

    if (!success) {
      return NextResponse.json({ error: "Friend request not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Friend request rejected" })
  } catch (error) {
    console.error("Reject friend request error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
