import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { signToken, createAuthCookie } from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json();
  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 }
    );
  }

  const db = await getDb();
  const user = db.select().from(users).where(eq(users.email, email)).get();

  if (!user) {
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 }
    );
  }

  const validPassword = await bcrypt.compare(password, user.password);

  if (!validPassword) {
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 }
    );
  }

  // Create JWT and set cookie
  const token = signToken({ id: user.id, name: user.name, email: user.email });
  const response = NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email },
  });
  response.headers.set("Set-Cookie", createAuthCookie(token));

  return response;
}
