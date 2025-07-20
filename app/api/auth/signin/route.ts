import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { UserModel } from "@/models/User"; // Make sure this matches your export
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    console.log("DB connected");

    const { email, password } = await req.json();
    console.log("Request body:", { email, password });

    // just send a test response to check if this works
    return NextResponse.json({ message: "Test OK" }, { status: 200 });
  } catch (error) {
    console.error("Signin error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
