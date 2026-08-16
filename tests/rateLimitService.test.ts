import { describe, it, expect, beforeEach } from "vitest";
import { ContactRateLimitService } from "../src/services/rateLimitService.js";

describe("ContactRateLimitService", () => {
  let service: ContactRateLimitService;

  beforeEach(() => {
    service = new ContactRateLimitService();
  });

  describe("getSwissDate", () => {
    it("should return date in YYYY-MM-DD format", () => {
      const date = service.getSwissDate();
      expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it("should return consistent date for same day", () => {
      const date1 = service.getSwissDate();
      const date2 = service.getSwissDate();
      expect(date1).toBe(date2);
    });
  });

  describe("checkLimit", () => {
    it("should allow requests when under limit", async () => {
      const date = "2025-10-11-under";
      await service.incrementCount(date);
      await service.incrementCount(date);
      await service.incrementCount(date);
      await service.incrementCount(date);
      await service.incrementCount(date);

      const result = await service.checkLimit(date);

      expect(result.allowed).toBe(true);
      expect(result.currentCount).toBe(5);
      expect(result.maxLimit).toBe(10);
    });

    it("should deny requests when at limit", async () => {
      const date = "2025-10-11-at";
      for (let count = 0; count < 10; count++) {
        await service.incrementCount(date);
      }

      const result = await service.checkLimit(date);

      expect(result.allowed).toBe(false);
      expect(result.currentCount).toBe(10);
    });

    it("should allow the tenth email and block the eleventh", async () => {
      const date = "2025-10-11-tenth";
      for (let count = 0; count < 9; count++) {
        await service.incrementCount(date);
      }

      const tenthEmail = await service.checkLimit(date);
      await service.incrementCount(date);
      const eleventhEmail = await service.checkLimit(date);

      expect(tenthEmail.allowed).toBe(true);
      expect(tenthEmail.currentCount).toBe(9);
      expect(eleventhEmail.allowed).toBe(false);
      expect(eleventhEmail.currentCount).toBe(10);
    });

    it("should deny requests when over limit", async () => {
      const date = "2025-10-11-over";
      for (let count = 0; count < 15; count++) {
        await service.incrementCount(date);
      }

      const result = await service.checkLimit(date);

      expect(result.allowed).toBe(false);
      expect(result.currentCount).toBe(15);
    });

    it("should allow when no record exists", async () => {
      const result = await service.checkLimit("2025-10-11-empty");

      expect(result.allowed).toBe(true);
      expect(result.currentCount).toBe(0);
    });

    it("should share state across service instances", async () => {
      const secondService = new ContactRateLimitService();
      const date = "2025-10-11-shared";

      await service.incrementCount(date);

      const result = await secondService.checkLimit(date);

      expect(result.currentCount).toBe(1);
    });

    it("should reset the counter for a new Swiss calendar day", async () => {
      const firstDate = "2025-10-11-reset";
      const secondDate = "2025-10-12-reset";

      for (let count = 0; count < 10; count++) {
        await service.incrementCount(firstDate);
      }

      const result = await service.checkLimit(secondDate);

      expect(result.allowed).toBe(true);
      expect(result.currentCount).toBe(0);
      expect(result.resetDate).toBe(secondDate);
    });
  });

  describe("incrementCount", () => {
    it("should increment the in-memory counter", async () => {
      const date = "2025-10-11-increment";

      await service.incrementCount(date);
      await service.incrementCount(date);

      const result = await service.checkLimit(date);

      expect(result.currentCount).toBe(2);
    });
  });
});
