import { NextResponse } from "next/server";
import { getAuthUser, clearAuthCookie } from "@/lib/auth";

// GET /api/auth/me — get current user from JWT cookie
export async function GET() {
  const user = await getAuthUser();

  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  return NextResponse.json({ user });
}

// DELETE /api/auth/me — logout (clear cookie)
export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.headers.set("Set-Cookie", clearAuthCookie());
  return response;
}
