// /api/watchlist/check/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session-store";
import connectToDatabase from "@/lib/mongodb";
import { WatchlistItemModel } from "@/models/WatchlistItem";
import mongoose from "mongoose";
export async function GET(req: NextRequest) {
  try {
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
    const contentType = searchParams.get("contentType");

    // Debug logging
    console.log("Watchlist check request:", {
      contentId,
      contentType,
      sessionUserId: session.userId
    });

    if (!contentId || !contentType) {
      return NextResponse.json(
        { error: "Missing contentId or contentType" },
        { status: 400 }
      );
    }

    const validTypes = ["movie", "tv", "anime"];
    const normalizedType = contentType.toLowerCase();

    if (!validTypes.includes(normalizedType)) {
      return NextResponse.json(
        { error: `Invalid contentType. Must be one of: ${validTypes.join(", ")}` },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Debug: Verify model has the correct schema
    console.log("WatchlistItem schema paths:", 
      Object.keys(WatchlistItemModel.schema.paths));

    const query = {
      userId: new mongoose.Types.ObjectId(session.userId),
      contentId,
      contentType: normalizedType
    };

    console.log("Executing query:", query);

    const exists = await WatchlistItemModel.findOne(query);

    console.log("Query result:", exists ? "Found" : "Not found");

    return NextResponse.json({ inWatchlist: !!exists });
    
  } catch (error) {
    console.error("Error in watchlist check:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}

