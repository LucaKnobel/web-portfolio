import { describe, it, expect, vi, beforeEach } from "vitest";
import { originCheck } from "@/middleware/origin-check.js";
import type { APIContext } from "astro";

describe("originCheck middleware", () => {
  const next = vi.fn().mockResolvedValue(new Response("OK", { status: 200 }));

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createContext = (
    method: string,
    headers: Record<string, string>,
  ): APIContext => {
    const reqHeaders = new Headers(headers);
    return {
      request: new Request("http://localhost:4321/de/contact", {
        method,
        headers: reqHeaders,
      }),
    } as unknown as APIContext;
  };

  it("allows safe GET requests without checking origin", async () => {
    const context = createContext("GET", {});
    const res = await originCheck(context, next);

    expect(res.status).toBe(200);
    expect(next).toHaveBeenCalledOnce();
  });

  it("allows production trusted origin for POST requests", async () => {
    const context = createContext("POST", {
      "content-type": "application/x-www-form-urlencoded",
      origin: "https://lucaknobel.ch",
    });
    const res = await originCheck(context, next);

    expect(res.status).toBe(200);
    expect(next).toHaveBeenCalledOnce();
  });

  it("allows localhost origin in dev mode for POST requests", async () => {
    const context = createContext("POST", {
      "content-type": "multipart/form-data",
      origin: "http://localhost:4321",
    });
    const res = await originCheck(context, next);

    expect(res.status).toBe(200);
    expect(next).toHaveBeenCalledOnce();
  });

  it("rejects untrusted origin for POST requests", async () => {
    const context = createContext("POST", {
      "content-type": "application/x-www-form-urlencoded",
      origin: "https://evil-attacker.com",
    });
    const res = await originCheck(context, next);

    expect(res.status).toBe(403);
    expect(await res.text()).toContain("forbidden");
    expect(next).not.toHaveBeenCalled();
  });
});
