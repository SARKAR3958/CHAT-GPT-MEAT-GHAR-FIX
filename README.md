# Meat Ghar — corrected source handover

This archive contains the customer web app, administrator panel, database migration, optional push server function, and reproducible checks. It contains no live credentials or preconfigured production build.

**Read `HANDOVER.md` before deployment.** Source checks passed; production launch still requires the client's Supabase configuration, reviewed migration, administrator provisioning, and live acceptance tests. No external database or hosting system was modified.

## Local setup

Requires Node.js 22.12+ and npm.

1. Run `npm ci`.
2. Copy `.env.example` to `.env.local`.
3. Fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` with the client's project URL and public anon/publishable key. Never use a service-role key in frontend configuration.
4. Follow the database and authentication setup in `HANDOVER.md`.
5. Run `npm run dev`.

Customer entry: `/`. Administrator entry: `/admin` (or the existing `/admin-mtg` entry).

Sign-in now uses **email + password**, or configured Google OAuth. Phone numbers are delivery contact information. The previous unauthenticated phone-to-email lookup has been removed.

## Build and checks

- `npm run lint` — TypeScript validation.
- `npm test` — isolated PostgreSQL authorization and transactional checks. No live database is used.
- `npm run build` — validation followed by the Vite production build.
- `npm run preview` — preview a locally built `dist` directory.

Build with the actual public environment configuration **before** uploading `dist`. Frontend Vite variables are set at build time. Source assets are included in `public/images`.

Browser checks use controlled test responses confined to `tests/browser.mjs`; these are not imported by the application. To reproduce:

1. Install the test browser: `npx playwright install firefox`.
2. Start Vite with the test URL `VITE_SUPABASE_URL=https://test-meatghar.supabase.co` and test public key `VITE_SUPABASE_ANON_KEY=test-public-anon-key-for-local-testing` using your shell's environment syntax. Do not build production with these test values.
3. Run `npm run test:browser` from a second terminal. It accesses localhost and intercepts all other requests.

## Optional device push

The server function is in `supabase/functions/send-push/index.ts`. Configure its server-side `APP_ORIGIN`, `ONESIGNAL_APP_ID`, and `ONESIGNAL_REST_API_KEY`, and deploy it separately after approval. The Supabase URL/public key environment is supplied by the function environment. The function authenticates the caller and checks administrator membership. Do not put OneSignal REST credentials in Vite or browser storage.

In-app notification publishing works through the database without this optional integration. Actual device push delivery and native-wrapper Google sign-in must be tested on the target devices after configuration.
