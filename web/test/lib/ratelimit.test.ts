import { describe, it, expect, vi, beforeEach } from "vitest";
import { hashIp } from "@/lib/ratelimit";

describe("hashIp", () => {
  beforeEach(() => {
    vi.stubEnv("IP_HASH_SALT", "test-salt-1234");
  });

  it("produces a 64-char hex string", () => {
    expect(hashIp("198.51.100.42")).toMatch(/^[0-9a-f]{64}$/);
  });

  it("is deterministic for the same input", () => {
    expect(hashIp("198.51.100.42")).toBe(hashIp("198.51.100.42"));
  });

  it("differs with different salt", () => {
    const a = hashIp("198.51.100.42");
    vi.stubEnv("IP_HASH_SALT", "different-salt");
    const b = hashIp("198.51.100.42");
    expect(a).not.toBe(b);
  });

  it("trims whitespace and handles X-Forwarded-For chains", () => {
    expect(hashIp(" 198.51.100.42 , 10.0.0.1 ")).toBe(hashIp("198.51.100.42"));
  });
});
