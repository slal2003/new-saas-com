import { z } from "zod";

export const PROJECT_SPEC_SCHEMA_VERSION = 1;

const NAME_PATTERN = /^[A-Za-z0-9][A-Za-z0-9 _-]*$/;
const DOMAIN_PATTERN =
  /^(?=.{1,253}$)(?!-)[a-z0-9-]{1,63}(?<!-)(\.(?!-)[a-z0-9-]{1,63}(?<!-))*\.?$/i;
const SEMVER_PATTERN = /^\d+\.\d+\.\d+$/;

export const audienceSchema = z.enum(["individuals", "smb", "business"]);
export const authProviderSchema = z.enum(["convex-auth", "clerk"]);
export const structureSchema = z.enum(["simple", "complex"]);

const backendSchema = z
  .strictObject({
    advanced: z.enum(["none", "fastapi", "fastmcp"]).default("none"),
    database: z.enum(["convex", "sqlite", "postgres"]).default("convex"),
  })
  .default({ advanced: "none", database: "convex" });

const deploySchema = z
  .strictObject({
    provider: z.literal("dokploy").default("dokploy"),
    convex: z.enum(["self-hosted", "cloud"]).default("self-hosted"),
    dns: z.literal("cloudflare").default("cloudflare"),
    registrar: z.literal("dynadot").default("dynadot"),
  })
  .default({
    provider: "dokploy",
    convex: "self-hosted",
    dns: "cloudflare",
    registrar: "dynadot",
  });

const stylingSchema = z
  .strictObject({
    theme: z.literal("tweakcn").default("tweakcn"),
  })
  .default({ theme: "tweakcn" });

const featuresSchema = z
  .strictObject({
    demo: z.boolean().default(true),
    blog: z.boolean().default(false),
    email: z.enum(["resend", "none"]).default("none"),
    analytics: z.enum(["posthog", "none"]).default("none"),
  })
  .default({ demo: true, blog: false, email: "none", analytics: "none" });

export const projectSpecSchema = z
  .strictObject({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters.")
      .max(40, "Name must be at most 40 characters.")
      .regex(NAME_PATTERN, "Use letters, numbers, spaces, hyphens, or underscores."),
    description: z
      .string()
      .trim()
      .min(10, "Describe the project in at least 10 characters.")
      .max(200, "Description must be at most 200 characters."),
    structure: structureSchema.default("simple"),
    frontend: z.literal("next").default("next"),
    backend: backendSchema,
    audience: audienceSchema.default("individuals"),
    auth: authProviderSchema.optional(),
    payments: z.enum(["stripe", "none"]).default("stripe"),
    domain: z.preprocess(
      (value) => (value === "" ? undefined : value),
      z.string().trim().regex(DOMAIN_PATTERN, "Enter a valid hostname.").optional(),
    ),
    deploy: deploySchema,
    styling: stylingSchema,
    features: featuresSchema,
    templateVersion: z
      .string()
      .trim()
      .regex(SEMVER_PATTERN, "templateVersion must look like 0.1.0.")
      .default("0.1.0"),
  })
  .superRefine((spec, ctx) => {
    const expectedAuth = spec.audience === "business" ? "clerk" : "convex-auth";
    if (spec.auth && spec.auth !== expectedAuth) {
      ctx.addIssue({
        code: "custom",
        path: ["auth"],
        message: `Audience "${spec.audience}" requires auth "${expectedAuth}".`,
      });
    }
    if (spec.structure === "simple" && spec.backend.advanced !== "none") {
      ctx.addIssue({
        code: "custom",
        path: ["backend", "advanced"],
        message: "A simple structure cannot use an advanced backend.",
      });
    }
    if (spec.structure === "complex" && spec.backend.advanced === "none") {
      ctx.addIssue({
        code: "custom",
        path: ["backend", "advanced"],
        message: "A complex structure needs backend.advanced set to fastapi or fastmcp.",
      });
    }
    if (spec.structure === "complex" && spec.backend.database === "convex") {
      ctx.addIssue({
        code: "custom",
        path: ["backend", "database"],
        message: "Declare the advanced backend's database (sqlite or postgres).",
      });
    }
  });

export type ProjectSpec = z.infer<typeof projectSpecSchema>;
export type ProjectSpecInput = z.input<typeof projectSpecSchema>;
export type ResolvedProjectSpec = Omit<ProjectSpec, "auth"> & {
  auth: z.infer<typeof authProviderSchema>;
};
export type SpecIssue = { path: string; message: string };

export function deriveAuth(audience: ProjectSpec["audience"]) {
  return audience === "business" ? "clerk" : "convex-auth";
}

export function normalizeProjectSpec(input: unknown): ResolvedProjectSpec {
  const parsed = projectSpecSchema.parse(input);
  return { ...parsed, auth: parsed.auth ?? deriveAuth(parsed.audience) };
}

export function formatSpecIssues(error: z.ZodError): SpecIssue[] {
  return error.issues.map((issue) => ({
    path: issue.path.map(String).join("."),
    message: issue.message,
  }));
}

export function safeParseProjectSpec(
  input: unknown,
):
  | { success: true; data: ResolvedProjectSpec; issues: [] }
  | { success: false; data: null; issues: SpecIssue[] } {
  const result = projectSpecSchema.safeParse(input);
  if (!result.success) {
    return { success: false, data: null, issues: formatSpecIssues(result.error) };
  }
  return {
    success: true,
    data: { ...result.data, auth: result.data.auth ?? deriveAuth(result.data.audience) },
    issues: [],
  };
}

const SECRET_KEY_PATTERN = /(secret|token|password|api[_-]?key|private[_-]?key|credential)/i;

export function findSecretLikeKeys(input: unknown, path = ""): string[] {
  if (Array.isArray(input)) {
    return input.flatMap((value, index) => findSecretLikeKeys(value, `${path}[${index}]`));
  }
  if (!input || typeof input !== "object") return [];
  return Object.entries(input).flatMap(([key, value]) => {
    const nextPath = path ? `${path}.${key}` : key;
    const matches = SECRET_KEY_PATTERN.test(key) ? [nextPath] : [];
    return [...matches, ...findSecretLikeKeys(value, nextPath)];
  });
}

export const DEFAULT_PROJECT_SPEC: ResolvedProjectSpec = normalizeProjectSpec({
  name: "my-saas",
  description: "A small SaaS built on a validated project spec.",
});

export const DEMO_PROJECT_SPEC: ResolvedProjectSpec = normalizeProjectSpec({
  name: "northstar-notes",
  description: "A focused note-taking SaaS for independent consultants.",
  structure: "simple",
  audience: "individuals",
  payments: "stripe",
  domain: "notes.example.com",
  features: { demo: true, blog: false, email: "resend", analytics: "posthog" },
});
