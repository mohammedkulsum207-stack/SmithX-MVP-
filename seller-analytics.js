/* SMITHX Seller Analytics — local demo analytics only.
 * This reads the existing browser-stored storefront data. It is not production analytics.
 */
(function () {
  "use strict";
  var COSTS_KEY = "smithx_product_costs_v1";
  var VIEWS_KEY = "smithx_product_views_v1";
  var DAY = 86400000;
  function el(id) { return document.getElementById(id); }
  function read(key, fallback) {
    try { var value = JSON.parse(localStorage.getItem(key)); return value == null ? fallback : value; }
    catch (_) { return fallback; }
  }
  function write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) {}
  }
  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function money(value, currency) {
    try { return new Intl.NumberFormat(undefined, { style: "currency", currency: currency || "KES", maximumFractionDigits: 2 }).format(Number(value) || 0); }
    catch (_) { return (currency || "KES") + " " + (Number(value) || 0).toFixed(2); }
  }
  function getProducts() { return typeof window.getAllProducts === "function" ? window.getAllProducts() : []; }
  function getOrders() { return typeof window.getOrders === "function" ? window.getOrders() : []; }
  function getCosts() { return read(COSTS_KEY, {}); }
  function orderDate(order) {
    var date = new Date(order.createdAt || order.created_at || 0);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  function isInPeriod(date, period) {
    if (!date) return false;
    if (period === "all") return true;
    if (period === "today") return date.toDateString() === new Date().toDateString();
    return date.getTime() >= Date.now() - (period === "7d" ? 7 : 30) * DAY;
  }
  function getData(period) {
    var allProducts = getProducts(), allOrders = getOrders(), costs = getCosts();
    var selected = allOrders.filter(function (order) { return isInPeriod(orderDate(order), period); });
    var revenue = 0, units = 0, cost = 0, coveredUnits = 0, totalUnits = 0;
    var currencyTotals = {}, top = {};
    selected.forEach(function (order) {
      var status = String(order.status || "pending").toLowerCase();
      if (["cancelled", "canceled", "refunded"].includes(status)) return;
      (Array.isArray(order.items) ? order.items : []).forEach(function (item) {
        var quantity = Math.max(0, Number(item.quantity) || 0);
        var price = Number(item.price != null ? item.price : item.unit_price) || 0;
        if (!quantity) return;
        revenue += price * quantity;
        units += quantity;
        totalUnits += quantity;
        var currency = order.currency || item.currency || "KES";
        currencyTotals[currency] = (currencyTotals[currency] || 0) + price * quantity;
        var id = String(item.productId || item.product_id || "");
        var unitCost = Object.prototype.hasOwnProperty.call(item, "unitCost") ? (item.unitCost == null ? null : Number(item.unitCost)) : (costs[id] == null ? null : Number(costs[id]));
        if (unitCost != null && Number.isFinite(unitCost) && unitCost >= 0) {
          cost += unitCost * quantity;
          coveredUnits += quantity;
        }
        var key = id || item.name || item.title || "product";
        if (!top[key]) top[key] = { name: item.name || item.title || "Product", units: 0, sales: 0 };
        top[key].units += quantity;
        top[key].sales += price * quantity;
      });
    });
    var currency = Object.keys(currencyTotals).sort(function (a, b) { return currencyTotals[b] - currencyTotals[a]; })[0] || "KES";
    var visitors = read("smithx_daily_visitor_v2", null);
    visitors = visitors && visitors.date === new Date().toISOString().slice(0, 10) ? Number(visitors.count) || 0 : 0;
    var views = read(VIEWS_KEY, []).filter(function (event) { return isInPeriod(new Date(event.at), period); }).length;
    return {
      products: allProducts.length, orders: selected.length, units: units, revenue: revenue, cost: cost,
      profit: revenue - cost, margin: revenue ? (revenue - cost) / revenue * 100 : 0,
      coveredUnits: coveredUnits, missingUnits: Math.max(0, totalUnits - coveredUnits),
      currency: currency, visitors: visitors, views: views,
      top: Object.keys(top).map(function (key) { return top[key]; }).sort(function (a, b) { return b.sales - a.sales; }).slice(0, 5)
    };
  }
  function styles() {
    if (el("smxAnalyticsStyles")) return;
    var css = [
      ".smx-analytics{margin:24px 0 32px;padding:clamp(18px,3vw,28px);border:1px solid var(--border,#e8e0d2);border-radius:22px;background:var(--white,#fff);box-shadow:var(--shadow-sm,0 4px 14px rgba(0,0,0,.05))}",
      ".smx-analytics-head{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;flex-wrap:wrap;margin-bottom:20px}",
      ".smx-analytics-head h3{font-size:1.55rem;margin:4px 0 6px}.smx-analytics-sub{color:var(--muted,#6f675a);font-size:.9rem;line-height:1.5}",
      ".smx-analytics-controls{display:flex;gap:10px;flex-wrap:wrap}.smx-analytics-controls select,.smx-cost-input,.smx-analytics-export{min-height:42px;padding:8px 12px;border:1px solid var(--border,#e8e0d2);border-radius:10px;background:#fff;color:inherit;font:inherit}",
      ".smx-analytics-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.smx-analytics-stat{padding:17px;border:1px solid var(--border,#e8e0d2);border-radius:15px;background:var(--background,#f6f1e8);min-width:0}",
      ".smx-analytics-stat span{display:block;color:var(--muted,#6f675a);font-size:.82rem;margin-bottom:9px}.smx-analytics-stat strong{display:block;font-size:clamp(1.2rem,2.7vw,1.75rem);letter-spacing:-.03em;overflow-wrap:anywhere}.smx-analytics-stat small{display:block;margin-top:7px;color:var(--muted,#6f675a);font-size:.78rem}",
      ".smx-analytics-detail{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,1fr);gap:16px;margin-top:18px}.smx-analytics-panel{padding:18px;border:1px solid var(--border,#e8e0d2);border-radius:15px;min-width:0}.smx-analytics-panel h4{font-size:1rem;margin-bottom:14px}",
      ".smx-analytics-bars{display:grid;gap:12px}.smx-analytics-bar-row{display:grid;grid-template-columns:minmax(70px,1fr) 2fr auto;align-items:center;gap:10px;font-size:.82rem}.smx-analytics-bar-track{height:9px;background:var(--blue-light,#f3ebdc);border-radius:99px;overflow:hidden}.smx-analytics-bar-fill{height:100%;background:var(--blue,#16130f);border-radius:99px}.smx-analytics-bar-row b{font-variant-numeric:tabular-nums}",
      ".smx-analytics-table{width:100%;border-collapse:collapse;font-size:.86rem}.smx-analytics-table th,.smx-analytics-table td{text-align:left;padding:10px 6px;border-bottom:1px solid var(--border,#e8e0d2)}.smx-analytics-table th{color:var(--muted,#6f675a);font-weight:600;font-size:.78rem}.smx-analytics-table td:last-child{text-align:right}",
      ".smx-cost-row{display:grid;grid-template-columns:minmax(0,1fr) minmax(120px,180px);gap:12px;align-items:center;padding:10px 0;border-bottom:1px solid var(--border,#e8e0d2)}.smx-cost-row strong{display:block;font-size:.9rem}.smx-cost-row small{display:block;color:var(--muted,#6f675a);margin-top:3px}.smx-analytics-costs{margin-top:18px}.smx-analytics-costs summary{cursor:pointer;font-weight:700;padding:4px 0 12px}",
      ".smx-analytics-note{margin-top:14px;padding:12px 14px;background:#fff7e6;border-radius:12px;color:#6f4b12;font-size:.83rem;line-height:1.5}.smx-analytics-empty{color:var(--muted,#6f675a);font-size:.88rem}",
      "@media(max-width:760px){.smx-analytics-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.smx-analytics-detail{grid-template-columns:1fr}}@media(max-width:440px){.smx-analytics-grid{gap:8px}.smx-analytics-stat{padding:12px}.smx-cost-row{grid-template-columns:1fr}.smx-analytics-bar-row{grid-template-columns:75px 1fr auto}}"
    ].join("");
    var style = document.createElement("style"); style.id = "smxAnalyticsStyles"; style.textContent = css; document.head.appendChild(style);
  }
  function renderCosts() {
    var host = el("smxCostRows");
    if (!host) return;
    var map = getCosts(), allProducts = getProducts();
    if (!allProducts.length) { host.innerHTML = '<p class="smx-analytics-empty">Publish products to manage unit costs.</p>'; return; }
    host.innerHTML = allProducts.map(function (product) {
      var id = String(product.id), value = map[id] == null ? "" : String(map[id]);
      return '<label class="smx-cost-row"><span><strong>' + esc(product.name) + '</strong><small>Purchase/production cost per unit</small></span><input class="smx-cost-input" type="number" min="0" step="0.01" inputmode="decimal" data-product-cost="' + esc(id) + '" value="' + esc(value) + '" placeholder="Enter unit cost"></label>';
    }).join("");
    host.querySelectorAll("[data-product-cost]").forEach(function (input) {
      input.addEventListener("change", function () {
        var costs = getCosts(), id = input.getAttribute("data-product-cost"), raw = input.value.trim();
        if (raw === "") delete costs[id];
        else {
          var value = Number(raw);
          if (!Number.isFinite(value) || value < 0) { input.setCustomValidity("Enter a non-negative cost."); input.reportValidity(); return; }
          input.setCustomValidity(""); costs[id] = value;
        }
        write(COSTS_KEY, costs); render();
      });
    });
  }
  function exportCSV() {
    var data = getData(el("smxAnalyticsPeriod") ? el("smxAnalyticsPeriod").value : "30d");
    var rows = [
      ["Metric", "Value", "Currency"], ["Products listed", data.products, ""], ["Orders", data.orders, ""],
      ["Units in orders", data.units, ""], ["Store visits today (browser-local)", data.visitors, ""],
      ["Product views (browser-local)", data.views, ""], ["Gross order value", data.revenue.toFixed(2), data.currency],
      ["Recorded product costs", data.cost.toFixed(2), data.currency],
      ["Estimated profit before fees and shipping", data.coveredUnits ? data.profit.toFixed(2) : "incomplete", data.currency],
      ["Estimated margin before fees and shipping", data.coveredUnits ? data.margin.toFixed(2) + "%" : "incomplete", ""]
    ];
    var csv = rows.map(function (row) { return row.map(function (cell) { return '"' + String(cell == null ? "" : cell).replace(/"/g, '""') + '"'; }).join(","); }).join("\r\n");
    var url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    var link = document.createElement("a"); link.href = url; link.download = "smithx-analytics-" + new Date().toISOString().slice(0, 10) + ".csv";
    document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url);
  }
  function render() {
    var host = el("smxSellerAnalytics");
    if (!host) return;
    var period = el("smxAnalyticsPeriod") ? el("smxAnalyticsPeriod").value : "30d";
    var data = getData(period), maxSales = Math.max(1, data.top.length ? data.top[0].sales : 0);
    var profit = data.coveredUnits ? money(data.profit, data.currency) : "Add costs";
    var html = '<div class="smx-analytics-head"><div><p class="section-eyebrow">SELLER INTELLIGENCE</p><h3>Analytics &amp; estimated profit</h3><p class="smx-analytics-sub">Products, orders, customer activity and costs you record.</p></div><div class="smx-analytics-controls"><select id="smxAnalyticsPeriod" aria-label="Analytics date range"><option value="today">Today</option><option value="7d">Last 7 days</option><option value="30d">Last 30 days</option><option value="all">All time</option></select><button type="button" id="smxAnalyticsExport" class="smx-analytics-export">Export CSV</button></div></div>';
    html += '<div class="smx-analytics-grid">';
    html += '<div class="smx-analytics-stat"><span>Products listed</span><strong>' + data.products + '</strong><small>Current catalogue</small></div>';
    html += '<div class="smx-analytics-stat"><span>Store visits today*</span><strong>' + data.visitors.toLocaleString() + '</strong><small>Browser-local demo counter</small></div>';
    html += '<div class="smx-analytics-stat"><span>Units in orders</span><strong>' + data.units.toLocaleString() + '</strong><small>' + data.orders + ' orders in selected period</small></div>';
    html += '<div class="smx-analytics-stat"><span>Gross order value</span><strong>' + money(data.revenue, data.currency) + '</strong><small>Excludes cancelled/refunded orders</small></div>';
    html += '<div class="smx-analytics-stat"><span>Estimated profit</span><strong>' + profit + '</strong><small>Revenue minus recorded product costs</small></div>';
    html += '<div class="smx-analytics-stat"><span>Estimated margin</span><strong>' + (data.coveredUnits ? data.margin.toFixed(1) + "%" : "—") + '</strong><small>Fees and shipping not included</small></div></div>';
    html += '<div class="smx-analytics-detail"><section class="smx-analytics-panel"><h4>Best-selling products by sales</h4><div class="smx-analytics-bars">';
    if (!data.top.length) html += '<p class="smx-analytics-empty">Product sales appear after demo orders are created.</p>';
    else data.top.forEach(function (item) { html += '<div class="smx-analytics-bar-row"><span title="' + esc(item.name) + '">' + esc(item.name.length > 15 ? item.name.slice(0, 14) + "…" : item.name) + '</span><div class="smx-analytics-bar-track"><div class="smx-analytics-bar-fill" style="width:' + Math.max(2, item.sales / maxSales * 100) + '%"></div></div><b>' + money(item.sales, data.currency) + '</b></div>'; });
    html += '</div></section><section class="smx-analytics-panel"><h4>Store activity</h4><table class="smx-analytics-table"><tbody><tr><th>Product views*</th><td>' + data.views + '</td></tr><tr><th>Orders in period</th><td>' + data.orders + '</td></tr><tr><th>Units in orders</th><td>' + data.units + '</td></tr><tr><th>Recorded product costs</th><td>' + money(data.cost, data.currency) + '</td></tr><tr><th>Profit margin*</th><td>' + (data.coveredUnits ? data.margin.toFixed(1) + "%" : "Add cost data") + '</td></tr></tbody></table></section></div>';
    html += '<details class="smx-analytics-costs"><summary>Set product costs for profit estimates</summary><p class="smx-analytics-sub">Enter purchase or production cost per unit. Historical demo orders without a cost snapshot use the current cost where available.</p><div id="smxCostRows"></div></details>';
    html += '<div class="smx-analytics-note">Demo limitations: visitors and product views are stored only in this browser, not across all customers. ' + (data.missingUnits ? data.missingUnits + ' ordered unit(s) have no recorded cost; profit is incomplete.' : 'Recorded product costs are available for the units shown.') + ' Platform/payment fees, shipping, taxes, refunds, and real paid-order verification are not included.</div>';
    host.innerHTML = html;
    el("smxAnalyticsPeriod").value = period;
    el("smxAnalyticsPeriod").addEventListener("change", render);
    el("smxAnalyticsExport").addEventListener("click", exportCSV);
    renderCosts();
  }
  function mount() {
    var dashboard = el("dashboard"), grid = dashboard && dashboard.querySelector(".dashboard-grid");
    if (!dashboard || !grid || el("smxSellerAnalytics")) return;
    styles();
    var host = document.createElement("section"); host.id = "smxSellerAnalytics"; host.className = "smx-analytics";
    host.setAttribute("aria-label", "Seller analytics"); grid.insertAdjacentElement("afterend", host);
    if (typeof window.openProductModal === "function") {
      var originalOpen = window.openProductModal;
      window.openProductModal = function (productId) {
        var product = getProducts().find(function (item) { return String(item.id) === String(productId); });
        if (product) {
          var views = read(VIEWS_KEY, []);
          views.push({ productId: String(product.id), name: String(product.name || ""), at: new Date().toISOString() });
          write(VIEWS_KEY, views.slice(-1000));
        }
        var result = originalOpen.apply(this, arguments);
        render();
        return result;
      };
    }
    if (typeof window.createOrderFromCart === "function") {
      var originalCreateOrder = window.createOrderFromCart;
      window.createOrderFromCart = function () {
        var order = originalCreateOrder.apply(this, arguments);
        if (order && Array.isArray(order.items)) {
          var map = getCosts();
          order.items = order.items.map(function (item) {
            var id = String(item.productId || "");
            return Object.assign({}, item, { unitCost: map[id] == null ? null : Number(map[id]) });
          });
          var saved = getOrders(), index = saved.findIndex(function (item) { return item.orderId === order.orderId; });
          if (index >= 0) { saved[index] = order; if (typeof window.saveOrders === "function") window.saveOrders(saved); }
        }
        return order;
      };
    }
    if (typeof window.updateDashboard === "function") {
      var originalUpdateDashboard = window.updateDashboard;
      window.updateDashboard = function () {
        var result = originalUpdateDashboard.apply(this, arguments);
        render();
        return result;
      };
    }
    render();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();
})();