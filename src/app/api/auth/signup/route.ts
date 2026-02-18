import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb, saveDb } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { signToken, createAuthCookie } from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json();
  const { name, email, password } = body;

  if (!name || !email || !password) {
    return NextResponse.json(
      { error: "Name, email, and password are required" },
      { status: 400 }
    );
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: "Password must be at least 6 characters" },
      { status: 400 }
    );
  }

  const db = await getDb();

  // Check if email already exists
  const existing = db.select().from(users).where(eq(users.email, email)).get();

  if (existing) {
    return NextResponse.json(
      { error: "Email already registered" },
      { status: 409 }
    );
  }

  // Hash password and create user
  const hashedPassword = await bcrypt.hash(password, 10);
  db.insert(users)
    .values({ name, email, password: hashedPassword })
    .run();
  saveDb();

  // Get the created user
  const user = db.select().from(users).where(eq(users.email, email)).get();

  if (!user) {
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }

  // Create JWT and set cookie
  const token = signToken({ id: user.id, name: user.name, email: user.email });
  const response = NextResponse.json(
    { user: { id: user.id, name: user.name, email: user.email } },
    { status: 201 }
  );
  response.headers.set("Set-Cookie", createAuthCookie(token));

  return response;
}
