# SMITHX frontend ↔ marketplace API integration

The public storefront is hosted on GitHub Pages. GitHub Pages serves static files only; it cannot run the Flask API or host its persistent database.

## Current integration

- `marketplace-api-config.js` contains public, non-secret frontend settings.
- `marketplace-api.js` provides a read-only API client for the health endpoint and product catalogue. `seller-account.js` adds seller registration/login and authenticated server analytics when a backend URL is configured.
- Remote catalogue loading is **off by default**. With the API URL blank, the current storefront remains in its existing demo/local mode.
- When explicitly enabled, API products are adapted to the existing product-card format and appended to the catalogue. Images are not yet included in the current backend product schema.
- The client intentionally does not expose product creation, checkout, payment, refund, or reward writes.

## Configure a deployed API

1. Deploy the Flask backend to an HTTPS application host.
2. Configure the backend's CORS policy to allow the exact GitHub Pages origin, not arbitrary origins.
3. The backend seller endpoints now support password-hashed seller registration/login and signed seven-day bearer tokens. Set `SMITHX_AUTH_SECRET` to a strong random secret of at least 32 characters on the backend host. Restrict CORS to the exact storefront origin, and add rate limiting, email verification/recovery, token revocation, and production monitoring before broad public launch.
4. Set `apiBaseUrl` in `marketplace-api-config.js` to the backend origin, for example `https://api.example.com`. Do not include a trailing slash.
5. Set `enableRemoteCatalogue: true` only after the API has been reviewed and made safe for public read access.
6. Verify `GET /api/marketplace/health` and `GET /api/marketplace/products` from the deployed website's browser, including CORS behavior.

## Important limitations

- The current API uses SQLite, not the planned PostgreSQL production database.
- Seller product creation requires a valid seller bearer token. The test-order endpoint is still unauthenticated and creates pending, unpaid test orders; do not expose it as production checkout.
- The current order endpoint creates a pending test order; it does not process payments. The frontend must not treat it as payment confirmation.
- Seller analytics are now fetched from the server after seller sign-in, including inventory, order records, product views, visitor keys, and currency-separated order totals. EUR is the default display selection; no FX conversion is performed. Profit remains unavailable until cost and verified paid-order/fee data are captured. Product image upload, payment processing, shipment integrations, and SMX Coins remain unimplemented.
- Never place server secrets in GitHub Pages files. Payment provider secret keys and webhook secrets must remain on the server.

## Local smoke check

With the Flask API running locally, request:

- `GET /api/marketplace/health`
- `GET /api/marketplace/products`

The browser catalogue bridge can then be tested by configuring a reachable HTTPS API origin. A browser page served from HTTPS generally cannot call an HTTP-only API because of mixed-content restrictions.


## Seller account and analytics UI

- Seller sign-in/registration and analytics UI are in `seller-account.js`; the token is kept in memory only and is cleared on refresh or sign-out.
- The frontend displays a clear setup message when `apiBaseUrl` is blank. No backend connection is claimed until an HTTPS API URL is configured and tested.
- Analytics currency totals must be returned as separate currency buckets. The currency selector does not convert values; if EUR has no orders in the selected period, the EUR total remains empty rather than converting another currency.
- Product-view events use a random opaque browser-session key. This is a coarse metric and is not fraud-resistant or a reliable identity measure.
