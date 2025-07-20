import { NextRequest, NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import { UserModel } from "@/models/User"
import bcrypt from "bcryptjs"
import { createSession } from "@/lib/session-store"

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    await connectToDatabase()
    const user = await UserModel.findOne({ email })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Create a session and return session ID
    const sessionId = createSession(user._id.toString())

    return NextResponse.json({
      message: "Signed in successfully",
      sessionId,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        avatar: user.avatar,
      },
    })
  } catch (error) {
    console.error("Signin error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
