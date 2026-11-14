# {{project.name}}

{{project.description}}

Generated from a validated `project.yaml` with new-saas {{spec.templateVersion}}.

## Stack

- Next.js App Router + TypeScript strict
- Convex (`convex/`) as the only public ingress
- {{spec.auth}} for auth
- Tailwind CSS v4 + shadcn/ui + the tweakcn theme (`src/app/theme.css`)
- {{spec.payments}} for payments
- {{spec.deploy.provider}} + self-hosted Convex for deployment

## Open it

```bash
cp .env.example .env.local
npm install
npm run dev
```

An empty env file boots in demo mode (demo auth, fixtures, no checkout). Run
`npm run dev:demo` to make the demo flags explicit. Demo mode is rejected in
production.

## Wire Convex

```bash
npx convex dev
```

Copy the deployment URL and set `NEXT_PUBLIC_AUTH_MODE=real` and
`NEXT_PUBLIC_DATA_MODE=convex`. See `SETUP.md`.

## Structure

```text
src/          Next.js App Router, components, lib
convex/       schema, auth, queries, mutations, actions, http
infra/convex/ self-hosted Convex stack (when enabled)
```

Replace the sample `notes` table with your domain. Keep queries scoped by the
signed-in identity, and add new modules instead of forking the base.
