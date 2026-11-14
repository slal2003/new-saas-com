import { describe, expect, it } from "vitest";
import { DEMO_PROJECT_SPEC, normalizeProjectSpec } from "@/lib/spec/schema";
import { renderScaffold } from "@/lib/scaffold/render";

describe("deterministic renderer", () => {
  it("renders the base with generated spec, setup, env example, and lock", async () => {
    const rendered = await renderScaffold(DEMO_PROJECT_SPEC);

    expect(rendered.slug).toBe("northstar-notes");
    expect(Object.keys(rendered.files)).toEqual(
      expect.arrayContaining([
        "package.json",
        "project.yaml",
        "SETUP.md",
        ".env.example",
        "template.lock",
        "src/app/theme.css",
        "src/app/page.tsx",
        "convex/schema.ts",
        "infra/convex/docker-compose.yml",
        "src/features/email/README.md",
        "src/features/analytics/README.md",
      ]),
    );
    expect(rendered.files["project.yaml"]).toContain("name: northstar-notes");
    expect(rendered.files["SETUP.md"]).toContain("Convex Auth v2");
    expect(rendered.files["template.lock"]).toContain(rendered.lock.checksum);
    expect(rendered.lock.files.length).toBeGreaterThan(20);
  });

  it("substitutes every token", async () => {
    const rendered = await renderScaffold(DEMO_PROJECT_SPEC);
    for (const [path, content] of Object.entries(rendered.files)) {
      expect(content, path).not.toMatch(/\{\{[^}]+\}\}/);
    }
    expect(rendered.files["README.md"]).toContain("northstar-notes");
    expect(rendered.files["src/components/logo.tsx"]).toContain("northstar-notes");
  });

  it("is byte-stable across renders", async () => {
    const first = await renderScaffold(DEMO_PROJECT_SPEC);
    const second = await renderScaffold(DEMO_PROJECT_SPEC);
    expect(second.files).toEqual(first.files);
    expect(second.lock).toEqual(first.lock);
  });

  it("omits infra when Convex Cloud is selected", async () => {
    const cloud = normalizeProjectSpec({
      name: "cloud-app",
      description: "A project using hosted Convex instead of self-hosting.",
      deploy: {
        provider: "dokploy",
        convex: "cloud",
        dns: "cloudflare",
        registrar: "dynadot",
      },
    });
    const rendered = await renderScaffold(cloud);
    expect(Object.keys(rendered.files).some((path) => path.startsWith("infra/convex/"))).toBe(
      false,
    );
  });

  it("rejects secret-like keys", async () => {
    await expect(
      renderScaffold({ ...DEMO_PROJECT_SPEC, apiKey: "sk_live_nope" }),
    ).rejects.toThrow(/env var names, not secrets/);
  });

  it("refuses to render a blocked plan", async () => {
    const complex = normalizeProjectSpec({
      name: "complex-app",
      description: "A product with a heavy FastAPI backend.",
      structure: "complex",
      backend: { advanced: "fastapi", database: "postgres" },
    });
    await expect(renderScaffold(complex)).rejects.toThrow(/simple only/);
  });
});
