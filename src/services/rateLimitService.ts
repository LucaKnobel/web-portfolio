import { db } from "../db/index.js";
import { rateLimits } from "../db/schema.js";
import { eq } from "drizzle-orm";

export interface RateLimitResult {
    allowed: boolean;
    currentCount: number;
    maxLimit: number;
    resetDate: string;
}

export interface RateLimitService {
    checkLimit(date: string): Promise<RateLimitResult>;
    incrementCount(date: string): Promise<void>;
    getSwissDate(): string;
}

/**
 * Rate Limiting Service
 * Handles contact form submission limits per day
 */
export class ContactRateLimitService implements RateLimitService {
    private readonly maxDailyEmails = 10;

    /**
     * Get current date in Swiss timezone (YYYY-MM-DD)
     */
    getSwissDate(): string {
        return new Date().toLocaleDateString('de-CH', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            timeZone: 'Europe/Zurich'
        }).split('.').reverse().join('-');
    }

    /**
     * Check if rate limit is exceeded for given date
     */
    async checkLimit(date: string): Promise<RateLimitResult> {
        try {
            const currentRecord = db.select({ count: rateLimits.count })
                .from(rateLimits)
                .where(eq(rateLimits.date, date))
                .get();

            const currentCount = currentRecord?.count ?? 0;
            const allowed = currentCount < this.maxDailyEmails;

            return {
                allowed,
                currentCount,
                maxLimit: this.maxDailyEmails,
                resetDate: date,
            };
        } catch (error) {
            console.error("Rate limit check failed:", error);
            // Fail open - allow request if DB is unavailable
            return {
                allowed: true,
                currentCount: 0,
                maxLimit: this.maxDailyEmails,
                resetDate: date,
            };
        }
    }

    /**
     * Increment rate limit counter for successful email
     */
    async incrementCount(date: string): Promise<void> {
        try {
            // Check if record exists
            const existingRecord = db.select()
                .from(rateLimits)
                .where(eq(rateLimits.date, date))
                .get();

            if (existingRecord) {
                // Update existing record
                db.update(rateLimits)
                    .set({ count: existingRecord.count + 1 })
                    .where(eq(rateLimits.date, date))
                    .run();
            } else {
                // Insert new record
                db.insert(rateLimits)
                    .values({ date, count: 1 })
                    .run();
            }

            console.log(`Rate limit counter updated for ${date}`);
        } catch (error) {
            console.error("Failed to update rate limit counter:", error);
            // Don't throw - email was already sent successfully
        }
    }
}

/**
 * Mock service for testing
 */
export class MockRateLimitService implements RateLimitService {
    private counts = new Map<string, number>();
    private readonly maxDailyEmails = 10;

    getSwissDate(): string {
        return "2025-10-11"; // Fixed date for testing
    }

    async checkLimit(date: string): Promise<RateLimitResult> {
        const currentCount = this.counts.get(date) ?? 0;
        const allowed = currentCount < this.maxDailyEmails;

        return {
            allowed,
            currentCount,
            maxLimit: this.maxDailyEmails,
            resetDate: date,
        };
    }

    async incrementCount(date: string): Promise<void> {
        const current = this.counts.get(date) ?? 0;
        this.counts.set(date, current + 1);
    }

    // Test helpers
    reset(): void {
        this.counts.clear();
    }

    setCount(date: string, count: number): void {
        this.counts.set(date, count);
    }
}

// Factory function
export const getRateLimitService = (): RateLimitService => {
    const isDevelopment = process.env.NODE_ENV !== "production";

    if (isDevelopment) {
        return new MockRateLimitService();
    }

    return new ContactRateLimitService();
};