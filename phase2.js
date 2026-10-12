"use strict";

/* =====================================================
   SM1THX — PHASE 2 CHECKOUT ADD-ON (phase2.js)
   Loaded after app.js on index.html. Replaces the
   one-click Demo Checkout with a full checkout:
     • Delivery address (saved if the checkout is interrupted)
     • Delivery options with prices and estimated dates
     • Payment method (demo M-Pesa / card — nothing is charged)
     • Full breakdown: products + delivery + fees + taxes = total
     • Availability check before paying
     • Payment success, pending and failed screens
     • Protection against placing the same order twice
   Settings: checkout-config.js
   To remove: delete phase2.js, phase2.css and their tags.
===================================================== */

(function () {
  if (typeof demoCheckout !== "function" || !window.SMX_CHECKOUT) return;

  const CFG = window.SMX_CHECKOUT;
  const DRAFT_KEY = "smithx_checkout_draft_v1";
  const ATTEMPTS_KEY = "smithx_payment_attempts_v1";

  const originalDemoCheckout = demoCheckout;
  const originalCreateOrder = createOrderFromCart;
  const originalConfirmation = showOrderConfirmation;

  let pendingExtras = null;   // merged into the order once payment succeeds
  let busy = false;           // blocks double submission
  let draft = loadDraft();

  /* ---------------- Helpers ---------------- */

  const $ = id => document.getElementById(id);
  const money = value => (typeof formatKES === "function" ? formatKES(value) : "KES " + Math.round(value).toLocaleString());
  const esc = value => (typeof escapeHTML === "function" ? escapeHTML(String(value ?? "")) : String(value ?? ""));

  function loadDraft() {
    try {
      return JSON.parse(localStorage.getItem(DRAFT_KEY)) || {};
    } catch (error) {
      return {};
    }
  }

  function saveDraft() {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch (error) { /* storage full — ignore */ }
  }

  function currentUser() {
    if (typeof smxCurrentUser === "function") return smxCurrentUser();
    if (typeof smxWalletUser === "function") return smxWalletUser();
    return null;
  }

  function addBusinessDays(date, days) {
    const result = new Date(date);
    let added = 0;
    while (added < days) {
      result.setDate(result.getDate() + 1);
      if (result.getDay() !== 0) added += 1; // skip Sundays
    }
    return result;
  }

  function formatDay(date) {
    return date.toLocaleDateString("en-KE", { weekday: "short", day: "numeric", month: "short" });
  }

  function etaRange(option) {
    const now = new Date();
    const from = addBusinessDays(now, option.minDays);
    const to = addBusinessDays(now, option.maxDays);
    return option.minDays === option.maxDays ? formatDay(from) : formatDay(from) + " – " + formatDay(to);
  }

  /* ---------------- Cart lines + availability ---------------- */

  function cartLines() {
    const lines = [];
    const problems = [];
    getCart().forEach(item => {
      const product = findProduct(item.productId);
      const quantity = Math.max(1, Number(item.quantity) || 1);
      if (!product) {
        problems.push("An item in your cart is no longer available. Remove it to continue.");
        return;
      }
      const stock = Number.isFinite(Number(product.stock)) && product.stock !== "" && product.stock !== null ? Number(product.stock) : null;
      if (stock !== null && stock <= 0) {
        problems.push(product.name + " is out of stock.");
      } else if (stock !== null && quantity > stock) {
        problems.push("Only " + stock + " of " + product.name + " left. Lower the quantity to continue.");
      }
      lines.push({ product, quantity, lineTotal: (Number(product.price) || 0) * quantity });
    });
    return { lines, problems };
  }

  /* ---------------- Delivery ---------------- */

  function zoneFor(county) {
    return county === "Nairobi" ? "nairobi" : "other";
  }

  function deliveryOptions() {
    const zone = CFG.delivery[zoneFor(draft.county || "Nairobi")];
    const list = Object.entries(zone.options).map(([key, option]) => ({ key, ...option, zoneLabel: zone.label }));
    list.push({ key: "pickup", label: CFG.delivery.pickup.label, price: CFG.delivery.pickup.price, eta: CFG.delivery.pickup.eta, minDays: CFG.delivery.pickup.minDays, maxDays: CFG.delivery.pickup.maxDays });
    return list;
  }

  function selectedDelivery() {
    const options = deliveryOptions();
    return options.find(option => option.key === draft.deliveryMethod) || options[0];
  }

  /* ---------------- Totals ---------------- */

  function totals() {
    const { lines } = cartLines();
    const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
    const delivery = lines.length ? Number(selectedDelivery().price) || 0 : 0;
    const transactionFee = Math.round(((subtotal + delivery) * (Number(CFG.fees.transactionPercent) || 0)) / 100 + (Number(CFG.fees.transactionFixed) || 0));
    const taxRate = Number(CFG.tax.rate) || 0;
    const taxAdded = CFG.tax.included ? 0 : Math.round(subtotal * taxRate);
    const total = subtotal + delivery + transactionFee + taxAdded;
    const wallet = walletInfo();
    const walletUsed = wallet.available && draft.useWallet ? Math.min(wallet.balance, total) : 0;
    const toPay = total - walletUsed;
    return { subtotal, delivery, transactionFee, taxAdded, taxRate, taxIncluded: Boolean(CFG.tax.included), total, walletUsed, toPay, currency: CFG.currency };
  }

  /* ---------------- SMX Credit (Phase 3) ---------------- */

  function walletInfo() {
    if (typeof smxWalletBalance !== "function") return { enabled: false, available: false, balance: 0 };
    const user = currentUser();
    if (!user) return { enabled: true, signedIn: false, available: false, balance: 0 };
    const audit = smxWalletAudit(user.email);
    const balance = audit.ok ? audit.balance : 0;
    return { enabled: true, signedIn: true, ok: audit.ok, available: audit.ok && balance > 0, balance, email: user.email };
  }

  function walletSectionHTML(t) {
    const w = walletInfo();
    if (!w.enabled) return "";
    if (!w.signedIn) {
      return `<div class="smx-co-wallet is-muted"><strong>SMX Credit</strong><small><a href="login.html?next=index.html">Sign in</a> to pay with your SMX wallet.</small></div>`;
    }
    if (!w.ok) {
      return `<div class="smx-co-wallet is-muted"><strong>SMX Credit paused</strong><small>Your wallet records need checking. <a href="wallet.html">Open wallet</a></small></div>`;
    }
    if (!w.available) {
      return `<div class="smx-co-wallet is-muted"><strong>SMX Credit · SMX 0</strong><small><a href="wallet.html">Top up your wallet</a> to pay with one tap next time.</small></div>`;
    }
    return `
      <label class="smx-co-wallet ${draft.useWallet ? "is-selected" : ""}">
        <input type="checkbox" id="coUseWallet" ${draft.useWallet ? "checked" : ""}>
        <span><strong>Use SMX Credit</strong><small>Balance ${smxWalletFormat(w.balance)}${draft.useWallet ? " · using " + smxWalletFormat(t.walletUsed) + (t.toPay ? ", pay " + money(t.toPay) + " below" : " — covers the whole order") : ""}</small></span>
      </label>`;
  }

  /* ---------------- Overlay ---------------- */

  function ensureOverlay() {
    let overlay = $("smxCheckout");
    if (overlay) return overlay;

    overlay = document.createElement("div");
    overlay.id = "smxCheckout";
    overlay.className = "smx-checkout";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-labelledby", "smxCheckoutTitle");
    overlay.hidden = true;
    overlay.innerHTML = `
      <div class="smx-co-shell">
        <header class="smx-co-head">
          <div>
            <p class="section-eyebrow">SM1THX checkout</p>
            <h2 id="smxCheckoutTitle">Checkout</h2>
          </div>
          <button type="button" class="smx-co-close" id="smxCoClose" aria-label="Close checkout">×</button>
        </header>
        <div class="smx-co-body" id="smxCoBody"></div>
      </div>`;
    document.body.appendChild(overlay);

    $("smxCoClose").addEventListener("click", closeCheckout);
    overlay.addEventListener("click", event => {
      if (event.target === overlay) closeCheckout();
    });
    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && !overlay.hidden && !busy) closeCheckout();
    });
    return overlay;
  }

  function openCheckout() {
    if (!getCart().length) {
      showToast("Your cart is empty.");
      return;
    }

    const user = currentUser();
    if (user) {
      draft.name = draft.name || user.name || "";
      draft.phone = draft.phone || user.phone || "";
      draft.town = draft.town || user.location || "";
      draft.country = draft.country || user.country || "Kenya";
    }
    draft.country = draft.country || "Kenya";
    draft.county = draft.county || "Nairobi";
    draft.deliveryMethod = draft.deliveryMethod || "standard";
    draft.paymentMethod = draft.paymentMethod || "mpesa";
    draft.attemptId = draft.attemptId || "ATT-" + Date.now().toString(36).toUpperCase();
    if (draft.useWallet === undefined) draft.useWallet = walletInfo().available;
    saveDraft();

    if (typeof closeCart === "function") closeCart();
    const overlay = ensureOverlay();
    overlay.hidden = false;
    document.body.classList.add("smx-co-open");
    renderForm();
    setTimeout(() => {
      const first = overlay.querySelector("input:not([type=radio]), select");
      if (first) first.focus();
    }, 50);
  }

  function closeCheckout() {
    if (busy) return;
    const overlay = $("smxCheckout");
    if (overlay) overlay.hidden = true;
    document.body.classList.remove("smx-co-open");
  }

  /* ---------------- Form ---------------- */

  function renderForm(message) {
    const body = $("smxCoBody");
    const { lines, problems } = cartLines();
    const t = totals();
    const deliveryOpts = deliveryOptions();
    const chosen = selectedDelivery();
    const isPickup = chosen.key === "pickup";
    const country = draft.country || "Kenya";
    const canDeliverHere = CFG.deliveryCountries.includes(country);

    body.innerHTML = `
      <form class="smx-co-grid" id="smxCoForm" novalidate>
        <div class="smx-co-main">

          ${draft.resumed ? `<p class="smx-co-note">We saved your details from last time.</p>` : ""}
          ${message ? `<div class="smx-co-alert" role="alert">${esc(message)}</div>` : ""}
          ${problems.length ? `<div class="smx-co-alert" role="alert"><strong>Fix your cart first:</strong><ul>${problems.map(p => `<li>${esc(p)}</li>`).join("")}</ul></div>` : ""}

          <fieldset class="smx-co-section">
            <legend><span>1</span> Delivery details</legend>
            <div class="smx-co-row">
              <label class="smx-co-field">Full name
                <input id="coName" type="text" autocomplete="name" value="${esc(draft.name)}" required>
              </label>
              <label class="smx-co-field">Phone number
                <input id="coPhone" type="tel" autocomplete="tel" inputmode="tel" placeholder="07XX XXX XXX" value="${esc(draft.phone)}" required>
              </label>
            </div>
            <div class="smx-co-row">
              <label class="smx-co-field">Country
                <select id="coCountry">
                  ${["Kenya", "Uganda", "Tanzania", "Rwanda", "Other"].map(c => `<option ${c === country ? "selected" : ""}>${c}</option>`).join("")}
                </select>
              </label>
              <label class="smx-co-field">County
                <select id="coCounty" ${canDeliverHere ? "" : "disabled"}>
                  ${window.SMX_KENYA_COUNTIES.map(c => `<option ${c === draft.county ? "selected" : ""}>${esc(c)}</option>`).join("")}
                </select>
              </label>
            </div>
            ${canDeliverHere ? "" : `<div class="smx-co-alert" role="alert">Delivery outside Kenya isn't available yet. International shipping is planned for a later phase.</div>`}
            ${isPickup ? "" : `
            <div class="smx-co-row">
              <label class="smx-co-field">Town / area
                <input id="coTown" type="text" autocomplete="address-level2" placeholder="e.g. Westlands" value="${esc(draft.town)}" required>
              </label>
              <label class="smx-co-field">Street, building, house no.
                <input id="coAddress" type="text" autocomplete="street-address" placeholder="e.g. Waiyaki Way, ABC Place, 3rd floor" value="${esc(draft.address)}" required>
              </label>
            </div>
            <label class="smx-co-field">Delivery notes <small>optional</small>
              <input id="coNotes" type="text" maxlength="140" placeholder="Landmark, gate code, best time to call" value="${esc(draft.notes)}">
            </label>`}
          </fieldset>

          <fieldset class="smx-co-section">
            <legend><span>2</span> Delivery method</legend>
            <div class="smx-co-options">
              ${deliveryOpts.map(option => `
                <label class="smx-co-option ${option.key === chosen.key ? "is-selected" : ""}">
                  <input type="radio" name="coDelivery" value="${option.key}" ${option.key === chosen.key ? "checked" : ""}>
                  <span class="smx-co-option-text">
                    <strong>${esc(option.label)}${option.zoneLabel && option.key !== "pickup" ? ` · ${esc(option.zoneLabel)}` : ""}</strong>
                    <small>${esc(option.eta)} · arrives ${esc(etaRange(option))}</small>
                  </span>
                  <b>${option.price ? money(option.price) : "Free"}</b>
                </label>`).join("")}
            </div>
            ${isPickup ? `
              <label class="smx-co-field">Pickup point
                <select id="coPickup">
                  ${CFG.delivery.pickup.points.map(point => `<option ${point === draft.pickupPoint ? "selected" : ""}>${esc(point)}</option>`).join("")}
                </select>
              </label>` : ""}
            ${CFG.demo ? `<p class="smx-co-hint">Delivery prices are demo rates until a courier partner is chosen.</p>` : ""}
          </fieldset>

          <fieldset class="smx-co-section">
            <legend><span>3</span> Payment</legend>
            ${walletSectionHTML(t)}
            ${t.walletUsed && !t.toPay ? `<p class="smx-co-hint">No M-Pesa or card payment needed — SMX Credit covers this order.</p>` : `
            <div class="smx-co-options smx-co-options-2">
              ${Object.entries(CFG.payment.methods).map(([key, method]) => `
                <label class="smx-co-option ${key === draft.paymentMethod ? "is-selected" : ""}">
                  <input type="radio" name="coPayment" value="${key}" ${key === draft.paymentMethod ? "checked" : ""}>
                  <span class="smx-co-option-text"><strong>${esc(method.label)}</strong></span>
                </label>`).join("")}
            </div>
            ${draft.paymentMethod === "mpesa" ? `
              <label class="smx-co-field">M-Pesa phone number
                <input id="coMpesa" type="tel" inputmode="tel" placeholder="07XX XXX XXX" value="${esc(draft.mpesaPhone || draft.phone)}" required>
              </label>` : ""}
            <p class="smx-co-hint">${esc((CFG.payment.methods[draft.paymentMethod] || {}).note || "")}</p>`}
            ${CFG.demo && t.toPay ? `
              <label class="smx-co-field smx-co-demo">Demo payment result
                <select id="coOutcome">
                  <option value="success" ${draft.outcome === "success" ? "selected" : ""}>Payment succeeds</option>
                  <option value="pending" ${draft.outcome === "pending" ? "selected" : ""}>Payment is slow (pending)</option>
                  <option value="failed" ${draft.outcome === "failed" ? "selected" : ""}>Payment fails</option>
                </select>
                <small>For testing only. Removed when real payments go live.</small>
              </label>` : ""}
          </fieldset>
        </div>

        <aside class="smx-co-summary" aria-label="Order summary">
          <h3>Order summary</h3>
          <ul class="smx-co-lines">
            ${lines.map(line => `
              <li>
                <img src="${esc(line.product.image)}" alt="" loading="lazy">
                <span><strong>${esc(line.product.name)}</strong><small>Qty ${line.quantity} × ${money(line.product.price)}</small></span>
                <b>${money(line.lineTotal)}</b>
              </li>`).join("")}
          </ul>
          <dl class="smx-co-totals">
            <div><dt>Products</dt><dd>${money(t.subtotal)}</dd></div>
            <div><dt>Delivery</dt><dd>${t.delivery ? money(t.delivery) : "Free"}</dd></div>
            <div><dt>${esc(CFG.fees.label)}</dt><dd>${money(t.transactionFee)}</dd></div>
            <div><dt>${esc(CFG.tax.label)} (${Math.round(t.taxRate * 100)}%)</dt><dd>${t.taxIncluded ? "Included in prices" : money(t.taxAdded)}</dd></div>
            <div class="smx-co-grand"><dt>${t.walletUsed ? "Order total" : "Total to pay"}</dt><dd>${money(t.total)}</dd></div>
            ${t.walletUsed ? `
            <div class="smx-co-credit"><dt>SMX Credit</dt><dd>− ${money(t.walletUsed)}</dd></div>
            <div class="smx-co-grand"><dt>Left to pay${t.toPay ? " by " + esc((CFG.payment.methods[draft.paymentMethod] || {}).label || "") : ""}</dt><dd>${money(t.toPay)}</dd></div>` : ""}
          </dl>
          <p class="smx-co-currency">You'll be charged in <strong>${esc(t.currency)}</strong>. No other charges will be added.</p>
          <button type="submit" class="primary-button full-width" id="coPay" ${problems.length || !canDeliverHere || !lines.length ? "disabled" : ""}>
            ${t.walletUsed && !t.toPay ? "Pay with SMX Credit" + (CFG.demo ? " (demo)" : "") : "Pay " + money(t.toPay) + (CFG.demo ? " (demo)" : "")}
          </button>
          <p class="smx-co-hint">By paying you agree to the SM1THX demo terms. No real money is taken in this MVP.</p>
        </aside>
      </form>`;

    bindForm();
  }

  function readFields() {
    const val = id => ($(id) ? $(id).value.trim() : undefined);
    if ($("coName")) draft.name = val("coName");
    if ($("coPhone")) draft.phone = val("coPhone");
    if ($("coCountry")) draft.country = val("coCountry");
    if ($("coCounty")) draft.county = val("coCounty");
    if ($("coTown")) draft.town = val("coTown");
    if ($("coAddress")) draft.address = val("coAddress");
    if ($("coNotes")) draft.notes = val("coNotes");
    if ($("coPickup")) draft.pickupPoint = val("coPickup");
    if ($("coMpesa")) draft.mpesaPhone = val("coMpesa");
    if ($("coOutcome")) draft.outcome = val("coOutcome");
    if ($("coUseWallet")) draft.useWallet = $("coUseWallet").checked;
    const delivery = document.querySelector('input[name="coDelivery"]:checked');
    if (delivery) draft.deliveryMethod = delivery.value;
    const payment = document.querySelector('input[name="coPayment"]:checked');
    if (payment) draft.paymentMethod = payment.value;
    draft.resumed = false;
    saveDraft();
  }

  function rerenderKeepingFocus() {
    const activeId = document.activeElement && document.activeElement.id;
    const activeName = document.activeElement && document.activeElement.name;
    const activeValue = document.activeElement && document.activeElement.value;
    renderForm();
    const target = activeId ? $(activeId) : activeName ? document.querySelector(`input[name="${activeName}"][value="${activeValue}"]`) : null;
    if (target) target.focus();
  }

  function bindForm() {
    const form = $("smxCoForm");

    form.addEventListener("input", event => {
      if (event.target.matches("input[type=text], input[type=tel]")) {
        readFields();
        event.target.classList.remove("is-invalid");
      }
    });

    form.addEventListener("change", event => {
      readFields();
      if (event.target.matches("select#coCountry, select#coCounty, input[name=coDelivery], input[name=coPayment], #coUseWallet")) {
        rerenderKeepingFocus();
      }
    });

    form.addEventListener("submit", event => {
      event.preventDefault();
      readFields();
      startPayment();
    });
  }

  function validPhone(value) {
    const digits = String(value || "").replace(/\D/g, "").replace(/^254/, "0");
    return /^0[17]\d{8}$/.test(digits);
  }

  function validate() {
    const errors = [];
    const mark = id => { if ($(id)) $(id).classList.add("is-invalid"); };
    const isPickup = selectedDelivery().key === "pickup";

    if (!draft.name || draft.name.length < 2) { errors.push("Enter your full name."); mark("coName"); }
    if (!validPhone(draft.phone)) { errors.push("Enter a valid Kenyan phone number, e.g. 0712 345 678."); mark("coPhone"); }
    if (!CFG.deliveryCountries.includes(draft.country)) errors.push("Delivery outside Kenya isn't available yet.");
    if (!isPickup) {
      if (!draft.town) { errors.push("Enter your town or area."); mark("coTown"); }
      if (!draft.address || draft.address.length < 4) { errors.push("Enter your street or building."); mark("coAddress"); }
    }
    const tv = totals();
    if (tv.walletUsed) {
      const w = walletInfo();
      if (!w.ok || w.balance < tv.walletUsed) errors.push("Your SMX Credit balance has changed. Review the payment and try again.");
    }
    if (tv.toPay && draft.paymentMethod === "mpesa" && !validPhone(draft.mpesaPhone || draft.phone)) {
      errors.push("Enter the M-Pesa phone number to charge.");
      mark("coMpesa");
    }
    return errors;
  }

  /* ---------------- Payment ---------------- */

  function recordAttempt(status, extra) {
    try {
      const attempts = JSON.parse(localStorage.getItem(ATTEMPTS_KEY)) || [];
      attempts.unshift({ attemptId: draft.attemptId, status, method: draft.paymentMethod, amount: totals().total, at: new Date().toISOString(), ...extra });
      localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(attempts.slice(0, 50)));
    } catch (error) { /* ignore */ }
  }

  function maskPhone(value) {
    const digits = String(value || "").replace(/\D/g, "").replace(/^254/, "0");
    return digits.length >= 10 ? digits.slice(0, 4) + " *** " + digits.slice(-3) : "";
  }

  function startPayment() {
    if (busy) return;

    const { problems } = cartLines();
    if (problems.length) {
      renderForm();
      return;
    }

    const errors = validate();
    if (errors.length) {
      const body = $("smxCoBody");
      const existing = body.querySelector(".smx-co-alert.is-validation");
      if (existing) existing.remove();
      const alert = document.createElement("div");
      alert.className = "smx-co-alert is-validation";
      alert.setAttribute("role", "alert");
      alert.innerHTML = "<strong>Check these details:</strong><ul>" + errors.map(e => `<li>${esc(e)}</li>`).join("") + "</ul>";
      body.querySelector(".smx-co-main").prepend(alert);
      alert.scrollIntoView({ behavior: "smooth", block: "center" });
      const firstInvalid = body.querySelector(".is-invalid");
      if (firstInvalid) setTimeout(() => firstInvalid.focus(), 300);
      return;
    }

    busy = true;
    const tStart = totals();
    const amount = tStart.toPay;
    const method = CFG.payment.methods[draft.paymentMethod];
    recordAttempt("started");

    if (!amount && tStart.walletUsed) {
      showStatus("processing", { title: "Paying with SMX Credit", text: "Using " + smxWalletFormat(tStart.walletUsed) + " from your wallet…" });
      setTimeout(completeOrder, 900);
      return;
    }

    showStatus("processing", {
      title: draft.paymentMethod === "mpesa" ? "Check your phone" : "Processing payment",
      text: draft.paymentMethod === "mpesa"
        ? "Demo: an M-Pesa prompt for " + money(amount) + " would be sent to " + maskPhone(draft.mpesaPhone || draft.phone) + ". Waiting for confirmation…"
        : "Demo: confirming your " + method.label.toLowerCase() + " payment of " + money(amount) + "…"
    });

    setTimeout(() => {
      const outcome = draft.outcome || "success";
      if (outcome === "failed") {
        busy = false;
        recordAttempt("failed", { reason: "Declined (demo)" });
        showStatus("failed", {
          title: "Payment didn't go through",
          text: "You haven't been charged and your cart is saved. Check your details or try another payment method."
        });
      } else if (outcome === "pending") {
        recordAttempt("pending");
        showStatus("pending", {
          title: "Payment pending",
          text: "We're still waiting for confirmation from the payment provider. Don't pay again — we'll check the status for you."
        });
        draft.outcome = "success"; // the next status check succeeds
        saveDraft();
      } else {
        completeOrder();
      }
    }, CFG.payment.demoDelayMs);
  }

  function showStatus(kind, { title, text }) {
    const body = $("smxCoBody");
    const icons = { processing: "", pending: "…", failed: "!", success: "✓" };
    body.innerHTML = `
      <div class="smx-co-status is-${kind}" role="status" aria-live="polite">
        <div class="smx-co-status-icon" aria-hidden="true">${kind === "processing" ? '<span class="smx-co-spinner"></span>' : icons[kind]}</div>
        <h3>${esc(title)}</h3>
        <p>${esc(text)}</p>
        <div class="smx-co-status-actions">
          ${kind === "failed" ? `
            <button type="button" class="primary-button" id="coRetry">Try again</button>
            <button type="button" class="secondary-button" id="coEdit">Change details</button>` : ""}
          ${kind === "pending" ? `
            <button type="button" class="primary-button" id="coCheck">Check payment status</button>` : ""}
        </div>
      </div>`;

    if ($("coRetry")) $("coRetry").addEventListener("click", () => {
      draft.outcome = "success";
      saveDraft();
      startPayment();
    });
    if ($("coEdit")) $("coEdit").addEventListener("click", () => renderForm());
    if ($("coCheck")) $("coCheck").addEventListener("click", () => {
      showStatus("processing", { title: "Checking payment status", text: "Confirming with the payment provider…" });
      setTimeout(completeOrder, 1200);
    });
    const focusTarget = body.querySelector("button") || body.querySelector("h3");
    if (focusTarget) { focusTarget.setAttribute("tabindex", focusTarget.tagName === "H3" ? "-1" : "0"); focusTarget.focus(); }
  }

  function completeOrder() {
    // Duplicate-order guard: one order per checkout attempt.
    const existing = getOrders().find(order => order.checkoutAttemptId === draft.attemptId);
    if (existing) {
      busy = false;
      closeCheckout();
      originalConfirmation(existing);
      return;
    }

    const t = totals();
    const delivery = selectedDelivery();
    const reference = (t.toPay ? (draft.paymentMethod === "mpesa" ? "MP" : "CD") : "SX") + Date.now().toString(36).toUpperCase().slice(-8) + "DEMO";

    // Final SMX Credit check right before the order is created.
    const walletEmail = t.walletUsed ? walletInfo().email : null;
    if (t.walletUsed) {
      const w = walletInfo();
      if (!w.ok || w.balance < t.walletUsed) {
        busy = false;
        showStatus("failed", { title: "SMX Credit balance changed", text: "Your wallet no longer covers " + smxWalletFormat(t.walletUsed) + ". Nothing was charged. Review the payment and try again." });
        return;
      }
    }
    const extLabel = (CFG.payment.methods[draft.paymentMethod] || {}).label || draft.paymentMethod;
    const payLabel = t.walletUsed ? (t.toPay ? "SMX Credit + " + extLabel : "SMX Credit") : extLabel;

    pendingExtras = {
      checkoutAttemptId: draft.attemptId,
      subtotal: t.subtotal,
      total: t.total,
      currency: t.currency,
      charges: {
        products: t.subtotal,
        delivery: t.delivery,
        transactionFee: t.transactionFee,
        taxAdded: t.taxAdded,
        taxRate: t.taxRate,
        taxIncluded: t.taxIncluded,
        total: t.total,
        walletUsed: t.walletUsed,
        paidExternally: t.toPay
      },
      delivery: {
        method: delivery.key,
        label: delivery.label,
        zone: delivery.zoneLabel || "",
        price: t.delivery,
        eta: delivery.eta,
        estimatedBy: addBusinessDays(new Date(), delivery.maxDays).toISOString(),
        pickupPoint: delivery.key === "pickup" ? (draft.pickupPoint || CFG.delivery.pickup.points[0]) : "",
        name: draft.name,
        phone: draft.phone,
        country: draft.country,
        county: draft.county,
        town: delivery.key === "pickup" ? "" : draft.town,
        address: delivery.key === "pickup" ? "" : draft.address,
        notes: delivery.key === "pickup" ? "" : (draft.notes || "")
      },
      payment: {
        method: t.toPay ? draft.paymentMethod : "smx",
        label: payLabel,
        externalLabel: t.toPay ? extLabel : "",
        walletUsed: t.walletUsed,
        walletEmail: walletEmail || "",
        externalAmount: t.toPay,
        status: "Paid",
        reference,
        phone: t.toPay && draft.paymentMethod === "mpesa" ? maskPhone(draft.mpesaPhone || draft.phone) : "",
        amount: t.total,
        currency: t.currency,
        paidAt: new Date().toISOString(),
        demo: Boolean(CFG.demo)
      },
      customer: {
        type: currentUser() ? "Registered Customer" : "Guest Customer",
        name: draft.name,
        email: currentUser() ? currentUser().email : "",
        phone: draft.phone
      }
    };

    recordAttempt("paid", { reference });

    busy = false;
    closeCheckout();
    originalDemoCheckout();   // creates the order, clears cart, starts tracking, shows confirmation
    const created = getOrders().find(order => order.checkoutAttemptId === pendingExtras.checkoutAttemptId);
    pendingExtras = null;

    if (created && t.walletUsed && walletEmail) {
      try {
        smxWalletRecord(walletEmail, { type: "spend", amount: t.walletUsed, key: "order-" + created.orderId, ref: created.orderId, note: "Order " + created.orderId });
      } catch (error) {
        showToast("SMX Credit couldn't be applied: " + error.message);
      }
    }

    // Fresh attempt id for the next checkout; keep address for next time.
    draft = { ...draft, attemptId: null, outcome: "success", resumed: false, useWallet: undefined };
    saveDraft();
  }

  /* ---------------- Hooks into app.js ---------------- */

  window.createOrderFromCart = function () {
    const order = originalCreateOrder();
    if (!order || !pendingExtras) return order;

    Object.assign(order, pendingExtras, { customer: { ...order.customer, ...pendingExtras.customer } });

    const orders = getOrders().map(item => (item.orderId === order.orderId ? order : item));
    saveOrders(orders);
    return order;
  };

  window.demoCheckout = openCheckout;

  window.showOrderConfirmation = function (order) {
    originalConfirmation(order);
    if (!order || !order.charges) return;
    const box = document.querySelector("#orderConfirmation .confirmation-total");
    if (!box || document.querySelector("#orderConfirmation .smx-conf-breakdown")) return;

    const c = order.charges;
    const breakdown = document.createElement("dl");
    breakdown.className = "smx-co-totals smx-conf-breakdown";
    breakdown.innerHTML = `
      <div><dt>Products</dt><dd>${money(c.products)}</dd></div>
      <div><dt>Delivery · ${esc(order.delivery.label)}</dt><dd>${c.delivery ? money(c.delivery) : "Free"}</dd></div>
      <div><dt>${esc(CFG.fees.label)}</dt><dd>${money(c.transactionFee)}</dd></div>
      <div><dt>${esc(CFG.tax.label)} (${Math.round(c.taxRate * 100)}%)</dt><dd>${c.taxIncluded ? "Included" : money(c.taxAdded)}</dd></div>
      ${c.walletUsed ? `<div><dt>Paid with SMX Credit</dt><dd>${money(c.walletUsed)}</dd></div>${c.paidExternally ? `<div><dt>Paid with ${esc(order.payment.externalLabel)}</dt><dd>${money(c.paidExternally)}</dd></div>` : ""}` : ""}`;
    box.insertAdjacentElement("beforebegin", breakdown);

    const meta = document.createElement("p");
    meta.className = "smx-conf-meta";
    meta.innerHTML = `
      Paid with <strong>${esc(order.payment.label)}</strong> · Ref <strong>${esc(order.payment.reference)}</strong><br>
      ${order.delivery.method === "pickup"
        ? "Pick up at " + esc(order.delivery.pickupPoint)
        : "Delivering to " + esc(order.delivery.town) + ", " + esc(order.delivery.county)}
      · Estimated by ${esc(new Date(order.delivery.estimatedBy).toLocaleDateString("en-KE", { day: "numeric", month: "short" }))}`;
    box.insertAdjacentElement("afterend", meta);
  };

  /* ---------------- Cart panel wording ---------------- */

  function updateCartPanel() {
    const button = document.querySelector('.cart-actions button[onclick="demoCheckout()"]');
    if (button) button.textContent = "Checkout";
    const totalRow = $("cartTotal") && $("cartTotal").closest(".cart-total");
    if (totalRow && !document.querySelector(".smx-cart-note")) {
      const label = totalRow.querySelector("span");
      if (label) label.textContent = "Total before delivery";
      const note = document.createElement("p");
      note.className = "smx-cart-note";
      note.textContent = "Delivery and any fees are shown at checkout before you pay.";
      totalRow.insertAdjacentElement("afterend", note);
    }
  }

  function start() {
    updateCartPanel();
    if (draft.attemptId && (draft.address || draft.name)) draft.resumed = true;
    if (location.hash === "#checkout" && getCart().length) openCheckout();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
