import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { UserModel } from "@/models/User"; // Make sure this matches your export
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    console.log("Request received");

    const bodyText = await req.text();
    console.log("Raw body:", bodyText);

    const { email, password } = JSON.parse(bodyText);
    console.log("Parsed email:", email);
    console.log("Parsed password:", password);

    await connectToDatabase();

    const user = await UserModel.findOne({ email });
    console.log("User found:", !!user);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log("Password valid?", isPasswordValid);

    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    return NextResponse.json({ message: "Signed in successfully" }, { status: 200 });
  } catch (error) {
    console.error("Signin error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

