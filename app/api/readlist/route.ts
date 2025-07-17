import { type NextRequest, NextResponse } from "next/server"
import { readlistsService } from "@/lib/database/readlists"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const status = searchParams.get("status") as any

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const readlist = await readlistsService.getUserReadlist(userId, status)
    return NextResponse.json({ readlist })
  } catch (error) {
    console.error("Get readlist error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const readlistItem = {
      ...data,
      userId: new ObjectId(data.userId),
    }

    const item = await readlistsService.addToReadlist(readlistItem)
    return NextResponse.json({ item }, { status: 201 })
  } catch (error) {
    console.error("Add to readlist error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
