import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session-store"
import connectToDatabase from "@/lib/mongodb"
import { FavoriteItemModel } from "@/models/FavoriteItem"

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization")
  const sessionId = authHeader?.replace("Bearer ", "")

  if (!sessionId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const session = await getSession(sessionId)
  if (!session) {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const contentId = searchParams.get("contentId")
  const contentType = searchParams.get("contentType")

  if (!contentId || !contentType) {
    return NextResponse.json({ error: "Missing contentId or contentType" }, { status: 400 })
  }

  await connectToDatabase()

  const exists = await FavoriteItemModel.findOne({
    userId: session.userId,
    contentId,
    contentType,
  })

  return NextResponse.json({ inFavorites: !!exists })
}
