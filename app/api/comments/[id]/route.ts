import { type NextRequest, NextResponse } from "next/server"
import { commentsService } from "@/lib/database/comments"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const updates = await request.json()

    const comment = await commentsService.updateComment(params.id, updates)

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 })
    }

    return NextResponse.json({ comment })
  } catch (error) {
    console.error("Update comment error:", error)
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

    const success = await commentsService.deleteComment(params.id, userId)

    if (!success) {
      return NextResponse.json({ error: "Comment not found or unauthorized" }, { status: 404 })
    }

    return NextResponse.json({ message: "Comment deleted successfully" })
  } catch (error) {
    console.error("Delete comment error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
