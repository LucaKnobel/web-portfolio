import { MAX_DAILY_EMAILS } from "../config/rate-limit.js";

/** Result of a read-only daily rate-limit status check. */
export interface RateLimitResult {
  allowed: boolean;
  currentCount: number;
  maxLimit: number;
  resetDate: string;
}

/** Token representing one reserved email slot. */
export interface RateLimitReservation {
  readonly date: string;
}

/** Public operations exposed by the in-memory rate-limit service. */
export interface RateLimitService {
  tryAcquire(): RateLimitReservation | null;
  release(reservation: RateLimitReservation): void;
  getStatus(): RateLimitResult;
  getSwissDate(): string;
}

interface RateLimitState {
  date: string | null;
  count: number;
}

const productionState: RateLimitState = {
  date: null,
  count: 0,
};

const activeReservations = new WeakSet<object>();

/**
 * Provides a process-wide limit of ten successfully sent emails per Swiss
 * calendar day using synchronous in-memory reservations.
 */
export class ContactRateLimitService implements RateLimitService {
  private readonly maxDailyEmails = MAX_DAILY_EMAILS;

  constructor(private readonly now: () => Date = () => new Date()) {}

  /**
   * Returns the current date in the Europe/Zurich timezone as YYYY-MM-DD.
   */
  getSwissDate(): string {
    return this.now()
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

  private resetForCurrentDay(): string {
    const date = this.getSwissDate();

    if (productionState.date !== date) {
      productionState.date = date;
      productionState.count = 0;
    }

    return date;
  }

  /**
   * Atomically reserves one daily email slot, or returns null at the limit.
   */
  tryAcquire(): RateLimitReservation | null {
    const date = this.resetForCurrentDay();

    if (productionState.count >= this.maxDailyEmails) {
      return null;
    }

    productionState.count += 1;
    const reservation = { date };
    activeReservations.add(reservation);
    return reservation;
  }

  /**
   * Releases a previously acquired reservation on the same calendar day.
   */
  release(reservation: RateLimitReservation): void {
    if (!activeReservations.has(reservation)) {
      return;
    }

    activeReservations.delete(reservation);
    this.resetForCurrentDay();

    if (
      reservation.date === productionState.date &&
      productionState.count > 0
    ) {
      productionState.count -= 1;
    }
  }

  /**
   * Reads the current limit status without reserving a slot.
   */
  getStatus(): RateLimitResult {
    const date = this.resetForCurrentDay();

    return {
      allowed: productionState.count < this.maxDailyEmails,
      currentCount: productionState.count,
      maxLimit: this.maxDailyEmails,
      resetDate: date,
    };
  }
}

/** Resets shared rate-limit state for isolated tests. */
export const resetRateLimitStateForTests = (): void => {
  productionState.date = null;
  productionState.count = 0;
};

/** Creates a rate-limit service backed by shared process-level state. */
export const getRateLimitService = (): RateLimitService => {
  return new ContactRateLimitService();
};
