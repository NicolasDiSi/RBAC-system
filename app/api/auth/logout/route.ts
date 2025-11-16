import { NextResponse } from "next/server"
import { deleteSession } from "@/lib/services/auth/session"

export async function POST() {
  await deleteSession()
  return NextResponse.redirect(new URL("/auth/login", process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"))
}
