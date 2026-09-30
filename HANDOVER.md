# Meat Ghar — launch audit and handover

Reviewed and corrected: 30 September 2026.

## Recommendation

**NOT READY for an immediate client production launch.** The corrected source is ready for configuration and staging acceptance. TypeScript, production build, isolated database checks, and controlled browser checks have passed. The client's live database, Auth settings, payment account, and device integrations have not been accessed or verified.

Do not deploy the original permissive SQL or ship the archive's former fake administrator login. Apply the corrected migration after backup and review, provision a real administrator, rebuild with the client's public configuration, and complete the acceptance checks below.

## Fixed release blockers

| Priority | Original issue | Implemented fix / source |
|---|---|---|
| P0 | Any credentials enabled administrator access; a local flag restored it | Real Supabase password authentication and protected `admin_users` membership; route gating and role rechecks in `src/components/admin/AdminContext.tsx` and `AdminPanel.tsx` |
| P0 | Public `USING(true)` modification/read policies exposed private records and wallet balances | Ownership policies using `auth.uid()`, administrator membership, removal of old permissive application policies, and administrator-only image writes in `supabase_schema.sql` |
| P0 | Checkout displayed success before checking database insertion | Awaited server confirmation; failure retains cart; duplicate-submit protection in `CheckoutScreen.tsx` |
| P0 | Browser could invent payment status, product prices, stock or wallet balance | `place_order` calculates prices, coupon discount, fees and tax on the server; locks stock, debits wallet and inserts order in one transaction |
| P0 | Repeated deposit approval could add funds repeatedly | Row-locked `review_wallet_deposit` only accepts pending deposits; reference uniqueness and server-only wallet mutation |
| P0 | Invalid/duplicate fulfillment and refunds | `set_order_status` enforces transitions, restores reserved stock and refunds wallet cancellation once |
| P0 | Failed Google login could log in a fake customer | Removed all fake Google identities and fallback login success; authentic OAuth/session required |
| P1 | Hardcoded chicken appeared for every selected product | Product IDs carried from home/category/search into fetched product details; correct price, unit and image |
| P1 | Search/category could sell mock products; prices parsed unit digits as part of price | Mock catalogue removed; numeric database price used directly; unavailable stock cannot be ordered |
| P1 | Cart variants overwritten each other and totals differed from checkout | Separate cart identity for weight/cut/notes; common real store settings and server-validated coupon pricing; quoted-total change rejection |
| P1 | Addresses were fake/local-only and checkout used unrelated location | Auth-owned saved address rows; selected address ID; server ownership and configured service-area validation |
| P1 | Customer could view everyone's orders or see invented delivered details | Owned order queries and real detail/history/status screens; no customer-side delivery mutation |
| P1 | Signup/email confirmation/reset/profile flows were incomplete | Real email/password signup, email-confirmation handling, OAuth profile completion, password recovery and persisted profile/password changes |
| P1 | Wallet started with an invented ₹500 balance | Real owned balance and ledger only; optional verified UPI deposit request; approval required |
| P1 | Admin banners/categories/offers/support only changed local arrays | Database writes with error handling; actual catalogue CRUD, banners, featured product deals, coupons, support replies, blocking and settings |
| P1 | Reports exported nothing and displayed fabricated metrics | Computed metrics and real CSV downloads, including spreadsheet-formula escaping |
| P1 | Browser exposed/stored OneSignal REST credentials | Removed client secrets panel; provided authenticated server-side push function; real in-app notification publishing |
| P1 | Fake referral claims, rewards and free-delivery success screens | Replaced with genuine sharing; removed unsupported reward claims and customer delivery/refund simulations |
| P2 | Fixed minimum screen heights clipped smaller phones | Flexible viewport/scroll layouts, restored browser zoom, mobile/tablet/desktop checks |
| P2 | Broken logo paths and three redundant public image trees | Restored missing logo/flag assets, normalized public image paths and removed duplicate trees |
| P2 | Dependency install conflict and template deployment instructions | Compatible locked npm install, removed unused backend/AI dependencies, TypeScript-enforced build and actual setup instructions |

## Required before launch

1. **Database backup and migration:** Review `supabase_schema.sql` and run it in the client's Supabase SQL editor. It is transaction-wrapped and was tested twice for rerun behavior in isolated PostgreSQL. Do not apply it blindly to a populated production database.
2. **Existing data reconciliation:** Old phone/email-keyed records are deliberately not assigned to an arbitrary customer. Existing orders without `user_id`, phone-based wallets, profiles without Auth UUIDs, and addresses with legacy ownership need an explicit, verified mapping to the correct Auth account. Confirm balances against actual received payments. Do not import demo records as real orders or credit.
3. **Catalogue inventory:** Existing products receive zero stock when no trustworthy stock value exists. Set real categories, selling prices, original prices where genuine, unit/weight and available stock through admin. Stock uses package-equivalent units: for a 500g product, one stock unit is 500g; a 250g selection reserves half a unit.
4. **Administrator:** Create/confirm an Auth account and provision membership from the SQL editor using the commented `admin_users` example in the migration. No default administrator password is supplied. Customer profile data cannot grant administrator access.
5. **Auth configuration:** Enable email/password and the desired email-confirmation policy, configure usable confirmation/recovery email delivery, set the site URL and allowed redirect URLs. Enable Google and supply its provider configuration if Google sign-in is required. Native wrapper callbacks require device validation.
6. **Environment:** Set the client's URL and public key in `.env.local`/hosting build configuration. Rebuild with `npm run build`. The source intentionally shows a setup screen without configuration.
7. **Business settings:** Verify currency (INR), tax treatment, delivery fees, free-delivery threshold, store availability and service areas. Defaults reflect the supplied source: Guwahati, Boko and Dhupdhara. Settings are server-enforced and editable through admin.
8. **Payments:** COD and approved wallet payments are implemented. UPI deposits require a genuine `VITE_MERCHANT_UPI_ID` and independent administrator receipt verification. Direct online/card checkout remains disabled because no verified gateway/webhook integration was provided. It never pretends payment succeeded.
9. **Device push:** Deploy/configure the optional server function only if required; test provider acceptance and real receipt. No device-push delivery is claimed from source-only tests.
10. **Policies and content:** Verify store ownership/contact details, product claims, cancellation/refund policy and privacy wording with the client. Unsupported automatic late-delivery/free-meat claims were removed. Existing marketing illustrations remain brand assets and must be approved for actual business promises.
11. **Hosting:** Use an HTTPS host with SPA fallback (the included Vercel configuration supports deep links). Nothing has been deployed or published.

## Acceptance tests for the configured staging system

Use two separate customer accounts, one administrator and an anonymous/incognito session.

- Sign up, confirm email, sign in, recover password, edit profile and sign out. Test Google on desktop and the target native wrapper if used.
- Anonymous/ordinary customer requests must not read another customer's address, profile, orders, tickets, wallet or ledger; customers cannot write catalogue data, alter balances or mark orders delivered.
- Add real catalogue products from home, category and search. Verify selected identity, weight/unit, cut/notes, separate variants, quantity controls, removal and reorder.
- Save/select an owned address; an address outside configured service areas must be rejected at checkout.
- Try empty cart, insufficient stock, unavailable product, invalid coupon, expired coupon, store closed, offline request and double-click checkout. No false confirmation or partial wallet debit is acceptable.
- Verify a COD order against the database and administrator panel. For wallet, verify exact atomic debit and matching ledger entry. Repeat the same request; it must not create a second order.
- Independently verify a deposit, approve once, attempt approval again, and reject a second deposit. Confirm no duplicate credits.
- Progress Pending → Preparing → On the Way → Delivered. Test eligible cancellation/refund and stock restoration; delivered/cancelled orders cannot be moved backwards.
- Publish a banner, feature a real product, create/redeem a coupon, open/reply/resolve a ticket, block a customer, publish an in-app notification, and export actual reports. Reload from another device to confirm persistence.
- Test order updates across devices. Polling refresh is available when database change feeds are not enabled. True live GPS/rider tracking is not implemented; tracking reflects the store's recorded status.
- Validate small phones, keyboard-open forms, tablet and desktop in actual target browsers; confirm logo/images, HTTPS redirects and no console errors.

## Validation evidence

- Dependency installation succeeded with `package-lock.json`.
- TypeScript validation and production build passed.
- **25 isolated database checks passed:** policy replacement/rerun, administrator boundary, customer ownership, rejected forged balances/gateway/quantities, delivery area, quoted-price changes, price calculation, duplicate request handling, atomic wallet/coupon/stock behavior, refunds, fulfillment transitions, reviews, tickets and blocking.
- **9 controlled browser checks passed:** 320/360/768/1440 viewport widths, correct product identity, failed checkout preservation, confirmed checkout cleanup, forged local administrator flag rejection and real administrator metrics. Fixtures exist only in tests.
- Browser screenshots were inspected for the customer and administrator views. No live credentials or external service writes were used.
- Not verified: live Supabase migration against the client's existing dataset, hosted email/OAuth, actual money receipts, device push/native integrations, real multi-session production load, or real rider operations. The SQL locking strategy was tested functionally in isolated PostgreSQL, not load-tested against the client's hosted database.
- Vite's main bundle size warning remains a performance consideration; build succeeds. Administrator code is loaded separately. Images remain the provided brand assets.

## Scope

This is a corrected customer/admin React web app. No vendor application or rider backend exists in the supplied archive. Prototype-only OTP/delivery-completion screens, false referral reward logic and mock customer/admin data were removed rather than treated as real backend functionality.
