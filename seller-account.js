"use strict";
/* SMITHX seller account + server analytics. Tokens stay in memory only. */
(function () {
  const config = window.SMX_MARKETPLACE_CONFIG || {};
  const base = String(config.apiBaseUrl || "").trim().replace(/\/+$/, "");
  let token = "";
  let seller = null;
  let period = "30d";
  let currency = "EUR";
  let latest = null;
  const visitorKey = createVisitorKey();

  function createVisitorKey() {
    try {
      const bytes = new Uint8Array(18);
      crypto.getRandomValues(bytes);
      return Array.from(bytes, b => b.toString(16).padStart(2, "0")).join("");
    } catch (_) {
      return "v_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    }
  }
  function esc(v) {
    return String(v == null ? "" : v).replace(/[&<>"']/g, c => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
  }
  function money(value, code) {
    try { return new Intl.NumberFormat(undefined, { style: "currency", currency: code, maximumFractionDigits: 2 }).format(Number(value) || 0); }
    catch (_) { return code + " " + (Number(value) || 0).toFixed(2); }
  }
  async function api(path, options) {
    if (!base) throw new Error("Backend URL is not configured. Set apiBaseUrl in marketplace-api-config.js after HTTPS deployment.");
    const response = await fetch(base + path, Object.assign({
      headers: { "Accept": "application/json" },
      mode: "cors",
      credentials: "omit"
    }, options || {}));
    let body;
    try { body = await response.json(); } catch (_) { throw new Error("The backend returned an invalid response."); }
    if (!response.ok) throw new Error(body && body.error ? body.error : "Request failed (" + response.status + ").");
    return body;
  }
  function root() { return document.getElementById("smxSellerAccount"); }
  function status(message, isError) {
    const node = document.getElementById("smxSellerAccountStatus");
    if (node) { node.textContent = message; node.style.color = isError ? "#b42318" : "inherit"; }
  }
  function shell() {
    const dashboard = document.getElementById("dashboard");
    if (!dashboard || root()) return;
    const host = document.createElement("section");
    host.id = "smxSellerAccount";
    host.setAttribute("aria-label", "Seller account and live analytics");
    host.style.cssText = "margin:24px 0;padding:20px;border:1px solid #d9dee8;border-radius:16px;background:var(--card-bg,#fff);color:var(--text-color,inherit)";
    host.innerHTML = '<div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px"><div><p style="margin:0 0 5px;font-size:12px;letter-spacing:.12em">SMITHX SELLER PORTAL</p><h3 style="margin:0">Account &amp; live analytics</h3></div><span id="smxSellerConnection" style="font-size:13px">Backend not configured</span></div>' +
      '<p id="smxSellerAccountStatus" role="status" aria-live="polite" style="margin:12px 0"></p>' +
      '<div id="smxSellerAuthForm" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;max-width:900px">' +
      '<label>Email<input id="smxSellerEmail" type="email" autocomplete="email" required style="display:block;width:100%;box-sizing:border-box;padding:10px;margin-top:4px"></label>' +
      '<label>Password (12+ characters for registration)<input id="smxSellerPassword" type="password" autocomplete="current-password" minlength="12" required style="display:block;width:100%;box-sizing:border-box;padding:10px;margin-top:4px"></label>' +
      '<div style="display:flex;gap:8px;align-items:end;flex-wrap:wrap"><button type="button" id="smxSellerLogin" class="primary-button">Sign in</button><button type="button" id="smxSellerRegister" class="secondary-button">Create seller account</button></div></div>' +
      '<div id="smxSellerLive" hidden></div>' +
      '<p style="font-size:12px;opacity:.8;margin-bottom:0">Server analytics are separate from the local demo dashboard below. Seller tokens remain in memory and are cleared on page refresh. Orders are not verified paid sales.</p>';
    const grid = dashboard.querySelector(".dashboard-grid");
    if (grid) grid.insertAdjacentElement("afterend", host); else dashboard.appendChild(host);
    document.getElementById("smxSellerLogin").addEventListener("click", () => authenticate("login"));
    document.getElementById("smxSellerRegister").addEventListener("click", () => authenticate("register"));
    const connection = document.getElementById("smxSellerConnection");
    if (!base) {
      connection.textContent = "Demo mode — no API URL";
      status("Sign-in is unavailable until the backend is deployed to HTTPS and apiBaseUrl is configured. The existing dashboard remains local demo data.");
    } else {
      connection.textContent = "API URL configured; live connection not yet verified";
      status("Sign in or create a seller account to load server-side analytics.");
    }
  }
  async function authenticate(mode) {
    const email = document.getElementById("smxSellerEmail").value.trim();
    const password = document.getElementById("smxSellerPassword").value;
    if (!email || !password) return status("Enter your email and password.", true);
    try {
      status(mode === "login" ? "Signing in…" : "Creating account…");
      const body = await api("/api/marketplace/seller/" + mode, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ email, password })
      });
      token = body.token;
      seller = body.seller;
      document.getElementById("smxSellerAuthForm").hidden = true;
      document.getElementById("smxSellerLive").hidden = false;
      document.getElementById("smxSellerConnection").textContent = "Signed in: " + seller.email;
      status("Signed in successfully. Loading seller analytics…");
      renderLiveShell();
      await loadAnalytics();
    } catch (error) { status(error.message, true); }
  }
  function renderLiveShell() {
    const host = document.getElementById("smxSellerLive");
    host.innerHTML = '<div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin:12px 0">' +
      '<label>Date range <select id="smxServerPeriod"><option value="today">Today</option><option value="7d">Last 7 days</option><option value="30d" selected>Last 30 days</option><option value="all">All time</option></select></label>' +
      '<label>Currency <select id="smxServerCurrency"><option value="EUR" selected>EUR (€)</option><option value="KES">KES</option><option value="USD">USD</option><option value="GBP">GBP</option><option value="CHF">CHF</option></select></label>' +
      '<button type="button" id="smxServerRefresh" class="secondary-button">Refresh</button><button type="button" id="smxServerLogout" class="secondary-button">Sign out</button></div>' +
      '<div id="smxServerMetrics" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px"></div>' +
      '<div id="smxServerTop" style="margin-top:14px"></div><p id="smxServerNote" style="font-size:12px;opacity:.8"></p>';
    document.getElementById("smxServerPeriod").value = period;
    document.getElementById("smxServerCurrency").value = currency;
    document.getElementById("smxServerPeriod").addEventListener("change", e => { period = e.target.value; loadAnalytics(); });
    document.getElementById("smxServerCurrency").addEventListener("change", e => { currency = e.target.value; paintAnalytics(); });
    document.getElementById("smxServerRefresh").addEventListener("click", loadAnalytics);
    document.getElementById("smxServerLogout").addEventListener("click", () => {
      token = ""; seller = null; latest = null;
      document.getElementById("smxSellerAuthForm").hidden = false;
      document.getElementById("smxSellerLive").hidden = true;
      document.getElementById("smxSellerConnection").textContent = base ? "API URL configured" : "Demo mode";
      status("Signed out. The token has been cleared from memory.");
    });
  }
  async function loadAnalytics() {
    if (!token) return;
    try {
      status("Refreshing server analytics…");
      latest = await api("/api/marketplace/seller/analytics?since=" + encodeURIComponent(period), {
        headers: { "Accept": "application/json", "Authorization": "Bearer " + token }
      });
      const available = Object.keys(latest.currency_totals || {});
      const select = document.getElementById("smxServerCurrency");
      Array.from(select.options).forEach(option => {
        option.disabled = option.value !== "EUR" && !available.includes(option.value);
      });
      if (!available.includes(currency) && available.length && currency !== "EUR") {
        currency = available[0];
        select.value = currency;
      }
      paintAnalytics();
      status("Server analytics loaded. These are order records, not verified paid sales.");
    } catch (error) { status(error.message, true); }
  }
  function paintAnalytics() {
    if (!latest) return;
    const totals = latest.currency_totals || {};
    const selected = totals[currency];
    const metrics = [
      ["Products listed", latest.products_listed],
      ["Inventory units", latest.inventory_units],
      ["Orders containing seller items", latest.orders],
      ["Units in orders", latest.units_sold_in_orders],
      ["Product views", latest.product_views],
      ["Unique visitor keys", latest.unique_visitors],
      ["Gross order value (" + currency + ")", selected ? money(selected.gross_order_value, currency) : "—"]
    ];
    document.getElementById("smxServerMetrics").innerHTML = metrics.map(([label, value]) =>
      '<div style="padding:13px;border:1px solid #e1e5ec;border-radius:12px"><div style="font-size:12px;opacity:.75">' + esc(label) + '</div><strong style="display:block;margin-top:6px;font-size:20px">' + esc(value == null ? "—" : value) + '</strong></div>'
    ).join("");
    const top = selected && Array.isArray(selected.top_products) ? selected.top_products : [];
    document.getElementById("smxServerTop").innerHTML = '<h4 style="margin-bottom:8px">Top products — ' + esc(currency) + '</h4>' +
      (top.length ? '<ul>' + top.map(p => '<li>' + esc(p.title) + ' — ' + esc(p.units) + ' units, ' + esc(money((Number(p.sales_minor) || 0) / 100, p.currency || currency)) + '</li>').join("") + '</ul>' :
      '<p>No order value recorded in ' + esc(currency) + ' for this period. No exchange-rate conversion is applied.</p>');
    document.getElementById("smxServerNote").textContent =
      "Profit: unavailable. " + (latest.profit_note || "Costs, fees, and paid-order verification are not yet available.") +
      " Currency totals are displayed separately; switching currency never converts or combines amounts.";
  }
  function trackProductView(productId) {
    if (!base || !productId || String(productId).startsWith("default-")) return;
    api("/api/marketplace/seller/events/product-view", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({ product_id: String(productId), visitor_key: visitorKey })
    }).catch(() => {});
  }
  function hookViews() {
    if (typeof window.openProductModal !== "function" || window.openProductModal.__smxServerViewHook) return;
    const original = window.openProductModal;
    const wrapped = function (productId) {
      trackProductView(productId);
      return original.apply(this, arguments);
    };
    wrapped.__smxServerViewHook = true;
    window.openProductModal = wrapped;
  }
  function init() {
    shell();
    hookViews();
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", hookViews, { once: true });
    else setTimeout(hookViews, 0);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();