# Convex

## Generated types

`convex/_generated/` is checked in so `npm run typecheck` and `npm run build`
work before a deployment exists. The files in this session were written from the
schema/auth shape rather than produced by the CLI, because codegen requires a
selected deployment and no external infrastructure was provisioned.

Replace them with real generated output when you initialize Convex:

```bash
npx convex dev --configure new --dev-deployment local
npx convex codegen
```

## Auth

Convex Auth v2 (username + password). The core component is mounted as `auth`;
the password and username components are `authPassword` and `authUsername`.
`convex/auth.ts` wires `createUser`/`onSignIn` to `internal.users`.

Do not follow v1 steps (JWT_PRIVATE_KEY/JWKS/SITE_URL); v2 has no auth secrets.

## Functions

- `users` — profile, `me`, update display name.
- `projects` — owner-scoped list/get and `createFromSpec` (also writes the
  immutable spec snapshot and an audit event).
- `specs` — snapshots by project.
- `templates` — registry with `templateId`/`version`/checksum.
- `scaffoldJobs` — queued/ready/failed jobs; v0 ZIPs are rendered in the Next
  route, so the job interface is ready for a later worker.
- `integrations` — provider references; secrets never leave the server.
- `provisionJobs` — plan, dry-run result, typed confirmation, status/logs.
- `auditEvents` — actor/action/target/time.
- `http` — `/health` for deploy checks.

Everything except `http`/auth requires an authenticated caller; reads and writes
are scoped by `requireUserId`.
