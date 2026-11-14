# New SaaS (`new-saas-com`)

Production domain: **new-saas.com**

A webapp tool that turns a small, validated `project.yaml` spec into a
reproducible SaaS project base — then, later, provisions the infrastructure
(Cloudflare DNS, Dokploy, self-hosted Convex).

The tool dogfoods the stack it generates:
Next.js App Router + Convex + Tailwind/shadcn (tweakcn theme) + Convex Auth v2
+ Stripe defaults.

## Status — v0 bootstrap

Done:

- Next.js App Router, TypeScript strict, Tailwind v4, shadcn/ui, tweakcn theme.
- Convex base schema and user-scoped functions for users, projects, specs,
  templates, scaffold jobs, integrations, provisioning jobs, and audit events.
- Convex Auth v2 (username + password) with server routes, a protected dashboard,
  and a guarded production mode.
- Intake form → live `project.yaml` → zod validation → resolved `ProjectPlan`.
- Deterministic ZIP renderer for `structure: simple` using `templates/v0/`, with
  a generated `template.lock` checksum.
- Demo modes (`npm run dev` with an empty env file), `/setup`, fixtures, and a
  production guard that rejects demo mode.
- Stubbed infrastructure plan (no external API calls).

Deferred and explicit:

- `structure: complex` resolves in the plan but does not render in v0.
- Clerk/B2B auth resolves in the plan but is not in the v0 template.
- Stripe Checkout/webhooks are not wired; the pricing page renders with
  checkout disabled.
- Cloudflare/Dokploy/Convex provisioning is plan-only.

See [SETUP.md](SETUP.md) and [docs/05-v0-bootstrap.md](docs/05-v0-bootstrap.md).

## Quick start

```bash
cp .env.example .env.local   # or leave the file empty in development
npm install
npm run dev
```

Empty env in development opens with demo auth, fixtures, and mock billing. The
demo banner names what is disabled. `npm run dev:demo` sets the demo flags
explicitly. Demo mode is rejected by `npm run build` and by the runtime
capabilities guard in production.

```bash
npm run typecheck
npm run test
npm run build
```

## Layout

```text
src/            # Next.js App Router
convex/         # schema, queries, mutations, actions, http
templates/v0/   # versioned scaffold template (ships with the tool)
docs/           # product, architecture, spec, infra, conventions
```

`project.yaml` in the repo root is this tool's own spec (dogfooding). The
schema lives in one module: `src/lib/spec/schema.ts`.

## Read first

- [docs/00-product.md](docs/00-product.md) — vision, audience, milestones
- [docs/01-architecture.md](docs/01-architecture.md) — stack, data model, generation engine
- [docs/02-project-spec.md](docs/02-project-spec.md) — `project.yaml` contract and template structures
- [docs/03-infra.md](docs/03-infra.md) — Dokploy / Cloudflare / Convex / Dynadot defaults and agent scope
- [docs/04-conventions.md](docs/04-conventions.md) — styling, auth selection, payments, code conventions
- [docs/05-v0-bootstrap.md](docs/05-v0-bootstrap.md) — what shipped, what is stubbed, decisions to review
- [docs/reference/convex-auth-v2.md](docs/reference/convex-auth-v2.md) — Convex Auth v2 reference
- [docs/reference/theme/](docs/reference/theme/) — the exact tweakcn theme files to start from
