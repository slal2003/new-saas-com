import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  findSecretLikeKeys,
  normalizeProjectSpec,
  projectSpecSchema,
  safeParseProjectSpec,
} from "@/lib/spec/schema";
import { parseProjectYaml, toProjectYaml } from "@/lib/spec/yaml";

describe("project spec schema", () => {
  it("accepts the tool's own project.yaml", async () => {
    const text = await readFile(join(process.cwd(), "project.yaml"), "utf8");
    const result = parseProjectYaml(text);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("new-saas");
      expect(result.data.structure).toBe("simple");
      expect(result.data.auth).toBe("convex-auth");
      expect(result.data.features.demo).toBe(true);
    }
  });

  it("rejects unknown keys so secrets cannot hitch a ride", () => {
    const result = safeParseProjectSpec({
      name: "test-app",
      description: "A valid enough description.",
      stripeSecret: "sk_live_nope",
    });
    expect(result.success).toBe(false);
    expect(result.issues.some((issue) => issue.message.includes("stripeSecret"))).toBe(true);
  });

  it("finds secret-like keys before validation", () => {
    expect(findSecretLikeKeys({ name: "x", nested: { apiKey: "abc" } })).toEqual([
      "nested.apiKey",
    ]);
  });

  it("derives Clerk for a business audience and rejects a contradiction", () => {
    const derived = normalizeProjectSpec({
      name: "b2b-app",
      description: "A business product with SSO expectations.",
      audience: "business",
    });
    expect(derived.auth).toBe("clerk");

    const contradiction = safeParseProjectSpec({
      name: "b2b-app",
      description: "A business product with SSO expectations.",
      audience: "business",
      auth: "convex-auth",
    });
    expect(contradiction.success).toBe(false);
  });

  it("requires an advanced backend and a non-Convex database for complex", () => {
    const result = safeParseProjectSpec({
      name: "complex-app",
      description: "A product with a heavy FastAPI backend.",
      structure: "complex",
      backend: { advanced: "none", database: "convex" },
    });
    expect(result.success).toBe(false);
    expect(result.issues.map((issue) => issue.path)).toContain("backend.advanced");
    expect(result.issues.map((issue) => issue.path)).toContain("backend.database");
  });

  it("round-trips through canonical YAML", () => {
    const spec = normalizeProjectSpec({
      name: "round-trip",
      description: "A project used to test the YAML round trip.",
    });
    const yaml = toProjectYaml(spec);
    const parsed = parseProjectYaml(yaml);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data).toEqual(spec);
    }
  });

  it("exposes defaults for every required field", () => {
    const parsed = projectSpecSchema.parse({
      name: "defaults",
      description: "A project that relies on schema defaults.",
    });
    expect(parsed.structure).toBe("simple");
    expect(parsed.frontend).toBe("next");
    expect(parsed.backend.advanced).toBe("none");
    expect(parsed.deploy.convex).toBe("self-hosted");
    expect(parsed.templateVersion).toBe("0.1.0");
  });
});
