import { MAX_DAILY_EMAILS } from "@/config/rate-limit.js";
import type {
  RateLimiter,
  RateLimitReservation,
  RateLimitStatus,
} from "@/server/application/interfaces/rate-limiter.js";

type RateLimitState = {
  date: string | null;
  count: number;
};

const sharedState: RateLimitState = {
  date: null,
  count: 0,
};

const activeReservations = new WeakSet<object>();

/**
 * Resets shared rate-limit state for isolated tests.
 */
export const resetRateLimitStateForTests = (): void => {
  sharedState.date = null;
  sharedState.count = 0;
};

/**
 * Creates an in-memory RateLimiter implementation that limits actions per Swiss calendar day.
 */
export const createInMemoryRateLimiter = (
  maxDailyEmails: number = MAX_DAILY_EMAILS,
  now: () => Date = () => new Date(),
): RateLimiter => {
  const getSwissDate = (): string => {
    return now()
      .toLocaleDateString("de-CH", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        timeZone: "Europe/Zurich",
      })
      .split(".")
      .reverse()
      .join("-");
  };

  const resetForCurrentDay = (): string => {
    const date = getSwissDate();

    if (sharedState.date !== date) {
      sharedState.date = date;
      sharedState.count = 0;
    }

    return date;
  };

  return {
    getSwissDate,

    tryAcquire(): RateLimitReservation | null {
      const date = resetForCurrentDay();

      if (sharedState.count >= maxDailyEmails) {
        return null;
      }

      sharedState.count += 1;
      const reservation = { date };
      activeReservations.add(reservation);
      return reservation;
    },

    release(reservation: RateLimitReservation): void {
      if (!activeReservations.has(reservation)) {
        return;
      }

      activeReservations.delete(reservation);
      resetForCurrentDay();

      if (reservation.date === sharedState.date && sharedState.count > 0) {
        sharedState.count -= 1;
      }
    },

    getStatus(): RateLimitStatus {
      const date = resetForCurrentDay();

      return {
        allowed: sharedState.count < maxDailyEmails,
        currentCount: sharedState.count,
        maxLimit: maxDailyEmails,
        resetDate: date,
      };
    },
  };
};
