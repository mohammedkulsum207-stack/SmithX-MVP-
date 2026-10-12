"use strict";

/* =====================================================
   SM1THX — PHASE 2 ORDER MANAGEMENT (phase2-orders.js)
   Loaded at the end of my-orders.html. Adds:
     • Delivery address, payment reference and full
       price breakdown on each order
     • Printable receipt
     • Cancel order (before it ships) with demo refund
     • Return / refund request (within 7 days of delivery)
     • "Cancelled orders" history
   Requires checkout-config.js. To remove: delete this
   file and its <script> tag.
===================================================== */

(function () {
  if (typeof renderSelectedOrder !== "function") return;

  const ARCHIVE_KEY = "smithx_order_archive_v1";
  const ANALYTICS_KEY = "smithx_analytics_v2";
  const REFUND_WINDOW_DAYS = 7;
  const CFG = window.SMX_CHECKOUT || { fees: { label: "Transaction fee" }, tax: { label: "VAT" } };

  const money = value => "KES " + Math.round(Number(value) || 0).toLocaleString("en-KE");
  const esc = value => (typeof escapeHTML === "function" ? escapeHTML(String(value ?? "")) : String(value ?? ""));
  const day = value => new Date(value).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });

  function getArchive() {
    try {
      const list = JSON.parse(localStorage.getItem(ARCHIVE_KEY));
      return Array.isArray(list) ? list : [];
    } catch (error) {
      return [];
    }
  }

  function saveArchive(list) {
    localStorage.setItem(ARCHIVE_KEY, JSON.stringify(list));
  }

  function findActive(id) {
    return orders.find(order => String(order.orderId) === String(id)) || null;
  }

  function findAny(id) {
    return findActive(id) || getArchive().find(order => String(order.orderId) === String(id)) || null;
  }

  function canCancel(order) {
    const status = normalizeStatus(order.status);
    return status === "Pending" || status === "Confirmed";
  }

  function deliveredAt(order) {
    return (order.tracking && order.tracking.deliveredAt) || order.deliveredAt || order.updatedAt || order.createdAt;
  }

  function canRequestRefund(order) {
    if (normalizeStatus(order.status) !== "Delivered" || order.refundRequest) return false;
    const age = Date.now() - new Date(deliveredAt(order)).getTime();
    return age <= REFUND_WINDOW_DAYS * 24 * 60 * 60 * 1000;
  }

  /* ---------------- Estimated delivery from checkout ---------------- */

  if (typeof getEstimatedDelivery === "function") {
    const originalEstimate = getEstimatedDelivery;
    window.getEstimatedDelivery = function (order) {
      if (order && order.delivery && order.delivery.estimatedBy) {
        if (normalizeStatus(order.status) === "Delivered") return "Delivered";
        return "By " + new Date(order.delivery.estimatedBy).toLocaleDateString("en-KE", { weekday: "long", day: "numeric", month: "long" });
      }
      return originalEstimate(order);
    };
  }

  /* ---------------- Order details additions ---------------- */

  function breakdownHTML(order) {
    const c = order.charges;
    if (!c) return "";
    return `
      <dl class="p2-breakdown">
        <div><dt>Products</dt><dd>${money(c.products)}</dd></div>
        <div><dt>Delivery</dt><dd>${c.delivery ? money(c.delivery) : "Free"}</dd></div>
        <div><dt>${esc(CFG.fees.label)}</dt><dd>${money(c.transactionFee)}</dd></div>
        <div><dt>${esc(CFG.tax.label)} (${Math.round((c.taxRate || 0) * 100)}%)</dt><dd>${c.taxIncluded ? "Included in prices" : money(c.taxAdded)}</dd></div>
        <div class="p2-grand"><dt>Total paid</dt><dd>${money(c.total)}</dd></div>
      </dl>`;
  }

  function addressHTML(order) {
    const d = order.delivery;
    if (!d) return "<p class=\"p2-muted\">Placed with the earlier demo checkout — no delivery details recorded.</p>";
    const where = d.method === "pickup"
      ? `Pick up at <strong>${esc(d.pickupPoint)}</strong>`
      : `${esc(d.address)}<br>${esc(d.town)}, ${esc(d.county)}, ${esc(d.country)}${d.notes ? `<br><span class="p2-muted">Note: ${esc(d.notes)}</span>` : ""}`;
    return `
      <p><strong>${esc(d.name)}</strong> · ${esc(d.phone)}</p>
      <p>${where}</p>
      <p class="p2-muted">${esc(d.label)}${d.zone ? " · " + esc(d.zone) : ""} · ${esc(d.eta)}</p>`;
  }

  function paymentHTML(order) {
    const p = order.payment;
    if (!p) return "<p class=\"p2-muted\">No payment record (earlier demo checkout).</p>";
    return `
      <p><span class="p2-pill ${order.refund ? "is-cancelled" : "is-paid"}">${order.refund ? "Refunded" : esc(p.status)}</span> ${esc(p.label)}${p.phone ? " · " + esc(p.phone) : ""}</p>
      <p class="p2-muted">Ref ${esc(p.reference)} · ${esc(day(p.paidAt))}${p.demo ? " · demo, no money moved" : ""}</p>`;
  }

  function refundHTML(order) {
    if (order.refund) {
      return `<div class="p2-banner is-info"><strong>Refund ${esc(order.refund.status.toLowerCase())}:</strong> ${money(order.refund.amount)} to ${esc(order.refund.method)} · Ref ${esc(order.refund.reference)}</div>`;
    }
    if (order.refundRequest) {
      return `<div class="p2-banner is-info"><strong>Return / refund requested</strong> on ${esc(day(order.refundRequest.at))} — reason: ${esc(order.refundRequest.reason)}. Status: ${esc(order.refundRequest.status)}.</div>`;
    }
    return "";
  }

  function actionsHTML(order, archived) {
    const buttons = [`<button type="button" class="btn btn-secondary" data-p2="receipt" data-id="${esc(order.orderId)}">View receipt</button>`];
    if (!archived && canCancel(order)) {
      buttons.push(`<button type="button" class="btn btn-secondary p2-danger" data-p2="cancel" data-id="${esc(order.orderId)}">Cancel order</button>`);
    }
    if (!archived && canRequestRefund(order)) {
      buttons.push(`<button type="button" class="btn btn-secondary" data-p2="refund" data-id="${esc(order.orderId)}">Request return or refund</button>`);
    }
    let note = "";
    if (!archived && !canCancel(order) && normalizeStatus(order.status) !== "Delivered") {
      note = `<p class="p2-muted">This order has shipped, so it can't be cancelled. You can request a return within ${REFUND_WINDOW_DAYS} days of delivery.</p>`;
    }
    return `<div class="p2-actions">${buttons.join("")}</div>${note}`;
  }

  function extraPanel(order, archived) {
    return `
      <section class="p2-panel" aria-label="Payment and delivery">
        ${refundHTML(order)}
        <div class="p2-grid">
          <div class="p2-box">
            <h3>${order.delivery && order.delivery.method === "pickup" ? "Pickup" : "Delivery address"}</h3>
            ${addressHTML(order)}
          </div>
          <div class="p2-box">
            <h3>Payment</h3>
            ${paymentHTML(order)}
          </div>
        </div>
        ${breakdownHTML(order)}
        ${actionsHTML(order, archived)}
      </section>`;
  }

  const originalRenderSelected = renderSelectedOrder;

  window.renderSelectedOrder = function () {
    const container = document.getElementById("details");
    const archivedOrder = selectedOrderId ? getArchive().find(order => String(order.orderId) === String(selectedOrderId)) : null;

    if (archivedOrder && !findActive(selectedOrderId)) {
      renderArchived(container, archivedOrder);
      return;
    }

    originalRenderSelected();

    const order = selectedOrderId ? findActive(selectedOrderId) : null;
    if (!container || !order) return;
    container.insertAdjacentHTML("beforeend", extraPanel(order, false));
  };

  function renderArchived(container, order) {
    const items = Array.isArray(order.items) ? order.items : [];
    container.innerHTML = `
      <div class="details-header">
        <div>
          <h2>Order ${esc(order.orderId)}</h2>
          <p>Placed ${esc(day(order.createdAt))} · Cancelled ${esc(day(order.cancelledAt))}</p>
        </div>
        <span class="p2-pill is-cancelled">Cancelled</span>
      </div>
      <div class="section-title">Order Items</div>
      <ul class="p2-items">
        ${items.map(item => `<li><span>${esc(item.name)} × ${Number(item.quantity) || 1}</span><strong>${money((Number(item.price) || 0) * (Number(item.quantity) || 1))}</strong></li>`).join("")}
      </ul>
      ${extraPanel(order, true)}`;
  }

  /* ---------------- Cancelled orders list ---------------- */

  const originalRenderOrders = renderOrders;

  window.renderOrders = function () {
    originalRenderOrders();
    const list = document.getElementById("orderList");
    if (!list) return;

    const archive = getArchive();
    const old = document.getElementById("p2Archive");
    if (old) old.remove();
    if (!archive.length) return;

    const section = document.createElement("div");
    section.id = "p2Archive";
    section.className = "p2-archive";
    section.innerHTML = `
      <div class="p2-archive-title">Cancelled orders</div>
      ${archive.map(order => `
        <button type="button" class="p2-archive-item ${String(order.orderId) === String(selectedOrderId) ? "active" : ""}" data-p2="open-archived" data-id="${esc(order.orderId)}">
          <span><strong>${esc(order.orderId)}</strong><small>${esc(day(order.cancelledAt))} · ${money(order.total)}</small></span>
          <span class="p2-pill is-cancelled">${order.refund ? "Refunded" : "Cancelled"}</span>
        </button>`).join("")}`;
    list.insertAdjacentElement("afterend", section);
  };

  /* ---------------- Actions ---------------- */

  function cancelOrder(id, reason) {
    const order = findActive(id);
    if (!order || !canCancel(order)) {
      showMessage("This order can no longer be cancelled.");
      return;
    }

    const now = new Date().toISOString();
    const amount = Number(order.total) || 0;
    const cancelled = {
      ...order,
      status: "Cancelled",
      cancelledAt: now,
      cancelReason: reason,
      updatedAt: now,
      tracking: { ...(order.tracking || {}), completed: true, currentStage: "cancelled" },
      refund: order.payment
        ? {
            status: "Completed",
            amount,
            method: order.payment.label + (order.payment.phone ? " " + order.payment.phone : ""),
            reference: "RF" + Date.now().toString(36).toUpperCase().slice(-8) + (order.payment.demo ? "DEMO" : ""),
            at: now,
            demo: Boolean(order.payment.demo)
          }
        : null
    };

    saveArchive([cancelled, ...getArchive().filter(item => item.orderId !== cancelled.orderId)]);

    orders = orders.filter(item => String(item.orderId) !== String(id));
    saveOrders();
    try { localStorage.removeItem(demoStorageKey(id)); } catch (error) { /* ignore */ }

    try {
      const analytics = JSON.parse(localStorage.getItem(ANALYTICS_KEY));
      if (analytics && typeof analytics.revenue === "number") {
        analytics.revenue = Math.max(0, analytics.revenue - amount);
        analytics.cancelledOrders = (analytics.cancelledOrders || 0) + 1;
        localStorage.setItem(ANALYTICS_KEY, JSON.stringify(analytics));
      }
    } catch (error) { /* ignore */ }

    if (typeof stopDemoTracking === "function") {
      try { stopDemoTracking(id); } catch (error) { /* ignore */ }
    }

    selectedOrderId = cancelled.orderId;
    renderOrders();
    renderSelectedOrder();
    showMessage(cancelled.refund ? "Order cancelled. " + money(amount) + " refunded (demo)." : "Order cancelled.");
  }

  function requestRefund(id, reason, note) {
    const order = findActive(id);
    if (!order || !canRequestRefund(order)) {
      showMessage("This order isn't eligible for a return request.");
      return;
    }
    const now = new Date().toISOString();
    orders = orders.map(item => (String(item.orderId) === String(id)
      ? { ...item, refundRequest: { status: "Under review", reason, note, at: now }, updatedAt: now }
      : item));
    saveOrders();
    renderSelectedOrder();
    showMessage("Return request sent. The seller will review it.");
  }

  function showMessage(text) {
    const toast = document.getElementById("toast");
    if (typeof showToast === "function") {
      showToast(text);
    } else if (toast) {
      toast.textContent = text;
      toast.classList.add("show");
      setTimeout(() => toast.classList.remove("show"), 2600);
    }
  }

  /* ---------------- Dialogs ---------------- */

  function openDialog(html, onSubmit) {
    closeDialog();
    const dialog = document.createElement("div");
    dialog.className = "p2-dialog";
    dialog.id = "p2Dialog";
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    dialog.innerHTML = `<form class="p2-dialog-box" novalidate>${html}</form>`;
    document.body.appendChild(dialog);
    const form = dialog.querySelector("form");
    form.addEventListener("submit", event => {
      event.preventDefault();
      onSubmit && onSubmit(form);
    });
    dialog.addEventListener("click", event => {
      if (event.target === dialog || event.target.closest("[data-p2-close]")) closeDialog();
    });
    const first = dialog.querySelector("select, textarea, button");
    if (first) first.focus();
  }

  function closeDialog() {
    const dialog = document.getElementById("p2Dialog");
    if (dialog) dialog.remove();
  }

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeDialog();
  });

  function cancelDialog(order) {
    openDialog(`
      <h3>Cancel order ${esc(order.orderId)}?</h3>
      <p class="p2-muted">${order.payment ? "You'll get a full refund of " + money(order.total) + " to " + esc(order.payment.label) + "." : "This demo order has no payment to refund."}</p>
      <label class="p2-field">Reason
        <select name="reason">
          <option>Changed my mind</option>
          <option>Ordered by mistake</option>
          <option>Found a better price</option>
          <option>Delivery takes too long</option>
          <option>Other</option>
        </select>
      </label>
      <div class="p2-actions">
        <button type="submit" class="btn btn-primary p2-danger-solid">Cancel order</button>
        <button type="button" class="btn btn-secondary" data-p2-close>Keep order</button>
      </div>`, form => {
      closeDialog();
      cancelOrder(order.orderId, form.reason.value);
    });
  }

  function refundDialog(order) {
    openDialog(`
      <h3>Request a return or refund</h3>
      <p class="p2-muted">Order ${esc(order.orderId)} · ${money(order.total)}. Requests are open for ${REFUND_WINDOW_DAYS} days after delivery.</p>
      <label class="p2-field">What went wrong?
        <select name="reason">
          <option>Item arrived damaged</option>
          <option>Wrong item received</option>
          <option>Item not as described</option>
          <option>Item missing from the package</option>
          <option>No longer needed</option>
        </select>
      </label>
      <label class="p2-field">Details <small>optional</small>
        <textarea name="note" rows="3" maxlength="400" placeholder="Tell the seller what happened"></textarea>
      </label>
      <div class="p2-actions">
        <button type="submit" class="btn btn-primary">Send request</button>
        <button type="button" class="btn btn-secondary" data-p2-close>Not now</button>
      </div>`, form => {
      closeDialog();
      requestRefund(order.orderId, form.reason.value, form.note.value.trim());
    });
  }

  function receiptDialog(order) {
    const items = Array.isArray(order.items) ? order.items : [];
    openDialog(`
      <div class="p2-receipt" id="p2Receipt">
        <div class="p2-receipt-head">
          <strong>SM1THX</strong>
          <span>Receipt${order.payment && order.payment.demo ? " · DEMO" : ""}</span>
        </div>
        <p><strong>Order</strong> ${esc(order.orderId)}<br>
           <strong>Date</strong> ${esc(day(order.createdAt))}<br>
           ${order.payment ? `<strong>Payment</strong> ${esc(order.payment.label)} · Ref ${esc(order.payment.reference)}<br>` : ""}
           ${order.delivery ? `<strong>Customer</strong> ${esc(order.delivery.name)} · ${esc(order.delivery.phone)}` : ""}</p>
        <ul class="p2-items">
          ${items.map(item => `<li><span>${esc(item.name)} × ${Number(item.quantity) || 1}</span><strong>${money((Number(item.price) || 0) * (Number(item.quantity) || 1))}</strong></li>`).join("")}
        </ul>
        ${breakdownHTML(order) || `<dl class="p2-breakdown"><div class="p2-grand"><dt>Total</dt><dd>${money(order.total)}</dd></div></dl>`}
        ${order.refund ? `<p><strong>Refunded</strong> ${money(order.refund.amount)} · Ref ${esc(order.refund.reference)}</p>` : ""}
        ${order.payment && order.payment.demo ? `<p class="p2-muted">Demo receipt. No money was charged.</p>` : ""}
      </div>
      <div class="p2-actions">
        <button type="button" class="btn btn-primary" data-p2-print>Print or save as PDF</button>
        <button type="button" class="btn btn-secondary" data-p2-close>Close</button>
      </div>`);
    document.querySelector("[data-p2-print]").addEventListener("click", () => window.print());
  }

  document.addEventListener("click", event => {
    const button = event.target.closest("[data-p2]");
    if (!button) return;
    const id = button.dataset.id;
    const action = button.dataset.p2;

    if (action === "open-archived") {
      selectedOrderId = id;
      try { localStorage.setItem(SELECTED_ORDER_KEY, id); } catch (error) { /* ignore */ }
      renderOrders();
      renderSelectedOrder();
      if (window.innerWidth < 900) document.getElementById("details").scrollIntoView({ behavior: "smooth" });
      return;
    }

    const order = findAny(id);
    if (!order) return;
    if (action === "cancel") cancelDialog(order);
    if (action === "refund") refundDialog(order);
    if (action === "receipt") receiptDialog(order);
  });

  /* ---------------- Styles ---------------- */

  const style = document.createElement("style");
  style.textContent = `
    .p2-panel { display: grid; gap: 16px; margin-top: 26px; padding-top: 22px; border-top: 1px solid var(--line, #e8e0d2); }
    .p2-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .p2-box { padding: 16px 18px; border: 1px solid var(--line, #e8e0d2); border-radius: 14px; background: #fff; font-size: .92rem; display: grid; gap: 6px; }
    .p2-box h3 { font-family: var(--font-body, system-ui); font-size: .72rem; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; color: var(--gold-text, #8a5f14); }
    .p2-muted { color: var(--muted, #6f675a); font-size: .85rem; }
    .p2-breakdown { display: grid; gap: 8px; margin: 0; padding: 16px 18px; border-radius: 14px; background: var(--ivory, #f6f1e8); }
    .p2-breakdown div { display: flex; justify-content: space-between; gap: 12px; font-size: .92rem; }
    .p2-breakdown dt { color: var(--muted, #6f675a); }
    .p2-breakdown dd { margin: 0; font-variant-numeric: tabular-nums; }
    .p2-grand { padding-top: 8px; border-top: 1px solid var(--line, #e8e0d2); }
    .p2-grand dt { color: var(--ink, #16130f) !important; font-weight: 700; }
    .p2-grand dd { font-weight: 700; font-size: 1.1rem; }
    .p2-actions { display: flex; flex-wrap: wrap; gap: 10px; }
    .p2-actions .btn { width: auto; }
    .p2-danger { color: #a3343a !important; border-color: rgba(163, 52, 58, .35) !important; }
    .p2-danger-solid { background: #a3343a !important; border-color: #a3343a !important; }
    .p2-pill { display: inline-flex; align-items: center; padding: 4px 10px; border-radius: 999px; font-size: .72rem; font-weight: 700; letter-spacing: .04em; white-space: nowrap; }
    .p2-pill.is-paid { background: #e6f2e9; color: #2f7a4a; }
    .p2-pill.is-cancelled { background: #f1e6e6; color: #8f2a2f; }
    .p2-banner { padding: 12px 16px; border-radius: 12px; font-size: .9rem; }
    .p2-banner.is-info { background: var(--gold-soft, #f3e3c2); color: #5f420e; }
    .p2-items { list-style: none; padding: 0; margin: 0 0 4px; display: grid; gap: 8px; }
    .p2-items li { display: flex; justify-content: space-between; gap: 12px; font-size: .92rem; }
    .p2-archive { margin-top: 22px; padding-top: 16px; border-top: 1px solid var(--line, #e8e0d2); display: grid; gap: 8px; }
    .p2-archive-title { font-size: .72rem; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; color: var(--muted, #6f675a); }
    .p2-archive-item { display: flex; align-items: center; justify-content: space-between; gap: 10px; width: 100%; padding: 12px 14px; border: 1px solid var(--line, #e8e0d2); border-radius: 14px; background: #fff; text-align: left; cursor: pointer; font: inherit; color: inherit; }
    .p2-archive-item.active { border-color: var(--ink, #16130f); }
    .p2-archive-item span:first-child { display: grid; }
    .p2-archive-item small { color: var(--muted, #6f675a); font-size: .8rem; }
    .p2-dialog { position: fixed; inset: 0; z-index: 2000; display: grid; place-items: center; padding: 20px; background: rgba(14, 12, 9, .6); }
    .p2-dialog-box { width: min(480px, 100%); max-height: calc(100vh - 40px); overflow-y: auto; display: grid; gap: 14px; padding: 26px; border-radius: 20px; background: var(--paper, #fffdf9); box-shadow: 0 30px 70px rgba(0,0,0,.4); }
    .p2-dialog-box h3 { font-size: 1.6rem; line-height: 1.15; }
    .p2-field { display: grid; gap: 6px; font-size: .85rem; font-weight: 600; }
    .p2-field small { font-weight: 400; color: var(--muted, #6f675a); }
    .p2-field select, .p2-field textarea { width: 100%; padding: 11px 14px; border: 1px solid var(--line, #e8e0d2); border-radius: 12px; background: #fff; font: inherit; font-weight: 400; color: var(--ink, #16130f); }
    .p2-receipt { display: grid; gap: 12px; font-size: .9rem; }
    .p2-receipt-head { display: flex; justify-content: space-between; align-items: baseline; padding-bottom: 10px; border-bottom: 1px solid var(--line, #e8e0d2); }
    .p2-receipt-head strong { font-family: var(--font-display, Georgia, serif); font-size: 1.5rem; letter-spacing: .12em; }
    .p2-receipt-head span { font-size: .75rem; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: var(--muted, #6f675a); }
    @media (max-width: 640px) { .p2-grid { grid-template-columns: 1fr; } .p2-actions .btn { width: 100%; } }
    @media print {
      body > *:not(#p2Dialog) { display: none !important; }
      .p2-dialog { position: static; background: none; padding: 0; }
      .p2-dialog-box { box-shadow: none; max-height: none; width: 100%; }
      .p2-dialog-box > .p2-actions { display: none; }
    }
  `;
  document.head.appendChild(style);
})();
