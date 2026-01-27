
import { NextResponse } from "next/server";
import { checkPermission } from "@/lib/services/auth/permissions";
import * as UserDAO from "@/lib/data/user";
import { randomBytes } from "crypto";

export async function POST(request: Request) {
  try {
    const hasPermission = await checkPermission('users.create');
    if (!hasPermission) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const { email, name } = await request.json();

    if (!email || !name) {
      return NextResponse.json({ message: "Email and name are required" }, { status: 400 });
    }

    const existingUser = await UserDAO.getUserByEmail(email);

    if (existingUser) {
      return NextResponse.json({ message: "User with this email already exists" }, { status: 409 });
    }

    // Generate a random password
    // UserDAO.createUser will hash this password
    const password = randomBytes(16).toString('hex');

    const [newUser] = await UserDAO.createUser({
      email,
      hashedPassword: password,
      name,
      isActive: true, // Users created by admins are active by default
      roleId: null,
    });

    // For now, we are not sending the password to the client.
    // The next step will be to implement the secure sharing feature.
    return NextResponse.json({ message: "User created successfully", userId: newUser.id }, { status: 201 });

  } catch (error) {
    console.error("Admin user creation error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
