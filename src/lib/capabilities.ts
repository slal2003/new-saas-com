export type AuthMode = "real" | "demo" | "unconfigured";
export type DataMode = "convex" | "fixtures" | "unconfigured";
export type BillingMode = "stripe" | "demo" | "unconfigured";

export type MissingSetting = {
  key: string;
  label: string;
  fix: string;
};

export type Capabilities = {
  auth: { mode: AuthMode };
  data: { mode: DataMode; convexUrl: string | null };
  billing: { mode: BillingMode };
  demo: boolean;
  missing: MissingSetting[];
};

type Env = Record<string, string | undefined>;

const AUTH_VALUES = new Set(["real", "demo"]);
const DATA_VALUES = new Set(["convex", "fixtures"]);
const BILLING_VALUES = new Set(["stripe", "demo"]);

function read(env: Env, key: string): string | undefined {
  const value = env[key]?.trim();
  return value ? value : undefined;
}

function invalid(key: string, allowed: string[]): never {
  throw new Error(`${key} must be one of: ${allowed.join(", ")}.`);
}

export function resolveCapabilities(
  env: Env,
  nodeEnv: string = "development",
): Capabilities {
  const production = nodeEnv === "production";
  const convexUrl = read(env, "NEXT_PUBLIC_CONVEX_URL") ?? null;
  const authValue = read(env, "NEXT_PUBLIC_AUTH_MODE");
  const dataValue = read(env, "NEXT_PUBLIC_DATA_MODE");
  const billingValue = read(env, "NEXT_PUBLIC_BILLING_MODE");

  if (authValue && !AUTH_VALUES.has(authValue)) {
    invalid("NEXT_PUBLIC_AUTH_MODE", ["real", "demo"]);
  }
  if (dataValue && !DATA_VALUES.has(dataValue)) {
    invalid("NEXT_PUBLIC_DATA_MODE", ["convex", "fixtures"]);
  }
  if (billingValue && !BILLING_VALUES.has(billingValue)) {
    invalid("NEXT_PUBLIC_BILLING_MODE", ["stripe", "demo"]);
  }

  const explicitDemo =
    authValue === "demo" || dataValue === "fixtures" || billingValue === "demo";

  if (production && explicitDemo) {
    throw new Error(
      "Demo mode is enabled in a production build. Unset NEXT_PUBLIC_AUTH_MODE=demo, " +
        "NEXT_PUBLIC_DATA_MODE=fixtures, and NEXT_PUBLIC_BILLING_MODE=demo before building.",
    );
  }

  const requestedAuthMode: AuthMode = authValue
    ? (authValue as AuthMode)
    : convexUrl
      ? "real"
      : production
        ? "unconfigured"
        : "demo";
  const authMode: AuthMode =
    requestedAuthMode === "real" && !convexUrl ? "unconfigured" : requestedAuthMode;

  const requestedDataMode: DataMode = dataValue
    ? (dataValue as DataMode)
    : convexUrl
      ? "convex"
      : production
        ? "unconfigured"
        : "fixtures";
  const dataMode: DataMode =
    requestedDataMode === "convex" && !convexUrl ? "unconfigured" : requestedDataMode;

  const stripeConfigured = Boolean(
    read(env, "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY") || billingValue === "stripe",
  );

  const billingMode: BillingMode = billingValue
    ? (billingValue as BillingMode)
    : stripeConfigured
      ? "stripe"
      : production
        ? "unconfigured"
        : "demo";

  const missing: MissingSetting[] = [];
  const addMissing = (setting: MissingSetting) => {
    if (!missing.some((item) => item.key === setting.key)) {
      missing.push(setting);
    }
  };

  if (!convexUrl && (requestedAuthMode === "real" || requestedDataMode === "convex")) {
    addMissing({
      key: "NEXT_PUBLIC_CONVEX_URL",
      label: "Convex deployment URL",
      fix: "Run `npx convex dev` and copy the deployment URL into .env.local.",
    });
  }
  if (authMode === "unconfigured") {
    addMissing({
      key: "NEXT_PUBLIC_AUTH_MODE",
      label: "Auth mode",
      fix: "Set `NEXT_PUBLIC_AUTH_MODE=real` and configure Convex Auth.",
    });
  }
  if (dataMode === "unconfigured") {
    addMissing({
      key: "NEXT_PUBLIC_CONVEX_URL",
      label: "Data backend",
      fix: "Set `NEXT_PUBLIC_CONVEX_URL`, or run the app in development for fixtures.",
    });
  }
  if (billingMode === "unconfigured") {
    addMissing({
      key: "NEXT_PUBLIC_BILLING_MODE",
      label: "Billing mode",
      fix: "Set `NEXT_PUBLIC_BILLING_MODE=stripe` with Stripe keys, or leave demo billing in development.",
    });
  }

  return {
    auth: { mode: authMode },
    data: {
      mode: dataMode === "convex" && !convexUrl ? "unconfigured" : dataMode,
      convexUrl,
    },
    billing: { mode: billingMode },
    demo: authMode === "demo" || dataMode === "fixtures" || billingMode === "demo",
    missing,
  };
}

let cached: Capabilities | null = null;

export function getCapabilities(): Capabilities {
  if (!cached) {
    cached = resolveCapabilities(process.env, process.env.NODE_ENV ?? "development");
  }
  return cached;
}

export function demoLabel(capabilities: Capabilities): string {
  const disabled: string[] = [];
  if (capabilities.auth.mode === "demo") disabled.push("real auth");
  if (capabilities.data.mode === "fixtures") disabled.push("live data");
  if (capabilities.billing.mode === "demo") disabled.push("payments");
  return disabled.join(", ");
}
