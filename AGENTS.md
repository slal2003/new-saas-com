# Agent guidance — New SaaS

This repo builds the New SaaS webapp. It must follow the same conventions it
generates for other projects.

## Defaults

- Structure: **simple** (Next.js App Router + Convex) unless a documented
  reason requires the complex structure.
- Styling: Tailwind + shadcn/ui + the tweakcn theme; tokens live in one file.
- Auth: this tool targets individuals and very small businesses ->
  **Convex Auth v2**. Use Clerk only if the audience changes to business/SSO.
- Payments: **Stripe only**.
- Infra: Dynadot registrar, Cloudflare DNS, local Convex in dev, self-hosted
  Convex in prod via Dokploy.

## Rules

- Read `docs/` before changing architecture or stack choices.
- The `project.yaml` schema is a single shared module used by the UI, the API,
  and the generator. Never duplicate it.
- Scaffolding must be deterministic: templates + a renderer, not freehand file
  generation.
- Never provision infrastructure without explicit user confirmation; always
  support dry-run and least-privilege tokens.
- Never put secrets in specs, logs, or client payloads. Reference env var names.
- Generated projects must pass typecheck, build, and tests.
- Do not commit unless asked.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
