# Conventions — New SaaS

These are the defaults every generated project inherits, and this tool follows.

## Styling

- Tailwind CSS (v4) + shadcn/ui.
- Theme: the tweakcn theme copied from `compliance-2`; the starting tokens are
  in `docs/reference/theme/index.css` with `components.json` alongside.
- Keep theme tokens isolated in one file so regenerating from the tweakcn link
  is a drop-in replacement.
- Use the existing UI primitives and the `cn()` helper; do not introduce a
  second component library.

## Structures

- Frontend: Next.js only for now. Vite is deferred.
- `simple`: `apps/web` + `convex/`. Frontend talks to Convex only.
- `complex`: `apps/web` + `convex/` + `services/api` (FastAPI/FastMCP).
  Frontend -> Convex only; Convex actions -> advanced backend with a shared
  secret. Direct frontend calls need a documented reason.

## Auth selection

- Business audience where SSO might be needed -> Clerk (reasonable SSO cost).
- Individuals and very small businesses -> Convex Auth v2 (replaces WorkOS for
  this segment).
- This tool itself -> Convex Auth v2.
- Read `docs/reference/convex-auth-v2.md` before v2 work.

## Payments

- Stripe only: Checkout/Portal, webhooks, plan gating, and a single source of
  truth for plan limits.

## Data and ingress

- Convex is the only public ingress. The advanced backend stays private behind
  Convex actions; direct frontend calls are a documented exception.
- Convex owns app/session/billing data and the public API surface.
- A complex project's advanced backend may own domain data (SQLite/Postgres).
  Declare the boundary in the spec; never dual-write the same entity.

## Graceful boot and demo mode

Every project must boot and be explorable even when Convex, auth, or Stripe is
not configured.

Env-driven modes (explicit, never silent):

- `NEXT_PUBLIC_AUTH_MODE=real | demo`
- `NEXT_PUBLIC_BILLING_MODE=stripe | demo`
- `NEXT_PUBLIC_DATA_MODE=convex | fixtures`

Rules:

- Detect capabilities in one module; never initialize the Clerk, Convex, or
  Stripe provider when its capability is missing.
- Missing config renders `/setup` (a checklist of missing env vars) or a demo
  shell with fixtures — never a crash.
- Demo mode requires an explicit flag and `NODE_ENV !== "production"`, and shows
  a persistent banner naming what is disabled.
- Production build/start fails if any demo mode is enabled.
- Payments: the pricing page still renders; checkout is disabled with a "not
  configured" note; webhooks no-op in dev.
- Data: fixtures use the same repository/adapter interface as Convex, seeded
  with a demo user and sample records.
- `npm run dev:demo` starts the app with demo auth, fixtures, and a mock plan.
- `.env.example` lists every required variable; `SETUP.md` links each provider.
- "Openable" is a phase gate: `npm run dev` must work with an empty env file.

## Code and process

- TypeScript strict; validate inputs at boundaries with zod/Convex validators.
- No secrets in specs, logs, or client payloads.
- Deterministic generation only; no freehand scaffolding.
- Generated projects must pass typecheck, build, and tests before handoff.
- Commit only when asked.
