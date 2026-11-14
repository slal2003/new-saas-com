# SaaS template — extraction spec

Requirements for the reusable project base extracted from `compliance-2`. This
is the input to the `new-saas` generator and the infra skills/agent.

## Stack (all projects)

- Frontend: Next.js (default) or Vite (exception).
- Backend: Convex for app logic, API surface, database, auth, payments.
- Styling: Tailwind CSS + shadcn/ui + the current tweakcn theme. Start from
  `compliance-2`'s `index.css`, `components.json`, and `src/components/ui/*`.
  Round-trips from the tweakcn link may change token values, so keep all theme
  tokens in one dedicated theme file; regeneration should be a drop-in swap,
  not a diff across components.

## Structure variants

Selected with `structure: simple | complex` in `project.yaml`.

### Simple

```text
apps/web        # Next.js (or Vite)
convex/         # logic, API, DB, auth, payments
```

The frontend talks to Convex only.

### Complex

```text
apps/web        # Next.js (or Vite)
convex/         # public API surface, DB, auth, payments, orchestration
services/api    # FastAPI / FastMCP: domain intelligence and heavy logic
```

- The frontend consumes Convex, not the advanced backend directly.
- Convex actions call `services/api` server-to-server with a shared secret —
  the same pattern `compliance-2` uses for its FastAPI ingest.
- Direct frontend → backend calls only for a documented reason (streaming,
  uploads, websockets).
- The advanced backend may own its own database (SQLite/Postgres/…). Define the
  ownership boundary up front: Convex holds app/session/billing data; the
  backend DB holds domain compute data.

## Infrastructure defaults

- Registrar: Dynadot.
- DNS: Cloudflare.
- Convex: local deployment for development, self-hosted Convex for production.
- Deploy: Dokploy (template or Docker Compose) with Traefik/TLS.
- Cloudflare Pages for static/edge-hosted projects.

Automation targets for the infra agent:

- Cloudflare: DNS records, zone settings, Pages. MCP:
  `https://mcp.cloudflare.com/mcp`.
- Dokploy: projects, applications, compose, domains, env, deployments, backups.
  MCP: `npx -y @dokploy/mcp` (`DOKPLOY_TOOL_PRESET=deploy` or `minimal`).
- Dynadot: verify nameservers and delegation. Domain registration/purchase
  stays a confirmed human step — API access is gated and purchases are
  irreversible.

## `project.yaml` additions

```yaml
structure: simple | complex
frontend: next          # Vite is deferred
backend:
  advanced: none | fastapi | fastmcp
  database: convex | sqlite | postgres
deploy:
  provider: dokploy
  convex: self-hosted | cloud
  dns: cloudflare
  registrar: dynadot
styling:
  theme: tweakcn
features:
  demo: true            # boot without auth/payments via demo modes
```

Existing fields: `name`, `audience`, `auth`, `payments`, `domain`, `features`,
`templateVersion`.

## Extraction inventory

Generic (goes into the template):

- App shell, dashboard layout/navigation, settings, onboarding.
- Auth switch: Clerk for B2B/SSO; Convex Auth v2 for individuals/VSB.
- Stripe billing, plans, and gating.
- Base Convex schema and function conventions.
- Styling: Tailwind config, shadcn setup, tweakcn theme tokens, UI primitives.
- Docs conventions, AGENTS.md, CI, Docker/Dokploy + self-hosted Convex compose,
  backup/restore notes.

Domain-specific (stays out):

- Regulations, feed, crawl runs, store profiles.
- Compliance prompts and the Python worker's domain logic.

## Decisions

1. **Frontend:** Next.js only for now. Vite is deferred — no v1 work.
2. **Self-hosted Convex:** the compose/Dokploy stack lives in the base template
   at `infra/convex/` (under the template root), with pinned versions, volumes,
   health checks, and backup/restore notes.
3. **Public ingress:** Convex is the only public ingress. The advanced backend
   (FastAPI/FastMCP) is private and called by Convex actions with a shared
   secret. Direct frontend -> backend calls are a documented exception
   (roughly 1% of projects).
4. **Data ownership:** Convex owns app/session/billing data; the advanced
   backend owns its domain data in its own DB (SQLite/Postgres). No dual writes.
5. **Still to verify:** auth on self-hosted Convex (Clerk JWT / Convex Auth v2),
   and whether Dynadot registration stays fully human-assisted.

## Phasing

- **Phase 0:** `project.yaml` + interview/form + validation.
- **Phase 1:** scaffold + infra (Cloudflare DNS, Dokploy project, self-hosted
  Convex, env/secrets, first deploy, health check).
- **Phase 2:** project-specific build.

Each phase gates on typecheck/build/tests, a project generated from scratch,
and a live health check.
