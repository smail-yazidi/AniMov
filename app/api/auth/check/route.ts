// app/api/auth/check/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { usersService } from "@/lib/database/users"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function GET(request: NextRequest) {
  try {
    // Get the auth token from cookies
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ user: null }, { status: 200 })
    }

    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string }

    // Get user from database
    const user = await usersService.getUserById(decoded.userId)
    if (!user) {
      // Clear invalid token
      const response = NextResponse.json({ user: null }, { status: 200 })
      response.cookies.delete("auth-token")
      return response
    }

    // Return basic user info without sensitive data
    const userResponse = {
      id: user._id.toString(),
      email: user.email,
      username: user.username,
      displayName: user.displayName,
      avatar: user.avatar,
    }

    return NextResponse.json({ user: userResponse }, { status: 200 })
  } catch (error) {
    console.error("Auth check error:", error)
    
    // Clear invalid token
    const response = NextResponse.json({ user: null }, { status: 200 })
    response.cookies.delete("auth-token")
    return response
  }
}