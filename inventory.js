"use strict";

/* SM1THX seller inventory: manage and delete seller-created listings. */
(function () {
  const PRODUCTS_KEY = "smithx_custom_products_v2";

  function readProducts() {
    try {
      const value = JSON.parse(localStorage.getItem(PRODUCTS_KEY) || "[]");
      return Array.isArray(value) ? value : [];
    } catch (_) {
      return [];
    }
  }

  function writeProducts(products) {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  }

  function esc(value) {
    return String(value ?? "").replace(/[&<>"']/g, ch => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
    }[ch]));
  }

  function renderInventory() {
    const host = document.getElementById("smithxInventoryList");
    if (!host) return;
    const products = readProducts();

    if (!products.length) {
      host.innerHTML = '<div class="smx-inventory-empty"><strong>No listed products yet</strong><p>Your products will appear here after you publish them.</p></div>';
      return;
    }

    host.innerHTML = products.map(product => `
      <article class="smx-inventory-item">
        <img src="${esc(product.image || "")}" alt="" loading="lazy">
        <div class="smx-inventory-info">
          <strong>${esc(product.name || "Untitled product")}</strong>
          <span>${esc(product.category || "Uncategorised")} · KES ${(Number(product.price) || 0).toLocaleString("en-KE")}</span>
        </div>
        <button type="button" class="smx-inventory-delete" data-product-id="${esc(product.id)}" aria-label="Delete ${esc(product.name || "product")}">Delete listing</button>
      </article>
    `).join("");

    host.querySelectorAll("[data-product-id]").forEach(button => {
      button.addEventListener("click", () => {
        const id = button.getAttribute("data-product-id");
        const product = readProducts().find(item => String(item.id) === String(id));
        if (!product) return;
        if (!window.confirm('Delete "' + (product.name || "this product") + '" from your listings? This cannot be undone.')) return;

        writeProducts(readProducts().filter(item => String(item.id) !== String(id)));

        // Remove deleted item from the current browser's cart as well.
        try {
          const cart = JSON.parse(localStorage.getItem("smithx_cart_v2") || "[]");
          localStorage.setItem("smithx_cart_v2", JSON.stringify(
            Array.isArray(cart) ? cart.filter(item => String(item.productId ?? item.id) !== String(id)) : []
          ));
        } catch (_) {}

        if (typeof window.renderProducts === "function") window.renderProducts();
        if (typeof window.updateCartUI === "function") window.updateCartUI();
        renderInventory();
        if (typeof window.showToast === "function") window.showToast("Product listing deleted.");
      });
    });
  }

  function mountInventory() {
    if (document.getElementById("smithxInventorySection")) {
      renderInventory();
      return;
    }

    const sellerSection = document.getElementById("seller");
    if (!sellerSection) return;

    const section = document.createElement("section");
    section.id = "smithxInventorySection";
    section.className = "section smx-inventory-section";
    section.innerHTML = `
      <div class="section-inner">
        <div class="section-heading">
          <p class="section-eyebrow">SELLER INVENTORY</p>
          <h2>Manage your listings</h2>
          <p>Review products you have published and remove listings you no longer sell.</p>
        </div>
        <div id="smithxInventoryList" class="smx-inventory-list"></div>
      </div>
    `;
    sellerSection.insertAdjacentElement("afterend", section);
    renderInventory();
  }

  document.addEventListener("DOMContentLoaded", mountInventory);
  window.addEventListener("storage", event => {
    if (!event.key || event.key === PRODUCTS_KEY) renderInventory();
  });
  window.addEventListener("pageshow", renderInventory);
  // App.js may finish initializing after this add-on in cached/slow loads.
  setTimeout(mountInventory, 0);
})();
