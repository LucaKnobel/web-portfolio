import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import { sqlite } from "../db/index.js";

export const testCounter = defineAction({
    accept: "form",
    input: z.object({}),
    
    handler: async () => {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        
        try {
            // Use raw SQL for UPSERT operation
            const result = sqlite.prepare(`
                INSERT INTO rate_limits (date, count) 
                VALUES (?, 1)
                ON CONFLICT(date) DO UPDATE SET 
                    count = count + 1,
                    updated_at = datetime('now')
                RETURNING count
            `).get(today) as { count: number } | undefined;

            if (result) {
                return { 
                    success: true, 
                    count: result.count,
                    date: today 
                };
            } else {
                throw new Error("No result returned");
            }
        } catch (error) {
            console.error("Database error:", error);
            return { 
                success: false, 
                error: "Database error occurred" 
            };
        }
    }
});