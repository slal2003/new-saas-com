import Link from "next/link";
import { Logo } from "@/components/logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/70 bg-muted/30">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="space-y-3 md:col-span-2">
          <Logo />
          <p className="max-w-sm text-sm text-muted-foreground">{"{{project.description}}"}</p>
          <p className="text-xs text-muted-foreground">
            Built from a validated project.yaml with a deterministic new-saas template.
          </p>
        </div>
        <div className="space-y-2 text-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">App</p>
          <Link href="/dashboard" className="block text-muted-foreground hover:text-foreground">
            Dashboard
          </Link>
          <Link href="/pricing" className="block text-muted-foreground hover:text-foreground">
            Pricing
          </Link>
          <Link href="/setup" className="block text-muted-foreground hover:text-foreground">
            Setup
          </Link>
        </div>
        <div className="space-y-2 text-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Stack</p>
          <span className="block text-muted-foreground">Next.js App Router</span>
          <span className="block text-muted-foreground">Convex + Convex Auth v2</span>
          <span className="block text-muted-foreground">Tailwind v4 + shadcn/ui</span>
        </div>
      </div>
      <div className="border-t border-border/70">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span>
            © {new Date().getFullYear()} {"{{project.name}}"}
          </span>
          <span>template v{"{{spec.templateVersion}}"} · {{spec.auth}}</span>
        </div>
      </div>
    </footer>
  );
}
