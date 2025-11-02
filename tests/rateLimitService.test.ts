import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ContactRateLimitService } from '../src/services/rateLimitService.js';

// Mock the database
vi.mock('../src/db/index.js', () => ({
    db: {
        select: vi.fn(),
        insert: vi.fn(),
        update: vi.fn(),
    }
}));

describe('ContactRateLimitService', () => {
    let service: ContactRateLimitService;
    let mockDb: any;

    beforeEach(async () => {
        vi.clearAllMocks();
        const dbModule = await import('../src/db/index.js');
        mockDb = dbModule.db;
        service = new ContactRateLimitService();
    });

    describe('getSwissDate', () => {
        it('should return date in YYYY-MM-DD format', () => {
            const date = service.getSwissDate();
            expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        });

        it('should return consistent date for same day', () => {
            const date1 = service.getSwissDate();
            const date2 = service.getSwissDate();
            expect(date1).toBe(date2);
        });
    });

    describe('checkLimit', () => {
        it('should allow requests when under limit', async () => {
            mockDb.select.mockReturnValue({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        get: vi.fn().mockReturnValue({ count: 5 })
                    })
                })
            });

            const result = await service.checkLimit('2025-10-11');

            expect(result.allowed).toBe(true);
            expect(result.currentCount).toBe(5);
            expect(result.maxLimit).toBe(10);
        });

        it('should deny requests when at limit', async () => {
            mockDb.select.mockReturnValue({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        get: vi.fn().mockReturnValue({ count: 10 })
                    })
                })
            });

            const result = await service.checkLimit('2025-10-11');

            expect(result.allowed).toBe(false);
            expect(result.currentCount).toBe(10);
        });

        it('should deny requests when over limit', async () => {
            mockDb.select.mockReturnValue({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        get: vi.fn().mockReturnValue({ count: 15 })
                    })
                })
            });

            const result = await service.checkLimit('2025-10-11');

            expect(result.allowed).toBe(false);
            expect(result.currentCount).toBe(15);
        });

        it('should allow when no record exists', async () => {
            mockDb.select.mockReturnValue({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        get: vi.fn().mockReturnValue(undefined)
                    })
                })
            });

            const result = await service.checkLimit('2025-10-11');

            expect(result.allowed).toBe(true);
            expect(result.currentCount).toBe(0);
        });

        it('should fail open on DB error', async () => {
            mockDb.select.mockReturnValue({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        get: vi.fn(() => { throw new Error('DB error'); })
                    })
                })
            });

            const result = await service.checkLimit('2025-10-11');

            expect(result.allowed).toBe(true);
            expect(result.currentCount).toBe(0);
        });
    });

    describe('incrementCount', () => {
        it('should insert new record when none exists', async () => {
            mockDb.select.mockReturnValue({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        get: vi.fn().mockReturnValue(undefined)
                    })
                })
            });

            mockDb.insert.mockReturnValue({
                values: vi.fn().mockReturnValue({
                    run: vi.fn()
                })
            });

            await service.incrementCount('2025-10-11');

            expect(mockDb.insert).toHaveBeenCalled();
        });

        it('should update existing record', async () => {
            mockDb.select.mockReturnValue({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        get: vi.fn().mockReturnValue({ date: '2025-10-11', count: 5 })
                    })
                })
            });

            mockDb.update.mockReturnValue({
                set: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        run: vi.fn()
                    })
                })
            });

            await service.incrementCount('2025-10-11');

            expect(mockDb.update).toHaveBeenCalled();
        });

        it('should not throw on DB error', async () => {
            mockDb.select.mockReturnValue({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        get: vi.fn(() => { throw new Error('DB error'); })
                    })
                })
            });

            await expect(service.incrementCount('2025-10-11')).resolves.not.toThrow();
        });
    });
});
