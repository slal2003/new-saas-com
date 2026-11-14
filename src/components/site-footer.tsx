import Link from "next/link";
import { Logo } from "@/components/logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/70 bg-muted/30">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="space-y-3 md:col-span-2">
          <Logo />
          <p className="max-w-sm text-sm text-muted-foreground">
            A validated <code className="rounded bg-muted px-1 py-0.5 text-xs">project.yaml</code> in,
            a deterministic Next.js + Convex base out. The same schema, theme, and auth rule power
            this tool and every generated project.
          </p>
          <p className="text-xs text-muted-foreground">
            Infrastructure provisioning is planned but disabled in v0. Nothing here calls Cloudflare,
            Dokploy, Dynadot, Convex Cloud, or Stripe.
          </p>
        </div>
        <div className="space-y-2 text-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tool</p>
          <Link href="/projects/new" className="block text-muted-foreground hover:text-foreground">
            New project
          </Link>
          <Link href="/dashboard" className="block text-muted-foreground hover:text-foreground">
            Dashboard
          </Link>
          <Link href="/setup" className="block text-muted-foreground hover:text-foreground">
            Setup
          </Link>
        </div>
        <div className="space-y-2 text-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Reference
          </p>
          <span className="block text-muted-foreground">Next.js App Router</span>
          <span className="block text-muted-foreground">Convex + Convex Auth v2</span>
          <span className="block text-muted-foreground">Tailwind v4 + shadcn/ui</span>
        </div>
      </div>
      <div className="border-t border-border/70">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span>© {new Date().getFullYear()} New SaaS. Built with the stack it generates.</span>
          <span>Template v0.1.0 · deterministic by design</span>
        </div>
      </div>
    </footer>
  );
}
