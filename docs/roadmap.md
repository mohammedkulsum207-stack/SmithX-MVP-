# SM1THX Roadmap and MVP Audit

Last reviewed: 12 October 2026

Rule for development: keep the existing MVP working, change only what's needed, and test each update before moving on.

Key: ✅ done in MVP · 🟡 partial / demo only · ⬜ not started · 🔒 waiting on a decision

The MVP is a static GitHub Pages site. All data (accounts, stores, products, cart, orders) is saved in the visitor's browser (`localStorage`). Many items below can't be fully finished without a backend (database + server). Choosing one is the main decision blocking Phase 2.

## Phase 1: strengthen the existing MVP

| Area | Item | Status | Notes |
|---|---|---|---|
| Accounts | Registration and sign-in | 🟡 | Demo accounts stored in the browser (`auth.js`) |
| Accounts | Buyer / seller / both account types | ✅ | |
| Accounts | Profile and account settings | ✅ | `profile.html` |
| Accounts | Password reset | 🟡 | Added (phase 1). Demo check of phone or name; a live version needs an email/SMS one-time code |
| Accounts | Email or phone verification | ⬜ | Needs backend + email/SMS provider |
| Accounts | Country selection | ✅ | Added at sign-up and in Settings (phase 1) |
| Accounts | Preferred currency | 🔒 | Prices stay in KES until the SMX Coins and currency model is decided |
| Storefronts | Sellers create their own store | ✅ | Added (phase 1): Profile → My Store → Store setup |
| Storefronts | Unique name and public link | 🟡 | `store.html?s=your-store`. Unique within this browser. Becomes truly public once a backend exists |
| Storefronts | Colours / theme / branding | 🟡 | 6 colour themes + initials logo. Logo/banner upload is next |
| Storefronts | Description | ✅ | Tagline + About |
| Storefronts | Preview before publishing | ✅ | Draft / Published status + Preview button |
| Storefronts | Share storefront | ✅ | Native share sheet or copy link |
| Storefronts | Manage products, prices, images | 🟡 | Create works (Seller Studio). Edit/delete and stock are next |
| Storefronts | Seller dashboard | 🟡 | Demo analytics + order management already exist |
| Storefronts | Seller verification badge | ⬜ | Needs admin review process |
| Marketplace | Search and category filters | ✅ | Existing |
| Marketplace | Price filter and sorting | ✅ | Added (phase 1) |
| Marketplace | Location / availability / rating filters | ⬜ | Needs stock, seller location and reviews data first |
| Marketplace | Product details | ✅ | Existing modal. Now has a shareable link `index.html?product=ID` |
| Marketplace | Wishlist / saved products | ✅ | Added (phase 1) |
| Marketplace | Store badge on products | ✅ | "by Store Name" links to the storefront |
| Marketplace | Variants, stock, delivery estimates | ⬜ | Phase 1b |
| Marketplace | Report a listing | ⬜ | Phase 1b |
| Orders | Customer purchase history | ✅ | `my-orders.html` + Profile → My Orders |
| Orders | Order status and tracking | ✅ | Demo statuses Pending → Delivered |
| Orders | Seller order management | ✅ | Dashboard → Orders |
| Orders | Cancellation / refund request | ⬜ | Phase 2 |
| UI | Responsive on phone / tablet / desktop | ✅ | Fixed: navigation was hidden on phones with no menu. Now there's a menu button up to 1320px wide (raised in phase 5 as the menu grew). Tested at 360–1440px with no sideways scrolling |
| UI | Empty / loading / success messages | 🟡 | Most screens have empty states |

## Phase 2: complete the shopping journey

| Item | Status | Notes |
|---|---|---|
| Cart (add, quantity, remove, subtotal) | ✅ | Existing. Cart now says delivery and fees are shown at checkout |
| Delivery address at checkout | ✅ | Name, phone, county, town, street, notes. Saved if checkout is interrupted |
| Delivery options + estimated dates | 🟡 | Standard / express / pickup, Nairobi vs rest of Kenya. Demo prices in `checkout-config.js` until a courier is chosen |
| Full breakdown before paying | ✅ | Products + delivery + transaction fee + VAT = total, with the charge currency |
| Transaction fee | 🔒 | Set to KES 0 until the fee decision. Change in `checkout-config.js` |
| VAT | ✅ | Kenya standard rate 16% (KRA), shown as included in prices |
| Payment screens (processing, success, pending, failed) | ✅ | Demo M-Pesa / card. A test switch picks the outcome |
| Prevent duplicate orders | ✅ | One order per checkout attempt |
| Availability check | 🟡 | Blocks checkout if a product is gone or over stock (stock field comes with product editing) |
| Order confirmation + receipt | ✅ | Breakdown, payment reference, printable / save-as-PDF receipt |
| Cancel before shipping + refund | 🟡 | Demo refund to the original method. Cancelled orders kept in history |
| Return / refund request after delivery | 🟡 | 7-day window, reason + details, "Under review" status. Seller review screen still to do |
| Delivered orders stay in history | ✅ | Previously deleted when delivered |
| Real payment provider | 🔒 | Needs a backend first. Options: M-Pesa Daraja (STK Push), Paystack, Flutterwave, Pesapal |
| Real courier integration + tracking | 🔒 | Needs courier choice |
| Payouts, reconciliation, seller refunds | ⬜ | Needs backend |

## Phase 3: SMX Coins → "SMX Credit" (demo prepaid store credit)

Decision (12 Oct 2026): SMX Coins are prepaid store credit.

| Rule | Decision |
|---|---|
| Value | 1 SMX = KES 1, fixed. No exchange rate |
| How you get it | Top up with M-Pesa (demo) |
| Where you spend it | Only on SM1THX, for all or part of an order |
| Transfers | Not allowed between users |
| Expiry | Never expires |
| Cash out | Withdraw unused credit to M-Pesa at full value |
| Interest | None |
| Refunds | Credit used on a cancelled order returns to the wallet immediately |
| Limits | KES 50–75,000 per top-up, KES 100,000 max balance, KES 1,000,000 monthly top-ups |

| Item | Status | Notes |
|---|---|---|
| Wallet page with balance and history | ✅ | `wallet.html`. Needs sign-in |
| Top-up (demo M-Pesa) with success / fail | ✅ | |
| Withdraw to M-Pesa (demo) | ✅ | |
| Pay with SMX Credit at checkout | ✅ | Full or partial; remainder via M-Pesa / card |
| Refund SMX to wallet on cancel | ✅ | Split refunds handled |
| Duplicate protection | ✅ | Every wallet action has a unique key |
| Tamper check | 🟡 | Balance is recalculated from the ledger; any mismatch pauses the wallet. A real ledger must live on a server |
| Legal / licensing | 🔒 | Stored credit is e-money in Kenya. Go-live needs CBK authorisation (e-money issuer) or a licensed partner holding funds in trust. Get a Kenyan lawyer's advice |
| Multi-currency display | ⬜ | Phase 5 |

## Phase 4: advanced commerce

| Item | Status | Notes |
|---|---|---|
| Auctions | 🟡 | `auctions.html`. Create (5 min demo → 7 days), live bids, minimum bid step, countdown, masked bidder names, "My bids" / "My auctions" tabs |
| Losing bids are free | ✅ | Losing bidders are never charged. The winning fee (currently 0%) is shown before every bid. Change it in `auctions.js` (`winningFeePercent`) |
| Fair-bidding rules | ✅ | No bidding on your own items, bids are binding, a bid in the last 2 minutes adds 2 minutes, sellers can only cancel before the first bid |
| Winner payment | ✅ | Winner is prompted to pay immediately; the 15-minute payment window and M-Pesa/SMX Credit flows remain demo-only. Creates a normal order in My Orders. If unpaid, it goes to the next-highest bidder |
| Reviews and ratings | ✅ | 1–5 stars + written review. Only buyers with a delivered order can review; sellers can't review their own products |
| Fake-review safeguards | 🟡 | Verified-purchase only, one review per product per person, no links or phone numbers, reports hide a review after 3 reports. Moderation dashboard needs a backend |
| Ratings shown | ✅ | Stars on product cards, rating breakdown in the product view, store rating on storefronts |
| Store Assistant | ✅ | Profile → My Store. Suggests 3 designs (theme, layout, tagline, About) and promo captions. Seller edits, then saves to approve. Optional |
| Store layouts | ✅ | Classic grid, Showcase, Compact |
| AI product-listing assistant | 🟡 | Fixed a bug where results never displayed. Falls back to a built-in draft while the AI service is offline (OpenAI account out of credits) |
| Live shopping | ⬜ | Needs a video provider and a backend; deferred |

Auctions and reviews are saved in this browser only until a backend is added, so other people can't see them yet.

## Phase 5: international growth

| Item | Status | Notes |
|---|---|---|
| Region picker | ✅ | Header button: shopping from, show prices in, language. Default comes from the account's country, then the device time zone, then Kenya. Never asks for location permission |
| Local-currency prices | ✅ | 15 currencies shown as "≈ UGX 140,981" next to KES prices. Daily rates from [Exchange Rate API](https://www.exchangerate-api.com), cached 12 hours, with built-in fallback rates |
| Charged currency shown before paying | ✅ | Checkout says orders are charged in KES and that banks/mobile money may use a different rate |
| Rate recorded on orders | ✅ | Each order saves the display currency, the rate and its date (`order.display`), so conversions can be checked later |
| Seller's original price and currency | ✅ | Listings stay in KES; conversion is display-only |
| Markets and waitlist | ✅ | Kenya is live. 12 other markets can browse and join a waitlist, which measures demand before expanding. Edit in `intl-config.js` |
| Kiswahili | 🟡 | Beta: menus and main buttons. Full translation needs a professional translator |
| International shipping and duties | 🔒 | Not offered yet. Checkout explains that duties will be shown before payment once available |
| Local payment methods per country | 🔒 | Waiting on the payment provider decision |
| Insights dashboard | ✅ | `insights.html`: GMV and platform revenue tracked separately, refund and cancellation rates, repeat customers, SMX Credit held, auctions, reviews, demand by country, sales by store, CSV export |
| Fraud and dispute rates | ⬜ | Needs payment provider data |
| Scalability | ⬜ | Needs a backend; every `localStorage` key maps to one database table (see below) |

### Comfort for everyone (all pages)

- No sideways scrolling at any width from 320px to 1920px (tested on every page)
- Homepage menu switches to the menu button below 1320px so links never wrap or overflow
- Clear keyboard focus outline, "Skip to content" link, closed panels can't be reached with Tab
- Fewer animations for people who turn on "reduce motion"
- 44px touch targets on touch screens, and 16px inputs so phones don't zoom in
- Passes an automated WCAG 2 A/AA check (axe-core) on every page

### Compliance checklist before launching in a new country

These are for a lawyer to confirm; they aren't legal advice.

1. **Kenya data protection.** Businesses processing personal data must register with the [Office of the Data Protection Commissioner](https://www.odpc.go.ke/faqs/). Those under KES 5 million turnover with fewer than 10 employees are exempt unless they're in a listed sector. Financial services and direct marketing must register regardless of size ([ODPC guidance](https://www.odpc.go.ke/wp-content/uploads/2024/02/ODPC-Guidance-Note-on-Registration-of-Data-Controllers-and-Data-Processors.pdf)). Store data transfers abroad must be declared.
2. **Cross-border goods in the EAC.** Under the [EAC Simplified Trade Regime](https://eayase.eac.int/news/trading-made-simple-your-guide-to-the-eac-simplified-trade-regime), consignments of EAC-made goods worth US$2,000 or less can be duty-free with a Simplified Certificate of Origin. VAT, excise and withholding tax can still apply. Goods made outside the EAC pay import duty.
3. **Foreign sellers.** Kenya's Significant Economic Presence tax is an effective 3% of gross turnover for non-residents earning through digital platforms, with no minimum threshold since the Finance Act 2025 ([PwC](https://taxsummaries.pwc.com/kenya/corporate/taxes-on-corporate-income)). The draft regulations place liability on the seller, not the marketplace ([KPMG](https://kpmg.com/us/en/taxnewsflash/news/2025/09/kenya-public-consultation-application-sep-tax.html)).
4. **SMX Credit abroad.** Stored credit is e-money in Kenya (see Phase 3); each new country needs its own check.
5. **Each new market:** consumer protection, VAT registration, payment licensing, and import rules for restricted goods.

### Moving to a backend (scalability)

| Browser key today | Becomes table |
|---|---|
| `smithx_auth_users_v1` / `smithx_auth_session_v1` | `users`, `sessions` (hashed passwords, email/SMS verification) |
| `smithx_stores_v1` | `stores` |
| `smithx_custom_products_v2` | `products` (+ `product_images`, stock) |
| `smithx_orders_v2` / `smithx_order_archive_v1` | `orders`, `order_items`, `payments`, `refunds` |
| `smithx_wallet_v1` | `wallet_ledger` (append-only, server-side) |
| `smithx_auctions_v1` | `auctions`, `bids` (server clock decides end time) |
| `smithx_reviews_v1` | `reviews`, `review_reports` |
| `smithx_waitlist_v1` | `waitlist` |
| `smithx_region_v1` / `smithx_fx_v1` | stay in the browser (preferences) + `fx_rates` table |

## Decisions still open

1. Backend / database (e.g. Supabase or Firebase) and hosting for it
2. Payment provider(s) and countries
3. SMX Coins model
4. Platform transaction fees
5. Delivery: SM1THX-arranged couriers vs. sellers' own couriers

## Files added in phase 1 (all removable)

| File | Purpose |
|---|---|
| `stores.js` | Shared storefront helpers |
| `store.html` | Public storefront page |
| `profile-store.js` | Store setup form + country setting on the profile page |
| `phase1.js` / `phase1.css` | Mobile menu, sort/price filters, wishlist, store badges, product sharing |
| `checkout-config.js` | Phase 2: delivery prices, fees, VAT, payment methods — one place to edit |
| `phase2.js` / `phase2.css` | Phase 2: full checkout |
| `phase2-orders.js` | Phase 2: order details, receipts, cancel, refund requests on My Orders |
| `wallet.js` / `wallet.html` | Phase 3: SMX Credit ledger, wallet page, nav link |
| `reviews.js` | Phase 4: reviews, ratings, report button, "Review your items" on My Orders |
| `auctions.js` / `auctions.html` | Phase 4: auctions, bidding rules, winner payment |
| `phase4-ai.js` | Phase 4: Store Assistant + product-listing fallback |
| `stores.js` / `profile-store.js` / `store.html` (edited) | Store layout option, store ratings |
| `intl-config.js` / `intl.js` | Phase 5: markets, currencies, region picker, local prices, waitlist, Kiswahili |
| `insights.html` | Phase 5: platform insights and CSV exports |
| `comfort.css` / `comfort.js` | All pages: small-screen fixes, keyboard focus, skip link, reduced motion, touch targets |
| `auth.js` (edited) | Adds `country` and demo `smxResetPassword` |
| `login.html` (edited) | "Forgot password?" form and country field |
| `index.html` / `profile.html` (edited) | Load the new files and add Build Log entries |

`app.js` and `styles.css` were not changed. `my-orders.html` (phase 2) only stops deleting delivered orders and loads the new script.
