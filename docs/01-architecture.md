# Architecture — New SaaS

## Stack (dogfooded)

- Next.js App Router + TypeScript (strict), `src/` layout.
- Convex: queries/mutations for app data, actions for generation and
  provisioning, HTTP actions for webhooks.
- Styling: Tailwind CSS v4 + shadcn/ui; theme from `docs/reference/theme/`.
- Auth: Convex Auth v2 (the tool's audience is individuals/very small
  businesses). Clerk remains the rule for B2B/SSO products.
- Payments: Stripe.
- Deployment: Dokploy + self-hosted Convex (the same defaults the tool
  provisions).

## Structure

This repo is a **simple structure** project:

```text
src/            # Next.js App Router
convex/         # schema, queries, mutations, actions, http
templates/      # versioned scaffold templates (ships with the tool)
  v0/base/      # includes infra/convex/ (self-hosted Convex compose + Dokploy)
docs/           # product, architecture, spec, infra, conventions
```

The complex structure (FastAPI/FastMCP backend) is generated into target
projects, not used by this tool.

## Generation model

- `project.yaml` is parsed and validated with a shared zod schema.
- A resolver turns the spec into a `ProjectPlan` (structure, features, files,
  env vars, infra steps).
- Templates are versioned and stored in this repo under `templates/<version>/`.
- The renderer is deterministic: template files + variable substitution +
  module composition + a generated `template.lock`.
- v0 writes a ZIP in a Convex action (Node runtime) or streams files from a
  Next route; no filesystem access to the host is required.

## Data model (Convex, initial)

- `users` — Convex Auth users; display name.
- `projects` — owner, name, slug, current spec id, template version, status.
- `specs` — immutable `project.yaml` snapshots (raw YAML + validated JSON).
- `templates` — template id, version, checksum, published date.
- `scaffoldJobs` — project id, spec id, template version, status, artifact
  storage id, logs, timestamps.
- `integrations` — per-user provider references (Cloudflare, Dokploy); secrets
  stored encrypted, never returned to the client.
- `provisionJobs` — plan, dry-run result, confirmations, status, logs.
- `auditEvents` — who did what, to which target, when.

## Security and safety

- All queries/mutations scoped by `userId` (Convex Auth identity).
- Integration tokens encrypted at rest; only referenced by id in logs.
- Provisioning is plan -> dry-run -> explicit confirm -> execute -> verify.
- No destructive action without a typed confirmation naming the target.
- Generated projects never receive secrets through the spec; only env var
  names.
- Artifacts are private to the owner.

## Key boundaries

- The tool never freehands files: if the template cannot express something, add
  a module to the template first.
- Templates are the source of truth for project structure; the webapp is a UI
  and orchestration layer over them.
- The tool's own conventions and generated conventions must stay identical;
  update both in the same change.
- Convex is the only public ingress for generated projects. The advanced
  backend stays private behind Convex actions; direct frontend calls are a
  documented exception only.

## Capability gating and demo mode

- A single capability module reports whether Convex, auth, billing, and infra
  are configured; providers are only initialized when their capability exists.
- The app must render with an empty env file: `/setup` explains what is missing,
  while demo auth/fixtures/mock billing keep the rest explorable.
- Demo modes are explicit, visibly banner-marked, and rejected in production by
  a build/start guard.
- The scaffold ships `.env.example`, `SETUP.md`, and `npm run dev:demo` so a
  generated project is openable before any integration is complete.
