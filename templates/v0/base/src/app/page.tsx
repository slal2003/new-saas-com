import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Code2,
  Database,
  Layers3,
  LockKeyhole,
  Palette,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const FEATURES = [
  {
    icon: LockKeyhole,
    title: "Auth that ships",
    description:
      "Convex Auth v2 with username + password, no external auth service, and no JWT secrets to configure.",
  },
  {
    icon: Database,
    title: "Convex-first data",
    description:
      "Queries and mutations are scoped by identity. The frontend talks to Convex only; there is no second ingress.",
  },
  {
    icon: Palette,
    title: "One theme file",
    description:
      "Tailwind v4 and shadcn/ui with all tweakcn tokens isolated in src/app/theme.css for a drop-in swap.",
  },
  {
    icon: ShieldCheck,
    title: "Opens without integrations",
    description:
      "An empty env file boots in demo mode with fixtures and mock billing. Production rejects demo mode.",
  },
  {
    icon: Layers3,
    title: "Deterministic base",
    description:
      "The scaffold comes from a versioned template and a template.lock checksum, not from freehand generation.",
  },
  {
    icon: Code2,
    title: "AI-agent ready",
    description:
      "AGENTS.md, SETUP.md, and clear boundaries so agents extend the template instead of drifting it.",
  },
] as const;

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

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
                <Sparkles className="size-3" /> Ready for your domain logic
              </Badge>

              <h1 className="text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl">
                {"{{project.name}}"}
                <span className="block text-primary">starts from a working base.</span>
              </h1>

              <p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                {"{{project.description}}"} Auth, dashboard, Convex, demo mode, and a theme that does
                not drift are already here. Build only what makes this product unique.
              </p>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button size="lg" asChild>
                  <Link href="/sign-in">
                    Get started <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/dashboard">Open the dashboard</Link>
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5 text-primary" /> Convex Auth v2
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5 text-primary" /> Demo mode included
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5 text-primary" /> Typecheck · test · build
                </span>
              </div>
            </div>

            <Card className="overflow-hidden border-border/80 shadow-xl">
              <CardHeader className="flex-row items-center justify-between gap-3 border-b border-border/70 bg-muted/40 py-3">
                <div className="flex items-center gap-2">
                  <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                    <Sparkles className="size-3.5" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold">Workspace</p>
                    <p className="text-[10px] text-muted-foreground">scoped by identity</p>
                  </div>
                </div>
                <Badge variant="outline" className="gap-1 text-[10px] text-primary">
                  <span className="size-1.5 animate-pulse rounded-full bg-primary" /> ready
                </Badge>
              </CardHeader>
              <CardContent className="space-y-3 p-4">
                {[
                  ["Spec and template locked", "template.lock"],
                  ["Auth with no external service", "Convex Auth v2"],
                  ["Demo mode blocked in production", "guard"],
                  ["Infrastructure plan only", "no API calls"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2 text-xs"
                  >
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium text-primary">{value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="features" className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="subtle">Included in the base</Badge>
            <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
              Generic on purpose, extensible by design
            </h2>
            <p className="mt-2 text-sm text-muted-foreground sm:text-base">
              Add a project-specific feature as a module. Do not fork the base.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <Card key={feature.title} className="h-full">
                <CardHeader className="gap-2">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <feature.icon className="size-4.5" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {feature.description}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 lg:pb-20">
          <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-primary/10 p-8 text-center sm:p-12">
            <div className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-primary/20 blur-3xl" />
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Start with the base, then build the difference
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">
              Open the dashboard with empty env in development, then wire Convex and Stripe when the
              product needs them.
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/dashboard">
                  Open dashboard <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/setup">Read setup</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
