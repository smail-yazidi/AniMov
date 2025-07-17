import { type NextRequest, NextResponse } from "next/server"
import { favoritesService } from "@/lib/database/favorites"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const contentType = searchParams.get("contentType") as any

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const favorites = await favoritesService.getUserFavorites(userId, contentType)
    return NextResponse.json({ favorites })
  } catch (error) {
    console.error("Get favorites error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const favoriteItem = {
      ...data,
      userId: new ObjectId(data.userId),
    }

    const favorite = await favoritesService.addToFavorites(favoriteItem)
    return NextResponse.json({ favorite }, { status: 201 })
  } catch (error) {
    console.error("Add favorite error:", error)
    if (error instanceof Error && error.message === "Item already in favorites") {
      return NextResponse.json({ error: error.message }, { status: 409 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const contentId = searchParams.get("contentId")

    if (!userId || !contentId) {
      return NextResponse.json({ error: "User ID and Content ID are required" }, { status: 400 })
    }

    const success = await favoritesService.removeFromFavorites(userId, contentId)

    if (!success) {
      return NextResponse.json({ error: "Favorite not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Favorite removed successfully" })
  } catch (error) {
    console.error("Remove favorite error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
