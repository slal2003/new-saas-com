# Kickoff prompt — parallel build session

## Recommended approach

Start the build as a parallel session, but from a seeded repo (this one), not
from a bare prompt. That keeps compliance-2 clean and avoids re-explaining every
decision. Use a fresh `cmd` session with the working directory set to
`/Users/slimallani/code/new-saas-com`.

Sequence inside that session:

1. Read the docs and confirm the plan.
2. Bootstrap v0 (simple structure) and run typecheck/build.
3. Extract the base template from compliance-2 into `templates/v0/` (generic
   parts only; see `docs/02-project-spec.md`).
4. Wire the intake form, schema validation, and deterministic ZIP download.
5. Keep infrastructure provisioning out of v0.

If you want more isolation, use a git worktree/branch per milestone, but keep
one repo as the source of truth.

## Prompt

```text
You are starting the New SaaS webapp in this repository
(/Users/slimallani/code/new-saas-com).

Read, in order: AGENTS.md, docs/00-product.md, docs/01-architecture.md,
docs/02-project-spec.md, docs/03-infra.md, docs/04-conventions.md, and
docs/reference/convex-auth-v2.md.

Goal for this session: deliver the v0 bootstrap as a dogfooded simple-structure
project.

1. Scaffold Next.js App Router + TypeScript strict + Tailwind + shadcn/ui using
   the theme in docs/reference/theme/.
2. Initialize Convex locally and add the base schema for users, projects,
   specs, templates, scaffoldJobs, integrations, and auditEvents, following
   docs/01-architecture.md.
3. Add Convex Auth v2 (this tool targets individuals/very small businesses),
   with sign-in and a protected dashboard shell.
4. Extract the generic base from compliance-2 into templates/v0/ (see
   docs/02-project-spec.md), then build the intake flow: form ->
   live project.yaml preview -> zod validation -> resolved ProjectPlan.
   Do not generate files from a model; use a deterministic renderer with the
   schema in one shared module.
5. Implement a v0 scaffold download (ZIP) for structure: simple using
   templates/v0/.
6. Leave infrastructure provisioning stubbed: design the job/plan interfaces
   and document the Cloudflare/Dokploy steps, but do not call external APIs.
7. Make the app openable without integrations: implement the demo modes and
   /setup from docs/04-conventions.md (demo auth, fixtures, mock plan), with a
   production guard that rejects demo mode.
8. Run typecheck, build, and tests; verify `npm run dev` works with an empty
   env file; report what is done, what is stubbed, and any decisions to review.

Constraints:
- Follow docs/04-conventions.md; do not invent stack choices.
- Locked decisions: Next.js only (no Vite); Convex is the only public
  ingress; the self-hosted Convex stack lives at templates/v0/base/infra/convex/.
- The tool must use its own principles: same stack, same theme, same spec
  schema, same auth rule.
- No secrets in specs, logs, or client payloads.
- Do not provision any infrastructure or spend money.
- The app must open and be navigable with an empty .env.local (demo mode);
  never ship demo mode to production.
- Do not commit unless asked.
```

## After v0

- Pin `templateVersion` and add a template update/diff workflow.
- Add a CLI wrapper with `--dry-run` and `--json`.
- Add feature modules (blog, email, analytics) as opt-in folders.
- Then design provisioning (Cloudflare/Dokploy) behind dry-run and explicit
  confirmation.
