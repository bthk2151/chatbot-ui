# Tree-RAG authentication

Google sign-in is still handled by Auth.js. After verifying Google's
`email_verified` claim, the sign-in callback sends an authenticated
`/users/login` request to Tree-RAG. The API proxy checks `auth()` for every
request and signs a separate RS256 token with `jose`. Backend tokens are never
returned in the browser session or stored in localStorage.

The JWT `sub` is the exact existing email, including its case. No user IDs or
database records are migrated. Claims `iss`, `aud`, `iat`, and `exp` are required;
tokens last five minutes. Every user who can complete verified Google sign-in
can use the app. This does not add an invitation list or domain restriction.

## Configuration

1. Generate a dedicated RSA key pair on a trusted machine, outside either repo:

   ```sh
   openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:3072 -out rag-private.pem
   openssl pkey -in rag-private.pem -pubout -out rag-public.pem
   ```

2. Set `RAG_JWT_PRIVATE_KEY` on the Next.js server to the entire PKCS#8 private
   PEM. Set `RAG_JWT_PUBLIC_KEY` on Tree-RAG to the entire public PEM. Actual
   newlines and literal `\n` sequences both work. Do not commit either key.
3. Set identical `RAG_JWT_ISSUER` and `RAG_JWT_AUDIENCE` on both services.
   Use distinct keys and values in development, staging and production.
4. Keep existing `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, and
   `API_BASE_URL`. Use the canonical HTTPS backend URL in production; redirects
   are intentionally refused so credentials cannot follow an unexpected URL.

See `.env.example`. The private key must never have a `NEXT_PUBLIC_` prefix and
must not reuse `AUTH_SECRET`. Configure production values through the hosting
platform's server environment or secret manager. Private key parsing is cached
per process; restart/redeploy after key changes.

## Coordinated rollout

Configure keys and issuer/audience before deploying either branch. Deploy the
signing UI first, then immediately deploy the validating backend. The current
backend ignores the extra header, so this order avoids failed login during the
transition. The backend remains exposed until its enforcing revision is live;
use a maintenance window if that transition is unacceptable. No deployment is
performed by these code changes.

Existing Auth.js sessions are deliberately cleared and require a fresh Google
sign-in to establish the verified-email marker. After rollout, verify Google
login, upload/status polling, chat, conversation history and deletion. Requests
directly to FastAPI without a bearer token must return 401; another email in a
payload/query/form must return 403.

Browser calls keep using `/api/rag/...`; the proxy generates its own Authorization
header and never forwards a browser-supplied bearer token or cookie to FastAPI.
For POST/DELETE requests it requires Origin to match the request URL origin.
If deployed behind a reverse proxy, preserve the external scheme/host so this
comparison stays correct. Non-browser mutation clients must supply the same
Origin along with a valid Auth.js session. `/users/login` is callback-only and
is no longer exposed by the browser proxy.

For key rotation, this implementation trusts one key at a time. Coordinate both
deployments in a maintenance window; rolling mismatched keys causes temporary
401s. Stateless tokens remain valid for up to five minutes after logout (plus
five seconds of verifier clock tolerance). HTTPS and server-only tokens reduce
exposure but bearer tokens can be replayed if stolen.

## Verification

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run build
```

Tests use ephemeral keys and mocked upstream calls; real Google OAuth and hosted
FastAPI/database integration should be smoke-tested in the deployment environment.
