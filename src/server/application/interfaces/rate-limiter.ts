/**
 * Token representing a reserved slot for rate limiting.
 */
export type RateLimitReservation = {
  readonly date: string;
};

/**
 * Current status overview of rate limit capacity.
 */
export type RateLimitStatus = {
  allowed: boolean;
  currentCount: number;
  maxLimit: number;
  resetDate: string;
};

/**
 * Contract for rate limiting capacity management.
 */
export interface RateLimiter {
  tryAcquire(): RateLimitReservation | null;
  release(reservation: RateLimitReservation): void;
  getStatus(): RateLimitStatus;
  getSwissDate(): string;
}
