import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import { FavoriteItemModel } from "@/models/FavoriteItem"
import mongoose from "mongoose"
import { getSession } from "@/lib/session-store" // Import getSession

// Helper function to get userId from the request
async function getUserIdFromRequest(req: Request): Promise<string | null> {
  const authHeader = req.headers.get("authorization")
  const sessionId = authHeader?.replace("Bearer ", "")

  if (!sessionId) {
    return null
  }

  const session = await getSession(sessionId)
  if (!session) {
    return null
  }
  return session.userId
}

export async function POST(req: Request) {
  await connectToDatabase()
  try {
    // Extract userId from the session
    const userId = await getUserIdFromRequest(req)

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized: Invalid or missing session" }, { status: 401 })
    }

    const { contentId, contentType } = await req.json()

    if (!contentId || !contentType) {
      return NextResponse.json({ error: "Missing required fields: contentId or contentType" }, { status: 400 })
    }

    // Avoid duplicates
    const exists = await FavoriteItemModel.findOne({
      userId: new mongoose.Types.ObjectId(userId), // Use the extracted userId
      contentId,
      contentType,
    })
    if (exists) {
      return NextResponse.json({ error: "Item already in favorites" }, { status: 409 })
    }

    const favorite = new FavoriteItemModel({
      userId: new mongoose.Types.ObjectId(userId), // Use the extracted userId
      contentId,
      contentType,
    })

    await favorite.save()

    return NextResponse.json(favorite, { status: 201 })
  } catch (error) {
    console.error("Add favorite error:", error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// Ensure your GET and DELETE handlers also use getUserIdFromRequest
export async function GET(req: Request) {
  await connectToDatabase()

  const userId = await getUserIdFromRequest(req)
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized: Invalid or missing session" }, { status: 401 })
  }

  try {
    const favorites = await FavoriteItemModel.find({ userId: new mongoose.Types.ObjectId(userId) }).sort({ createdAt: -1 })
    return NextResponse.json(favorites)
  } catch (error) {
    console.error("Fetch favorites error:", error)
    if (error instanceof Error) {
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  await connectToDatabase()
  try {
    const userId = await getUserIdFromRequest(req)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized: Invalid or missing session" }, { status: 401 })
    }

    const { contentId, contentType } = await req.json()

    if (!contentId || !contentType) {
      return NextResponse.json({ error: "Missing required fields: contentId or contentType" }, { status: 400 })
    }

    const deleted = await FavoriteItemModel.findOneAndDelete({
      userId: new mongoose.Types.ObjectId(userId),
      contentId,
      contentType,
    })

    if (!deleted) {
      return NextResponse.json({ error: "Favorite item not found for this user" }, { status: 404 }) // More specific error
    }

    return NextResponse.json({ message: "Favorite removed" })
  } catch (error) {
    console.error("Remove favorite error:", error)
    if (error instanceof Error) {
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}