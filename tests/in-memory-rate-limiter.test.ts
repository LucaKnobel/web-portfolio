import { describe, it, expect, beforeEach } from "vitest";
import {
  createInMemoryRateLimiter,
  resetRateLimitStateForTests,
} from "@/server/infrastructure/rate-limit/in-memory-rate-limiter.js";
import type { RateLimiter } from "@/server/application/interfaces/rate-limiter.js";

describe("createInMemoryRateLimiter", () => {
  let limiter: RateLimiter;
  let currentTime: Date;

  beforeEach(() => {
    resetRateLimitStateForTests();
    currentTime = new Date("2025-10-11T12:00:00+02:00");
    limiter = createInMemoryRateLimiter(10, () => currentTime);
  });

  it("reports that a fresh limiter allows sending", () => {
    expect(limiter.getStatus()).toMatchObject({
      allowed: true,
      currentCount: 0,
      maxLimit: 10,
    });
  });

  it("allows the first ten acquisitions and rejects the eleventh", () => {
    const reservations = Array.from({ length: 10 }, () => limiter.tryAcquire());

    expect(reservations.every(Boolean)).toBe(true);
    expect(limiter.tryAcquire()).toBeNull();
    expect(limiter.getStatus().currentCount).toBe(10);
  });

  it("allows exactly one of two competing acquisitions for the final slot", () => {
    for (let count = 0; count < 9; count += 1) {
      expect(limiter.tryAcquire()).not.toBeNull();
    }

    const first = limiter.tryAcquire();
    const second = limiter.tryAcquire();

    expect([first, second].filter(Boolean)).toHaveLength(1);
    expect(limiter.getStatus().currentCount).toBe(10);
  });

  it("does not consume a slot when reading status", () => {
    expect(limiter.getStatus().currentCount).toBe(0);
    expect(limiter.getStatus().currentCount).toBe(0);
    expect(limiter.tryAcquire()).not.toBeNull();
    expect(limiter.getStatus().currentCount).toBe(1);
  });

  it("makes a released reservation available again", () => {
    const reservation = limiter.tryAcquire();

    expect(reservation).not.toBeNull();
    limiter.release(reservation!);

    expect(limiter.getStatus().currentCount).toBe(0);
    expect(limiter.tryAcquire()).not.toBeNull();
  });

  it("does not make the counter negative when releasing repeatedly", () => {
    const reservation = limiter.tryAcquire();

    limiter.release(reservation!);
    limiter.release(reservation!);
    limiter.release({ date: limiter.getSwissDate() });

    expect(limiter.getStatus().currentCount).toBe(0);
  });

  it("resets the effective counter on a new Swiss calendar day", () => {
    for (let count = 0; count < 10; count += 1) {
      expect(limiter.tryAcquire()).not.toBeNull();
    }

    currentTime = new Date("2025-10-12T00:00:00+02:00");

    expect(limiter.getStatus()).toMatchObject({
      allowed: true,
      currentCount: 0,
      resetDate: "2025-10-12",
    });
  });

  it("does not release an old-day reservation into the new day", () => {
    const reservation = limiter.tryAcquire();
    currentTime = new Date("2025-10-12T00:00:00+02:00");

    expect(limiter.getStatus().currentCount).toBe(0);
    limiter.release(reservation!);

    expect(limiter.getStatus().currentCount).toBe(0);
  });

  it("shares state across instances created by factory", () => {
    const secondLimiter = createInMemoryRateLimiter(10, () => currentTime);

    expect(limiter.tryAcquire()).not.toBeNull();
    expect(secondLimiter.getStatus().currentCount).toBe(1);
  });
});
