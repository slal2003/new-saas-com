# Analytics module

Opt-in module included when `features.analytics: posthog`.

Use `trackEvent` from client components after adding the PostHog script or SDK.
The key is public (`NEXT_PUBLIC_POSTHOG_KEY`); never place a PostHog personal
API key in the app.
