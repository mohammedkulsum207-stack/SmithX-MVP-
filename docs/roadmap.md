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
| UI | Responsive on phone / tablet / desktop | ✅ | Fixed: navigation was hidden on phones with no menu. Now there's a menu button up to 1000px wide. Tested at 360–1440px with no sideways scrolling |
| UI | Empty / loading / success messages | 🟡 | Most screens have empty states |

## Phase 2: complete the shopping journey

| Item | Status | Notes |
|---|---|---|
| Cart (add, quantity, remove, subtotal) | ✅ | Existing |
| Demo checkout + order confirmation | ✅ | No real payment |
| Delivery address at checkout | ⬜ | |
| Delivery charges, fees, taxes shown before paying | ⬜ | Total = products + delivery + fees + taxes |
| Real payment provider | 🔒 | Decide provider (e.g. M-Pesa Daraja, Paystack, Flutterwave, Stripe) |
| Payment success / pending / failed screens | ⬜ | |
| Refunds, payouts, reconciliation | ⬜ | Needs backend |

## Phase 3: SMX Coins (decision first)

🔒 Do not build a wallet until the coin model is chosen: pricing unit, shopping credit, or transferable/redeemable token. Get specialist legal advice (payments, stored value, tax) for Kenya and every target market before launch.

## Phase 4: advanced commerce

⬜ Auctions (no fee for losing bids), AI storefront designer, reviews and ratings, live shopping. The AI product-listing assistant already exists in Seller Studio.

## Phase 5: international growth

⬜ Multi-currency, local payment methods, international shipping, customs, country compliance, analytics at scale.

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
| `auth.js` (edited) | Adds `country` and demo `smxResetPassword` |
| `login.html` (edited) | "Forgot password?" form and country field |
| `index.html` / `profile.html` (edited) | Load the new files and add Build Log entries |

`app.js`, `styles.css` and `my-orders.html` were not changed.
