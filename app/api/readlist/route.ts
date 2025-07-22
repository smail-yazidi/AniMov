// /api/readlist/route.ts
import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb"; // Adjust path if different
// Changed import from ReadlistItem to IReadingListItem
import { ReadingListItemModel, IReadingListItem } from "@/models/ReadlistItem"; // Adjust path if different
import mongoose from "mongoose";
import { getSession } from "@/lib/session-store"; // Adjust path if different

// Helper function to get userId from the request
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

// GET handler: Fetch all readlist items for the authenticated user, or check if a specific item is in readlist
export async function GET(req: Request) {
  console.log("GET /api/readlist called.");
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
      // Check if a specific item exists in the readlist
      const exists = await ReadingListItemModel.findOne({ // Updated model name
        userId: new mongoose.Types.ObjectId(userId),
        contentId,
        contentType,
      });
      return NextResponse.json({ inReadlist: !!exists });
    } else {
      // Fetch all readlist items for the user
      const readlistItems = await ReadingListItemModel.find({ // Updated model name
        userId: new mongoose.Types.ObjectId(userId),
      }).sort({ createdAt: -1 }); // Sort by creation date, newest first
      return NextResponse.json(readlistItems);
    }
  } catch (error) {
    console.error("Error fetching readlist items:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST handler: Add a new item to the readlist
export async function POST(req: Request) {
  console.log("POST /api/readlist called.");
  await connectToDatabase();

  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized: Invalid or missing session" }, { status: 401 });
    }

    // Destructure only the fields present in the new IReadingListItem model
    const body: Partial<IReadingListItem> = await req.json();
    const { contentId, contentType, status, like } = body; // Removed title, poster, rating, progress, notes, dates

    // Validate only contentId and contentType (status has a default in the model)
    if (!contentId || !contentType) {
      return NextResponse.json({ error: "Missing contentId or contentType" }, { status: 400 }); // Updated error message
    }

    // Validate contentType against the enum
    if (!["manga", "book"].includes(contentType)) {
      return NextResponse.json({ error: "Invalid contentType. Must be 'manga' or 'book'." }, { status: 400 });
    }

    // Check if item already exists in readlist to prevent duplicates
    const existingItem = await ReadingListItemModel.findOne({ // Updated model name
      userId: new mongoose.Types.ObjectId(userId),
      contentId,
      contentType,
    });

    if (existingItem) {
      return NextResponse.json({ message: "Item already in readlist" }, { status: 200 }); // Or 409 Conflict
    }

    // Create new item with only the relevant fields
    const newReadlistItem = new ReadingListItemModel({ // Updated model name
      userId: new mongoose.Types.ObjectId(userId),
      contentId,
      contentType,
      // Status and like have defaults in the Mongoose schema,
      // but you can set them if provided in the request body.
      status: status, // Will use default if status is undefined in body
      like: like,     // Will use default if like is undefined in body
    });

    await newReadlistItem.save();
    console.log("Added to readlist:", newReadlistItem);
    return NextResponse.json(newReadlistItem, { status: 201 });
  } catch (error) {
    console.error("Error adding to readlist:", error);
    if (error instanceof Error && error.name === 'MongoServerError' && (error as any).code === 11000) {
      return NextResponse.json({ error: "Item already exists in readlist." }, { status: 409 });
    }
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PUT handler: Update an existing readlist item
export async function PUT(req: Request) {
  console.log("PUT /api/readlist called.");
  await connectToDatabase();

  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized: Invalid or missing session" }, { status: 401 });
    }

    // Expecting _id, and only status or like for updates
    const body: Partial<IReadingListItem> & { _id: string } = await req.json();
    const { _id, status, like } = body; // Only allow status and like updates

    if (!_id || !mongoose.Types.ObjectId.isValid(_id)) {
      return NextResponse.json({ error: "Invalid or missing _id for readlist item update" }, { status: 400 });
    }

    const updateFields: Partial<IReadingListItem> = {};

    if (status !== undefined) { // Check for undefined to allow setting to "plan-to-read" or other valid states
      if (!["plan-to-read", "reading", "completed", "on-hold", "dropped"].includes(status)) {
        return NextResponse.json({ error: "Invalid status value." }, { status: 400 });
      }
      updateFields.status = status;
    }
    if (like !== undefined) { // Allow setting like to true or false
      updateFields.like = like;
    }

    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json({ message: "No fields to update provided" }, { status: 400 });
    }

    const updatedItem = await ReadingListItemModel.findOneAndUpdate( // Updated model name
      { _id: new mongoose.Types.ObjectId(_id), userId: new mongoose.Types.ObjectId(userId) },
      { $set: updateFields },
      { new: true } // Return the updated document
    );

    if (!updatedItem) {
      return NextResponse.json({ error: "Readlist item not found or unauthorized to update" }, { status: 404 });
    }

    console.log("Updated readlist item:", updatedItem);
    return NextResponse.json(updatedItem, { status: 200 });
  } catch (error) {
    console.error("Error updating readlist item:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE handler: Remove an item from the readlist
export async function DELETE(req: Request) {
  console.log("DELETE /api/readlist called.");
  await connectToDatabase();

  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized: Invalid or missing session" }, { status: 401 });
    }

    const body: { _id: string } = await req.json();
    const { _id } = body;

    if (!_id || !mongoose.Types.ObjectId.isValid(_id)) {
      return NextResponse.json({ error: "Invalid or missing readlist item ID for deletion" }, { status: 400 });
    }

    const deleted = await ReadingListItemModel.findOneAndDelete({ // Updated model name
      _id: new mongoose.Types.ObjectId(_id),
      userId: new mongoose.Types.ObjectId(userId), // Security check
    });

    if (!deleted) {
      return NextResponse.json({ error: "Readlist item not found or unauthorized to delete" }, { status: 404 });
    }

    console.log(`Readlist item ${_id} successfully removed.`);
    return NextResponse.json({ message: "Readlist item removed successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error removing readlist item:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
