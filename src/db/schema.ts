import { sqliteTable as table } from "drizzle-orm/sqlite-core";
import * as t from "drizzle-orm/sqlite-core";

/*  Rate limiting table to track contact form submissions per day */
export const rateLimits = table("rate_limits", {
    id: t.int().primaryKey({ autoIncrement: true }),
    date: t.text().notNull().unique(),           /*  YYYY-MM-D */
    count: t.int().notNull().default(0),         /*  Submissions */
});

export type RateLimit = typeof rateLimits.$inferSelect;
export type InsertRateLimit = typeof rateLimits.$inferInsert;

