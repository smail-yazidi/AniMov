// /api/watchlist/route.ts
import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb"; // Adjust path if different
import { WatchlistItemModel, IWatchlistItem } from "@/models/WatchlistItem"; // Adjust path if different
import mongoose from "mongoose";
import { getSession } from "@/lib/session-store"; // Adjust path if different

// Helper function to get userId from the request (similar to your Favorites route)
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

// GET handler: Fetch all watchlist items for the authenticated user, or check if a specific item is in watchlist
export async function GET(req: Request) {
    console.log("GET /api/watchlist called.");
    await connectToDatabase();

    try {
        const userId = await getUserIdFromRequest(req);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized: Invalid or missing session" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const contentId = searchParams.get("contentId");
        const contentType = searchParams.get("contentType");

        if (contentId && contentType) {
            // Check if a specific item exists in the watchlist
            const exists = await WatchlistItemModel.findOne({
                userId: new mongoose.Types.ObjectId(userId),
                contentId,
                contentType,
            });
            return NextResponse.json({ inWatchlist: !!exists });
        } else {
            // Fetch all watchlist items for the user
            const watchlistItems = await WatchlistItemModel.find({
                userId: new mongoose.Types.ObjectId(userId),
            }).sort({ createdAt: -1 }); // Sort by creation date, newest first
            return NextResponse.json(watchlistItems);
        }
    } catch (error) {
        console.error("Error fetching watchlist items:", error);
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
        }
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// POST handler: Add a new item to the watchlist
export async function POST(req: Request) {
    console.log("POST /api/watchlist called.");
    await connectToDatabase();

    try {
        const userId = await getUserIdFromRequest(req);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized: Invalid or missing session" }, { status: 401 });
        }

        const body = await req.json();
        const { contentId, contentType, status, progress } = body;

        if (!contentId || !contentType) {
            return NextResponse.json({ error: "Missing contentId or contentType" }, { status: 400 });
        }

        // Validate contentType against the enum
        if (!["movie", "tv", "anime"].includes(contentType)) {
            return NextResponse.json({ error: "Invalid contentType. Must be 'movie', 'tv', or 'anime'." }, { status: 400 });
        }

        // Check if item already exists in watchlist to prevent duplicates
        const existingItem = await WatchlistItemModel.findOne({
            userId: new mongoose.Types.ObjectId(userId),
            contentId,
            contentType,
        });

        if (existingItem) {
            return NextResponse.json({ message: "Item already in watchlist" }, { status: 200 }); // Or 409 Conflict
        }

        const newWatchlistItem = new WatchlistItemModel({
            userId: new mongoose.Types.ObjectId(userId),
            contentId,
            contentType,
            status: status || "plan-to-watch", // Default status
            progress: progress || "",
        });

        await newWatchlistItem.save();
        console.log("Added to watchlist:", newWatchlistItem);
        return NextResponse.json(newWatchlistItem, { status: 201 });
    } catch (error) {
        console.error("Error adding to watchlist:", error);
        // Handle unique constraint error (e.g., duplicate entry)
        if (error instanceof Error && error.name === 'MongoServerError' && (error as any).code === 11000) {
            return NextResponse.json({ error: "Item already exists in watchlist." }, { status: 409 });
        }
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
        }
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// PUT handler: Update an existing watchlist item (e.g., status, progress)
export async function PUT(req: Request) {
    console.log("PUT /api/watchlist called.");
    await connectToDatabase();

    try {
        const userId = await getUserIdFromRequest(req);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized: Invalid or missing session" }, { status: 401 });
        }

        const body = await req.json();
        const { _id, status, progress } = body; // Expecting the MongoDB _id of the watchlist item

        if (!_id) {
            return NextResponse.json({ error: "Missing _id for watchlist item update" }, { status: 400 });
        }

        const updateFields: { status?: string; progress?: string } = {};
        if (status) {
            // Validate status against the enum
            if (!["plan-to-watch", "watching", "completed", "on-hold", "dropped"].includes(status)) {
                return NextResponse.json({ error: "Invalid status value." }, { status: 400 });
            }
            updateFields.status = status;
        }
        if (progress !== undefined) { // Allow empty string for progress
            updateFields.progress = progress;
        }

        if (Object.keys(updateFields).length === 0) {
            return NextResponse.json({ message: "No fields to update provided" }, { status: 400 });
        }

        const updatedItem = await WatchlistItemModel.findOneAndUpdate(
            { _id: new mongoose.Types.ObjectId(_id), userId: new mongoose.Types.ObjectId(userId) },
            { $set: updateFields },
            { new: true } // Return the updated document
        );

        if (!updatedItem) {
            return NextResponse.json({ error: "Watchlist item not found or unauthorized to update" }, { status: 404 });
        }

        console.log("Updated watchlist item:", updatedItem);
        return NextResponse.json(updatedItem, { status: 200 });
    } catch (error) {
        console.error("Error updating watchlist item:", error);
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
        }
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// DELETE handler: Remove an item from the watchlist
export async function DELETE(req: Request) {
    console.log("DELETE /api/watchlist called.");
    await connectToDatabase();

    try {
        const userId = await getUserIdFromRequest(req);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized: Invalid or missing session" }, { status: 401 });
        }

        const body = await req.json();
        const { _id } = body; // Expecting the MongoDB _id of the watchlist item

        if (!_id) {
            return NextResponse.json({ error: "Missing watchlist item ID for deletion" }, { status: 400 });
        }

        const deleted = await WatchlistItemModel.findOneAndDelete({
            _id: new mongoose.Types.ObjectId(_id),
            userId: new mongoose.Types.ObjectId(userId), // Security check: ensure item belongs to user
        });

        if (!deleted) {
            return NextResponse.json({ error: "Watchlist item not found or unauthorized to delete" }, { status: 404 });
        }

        console.log(`Watchlist item ${_id} successfully removed.`);
        return NextResponse.json({ message: "Watchlist item removed successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error removing watchlist item:", error);
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
        }
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}