"use strict";

/* =====================================================
   SM1THX — REVIEWS & RATINGS (reviews.js)
   Phase 4. Works on index.html, my-orders.html and
   store.html. Requires wallet.js (for the signed-in user).

   Trust rules (to prevent fake reviews):
     • Only signed-in buyers who RECEIVED the product
       (a delivered order on their account) can review it
       → every review is a "Verified purchase".
     • One review per buyer per product (it can be edited).
     • Sellers can't review their own products.
     • No links or phone numbers in reviews.
     • Anyone signed in can report a review. Reported
       reviews show "under review" and are hidden from the
       reporter. 3+ reports hide it for everyone.
   To remove: delete this file and its <script> tags.
===================================================== */

const SMX_REVIEWS_KEY = "smithx_reviews_v1";
const SMX_REVIEW_HIDE_AT = 3;

function smxReviewsAll() {
  try {
    const list = JSON.parse(localStorage.getItem(SMX_REVIEWS_KEY));
    return Array.isArray(list) ? list : [];
  } catch (error) {
    return [];
  }
}

function smxReviewsSave(list) {
  localStorage.setItem(SMX_REVIEWS_KEY, JSON.stringify(list));
}

function smxReviewUser() {
  return typeof smxWalletUser === "function" ? smxWalletUser() : null;
}

function smxReviewEsc(value) {
  return String(value ?? "").replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
}

/* Visible reviews for a product (hides heavily reported ones). */
function smxReviewsFor(productId) {
  const user = smxReviewUser();
  const me = user ? user.email : "";
  return smxReviewsAll()
    .filter(review => review.productId === String(productId))
    .filter(review => (review.reports || []).length < SMX_REVIEW_HIDE_AT || review.authorEmail === me)
    .filter(review => !(review.reports || []).some(report => report.by === me) || review.authorEmail === me)
    .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
}

function smxRatingSummary(productIds) {
  const ids = (Array.isArray(productIds) ? productIds : [productIds]).map(String);
  const reviews = smxReviewsAll()
    .filter(review => ids.includes(review.productId))
    .filter(review => (review.reports || []).length < SMX_REVIEW_HIDE_AT);
  const count = reviews.length;
  const average = count ? reviews.reduce((sum, review) => sum + review.rating, 0) / count : 0;
  const breakdown = [5, 4, 3, 2, 1].map(stars => ({ stars, count: reviews.filter(review => review.rating === stars).length }));
  return { count, average, breakdown };
}

function smxStarsHTML(rating, size) {
  const rounded = Math.round(rating * 2) / 2;
  let html = "";
  for (let i = 1; i <= 5; i += 1) {
    const fill = rounded >= i ? "full" : rounded >= i - 0.5 ? "half" : "empty";
    html += `<span class="smx-star is-${fill}" aria-hidden="true">★</span>`;
  }
  return `<span class="smx-stars ${size ? "is-" + size : ""}" role="img" aria-label="${rating ? rating.toFixed(1) : 0} out of 5 stars">${html}</span>`;
}

/* Delivered orders on this account that contain the product. */
function smxDeliveredPurchase(email, productId) {
  if (!email) return null;
  let orders = [];
  try {
    orders = JSON.parse(localStorage.getItem("smithx_orders_v2")) || [];
  } catch (error) {
    orders = [];
  }
  return orders.find(order =>
    String(order.status).toLowerCase() === "delivered" &&
    order.customer && String(order.customer.email || "").toLowerCase() === email &&
    Array.isArray(order.items) && order.items.some(item => String(item.productId) === String(productId))
  ) || null;
}

function smxProductSellerEmail(productId) {
  try {
    const products = JSON.parse(localStorage.getItem("smithx_custom_products_v2")) || [];
    const product = products.find(item => String(item.id) === String(productId));
    return product && product.sellerEmail ? product.sellerEmail : "";
  } catch (error) {
    return "";
  }
}

/* Can the current user review this product? Returns { ok, reason, order, existing } */
function smxCanReview(productId) {
  const user = smxReviewUser();
  if (!user) return { ok: false, reason: "signin" };
  if (smxProductSellerEmail(productId) === user.email) return { ok: false, reason: "own" };
  const existing = smxReviewsAll().find(review => review.productId === String(productId) && review.authorEmail === user.email) || null;
  const order = smxDeliveredPurchase(user.email, productId);
  if (!order && !existing) return { ok: false, reason: "not-bought" };
  return { ok: true, order, existing, user };
}

function smxSaveReview(productId, { rating, title, text, productName }) {
  const check = smxCanReview(productId);
  if (!check.ok) throw new Error("Only buyers who received this product can review it.");

  const stars = Number(rating);
  const body = String(text || "").trim();
  const heading = String(title || "").trim();
  if (!Number.isInteger(stars) || stars < 1 || stars > 5) throw new Error("Choose a star rating.");
  if (body.length < 10) throw new Error("Write at least 10 characters about the product.");
  if (body.length > 600 || heading.length > 80) throw new Error("Your review is too long.");
  const banned = /(https?:\/\/|www\.|\b\S+\.(com|co\.ke|net|org)\b|(\+?254|0)[17]\d{8})/i;
  if (banned.test(body) || banned.test(heading)) throw new Error("Please don't include links or phone numbers in reviews.");

  const now = new Date().toISOString();
  const list = smxReviewsAll();
  const name = String(check.user.name || "SM1THX buyer").trim().split(/\s+/);
  const displayName = name[0] + (name[1] ? " " + name[1][0] + "." : "");

  if (check.existing) {
    const updated = { ...check.existing, rating: stars, title: heading, text: body, updatedAt: now, edited: true };
    smxReviewsSave(list.map(review => (review.id === updated.id ? updated : review)));
    return updated;
  }

  const review = {
    id: "REV-" + Date.now().toString(36).toUpperCase(),
    productId: String(productId),
    productName: productName || "",
    orderId: check.order.orderId,
    authorEmail: check.user.email,
    authorName: displayName,
    rating: stars,
    title: heading,
    text: body,
    verified: true,
    reports: [],
    createdAt: now,
    updatedAt: now
  };
  list.push(review);
  smxReviewsSave(list);
  return review;
}

function smxReportReview(reviewId, reason) {
  const user = smxReviewUser();
  if (!user) throw new Error("Sign in to report a review.");
  const list = smxReviewsAll();
  const review = list.find(item => item.id === reviewId);
  if (!review) throw new Error("Review not found.");
  if (review.authorEmail === user.email) throw new Error("You can't report your own review.");
  review.reports = review.reports || [];
  if (!review.reports.some(report => report.by === user.email)) {
    review.reports.push({ by: user.email, reason, at: new Date().toISOString() });
  }
  smxReviewsSave(list);
}

/* ---------------- UI: review section ---------------- */

function smxReviewSectionHTML(productId, productName) {
  const summary = smxRatingSummary(productId);
  const reviews = smxReviewsFor(productId);
  const check = smxCanReview(productId);
  const user = smxReviewUser();

  const cta = check.ok
    ? `<button type="button" class="smx-rv-btn" data-rv="write" data-id="${smxReviewEsc(productId)}" data-name="${smxReviewEsc(productName)}">${check.existing ? "Edit your review" : "Write a review"}</button>`
    : check.reason === "signin"
      ? `<p class="smx-rv-note"><a href="login.html?next=index.html">Sign in</a> to review products you've received.</p>`
      : check.reason === "own"
        ? `<p class="smx-rv-note">You can't review your own product.</p>`
        : `<p class="smx-rv-note">Only buyers who received this product can review it.</p>`;

  return `
    <section class="smx-rv" aria-label="Reviews">
      <div class="smx-rv-head">
        <div>
          <h3>Reviews</h3>
          ${summary.count
            ? `<div class="smx-rv-score"><strong>${summary.average.toFixed(1)}</strong>${smxStarsHTML(summary.average, "lg")}<span>${summary.count} ${summary.count === 1 ? "review" : "reviews"}</span></div>`
            : `<p class="smx-rv-note">No reviews yet.</p>`}
        </div>
        ${cta}
      </div>
      ${summary.count ? `
        <div class="smx-rv-bars">
          ${summary.breakdown.map(row => `
            <div class="smx-rv-bar"><span>${row.stars}★</span><i><b style="width:${summary.count ? (row.count / summary.count) * 100 : 0}%"></b></i><span>${row.count}</span></div>`).join("")}
        </div>` : ""}
      <ul class="smx-rv-list">
        ${reviews.map(review => {
          const reported = (review.reports || []).length;
          const mine = user && review.authorEmail === user.email;
          return `
          <li>
            <div class="smx-rv-meta">
              ${smxStarsHTML(review.rating)}
              <strong>${smxReviewEsc(review.title || "")}</strong>
            </div>
            <p>${smxReviewEsc(review.text)}</p>
            <small>
              ${smxReviewEsc(review.authorName)} · ${new Date(review.createdAt).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
              ${review.verified ? ' · <span class="smx-rv-verified">✓ Verified purchase</span>' : ""}
              ${review.edited ? " · edited" : ""}
              ${mine && reported ? ` · <span class="smx-rv-flag">Reported — under review</span>` : ""}
              ${!mine && user ? ` · <button type="button" class="smx-rv-link" data-rv="report" data-review="${smxReviewEsc(review.id)}" data-id="${smxReviewEsc(productId)}">Report</button>` : ""}
            </small>
          </li>`;
        }).join("")}
      </ul>
    </section>`;
}

/* ---------------- UI: dialogs ---------------- */

function smxReviewDialog(html, onSubmit) {
  const old = document.getElementById("smxRvDialog");
  if (old) old.remove();
  const wrap = document.createElement("div");
  wrap.id = "smxRvDialog";
  wrap.className = "smx-rv-dialog";
  wrap.setAttribute("role", "dialog");
  wrap.setAttribute("aria-modal", "true");
  wrap.innerHTML = `<form class="smx-rv-box" novalidate>${html}</form>`;
  document.body.appendChild(wrap);
  const form = wrap.querySelector("form");
  form.addEventListener("submit", event => {
    event.preventDefault();
    onSubmit(form, wrap);
  });
  wrap.addEventListener("click", event => {
    if (event.target === wrap || event.target.closest("[data-rv-close]")) wrap.remove();
  });
  const first = wrap.querySelector("input, textarea, select");
  if (first) first.focus();
  return wrap;
}

function smxOpenReviewForm(productId, productName, onDone) {
  const check = smxCanReview(productId);
  if (!check.ok) return;
  const existing = check.existing || {};
  smxReviewDialog(`
    <h3>${existing.id ? "Edit your review" : "Review"} ${smxReviewEsc(productName || "")}</h3>
    <p class="smx-rv-note">✓ Verified purchase${check.order ? " · Order " + smxReviewEsc(check.order.orderId) : ""}</p>
    <div class="smx-rv-error" role="alert"></div>
    <fieldset class="smx-rv-pick">
      <legend>Your rating</legend>
      ${[5, 4, 3, 2, 1].map(n => `<input type="radio" id="rv${n}" name="rating" value="${n}" ${existing.rating === n ? "checked" : ""}><label for="rv${n}" title="${n} star${n > 1 ? "s" : ""}">★</label>`).join("")}
    </fieldset>
    <label class="smx-rv-field">Headline <small>optional</small>
      <input name="title" maxlength="80" value="${smxReviewEsc(existing.title || "")}" placeholder="e.g. Great battery life">
    </label>
    <label class="smx-rv-field">Your review
      <textarea name="text" rows="4" maxlength="600" placeholder="What did you like or dislike? How was the quality?">${smxReviewEsc(existing.text || "")}</textarea>
      <small>At least 10 characters. No links or phone numbers.</small>
    </label>
    <div class="smx-rv-actions">
      <button type="submit" class="smx-rv-btn">${existing.id ? "Save review" : "Post review"}</button>
      <button type="button" class="smx-rv-btn is-ghost" data-rv-close>Cancel</button>
    </div>`, (form, wrap) => {
    try {
      smxSaveReview(productId, {
        rating: (form.querySelector('input[name="rating"]:checked') || {}).value,
        title: form.title.value,
        text: form.text.value,
        productName
      });
      wrap.remove();
      onDone && onDone("Thanks — your review is live.");
    } catch (error) {
      const box = form.querySelector(".smx-rv-error");
      box.textContent = error.message;
      box.classList.add("show");
    }
  });
}

function smxOpenReportForm(reviewId, onDone) {
  smxReviewDialog(`
    <h3>Report this review</h3>
    <p class="smx-rv-note">Tell us what's wrong. The SM1THX team will check it.</p>
    <div class="smx-rv-error" role="alert"></div>
    <label class="smx-rv-field">Reason
      <select name="reason">
        <option>Looks fake or paid for</option>
        <option>Not about this product</option>
        <option>Offensive or abusive</option>
        <option>Contains personal information</option>
        <option>Spam or advertising</option>
      </select>
    </label>
    <div class="smx-rv-actions">
      <button type="submit" class="smx-rv-btn">Send report</button>
      <button type="button" class="smx-rv-btn is-ghost" data-rv-close>Cancel</button>
    </div>`, (form, wrap) => {
    try {
      smxReportReview(reviewId, form.reason.value);
      wrap.remove();
      onDone && onDone("Thanks — we'll review it. It's now hidden for you.");
    } catch (error) {
      const box = form.querySelector(".smx-rv-error");
      box.textContent = error.message;
      box.classList.add("show");
    }
  });
}

/* ---------------- Page hooks ---------------- */

(function () {
  function notify(text) {
    if (typeof showToast === "function") showToast(text);
    else {
      const toast = document.getElementById("toast");
      if (toast) {
        toast.textContent = text;
        toast.classList.add("show");
        setTimeout(() => toast.classList.remove("show"), 2600);
      }
    }
  }

  function refreshModal(productId) {
    const section = document.querySelector("#productModalContent .smx-rv");
    if (section) {
      const name = (document.querySelector("#productModalContent h2") || {}).textContent || "";
      section.outerHTML = smxReviewSectionHTML(productId, name.trim());
    }
    if (typeof renderProducts === "function") renderProducts();
    if (typeof renderSelectedOrder === "function" && document.getElementById("details")) renderSelectedOrder();
  }

  document.addEventListener("click", event => {
    const button = event.target.closest("[data-rv]");
    if (!button) return;
    const id = button.dataset.id;
    if (button.dataset.rv === "write") {
      smxOpenReviewForm(id, button.dataset.name, text => { refreshModal(id); notify(text); });
    } else if (button.dataset.rv === "report") {
      smxOpenReportForm(button.dataset.review, text => { refreshModal(id); notify(text); });
    }
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      const dialog = document.getElementById("smxRvDialog");
      if (dialog) dialog.remove();
    }
  });

  /* Marketplace (index.html) */
  if (typeof openProductModal === "function" && typeof renderProducts === "function") {
    const originalOpen = window.openProductModal;
    window.openProductModal = function (productId) {
      originalOpen(productId);
      const content = document.getElementById("productModalContent");
      const product = typeof findProduct === "function" ? findProduct(productId) : null;
      if (!content || !product || content.querySelector(".smx-rv")) return;
      content.insertAdjacentHTML("beforeend", smxReviewSectionHTML(product.id, product.name));
    };

    const originalRender = window.renderProducts;
    window.renderProducts = function () {
      originalRender();
      document.querySelectorAll("#productsGrid .product-card").forEach(card => {
        if (card.querySelector(".smx-card-rating")) return;
        const trigger = card.querySelector(".product-image-button");
        const match = trigger && (trigger.getAttribute("onclick") || "").match(/openProductModal\('([^']+)'\)/);
        if (!match) return;
        const summary = smxRatingSummary(match[1]);
        const title = card.querySelector("h3");
        if (!title) return;
        title.insertAdjacentHTML("afterend", summary.count
          ? `<div class="smx-card-rating">${smxStarsHTML(summary.average)}<span>${summary.average.toFixed(1)} (${summary.count})</span></div>`
          : `<div class="smx-card-rating is-empty"><span>No reviews yet</span></div>`);
      });
    };
    document.addEventListener("DOMContentLoaded", () => window.renderProducts());
    if (document.readyState !== "loading") window.renderProducts();
  }

  /* My Orders: "Review your items" on delivered orders */
  if (document.getElementById("details") && typeof renderSelectedOrder === "function") {
    const originalSelected = window.renderSelectedOrder;
    window.renderSelectedOrder = function () {
      originalSelected();
      const container = document.getElementById("details");
      const order = typeof orders !== "undefined" && selectedOrderId
        ? orders.find(item => String(item.orderId) === String(selectedOrderId))
        : null;
      if (!container || !order || String(order.status).toLowerCase() !== "delivered") return;
      const user = smxReviewUser();
      const items = (order.items || []).filter(item => !String(item.productId).startsWith("auction-"));
      if (!items.length) return;
      const rows = items.map(item => {
        const check = smxCanReview(item.productId);
        const action = !user
          ? `<a class="btn btn-secondary" href="login.html?next=my-orders.html">Sign in to review</a>`
          : check.ok
            ? `<button type="button" class="btn btn-secondary" data-rv="write" data-id="${smxReviewEsc(item.productId)}" data-name="${smxReviewEsc(item.name)}">${check.existing ? "Edit review" : "Write a review"}</button>`
            : `<span class="smx-rv-note">${check.reason === "not-bought" ? "Ordered as a guest — sign in at checkout to review" : ""}</span>`;
        const mine = user ? smxReviewsAll().find(r => r.productId === String(item.productId) && r.authorEmail === user.email) : null;
        return `<li><span><strong>${smxReviewEsc(item.name)}</strong>${mine ? smxStarsHTML(mine.rating) : ""}</span>${action}</li>`;
      }).join("");
      container.insertAdjacentHTML("beforeend", `
        <section class="smx-rv-order" aria-label="Review your items">
          <h3>Review your items</h3>
          <ul>${rows}</ul>
        </section>`);
    };
  }

  /* Styles */
  const style = document.createElement("style");
  style.textContent = `
    .smx-stars { display: inline-flex; gap: 1px; line-height: 1; font-size: .95rem; letter-spacing: 0; }
    .smx-stars.is-lg { font-size: 1.25rem; }
    .smx-star.is-empty { color: #d9d1c3; }
    .smx-star.is-full { color: #d99a2b; }
    .smx-star.is-half { background: linear-gradient(90deg, #d99a2b 50%, #d9d1c3 50%); -webkit-background-clip: text; background-clip: text; color: transparent; }
    .smx-card-rating { display: flex; align-items: center; gap: 6px; margin: 2px 0 6px; font-size: .8rem; color: #6f675a; }
    .smx-card-rating.is-empty { color: #6b6458; }
    .smx-rv { grid-column: 1 / -1; margin-top: 26px; padding-top: 22px; border-top: 1px solid rgba(22,19,15,.1); display: grid; gap: 16px; text-align: left; }
    .smx-rv-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; flex-wrap: wrap; }
    .smx-rv h3 { font-family: var(--font-display, Georgia, serif); font-size: 1.6rem; font-weight: 600; margin-bottom: 4px; }
    .smx-rv-score { display: flex; align-items: center; gap: 10px; }
    .smx-rv-score strong { font-size: 1.8rem; font-family: var(--font-display, Georgia, serif); }
    .smx-rv-score span:last-child { color: #6f675a; font-size: .88rem; }
    .smx-rv-note { color: #6f675a; font-size: .88rem; }
    .smx-rv-note a { color: #8a5f14; font-weight: 600; }
    .smx-rv-bars { display: grid; gap: 4px; max-width: 360px; }
    .smx-rv-bar { display: grid; grid-template-columns: 28px 1fr 24px; align-items: center; gap: 8px; font-size: .8rem; color: #6f675a; }
    .smx-rv-bar i { height: 6px; border-radius: 99px; background: #eee6d8; overflow: hidden; }
    .smx-rv-bar b { display: block; height: 100%; background: #d99a2b; }
    .smx-rv-list { list-style: none; padding: 0; margin: 0; display: grid; gap: 14px; }
    .smx-rv-list li { padding: 14px 16px; border-radius: 14px; background: rgba(246,241,232,.7); display: grid; gap: 6px; }
    .smx-rv-meta { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
    .smx-rv-list p { font-size: .92rem; color: #3d372e; overflow-wrap: anywhere; }
    .smx-rv-list small { font-size: .78rem; color: #6f675a; }
    .smx-rv-verified { color: #2f7a4a; font-weight: 600; }
    .smx-rv-flag { color: #8f2a2f; font-weight: 600; }
    .smx-rv-link { background: none; border: 0; padding: 0; color: #6f675a; text-decoration: underline; cursor: pointer; font: inherit; }
    .smx-rv-btn { display: inline-flex; align-items: center; justify-content: center; min-height: 44px; padding: 0 18px; border-radius: 12px; border: 1px solid #16130f; background: #16130f; color: #fff; font: inherit; font-weight: 600; cursor: pointer; }
    .smx-rv-btn.is-ghost { background: transparent; color: #16130f; border-color: rgba(22,19,15,.22); }
    .smx-rv-dialog { position: fixed; inset: 0; z-index: 4000; display: grid; place-items: center; padding: 20px; background: rgba(14,12,9,.62); }
    .smx-rv-box { width: min(480px, 100%); max-height: calc(100vh - 40px); overflow-y: auto; display: grid; gap: 14px; padding: 26px; border-radius: 20px; background: #fffdf9; color: #16130f; box-shadow: 0 30px 70px rgba(0,0,0,.4); text-align: left; }
    .smx-rv-box h3 { font-family: var(--font-display, Georgia, serif); font-size: 1.6rem; font-weight: 600; line-height: 1.15; }
    .smx-rv-field { display: grid; gap: 6px; font-size: .85rem; font-weight: 600; }
    .smx-rv-field small { font-weight: 400; color: #6f675a; }
    .smx-rv-field input, .smx-rv-field textarea, .smx-rv-field select { width: 100%; padding: 11px 14px; border: 1px solid rgba(22,19,15,.16); border-radius: 12px; background: #fff; font: inherit; font-weight: 400; color: #16130f; }
    .smx-rv-pick { border: 0; display: flex; flex-direction: row-reverse; justify-content: flex-end; gap: 4px; }
    .smx-rv-pick legend { width: 100%; font-size: .85rem; font-weight: 600; margin-bottom: 6px; }
    .smx-rv-pick input { position: absolute; opacity: 0; pointer-events: none; }
    .smx-rv-pick label { font-size: 2rem; line-height: 1; color: #d9d1c3; cursor: pointer; transition: color .15s ease; }
    .smx-rv-pick label:hover, .smx-rv-pick label:hover ~ label, .smx-rv-pick input:checked ~ label { color: #d99a2b; }
    .smx-rv-pick input:focus-visible + label { outline: 2px solid #e8a33d; outline-offset: 2px; border-radius: 4px; }
    .smx-rv-error { display: none; padding: 10px 14px; border-radius: 10px; background: #fbeaea; color: #8f2a2f; font-size: .88rem; }
    .smx-rv-error.show { display: block; }
    .smx-rv-actions { display: flex; flex-wrap: wrap; gap: 10px; }
    .smx-rv-order { margin-top: 22px; padding-top: 18px; border-top: 1px solid var(--line, #e8e0d2); display: grid; gap: 12px; }
    .smx-rv-order h3 { font-size: 1.4rem; }
    .smx-rv-order ul { list-style: none; padding: 0; display: grid; gap: 10px; }
    .smx-rv-order li { display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; padding: 12px 14px; border: 1px solid var(--line, #e8e0d2); border-radius: 14px; background: #fff; }
    .smx-rv-order li > span { display: grid; gap: 4px; }
    .smx-rv-order .btn { width: auto; }
  `;
  document.head.appendChild(style);
})();
