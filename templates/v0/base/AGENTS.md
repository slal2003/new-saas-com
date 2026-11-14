# Agent guidance — {{project.name}}

This project is a new-saas base. Extend it with modules; do not fork the
template.

## Rules

- Read `SETUP.md` and the Convex generated guidance before changing auth or
  schema.
- Convex is the only public ingress. Frontend code talks to Convex only.
- Keep `project.yaml` valid and pin `templateVersion`.
- Never put secrets in specs, logs, or client payloads. Reference env var names.
- Demo mode is explicit, visibly banner-marked, and rejected in production.
- Validate inputs at boundaries.
- Generated projects must pass `npm run verify`.

## Conventions

- TypeScript strict; `src/` layout.
- Tailwind v4 + shadcn/ui; theme tokens live in `src/app/theme.css`.
- Auth: Convex Auth v2 for individuals and very small businesses; Clerk only if
  the audience changes to business/SSO.
- Payments: Stripe only.
- Do not commit unless asked.
