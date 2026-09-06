import { describe, expect, it } from "vitest";
import { csp } from "@/middleware/csp.js";

describe("csp middleware", () => {
  it("preserves the response body and existing CSP header", async () => {
    const body = '<script nonce="existing">const value = 1;</script>';
    const response = new Response(body, {
      headers: {
        "Content-Length": String(new TextEncoder().encode(body).byteLength),
        "Content-Security-Policy": "script-src 'self' 'sha256-example'",
      },
    });

    const result = await csp({} as never, async () => response);

    expect(await result.text()).toBe(body);
    expect(result.headers.get("Content-Length")).toBe(
      String(new TextEncoder().encode(body).byteLength),
    );
    expect(result.headers.get("Content-Security-Policy")).toBe(
      "script-src 'self' 'sha256-example'",
    );
  });

  it("adds the security headers without adding unsafe CSP sources", async () => {
    const result = await csp({} as never, async () => new Response("ok"));

    expect(result.headers.get("Strict-Transport-Security")).toBe(
      "max-age=31536000; includeSubDomains; preload",
    );
    expect(result.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(result.headers.get("X-Frame-Options")).toBe("DENY");
    expect(result.headers.get("Content-Security-Policy")).toBeNull();
  });
});
