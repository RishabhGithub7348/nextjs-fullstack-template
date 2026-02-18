import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

// Example table — modify or replace this for your project
export const items = sqliteTable("items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

// Add more tables here:
// export const users = sqliteTable("users", { ... });
