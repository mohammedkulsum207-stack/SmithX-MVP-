# SMITHX commerce foundation roadmap

## Product decision

Build one global SMITHX marketplace with independent, customizable seller storefronts. Customers can discover and buy across the marketplace; sellers can also have a branded store with its own profile, catalogue, theme, and analytics. Both experiences share one authoritative catalogue, order system, inventory model, and financial ledger.

## Current verified boundary

- The public storefront is hosted as a static GitHub Pages site.
- The frontend's `marketplace-api-config.js` currently leaves `apiBaseUrl` blank and `enableRemoteCatalogue` disabled.
- Existing checkout, wallet, and order flows are demo experiences. They must not be described as collecting real money.
- The backend has an early SQLite-based foundation. PostgreSQL, production deployment, live payments, real carrier integrations, and production backups are not verified as operational.

Keep demo checkout available for product walkthroughs. Do not point it at live payment or production order creation until server-side authorization, idempotency, inventory transactions, and payment reconciliation are implemented and tested.

## Phase 1 — Reliable marketplace foundation

1. **Database and migrations**
   - Move the production data model to PostgreSQL.
   - Add versioned migrations for users, roles, seller stores, products, inventory, carts, orders, order items, payment attempts, refunds, fees, and audit events.
   - Store timestamps in UTC; define explicit currency and locale fields.
   - Document backup cadence, retention, restore drills, and recovery objectives before production launch.
2. **Identity and authorization**
   - Separate customer, seller, administrator, and logistics permissions.
   - Enforce authorization on every server endpoint, not only in the UI.
   - Scope seller access to their own store, products, inventory, and orders.
   - Keep secrets in server-side environment/secret management; use secure password hashing, expiring sessions/tokens, rate limits, and audit logs.
3. **Catalogue and inventory**
   - Validate product data and image URLs/uploads on the server.
   - Add product moderation and store ownership checks.
   - Reserve stock inside a database transaction, preventing overselling under concurrent checkouts.
4. **Automated quality gates**
   - Unit and integration tests for role boundaries, validation, migration behavior, inventory races, and error responses.
   - CI should run linting, tests, and migration checks on every pull request.

## Phase 2 — Real shopping workflow (only after Phase 1)

1. Create a server-authoritative cart and price calculation; never trust browser-submitted totals.
2. Use a checkout idempotency key and unique order/payment-attempt constraints to prevent duplicate orders.
3. Keep demo checkout visibly separate from live checkout.
4. Integrate a payment provider in test mode first. Verify signed webhooks, payment state transitions, retries, and reconciliation before enabling live mode.
5. Track payment capture, provider fees, refunds, chargebacks, and payout state independently. A browser success page is not proof of payment.
6. Add cancellation and refund rules with tests and audit history.

## Phase 3 — Seller intelligence

- Calculate analytics from authoritative order and ledger records, not browser-only demo events.
- Store monetary values as integer minor units plus ISO currency code; preserve original transaction currency.
- Report gross sales, fees, refunds, and net proceeds separately. Do not label revenue as profit without reliable cost data.
- Add low-stock alerts, product performance, and clearly labelled estimates.

## Phase 4 — Global growth

- Localize language, number formats, addresses, tax/shipping rules, and market availability.
- Keep the transaction currency immutable on each order; any display conversion must show the rate/source and must not change the charged amount.
- Add shipping partners through explicit adapter interfaces and verify tracking events.
- Introduce SMX Coins only with a ledger, idempotent entries, expiry/refund policy, and abuse controls.
- Add promotions and retention features after checkout and financial reconciliation are reliable.

## Release gates

Do not enable production checkout until all are true:

- PostgreSQL migrations and tested restore procedure exist.
- Authentication and role/ownership tests pass.
- Concurrent inventory reservation and duplicate checkout tests pass.
- Payment provider test transactions, webhook signature validation, refunds, and reconciliation pass.
- Monitoring and actionable error logs are available without leaking credentials or personal data.
- Deployment, health checks, backups, and rollback are verified in the actual target environment.

## Immediate next steps

1. Make demo mode unmistakable in the public storefront.
2. Keep the API disconnected until the backend is deployed and secured.
3. Implement PostgreSQL migrations and backend authorization in the backend repository as a separate reviewed change.
4. Wire the frontend to the API only after the endpoint contract and security gates are verified.
