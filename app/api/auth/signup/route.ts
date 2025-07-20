import { NextResponse } from 'next/server';
import connectToDatabase from '../../../../lib/mongodb'; // Adjust path if needed
import { UserModel } from '../../../../models/User';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, username, password, displayName } = body;

    if (!email || !username || !password || !displayName) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    await connectToDatabase();

    // Check if user already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new UserModel({
      email,
      username,
      displayName,
      // Store hashed password, you can add password field in your User schema accordingly
      password: hashedPassword,
      preferences: {
        language: 'en',
        theme: 'light',
        timezone: 'UTC',
        dateFormat: 'MM/DD/YYYY',
      },
      notifications: {
        emailNotifications: true,
        pushNotifications: true,
        friendRequests: true,
        newReleases: true,
        recommendations: true,
        weeklyDigest: true,
      },
      privacy: {
        profileVisibility: 'public',
        showWatchlist: true,
        showFavorites: true,
        allowFriendRequests: true,
        showOnlineStatus: true,
      }
    });

    await newUser.save();

    return NextResponse.json({ message: 'User created successfully' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
