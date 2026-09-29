"use strict";

/* =====================================================
   SM1THX 🛒
   APP.JS — STABLE MVP
   CART + MARKETPLACE + SELLER STUDIO + DEMO AI
===================================================== */

/* =====================================================
   DEFAULT PRODUCTS
===================================================== */

const DEFAULT_PRODUCTS = [
  {
    id: "default-1",
    name: "Samsung Galaxy S26 Ultra",
    price: 169999,
    category: "Electronics",
    description:
      "Premium flagship smartphone with advanced performance, camera technology and a modern design.",
    image:
      "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "default-2",
    name: "Smart Wireless Headphones",
    price: 4500,
    category: "Electronics",
    description:
      "Wireless headphones with a comfortable design and immersive sound.",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "default-3",
    name: "Minimal Desk Lamp",
    price: 2800,
    category: "Home",
    description:
      "Clean modern desk lamp designed for workspaces, bedrooms and study areas.",
    image:
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "default-4",
    name: "Everyday Travel Backpack",
    price: 3500,
    category: "Accessories",
    description:
      "Lightweight everyday backpack for school, work, travel and daily use.",
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "default-5",
    name: "Smart Watch",
    price: 6500,
    category: "Electronics",
    description:
      "Modern smartwatch for everyday activity tracking, notifications and convenience.",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "default-6",
    name: "Premium Sneakers",
    price: 7200,
    category: "Fashion",
    description:
      "Modern everyday sneakers combining comfort, style and versatility.",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80"
  }
];

/* =====================================================
   CATEGORIES
===================================================== */

const CATEGORIES = [
  "All",
  "Electronics",
  "Fashion",
  "Home",
  "Beauty",
  "Accessories"
];

/* =====================================================
   STORAGE
===================================================== */

const STORAGE = {
  products: "smithx_custom_products_v2",
  cart: "smithx_cart_v2",
  analytics: "smithx_analytics_v2",
  visitor: "smithx_daily_visitor_v2"
};

/* =====================================================
   STATE
===================================================== */

let currentCategory = "All";
let currentSearch = "";
let latestAIProduct = null;
let toastTimer = null;

/* =====================================================
   HELPERS
===================================================== */

function getElement(id) {
  return document.getElementById(id);
}

function formatKES(value) {
  const number = Number(value) || 0;
  return "KES " + number.toLocaleString("en-KE");
}

function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function safeJSONParse(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

/* =====================================================
   PRODUCTS
===================================================== */

function getCustomProducts() {
  const products = safeJSONParse(
    localStorage.getItem(STORAGE.products),
    []
  );

  return Array.isArray(products) ? products : [];
}

function saveCustomProducts(products) {
  localStorage.setItem(
    STORAGE.products,
    JSON.stringify(products)
  );
}

function getAllProducts() {
  return [
    ...DEFAULT_PRODUCTS,
    ...getCustomProducts()
  ];
}

function findProduct(productId) {
  return getAllProducts().find(
    product =>
      String(product.id) ===
      String(productId)
  );
}

/* =====================================================
   CART
===================================================== */

function normalizeCart() {
  const stored = safeJSONParse(
    localStorage.getItem(STORAGE.cart),
    []
  );

  if (!Array.isArray(stored)) {
    saveCart([]);
    return [];
  }

  const normalized = [];
  const seen = new Set();

  stored.forEach(item => {
    if (
      !item ||
      typeof item !== "object"
    ) {
      return;
    }

    const productId =
      item.productId ??
      item.id;

    if (!productId) {
      return;
    }

    const product =
      findProduct(productId);

    if (!product) {
      return;
    }

    const id =
      String(product.id);

    let quantity =
      Number.parseInt(
        item.quantity,
        10
      );

    if (!Number.isFinite(quantity)) {
      quantity = 1;
    }

    quantity = Math.max(
      1,
      quantity
    );

    if (seen.has(id)) {
      const existing =
        normalized.find(
          cartItem =>
            cartItem.productId === id
        );

      if (existing) {
        existing.quantity += quantity;
      }

      return;
    }

    normalized.push({
      productId: id,
      quantity
    });

    seen.add(id);
  });

  saveCart(normalized);

  return normalized;
}

function getCart() {
  return normalizeCart();
}

function saveCart(cart) {
  if (!Array.isArray(cart)) {
    cart = [];
  }

  localStorage.setItem(
    STORAGE.cart,
    JSON.stringify(cart)
  );
}

function clearCart() {
  saveCart([]);
}

/* =====================================================
   CART COUNT
===================================================== */

function getCartCount() {
  return getCart().reduce(
    (total, item) =>
      total +
      Math.max(
        0,
        Number(item.quantity) || 0
      ),
    0
  );
}

function updateCartCount() {
  const element =
    getElement("cartCount");

  if (element) {
    element.textContent =
      String(getCartCount());
  }
}

/* =====================================================
   CART TOTALS
===================================================== */

function calculateCartTotals() {
  const cart = getCart();

  let subtotal = 0;

  cart.forEach(item => {
    const product =
      findProduct(
        item.productId
      );

    if (!product) {
      return;
    }

    const quantity =
      Math.max(
        1,
        Number(item.quantity) || 1
      );

    subtotal +=
      Number(product.price || 0) *
      quantity;
  });

  return {
    subtotal,
    total: subtotal
  };
}

/* =====================================================
   ADD TO CART
===================================================== */

function addToCart(productId) {
  const product =
    findProduct(productId);

  if (!product) {
    showToast(
      "Product could not be added."
    );

    return;
  }

  const cart =
    getCart();

  const existing =
    cart.find(
      item =>
        String(item.productId) ===
        String(product.id)
    );

  if (existing) {
    existing.quantity =
      Math.max(
        1,
        Number(existing.quantity) || 1
      ) + 1;
  } else {
    cart.push({
      productId:
        String(product.id),
      quantity: 1
    });
  }

  saveCart(cart);

  updateCartUI();

  trackEvent(
    "cart_add",
    {
      productId:
        product.id,
      productName:
        product.name
    }
  );

  showToast(
    `${product.name} added to cart.`
  );
}

/* =====================================================
   REMOVE FROM CART
===================================================== */

function removeFromCart(productId) {
  const cart =
    getCart().filter(
      item =>
        String(item.productId) !==
        String(productId)
    );

  saveCart(cart);

  updateCartUI();

  showToast(
    "Item removed from cart."
  );
}

/* =====================================================
   CHANGE CART QUANTITY
===================================================== */

function changeCartQuantity(
  productId,
  change
) {
  const cart =
    getCart();

  const item =
    cart.find(
      cartItem =>
        String(
          cartItem.productId
        ) ===
        String(productId)
    );

  if (!item) {
    return;
  }

  const amount =
    Number(change) || 0;

  item.quantity =
    Math.max(
      0,
      Number(item.quantity) || 0
    ) + amount;

  if (item.quantity <= 0) {
    saveCart(
      cart.filter(
        cartItem =>
          String(
            cartItem.productId
          ) !==
          String(productId)
      )
    );
  } else {
    saveCart(cart);
  }

  updateCartUI();
}

/* =====================================================
   SET CART QUANTITY
===================================================== */

function setCartQuantity(
  productId,
  quantity
) {
  const cart =
    getCart();

  const item =
    cart.find(
      cartItem =>
        String(
          cartItem.productId
        ) ===
        String(productId)
    );

  if (!item) {
    return;
  }

  const newQuantity =
    Math.max(
      0,
      Number(quantity) || 0
    );

  if (newQuantity === 0) {
    saveCart(
      cart.filter(
        cartItem =>
          String(
            cartItem.productId
          ) !==
          String(productId)
      )
    );
  } else {
    item.quantity =
      newQuantity;

    saveCart(cart);
  }

  updateCartUI();
}

/* =====================================================
   CLEAR CART
===================================================== */

function clearShoppingCart() {
  clearCart();

  updateCartUI();

  showToast(
    "Cart cleared."
  );
}

/* =====================================================
   RENDER CART
===================================================== */

function renderCart() {
  const container =
    getElement("cartItems");

  if (!container) {
    return;
  }

  const cart =
    getCart();

  if (!cart.length) {
    container.innerHTML = `
      <div class="empty-state">
        <strong>Your cart is empty.</strong>
        <p>
          Add products from the marketplace
          to get started.
        </p>
      </div>
    `;

    const subtotal =
      getElement("cartSubtotal");

    const total =
      getElement("cartTotal");

    if (subtotal) {
      subtotal.textContent =
        formatKES(0);
    }

    if (total) {
      total.textContent =
        formatKES(0);
    }

    return;
  }

  container.innerHTML = "";

  cart.forEach(item => {
    const product =
      findProduct(
        item.productId
      );

    if (!product) {
      return;
    }

    const quantity =
      Math.max(
        1,
        Number(item.quantity) || 1
      );

    const itemElement =
      document.createElement(
        "div"
      );

    itemElement.className =
      "cart-item";

    const safeId =
      escapeHTML(product.id);

    itemElement.innerHTML = `
      <div class="cart-item-image">
        <img
          src="${escapeHTML(
            product.image || ""
          )}"
          alt="${escapeHTML(
            product.name
          )}"
        >
      </div>

      <div class="cart-item-info">

        <strong>
          ${escapeHTML(
            product.name
          )}
        </strong>

        <span>
          ${formatKES(
            product.price
          )}
        </span>

        <div class="cart-item-controls">

          <button
            type="button"
            onclick="changeCartQuantity('${safeId}', -1)"
            aria-label="Decrease quantity"
          >
            −
          </button>

          <span>
            ${quantity}
          </span>

          <button
            type="button"
            onclick="changeCartQuantity('${safeId}', 1)"
            aria-label="Increase quantity"
          >
            +
          </button>

          <button
            type="button"
            onclick="removeFromCart('${safeId}')"
          >
            Remove
          </button>

        </div>

      </div>
    `;

    container.appendChild(
      itemElement
    );
  });

  const totals =
    calculateCartTotals();

  const subtotal =
    getElement(
      "cartSubtotal"
    );

  const total =
    getElement(
      "cartTotal"
    );

  if (subtotal) {
    subtotal.textContent =
      formatKES(
        totals.subtotal
      );
  }

  if (total) {
    total.textContent =
      formatKES(
        totals.total
      );
  }
}

/* =====================================================
   UPDATE CART UI
===================================================== */

function updateCartUI() {
  updateCartCount();
  renderCart();
}

/* =====================================================
   OPEN / CLOSE CART
===================================================== */

function openCart() {
  const panel =
    getElement("cartPanel");

  if (!panel) {
    return;
  }

  panel.classList.add(
    "open"
  );

  panel.setAttribute(
    "aria-hidden",
    "false"
  );

  renderCart();
}

function closeCart() {
  const panel =
    getElement("cartPanel");

  if (!panel) {
    return;
  }

  panel.classList.remove(
    "open"
  );

  panel.setAttribute(
    "aria-hidden",
    "true"
  );
}

/* =====================================================
   ANALYTICS
===================================================== */

function getAnalytics() {
  const analytics =
    safeJSONParse(
      localStorage.getItem(
        STORAGE.analytics
      ),
      null
    );

  if (
    !analytics ||
    typeof analytics !== "object"
  ) {
    return {
      orders: 0,
      revenue: 0,
      events: []
    };
  }

  return {
    orders:
      Number(
        analytics.orders
      ) || 0,

    revenue:
      Number(
        analytics.revenue
      ) || 0,

    events:
      Array.isArray(
        analytics.events
      )
        ? analytics.events
        : []
  };
}

function saveAnalytics(
  analytics
) {
  localStorage.setItem(
    STORAGE.analytics,
    JSON.stringify(
      analytics
    )
  );
}

function trackEvent(
  eventName,
  data = {}
) {
  const analytics =
    getAnalytics();

  analytics.events.push({
    event: eventName,
    data,
    timestamp:
      new Date().toISOString()
  });

  if (
    analytics.events.length >
    500
  ) {
    analytics.events =
      analytics.events.slice(
        -500
      );
  }

  saveAnalytics(
    analytics
  );

  updateDashboard();
}

/* =====================================================
   DAILY VISITOR
===================================================== */

function trackDailyVisitor() {
  const today =
    new Date()
      .toISOString()
      .slice(0, 10);

  const saved =
    safeJSONParse(
      localStorage.getItem(
        STORAGE.visitor
      ),
      null
    );

  if (
    !saved ||
    saved.date !== today
  ) {
    localStorage.setItem(
      STORAGE.visitor,
      JSON.stringify({
        date: today,
        count: 1
      })
    );
  } else if (
    !sessionStorage.getItem(
      "smithx_visitor_counted"
    )
  ) {
    saved.count =
      Number(
        saved.count || 0
      ) + 1;

    localStorage.setItem(
      STORAGE.visitor,
      JSON.stringify(
        saved
      )
    );
  }

  sessionStorage.setItem(
    "smithx_visitor_counted",
    "true"
  );

  updateDashboard();
}

/* =====================================================
   CATEGORIES
===================================================== */

function setupCategories() {
  const container =
    getElement(
      "categoryFilters"
    );

  if (!container) {
    return;
  }

  container.innerHTML = "";

  CATEGORIES.forEach(
    category => {
      const button =
        document.createElement(
          "button"
        );

      button.type =
        "button";

      button.className =
        "category-filter";

      if (
        category ===
        currentCategory
      ) {
        button.classList.add(
          "active"
        );
      }

      button.textContent =
        category;

      button.addEventListener(
        "click",
        () => {
          currentCategory =
            category;

          setupCategories();

          renderProducts();
        }
      );

      container.appendChild(
        button
      );
    }
  );
}

/* =====================================================
   SELLER CATEGORY
===================================================== */

function setupSellerCategory() {
  const select =
    getElement(
      "productCategory"
    );

  if (!select) {
    return;
  }

  select.innerHTML = "";

  CATEGORIES
    .filter(
      category =>
        category !== "All"
    )
    .forEach(
      category => {
        const option =
          document.createElement(
            "option"
          );

        option.value =
          category;

        option.textContent =
          category;

        select.appendChild(
          option
        );
      }
    );
}

/* =====================================================
   RENDER PRODUCTS
===================================================== */

function renderProducts() {
  const grid =
    getElement(
      "productsGrid"
    );

  if (!grid) {
    return;
  }

  const search =
    currentSearch
      .trim()
      .toLowerCase();

  let products =
    getAllProducts();

  if (
    currentCategory !==
    "All"
  ) {
    products =
      products.filter(
        product =>
          product.category ===
          currentCategory
      );
  }

  if (search) {
    products =
      products.filter(
        product => {
          const text = [
            product.name,
            product.description,
            product.category
          ]
            .join(" ")
            .toLowerCase();

          return text.includes(
            search
          );
        }
      );
  }

  if (!products.length) {
    grid.innerHTML = `
      <div class="empty-state">
        <strong>No products found.</strong>
        <p>
          Try another search or category.
        </p>
      </div>
    `;

    return;
  }

  grid.innerHTML =
    products
      .map(
        product => {
          const safeId =
            escapeHTML(
              product.id
            );

          return `
            <article class="product-card">

              <button
                type="button"
                class="product
