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
| `checkout-config.js` | Phase 2: delivery prices, fees, VAT, payment methods — one place to edit |
| `phase2.js` / `phase2.css` | Phase 2: full checkout |
| `phase2-orders.js` | Phase 2: order details, receipts, cancel, refund requests on My Orders |
| `wallet.js` / `wallet.html` | Phase 3: SMX Credit ledger, wallet page, nav link |
| `auth.js` (edited) | Adds `country` and demo `smxResetPassword` |
| `login.html` (edited) | "Forgot password?" form and country field |
| `index.html` / `profile.html` (edited) | Load the new files and add Build Log entries |

`app.js` and `styles.css` were not changed. `my-orders.html` (phase 2) only stops deleting delivered orders and loads the new script.
