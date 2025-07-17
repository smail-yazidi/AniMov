import { type NextRequest, NextResponse } from "next/server"
import { watchlistsService } from "@/lib/database/watchlists"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const status = searchParams.get("status") as any

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const watchlist = await watchlistsService.getUserWatchlist(userId, status)
    return NextResponse.json({ watchlist })
  } catch (error) {
    console.error("Get watchlist error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const watchlistItem = {
      ...data,
      userId: new ObjectId(data.userId),
    }

    const item = await watchlistsService.addToWatchlist(watchlistItem)
    return NextResponse.json({ item }, { status: 201 })
  } catch (error) {
    console.error("Add to watchlist error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
