// /api/watchlist/check/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session-store";
import connectToDatabase from "@/lib/mongodb";
import { WatchlistItemModel } from "@/models/WatchlistItem";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const sessionId = authHeader?.replace("Bearer ", "");

  if (!sessionId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const session = await getSession(sessionId);
  if (!session) {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const contentId = searchParams.get("contentId");
  const contentType = searchParams.get("contentType"); // "movie" | "tv" | "anime"

  if (!contentId || !contentType) {
    return NextResponse.json(
      { error: "Missing contentId or contentType" },
      { status: 400 }
    );
  }

  // Validate content type against your WatchlistItemModel enum
  if (!["movie", "tv", "anime"].includes(contentType)) {
    return NextResponse.json(
      { error: "Invalid contentType for watchlist check" },
      { status: 400 }
    );
  }

  await connectToDatabase();

  try {
    const exists = await WatchlistItemModel.findOne({
      userId: new mongoose.Types.ObjectId(session.userId),
      contentId,
      contentType,
    });

    return NextResponse.json({ inWatchlist: !!exists });
  } catch (error) {
    console.error("Error checking watchlist item existence:", error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message || "Internal Server Error" },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}