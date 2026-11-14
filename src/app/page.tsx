import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Cloud,
  Code2,
  Download,
  FileJson2,
  Fingerprint,
  Layers3,
  LockKeyhole,
  Palette,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { SiteFooter } from "@/components/site-footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SURFACES = [
  {
    icon: FileJson2,
    title: "Spec intake",
    description:
      "A form and YAML editor produce the same validated project.yaml. Unknown keys and secret-like fields are rejected.",
  },
  {
    icon: EyeIcon,
    title: "Live plan preview",
    description:
      "Zod validation resolves a ProjectPlan: auth provider, modules, env var names, directories, and infra steps.",
  },
  {
    icon: Download,
    title: "Deterministic scaffold",
    description:
      "Templates plus a renderer produce a ZIP with a template.lock checksum. No model writes files.",
  },
  {
    icon: Cloud,
    title: "Stubbed provisioning",
    description:
      "Cloudflare and Dokploy steps are modeled as plan -> dry-run -> typed confirmation. v0 never calls an external API.",
  },
] as const;

const RULES = [
  "Same Next.js App Router + Convex stack the tool generates.",
  "Same tweakcn theme tokens, isolated in one drop-in file.",
  "Same Convex Auth v2 rule for individuals and very small businesses.",
  "Same shared project.yaml schema used by the form, API, and renderer.",
  "Demo mode is explicit, banner-marked, and rejected in production.",
] as const;

function EyeIcon({ className }: { className?: string }) {
  return <Sparkles className={className} />;
}

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />

      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-border/70">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:56px_56px] opacity-50 [mask-image:radial-gradient(ellipse_at_top,black,transparent_75%)]"
          />
          <div className="pointer-events-none absolute -top-32 left-1/2 -z-10 h-96 w-[800px] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />

          <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
            <div className="space-y-7">
              <Badge variant="outline" className="gap-1.5 border-primary/40 bg-primary/5 px-3 py-1 text-primary">
                <Fingerprint className="size-3" /> v0 · spec to scaffold
              </Badge>

              <h1 className="text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.4rem]">
                Stop rebuilding
                <span className="block text-primary">the same SaaS base.</span>
              </h1>

              <p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                Write one small spec. Get a validated, reproducible Next.js + Convex project with
                auth, billing scaffolding, demo mode, theme tokens, and an infrastructure plan — every
                time the same output.
              </p>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button size="lg" asChild>
                  <Link href="/projects/new">
                    Build a scaffold <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/dashboard">Open demo dashboard</Link>
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5 text-primary" /> No model-generated files
                </span>
                <span className="flex items-center gap-1.5">
                  <LockKeyhole className="size-3.5 text-primary" /> Env var names, never secrets
                </span>
                <span className="flex items-center gap-1.5">
                  <Code2 className="size-3.5 text-primary" /> Typecheck · test · build
                </span>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-tr from-primary/20 via-transparent to-secondary/30 blur-2xl" />
              <Card className="overflow-hidden border-border/80 shadow-xl">
                <CardHeader className="flex-row items-center justify-between gap-3 border-b border-border/70 bg-muted/40 py-3">
                  <div className="flex items-center gap-2">
                    <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                      <FileJson2 className="size-3.5" />
                    </span>
                    <div>
                      <p className="text-xs font-semibold">project.yaml</p>
                      <p className="text-[10px] text-muted-foreground">validated · resolved · locked</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="gap-1 text-[10px] text-primary">
                    <span className="size-1.5 animate-pulse rounded-full bg-primary" /> deterministic
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-3 p-4">
                  <pre className="overflow-x-auto rounded-lg border border-border bg-background p-3 text-[11px] leading-relaxed text-muted-foreground">
{`name: northstar-notes
structure: simple
frontend: next
backend:
  advanced: none
  database: convex
audience: individuals
auth: convex-auth
payments: stripe
deploy:
  provider: dokploy
  convex: self-hosted
features:
  demo: true`}
                  </pre>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    {[
                      { label: "modules", value: "7" },
                      { label: "env vars", value: "9" },
                      { label: "infra steps", value: "6" },
                    ].map((item) => (
                      <div key={item.label} className="rounded-lg border border-border bg-background p-2">
                        <p className="text-sm font-semibold">{item.value}</p>
                        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                          {item.label}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-primary/5 px-3 py-2 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="size-3.5 text-primary" /> Zod validated at every boundary
                    </span>
                    <span className="font-medium text-primary">template.lock</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section id="how" className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="subtle">Four surfaces</Badge>
            <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
              A small deterministic pipeline, not a code generator
            </h2>
            <p className="mt-2 text-sm text-muted-foreground sm:text-base">
              The contract is the spec. Templates are versioned. The renderer only composes and
              substitutes.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SURFACES.map((surface) => (
              <Card key={surface.title} className="h-full">
                <CardHeader className="gap-2">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <surface.icon className="size-4.5" />
                  </div>
                  <CardTitle>{surface.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {surface.description}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="border-y border-border/70 bg-card/40">
          <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:py-20">
            <div>
              <Badge variant="subtle">Dogfooding</Badge>
              <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                The tool follows its own contract
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                This app is a simple-structure project: App Router, Convex, Convex Auth v2, Stripe
                defaults, Tailwind v4 with the same tweakcn theme. Its own{" "}
                <code className="rounded bg-muted px-1 py-0.5 text-xs">project.yaml</code> is a valid
                spec for the tool.
              </p>
              <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
                {RULES.map((rule) => (
                  <li key={rule} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                    {rule}
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid gap-3">
              {[
                {
                  icon: Layers3,
                  title: "Simple by default",
                  body: "apps/web-style App Router + convex/. The complex FastAPI structure is resolved but deferred in v0.",
                },
                {
                  icon: Palette,
                  title: "One theme file",
                  body: "All tweakcn tokens live in src/app/theme.css. Regenerating the theme is a drop-in swap.",
                },
                {
                  icon: ShieldCheck,
                  title: "Graceful boot",
                  body: "Empty .env.local still opens in development: demo auth, fixtures, mock plan, and a visible banner.",
                },
              ].map((item) => (
                <Card key={item.title}>
                  <CardContent className="flex items-start gap-3 p-4">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <item.icon className="size-4.5" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.body}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-primary/10 p-8 text-center sm:p-12">
            <div className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-primary/20 blur-3xl" />
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Start with a spec you can validate
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">
              Build the plan, inspect every file decision, then download a ZIP with a checksum.
              Infrastructure stays a documented, dry-run-only plan.
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/projects/new">
                  Open the intake <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/setup">See setup requirements</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
