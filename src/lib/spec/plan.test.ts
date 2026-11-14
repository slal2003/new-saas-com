import { describe, expect, it } from "vitest";
import { normalizeProjectSpec } from "@/lib/spec/schema";
import { resolveProjectPlan, slugify } from "@/lib/spec/plan";

describe("project plan", () => {
  it("resolves the simple individuals path", () => {
    const spec = normalizeProjectSpec({
      name: "Northstar Notes",
      description: "A focused note-taking SaaS for independent consultants.",
      features: { demo: true, blog: false, email: "resend", analytics: "posthog" },
    });
    const plan = resolveProjectPlan(spec);

    expect(plan.slug).toBe("northstar-notes");
    expect(plan.renderable).toBe(true);
    expect(plan.auth.provider).toBe("convex-auth");
    expect(plan.payments).toBe("stripe");
    expect(plan.modules).toContain("auth");
    expect(plan.modules).toContain("convex-base");
    expect(plan.modules).toContain("infra-convex");
    expect(plan.modules).toContain("email");
    expect(plan.modules).toContain("analytics");
    expect(plan.envVars.map((envVar) => envVar.name)).toContain("STRIPE_SECRET_KEY");
    expect(plan.infra.every((step) => step.stubbed)).toBe(true);
    expect(plan.infra).toHaveLength(6);
  });

  it("blocks Clerk and complex structures in v0 without hiding the plan", () => {
    const clerk = resolveProjectPlan(
      normalizeProjectSpec({
        name: "b2b-app",
        description: "A business product with SSO expectations.",
        audience: "business",
      }),
    );
    expect(clerk.renderable).toBe(false);
    expect(clerk.auth.provider).toBe("clerk");
    expect(clerk.blockers.join(" ")).toMatch(/Clerk/);

    const complex = resolveProjectPlan(
      normalizeProjectSpec({
        name: "complex-app",
        description: "A product with a heavy FastAPI backend.",
        structure: "complex",
        backend: { advanced: "fastapi", database: "postgres" },
      }),
    );
    expect(complex.renderable).toBe(false);
    expect(complex.blockers.join(" ")).toMatch(/simple only/);
  });

  it("blocks a template version that v0 does not pin", () => {
    const plan = resolveProjectPlan(
      normalizeProjectSpec({
        name: "old-template",
        description: "A project pinned to a version that does not exist.",
        templateVersion: "0.0.9",
      }),
    );
    expect(plan.renderable).toBe(false);
    expect(plan.blockers.join(" ")).toMatch(/0\.0\.9/);
  });

  it("uses a stable slug", () => {
    expect(slugify("  My Great SaaS!! ")).toBe("my-great-saas");
    expect(slugify("")).toBe("");
  });
});
