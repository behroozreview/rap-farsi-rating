import {
  check,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const userRoleEnum = pgEnum("user_role", ["admin", "viewer"]);

export const songs = pgTable(
  "songs",
  {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 200 }).notNull(),
    artist: varchar("artist", { length: 120 }).default("").notNull(),
    url: text("url").notNull(),
    rating: integer("rating").notNull(),
    persianYear: integer("persian_year").notNull(),
    notes: text("notes"),
    importedFrom: varchar("imported_from", { length: 120 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    check("rating_range", sql`${table.rating} >= 1 AND ${table.rating} <= 9`),
    check(
      "persian_year_range",
      sql`${table.persianYear} >= 1350 AND ${table.persianYear} <= 1499`
    ),
    unique("songs_title_artist_year_unique").on(
      table.title,
      table.artist,
      table.persianYear
    ),
  ]
);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  role: userRoleEnum("role").default("viewer").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const importLogs = pgTable("import_logs", {
  id: serial("id").primaryKey(),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  importedCount: integer("imported_count").default(0).notNull(),
  failedCount: integer("failed_count").default(0).notNull(),
  errors: jsonb("errors").$type<Array<{ row: number; error: string }>>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
