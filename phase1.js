"use strict";

/* =====================================================
   SMITHX — PHASE 1 MARKETPLACE ADD-ON (phase1.js)
   Loaded after app.js on index.html. Adds, without
   rewriting app.js:
     • Mobile navigation menu (fixes hidden nav on phones)
     • Sort and price filters in the marketplace
     • Wishlist / saved products
     • Store badges and shareable product links
     • Tags newly published products with the seller's store
   To remove: delete this file, phase1.css and their tags.
   Requires stores.js.
===================================================== */

(function () {
  if (typeof renderProducts !== "function") return;

  const state = {
    sort: "featured",
    price: "any",
    savedOnly: false
  };

  const PRICE_RANGES = {
    any:   { label: "Any price",           min: 0,      max: Infinity },
    u5k:   { label: "Under KES 5,000",     min: 0,      max: 4999 },
    "5-20": { label: "KES 5,000 – 20,000",  min: 5000,   max: 20000 },
    "20-100": { label: "KES 20,000 – 100,000", min: 20000, max: 100000 },
    o100k: { label: "Over KES 100,000",    min: 100001, max: Infinity }
  };

  /* ---------------- Wishlist ---------------- */

  function getWishlist() {
    const list = smxStoreRead(SMX_STORE_KEYS.wishlist, []);
    return Array.isArray(list) ? list : [];
  }

  function isSaved(id) {
    return getWishlist().includes(id);
  }

  function toggleSaved(id) {
    const list = getWishlist();
    const next = list.includes(id) ? list.filter(item => item !== id) : list.concat(id);
    smxStoreWrite(SMX_STORE_KEYS.wishlist, next);
    if (typeof showToast === "function") {
      showToast(next.includes(id) ? "Saved to your wishlist." : "Removed from your wishlist.");
    }
    updateSavedButton();
    renderProducts();
  }

  /* ---------------- Toolbar ---------------- */

  function buildToolbar() {
    const tools = document.querySelector(".marketplace-tools");
    if (!tools || document.getElementById("smxSort")) return;

    const bar = document.createElement("div");
    bar.className = "smx-filter-bar";
    bar.innerHTML = `
      <label class="smx-field">
        <span>Sort</span>
        <select id="smxSort" aria-label="Sort products">
          <option value="featured">Featured</option>
          <option value="newest">Newest</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
          <option value="name">Name A–Z</option>
        </select>
      </label>
      <label class="smx-field">
        <span>Price</span>
        <select id="smxPrice" aria-label="Filter by price">
          ${Object.entries(PRICE_RANGES).map(([key, range]) => `<option value="${key}">${range.label}</option>`).join("")}
        </select>
      </label>
      <button type="button" class="smx-saved-toggle" id="smxSavedToggle" aria-pressed="false">
        <span aria-hidden="true">♡</span> Saved <b id="smxSavedCount">0</b>
      </button>
      <p class="smx-result-count" id="smxResultCount" aria-live="polite"></p>
    `;
    tools.insertAdjacentElement("afterend", bar);

    document.getElementById("smxSort").addEventListener("change", event => {
      state.sort = event.target.value;
      renderProducts();
    });
    document.getElementById("smxPrice").addEventListener("change", event => {
      state.price = event.target.value;
      renderProducts();
    });
    document.getElementById("smxSavedToggle").addEventListener("click", () => {
      state.savedOnly = !state.savedOnly;
      updateSavedButton();
      renderProducts();
    });
    updateSavedButton();
  }

  function updateSavedButton() {
    const button = document.getElementById("smxSavedToggle");
    const count = document.getElementById("smxSavedCount");
    if (!button || !count) return;
    count.textContent = getWishlist().length;
    button.setAttribute("aria-pressed", String(state.savedOnly));
    button.classList.toggle("is-active", state.savedOnly);
  }

  /* ---------------- Enhance product grid ---------------- */

  function cardProductId(card) {
    const trigger = card.querySelector(".product-image-button");
    const match = trigger && (trigger.getAttribute("onclick") || "").match(/openProductModal\('([^']+)'\)/);
    return match ? match[1] : null;
  }

  function createdTime(product) {
    const match = String(product.id || "").match(/^custom-(\d+)/);
    return match ? Number(match[1]) : 0;
  }

  const originalRender = renderProducts;

  window.renderProducts = function () {
    originalRender();

    const grid = document.getElementById("productsGrid");
    if (!grid) return;

    const cards = Array.from(grid.querySelectorAll(".product-card"));
    const range = PRICE_RANGES[state.price] || PRICE_RANGES.any;
    const wishlist = getWishlist();

    const entries = cards.map((card, index) => {
      const id = cardProductId(card);
      const product = id ? findProduct(id) : null;
      return { card, id, product, index };
    }).filter(entry => entry.product);

    const visible = entries.filter(({ id, product }) => {
      const price = Number(product.price) || 0;
      if (price < range.min || price > range.max) return false;
      if (state.savedOnly && !wishlist.includes(id)) return false;
      return true;
    });

    const sorters = {
      featured: (a, b) => a.index - b.index,
      newest: (a, b) => createdTime(b.product) - createdTime(a.product) || a.index - b.index,
      "price-asc": (a, b) => (Number(a.product.price) || 0) - (Number(b.product.price) || 0),
      "price-desc": (a, b) => (Number(b.product.price) || 0) - (Number(a.product.price) || 0),
      name: (a, b) => String(a.product.name).localeCompare(String(b.product.name))
    };
    visible.sort(sorters[state.sort] || sorters.featured);

    const countEl = document.getElementById("smxResultCount");

    if (cards.length && !visible.length) {
      grid.innerHTML = `
        <div class="empty-state">
          <strong>${state.savedOnly ? "No saved products here yet." : "No products in this price range."}</strong>
          <p>${state.savedOnly ? "Tap the heart on any product to save it for later." : "Try another price range or category."}</p>
        </div>`;
      if (countEl) countEl.textContent = "0 products";
      return;
    }

    if (!cards.length) {
      if (countEl) countEl.textContent = "0 products";
      return;
    }

    grid.innerHTML = "";
    visible.forEach(({ card, id, product }) => {
      decorateCard(card, id, product);
      grid.appendChild(card);
    });

    if (countEl) countEl.textContent = visible.length + (visible.length === 1 ? " product" : " products");
  };

  function decorateCard(card, id, product) {
    if (card.querySelector(".smx-heart")) return;

    const imageButton = card.querySelector(".product-image-button");
    if (imageButton) {
      const wrap = document.createElement("div");
      wrap.className = "smx-image-wrap";
      imageButton.parentNode.insertBefore(wrap, imageButton);
      wrap.appendChild(imageButton);

      const saved = isSaved(id);
      const heart = document.createElement("button");
      heart.type = "button";
      heart.className = "smx-heart" + (saved ? " is-saved" : "");
      heart.setAttribute("aria-pressed", String(saved));
      heart.setAttribute("aria-label", (saved ? "Remove " : "Save ") + product.name + (saved ? " from" : " to") + " wishlist");
      heart.textContent = saved ? "♥" : "♡";
      heart.addEventListener("click", event => {
        event.stopPropagation();
        toggleSaved(id);
      });
      wrap.appendChild(heart);
    }

    if (product.storeSlug && product.storeName) {
      const store = smxStoreBySlug(product.storeSlug);
      if (store && store.published) {
        const category = card.querySelector(".product-category");
        const link = document.createElement("a");
        link.className = "smx-store-badge";
        link.href = "store.html?s=" + encodeURIComponent(store.slug);
        link.textContent = "by " + store.name;
        if (category) category.insertAdjacentElement("afterend", link);
      }
    }
  }

  /* ---------------- Product modal: share + store ---------------- */

  const originalOpenModal = openProductModal;

  window.openProductModal = function (productId) {
    originalOpenModal(productId);

    const product = findProduct(productId);
    const content = document.getElementById("productModalContent");
    if (!product || !content) return;

    const actionButton = content.querySelector(".primary-button");
    if (!actionButton || content.querySelector(".smx-modal-actions")) return;

    const actions = document.createElement("div");
    actions.className = "smx-modal-actions";

    const saved = isSaved(product.id);
    const saveBtn = document.createElement("button");
    saveBtn.type = "button";
    saveBtn.className = "secondary-button";
    saveBtn.textContent = saved ? "♥ Saved" : "♡ Save";
    saveBtn.addEventListener("click", () => {
      toggleSaved(product.id);
      saveBtn.textContent = isSaved(product.id) ? "♥ Saved" : "♡ Save";
    });

    const shareBtn = document.createElement("button");
    shareBtn.type = "button";
    shareBtn.className = "secondary-button";
    shareBtn.textContent = "Share";
    shareBtn.addEventListener("click", async () => {
      const result = await smxShareLink(smxProductURL(product.id), product.name + " on SMITHX");
      if (result === "copied" && typeof showToast === "function") showToast("Product link copied.");
    });

    actionButton.insertAdjacentElement("afterend", actions);
    actions.appendChild(actionButton);
    actions.appendChild(saveBtn);
    actions.appendChild(shareBtn);

    if (product.storeSlug) {
      const store = smxStoreBySlug(product.storeSlug);
      if (store && store.published) {
        const storeLink = document.createElement("a");
        storeLink.className = "smx-modal-store";
        storeLink.href = "store.html?s=" + encodeURIComponent(store.slug);
        storeLink.innerHTML = "Sold by <strong></strong> — visit store →";
        storeLink.querySelector("strong").textContent = store.name;
        actions.insertAdjacentElement("afterend", storeLink);
      }
    }

    const url = new URL(location.href);
    url.searchParams.set("product", product.id);
    history.replaceState(null, "", url.pathname + url.search + "#market");
  };

  const originalCloseModal = closeProductModal;
  window.closeProductModal = function () {
    originalCloseModal();
    const url = new URL(location.href);
    if (url.searchParams.has("product")) {
      url.searchParams.delete("product");
      history.replaceState(null, "", url.pathname + url.search + url.hash);
    }
  };

  /* ---------------- Tag new products with the seller's store ---------------- */

  const originalSaveProducts = saveCustomProducts;

  window.saveCustomProducts = function (products) {
    const email = smxSessionEmail();
    const store = email ? smxStoreForOwner(email) : null;

    const tagged = (Array.isArray(products) ? products : []).map(product => {
      if (product.sellerEmail || product.storeId) return product;
      const isNew = createdTime(product) > Date.now() - 60 * 1000;
      if (!isNew || !email) return product;
      return {
        ...product,
        sellerEmail: email,
        storeId: store ? store.id : undefined,
        storeSlug: store ? store.slug : undefined,
        storeName: store ? store.name : undefined
      };
    });

    return originalSaveProducts(tagged);
  };

  /* ---------------- Mobile navigation ---------------- */

  function buildMobileMenu() {
    const inner = document.querySelector(".topbar-inner");
    const nav = document.querySelector(".nav-links");
    if (!inner || !nav || document.getElementById("smxMenuButton")) return;

    nav.id = nav.id || "mainNav";

    const button = document.createElement("button");
    button.type = "button";
    button.id = "smxMenuButton";
    button.className = "smx-menu-button";
    button.setAttribute("aria-controls", nav.id);
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-label", "Open menu");
    button.innerHTML = '<span></span><span></span><span></span>';

    const cart = inner.querySelector(".cart-button");
    inner.insertBefore(button, cart ? cart.nextSibling : null);

    function setOpen(open) {
      nav.classList.toggle("smx-open", open);
      button.setAttribute("aria-expanded", String(open));
      button.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      button.classList.toggle("is-open", open);
    }

    button.addEventListener("click", () => setOpen(!nav.classList.contains("smx-open")));
    nav.addEventListener("click", event => {
      if (event.target.closest("a")) setOpen(false);
    });
    document.addEventListener("keydown", event => {
      if (event.key === "Escape") setOpen(false);
    });
    document.addEventListener("click", event => {
      if (!nav.contains(event.target) && !button.contains(event.target)) setOpen(false);
    });

  }

  /* ---------------- Shared product link (?product=ID) ---------------- */

  function openSharedProduct() {
    const id = new URLSearchParams(location.search).get("product");
    if (!id) return;
    if (findProduct(id)) {
      setTimeout(() => window.openProductModal(id), 150);
    } else if (typeof showToast === "function") {
      showToast("That product is no longer available.");
    }
  }

  /* ---------------- Start ---------------- */

  function start() {
    buildMobileMenu();
    buildToolbar();
    window.renderProducts();
    openSharedProduct();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
