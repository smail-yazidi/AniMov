import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import { FavoriteItemModel } from "@/models/FavoriteItem"
import mongoose from "mongoose"

export async function GET(req: Request) {
  await connectToDatabase()

  const url = new URL(req.url)
  const userId = url.searchParams.get("userId")

  if (!userId) {
    return NextResponse.json({ error: "Missing userId query parameter" }, { status: 400 })
  }

  try {
    const favorites = await FavoriteItemModel.find({ userId: new mongoose.Types.ObjectId(userId) }).sort({ createdAt: -1 })
    return NextResponse.json(favorites)
  } catch (error) {
    console.error("Fetch favorites error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  await connectToDatabase()
  try {
    const { userId, contentId, contentType } = await req.json()

    if (!userId || !contentId || !contentType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Avoid duplicates
    const exists = await FavoriteItemModel.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      contentId,
      contentType,
    })
    if (exists) {
      return NextResponse.json({ error: "Item already in favorites" }, { status: 409 })
    }

    const favorite = new FavoriteItemModel({
      userId: new mongoose.Types.ObjectId(userId),
      contentId,
      contentType,
    })

    await favorite.save()

    return NextResponse.json(favorite, { status: 201 })
  } catch (error) {
    console.error("Add favorite error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  await connectToDatabase()
  try {
    const { userId, contentId, contentType } = await req.json()

    if (!userId || !contentId || !contentType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const deleted = await FavoriteItemModel.findOneAndDelete({
      userId: new mongoose.Types.ObjectId(userId),
      contentId,
      contentType,
    })

    if (!deleted) {
      return NextResponse.json({ error: "Favorite item not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Favorite removed" })
  } catch (error) {
    console.error("Remove favorite error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
