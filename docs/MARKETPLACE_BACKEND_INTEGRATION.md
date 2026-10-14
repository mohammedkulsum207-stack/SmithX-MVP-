# SMITHX frontend ↔ marketplace API integration

The public storefront is hosted on GitHub Pages. GitHub Pages serves static files only; it cannot run the Flask API or host its persistent database.

## Current integration

- `marketplace-api-config.js` contains public, non-secret frontend settings.
- `marketplace-api.js` provides a read-only API client for the health endpoint and product catalogue.
- Remote catalogue loading is **off by default**. With the API URL blank, the current storefront remains in its existing demo/local mode.
- When explicitly enabled, API products are adapted to the existing product-card format and appended to the catalogue. Images are not yet included in the current backend product schema.
- The client intentionally does not expose product creation, checkout, payment, refund, or reward writes.

## Configure a deployed API

1. Deploy the Flask backend to an HTTPS application host.
2. Configure the backend's CORS policy to allow the exact GitHub Pages origin, not arbitrary origins.
3. Before public exposure, implement server-side authentication and authorization, seller ownership checks, request validation, rate limiting, and product moderation. The current API foundation does not yet provide these protections.
4. Set `apiBaseUrl` in `marketplace-api-config.js` to the backend origin, for example `https://api.example.com`. Do not include a trailing slash.
5. Set `enableRemoteCatalogue: true` only after the API has been reviewed and made safe for public read access.
6. Verify `GET /api/marketplace/health` and `GET /api/marketplace/products` from the deployed website's browser, including CORS behavior.

## Important limitations

- The current API uses SQLite, not the planned PostgreSQL production database.
- The current API accepts product/order writes without authentication. Do not enable those flows on a public deployment until authorization is implemented.
- The current order endpoint creates a pending test order; it does not process payments. The frontend must not treat it as payment confirmation.
- Product image upload, seller dashboards backed by server data, authentication, shipment integrations, and SMX Coins are not implemented by this bridge.
- Never place server secrets in GitHub Pages files. Payment provider secret keys and webhook secrets must remain on the server.

## Local smoke check

With the Flask API running locally, request:

- `GET /api/marketplace/health`
- `GET /api/marketplace/products`

The browser catalogue bridge can then be tested by configuring a reachable HTTPS API origin. A browser page served from HTTPS generally cannot call an HTTP-only API because of mixed-content restrictions.
