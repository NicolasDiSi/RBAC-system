import { NextResponse } from "next/server";
import { updateUserPassword } from "@/app/actions/user";

export async function POST(request: Request) {
  try {
    const { userId, password } = await request.json();

    if (!userId || !password) {
      return NextResponse.json({ message: "User ID and password are required" }, { status: 400 });
    }

    await updateUserPassword(userId, password);

    return NextResponse.json({ message: "Password set successfully. Please wait for admin approval." }, { status: 200 });

  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
