
import { NextResponse } from "next/server";
import { compare } from "bcrypt";
import { getSupabaseServiceRoleClient } from "@/lib/services/supabase/server";
import { createSession } from "@/lib/services/auth/session";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
    }

    const supabase = getSupabaseServiceRoleClient();

    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();


    if (error) {
      console.error("Error fetching credentials", error);
    }

    if (!user) {
      return NextResponse.json({ message: "Credentials not found" }, { status: 401 });
    }

    if (!user.hashed_password) {
        return NextResponse.json({ message: "Login with your social provider" }, { status: 401 });
    }

    const isValid = await compare(password, user.hashed_password);

    if (!isValid) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    if (!user.is_active) {
      return NextResponse.json({ message: "Account is not active. Please contact an administrator." }, { status: 403 });
    }

    // Create a session for the user
    await createSession(user.id, user.email, user.role_id);

    const { hashed_password, ...userWithoutPassword } = user;


    return NextResponse.json({ message: "Login successful", user: userWithoutPassword }, { status: 200 });

  } catch (error) {
    console.error("Login error:", error);
    // Don't return detailed error messages in production
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
