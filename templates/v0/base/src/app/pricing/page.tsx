import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCapabilities } from "@/lib/capabilities";

const PLANS = [
  {
    id: "solo",
    name: "Solo",
    price: 9,
    description: "For one builder shipping small SaaS projects.",
    features: ["1 workspace", "Unlimited specs", "Deterministic downloads", "Demo mode"],
  },
  {
    id: "studio",
    name: "Studio",
    price: 29,
    description: "For a small studio running several projects.",
    features: ["5 workspaces", "Template version pinning", "Scaffold history", "Priority support"],
  },
] as const;

export default function PricingPage() {
  const capabilities = getCapabilities();
  const checkoutEnabled = capabilities.billing.mode === "stripe";

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="subtle">Stripe only</Badge>
          <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
            Simple plans for people who ship
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Payments use Stripe Checkout and Customer Portal. In v0 the page renders even when Stripe
            is absent; checkout is disabled with an explicit note.
          </p>
        </div>

        <div className="mx-auto mt-8 grid max-w-3xl gap-4 md:grid-cols-2">
          {PLANS.map((plan) => (
            <Card key={plan.id} className={plan.id === "studio" ? "border-primary/50" : ""}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{plan.name}</CardTitle>
                  {plan.id === "studio" && <Badge>Most popular</Badge>}
                </div>
                <p className="text-3xl font-bold">
                  ${plan.price}
                  <span className="text-sm font-normal text-muted-foreground">/mo</span>
                </p>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-1.5">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
                {checkoutEnabled ? (
                  <Button className="w-full" disabled>
                    Stripe Checkout not wired in v0
                  </Button>
                ) : (
                  <Button className="w-full" variant="outline" disabled>
                    Checkout not configured (demo billing)
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="mx-auto mt-6 max-w-xl text-center text-xs text-muted-foreground">
          No checkout, subscription, or webhook is triggered by this build.
          <Link href="/setup" className="ml-1 text-primary hover:underline">
            See setup
          </Link>
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
