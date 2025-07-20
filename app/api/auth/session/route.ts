
import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session-store"
import { UserModel } from "@/models/User"
import connectToDatabase from "@/lib/mongodb"

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization")
  const sessionId = authHeader?.split(" ")[1] // ✅ extract just the session ID

  if (!sessionId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const session = await getSession(sessionId)
  if (!session) {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 })
  }

  await connectToDatabase()
  const user = await UserModel.findById(session.userId)

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  return NextResponse.json({
    user: {
      id: user._id,
      email: user.email,
      username: user.username,
      displayName: user.displayName,
      avatar: user.avatar,
    },
  })
}

