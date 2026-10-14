"use strict";

/* =====================================================
   SM1THX — SELLER STOREFRONTS (stores.js)
   Shared helpers used by index.html (phase1.js),
   profile.html (profile-store.js) and store.html.
   Stores are saved only in this browser (localStorage)
   until SM1THX has a backend.
   To remove: delete stores.js, store.html, phase1.js,
   phase1.css, profile-store.js and their <script>/<link>
   tags.
===================================================== */

const SMX_STORE_KEYS = {
  stores: "smithx_stores_v1",
  products: "smithx_custom_products_v2", // owned by app.js
  session: "smithx_auth_session_v1",     // owned by auth.js
  wishlist: "smithx_wishlist_v1"
};

const SMX_STORE_THEMES = {
  gold:    { label: "Wolf Gold",    accent: "#e8a33d", ink: "#16130f" },
  emerald: { label: "Emerald",      accent: "#2f9e6b", ink: "#0f1f18" },
  ocean:   { label: "Ocean",        accent: "#2b7fd4", ink: "#0d1826" },
  rose:    { label: "Rose",         accent: "#d1477a", ink: "#24101a" },
  violet:  { label: "Violet",       accent: "#7a5af5", ink: "#16112b" },
  sunset:  { label: "Sunset",       accent: "#e8673d", ink: "#24130c" }
};

const SMX_RESERVED_SLUGS = ["admin", "smithx", "sm1thx", "login", "profile", "store", "stores", "help", "support", "official"];

function smxStoreRead(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    const parsed = JSON.parse(raw);
    return parsed === null ? fallback : parsed;
  } catch (error) {
    return fallback;
  }
}

function smxStoreWrite(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    return false;
  }
}

function smxSlugify(text) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

function smxGetStores() {
  const stores = smxStoreRead(SMX_STORE_KEYS.stores, []);
  return Array.isArray(stores) ? stores : [];
}

function smxSaveStores(stores) {
  return smxStoreWrite(SMX_STORE_KEYS.stores, stores);
}

function smxSessionEmail() {
  const session = smxStoreRead(SMX_STORE_KEYS.session, null);
  return session && session.email ? String(session.email).toLowerCase() : null;
}

function smxStoreBySlug(slug) {
  const target = smxSlugify(slug);
  return smxGetStores().find(store => store.slug === target) || null;
}

function smxStoreForOwner(email) {
  const target = String(email || "").toLowerCase();
  if (!target) return null;
  return smxGetStores().find(store => store.ownerEmail === target) || null;
}

function smxIsSlugAvailable(slug, ownerEmail) {
  const clean = smxSlugify(slug);
  if (!clean || clean.length < 3) return false;
  if (SMX_RESERVED_SLUGS.includes(clean)) return false;
  const owner = String(ownerEmail || "").toLowerCase();
  return !smxGetStores().some(store => store.slug === clean && store.ownerEmail !== owner);
}

/* Create or update the signed-in seller's store. */
function smxSaveMyStore(ownerEmail, data) {
  const owner = String(ownerEmail || "").toLowerCase();
  if (!owner) throw new Error("Please sign in to create a store.");

  const name = String(data.name || "").trim();
  const slug = smxSlugify(data.slug || name);

  if (name.length < 3) throw new Error("Store name must be at least 3 characters.");
  if (name.length > 50) throw new Error("Store name must be 50 characters or fewer.");
  if (slug.length < 3) throw new Error("Store link must be at least 3 letters or numbers.");
  if (!smxIsSlugAvailable(slug, owner)) throw new Error("That store link is taken or reserved. Try another.");

  const stores = smxGetStores();
  const existing = stores.find(store => store.ownerEmail === owner);
  const now = new Date().toISOString();

  const store = {
    id: existing ? existing.id : "STORE-" + Date.now().toString(36).toUpperCase(),
    ownerEmail: owner,
    name,
    slug,
    tagline: String(data.tagline || "").trim().slice(0, 80),
    description: String(data.description || "").trim().slice(0, 600),
    theme: SMX_STORE_THEMES[data.theme] ? data.theme : "gold",
    layout: ["grid", "showcase", "compact"].includes(data.layout) ? data.layout : "grid",
    published: Boolean(data.published),
    createdAt: existing ? existing.createdAt : now,
    updatedAt: now
  };

  const next = existing
    ? stores.map(item => (item.ownerEmail === owner ? store : item))
    : stores.concat(store);

  smxSaveStores(next);

  // Attach this seller's products to the store and keep name/link in sync.
  const products = smxStoreRead(SMX_STORE_KEYS.products, []);
  if (Array.isArray(products)) {
    smxStoreWrite(SMX_STORE_KEYS.products, products.map(product =>
      product.storeId === store.id || product.sellerEmail === owner
        ? { ...product, sellerEmail: owner, storeId: store.id, storeSlug: store.slug, storeName: store.name }
        : product
    ));
  }

  return store;
}

/* Delete only the signed-in owner's store and products attached to that store. */
function smxDeleteMyStore(ownerEmail) {
  const owner = String(ownerEmail || "").toLowerCase();
  if (!owner) throw new Error("Please sign in to delete your store.");

  const stores = smxGetStores();
  const store = stores.find(item => String(item.ownerEmail || "").toLowerCase() === owner);
  if (!store) throw new Error("No store was found for this account.");

  const products = smxStoreRead(SMX_STORE_KEYS.products, []);
  const remainingStores = stores.filter(item => String(item.ownerEmail || "").toLowerCase() !== owner);
  if (!smxSaveStores(remainingStores)) {
    throw new Error("The store could not be deleted. Please try again.");
  }

  if (Array.isArray(products)) {
    const remainingProducts = products.filter(product =>
      product.storeId !== store.id &&
      String(product.sellerEmail || "").toLowerCase() !== owner
    );
    if (!smxStoreWrite(SMX_STORE_KEYS.products, remainingProducts)) {
      // Restore the store list if product cleanup fails, avoiding a half-deleted state.
      smxSaveStores(stores);
      throw new Error("The products could not be removed, so the store deletion was cancelled. Please try again.");
    }
  }

  return store;
}

function smxStoreProducts(store) {
  if (!store) return [];
  const products = smxStoreRead(SMX_STORE_KEYS.products, []);
  return (Array.isArray(products) ? products : []).filter(product => product.storeId === store.id);
}

function smxStoreURL(slug) {
  const base = location.href.replace(/[^/]*([?#].*)?$/, "");
  return base + "store.html?s=" + encodeURIComponent(slug);
}

function smxProductURL(productId) {
  const base = location.href.replace(/[^/]*([?#].*)?$/, "");
  return base + "index.html?product=" + encodeURIComponent(productId) + "#market";
}

/* Share via the native share sheet, or copy the link. */
async function smxShareLink(url, title) {
  try {
    if (navigator.share) {
      await navigator.share({ title: title || "SM1THX", url });
      return "shared";
    }
  } catch (error) {
    if (error && error.name === "AbortError") return "cancelled";
  }
  try {
    await navigator.clipboard.writeText(url);
    return "copied";
  } catch (error) {
    window.prompt("Copy this link:", url);
    return "prompted";
  }
}
