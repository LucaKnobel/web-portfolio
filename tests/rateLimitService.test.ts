import { describe, it, expect, beforeEach } from "vitest";
import {
  ContactRateLimitService,
  resetRateLimitStateForTests,
} from "../src/services/rateLimitService.js";

describe("ContactRateLimitService", () => {
  let service: ContactRateLimitService;
  let currentTime: Date;

  beforeEach(() => {
    resetRateLimitStateForTests();
    currentTime = new Date("2025-10-11T12:00:00+02:00");
    service = new ContactRateLimitService(() => currentTime);
  });

  it("reports that a fresh limiter allows sending", () => {
    expect(service.getStatus()).toMatchObject({
      allowed: true,
      currentCount: 0,
      maxLimit: 10,
    });
  });

  it("allows the first ten acquisitions and rejects the eleventh", () => {
    const reservations = Array.from({ length: 10 }, () => service.tryAcquire());

    expect(reservations.every(Boolean)).toBe(true);
    expect(service.tryAcquire()).toBeNull();
    expect(service.getStatus().currentCount).toBe(10);
  });

  it("allows exactly one of two competing acquisitions for the final slot", () => {
    for (let count = 0; count < 9; count += 1) {
      expect(service.tryAcquire()).not.toBeNull();
    }

    const first = service.tryAcquire();
    const second = service.tryAcquire();

    expect([first, second].filter(Boolean)).toHaveLength(1);
    expect(service.getStatus().currentCount).toBe(10);
  });

  it("does not consume a slot when reading status", () => {
    expect(service.getStatus().currentCount).toBe(0);
    expect(service.getStatus().currentCount).toBe(0);
    expect(service.tryAcquire()).not.toBeNull();
    expect(service.getStatus().currentCount).toBe(1);
  });

  it("makes a released reservation available again", () => {
    const reservation = service.tryAcquire();

    expect(reservation).not.toBeNull();
    service.release(reservation!);

    expect(service.getStatus().currentCount).toBe(0);
    expect(service.tryAcquire()).not.toBeNull();
  });

  it("does not make the counter negative when releasing repeatedly", () => {
    const reservation = service.tryAcquire();

    service.release(reservation!);
    service.release(reservation!);
    service.release({ date: service.getSwissDate() });

    expect(service.getStatus().currentCount).toBe(0);
  });

  it("resets the effective counter on a new Swiss calendar day", () => {
    for (let count = 0; count < 10; count += 1) {
      expect(service.tryAcquire()).not.toBeNull();
    }

    currentTime = new Date("2025-10-12T00:00:00+02:00");

    expect(service.getStatus()).toMatchObject({
      allowed: true,
      currentCount: 0,
      resetDate: "2025-10-12",
    });
  });

  it("does not release an old-day reservation into the new day", () => {
    const reservation = service.tryAcquire();
    currentTime = new Date("2025-10-12T00:00:00+02:00");

    expect(service.getStatus().currentCount).toBe(0);
    service.release(reservation!);

    expect(service.getStatus().currentCount).toBe(0);
  });

  it("shares the counter across service instances", () => {
    const secondService = new ContactRateLimitService(() => currentTime);

    expect(service.tryAcquire()).not.toBeNull();

    expect(secondService.getStatus().currentCount).toBe(1);
  });
});
