import { NextResponse } from "next/server";
import { checkPermission } from "@/lib/services/auth/permissions";
import { createShareToken } from "@/lib/data/shareToken";

export async function POST(request: Request, context: { params: { id: string } }) {
  try{
    const userId = await context.params.id;
    const hasPermission = await checkPermission('users.generate_share_link'); // Use the new permission
    if (!hasPermission) {
      console.warn(`Forbidden: User lacks 'users.generate_share_link' permission for userId: ${userId}`);
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Expecting duration, region, and timezone from the request body
    const { duration, region, timezone } = await request.json();

    if (!duration) {
      console.error(`Bad Request: Duration is required for userId: ${userId}`);
      return NextResponse.json({ message: "Duration is required" }, { status: 400 });
    }

    // Convert numeric duration to string format expected by createShareToken (e.g., '24h')
    const formattedDuration = `${duration}h`;

    // Call the createShareToken action
    const shareToken = await createShareToken(userId, formattedDuration, region, timezone);

    // Construct the share link using the generated token
    const shareLink = `${process.env.NEXT_PUBLIC_BASE_URL}/share/${shareToken.token}`;

    return NextResponse.json({ shareLink }, { status: 201 });

  } catch (error: any) {
    console.error(`Share link creation error for userId: ${userId}:`, error.message, error.stack);
    return NextResponse.json({ message: error.message || "Internal Server Error" }, { status: 500 });
  }
}
