import { type NextRequest, NextResponse } from "next/server"
import { commentsService } from "@/lib/database/comments"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const contentId = searchParams.get("contentId")
    const parentId = searchParams.get("parentId")
    const userId = searchParams.get("userId")

    if (userId) {
      const comments = await commentsService.getUserComments(userId)
      return NextResponse.json({ comments })
    }

    if (!contentId) {
      return NextResponse.json({ error: "Content ID is required" }, { status: 400 })
    }

    const comments = await commentsService.getContentComments(contentId, parentId || undefined)
    return NextResponse.json({ comments })
  } catch (error) {
    console.error("Get comments error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const commentData = {
      ...data,
      userId: new ObjectId(data.userId),
      parentId: data.parentId ? new ObjectId(data.parentId) : undefined,
    }

    const comment = await commentsService.addComment(commentData)
    return NextResponse.json({ comment }, { status: 201 })
  } catch (error) {
    console.error("Add comment error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
