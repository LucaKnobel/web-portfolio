import { describe, it, expect, beforeEach } from 'vitest';

interface RateLimitResult {
    allowed: boolean;
    currentCount: number;
    maxLimit: number;
    resetDate: string;
}

interface RateLimitService {
    checkLimit(date: string): Promise<RateLimitResult>;
    incrementCount(date: string): Promise<void>;
    getSwissDate(): string;
}

/**
 * Test Mock Service (completely isolated from database)
 */
class TestMockRateLimitService implements RateLimitService {
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

describe('RateLimitService', () => {
    let service: TestMockRateLimitService;
    const testDate = '2025-10-11';

    beforeEach(() => {
        service = new TestMockRateLimitService();
        service.reset();
    });

    describe('checkLimit', () => {
        it('should allow requests when under limit', async () => {
            const result = await service.checkLimit(testDate);

            expect(result.allowed).toBe(true);
            expect(result.currentCount).toBe(0);
            expect(result.maxLimit).toBe(10);
            expect(result.resetDate).toBe(testDate);
        });

        it('should deny requests when at limit', async () => {
            // Set count to maximum
            service.setCount(testDate, 10);

            const result = await service.checkLimit(testDate);

            expect(result.allowed).toBe(false);
            expect(result.currentCount).toBe(10);
        });

        it('should deny requests when over limit', async () => {
            // Set count over maximum
            service.setCount(testDate, 15);

            const result = await service.checkLimit(testDate);

            expect(result.allowed).toBe(false);
            expect(result.currentCount).toBe(15);
        });

        it('should allow requests on different dates', async () => {
            // Set limit reached for one date
            service.setCount('2025-10-11', 10);

            // Check different date should be allowed
            const result = await service.checkLimit('2025-10-12');

            expect(result.allowed).toBe(true);
            expect(result.currentCount).toBe(0);
        });
    });

    describe('incrementCount', () => {
        it('should increment from 0 to 1', async () => {
            await service.incrementCount(testDate);

            const result = await service.checkLimit(testDate);
            expect(result.currentCount).toBe(1);
        });

        it('should increment multiple times', async () => {
            await service.incrementCount(testDate);
            await service.incrementCount(testDate);
            await service.incrementCount(testDate);

            const result = await service.checkLimit(testDate);
            expect(result.currentCount).toBe(3);
        });

        it('should handle multiple dates separately', async () => {
            await service.incrementCount('2025-10-11');
            await service.incrementCount('2025-10-11');
            await service.incrementCount('2025-10-12');

            const result1 = await service.checkLimit('2025-10-11');
            const result2 = await service.checkLimit('2025-10-12');

            expect(result1.currentCount).toBe(2);
            expect(result2.currentCount).toBe(1);
        });
    });

    describe('getSwissDate', () => {
        it('should return fixed test date', () => {
            const date = service.getSwissDate();
            expect(date).toBe('2025-10-11');
        });
    });

    describe('edge cases', () => {
        it('should handle exactly at limit boundary', async () => {
            // Increment to exactly limit
            for (let i = 0; i < 9; i++) {
                await service.incrementCount(testDate);
            }

            let result = await service.checkLimit(testDate);
            expect(result.allowed).toBe(true);
            expect(result.currentCount).toBe(9);

            // One more should still be allowed
            await service.incrementCount(testDate);
            result = await service.checkLimit(testDate);
            expect(result.allowed).toBe(false);
            expect(result.currentCount).toBe(10);
        });

        it('should handle rapid concurrent increments', async () => {
            // Simulate multiple rapid increments
            const promises = Array.from({ length: 5 }, () =>
                service.incrementCount(testDate)
            );

            await Promise.all(promises);

            const result = await service.checkLimit(testDate);
            expect(result.currentCount).toBe(5);
        });
    });
});