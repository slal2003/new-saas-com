import type { ResolvedProjectSpec } from "@/lib/spec/schema";

export const TEMPLATE_ID = "v0";
export const TEMPLATE_VERSION = "0.1.0";

export type TemplateModuleId =
  | "app-shell"
  | "auth"
  | "dashboard"
  | "settings"
  | "billing"
  | "demo"
  | "convex-base"
  | "infra-convex"
  | "blog"
  | "email"
  | "analytics";

export type PlanEnvVar = {
  name: string;
  visibility: "public" | "server";
  required: boolean;
  description: string;
};

export type InfraStep = {
  id: string;
  provider: "cloudflare" | "dokploy" | "convex" | "dynadot";
  title: string;
  description: string;
  destructive: boolean;
  stubbed: true;
};

export type ProjectPlan = {
  slug: string;
  template: { id: typeof TEMPLATE_ID; version: string; structure: ResolvedProjectSpec["structure"] };
  renderable: boolean;
  blockers: string[];
  warnings: string[];
  auth: { provider: ResolvedProjectSpec["auth"]; reason: string };
  payments: ResolvedProjectSpec["payments"];
  modules: TemplateModuleId[];
  envVars: PlanEnvVar[];
  infra: InfraStep[];
  directories: string[];
};

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

const BASE_ENV_VARS: PlanEnvVar[] = [
  {
    name: "NEXT_PUBLIC_APP_URL",
    visibility: "public",
    required: true,
    description: "Canonical app URL used for metadata and auth redirects.",
  },
  {
    name: "NEXT_PUBLIC_CONVEX_URL",
    visibility: "public",
    required: true,
    description: "Convex deployment URL (from `npx convex dev`).",
  },
  {
    name: "CONVEX_DEPLOYMENT",
    visibility: "server",
    required: true,
    description: "Convex deployment selector used by the CLI.",
  },
  {
    name: "NEXT_PUBLIC_AUTH_MODE",
    visibility: "public",
    required: true,
    description: "`real` for Convex Auth, `demo` for the local demo shell.",
  },
  {
    name: "NEXT_PUBLIC_DATA_MODE",
    visibility: "public",
    required: true,
    description: "`convex` for live data, `fixtures` for the demo repository.",
  },
  {
    name: "NEXT_PUBLIC_BILLING_MODE",
    visibility: "public",
    required: true,
    description: "`stripe` for live billing, `demo` to disable checkout.",
  },
];

const STRIPE_ENV_VARS: PlanEnvVar[] = [
  {
    name: "STRIPE_SECRET_KEY",
    visibility: "server",
    required: true,
    description: "Stripe secret key. Never exposed to the client.",
  },
  {
    name: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
    visibility: "public",
    required: true,
    description: "Stripe publishable key used by Checkout.",
  },
  {
    name: "STRIPE_WEBHOOK_SECRET",
    visibility: "server",
    required: true,
    description: "Stripe webhook signing secret.",
  },
];

const FEATURE_ENV_VARS: Record<string, PlanEnvVar> = {
  resend: {
    name: "RESEND_API_KEY",
    visibility: "server",
    required: true,
    description: "Resend API key for transactional email.",
  },
  posthog: {
    name: "NEXT_PUBLIC_POSTHOG_KEY",
    visibility: "public",
    required: true,
    description: "PostHog project key for analytics.",
  },
};

function envVarsFor(spec: ResolvedProjectSpec): PlanEnvVar[] {
  const vars = [...BASE_ENV_VARS];
  if (spec.payments === "stripe") vars.push(...STRIPE_ENV_VARS);
  if (spec.features.email === "resend") vars.push(FEATURE_ENV_VARS.resend);
  if (spec.features.analytics === "posthog") vars.push(FEATURE_ENV_VARS.posthog);
  return vars;
}

function modulesFor(spec: ResolvedProjectSpec): TemplateModuleId[] {
  const modules: TemplateModuleId[] = [
    "app-shell",
    "auth",
    "dashboard",
    "settings",
    "convex-base",
  ];
  if (spec.payments === "stripe") modules.push("billing");
  if (spec.features.demo) modules.push("demo");
  if (spec.deploy.convex === "self-hosted") modules.push("infra-convex");
  if (spec.features.blog) modules.push("blog");
  if (spec.features.email === "resend") modules.push("email");
  if (spec.features.analytics === "posthog") modules.push("analytics");
  return modules;
}

function infraStepsFor(spec: ResolvedProjectSpec): InfraStep[] {
  return [
    {
      id: "dns-zone",
      provider: "cloudflare",
      title: "Point DNS at Cloudflare",
      description:
        "Create or verify the Cloudflare zone for the domain, then create the app record. Nameserver changes are confirmed by a human.",
      destructive: false,
      stubbed: true,
    },
    {
      id: "dokploy-app",
      provider: "dokploy",
      title: "Create the Dokploy application",
      description:
        "Create the project and app (or compose service), attach the domain, and enable Traefik TLS.",
      destructive: false,
      stubbed: true,
    },
    {
      id: "convex-deployment",
      provider: "convex",
      title: spec.deploy.convex === "self-hosted" ? "Deploy self-hosted Convex" : "Link Convex Cloud",
      description:
        spec.deploy.convex === "self-hosted"
          ? "Apply infra/convex/docker-compose.yml, create volumes, wait for health, then set the deployment URL and env."
          : "Link the hosted Convex deployment and sync environment variables.",
      destructive: false,
      stubbed: true,
    },
    {
      id: "app-env-deploy",
      provider: "dokploy",
      title: "Set env vars and deploy",
      description:
        "Reference env var names only; set values in Dokploy, deploy, and wait for the health check.",
      destructive: false,
      stubbed: true,
    },
    {
      id: "verify",
      provider: "cloudflare",
      title: "Verify DNS, HTTPS, and Convex reachability",
      description:
        "Run the HTTP health check, confirm DNS resolution and TLS, and record the result in the audit log.",
      destructive: false,
      stubbed: true,
    },
    {
      id: "backups",
      provider: "convex",
      title: "Schedule backups",
      description:
        "Configure the Convex volume backup and complete a restore drill before handoff.",
      destructive: false,
      stubbed: true,
    },
  ];
}

export function resolveProjectPlan(spec: ResolvedProjectSpec): ProjectPlan {
  const slug = slugify(spec.name) || "project";
  const blockers: string[] = [];
  const warnings: string[] = [];

  if (spec.structure !== "simple") {
    blockers.push("The v0 scaffold download supports structure: simple only.");
  }
  if (spec.auth === "clerk") {
    blockers.push("The v0 template ships Convex Auth v2 only; Clerk is deferred.");
  }
  if (spec.templateVersion !== TEMPLATE_VERSION) {
    blockers.push(
      `Template version ${spec.templateVersion} is not available; v0 pins ${TEMPLATE_VERSION}.`,
    );
  }

  if (spec.features.blog) warnings.push("Blog module is included as an opt-in folder.");
  if (spec.features.email === "resend") {
    warnings.push("Email module is included; RESEND_API_KEY must be set by hand.");
  }
  if (spec.features.analytics === "posthog") {
    warnings.push("Analytics module is included; NEXT_PUBLIC_POSTHOG_KEY must be set by hand.");
  }

  const authReason =
    spec.auth === "clerk"
      ? "Business audience: Clerk is the rule for SSO-heavy products."
      : "Individuals and very small businesses: Convex Auth v2, with no external auth service.";

  const directories = ["src/app", "src/components", "src/lib", "convex"];
  if (spec.deploy.convex === "self-hosted") directories.push("infra/convex");
  if (spec.structure === "complex") directories.push("services/api");

  return {
    slug,
    template: { id: TEMPLATE_ID, version: TEMPLATE_VERSION, structure: spec.structure },
    renderable: blockers.length === 0,
    blockers,
    warnings,
    auth: { provider: spec.auth, reason: authReason },
    payments: spec.payments,
    modules: modulesFor(spec),
    envVars: envVarsFor(spec),
    infra: infraStepsFor(spec),
    directories,
  };
}

export function assertRenderable(plan: ProjectPlan): void {
  if (!plan.renderable) {
    throw new Error(plan.blockers.join(" "));
  }
}
