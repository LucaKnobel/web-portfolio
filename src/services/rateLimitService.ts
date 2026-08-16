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

const productionCounts = new Map<string, number>();

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
    return new Date()
      .toLocaleDateString("de-CH", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        timeZone: "Europe/Zurich",
      })
      .split(".")
      .reverse()
      .join("-");
  }

  /**
   * Check if rate limit is exceeded for given date
   */
  async checkLimit(date: string): Promise<RateLimitResult> {
    const currentCount = productionCounts.get(date) ?? 0;

    return {
      allowed: currentCount < this.maxDailyEmails,
      currentCount,
      maxLimit: this.maxDailyEmails,
      resetDate: date,
    };
  }

  /**
   * Increment rate limit counter for successful email
   */
  async incrementCount(date: string): Promise<void> {
    const currentCount = productionCounts.get(date) ?? 0;
    productionCounts.set(date, currentCount + 1);
  }
}

// Factory function
export const getRateLimitService = (): RateLimitService => {
  return new ContactRateLimitService();
};
