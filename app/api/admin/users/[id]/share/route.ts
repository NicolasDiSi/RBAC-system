import { NextResponse } from "next/server";
import { checkPermission } from "@/lib/services/auth/permissions";
import { createShareToken } from "@/app/actions/shareToken"; // Import the new action

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const hasPermission = await checkPermission('users.generate_share_link'); // Use the new permission
    if (!hasPermission) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const userId = params.id;
    // Expecting duration, region, and timezone from the request body
    const { duration, region, timezone } = await request.json();

    if (!duration) {
      return NextResponse.json({ message: "Duration is required" }, { status: 400 });
    }

    // Call the createShareToken action
    const shareToken = await createShareToken(userId, duration, region, timezone);

    // Construct the share link using the generated token
    const shareLink = `${process.env.NEXT_PUBLIC_BASE_URL}/share/${shareToken.token}`;

    return NextResponse.json({ shareLink }, { status: 201 });

  } catch (error) {
    console.error("Share link creation error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
