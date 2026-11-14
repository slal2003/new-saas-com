# New SaaS — setup

Production canonical URL: `https://new-saas.com` (set `NEXT_PUBLIC_APP_URL` in
the deployment environment). The local `.env.example` keeps
`http://localhost:3000` so auth redirects and metadata work in development.

## Open the app with no integrations

```bash
cp .env.example .env.local
npm install
npm run dev
```

An empty `.env.local` boots in development with demo auth, fixture data, and mock billing. The
demo banner names what is disabled. Demo mode is rejected in production by `npm run build` and by
the capabilities module.

To make demo mode explicit:

```bash
npm run dev:demo
```

## Convex

This repo pins `convex` and `@convex-dev/auth` v2. The generated types in `convex/_generated/` are
checked in so typecheck and build work before a deployment exists.

To initialize a local dev deployment (requires a Convex account/project record; this session did
not provision one):

```bash
npx convex dev --configure new --dev-deployment local
```

Then copy the deployment URL into `.env.local`:

```bash
NEXT_PUBLIC_CONVEX_URL=https://...
NEXT_PUBLIC_AUTH_MODE=real
NEXT_PUBLIC_DATA_MODE=convex
```

Convex Auth v2 needs no JWT/JWKS/SITE_URL secrets. The app uses username + password.

## Billing

Stripe only. The pricing page renders without Stripe; checkout stays disabled with an explicit
note. This build does not call Stripe.

## Infrastructure

Cloudflare, Dokploy, Dynadot, and self-hosted Convex are **plan-only** in v0. The UI shows the
provisioning sequence; no provider API is called. See `docs/03-infra.md` and the generated
`templates/v0/base/infra/convex/` stack.

## Verify

```bash
npm run typecheck
npm run test
npm run build
```

## Demo-mode guard

`scripts/check-production-env.mjs` fails a production build when any of these are set:

- `NEXT_PUBLIC_AUTH_MODE=demo`
- `NEXT_PUBLIC_DATA_MODE=fixtures`
- `NEXT_PUBLIC_BILLING_MODE=demo`

`resolveCapabilities` repeats the check at runtime for server-side production code.
