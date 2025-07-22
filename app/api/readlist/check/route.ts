// /api/readlist/check/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session-store"; // Adjust path if different
import connectToDatabase from "@/lib/mongodb"; // Adjust path if different
import { ReadingListItemModel } from "@/models/ReadlistItem"; // Adjust path if different
import mongoose from "mongoose"; // Import mongoose for ObjectId

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
  const contentType = searchParams.get("contentType"); // "manga" | "book"

  if (!contentId || !contentType) {
    return NextResponse.json(
      { error: "Missing contentId or contentType" },
      { status: 400 }
    );
  }

  // Optional: Validate content type against your ReadlistItemModel enum
  if (!["manga", "book"].includes(contentType)) {
    return NextResponse.json(
      { error: "Invalid contentType for readlist check" },
      { status: 400 }
    );
  }

  await connectToDatabase();

  try {
    const exists = await ReadingListItemModel.findOne({
      userId: new mongoose.Types.ObjectId(session.userId), // Convert userId to ObjectId
      contentId,
      contentType,
    });

    return NextResponse.json({ inReadlist: !!exists });
  } catch (error) {
    console.error("Error checking readlist item existence:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}