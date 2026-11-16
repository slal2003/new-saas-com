import Link from "next/link";
import { AlertTriangle, CheckCircle2, CircleDashed, FlaskConical, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCapabilities } from "@/lib/capabilities";

const SETTINGS = [
  {
    key: "NEXT_PUBLIC_CONVEX_URL",
    label: "Convex deployment URL",
    fix: "Run `npx convex dev --configure new --dev-deployment local` and copy the URL.",
  },
  {
    key: "NEXT_PUBLIC_AUTH_MODE",
    label: "Auth mode",
    fix: "Set `real` after Convex Auth is deployed; `demo` is local-only.",
  },
  {
    key: "NEXT_PUBLIC_DATA_MODE",
    label: "Data mode",
    fix: "Set `convex` for live data; `fixtures` is local-only.",
  },
  {
    key: "NEXT_PUBLIC_BILLING_MODE",
    label: "Billing mode",
    fix: "Set `stripe` with Stripe keys; `demo` disables checkout and is local-only.",
  },
  {
    key: "NEXT_PUBLIC_APP_URL",
    label: "App URL",
    fix: "Set the canonical URL used by metadata and auth redirects.",
  },
  {
    key: "STRIPE_SECRET_KEY",
    label: "Stripe secret key (server)",
    fix: "Set it in the deployment platform. Never in the spec or a public variable.",
  },
  {
    key: "STRIPE_WEBHOOK_SECRET",
    label: "Stripe webhook secret (server)",
    fix: "Set it in the deployment platform after the webhook endpoint exists.",
  },
] as const;

export function SetupChecklist() {
  const capabilities = getCapabilities();

  return (
    <div className="space-y-6">
      <div>
        <Badge variant="subtle">Capabilities</Badge>
        <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Setup checklist</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          The app must boot with an empty <code className="rounded bg-muted px-1 py-0.5 text-xs">.env.local</code>.
          Missing capabilities render here or in demo mode; they never crash a page.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Auth", value: capabilities.auth.mode },
          { label: "Data", value: capabilities.data.mode },
          { label: "Billing", value: capabilities.billing.mode },
        ].map((item) => (
          <Card key={item.label}>
            <CardContent className="p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{item.label}</p>
              <p className="mt-1 text-lg font-semibold capitalize">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {capabilities.demo && (
        <Card className="border-primary/40 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <FlaskConical className="size-4 text-primary" /> Demo mode is active
            </CardTitle>
            <CardDescription>
              Demo auth, fixtures, and/or mock billing are enabled. This is visibly banner-marked
              and rejected by <code className="rounded bg-muted px-1 py-0.5 text-xs">npm run build</code>{" "}
              when the demo flags are set in production.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Start it deliberately with <code className="rounded bg-muted px-1 py-0.5">npm run dev:demo</code>.
            Plain <code className="rounded bg-muted px-1 py-0.5">npm run dev</code> also opens without
            integrations in development.
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Variables</CardTitle>
          <CardDescription>
            Values are never displayed. Secret keys are checked for presence only.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {SETTINGS.map((setting) => {
            const present = Boolean(process.env[setting.key]?.trim());
            return (
              <div
                key={setting.key}
                className="flex flex-wrap items-start justify-between gap-2 rounded-lg border border-border p-3"
              >
                <div className="flex items-start gap-2">
                  {present ? (
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                  ) : (
                    <CircleDashed className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  )}
                  <div>
                    <p className="font-mono text-xs font-medium">{setting.key}</p>
                    <p className="text-xs text-muted-foreground">{setting.label}</p>
                    {!present && <p className="mt-1 text-xs text-muted-foreground">{setting.fix}</p>}
                  </div>
                </div>
                <Badge variant={present ? "success" : "subtle"}>{present ? "set" : "missing"}</Badge>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {capabilities.missing.length > 0 && (
        <Card className="border-destructive/30">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="size-4 text-destructive" /> Blocking settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            {capabilities.missing.map((item) => (
              <p key={item.key}>
                <span className="font-mono text-xs text-foreground">{item.key}</span> — {item.fix}
              </p>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="size-4 text-primary" /> Production guard
          </CardTitle>
          <CardDescription>
            Demo mode requires an explicit flag and is rejected when{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">NODE_ENV=production</code>.
            Run the app with <code className="rounded bg-muted px-1 py-0.5 text-xs">npm run dev</code>{" "}
            for the empty-env path, or <code className="rounded bg-muted px-1 py-0.5 text-xs">npm run dev:demo</code>{" "}
            for explicit demo flags.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href="/projects/new">Build a scaffold</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard">Open dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
