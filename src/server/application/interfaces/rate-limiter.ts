export type RateLimitReservation = {
  readonly date: string;
};

export type RateLimitStatus = {
  allowed: boolean;
  currentCount: number;
  maxLimit: number;
  resetDate: string;
};

export interface RateLimiter {
  tryAcquire(): RateLimitReservation | null;
  release(reservation: RateLimitReservation): void;
  getStatus(): RateLimitStatus;
  getSwissDate(): string;
}
