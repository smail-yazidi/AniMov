import { type NextRequest, NextResponse } from "next/server"
import { watchlistsService } from "@/lib/database/watchlists"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const updates = await request.json()

    const item = await watchlistsService.updateWatchlistItem(params.id, updates)

    if (!item) {
      return NextResponse.json({ error: "Watchlist item not found" }, { status: 404 })
    }

    return NextResponse.json({ item })
  } catch (error) {
    console.error("Update watchlist item error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const success = await watchlistsService.removeFromWatchlist(params.id)

    if (!success) {
      return NextResponse.json({ error: "Watchlist item not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Item removed from watchlist" })
  } catch (error) {
    console.error("Remove from watchlist error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
