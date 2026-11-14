# Email module

Opt-in module included when `features.email: resend`.

`sendEmail` posts to Resend with `RESEND_API_KEY` from the server environment.
The base app never calls it; wire it into your own actions or HTTP handlers.

Keep the API key server-side. Do not send it to the client or put it in a spec.
