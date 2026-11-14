# Infrastructure — New SaaS

These are the defaults the tool teaches and (later) automates. The same
defaults apply to this tool's own deployment.

## Defaults

| Concern | Default |
| --- | --- |
| Registrar | Dynadot |
| DNS | Cloudflare |
| Dev backend | Local Convex (`npx convex dev`) |
| Prod backend | Self-hosted Convex |
| App deployment | Dokploy (template or Docker Compose, Traefik TLS) |
| Static/edge hosting | Cloudflare Pages when applicable |

## Provisioning sequence (v2)

1. DNS: ensure the domain's nameservers point to Cloudflare; create the app
   record (A/AAAA or CNAME) and, if needed, a wildcard.
2. Dokploy: create/find the project; create the app or compose service; set the
   domain and TLS.
3. Convex: deploy the self-hosted backend (compose template), set the
   deployment URL and env/secrets.
4. App: set env vars, deploy, wait for health.
5. Verify: HTTP health check, Convex reachability, DNS resolution; record the
   result in the audit log.
6. Post-setup: backups, notifications, and a restore drill note.

## Agent and MCP scope

- Cloudflare: DNS, zone settings, Pages. MCP:
  `https://mcp.cloudflare.com/mcp` (OAuth). Prefer a least-privilege,
  zone-scoped token for automation.
- Dokploy: projects, apps, compose, domains, env, deployments, backups. MCP:
  `npx -y @dokploy/mcp` with `DOKPLOY_URL` and `DOKPLOY_API_KEY`; use
  `DOKPLOY_TOOL_PRESET=deploy` or `minimal` to keep the tool list small. Env
  redaction is on by default.
- Dynadot: verify nameservers/delegation. Registration and purchase are human
  steps — API access is gated and purchases are irreversible.
- Flow: registered domain -> Cloudflare zone -> Dokploy app -> Convex
  deployment.

## Self-hosted Convex

- The compose/Dokploy stack is part of the template at `infra/convex/` and is
  copied into generated projects when `deploy.convex: self-hosted`.
- Keep it pinned, with persistent volumes, health checks, and backup/restore
  notes.
- Document the differences from Convex Cloud and what is not available.
- Local dev stays `npx convex dev`; prod parity is verified with the same
  queries and auth flow.

## Guardrails

- Dry-run every provisioning plan and show the exact resources and domains.
- Confirm per destructive or billable action.
- Never log secrets; redact tokens and env values.
- Separate tokens per provider and environment; no shared super-tokens.
