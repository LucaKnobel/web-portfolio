import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Create or connect to SQLite database using environment variable
const sqlite = new Database(process.env.DATABASE_URL!);

// Enable WAL mode for better performance
sqlite.pragma("journal_mode = WAL");

// Initialize Drizzle ORM with schema
export const db = drizzle(sqlite, { schema });