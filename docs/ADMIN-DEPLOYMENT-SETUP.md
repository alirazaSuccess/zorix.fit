# Admin deployment and first-owner setup

## Current implementation
- Admin interface: `/admin`
- Owner login: `/admin/login`
- One-time owner setup: `/admin/setup`
- Same-origin API proxy: `/api/admin/*`
- Commerce API source: `workers/commerce-api/src/index.ts`
- D1 setup-state migration: `workers/commerce-api/migrations/0003_admin_setup_state.sql`

## Required environment

### Vercel project environment variables
Set the following for Preview (and Production when ready):
- `COMMERCE_API_URL`: the deployed Cloudflare Worker origin: `https://zorix-commerce-api.alirazamahar304.workers.dev`. Do not include a trailing slash. This value has been added to the Vercel Preview environment for branch `feat/platform-foundation`.

This value is server-only; do not use a `NEXT_PUBLIC_` prefix.

### Cloudflare Worker
Configure:
- D1 binding `DB` to database `zorix-commerce`.
- Variable `ENVIRONMENT=production`.
- Secret `ADMIN_SETUP_TOKEN`: generate a cryptographically random token with at least 32 bytes of entropy and set it as a Worker secret. Never commit it to GitHub or put it in a public URL.

The `store_setup` table was added to the connected D1 database for the one-time initial-owner gate. The migration file is also committed for repeatable deployments. The Worker script `zorix-commerce-api` is deployed with the D1 binding and setup-token secret.

## First owner account
1. Deploy the commerce Worker with the D1 binding and `ADMIN_SETUP_TOKEN` secret.
2. Set `COMMERCE_API_URL` in Vercel and redeploy the Preview.
3. Open `/admin/setup`.
4. Enter the one-time setup token and create a unique password (12+ characters) for `zorixfit@admin.com`.
5. Sign in at `/admin/login`.
6. After successful setup, remove the `ADMIN_SETUP_TOKEN` Worker secret. The database gate also rejects further initial-owner creation once an admin exists.

Do not share the setup token in source control, screenshots, public issue trackers, or chat. The token is not a password and should be revoked after the owner account is created.

## Security notes
- Passwords use PBKDF2-HMAC-SHA-256 with a random salt.
- Session tokens are random; only their SHA-256 hashes are stored in D1.
- Browser session cookie is HttpOnly, Secure and SameSite=Lax.
- Admin API routes verify the session server-side. The Next.js proxy rejects cross-origin write requests.
- Keep Worker secrets and Cloudinary API credentials out of client-side bundles.
