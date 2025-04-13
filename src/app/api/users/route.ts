import { NextRequest, NextResponse } from "next/server";
import User from "@/model/user.model";
import connectDB from "@/utils/db";

export async function GET() {
  try {
    await connectDB();
    const users = await User.find({});
    return NextResponse.json({ users }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { name, email, password, role } = await request.json();

    // Validate required fields
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: "Name, email, password and role are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
      role,
    });

    return NextResponse.json(
      { message: "User created successfully", user },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
