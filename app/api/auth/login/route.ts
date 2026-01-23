import { NextResponse } from "next/server";
import { compare } from "bcrypt";
import { createSession } from "@/lib/services/auth/session";
import { getUserByEmail } from "@/lib/data/user";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
    }

    const user = await getUserByEmail(email);

    if (!user) {
      return NextResponse.json({ message: "Credentials not found" }, { status: 401 });
    }

    if (!user.hashedPassword) {
        return NextResponse.json({ message: "Login with your social provider" }, { status: 401 });
    }

    const isValid = await compare(password, user.hashedPassword);

    if (!isValid) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    if (!user.isActive) {
      return NextResponse.json({ message: "Account is not active. Please contact an administrator." }, { status: 403 });
    }

    // Create a session for the user
    await createSession(user.id, user.email, user.roleId);

    const { hashedPassword, ...userWithoutPassword } = user;


    return NextResponse.json({ message: "Login successful", user: userWithoutPassword }, { status: 200 });

  } catch (error) {
    console.error("Login error:", error);
    // Don't return detailed error messages in production
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}