// /api/auth/logout/route.ts
import { NextRequest, NextResponse } from "next/server"
import { destroySession } from "@/lib/session-store"

export async function DELETE(req: NextRequest) {
  const sessionId = req.headers.get("authorization")
  if (!sessionId) return NextResponse.json({ error: "Missing session ID" }, { status: 400 })

  await destroySession(sessionId)
  return NextResponse.json({ message: "Session destroyed" })
}
