# Convex Auth v2 — reference

Current stable release and Convex's officially recommended auth for new Convex
projects — subject to the audience rule below. Source:
https://docs.convex.dev/auth/convex-auth (retrieved 2026-11-14).

## Why it matters

- Runs inside the app: no external auth service (Clerk/WorkOS/Auth0) to wire up.
- Built-in methods: username + password, email + password, username + passkey,
  and OAuth (Apple, Google, GitHub).
- Free and open source (Apache-2.0). All user data lives in the app's Convex
  database and stays exportable.
- Built on Convex Components, so sensitive auth data is isolated from app code.
- **v2 needs no auth secrets**: the deployment signs access tokens with its own
  key. There is no JWT_PRIVATE_KEY/JWKS/SITE_URL setup like v1.
- Supports React SPAs and Next.js App Router SSR (refresh token in an httpOnly
  cookie; access token shared by server and browser).
- Setup is entirely code/config — no dashboard wizard.

## Choosing an auth provider

| Audience | Choice | Rationale |
| --- | --- | --- |
| Business product where SSO might be needed | **Clerk** | Enterprise identity (SAML SSO, SCIM) is covered at a reasonable cost when needed |
| Individuals and very small businesses | **Convex Auth v2** | No external auth service or auth secrets; simplest setup. This segment previously used WorkOS — Convex Auth replaces it |

Other notes:

- For new Convex apps, Convex recommends Convex Auth over the Convex + Better
  Auth component.
- Convex Auth v1 receives security updates only while v2 gaps close; migrate to
  v2 where feasible.

## Core setup (every project)

1. Install the package: `npm i @convex-dev/auth`.
2. `convex/convex.config.ts`: register the core component.

   ```ts
   import { defineApp } from "convex/server";
   import auth from "@convex-dev/auth/convex.config.js";

   const app = defineApp();
   app.use(auth);
   export default app;
   ```

3. `convex/auth.config.ts`: accept Convex Auth access tokens.

   ```ts
   import type { AuthConfig } from "convex/server";
   import { convexAuthProvider } from "@convex-dev/auth/server";

   export default {
     providers: [convexAuthProvider()],
   } satisfies AuthConfig;
   ```

4. `convex/auth.ts`: set up the core and export its functions.

   ```ts
   import { components } from "./_generated/api";
   import { setupConvexAuth } from "@convex-dev/auth/server";

   const auth = setupConvexAuth({ component: components.auth });
   export const { signOut, refreshSession, isAuthenticated } = auth;
   ```

Then follow the guide for each sign-in method (each adds its own components and
functions to `convex.config.ts` / `auth.ts`).

## Best practices

- Create user rows in your own `createUser` internal mutation and attach it with
  `attachUserCallbacks({ createUser, onSignIn })`.
- Treat auth components as the source of truth for usernames and verified
  emails. Don't duplicate those values into app tables; read them via component
  calls using `getAuthUserId(ctx)`.
- Handle the typed client errors from the sign-in hooks exhaustively (use
  `satisfies never` in the default switch case).

## Next.js App Router (SSR)

- Sign-in, refresh, and sign-out run on the Next server; the refresh token lives
  in an httpOnly cookie.
- `setupConvexAuthServer` in `src/lib/serverAuth.ts`, with POST routes mounted at
  exactly `app/auth/signin`, `app/auth/refresh`, `app/auth/signout`.
- `setupConvexAuthNextjs` provides `ConvexAuthNextjsServerProvider` (root
  layout), `convexAuthNextjsProxy` (`proxy.ts`), `convexAuthNextjsAccessToken`,
  and `isAuthenticatedNextjs`.
- Use `convexAuthNextjsAccessToken()` with `preloadQuery`; use
  `isAuthenticatedNextjs()` — not token presence — for server-side auth checks.
- Keep `/auth` routes out of the proxy `matcher`; they manage their own cookies.

## Agent guidance

- Business audience where SSO may be needed → Clerk. Individuals and very small
  businesses → Convex Auth v2 (not WorkOS).
- Do **not** follow v1-only steps (JWT_PRIVATE_KEY/JWKS/SITE_URL env vars or the
  `npx @convex-dev/auth` wizard). v2 has no auth secrets to configure.
- Read `convex/_generated/ai/guidelines.md` before editing Convex code.

## Docs

- Overview: https://docs.convex.dev/auth/convex-auth
- Getting started: https://docs.convex.dev/auth/convex-auth/getting-started
- Best practices: https://docs.convex.dev/auth/convex-auth/best-practices
- Next.js SSR: https://docs.convex.dev/auth/convex-auth/ssr-nextjs/setup
- Sign-in methods: https://docs.convex.dev/auth/convex-auth/methods/username-password,
  email-password, username-passkey, oauth
- Migration from v1:
  https://docs.convex.dev/auth/convex-auth/migrating/from-convex-auth-v1

## This repo

`compliance-2` targets business merchants (a business audience where SSO may be
needed), so Clerk is the correct provider under this rule. It already uses Clerk;
no migration is needed.
