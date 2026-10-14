"use strict";

/* =====================================================
   SMITHX — INTERNATIONAL (intl.js)
   Phase 5. Needs intl-config.js (and wallet.js for the
   signed-in user, if present).

   • Region picker in the header: shopping from (country),
     show prices in (currency), language.
     No location permission is ever requested: the default
     comes from the account's country, then the device time
     zone, then Kenya.
   • Approximate local-currency prices next to KES prices.
     Customers are always charged in KES; checkout says so.
   • Waitlist for countries SMITHX doesn't deliver to yet,
     to measure demand before expanding.
   • Each new order records the display currency and the
     rate shown, so the conversion can be audited later.
   • Kiswahili (beta) for menus and main buttons.

   To remove: delete this file, intl-config.js and their
   <script> tags. Nothing else depends on them.
===================================================== */

const SMX_REGION_KEY = "smithx_region_v1";
const SMX_FX_KEY = "smithx_fx_v1";
const SMX_WAITLIST_KEY = "smithx_waitlist_v1";

function smxIntlRead(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value == null ? fallback : value;
  } catch (error) {
    return fallback;
  }
}

function smxMarket(name) {
  const markets = window.SMX_INTL.markets;
  return markets.find(m => m.name === name) || markets.find(m => m.name === "Other");
}

function smxGuessCountry() {
  const user = typeof smxWalletUser === "function" ? smxWalletUser() : null;
  if (user && user.country && window.SMX_INTL.markets.some(m => m.name === user.country)) {
    return { country: user.country, source: "account" };
  }
  try {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const hit = window.SMX_INTL.markets.find(m => m.timezones.includes(zone));
    if (hit) return { country: hit.name, source: "timezone" };
  } catch (error) { /* ignore */ }
  return { country: "Kenya", source: "default" };
}

function smxRegion() {
  const saved = smxIntlRead(SMX_REGION_KEY, null);
  if (saved && saved.country) {
    return {
      country: saved.country,
      currency: window.SMX_INTL.currencies[saved.currency] ? saved.currency : smxMarket(saved.country).currency,
      language: window.SMX_INTL.languages[saved.language] ? saved.language : "en",
      source: saved.source || "chosen"
    };
  }
  const guess = smxGuessCountry();
  return { country: guess.country, currency: smxMarket(guess.country).currency, language: "en", source: guess.source };
}

function smxSaveRegion(region) {
  const next = { ...region, source: "chosen", setAt: new Date().toISOString() };
  localStorage.setItem(SMX_REGION_KEY, JSON.stringify(next));
  return next;
}

/* ---------------- Exchange rates ---------------- */

function smxRates() {
  const cfg = window.SMX_INTL.rates;
  const cached = smxIntlRead(SMX_FX_KEY, null);
  if (cached && cached.rates && cached.rates.USD) {
    return { rates: { ...cfg.fallback, ...cached.rates }, updated: cached.updated, live: true, fetchedAt: cached.fetchedAt };
  }
  return { rates: cfg.fallback, updated: cfg.fallbackDate, live: false, fetchedAt: null };
}

async function smxRefreshRates(force) {
  const cfg = window.SMX_INTL.rates;
  const cached = smxIntlRead(SMX_FX_KEY, null);
  const fresh = cached && cached.fetchedAt && Date.now() - new Date(cached.fetchedAt).getTime() < cfg.cacheHours * 3600 * 1000;
  if (fresh && !force) return smxRates();
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    const response = await fetch(cfg.url, { signal: controller.signal });
    clearTimeout(timer);
    const data = await response.json();
    if (data.result !== "success" || !data.rates || !data.rates.USD) throw new Error("Bad rate data");
    const keep = {};
    Object.keys(window.SMX_INTL.currencies).forEach(code => {
      if (typeof data.rates[code] === "number" && data.rates[code] > 0) keep[code] = data.rates[code];
    });
    keep.KES = 1;
    localStorage.setItem(SMX_FX_KEY, JSON.stringify({ rates: keep, updated: data.time_last_update_utc, fetchedAt: new Date().toISOString() }));
  } catch (error) {
    /* Keep using cached or built-in rates. */
  }
  return smxRates();
}

function smxConvert(kes, currency) {
  const rate = smxRates().rates[currency];
  return rate ? (Number(kes) || 0) * rate : null;
}

function smxFormatMoney(amount, currency) {
  const info = window.SMX_INTL.currencies[currency] || { decimals: 2 };
  const value = Number(amount) || 0;
  const decimals = value >= 1000 ? 0 : info.decimals;
  return currency + " " + value.toLocaleString("en-KE", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function smxApprox(kes, currency) {
  const target = currency || smxRegion().currency;
  if (target === "KES") return "";
  const value = smxConvert(kes, target);
  return value == null ? "" : "≈ " + smxFormatMoney(value, target);
}

/* ---------------- Waitlist ---------------- */

function smxJoinWaitlist(email, country) {
  const clean = String(email || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(clean)) throw new Error("Enter a valid email address.");
  const list = smxIntlRead(SMX_WAITLIST_KEY, []);
  if (list.some(item => item.email === clean && item.country === country)) return false;
  list.push({ email: clean, country, at: new Date().toISOString() });
  localStorage.setItem(SMX_WAITLIST_KEY, JSON.stringify(list));
  return true;
}

/* ---------------- Kiswahili (beta) ---------------- */

const SMX_SW = {
  "Marketplace": "Soko",
  "Auctions": "Minada",
  "Sell": "Uza",
  "My Orders": "Oda Zangu",
  "SMX Wallet": "Pochi ya SMX",
  "Login": "Ingia",
  "Sign in": "Ingia",
  "Sign out": "Toka",
  "Profile": "Wasifu",
  "Settings": "Mipangilio",
  "Home": "Nyumbani",
  "Add to cart": "Weka kikapuni",
  "Add to Cart": "Weka kikapuni",
  "View Cart": "Tazama kikapu",
  "Cart": "Kikapu",
  "Checkout": "Lipia",
  "Save": "Hifadhi",
  "♡ Save": "♡ Hifadhi",
  "Saved": "Vilivyohifadhiwa",
  "Share": "Shiriki",
  "Close": "Funga",
  "Cancel": "Ghairi",
  "All": "Zote",
  "Electronics": "Elektroniki",
  "Fashion": "Mitindo",
  "Beauty": "Urembo",
  "Accessories": "Vifaa",
  "Sort": "Panga",
  "Price": "Bei",
  "Featured": "Vilivyochaguliwa",
  "Any price": "Bei yoyote",
  "Reviews": "Maoni",
  "No reviews yet": "Bado hakuna maoni",
  "Write a review": "Andika maoni",
  "Live now": "Inaendelea sasa",
  "Ended": "Imeisha",
  "My bids": "Zabuni zangu",
  "My auctions": "Minada yangu",
  "Create an auction": "Anzisha mnada",
  "Place bid": "Weka zabuni",
  "Current bid": "Zabuni ya sasa",
  "Starting at": "Inaanzia",
  "Time left": "Muda uliobaki",
  "Bid history": "Historia ya zabuni",
  "Delivery": "Usafirishaji",
  "Total to pay": "Jumla ya kulipa",
  "Order total": "Jumla ya oda",
  "Pay with": "Lipa kwa",
  "Balance": "Salio",
  "Top up": "Ongeza salio",
  "Withdraw": "Toa pesa",
  "Track order": "Fuatilia oda",
  "Search products...": "Tafuta bidhaa...",
  "← Marketplace": "← Soko",
  "Shop now": "Nunua sasa",
  "Discover": "Gundua",
  "Dashboard": "Dashibodi",
  "My Store": "Duka Langu",
  "Updates": "Masasisho",
  "Orders": "Oda"
};

function smxTranslateTree(root) {
  if (smxRegion().language !== "sw" || !root) return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent || parent.closest("script, style, textarea, [data-no-translate]")) return NodeFilter.FILTER_REJECT;
      return SMX_SW[node.nodeValue.trim()] ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
    }
  });
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(node => {
    const raw = node.nodeValue;
    node.nodeValue = raw.replace(raw.trim(), SMX_SW[raw.trim()]);
  });
  (root.querySelectorAll ? root.querySelectorAll("input[placeholder]") : []).forEach(input => {
    const t = SMX_SW[input.placeholder];
    if (t) input.placeholder = t;
  });
}

/* ---------------- Page behaviour ---------------- */

(function () {
  if (!window.SMX_INTL) return;
  const esc = value => String(value ?? "").replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
  const PRICE = /^KES\s?([\d,]+(?:\.\d+)?)$/;
  let busy = false;

  /* ----- approximate prices ----- */

  function ownText(el) {
    let text = "";
    el.childNodes.forEach(node => { if (node.nodeType === 3) text += node.nodeValue; });
    return text.trim();
  }

  function annotate(root) {
    const region = smxRegion();
    const scope = root && root.querySelectorAll ? root : document.body;
    if (!scope) return;
    busy = true;
    scope.querySelectorAll("*").forEach(el => {
      if (el.closest("script, style, select, option, button, input, textarea, .smx-fx, [data-no-fx], title")) return;
      const kids = Array.from(el.children);
      if (kids.some(kid => !kid.classList.contains("smx-fx"))) return;
      const match = ownText(el).match(PRICE);
      const existing = el.querySelector(":scope > .smx-fx");
      if (!match || region.currency === "KES") {
        if (existing) existing.remove();
        return;
      }
      const amount = Number(match[1].replace(/,/g, ""));
      const label = amount > 0 ? smxApprox(amount, region.currency) : "";
      if (!label && existing) existing.remove();
      if (!label) return;
      if (existing) {
        if (existing.textContent !== label) existing.textContent = label;
      } else {
        const span = document.createElement("span");
        span.className = "smx-fx";
        span.textContent = label;
        el.appendChild(span);
      }
    });
    busy = false;
  }

  /* ----- header button + dialog ----- */

  function makeButton(extra) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "smx-region-btn " + extra;
    button.setAttribute("aria-label", "Region, currency and language");
    button.setAttribute("data-no-translate", "");
    button.addEventListener("click", openDialog);
    return button;
  }

  function addButton() {
    if (document.querySelector(".smx-region-btn")) return;
    const header = document.querySelector("header");
    if (!header) return;
    const drawer = document.querySelector(".nav-links");
    const nav = drawer || header.querySelector(".header-links");

    /* Header copy: sits just before the sign-in / sign-out / back button. */
    const visible = el => el && getComputedStyle(el).display !== "none";
    const anchor = ["#signOutTop", ".back-btn", ".smx-account-link", "#loginNavButton", ".nav-login-btn"]
      .map(sel => header.querySelector(sel)).find(visible) || header.querySelector("#loginNavButton");
    const top = makeButton("is-header" + (drawer ? " has-drawer" : ""));
    if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(top, anchor);
    else if (nav && nav.parentNode) nav.parentNode.insertBefore(top, nav.nextSibling);
    else header.appendChild(top);

    /* Phone menu copy (homepage drawer only). */
    if (drawer) drawer.appendChild(makeButton("is-nav"));
    paintButton();
  }

  function paintButton() {
    const region = smxRegion();
    const market = smxMarket(region.country);
    document.querySelectorAll(".smx-region-btn").forEach(b => {
      b.innerHTML = `<span class="smx-region-code">${esc(market.code === "XX" ? "INTL" : market.code)}</span><span class="smx-region-cur">${esc(region.currency)}${region.language === "sw" ? " · SW" : ""}</span>`;
    });
  }

  function openDialog() {
    const region = smxRegion();
    const fx = smxRates();
    const I = window.SMX_INTL;
    const wrap = document.createElement("div");
    wrap.className = "smx-region-dialog";
    wrap.setAttribute("role", "dialog");
    wrap.setAttribute("aria-modal", "true");
    wrap.setAttribute("aria-labelledby", "smxRegionTitle");
    wrap.setAttribute("data-no-translate", "");
    wrap.innerHTML = `
      <form class="smx-region-box" novalidate>
        <h2 id="smxRegionTitle">Region and currency</h2>
        <label>Shopping from
          <select name="country">${I.markets.map(m => `<option value="${esc(m.name)}" ${m.name === region.country ? "selected" : ""}>${esc(m.name)}${m.status === "live" ? "" : " · delivery coming"}</option>`).join("")}</select>
        </label>
        <label>Show prices in
          <select name="currency">${Object.entries(I.currencies).map(([code, c]) => `<option value="${code}" ${code === region.currency ? "selected" : ""}>${code} — ${esc(c.label)}</option>`).join("")}</select>
        </label>
        <label>Language
          <select name="language">${Object.entries(I.languages).map(([code, l]) => `<option value="${code}" ${code === region.language ? "selected" : ""}>${esc(l.label)}</option>`).join("")}</select>
        </label>
        <p class="smx-region-note" data-market></p>
        <p class="smx-region-small">You're always charged in <strong>KES</strong>. Other currencies are a guide at the day's rate (${esc(String(fx.updated || "").replace(/ \+0000$/, "").replace(/\s\d\d:\d\d:\d\d$/, ""))}${fx.live ? "" : ", saved rates"}). Rates by <a href="${esc(I.rates.source)}" target="_blank" rel="noopener">${esc(I.rates.sourceLabel)}</a>. Kiswahili covers menus and main buttons for now.</p>
        <div class="smx-region-actions">
          <button type="submit" class="smx-region-save">Save</button>
          <button type="button" class="smx-region-cancel" data-close>Cancel</button>
        </div>
      </form>`;
    document.body.appendChild(wrap);

    const form = wrap.querySelector("form");
    const note = () => {
      const market = smxMarket(form.country.value);
      wrap.querySelector("[data-market]").textContent = market.status === "live"
        ? `Delivery available. Pay with ${market.payments.join(", ")}.`
        : `SMITHX doesn't deliver to ${market.name === "Other" ? "your country" : market.name} yet. You can browse with ${market.currency} prices as a guide and join the waitlist.`;
    };
    form.country.addEventListener("change", () => {
      form.currency.value = smxMarket(form.country.value).currency;
      note();
    });
    note();
    form.currency.focus();

    const close = () => wrap.remove();
    wrap.addEventListener("click", e => { if (e.target === wrap || e.target.closest("[data-close]")) close(); });
    wrap.addEventListener("keydown", e => { if (e.key === "Escape") close(); });

    form.addEventListener("submit", e => {
      e.preventDefault();
      const before = smxRegion();
      const next = smxSaveRegion({ country: form.country.value, currency: form.currency.value, language: form.language.value });
      close();
      if (before.language !== next.language) { location.reload(); return; }
      paintButton();
      annotate();
      renderBanner();
    });
  }

  /* ----- waitlist banner ----- */

  function renderBanner() {
    const old = document.getElementById("smxIntlBanner");
    if (old) old.remove();
    const region = smxRegion();
    const market = smxMarket(region.country);
    if (market.status === "live") return;
    const dismissed = smxIntlRead("smithx_intl_banner_v1", {});
    if (dismissed[region.country]) return;
    const user = typeof smxWalletUser === "function" ? smxWalletUser() : null;
    const where = market.name === "Other" ? "your country" : market.name;

    const bar = document.createElement("div");
    bar.id = "smxIntlBanner";
    bar.className = "smx-intl-banner";
    bar.setAttribute("role", "region");
    bar.setAttribute("aria-label", "International shopping");
    bar.innerHTML = `
      <p><strong>Shopping from ${esc(where)}?</strong> We don't deliver there yet. Prices show in ${esc(region.currency)} as a guide; orders are charged in KES.</p>
      <form class="smx-intl-wait" novalidate>
        <input type="email" name="email" placeholder="Your email" value="${esc(user ? user.email : "")}" aria-label="Email for the waitlist">
        <button type="submit">Notify me</button>
      </form>
      <button type="button" class="smx-intl-x" aria-label="Dismiss">×</button>`;
    const header = document.querySelector("header");
    if (header && header.parentNode) header.insertAdjacentElement("afterend", bar);
    else document.body.prepend(bar);

    bar.querySelector(".smx-intl-x").addEventListener("click", () => {
      const d = smxIntlRead("smithx_intl_banner_v1", {});
      d[region.country] = true;
      localStorage.setItem("smithx_intl_banner_v1", JSON.stringify(d));
      bar.remove();
    });
    bar.querySelector("form").addEventListener("submit", e => {
      e.preventDefault();
      try {
        const added = smxJoinWaitlist(e.target.email.value, region.country);
        bar.querySelector("form").outerHTML = `<p class="smx-intl-ok">${added ? "You're on the list." : "You're already on the list."} We'll email you when delivery to ${esc(where)} opens.</p>`;
      } catch (err) {
        e.target.email.setCustomValidity(err.message);
        e.target.email.reportValidity();
        e.target.email.addEventListener("input", () => e.target.email.setCustomValidity(""), { once: true });
      }
    });
  }

  /* ----- checkout notes ----- */

  function checkoutNotes() {
    const totals = document.querySelector("#smxCoBody .smx-co-totals:not(.smx-conf-breakdown)");
    if (totals && !totals.nextElementSibling?.classList.contains("smx-fx-note")) {
      const region = smxRegion();
      if (region.currency !== "KES") {
        const p = document.createElement("p");
        p.className = "smx-fx-note";
        p.textContent = `You'll be charged in KES. ${region.currency} amounts are a guide at today's rate; your bank or mobile money provider may use a different rate or add fees.`;
        totals.insertAdjacentElement("afterend", p);
      }
    }
    document.querySelectorAll("#smxCoBody .smx-co-alert").forEach(alert => {
      if (!/outside Kenya/.test(alert.textContent) || alert.querySelector(".smx-fx-customs")) return;
      const extra = document.createElement("span");
      extra.className = "smx-fx-customs";
      extra.textContent = " " + window.SMX_INTL.customsNote.replace(/^Delivery outside Kenya isn't available yet\.\s*/, "");
      alert.appendChild(extra);
    });
  }

  /* ----- record display currency on new orders ----- */

  if (typeof window.createOrderFromCart === "function") {
    const original = window.createOrderFromCart;
    window.createOrderFromCart = function () {
      const order = original.apply(this, arguments);
      try {
        if (order && order.orderId) {
          const region = smxRegion();
          const fx = smxRates();
          const display = {
            country: region.country,
            currency: region.currency,
            rate: fx.rates[region.currency] || null,
            rateDate: fx.updated || null,
            rateSource: fx.live ? window.SMX_INTL.rates.sourceLabel : "built-in",
            approxTotal: region.currency === "KES" ? order.total : Math.round((smxConvert(order.total, region.currency) || 0) * 100) / 100,
            chargedCurrency: "KES"
          };
          order.display = display;
          const orders = smxIntlRead("smithx_orders_v2", []);
          const index = orders.findIndex(item => item.orderId === order.orderId);
          if (index !== -1) {
            orders[index] = { ...orders[index], display };
            localStorage.setItem("smithx_orders_v2", JSON.stringify(orders));
          }
        }
      } catch (error) { /* never block an order */ }
      return order;
    };
  }

  /* ----- styles ----- */

  const style = document.createElement("style");
  style.textContent = `
    .smx-fx { display: inline-block; margin-left: 6px; font-size: .78em; font-weight: 500; opacity: .62; white-space: nowrap; letter-spacing: 0; text-transform: none; font-family: inherit; }
    .smx-region-btn { display: inline-flex; flex: 0 0 auto; align-items: center; gap: 6px; min-height: 36px; padding: 0 12px; margin-right: 10px; border-radius: 999px; border: 1px solid rgba(255,255,255,.28); background: transparent; color: #f5efe4; font: inherit; font-size: .82rem; font-weight: 600; cursor: pointer; white-space: nowrap; }
    .smx-region-btn:hover { border-color: currentColor; }
    .smx-region-code { padding: 1px 6px; border-radius: 6px; background: #e8a33d; color: #16130f; font-size: .72rem; font-weight: 700; }
    .smx-region-dialog { position: fixed; inset: 0; z-index: 3000; display: grid; place-items: center; padding: 20px; background: rgba(14,12,9,.62); }
    .smx-region-box { width: min(440px, 100%); max-height: calc(100vh - 40px); overflow-y: auto; display: grid; gap: 14px; padding: 24px; border-radius: 20px; background: #fffdf8; color: #16130f; box-shadow: 0 30px 70px rgba(0,0,0,.4); font-family: inherit; }
    .smx-region-box h2 { font-size: 1.5rem; margin: 0; }
    .smx-region-box label { display: grid; gap: 6px; font-size: .85rem; font-weight: 600; }
    .smx-region-box select { min-height: 44px; padding: 0 12px; border: 1px solid rgba(22,19,15,.18); border-radius: 12px; background: #fff; font: inherit; font-weight: 400; color: #16130f; }
    .smx-region-note { padding: 10px 12px; border-radius: 12px; background: #f3e3c2; color: #5f420e; font-size: .86rem; margin: 0; }
    .smx-region-small { font-size: .78rem; color: #6b6458; margin: 0; }
    .smx-region-small a { color: inherit; }
    .smx-region-actions { display: flex; gap: 10px; }
    .smx-region-actions button { min-height: 44px; padding: 0 20px; border-radius: 999px; font: inherit; font-weight: 600; cursor: pointer; }
    .smx-region-save { background: #16130f; color: #fff; border: 0; }
    .smx-region-cancel { background: transparent; border: 1px solid rgba(22,19,15,.22); color: #16130f; }
    .smx-intl-banner { position: relative; z-index: 5; display: flex; flex-wrap: wrap; align-items: center; gap: 10px 16px; padding: 12px 52px 12px 20px; background: #f3e3c2; color: #3d2a08; font-size: .9rem; }
    .smx-intl-banner p { margin: 0; flex: 1 1 320px; }
    .smx-intl-wait { display: flex; gap: 8px; flex: 0 1 360px; }
    .smx-intl-wait input { flex: 1; min-width: 0; min-height: 38px; padding: 0 12px; border: 1px solid rgba(22,19,15,.2); border-radius: 10px; font: inherit; }
    .smx-intl-wait button { min-height: 38px; padding: 0 14px; border: 0; border-radius: 10px; background: #16130f; color: #fff; font: inherit; font-weight: 600; cursor: pointer; white-space: nowrap; }
    .smx-intl-x { position: absolute; top: 8px; right: 12px; width: 32px; height: 32px; border: 0; background: transparent; font-size: 1.4rem; cursor: pointer; color: inherit; }
    .smx-intl-ok { font-weight: 600; }
    .smx-fx-note { margin: 10px 0 0; font-size: .8rem; color: #6b6458; }
    .smx-region-btn.is-nav { display: none; }
    .nav-links a { white-space: nowrap; }
    @media (max-width: 1320px) {
      .smx-region-btn.has-drawer { padding: 0 8px; margin-right: 6px; margin-left: auto; }
      .smx-region-btn.has-drawer + .nav-login-btn, .smx-region-btn.has-drawer + .smx-account-link { margin-left: 0 !important; }
      .smx-region-btn.has-drawer .smx-region-cur { display: none; }
      .nav-links.smx-open .smx-region-btn.is-nav { display: inline-flex; align-self: flex-start; margin: 12px 0 4px; }
    }
    @media (max-width: 460px) { .smx-region-btn.has-drawer { display: none; } }
    @media (max-width: 560px) { .smx-region-btn.is-header { min-height: 34px; padding: 0 6px; margin-right: 2px; } .smx-region-btn.is-header .smx-region-cur { display: none; } .smx-intl-wait { flex-basis: 100%; } }
  `;
  document.head.appendChild(style);

  /* ----- start ----- */

  function start() {
    const region = smxRegion();
    if (region.language === "sw") document.documentElement.lang = "sw";
    addButton();
    renderBanner();
    smxTranslateTree(document.body);
    annotate();

    let queued = false;
    new MutationObserver(mutations => {
      if (busy || queued) return;
      if (mutations.every(m => m.target.classList && m.target.classList.contains("smx-fx"))) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        addButton();
        smxTranslateTree(document.body);
        annotate();
        checkoutNotes();
      });
    }).observe(document.body, { childList: true, subtree: true, characterData: true });

    smxRefreshRates().then(() => annotate());
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
