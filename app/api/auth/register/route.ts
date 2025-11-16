
import { NextResponse } from "next/server";
import { hash } from "bcrypt";
import { getSupabaseServerClient } from "@/lib/services/supabase/server";

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json({ message: "Email, password, and name are required" }, { status: 400 });
    }

    const supabase = await getSupabaseServerClient();

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (existingUser) {
      return NextResponse.json({ message: "User with this email already exists" }, { status: 409 });
    }

    const hashedPassword = await hash(password, 10);

    const { data: newUser, error } = await supabase
      .from("users")
      .insert([
        {
          email,
          hashed_password: hashedPassword,
          name,
          is_active: false, // Users are inactive by default
        },
      ])
      .select("id")
      .single();

    if (error) {
      console.error("Error creating user:", error);
      return NextResponse.json({ message: "Failed to create user" }, { status: 500 });
    }

    return NextResponse.json({ message: "User created successfully. Please wait for admin approval.", userId: newUser.id }, { status: 201 });

  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
