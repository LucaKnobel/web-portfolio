import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { rateLimits } from "./schema.js";

// Create or connect to SQLite database
export const sqlite = new Database("./data/portfolio.db");

// Enable WAL mode for better performance
sqlite.pragma("journal_mode = WAL");

// Initialize Drizzle ORM
export const db = drizzle(sqlite, { schema: { rateLimits } });

// Initialize database (create tables if they don't exist)
export function initDatabase() {
    // Create rate_limits table with UNIQUE constraint on date
    sqlite.exec(`
        CREATE TABLE IF NOT EXISTS rate_limits (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL UNIQUE,
            count INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        )
    `);
}

// Initialize on import
initDatabase();