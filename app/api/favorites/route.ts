// /api/favorites/route.ts
import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { FavoriteItemModel } from "@/models/FavoriteItem";
import mongoose from "mongoose";
import { getSession } from "@/lib/session-store";

// Helper function to get userId from the request (from previous advice)
async function getUserIdFromRequest(req: Request): Promise<string | null> {
  const authHeader = req.headers.get("authorization");
  const sessionId = authHeader?.replace("Bearer ", "");

  if (!sessionId) {
    return null;
  }

  // Ensure getSession is robust and handles errors
  try {
    const session = await getSession(sessionId);
    return session ? session.userId : null;
  } catch (e) {
    console.error("Error retrieving session:", e);
    return null;
  }
}

export async function POST(req: Request) {
  console.log("POST /api/favorites called."); // Initial log
  await connectToDatabase();
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      console.warn("Unauthorized attempt to add favorite: Missing or invalid session.");
      return NextResponse.json({ error: "Unauthorized: Invalid or missing session" }, { status: 401 });
    }
    console.log(`User ID obtained: ${userId}`);

    const { contentId, contentType } = await req.json();
    console.log(`Received payload: contentId=${contentId}, contentType=${contentType}`);

    if (!contentId || !contentType) {
      console.warn("Missing required fields in favorite add request.");
      return NextResponse.json({ error: "Missing required fields: contentId or contentType" }, { status: 400 });
    }

    // Avoid duplicates
    console.log("Checking for existing favorite item...");
    const exists = await FavoriteItemModel.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      contentId,
      contentType,
    });

    if (exists) {
      console.log("Item already in favorites, returning 409.");
      return NextResponse.json({ error: "Item already in favorites" }, { status: 409 });
    }
    console.log("Item not found, proceeding to create new favorite.");

    const favorite = new FavoriteItemModel({
      userId: new mongoose.Types.ObjectId(userId),
      contentId,
      contentType,
    });

    console.log("Attempting to save new favorite item:", favorite);
    await favorite.save(); // This is the critical line
    console.log("Favorite item saved successfully:", favorite._id);

    return NextResponse.json(favorite, { status: 201 });
  } catch (error) {
    console.error("Error adding favorite:", error);
    if (error instanceof Error) {
      // Log specific Mongoose error if available
      if (error.name === 'ValidationError') {
        console.error("Mongoose Validation Error:", error.message, error.errors);
      } else if (error.name === 'MongoServerError' && (error as any).code === 11000) {
        console.error("MongoDB Duplicate Key Error (should be caught by findOne):", error.message);
      }
      return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  console.log("GET /api/favorites called."); // Debug log
  await connectToDatabase();
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      console.warn("Unauthorized attempt to get favorites: Missing or invalid session.");
      return NextResponse.json({ error: "Unauthorized: Invalid or missing session" }, { status: 401 });
    }
    console.log(`Fetching favorites for user ID: ${userId}`);

    const favorites = await FavoriteItemModel.find({
      userId: new mongoose.Types.ObjectId(userId),
    }).lean(); // Use .lean() for faster plain JavaScript objects

    console.log(`Found ${favorites.length} favorite items for user ${userId}.`);
    // Ensure you return a JSON response, even if the array is empty
    return NextResponse.json(favorites, { status: 200 });

  } catch (error) {
    console.error("Error fetching favorites:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
// ... GET and DELETE handlers (add similar verbose logging for debugging)
