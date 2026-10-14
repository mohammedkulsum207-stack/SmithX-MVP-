"use strict";

/*
 * SMITHX marketplace API bridge.
 *
 * GitHub Pages is a static frontend, so configure apiBaseUrl only after
 * deploying the API to HTTPS hosting. Leave it blank to preserve the
 * existing local/demo experience.
 *
 * The current backend is an early SQLite foundation and does not yet
 * enforce authentication or seller ownership. Do not enable remote writes
 * or expose it publicly until server-side authorization is implemented.
 */
(function () {
  const config = window.SMX_MARKETPLACE_CONFIG || {
    apiBaseUrl: "",
    enableRemoteCatalogue: false
  };

  const baseUrl = String(config.apiBaseUrl || "").trim().replace(/\/+$/, "");
  let remoteProducts = [];
  let catalogueLoad = null;

  async function request(path) {
    if (!baseUrl) {
      throw new Error("SMITHX API is not configured. Set apiBaseUrl in marketplace-api-config.js.");
    }

    const response = await fetch(baseUrl + path, {
      method: "GET",
      headers: { Accept: "application/json" },
      mode: "cors",
      credentials: "omit"
    });

    let body;
    try {
      body = await response.json();
    } catch (error) {
      throw new Error("The SMITHX API returned an invalid response.");
    }

    if (!response.ok) {
      throw new Error(body && body.error ? body.error : "SMITHX API request failed (" + response.status + ").");
    }
    return body;
  }

  function normalizeProduct(product) {
    return {
      id: String(product.id),
      name: String(product.title || "Untitled product"),
      description: String(product.description || ""),
      category: String(product.category || "Other"),
      price: Number(product.price),
      stock: Number(product.inventory),
      image: "",
      sellerId: String(product.seller_id || ""),
      currency: String(product.currency || "KES"),
      source: "api"
    };
  }

  async function health() {
    return request("/api/marketplace/health");
  }

  async function listProducts() {
    const body = await request("/api/marketplace/products");
    if (!body || !Array.isArray(body.products)) {
      throw new Error("The SMITHX API product response has an unexpected format.");
    }
    return body.products.map(normalizeProduct);
  }

  function enableRemoteCatalogue() {
    if (!baseUrl || config.enableRemoteCatalogue !== true) return;
    if (typeof window.getAllProducts !== "function") return;

    const originalGetAllProducts = window.getAllProducts;
    const localProducts = originalGetAllProducts();

    if (localProducts.some(product => product && product.source === "api")) return;

    window.getAllProducts = function () {
      return originalGetAllProducts().filter(product => product && product.source !== "api").concat(remoteProducts);
    };

    catalogueLoad = listProducts()
      .then(products => {
        remoteProducts = products.filter(product => Number.isFinite(product.price) && product.price >= 0);
        if (typeof window.renderProducts === "function") window.renderProducts();
        return remoteProducts;
      })
      .catch(error => {
        console.warn("SMITHX remote catalogue unavailable; keeping the existing catalogue.", error.message);
        return [];
      });
  }

  window.SMXMarketplaceAPI = Object.freeze({
    isConfigured: Boolean(baseUrl),
    health,
    listProducts,
    getCatalogueLoad: () => catalogueLoad || Promise.resolve([])
  });

  enableRemoteCatalogue();
})();
