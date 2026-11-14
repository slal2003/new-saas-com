# Product — New SaaS

## Vision

Turn the repeatable 80% of a SaaS project into a single spec and one command:
a validated `project.yaml` becomes a running base with auth, payments, styling,
Convex, infrastructure, and agent setup — leaving the project team to build only
what is unique.

## Who it is for

- Primary: the maintainer (one-person studio shipping multiple SaaS projects).
- Later: small product teams and indie developers who want the same base.

## Problem

Every new project repeats the same setup: Next.js shell, Convex, auth, Stripe,
shadcn/theme, DNS, deployment, backups, and agent guidance. Doing it by hand is
slow, inconsistent, and error-prone. Letting an agent freehand it produces drift
and non-reproducible results.

## Solution

A webapp tool with four surfaces:

1. **Spec intake** — a form/interview that produces and validates `project.yaml`.
2. **Spec editor** — edit the YAML directly with schema validation and a live
   preview of what will be generated.
3. **Generate** — deterministic scaffold from a versioned template; download a
   ZIP or (later) run the CLI.
4. **Provision** — optional infrastructure setup (Cloudflare DNS, Dokploy
   project, self-hosted Convex, env/secrets, first deploy, health check) with
   dry-run, explicit confirmation, and an audit log.

## Dogfooding principle

The tool is built with the stack it generates and follows its own
`project.yaml` (`structure: simple`, Next.js + Convex, Convex Auth v2, Stripe).
The intake schema is the same schema used by the generator. Theme tokens come
from the same tweakcn theme. New conventions are added to the template and to
the tool together.

## Milestones

### v0 — Spec to scaffold (no infra)

- Intake form + YAML editor with validation.
- Live preview of the resolved project plan.
- Deterministic scaffold download for `simple` and `complex` structures.
- Template registry with pinned versions.
- The tool's own `project.yaml` (dogfooding).

### v1 — CLI + reproducible upgrades

- `new-saas` CLI: `--dry-run`, `--resume`, `--json`, non-interactive mode.
- Template update/diff command and `templateVersion` pinning.
- Optional feature modules (blog, email, analytics).
- Scaffold job history and re-download.

### v2 — Provisioning

- Per-user Cloudflare and Dokploy tokens (encrypted).
- Provisioning plan -> dry-run -> confirm -> execute -> verify.
- Self-hosted Convex compose/Dokploy template with backup/restore.
- Audit log and rollback notes.

## Non-goals

- Arbitrary code generation or one-off per-project forks.
- Replacing Dokploy, Cloudflare, or Convex dashboards.
- Managing domain purchases without explicit human confirmation.
- Multi-tenant team management in v0.

## Success criteria

- New project from spec to running dev app with no manual file edits.
- Every project boots with an empty env file and is explorable in demo mode
  (auth, payments, and data can be completed later).
- The same spec produces the same scaffold (deterministic).
- A generated project passes typecheck, build, tests, and a deploy health check.
- Adding a project-specific feature never requires editing the template.
