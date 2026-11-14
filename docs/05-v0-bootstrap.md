# v0 bootstrap — what shipped

Production domain: `new-saas.com` (repo: `new-saas-com`).

## Delivered

### App

- Next.js App Router, TypeScript strict, `src/` layout.
- Tailwind CSS v4 + shadcn/ui primitives. Theme tokens are copied verbatim from
  `docs/reference/theme/index.css` into `src/app/theme.css`; `globals.css` only
  imports it, so a tweakcn regeneration is a drop-in swap.
- Landing, pricing, setup, sign-in, intake, and dashboard pages.
- Capability module (`src/lib/capabilities.ts`) resolves auth/data/billing modes
  once; providers are never initialized when their capability is missing.

### Convex

- `convex/schema.ts`: `users`, `projects`, `specs`, `templates`, `scaffoldJobs`,
  `integrations`, `provisionJobs`, `auditEvents` (the architecture also lists
  `provisionJobs`; it is included).
- User-scoped queries/mutations and audit events.
- Integrations store only encrypted references and return safe metadata.
- Convex Auth v2 with username + password, no external auth service and no
  auth secrets.

### Intake and generation

- One zod schema (`src/lib/spec/schema.ts`) used by the form, the YAML editor,
  the API route, the plan resolver, and the renderer.
- `resolveProjectPlan` returns auth, payments, modules, env var names,
  directories, and stubbed infra steps.
- `renderScaffold` walks `templates/v0/base`, applies a fixed substitution map,
  includes/excludes feature folders, and emits `project.yaml`, `.env.example`,
  `SETUP.md`, and `template.lock`.
- `template.lock` contains per-file SHA-256 hashes and a checksum. ZIP entries
  use a fixed timestamp, so the same spec + template yields the same bytes.

### Demo and safety

- Empty env in development → demo auth, fixtures, mock billing, persistent
  banner.
- Missing config in production → `/setup`, not a crash.
- Explicit demo flags in production fail `npm run build` and throw in the
  capabilities module.
- Secrets are rejected at the schema boundary by strict objects and a
  secret-like key scan; plans carry env var names only.

## Verified

- `npm run typecheck`
- `npm run test` (26 tests)
- `npm run build` (Next 16.4.6, Turbopack)
- `npm run dev` with no `.env.local`; all main routes return 200 and the browser
  confirms demo hydration/navigation.
- The generated `northstar-notes` scaffold installs, typechecks, tests, builds,
  and boots in demo mode in isolation.

## Stubbed / deferred

- `structure: complex` is resolved but blocked from rendering in v0.
- Clerk/B2B auth is resolved but not in the v0 template.
- Stripe Checkout, Portal, webhooks, and plan gating: pricing page only.
- Provisioning jobs record plans and confirmations but execute nothing.
  Cloudflare, Dokploy, Dynadot, Convex Cloud, and Stripe are never called.
- Integration encryption helpers are not implemented; the schema and API surface
  are placeholders that never return secret material.

## Decisions to review

1. **Convex codegen without provisioning.** `convex/_generated/` is checked in
   by hand because `npx convex codegen` requires a deployment selection, and this
   session did not create a Convex project/deployment (no external resources).
   Run `npx convex dev --configure new --dev-deployment local` and then
   `npx convex codegen` to replace the stubs with real generated types.
2. **Empty-env development defaults to demo.** The docs call demo mode
   "explicit", while the phase gate requires an empty env to open. Resolution:
   empty env in development derives demo modes (banner-marked); production never
   derives demo and explicit demo flags are rejected. If you prefer a mandatory
   flag even in development, change `resolveCapabilities`.
3. **Simple-only rendering.** The product milestone mentions simple and complex;
   this session's instruction specified simple. The complex plan is still
   visible so the UI does not lie about support.
4. **ZIP from a Next route.** Docs allow a Convex action or a Next route. v0 uses
   a stateless Next route so demo mode works with no Convex deployment.
5. **Template size.** The extracted base covers the generic engine (app shell,
   auth, dashboard, theme, demo, Convex conventions, infra). Stripe and the
   advanced backend are interface stubs, not full implementations.
6. **Real auth path is wired, not exercised.** Convex Auth v2 SSR routes,
   cookies, and the proxy follow the v2 reference, but there is no live
   deployment in this session to run a real sign-in. Demo auth and the
   pre-deployment type/build checks are the verified paths.
