# SMITHX marketplace audit and implementation plan

Last reviewed: 14 October 2026
Working branch: `refactor/marketplace-audit`

## Product direction

- Keep the public landing page focused on shopping and product discovery.
- Keep the visual system strictly monochrome: white canvas, black text and controls, restrained grey surfaces and borders. Product photography supplies the color.
- Keep the SMITHX vision and company story on the About page, not in the shopping flow.
- Separate buyer journeys, seller store setup/catalogue management, and seller analytics.
- Preserve existing functionality while refactoring; do not remove phase scripts until their dependencies are mapped and tested.
- Clearly label browser-only/demo functionality. Never present demo orders, analytics, account sessions, or auction settlement as shared/production commerce.

## Verified findings

1. The home page currently loads six stylesheets: `styles.css`, `phase1.css`, `phase2.css`, `comfort.css`, `storefront-refresh.css`, and `monochrome.css`. These have different responsibilities, but their overlapping global rules and hard-coded accent colors create cascade conflicts.
2. `login.html` includes `monochrome.css` twice.
3. The responsive menu rules in `phase1.css` use a dark menu background with white links, while the global monochrome overrides force header links to black. On mobile this can create a low-contrast menu.
4. `comfort.css`, `phase1.css`, `demo-pages.css`, and `auth-nav.js` still include gold accents that conflict with the requested monochrome palette.
5. Seller accounts, stores, products, carts, orders, and auction records are browser-local in the current static prototype. Data is not shared between devices or users.
6. `marketplace-api-config.js` leaves `apiBaseUrl` blank and remote catalogue loading disabled. The integration notes say the early SQLite API is not ready for production writes; checkout/payment, shipment integrations, and SMX Coins are not live integrations.
7. `seller-dashboard.html` and `seller-analytics.html` both implement page-specific analytics logic inline, while a separate `seller-analytics.js` also exists. The source of truth and responsibilities should be consolidated after comparing their current consumers.
8. `auctions.js` sets the payment window to 15 minutes, but its explanatory comment still says the next bidder gets 48 hours. The user-facing copy and code must agree.
9. The root has no README. Project context is split across multiple roadmap and integration documents; a concise contributor guide should be added once the deployment target is chosen.

## Research translated into design decisions

- Shopify's current ecommerce UX guidance emphasizes useful product photography, complete descriptions, visible variants/availability, and clear shipping/price information.
- Marketplace seller UX guidance emphasizes predictable reusable patterns for onboarding, product listings, inventory, and analytics.
- Minimalist commerce references emphasize clear hierarchy, breathing room, easy mobile browsing, and removing decorative content that competes with shopping.

References:
- https://www.shopify.com/blog/ecommerce-ux
- https://www.netguru.com/blog/seller-ux-playbook-design-patterns-marketplace
- https://www.shopify.com/blog/simple-website-design
- https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits
- https://docs.github.com/en/enterprise-cloud%40latest/pages/getting-started-with-github-pages/what-is-github-pages


## Cross-repository backend check

The connected GitHub account also contains `mohammedkulsum207-stack/SmithX-AI-Backend`. It is the existing Flask service referenced by the frontend integration notes and includes `marketplace_store.py`, `seller_auth.py`, and backend tests. It currently provides a SQLite-backed catalogue, seller registration/login, and test-order endpoints. The frontend API URL remains blank, so this service is not connected to the storefront.

Additional integration blockers confirmed during inspection:

- `seller-account.js` and `seller-analytics.js` exist in the frontend repository but are not loaded by the current seller analytics page. The current page uses separate inline browser-local analytics logic. Do not claim the server analytics UI is connected.
- The backend currently calls `CORS(app)`, which allows cross-origin requests broadly. Before any public frontend connection, replace this with an explicit environment-configured origin allowlist and test rejected origins.
- The backend's order endpoint is explicitly a pending test-order endpoint. It does not charge money or prove payment. Keep it disconnected from production checkout until authentication, inventory concurrency/idempotency, payment verification, and reconciliation are implemented.
- Do not deploy or connect the API as part of a visual-only change. Backend hardening and deployment should be a separate reviewed workstream with its own tests.

## Implementation order

### Pass 1 — visual consistency and navigation
- Establish a single monochrome token set and consistent typography, spacing, borders, focus states, buttons, cards, forms, and responsive navigation.
- Remove duplicate stylesheet references and replace conflicting gold accents in shared global components.
- Verify all pages retain their component-specific CSS and JavaScript; do not delete phase files just because their names are old.
- Keep the home page product-first: search, category/price filters, sorting, saved items, product cards, cart. No vision/mission hero or seller analytics content.

### Pass 2 — journey clarity and demo honesty
- Align navigation labels and links across pages.
- Separate seller store/profile setup from analytics, and make seller-only screens explain access requirements.
- Audit seller product publication visibility and ensure draft items do not appear publicly.
- Fix stale auction rules/copy and label auction settlement/payment as demo-only.

### Pass 3 — behavior and regression checks
- Check all referenced local CSS/JS/image paths.
- Check duplicate IDs, missing local page targets, repeated stylesheets, inline script syntax, and stale navigation.
- Exercise key flows: search/filter/sort, cart, demo checkout, sign-in/register, seller store setup, product draft/publish, analytics access, and auction expiry.
- Test narrow mobile layouts and keyboard focus; verify no horizontal overflow.
- Only promote the branch after the reviewed changes pass these checks.

### Pass 4 — production architecture gate
- Choose suitable application hosting before real commercial launch.
- Deploy a secured backend and persistent production database; enforce authentication, role/ownership, inventory transactions, and payment verification server-side.
- Add automated tests, monitoring, backup/restore verification, and payment reconciliation before enabling real checkout.
