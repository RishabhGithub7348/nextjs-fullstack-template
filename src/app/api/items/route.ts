import { NextResponse } from "next/server";
import { getDb, saveDb } from "@/db";
import { items } from "@/db/schema";
import { eq } from "drizzle-orm";

// GET /api/items — list all items
export async function GET() {
  const db = await getDb();
  const allItems = db.select().from(items).all();
  return NextResponse.json(allItems);
}

// POST /api/items — create a new item
export async function POST(request: Request) {
  const body = await request.json();
  const { name, description } = body;

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const db = await getDb();
  db.insert(items).values({ name, description: description || null }).run();
  saveDb();

  return NextResponse.json({ success: true }, { status: 201 });
}

// DELETE /api/items — delete an item by id (pass ?id=X)
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }

  const db = await getDb();
  db.delete(items).where(eq(items.id, parseInt(id))).run();
  saveDb();

  return NextResponse.json({ success: true });
}
