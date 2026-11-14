import { describe, expect, it } from "vitest";
import { resolveCapabilities } from "@/lib/capabilities";

describe("capabilities", () => {
  it("opens in development with demo defaults and no config", () => {
    const capabilities = resolveCapabilities({}, "development");
    expect(capabilities.demo).toBe(true);
    expect(capabilities.auth.mode).toBe("demo");
    expect(capabilities.data.mode).toBe("fixtures");
    expect(capabilities.billing.mode).toBe("demo");
    expect(capabilities.missing).toEqual([]);
  });

  it("never silently enables demo mode in production", () => {
    const capabilities = resolveCapabilities({}, "production");
    expect(capabilities.demo).toBe(false);
    expect(capabilities.auth.mode).toBe("unconfigured");
    expect(capabilities.data.mode).toBe("unconfigured");
    expect(capabilities.billing.mode).toBe("unconfigured");
  });

  it("rejects explicit demo flags in production", () => {
    expect(() => resolveCapabilities({ NEXT_PUBLIC_AUTH_MODE: "demo" }, "production")).toThrow(
      /Demo mode is enabled in a production build/,
    );
    expect(() =>
      resolveCapabilities({ NEXT_PUBLIC_DATA_MODE: "fixtures" }, "production"),
    ).toThrow();
    expect(() =>
      resolveCapabilities({ NEXT_PUBLIC_BILLING_MODE: "demo" }, "production"),
    ).toThrow();
  });

  it("detects real Convex from the deployment URL", () => {
    const capabilities = resolveCapabilities(
      {
        NEXT_PUBLIC_CONVEX_URL: "https://example.convex.cloud",
        NEXT_PUBLIC_BILLING_MODE: "stripe",
      },
      "development",
    );
    expect(capabilities.auth.mode).toBe("real");
    expect(capabilities.data.mode).toBe("convex");
    expect(capabilities.demo).toBe(false);
  });

  it("treats a real mode without a URL as unconfigured", () => {
    const capabilities = resolveCapabilities(
      { NEXT_PUBLIC_AUTH_MODE: "real", NEXT_PUBLIC_DATA_MODE: "convex" },
      "development",
    );
    expect(capabilities.auth.mode).toBe("unconfigured");
    expect(capabilities.data.mode).toBe("unconfigured");
    expect(capabilities.missing.map((item) => item.key)).toContain("NEXT_PUBLIC_CONVEX_URL");
  });

  it("rejects unknown mode values", () => {
    expect(() =>
      resolveCapabilities({ NEXT_PUBLIC_AUTH_MODE: "clerk" }, "development"),
    ).toThrow(/must be one of/);
  });
});
