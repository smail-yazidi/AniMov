// /api/count/route.ts
import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb"; // Your DB connection utility
import { FavoriteItemModel } from "@/models/FavoriteItem"; // Your FavoriteItem model
import { ReadingListItemModel } from "@/models/ReadingListItem"; // Your ReadingListItem model
import { WatchlistItemModel } from "@/models/WatchlistItem"; // Your WatchlistItem model
import { getSession } from "@/lib/session-store"; // Your session store utility
import mongoose from "mongoose"; // Needed for mongoose.Types.ObjectId

// Helper function to get userId from the request (from your provided code)
async function getUserIdFromRequest(req: Request): Promise<string | null> {
  const authHeader = req.headers.get("authorization");
  const sessionId = authHeader?.replace("Bearer ", "");

  if (!sessionId) {
    return null;
  }

  try {
    const session = await getSession(sessionId);
    return session ? session.userId : null;
  } catch (e) {
    console.error("Error retrieving session:", e);
    return null;
  }
}

export async function GET(req: Request) {
  console.log("GET /api/count called.");
  await connectToDatabase();

  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      console.warn("Unauthorized attempt to get counts: Missing or invalid session.");
      return NextResponse.json({ error: "Unauthorized: Invalid or missing session" }, { status: 401 });
    }
    console.log(`Fetching counts for user ID: ${userId}`);

    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Concurrently fetch counts for all categories
    const [favoritesCount, readlistCount, watchlistCount] = await Promise.all([
      FavoriteItemModel.countDocuments({ userId: userObjectId }),
      ReadingListItemModel.countDocuments({ userId: userObjectId }),
      WatchlistItemModel.countDocuments({ userId: userObjectId }),
    ]);

    console.log(`Counts for user ${userId}:
      Favorites: ${favoritesCount},
      Readlist: ${readlistCount},
      Watchlist: ${watchlistCount}`);

    return NextResponse.json(
      {
        favoritesCount,
        readlistCount,
        watchlistCount,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching user counts:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}