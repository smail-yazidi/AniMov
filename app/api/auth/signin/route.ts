import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/connectToDatabase";
import User from "@/models/User"; // Your Mongoose user model
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const { email, password } = await req.json();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Return success response (e.g., user data or token)
    return NextResponse.json({ message: "Signed in successfully" }, { status: 200 });
  } catch (error) {
    console.error("Signin error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
