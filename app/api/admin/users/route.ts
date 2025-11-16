
import { NextResponse } from "next/server";
import { hash } from "bcrypt";
import { getSupabaseServerClient } from "@/lib/services/supabase/server";
import { checkPermission } from "@/lib/services/auth/permissions";
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

    const supabase = await getSupabaseServerClient();

    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (existingUser) {
      return NextResponse.json({ message: "User with this email already exists" }, { status: 409 });
    }

    // Generate a random password
    const password = randomBytes(16).toString('hex');
    const hashedPassword = await hash(password, 10);

    const { data: newUser, error } = await supabase
      .from("users")
      .insert([
        {
          email,
          hashed_password: hashedPassword,
          name,
          is_active: true, // Users created by admins are active by default
        },
      ])
      .select("id")
      .single();

    if (error) {
      console.error("Error creating user:", error);
      return NextResponse.json({ message: "Failed to create user" }, { status: 500 });
    }

    // For now, we are not sending the password to the client.
    // The next step will be to implement the secure sharing feature.
    return NextResponse.json({ message: "User created successfully", userId: newUser.id }, { status: 201 });

  } catch (error) {
    console.error("Admin user creation error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
