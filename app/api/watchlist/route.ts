// src/app/api/watchlist/route.ts

import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb"; // Assuming this connects to your MongoDB
import { WatchlistItemModel } from "@/models/WatchlistItem"; // We will create this Mongoose model next
import mongoose from "mongoose"; // Import mongoose for ObjectId conversion
import { getSession } from "@/lib/session-store"; // Assuming this retrieves user session

// Helper function to get userId from the request (can be shared or duplicated from favorites)
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
    console.error("Error retrieving session in getUserIdFromRequest:", e);
    return null;
  }
}

// GET /api/watchlist - Fetch user's watchlist items
export async function GET(req: Request) {
  console.log("GET /api/watchlist called.");
  await connectToDatabase();

  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      console.warn("Unauthorized attempt to fetch watchlist: Missing or invalid session.");
      return NextResponse.json({ error: "Unauthorized: Invalid or missing session" }, { status: 401 });
    }
    console.log(`Fetching watchlist for User ID: ${userId}`);

    // Find all watchlist items for the current user
    const watchlistItems = await WatchlistItemModel.find({
      userId: new mongoose.Types.ObjectId(userId),
    });

    console.log(`Found ${watchlistItems.length} watchlist items for user ${userId}.`);
    return NextResponse.json(watchlistItems, { status: 200 });

  } catch (error) {
    console.error("Error fetching watchlist:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST /api/watchlist - Add an item to watchlist
export async function POST(req: Request) {
  console.log("POST /api/watchlist called.");
  await connectToDatabase();

  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      console.warn("Unauthorized attempt to add to watchlist: Missing or invalid session.");
      return NextResponse.json({ error: "Unauthorized: Invalid or missing session" }, { status: 401 });
    }
    console.log(`Adding to watchlist for User ID: ${userId}`);

    const body = await req.json();
    const { contentId, contentType, status, progress } = body;

    if (!contentId || !contentType) {
      return NextResponse.json({ error: "Missing contentId or contentType" }, { status: 400 });
    }

    // Ensure content type is one of the allowed watchlist types
    if (!["movie", "tv", "anime"].includes(contentType)) {
      return NextResponse.json({ error: "Invalid contentType for watchlist. Must be 'movie', 'tv', or 'anime'." }, { status: 400 });
    }

    // Check if the item already exists in the watchlist for this user
    const existingItem = await WatchlistItemModel.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      contentId: contentId,
      contentType: contentType,
    });

    if (existingItem) {
      console.log(`Item (ID: ${contentId}, Type: ${contentType}) already in watchlist for user ${userId}.`);
      return NextResponse.json({ message: "Item already in watchlist", item: existingItem }, { status: 200 });
    }

    const newItem = new WatchlistItemModel({
      userId: new mongoose.Types.ObjectId(userId),
      contentId,
      contentType,
      status: status || "plan-to-watch", // Default status if not provided
      progress: progress || "",
    });

    await newItem.save();
    console.log(`Item (ID: ${contentId}, Type: ${contentType}) added to watchlist for user ${userId}.`);
    return NextResponse.json({ message: "Item added to watchlist", item: newItem }, { status: 201 });

  } catch (error) {
    console.error("Error adding to watchlist:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE /api/watchlist - Remove an item from watchlist
export async function DELETE(req: Request) {
  console.log("DELETE /api/watchlist called.");
  await connectToDatabase();

  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      console.warn("Unauthorized attempt to remove from watchlist: Missing or invalid session.");
      return NextResponse.json({ error: "Unauthorized: Invalid or missing session" }, { status: 401 });
    }
    console.log(`Removing from watchlist for User ID: ${userId}`);

    const body = await req.json();
    const { _id } = body; // Expect the MongoDB _id of the WatchlistItem document

    if (!_id) {
      return NextResponse.json({ error: "Missing watchlist item ID for deletion" }, { status: 400 });
    }
    console.log(`Attempting to delete watchlist item with _id: ${_id}`);

    // Find and delete the watchlist item, ensuring it belongs to the current user
    const deleted = await WatchlistItemModel.findOneAndDelete({
      _id: new mongoose.Types.ObjectId(_id),
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (!deleted) {
      console.warn(`Watchlist item with _id ${_id} not found or does not belong to user ${userId}.`);
      return NextResponse.json({ error: "Watchlist item not found or unauthorized to delete" }, { status: 404 });
    }

    console.log(`Watchlist item ${_id} successfully removed.`);
    return NextResponse.json({ message: "Watchlist item removed successfully" }, { status: 200 });

  } catch (error) {
    console.error("Error removing from watchlist:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PATCH /api/watchlist - Update status or progress of a watchlist item
export async function PATCH(req: Request) {
  console.log("PATCH /api/watchlist called.");
  await connectToDatabase();

  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      console.warn("Unauthorized attempt to update watchlist item: Missing or invalid session.");
      return NextResponse.json({ error: "Unauthorized: Invalid or missing session" }, { status: 401 });
    }
    console.log(`Updating watchlist for User ID: ${userId}`);

    const body = await req.json();
    const { _id, status, progress } = body; // Expect _id and fields to update

    if (!_id) {
      return NextResponse.json({ error: "Missing watchlist item ID for update" }, { status: 400 });
    }

    const updateFields: { status?: string; progress?: string } = {};
    if (status) {
      // Validate status if you have a predefined list
      const validStatuses = ["plan-to-watch", "watching", "completed", "on-hold", "dropped"];
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: `Invalid status: ${status}. Must be one of ${validStatuses.join(", ")}` }, { status: 400 });
      }
      updateFields.status = status;
    }
    if (progress !== undefined) { // Allow progress to be an empty string
      updateFields.progress = progress;
    }

    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json({ error: "No valid fields provided for update (status or progress)" }, { status: 400 });
    }

    // Find and update the watchlist item, ensuring it belongs to the current user
    const updatedItem = await WatchlistItemModel.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(_id), userId: new mongoose.Types.ObjectId(userId) },
      { $set: updateFields },
      { new: true } // Return the updated document
    );

    if (!updatedItem) {
      console.warn(`Watchlist item with _id ${_id} not found or does not belong to user ${userId}.`);
      return NextResponse.json({ error: "Watchlist item not found or unauthorized to update" }, { status: 404 });
    }

    console.log(`Watchlist item ${_id} updated successfully:`, updatedItem);
    return NextResponse.json({ message: "Watchlist item updated successfully", item: updatedItem }, { status: 200 });

  } catch (error) {
    console.error("Error updating watchlist item:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}