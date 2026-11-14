import { describe, expect, it } from "vitest";
import { resolveCapabilities } from "@/lib/capabilities";

describe("capabilities", () => {
  it("opens in development with demo defaults", () => {
    const capabilities = resolveCapabilities({}, "development");
    expect(capabilities.demo).toBe(true);
    expect(capabilities.auth.mode).toBe("demo");
    expect(capabilities.data.mode).toBe("fixtures");
    expect(capabilities.billing.mode).toBe("demo");
  });

  it("does not silently enable demo mode in production", () => {
    const capabilities = resolveCapabilities({}, "production");
    expect(capabilities.demo).toBe(false);
    expect(capabilities.auth.mode).toBe("unconfigured");
    expect(capabilities.data.mode).toBe("unconfigured");
  });

  it("rejects explicit demo flags in production", () => {
    expect(() =>
      resolveCapabilities({ NEXT_PUBLIC_AUTH_MODE: "demo" }, "production"),
    ).toThrow(/Demo mode is enabled in a production build/);
  });
});
