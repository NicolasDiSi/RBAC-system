
import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/services/supabase/server";
import { checkPermission } from "@/lib/services/auth/permissions";
import { randomBytes } from "crypto";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const hasPermission = await checkPermission('users.share');
    if (!hasPermission) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const userId = params.id;
    const { duration, region } = await request.json(); // duration in hours

    if (!duration || !region) {
      return NextResponse.json({ message: "Duration and region are required" }, { status: 400 });
    }

    const supabase = await getSupabaseServerClient();

    // Generate a secure, URL-safe token
    const token = randomBytes(32).toString('base64url');
    const expires_at = new Date(Date.now() + duration * 60 * 60 * 1000).toISOString();

    const { error } = await supabase.from("secure_shares").insert({
      user_id: userId,
      token,
      expires_at,
      region_scope: region,
    });

    if (error) {
      console.error("Error creating share link:", error);
      return NextResponse.json({ message: "Failed to create share link" }, { status: 500 });
    }

    const shareLink = `${process.env.NEXT_PUBLIC_BASE_URL}/share/${token}`;

    return NextResponse.json({ shareLink });

  } catch (error) {
    console.error("Share link creation error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
