import { type NextRequest, NextResponse } from "next/server"
import { commentsService } from "@/lib/database/comments"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const success = await commentsService.likeComment(params.id, userId)

    if (!success) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Comment liked successfully" })
  } catch (error) {
    console.error("Like comment error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const success = await commentsService.unlikeComment(params.id, userId)

    if (!success) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Comment unliked successfully" })
  } catch (error) {
    console.error("Unlike comment error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
