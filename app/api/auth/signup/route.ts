import { type NextRequest, NextResponse } from "next/server"
import { usersService } from "@/lib/database/users"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { email, username, displayName, password } = await request.json()

    // Validate required fields
    if (!email || !username || !displayName || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    // Check if user already exists
    const existingUserByEmail = await usersService.getUserByEmail(email)
    if (existingUserByEmail) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 409 })
    }

    const existingUserByUsername = await usersService.getUserByUsername(username)
    if (existingUserByUsername) {
      return NextResponse.json({ error: "Username already taken" }, { status: 409 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user with default preferences
    const userData = {
      email,
      username,
      displayName,
      preferences: {
        language: "en",
        theme: "system",
        timezone: "UTC",
        dateFormat: "MM/DD/YYYY",
      },
      notifications: {
        emailNotifications: true,
        pushNotifications: true,
        friendRequests: true,
        newReleases: true,
        recommendations: true,
        weeklyDigest: false,
      },
      privacy: {
        profileVisibility: "public" as const,
        showWatchlist: true,
        showFavorites: true,
        allowFriendRequests: true,
        showOnlineStatus: true,
      },
    }

    const user = await usersService.createUser(userData)

    // Remove sensitive data from response
    const { ...userResponse } = user

    return NextResponse.json(
      {
        message: "User created successfully",
        user: userResponse,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
