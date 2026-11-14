# Self-hosted Convex

This stack is copied into the project when `deploy.convex: self-hosted`.

## Before production

1. Pin `CONVEX_BACKEND_VERSION` and `CONVEX_DASHBOARD_VERSION` to real image
   tags (or digests) in the deployment environment. Compose refuses to start
   without them.
2. Set `CONVEX_INSTANCE_SECRET` in Dokploy. Never commit it.
3. Put Traefik/TLS in front of the backend and dashboard. Do not expose the
   backend directly.
4. Keep `convex-data` on a persistent volume and add a backup schedule.

## Local check

```bash
CONVEX_BACKEND_VERSION=<tag> \
CONVEX_DASHBOARD_VERSION=<tag> \
CONVEX_INSTANCE_SECRET=<random> \
docker compose up -d
```

Then point the app at the deployment:

```bash
NEXT_PUBLIC_CONVEX_URL=http://localhost:3210
```

`npx convex dev` remains the normal local development path; this compose stack
is for production parity and Dokploy.

## Backups and restore

- Back up the `convex-data` volume (not just the dashboard).
- Run a restore drill before handoff: restore into a scratch stack, run the
  Convex health query, and confirm auth can sign in.
- Record the drill in the project runbook.

## Differences from Convex Cloud

- You operate upgrades, storage, and backups.
- Managed observability and some platform integrations are not available.
- Auth still runs inside the deployment (Convex Auth v2); no external auth
  service is required.
