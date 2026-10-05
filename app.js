"use strict";

/* =====================================================
   SM1THX 🛒
   APP.JS — MVP
   CART + MARKETPLACE + SELLER STUDIO
   + AI ASSISTANT + ORDERS
   + ORDER TRACKING
   + CUSTOMER MY ORDERS
   + AUTOMATIC 2-MINUTE DEMO TRACKING
   + DEMO ACCOUNT / PROFILE
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
  visitor: "smithx_daily_visitor_v2",
  orders: "smithx_orders_v2",
  selectedOrder: "smithx_selected_order",
  lastDemoOrder: "smithx_last_demo_order",

  /* NEW ACCOUNT STORAGE */
  user: "smithx_demo_user_v1",
  session: "smithx_demo_session_v1"
};


/* =====================================================
   SELLER ORDER STATUSES
===================================================== */

const ORDER_STATUSES = [
  "Pending",
  "Confirmed",
  "Shipped",
  "Delivered"
];


/* =====================================================
   CUSTOMER TRACKING
===================================================== */

const TRACKING_STEPS = [
  {
    key: "placed",
    label: "Order placed",
    description:
      "Your order has been received."
  },
  {
    key: "confirmed",
    label: "Order confirmed",
    description:
      "The seller has confirmed your order."
  },
  {
    key: "packed",
    label: "Order packed",
    description:
      "Your order has been prepared for shipment."
  },
  {
    key: "shipped",
    label: "Shipped",
    description:
      "Your package is on its way."
  },
  {
    key: "out_for_delivery",
    label: "Out for delivery",
    description:
      "Your package is approaching its destination."
  },
  {
    key: "delivered",
    label: "Delivered",
    description:
      "Your order has been delivered."
  }
];


/* =====================================================
   AUTOMATIC DEMO TRACKING
   DO NOT CHANGE
===================================================== */

const DEMO_TRACKING = {
  storagePrefix:
    "smithx_tracking_demo_",

  duration:
    120000,

  interval:
    1000,

  stages: [
    {
      key: "placed",
      status: "Pending",
      step: 0,
      after: 0,
      label: "Order placed"
    },

    {
      key: "confirmed",
      status: "Confirmed",
      step: 1,
      after: 30000,
      label: "Order confirmed"
    },

    {
      key: "shipped",
      status: "Shipped",
      step: 3,
      after: 60000,
      label: "Shipped"
    },

    {
      key: "out_for_delivery",
      status: "Shipped",
      step: 4,
      after: 90000,
      label: "Out for delivery"
    },

    {
      key: "delivered",
      status: "Delivered",
      step: 5,
      after: 120000,
      label: "Delivered"
    }
  ]
};


/* =====================================================
   STATE
===================================================== */

let currentCategory = "All";
let currentSearch = "";
let latestAIProduct = null;
let toastTimer = null;
let demoTrackingTimers = {};


/* =====================================================
   AI BACKEND
===================================================== */

const AI_API_URL =
  "https://smithx-ai-backend.onrender.com/api/generate-product";


/* =====================================================
   HELPERS
===================================================== */

function getElement(id) {
  return document.getElementById(id);
}


function formatKES(value) {
  const number = Number(value) || 0;

  return (
    "KES " +
    number.toLocaleString("en-KE")
  );
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


function formatDate(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return date.toLocaleString("en-KE", {
    dateStyle: "medium",
    timeStyle: "short"
  });
}


function normalizeOrderStatus(status) {
  return String(status || "Pending")
    .trim()
    .toLowerCase();
}


function getTrackingStorageKey(orderId) {
  return (
    DEMO_TRACKING.storagePrefix +
    String(orderId || "").trim()
  );
}


function safeStorageSet(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.error(
      "SM1THX storage error:",
      error
    );
  }
}


function safeStorageGet(key) {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.error(
      "SM1THX storage read error:",
      error
    );

    return null;
  }
}


/* =====================================================
   PRODUCTS
===================================================== */

function getCustomProducts() {
  const products = safeJSONParse(
    localStorage.getItem(
      STORAGE.products
    ),
    []
  );

  return Array.isArray(products)
    ? products
    : [];
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
    if (!item || typeof item !== "object") {
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

    quantity =
      Math.max(1, quantity);

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


function calculateCartTotals() {
  const cart = getCart();

  let subtotal = 0;

  cart.forEach(item => {
    const product =
      findProduct(item.productId);

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
      productId: product.id,
      productName: product.name
    }
  );

  showToast(
    `${product.name} added to cart.`
  );
}


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


function clearShoppingCart() {
  clearCart();
  updateCartUI();

  showToast(
    "Cart cleared."
  );
}


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
      findProduct(item.productId);

    if (!product) {
      return;
    }

    const quantity =
      Math.max(
        1,
        Number(item.quantity) || 1
      );

    const itemElement =
      document.createElement("div");

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
          alt="${escapeHTML(product.name)}"
        >
      </div>

      <div class="cart-item-info">
        <strong>
          ${escapeHTML(product.name)}
        </strong>

        <span>
          ${formatKES(product.price)}
        </span>

        <div class="cart-item-controls">

          <button
            type="button"
            onclick="changeCartQuantity('${safeId}', -1)"
          >
            −
          </button>

          <span>
            ${quantity}
          </span>

          <button
            type="button"
            onclick="changeCartQuantity('${safeId}', 1)"
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

    container.appendChild(itemElement);
  });

  const totals =
    calculateCartTotals();

  const subtotal =
    getElement("cartSubtotal");

  const total =
    getElement("cartTotal");

  if (subtotal) {
    subtotal.textContent =
      formatKES(totals.subtotal);
  }

  if (total) {
    total.textContent =
      formatKES(totals.total);
  }
}


function updateCartUI() {
  updateCartCount();
  renderCart();
}


function openCart() {
  const panel =
    getElement("cartPanel");

  if (!panel) {
    return;
  }

  panel.classList.add("open");

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

  panel.classList.remove("open");

  panel.setAttribute(
    "aria-hidden",
    "true"
  );
}


/* =====================================================
   ORDERS
===================================================== */

function getOrders() {
  const orders =
    safeJSONParse(
      localStorage.getItem(
        STORAGE.orders
      ),
      []
    );

  return Array.isArray(orders)
    ? orders
    : [];
}


function saveOrders(orders) {
  if (!Array.isArray(orders)) {
    orders = [];
  }

  localStorage.setItem(
    STORAGE.orders,
    JSON.stringify(orders)
  );
}


function generateOrderId() {
  const timestamp =
    Date.now()
      .toString(36)
      .toUpperCase();

  const random =
    Math.random()
      .toString(36)
      .substring(2, 7)
      .toUpperCase();

  return (
    "SMX-" +
    timestamp +
    "-" +
    random
  );
}


function getOrder(orderId) {
  return getOrders().find(
    order =>
      String(order.orderId)
        .toUpperCase() ===
      String(orderId)
        .trim()
        .toUpperCase()
  );
}


function openCustomerOrderTracking(orderId) {
  if (!orderId) {
    return;
  }

  const cleanOrderId =
    String(orderId).trim();

  if (!cleanOrderId) {
    return;
  }

  const order =
    getOrder(cleanOrderId);

  if (!order) {
    showToast(
      "Order could not be found."
    );

    return;
  }

  localStorage.setItem(
    STORAGE.selectedOrder,
    order.orderId
  );

  window.location.href =
    "my-orders.html?order=" +
    encodeURIComponent(
      order.orderId
    );
}


function openCustomerOrders() {
  window.location.href =
    "my-orders.html";
}


function getTrackingStepForOrder(order) {
  if (!order) {
    return 0;
  }

  switch (
    normalizeOrderStatus(
      order.status
    )
  ) {
    case "pending":
      return 0;

    case "confirmed":
      return 1;

    case "shipped":
      return 3;

    case "delivered":
      return 5;

    default:
      return 0;
  }
}


function getTrackingLocation(order) {
  if (!order) {
    return "Awaiting order information";
  }

  switch (
    normalizeOrderStatus(
      order.status
    )
  ) {
    case "pending":
      return "Order received";

    case "confirmed":
      return "Seller processing";

    case "shipped":
      return "In transit";

    case "delivered":
      return "Delivered";

    default:
      return "Processing";
  }
}


function getEstimatedDelivery(order) {
  if (!order) {
    return "Not available";
  }

  if (
    normalizeOrderStatus(
      order.status
    ) === "delivered"
  ) {
    return "Delivered";
  }

  const created =
    new Date(order.createdAt);

  if (Number.isNaN(created.getTime())) {
    return "Calculating...";
  }

  const estimated =
    new Date(created);

  estimated.setDate(
    estimated.getDate() + 3
  );

  return estimated.toLocaleDateString(
    "en-KE",
    {
      day: "numeric",
      month: "short",
      year: "numeric"
    }
  );
}


function createOrderFromCart() {
  const cart =
    getCart();

  if (!cart.length) {
    return null;
  }

  const items = [];

  cart.forEach(item => {
    const product =
      findProduct(item.productId);

    if (!product) {
      return;
    }

    const quantity =
      Math.max(
        1,
        Number(item.quantity) || 1
      );

    items.push({
      productId:
        String(product.id),

      name:
        product.name,

      price:
        Number(product.price) || 0,

      quantity,

      image:
        product.image || "",

      category:
        product.category || ""
    });
  });

  if (!items.length) {
    return null;
  }

  const subtotal =
    items.reduce(
      (total, item) =>
        total +
        item.price *
        item.quantity,
      0
    );

  const now =
    new Date().toISOString();

  const user =
    getCurrentUser();

  const order = {
    orderId:
      generateOrderId(),

    status:
      "Pending",

    items,

    subtotal,

    total:
      subtotal,

    currency:
      "KES",

    customer: user
      ? {
          type: "Demo Customer",
          name: user.name,
          email: user.email
        }
      : {
          type:
            "Demo Customer"
        },

    createdAt:
      now,

    updatedAt:
      now,

    tracking: {
      mode:
        "demo",

      startedAt:
        now,

      currentStep:
        0,

      currentStage:
        "placed",

      completed:
        false
    }
  };

  const orders =
    getOrders();

  orders.unshift(order);

  saveOrders(orders);

  initializeDemoTracking(
    order
  );

  return order;
}


function updateOrderStatus(
  orderId,
  newStatus
) {
  if (
    !ORDER_STATUSES.includes(
      newStatus
    )
  ) {
    showToast(
      "Invalid order status."
    );

    return;
  }

  const orders =
    getOrders();

  const order =
    orders.find(
      item =>
        String(item.orderId) ===
        String(orderId)
    );

  if (!order) {
    showToast(
      "Order could not be found."
    );

    return;
  }

  const oldStatus =
    order.status;

  order.status =
    newStatus;

  order.updatedAt =
    new Date().toISOString();

  if (
    newStatus ===
    "Delivered"
  ) {
    stopDemoTracking(
      order.orderId
    );

    order.tracking = {
      ...(order.tracking || {}),

      mode:
        "seller",

      currentStep:
        5,

      currentStage:
        "delivered",

      completed:
        true
    };

    safeStorageSet(
      getTrackingStorageKey(
        order.orderId
      ),
      JSON.stringify({
        orderId:
          order.orderId,

        startedAt:
          order.tracking.startedAt ||
          order.createdAt,

        completed:
          true,

        currentStage:
          "delivered",

        currentStep:
          5,

        completedAt:
          new Date().toISOString()
      })
    );
  }

  saveOrders(orders);

  trackEvent(
    "order_status_updated",
    {
      orderId:
        order.orderId,

      previousStatus:
        oldStatus,

      status:
        newStatus
    }
  );

  renderOrders();
  renderOrderTracker();

  showToast(
    `Order ${order.orderId} is now ${newStatus}.`
  );
}


function getOrderStatusClass(status) {
  return String(
    status || "Pending"
  )
    .toLowerCase()
    .replace(
      /\s+/g,
      "-"
    );
}


function renderOrders() {
  const container =
    getElement("ordersList");

  if (!container) {
    return;
  }

  const orders =
    getOrders();

  if (!orders.length) {
    container.innerHTML = `
      <div class="empty-state">
        <strong>No orders yet.</strong>
        <p>
          Orders created through Demo Checkout
          will appear here.
        </p>
      </div>
    `;

    return;
  }

  container.innerHTML =
    orders
      .map(order => {
        const safeOrderId =
          escapeHTML(order.orderId);

        const itemsHTML =
          Array.isArray(order.items)
            ? order.items
                .map(
                  item => `
                    <div class="order-product">

                      <div class="order-product-image">
                        <img
                          src="${escapeHTML(
                            item.image || ""
                          )}"
                          alt="${escapeHTML(
                            item.name
                          )}"
                        >
                      </div>

                      <div class="order-product-info">
                        <strong>
                          ${escapeHTML(
                            item.name
                          )}
                        </strong>

                        <span>
                          ${Number(
                            item.quantity
                          ) || 1}
                          ×
                          ${formatKES(
                            item.price
                          )}
                        </span>
                      </div>

                    </div>
                  `
                )
                .join("")
            : "";

        const statusClass =
          getOrderStatusClass(
            order.status
          );

        const statusOptions =
          ORDER_STATUSES
            .map(
              status => `
                <option
                  value="${escapeHTML(status)}"
                  ${
                    status === order.status
                      ? "selected"
                      : ""
                  }
                >
                  ${escapeHTML(status)}
                </option>
              `
            )
            .join("");

        return `
          <article class="order-card">

            <div class="order-card-header">

              <div>
                <span class="order-label">
                  ORDER
                </span>

                <strong>
                  ${safeOrderId}
                </strong>
              </div>

              <span
                class="order-status ${statusClass}"
              >
                ${escapeHTML(
                  order.status
                )}
              </span>

            </div>

            <div class="order-date">
              ${escapeHTML(
                formatDate(
                  order.createdAt
                )
              )}
            </div>

            <div class="order-products">
              ${itemsHTML}
            </div>

            <div class="order-card-footer">

              <strong>
                ${formatKES(
                  order.total
                )}
              </strong>

              <div class="order-status-control">

                <label
                  for="status-${safeOrderId}"
                >
                  Status
                </label>

                <select
                  id="status-${safeOrderId}"
                  onchange="updateOrderStatus('${safeOrderId}', this.value)"
                >
                  ${statusOptions}
                </select>

              </div>

            </div>

            <button
              type="button"
              class="secondary-button track-order-inline-button"
              onclick="trackOrder('${safeOrderId}')"
            >
              Track this order
            </button>

          </article>
        `;
      })
      .join("");
}


/* =====================================================
   TRACKING
   EXISTING SYSTEM PRESERVED
===================================================== */

function createTrackerSection() {
  if (
    getElement(
      "smithxOrderTracker"
    )
  ) {
    return;
  }

  const dashboard =
    getElement("dashboard");

  if (!dashboard) {
    return;
  }

  const section =
    document.createElement("section");

  section.id =
    "smithxOrderTracker";

  section.className =
    "smithx-tracker-section";

  section.innerHTML = `
    <div class="tracker-header">
      <div>
        <p class="section-eyebrow">
          SM1THX LOGISTICS
        </p>

        <h3>
          Track Your Order
        </h3>

        <p class="muted">
          Enter your SMX order number to see
          the latest delivery status.
        </p>
      </div>
    </div>

    <div class="tracker-search">

      <input
        id="orderTrackingInput"
        type="text"
        placeholder="Enter order number e.g. SMX-..."
        autocomplete="off"
      >

      <button
        type="button"
        class="primary-button"
        onclick="trackOrderFromInput()"
      >
        Track Order
      </button>

    </div>

    <div
      id="orderTrackerResult"
      class="order-tracker-result"
    >
      <div class="tracker-empty">

        <strong>
          Ready to track
        </strong>

        <p>
          Enter an SMX order number above.
        </p>

      </div>
    </div>
  `;

  dashboard.appendChild(section);
}


function trackOrderFromInput() {
  const input =
    getElement(
      "orderTrackingInput"
    );

  if (!input) {
    return;
  }

  const orderId =
    input.value.trim();

  if (!orderId) {
    showToast(
      "Enter an order number first."
    );

    input.focus();

    return;
  }

  trackOrder(orderId);
}


function trackOrder(orderId) {
  createTrackerSection();

  const input =
    getElement(
      "orderTrackingInput"
    );

  if (input) {
    input.value =
      String(orderId || "");
  }

  const order =
    getOrder(orderId);

  if (!order) {
    renderTrackerNotFound(
      orderId
    );

    scrollToSection(
      "smithxOrderTracker"
    );

    return;
  }

  initializeDemoTracking(
    order
  );

  renderOrderTracker(order);

  scrollToSection(
    "smithxOrderTracker"
  );

  trackEvent(
    "order_tracking_viewed",
    {
      orderId:
        order.orderId
    }
  );
}


function renderTrackerNotFound(
  orderId
) {
  const result =
    getElement(
      "orderTrackerResult"
    );

  if (!result) {
    return;
  }

  result.innerHTML = `
    <div class="tracker-empty">

      <div class="tracker-error-icon">
        !
      </div>

      <strong>
        Order not found
      </strong>

      <p>
        We couldn't find
        <strong>
          ${escapeHTML(orderId)}
        </strong>
        in this SM1THX demo.
      </p>

      <small>
        Check the order number and try again.
      </small>

    </div>
  `;
}


function renderOrderTracker(
  providedOrder = null
) {
  createTrackerSection();

  const result =
    getElement(
      "orderTrackerResult"
    );

  if (!result) {
    return;
  }

  const order =
    providedOrder;

  if (!order) {
    result.innerHTML = `
      <div class="tracker-empty">

        <strong>
          Ready to track
        </strong>

        <p>
          Enter an SMX order number above.
        </p>

      </div>
    `;

    return;
  }

  const currentStep =
    getTrackingStepForOrder(order);

  const location =
    getTrackingLocation(order);

  const estimated =
    getEstimatedDelivery(order);

  const progress =
    Math.round(
      (
        currentStep /
        (TRACKING_STEPS.length - 1)
      ) * 100
    );

  const timeline =
    TRACKING_STEPS
      .map(
        (step, index) => {

          const complete =
            index <= currentStep;

          const active =
            index === currentStep;

          let dateText = "";

          if (complete) {

            if (index === 0) {

              dateText =
                formatDate(
                  order.createdAt
                );

            } else if (
              index === currentStep
            ) {

              dateText =
                formatDate(
                  order.updatedAt ||
                  order.createdAt
                );

            } else {

              dateText =
                "Completed";
            }
          }

          return `
            <div
              class="
                tracker-step
                ${complete ? "complete" : ""}
                ${active ? "active" : ""}
              "
            >

              <div class="tracker-step-marker">
                ${
                  complete
                    ? "✓"
                    : index + 1
                }
              </div>

              <div class="tracker-step-content">

                <strong>
                  ${escapeHTML(
                    step.label
                  )}
                </strong>

                <p>
                  ${escapeHTML(
                    step.description
                  )}
                </p>

                ${
                  dateText
                    ? `
                      <small>
                        ${escapeHTML(
                          dateText
                        )}
                      </small>
                    `
                    : ""
                }

              </div>

            </div>
          `;
        }
      )
      .join("");

  const itemHTML =
    Array.isArray(order.items)
      ? order.items
          .map(
            item => `
              <div class="tracker-product">

                <div class="tracker-product-image">

                  <img
                    src="${escapeHTML(
                      item.image || ""
                    )}"
                    alt="${escapeHTML(
                      item.name
                    )}"
                  >

                </div>

                <div>

                  <strong>
                    ${escapeHTML(
                      item.name
                    )}
                  </strong>

                  <span>
                    Qty:
                    ${Number(
                      item.quantity
                    ) || 1}
                  </span>

                </div>

              </div>
            `
          )
          .join("")
      : "";

  const demoBadge =
    order.tracking?.mode ===
      "demo"
      ? `
        <span
          class="tracker-demo-badge"
        >
          DEMO TRACKING
        </span>
      `
      : "";

  result.innerHTML = `
    <div class="tracker-card">

      <div class="tracker-card-top">

        <div>

          <span class="tracker-label">
            ORDER NUMBER
          </span>

          <h4>
            ${escapeHTML(
              order.orderId
            )}
          </h4>

          <p>
            Placed
            ${escapeHTML(
              formatDate(
                order.createdAt
              )
            )}
          </p>

          ${demoBadge}

        </div>

        <span
          class="
            order-status
            ${getOrderStatusClass(
              order.status
            )}
          "
        >
          ${escapeHTML(
            order.status
          )}
        </span>

      </div>

      <div class="tracker-summary">

        <div class="tracker-summary-item">

          <span>
            CURRENT LOCATION
          </span>

          <strong>
            ${escapeHTML(
              location
            )}
          </strong>

        </div>

        <div class="tracker-summary-item">

          <span>
            ESTIMATED DELIVERY
          </span>

          <strong>
            ${escapeHTML(
              estimated
            )}
          </strong>

        </div>

        <div class="tracker-summary-item">

          <span>
            ORDER TOTAL
          </span>

          <strong>
            ${formatKES(
              order.total
            )}
          </strong>

        </div>

      </div>

      <div class="tracker-progress">

        <div
          class="tracker-progress-bar"
          style="width:${progress}%"
        ></div>

      </div>

      <div class="tracker-timeline">
        ${timeline}
      </div>

      <div class="tracker-items">

        <div class="tracker-items-header">

          <strong>
            Items in this order
          </strong>

        </div>

        ${itemHTML}

      </div>

    </div>
  `;
}


/* =====================================================
   DEMO TRACKING STORAGE
===================================================== */

function getDemoTrackingState(orderId) {
  if (!orderId) {
    return null;
  }

  const stored =
    safeJSONParse(
      safeStorageGet(
        getTrackingStorageKey(
          orderId
        )
      ),
      null
    );

  if (
    !stored ||
    typeof stored !== "object"
  ) {
    return null;
  }

  return stored;
}


function saveDemoTrackingState(
  orderId,
  state
) {
  if (!orderId || !state) {
    return;
  }

  safeStorageSet(
    getTrackingStorageKey(
      orderId
    ),
    JSON.stringify(state)
  );
}


function calculateDemoStage(elapsed) {
  let selected =
    DEMO_TRACKING.stages[0];

  DEMO_TRACKING.stages.forEach(
    stage => {
      if (
        elapsed >=
        stage.after
      ) {
        selected =
          stage;
      }
    }
  );

  return selected;
}


function updateDemoOrder(
  orderId,
  stage
) {
  const orders =
    getOrders();

  const order =
    orders.find(
      item =>
        String(item.orderId) ===
        String(orderId)
    );

  if (!order) {
    return null;
  }

  const now =
    new Date().toISOString();

  const previousStatus =
    order.status;

  order.tracking = {
    ...(order.tracking || {}),

    mode:
      "demo",

    currentStep:
      stage.step,

    currentStage:
      stage.key,

    currentLabel:
      stage.label,

    completed:
      stage.key ===
      "delivered"
  };

  order.status =
    stage.status;

  order.updatedAt =
    now;

  if (
    stage.key ===
    "delivered"
  ) {
    order.status =
      "Delivered";

    order.tracking.completed =
      true;

    order.tracking.completedAt =
      now;
  }

  saveOrders(orders);

  saveDemoTrackingState(
    order.orderId,
    {
      orderId:
        order.orderId,

      startedAt:
        order.tracking.startedAt ||
        order.createdAt,

      currentStep:
        stage.step,

      currentStage:
        stage.key,

      currentLabel:
        stage.label,

      status:
        order.status,

      completed:
        stage.key ===
        "delivered",

      updatedAt:
        now,

      completedAt:
        stage.key ===
        "delivered"
          ? now
          : null
    }
  );

  if (
    previousStatus !==
    order.status
  ) {
    trackEvent(
      "demo_order_status_updated",
      {
        orderId:
          order.orderId,

        previousStatus,

        status:
          order.status,

        trackingStage:
          stage.key
      }
    );
  }

  return order;
}


function runDemoTrackingTick(orderId) {
  const order =
    getOrder(orderId);

  if (!order) {
    stopDemoTracking(orderId);
    return;
  }

  let state =
    getDemoTrackingState(
      orderId
    );

  if (!state) {

    const startedAt =
      Date.now();

    state = {
      orderId:
        order.orderId,

      startedAt,

      currentStep:
        0,

      currentStage:
        "placed",

      currentLabel:
        "Order placed",

      status:
        "Pending",

      completed:
        false
    };

    saveDemoTrackingState(
      orderId,
      state
    );
  }

  const startedAt =
    Number(
      state.startedAt
    );

  if (!Number.isFinite(startedAt)) {
    state.startedAt =
      Date.now();

    saveDemoTrackingState(
      orderId,
      state
    );

    return;
  }

  const elapsed =
    Date.now() -
    startedAt;

  const stage =
    calculateDemoStage(
      elapsed
    );

  if (
    Number(state.currentStep) !==
      stage.step ||
    state.currentStage !==
      stage.key
  ) {

    const updatedOrder =
      updateDemoOrder(
        orderId,
        stage
      );

    if (updatedOrder) {
      renderOrders();
      renderOrderTracker(
        updatedOrder
      );
    }

  } else if (
    stage.key ===
    "delivered"
  ) {

    if (
      normalizeOrderStatus(
        order.status
      ) !==
      "delivered"
    ) {

      const updatedOrder =
        updateDemoOrder(
          orderId,
          stage
        );

      renderOrders();

      renderOrderTracker(
        updatedOrder
      );

    } else {

      stopDemoTracking(
        orderId
      );
    }
  }
}


function startDemoTracking(order) {
  if (!order || !order.orderId) {
    return;
  }

  const orderId =
    String(order.orderId);

  if (
    normalizeOrderStatus(
      order.status
    ) ===
    "delivered" &&
    order.tracking?.completed
  ) {
    return;
  }

  let state =
    getDemoTrackingState(
      orderId
    );

  if (!state) {

    state = {
      orderId,

      startedAt:
        Date.now(),

      currentStep:
        0,

      currentStage:
        "placed",

      currentLabel:
        "Order placed",

      status:
        "Pending",

      completed:
        false,

      updatedAt:
        new Date().toISOString()
    };

    saveDemoTrackingState(
      orderId,
      state
    );

    const orders =
      getOrders();

    const savedOrder =
      orders.find(
        item =>
          String(item.orderId) ===
          orderId
      );

    if (savedOrder) {

      savedOrder.tracking = {
        ...(savedOrder.tracking || {}),

        mode:
          "demo",

        startedAt:
          new Date().toISOString(),

        currentStep:
          0,

        currentStage:
          "placed",

        currentLabel:
          "Order placed",

        completed:
          false
      };

      saveOrders(orders);
    }
  }

  stopDemoTracking(
    orderId
  );

  runDemoTrackingTick(
    orderId
  );

  demoTrackingTimers[orderId] =
    setInterval(
      () => {

        const current =
          getOrder(
            orderId
          );

        if (!current) {
          stopDemoTracking(
            orderId
          );

          return;
        }

        if (
          current.tracking?.completed
        ) {
          stopDemoTracking(
            orderId
          );

          return;
        }

        runDemoTrackingTick(
          orderId
        );

      },
      DEMO_TRACKING.interval
    );
}


function initializeDemoTracking(order) {
  if (!order) {
    return;
  }

  const state =
    getDemoTrackingState(
      order.orderId
    );

  if (
    state?.completed ||
    order.tracking?.completed
  ) {
    return;
  }

  startDemoTracking(
    order
  );
}


function stopDemoTracking(orderId) {
  if (!orderId) {
    return;
  }

  const timer =
    demoTrackingTimers[
      String(orderId)
    ];

  if (timer) {
    clearInterval(timer);

    delete demoTrackingTimers[
      String(orderId)
    ];
  }
}


function resumeDemoTracking() {
  const orders =
    getOrders();

  orders.forEach(
    order => {

      if (!order?.orderId) {
        return;
      }

      const state =
        getDemoTrackingState(
          order.orderId
        );

      if (
        state?.completed ||
        order.tracking?.completed
      ) {
        return;
      }

      if (
        state ||
        order.tracking?.mode ===
          "demo"
      ) {
        startDemoTracking(
          order
        );
      }
    }
  );
}


function refreshTrackerForOrder(
  orderId
) {
  const order =
    getOrder(orderId);

  if (!order) {
    return;
  }

  initializeDemoTracking(
    order
  );

  renderOrderTracker(
    order
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


function saveAnalytics(analytics) {
  localStorage.setItem(
    STORAGE.analytics,
    JSON.stringify(analytics)
  );
}


function trackEvent(
  eventName,
  data = {}
) {
  const analytics =
    getAnalytics();

  analytics.events.push({
    event:
      eventName,

    data,

    timestamp:
      new Date().toISOString()
  });

  if (
    analytics.events.length >
    500
  ) {
    analytics.events =
      analytics.events.slice(-500);
  }

  saveAnalytics(
    analytics
  );

  updateDashboard();
}


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
        date:
          today,

        count:
          1
      })
    );
  } else if (
    !sessionStorage.getItem(
      "smithx_visitor_counted"
    )
  ) {
    saved.count =
      Number(saved.count || 0) + 1;

    localStorage.setItem(
      STORAGE.visitor,
      JSON.stringify(saved)
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
   PRODUCTS
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

        <strong>
          No products found.
        </strong>

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
                class="product-image-button"
                onclick="openProductModal('${safeId}')"
              >

                <img
                  src="${escapeHTML(
                    product.image || ""
                  )}"
                  alt="${escapeHTML(
                    product.name
                  )}"
                  loading="lazy"
                >

              </button>

              <div class="product-card-body">

                <span class="product-category">
                  ${escapeHTML(
                    product.category
                  )}
                </span>

                <h3>
                  ${escapeHTML(
                    product.name
                  )}
                </h3>

                <p>
                  ${escapeHTML(
                    product.description
                  )}
                </p>

                <div class="product-card-bottom">

                  <strong>
                    ${formatKES(
                      product.price
                    )}
                  </strong>

                  <button
                    type="button"
                    class="primary-button small-button"
                    onclick="addToCart('${safeId}')"
                  >
                    Add to cart
                  </button>

                </div>

              </div>

            </article>
          `;
        }
      )
      .join("");
}


/* =====================================================
   PRODUCT MODAL
===================================================== */

function openProductModal(productId) {
  const product =
    findProduct(productId);

  const modal =
    getElement(
      "productModal"
    );

  const content =
    getElement(
      "productModalContent"
    );

  if (
    !product ||
    !modal ||
    !content
  ) {
    return;
  }

  const safeId =
    escapeHTML(product.id);

  content.innerHTML = `
    <div class="product-modal-layout">

      <div>

        <img
          src="${escapeHTML(
            product.image || ""
          )}"
          alt="${escapeHTML(
            product.name
          )}"
        >

      </div>

      <div>

        <span class="product-category">
          ${escapeHTML(
            product.category
          )}
        </span>

        <h2>
          ${escapeHTML(
            product.name
          )}
        </h2>

        <strong class="product-modal-price">
          ${formatKES(
            product.price
          )}
        </strong>

        <p>
          ${escapeHTML(
            product.description
          )}
        </p>

        <button
          type="button"
          class="primary-button"
          onclick="addToCart('${safeId}'); closeProductModal();"
        >
          Add to cart
        </button>

      </div>

    </div>
  `;

  modal.classList.add("open");

  modal.setAttribute(
    "aria-hidden",
    "false"
  );
}


function closeProductModal() {
  const modal =
    getElement(
      "productModal"
    );

  if (!modal) {
    return;
  }

  modal.classList.remove(
    "open"
  );

  modal.setAttribute(
    "aria-hidden",
    "true"
  );
}


/* =====================================================
   CHECKOUT
===================================================== */

function demoCheckout() {
  const cart =
    getCart();

  if (!cart.length) {
    showToast(
      "Your cart is empty."
    );

    return;
  }

  const order =
    createOrderFromCart();

  if (!order) {
    showToast(
      "Could not create the order."
    );

    return;
  }

  const analytics =
    getAnalytics();

  analytics.orders += 1;

  analytics.revenue +=
    Number(order.total) || 0;

  saveAnalytics(
    analytics
  );

  trackEvent(
    "order_created",
    {
      orderId:
        order.orderId,

      total:
        order.total,

      itemCount:
        order.items.length
    }
  );

  localStorage.setItem(
    STORAGE.lastDemoOrder,
    JSON.stringify({
      orderId:
        order.orderId,

      total:
        order.total,

      createdAt:
        order.createdAt,

      status:
        order.status
    })
  );

  localStorage.setItem(
    STORAGE.selectedOrder,
    order.orderId
  );

  clearCart();

  updateCartUI();
  closeCart();
  updateDashboard();
  renderOrders();
  createTrackerSection();

  initializeDemoTracking(
    order
  );

  showToast(
    `✓ Order ${order.orderId} created!`
  );

  setTimeout(
    () => {
      showOrderConfirmation(
        order
      );
    },
    350
  );
}


/* =====================================================
   ORDER CONFIRMATION
===================================================== */

function showOrderConfirmation(order) {
  if (!order) {
    return;
  }

  const existing =
    getElement(
      "orderConfirmation"
    );

  if (existing) {
    existing.remove();
  }

  localStorage.setItem(
    STORAGE.selectedOrder,
    order.orderId
  );

  const overlay =
    document.createElement(
      "div"
    );

  overlay.id =
    "orderConfirmation";

  overlay.className =
    "modal open";

  overlay.setAttribute(
    "aria-hidden",
    "false"
  );

  const items =
    order.items
      .map(
        item => `
          <div class="confirmation-item">

            <span>
              ${escapeHTML(
                item.name
              )}
              ×
              ${item.quantity}
            </span>

            <strong>
              ${formatKES(
                item.price *
                item.quantity
              )}
            </strong>

          </div>
        `
      )
      .join("");

  const safeOrderId =
    escapeHTML(
      order.orderId
    );

  overlay.innerHTML = `
    <div
      class="modal-content order-confirmation-content"
    >

      <button
        type="button"
        class="modal-close"
        onclick="closeOrderConfirmation()"
      >
        ×
      </button>

      <div class="order-confirmation">

        <div class="confirmation-icon">
          ✓
        </div>

        <p class="section-eyebrow">
          ORDER CONFIRMED
        </p>

        <h2>
          Thank you for your order!
        </h2>

        <p class="muted">
          Your SM1THX demo order has been
          successfully created.
        </p>

        <div class="confirmation-order-id">

          <span>
            Order ID
          </span>

          <strong>
            ${safeOrderId}
          </strong>

        </div>

        <div class="confirmation-items">
          ${items}
        </div>

        <div class="confirmation-total">

          <span>
            Total
          </span>

          <strong>
            ${formatKES(
              order.total
            )}
          </strong>

        </div>

        <div class="confirmation-status">

          <span>
            Status
          </span>

          <strong>
            ${escapeHTML(
              order.status
            )}
          </strong>

        </div>

        <div
          style="
            display:grid;
            gap:10px;
            margin-top:18px;
          "
        >

          <button
            type="button"
            class="primary-button full-width"
            onclick="
              closeOrderConfirmation();
              openCustomerOrderTracking('${safeOrderId}');
            "
          >
            Track This Order
          </button>

          <button
            type="button"
            class="secondary-button full-width"
            onclick="
              closeOrderConfirmation();
              openCustomerOrders();
            "
          >
            View My Orders
          </button>

        </div>

      </div>

    </div>
  `;

  document.body.appendChild(
    overlay
  );
}


function closeOrderConfirmation() {
  const modal =
    getElement(
      "orderConfirmation"
    );

  if (!modal) {
    return;
  }

  modal.remove();
}


/* =====================================================
   IMAGE
===================================================== */

function setupImagePreview() {
  const input =
    getElement(
      "productImage"
    );

  const preview =
    getElement(
      "imagePreview"
    );

  const image =
    getElement(
      "previewImage"
    );

  if (
    !input ||
    !preview ||
    !image
  ) {
    return;
  }

  input.addEventListener(
    "change",
    () => {

      const file =
        input.files &&
        input.files[0];

      if (!file) {
        preview.classList.add(
          "hidden"
        );

        image.src =
          "";

        return;
      }

      if (
        !file.type.startsWith(
          "image/"
        )
      ) {
        showToast(
          "Please choose an image file."
        );

        input.value =
          "";

        return;
      }

      const reader =
        new FileReader();

      reader.onload =
        event => {

          image.src =
            event.target.result;

          preview.classList.remove(
            "hidden"
          );
        };

      reader.readAsDataURL(
        file
      );
    }
  );
}


function compressImage(
  file,
  maxWidth = 1200,
  quality = 0.82
) {
  return new Promise(
    (
      resolve,
      reject
    ) => {

      const reader =
        new FileReader();

      reader.onerror =
        reject;

      reader.onload =
        event => {

          const img =
            new Image();

          img.onload =
            () => {

              let width =
                img.width;

              let height =
                img.height;

              if (
                width >
                maxWidth
              ) {

                height =
                  Math.round(
                    height *
                    (
                      maxWidth /
                      width
                    )
                  );

                width =
                  maxWidth;
              }

              const canvas =
                document.createElement(
                  "canvas"
                );

              canvas.width =
                width;

              canvas.height =
                height;

              const context =
                canvas.getContext(
                  "2d"
                );

              if (!context) {
                reject(
                  new Error(
                    "Canvas unavailable."
                  )
                );

                return;
              }

              context.drawImage(
                img,
                0,
                0,
                width,
                height
              );

              resolve(
                canvas.toDataURL(
                  "image/jpeg",
                  quality
                )
              );
            };

          img.onerror =
            reject;

          img.src =
            event.target.result;
        };

      reader.readAsDataURL(
        file
      );
    }
  );
}


/* =====================================================
   PUBLISH PRODUCT
===================================================== */

async function publishProduct() {
  const nameInput =
    getElement(
      "productName"
    );

  const priceInput =
    getElement(
      "productPrice"
    );

  const categoryInput =
    getElement(
      "productCategory"
    );

  const descriptionInput =
    getElement(
      "productDescription"
    );

  const imageInput =
    getElement(
      "productImage"
    );

  const name =
    nameInput?.value.trim();

  const price =
    Number(
      priceInput?.value
    );

  const category =
    categoryInput?.value;

  const description =
    descriptionInput?.value.trim();

  if (!name) {
    showToast(
      "Please enter a product name."
    );

    nameInput?.focus();

    return;
  }

  if (
    !price ||
    price <= 0
  ) {
    showToast(
      "Please enter a valid price."
    );

    priceInput?.focus();

    return;
  }

  if (!category) {
    showToast(
      "Please select a category."
    );

    categoryInput?.focus();

    return;
  }

  if (!description) {
    showToast(
      "Please add a product description."
    );

    descriptionInput?.focus();

    return;
  }

  let image = "";

  try {

    const file =
      imageInput?.files?.[0];

    if (file) {
      image =
        await compressImage(
          file
        );
    }

  } catch (error) {

    console.error(
      "Image processing error:",
      error
    );

    showToast(
      "Could not process the image."
    );

    return;
  }

  if (!image) {
    image =
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80";
  }

  const product = {
    id:
      `custom-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`,

    name,
    price,
    category,
    description,
    image
  };

  const products =
    getCustomProducts();

  products.push(product);

  saveCustomProducts(
    products
  );

  trackEvent(
    "product_published",
    {
      productId:
        product.id,

      name:
        product.name,

      price:
        product.price,

      category:
        product.category
    }
  );

  if (nameInput) {
    nameInput.value = "";
  }

  if (priceInput) {
    priceInput.value = "";
  }

  if (descriptionInput) {
    descriptionInput.value = "";
  }

  if (imageInput) {
    imageInput.value = "";
  }

  const preview =
    getElement(
      "imagePreview"
    );

  const previewImage =
    getElement(
      "previewImage"
    );

  if (preview) {
    preview.classList.add(
      "hidden"
    );
  }

  if (previewImage) {
    previewImage.src =
      "";
  }

  latestAIProduct =
    null;

  const aiResult =
    getElement(
      "aiProductResult"
    );

  if (aiResult) {
    aiResult.style.display =
      "none";
  }

  renderProducts();
  updateDashboard();

  showToast(
    "✓ Product published successfully!"
  );

  scrollToSection(
    "market"
  );
}


/* =====================================================
   AI PRODUCT ASSISTANT
===================================================== */

async function generateProductListing() {
  const productNameInput =
    getElement(
      "productName"
    );

  const generateButton =
    getElement(
      "generateProductButton"
    );

  const resultBox =
    getElement(
      "aiProductResult"
    );

  if (!productNameInput) {
    showToast(
      "Product name field not found."
    );

    return;
  }

  const productName =
    productNameInput.value.trim();

  if (!productName) {
    showToast(
      "Enter a product name first."
    );

    productNameInput.focus();

    return;
  }

  const currentPrice =
    getElement(
      "productPrice"
    )?.value || "";

  const currentCategory =
    getElement(
      "productCategory"
    )?.value || "";

  const currentDescription =
    getElement(
      "productDescription"
    )?.value.trim() || "";

  if (
    !AI_API_URL ||
    AI_API_URL.includes(
      "YOUR_PYTHON_BACKEND_URL"
    )
  ) {
    showToast(
      "AI backend is not connected yet."
    );

    return;
  }

  if (generateButton) {
    generateButton.disabled =
      true;

    generateButton.innerHTML =
      "✨ Generating Listing...";
  }

  if (resultBox) {
    resultBox.style.display =
      "block";

    resultBox.innerHTML = `
      <div class="ai-result-item">

        <span>
          SM1THX AI
        </span>

        <strong>
          Creating your product listing...
        </strong>

        <p>
          SM1THX is analyzing your product.
        </p>

      </div>
    `;
  }

  try {

    const response =
      await fetch(
        AI_API_URL,
        {
          method:
            "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body:
            JSON.stringify({
              product_name:
                productName,

              price:
                currentPrice,

              category:
                currentCategory,

              description:
                currentDescription
            })
        }
      );

    if (!response.ok) {
      throw new Error(
        `AI server returned ${response.status}`
      );
    }

    const data =
      await response.json();

    if (data.error) {
      throw new Error(
        data.error
      );
    }

    latestAIProduct =
      data;

    const titleElement =
      getElement(
        "aiGeneratedTitle"
      );

    if (titleElement) {
      titleElement.textContent =
        data.title ||
        productName;
    }

    const descriptionElement =
      getElement(
        "aiGeneratedDescription"
      );

    if (descriptionElement) {
      descriptionElement.textContent =
        data.description ||
        "";
    }

    const categoryElement =
      getElement(
        "aiGeneratedCategory"
      );

    if (categoryElement) {
      categoryElement.textContent =
        data.category ||
        "";
    }

    const priceElement =
      getElement(
        "aiGeneratedPrice"
      );

    if (priceElement) {

      const price =
        Number(
          data.price || 0
        );

      priceElement.textContent =
        price > 0
          ? formatKES(price)
          : "Not available";
    }

    const featuresElement =
      getElement(
        "aiGeneratedFeatures"
      );

    if (featuresElement) {

      featuresElement.innerHTML =
        "";

      const features =
        Array.isArray(
          data.features
        )
          ? data.features
          : [];

      features.forEach(
        feature => {

          const li =
            document.createElement(
              "li"
            );

          li.textContent =
            feature;

          featuresElement.appendChild(
            li
          );
        }
      );
    }

    const seoElement =
      getElement(
        "aiGeneratedSEO"
      );

    if (seoElement) {

      seoElement.textContent =
        Array.isArray(
          data.seo_keywords
        )
          ? data.seo_keywords.join(
              ", "
            )
          : data.seo_keywords ||
            "";
    }

    const adElement =
      getElement(
        "aiGeneratedAd"
      );

    if (adElement) {
      adElement.textContent =
        data.ad_caption ||
        "";
    }

    if (resultBox) {
      resultBox.style.display =
        "block";
    }

    showToast(
      "✨ AI listing generated!"
    );

  } catch (error) {

    console.error(
      "SM1THX AI error:",
      error
    );

    if (resultBox) {

      resultBox.style.display =
        "block";

      resultBox.innerHTML = `
        <div class="ai-result-item">

          <span>
            SM1THX AI
          </span>

          <strong>
            AI connection error
          </strong>

          <p>
            ${escapeHTML(
              error.message ||
              "The AI service is unavailable."
            )}
          </p>

        </div>
      `;
    }

    showToast(
      "AI could not generate the listing."
    );

  } finally {

    if (generateButton) {

      generateButton.disabled =
        false;

      generateButton.innerHTML =
        "✨ Generate Listing";
    }
  }
}


function applyAIProductListing() {
  if (!latestAIProduct) {
    showToast(
      "Generate an AI listing first."
    );

    return;
  }

  const productName =
    getElement(
      "productName"
    );

  const productPrice =
    getElement(
      "productPrice"
    );

  const productCategory =
    getElement(
      "productCategory"
    );

  const productDescription =
    getElement(
      "productDescription"
    );

  if (
    productName &&
    latestAIProduct.title
  ) {
    productName.value =
      latestAIProduct.title;
  }

  if (
    productPrice &&
    latestAIProduct.price
  ) {
    productPrice.value =
      Number(
        latestAIProduct.price
      );
  }

  if (
    productCategory &&
    latestAIProduct.category
  ) {

    const matchingOption =
      Array.from(
        productCategory.options
      ).find(
        option =>
          option.value.toLowerCase() ===
          String(
            latestAIProduct.category
          ).toLowerCase()
      );

    if (matchingOption) {
      productCategory.value =
        matchingOption.value;
    }
  }

  if (productDescription) {

    let description =
      latestAIProduct.description ||
      "";

    const features =
      Array.isArray(
        latestAIProduct.features
      )
        ? latestAIProduct.features
        : [];

    if (features.length) {

      description +=
        "\n\nKey Features:\n" +
        features
          .map(
            feature =>
              `• ${feature}`
          )
          .join("\n");
    }

    productDescription.value =
      description;
  }

  if (productName) {

    productName.scrollIntoView({
      behavior:
        "smooth",

      block:
        "center"
    });
  }

  showToast(
    "✓ AI listing applied to your product form!"
  );
}


/* =====================================================
   DASHBOARD
===================================================== */

function updateDashboard() {
  const products =
    getAllProducts();

  const analytics =
    getAnalytics();

  const visitorData =
    safeJSONParse(
      localStorage.getItem(
        STORAGE.visitor
      ),
      {
        count: 0
      }
    );

  const productsElement =
    getElement(
      "dashboardProducts"
    );

  const ordersElement =
    getElement(
      "dashboardOrders"
    );

  const revenueElement =
    getElement(
      "dashboardRevenue"
    );

  const visitorsElement =
    getElement(
      "dashboardVisitors"
    );

  if (productsElement) {
    productsElement.textContent =
      products.length;
  }

  if (ordersElement) {
    ordersElement.textContent =
      analytics.orders;
  }

  if (revenueElement) {
    revenueElement.textContent =
      formatKES(
        analytics.revenue
      );
  }

  if (visitorsElement) {
    visitorsElement.textContent =
      Number(
        visitorData.count || 0
      );
  }
}


function resetAnalytics() {
  saveAnalytics({
    orders: 0,
    revenue: 0,
    events: []
  });

  updateDashboard();
  renderOrders();

  showToast(
    "Demo analytics reset. Orders were kept."
  );
}


/* =====================================================
   UPDATES
===================================================== */

function toggleUpdateHistory() {
  const history =
    getElement(
      "updateHistory"
    );

  const button =
    getElement(
      "updatesToggle"
    );

  if (!history) {
    return;
  }

  const hidden =
    history.style.display ===
      "none" ||
    !history.style.display;

  history.style.display =
    hidden
      ? "block"
      : "none";

  if (button) {
    button.textContent =
      hidden
        ? "Hide Updates"
        : "View Updates";
  }
}


function setupUpdatesToggle() {
  const history =
    getElement(
      "updateHistory"
    );

  if (history) {
    history.style.display =
      "none";
  }
}


/* =====================================================
   SEARCH
===================================================== */

function setupSearch() {
  const input =
    getElement(
      "productSearch"
    );

  if (!input) {
    return;
  }

  input.addEventListener(
    "input",
    event => {

      currentSearch =
        event.target.value;

      renderProducts();
    }
  );
}


/* =====================================================
   NAVIGATION
===================================================== */

function scrollToSection(sectionId) {
  const section =
    getElement(sectionId);

  if (!section) {
    return;
  }

  section.scrollIntoView({
    behavior:
      "smooth",

    block:
      "start"
  });
}


function setupNavigation() {
  document
    .querySelectorAll(
      'a[href^="#"]'
    )
    .forEach(
      link => {

        link.addEventListener(
          "click",
          event => {

            const href =
              link.getAttribute(
                "href"
              );

            if (!href) {
              return;
            }

            const targetId =
              href.slice(1);

            const target =
              getElement(
                targetId
              );

            if (!target) {
              return;
            }

            event.preventDefault();

            scrollToSection(
              targetId
            );
          }
        );
      }
    );
}


/* =====================================================
   TOAST
===================================================== */

function showToast(message) {
  const toast =
    getElement("toast");

  if (!toast) {
    console.log(message);
    return;
  }

  toast.textContent =
    message;

  toast.classList.add(
    "show"
  );

  clearTimeout(
    toastTimer
  );

  toastTimer =
    setTimeout(
      () => {

        toast.classList.remove(
          "show"
        );

      },
      3000
    );
}


/* =====================================================
   DEMO ACCOUNT SYSTEM
   NO FIREBASE
===================================================== */

function getDemoUser() {
  return safeJSONParse(
    localStorage.getItem(
      STORAGE.user
    ),
    null
  );
}


function saveDemoUser(user) {
  localStorage.setItem(
    STORAGE.user,
    JSON.stringify(user)
  );
}


function getDemoSession() {
  return safeJSONParse(
    localStorage.getItem(
      STORAGE.session
    ),
    null
  );
}


function setDemoSession(loggedIn) {
  localStorage.setItem(
    STORAGE.session,
    JSON.stringify({
      loggedIn:
        Boolean(loggedIn),

      updatedAt:
        new Date().toISOString()
    })
  );
}


function getCurrentUser() {
  const user =
    getDemoUser();

  const session =
    getDemoSession();

  if (
    !user ||
    !session ||
    !session.loggedIn
  ) {
    return null;
  }

  return user;
}


function isLoggedIn() {
  return Boolean(
    getCurrentUser()
  );
}


/* =====================================================
   ACCOUNT STYLES
===================================================== */

function injectAccountStyles() {

  if (
    document.getElementById(
      "smithxAccountStyles"
    )
  ) {
    return;
  }

  const style =
    document.createElement(
      "style"
    );

  style.id =
    "smithxAccountStyles";

  style.textContent = `

    .smithx-account-overlay {
      position:fixed;
      inset:0;
      z-index:100000;
      background:rgba(15,23,42,.72);
      backdrop-filter:blur(8px);
      display:flex;
      align-items:center;
      justify-content:center;
      padding:20px;
      overflow:auto;
    }

    .smithx-account-modal {
      width:min(460px,100%);
      background:#fff;
      border-radius:24px;
      padding:30px;
      position:relative;
      box-shadow:0 30px 80px rgba(0,0,0,.3);
    }

    .smithx-account-close {
      position:absolute;
      top:15px;
      right:15px;
      width:38px;
      height:38px;
      border:0;
      border-radius:50%;
      background:#f1f5f9;
      cursor:pointer;
      font-size:22px;
    }

    .smithx-account-brand {
      text-align:center;
      margin-bottom:24px;
    }

    .smithx-account-brand h2 {
      margin:0;
      font-size:30px;
      color:#0f172a;
    }

    .smithx-account-brand h2 span {
      color:#2563eb;
    }

    .smithx-account-brand p {
      color:#64748b;
      margin:6px 0 0;
    }

    .smithx-account-tabs {
      display:flex;
      gap:6px;
      background:#f1f5f9;
      padding:5px;
      border-radius:12px;
      margin-bottom:20px;
    }

    .smithx-account-tab {
      flex:1;
      border:0;
      background:transparent;
      padding:11px;
      border-radius:9px;
      font-weight:700;
      cursor:pointer;
      color:#64748b;
    }

    .smithx-account-tab.active {
      background:#fff;
      color:#2563eb;
      box-shadow:0 2px 8px rgba(0,0,0,.08);
    }

    .smithx-account-field {
      margin-bottom:15px;
    }

    .smithx-account-field label {
      display:block;
      margin-bottom:6px;
      font-weight:700;
      font-size:14px;
      color:#334155;
    }

    .smithx-account-field input {
      width:100%;
      box-sizing:border-box;
      padding:13px;
      border:1px solid #dbe5f0;
      border-radius:12px;
      outline:none;
      font:inherit;
    }

    .smithx-account-field input:focus {
      border-color:#2563eb;
      box-shadow:0 0 0 3px rgba(37,99,235,.1);
    }

    .smithx-account-primary {
      width:100%;
      border:0;
      background:#2563eb;
      color:#fff;
      padding:14px;
      border-radius:12px;
      font-weight:800;
      cursor:pointer;
    }

    .smithx-account-primary:hover {
      background:#1d4ed8;
    }

    .smithx-account-error {
      display:none;
      background:#fef2f2;
      color:#b91c1c;
      border:1px solid #fecaca;
      padding:11px;
      border-radius:10px;
      margin-bottom:15px;
      font-size:14px;
    }

    .smithx-profile-overlay {
      position:fixed;
      inset:0;
      z-index:100001;
      background:rgba(248,250,252,.98);
      overflow:auto;
      padding:20px;
    }

    .smithx-profile {
      width:min(1050px,100%);
      margin:20px auto;
      background:#fff;
      border:1px solid #e2e8f0;
      border-radius:24px;
      overflow:hidden;
      box-shadow:0 20px 60px rgba(15,23,42,.08);
    }

    .smithx-profile-cover {
      height:145px;
      background:
        linear-gradient(
          135deg,
          #2563eb,
          #1d4ed8
        );
    }

    .smithx-profile-body {
      padding:0 28px 30px;
    }

    .smithx-profile-header {
      display:flex;
      align-items:flex-end;
      gap:18px;
      margin-top:-50px;
      margin-bottom:28px;
    }

    .smithx-profile-avatar {
      width:100px;
      height:100px;
      border-radius:50%;
      object-fit:cover;
      border:5px solid #fff;
      background:#eff6ff;
      box-shadow:0 5px 20px rgba(0,0,0,.12);
    }

    .smithx-profile-header h2 {
      margin:0;
      color:#0f172a;
    }

    .smithx-profile-header p {
      margin:5px 0 0;
      color:#64748b;
    }

    .smithx-profile-grid {
      display:grid;
      grid-template-columns:
        repeat(4,1fr);
      gap:14px;
      margin-bottom:22px;
    }

    .smithx-profile-stat {
      padding:18px;
      border:1px solid #e2e8f0;
      border-radius:16px;
      background:#fff;
    }

    .smithx-profile-stat span {
      display:block;
      color:#64748b;
      font-size:13px;
      margin-bottom:6px;
    }

    .smithx-profile-stat strong {
      font-size:23px;
      color:#0f172a;
    }

    .smithx-profile-columns {
      display:grid;
      grid-template-columns:
        1.4fr .8fr;
      gap:18px;
    }

    .smithx-profile-card {
      border:1px solid #e2e8f0;
      border-radius:18px;
      padding:22px;
    }

    .smithx-profile-card h3 {
      margin-top:0;
      color:#0f172a;
    }

    .smithx-profile-row {
      display:flex;
      justify-content:space-between;
      gap:20px;
      padding:13px 0;
      border-bottom:1px solid #f1f5f9;
    }

    .smithx-profile-row:last-child {
      border-bottom:0;
    }

    .smithx-profile-row span {
      color:#64748b;
    }

    .smithx-profile-row strong {
      color:#0f172a;
      text-align:right;
    }

    .smithx-profile-actions {
      display:grid;
      gap:10px;
    }

    .smithx-profile-action {
      width:100%;
      padding:13px;
      border-radius:11px;
      border:1px solid #dbe5f0;
      background:#fff;
      cursor:pointer;
      font-weight:700;
      text-align:left;
    }

    .smithx-profile-action:hover {
      border-color:#2563eb;
      color:#2563eb;
    }

    .smithx-profile-danger {
      color:#dc2626;
      border-color:#fecaca;
    }

    .smithx-profile-photo-upload {
      margin-top:10px;
      display:inline-block;
      padding:8px 12px;
      border:1px solid #dbe5f0;
      border-radius:9px;
      cursor:pointer;
      font-size:13px;
      color:#2563eb;
      font-weight:700;
    }

    .smithx-profile-photo-upload input {
      display:none;
    }

    @media(max-width:760px) {

      .smithx-account-modal {
        padding:22px;
      }

      .smithx-profile-overlay {
        padding:10px;
      }

      .smithx-profile-body {
        padding:0 16px 20px;
      }

      .smithx-profile-grid {
        grid-template-columns:
          repeat(2,1fr);
      }

      .smithx-profile-columns {
        grid-template-columns:1fr;
      }

      .smithx-profile-header {
        align-items:center;
      }

      .smithx-profile-avatar {
        width:80px;
        height:80px;
      }

    }

  `;

  document.head.appendChild(
    style
  );
}


/* =====================================================
   ACCOUNT LOGIN MODAL
===================================================== */

function openAccountLogin() {

  injectAccountStyles();

  closeAccountModal();

  const overlay =
    document.createElement(
      "div"
    );

  overlay.id =
    "smithxAccountModal";

  overlay.className =
    "smithx-account-overlay";

  overlay.innerHTML = `
    <div class="smithx-account-modal">

      <button
        class="smithx-account-close"
        type="button"
        onclick="closeAccountModal()"
      >
        ×
      </button>

      <div class="smithx-account-brand">

        <h2>
          SM1TH<span>X</span>
        </h2>

        <p>
          Your commerce account
        </p>

      </div>

      <div class="smithx-account-tabs">

        <button
          id="smithxLoginTab"
          class="smithx-account-tab active"
          type="button"
          onclick="showAccountLoginForm()"
        >
          Login
        </button>

        <button
          id="smithxRegisterTab"
          class="smithx-account-tab"
          type="button"
          onclick="showAccountRegisterForm()"
        >
          Create Account
        </button>

      </div>

      <div
        id="smithxAccountError"
        class="smithx-account-error"
      ></div>

      <div id="smithxLoginForm">

        <div class="smithx-account-field">

          <label>
            Email
          </label>

          <input
            id="smithxLoginEmail"
            type="email"
            placeholder="you@example.com"
            autocomplete="email"
          >

        </div>

        <div class="smithx-account-field">

          <label>
            Password
          </label>

          <input
            id="smithxLoginPassword"
            type="password"
            placeholder="Enter password"
            autocomplete="current-password"
          >

        </div>

        <button
          type="button"
          class="smithx-account-primary"
          onclick="loginDemoAccount()"
        >
          Login to SM1THX
        </button>

      </div>

      <div
        id="smithxRegisterForm"
        style="display:none;"
      >

        <div class="smithx-account-field">

          <label>
            Full Name
          </label>

          <input
            id="smithxRegisterName"
            type="text"
            placeholder="John Muchina"
            autocomplete="name"
          >

        </div>

        <div class="smithx-account-field">

          <label>
            Email
          </label>

          <input
            id="smithxRegisterEmail"
            type="email"
            placeholder="you@example.com"
            autocomplete="email"
          >

        </div>

        <div class="smithx-account-field">

          <label>
            Password
          </label>

          <input
            id="smithxRegisterPassword"
            type="password"
            placeholder="Create a password"
            autocomplete="new-password"
          >

        </div>

        <button
          type="button"
          class="smithx-account-primary"
          onclick="registerDemoAccount()"
        >
          Create Demo Account
        </button>

      </div>

    </div>
  `;

  document.body.appendChild(
    overlay
  );

  overlay.addEventListener(
    "click",
    event => {
      if (
        event.target ===
        overlay
      ) {
        closeAccountModal();
      }
    }
  );
}


function closeAccountModal() {

  const modal =
    getElement(
      "smithxAccountModal"
    );

  if (modal) {
    modal.remove();
  }
}


function showAccountLoginForm() {

  const login =
    getElement(
      "smithxLoginForm"
    );

  const register =
    getElement(
      "smithxRegisterForm"
    );

  const loginTab =
    getElement(
      "smithxLoginTab"
    );

  const registerTab =
    getElement(
      "smithxRegisterTab"
    );

  if (login) {
    login.style.display =
      "block";
  }

  if (register) {
    register.style.display =
      "none";
  }

  loginTab?.classList.add(
    "active"
  );

  registerTab?.classList.remove(
    "active"
  );

  clearAccountError();
}


function showAccountRegisterForm() {

  const login =
    getElement(
      "smithxLoginForm"
    );

  const register =
    getElement(
      "smithxRegisterForm"
    );

  const loginTab =
    getElement(
      "smithxLoginTab"
    );

  const registerTab =
    getElement(
      "smithxRegisterTab"
    );

  if (login) {
    login.style.display =
      "none";
  }

  if (register) {
    register.style.display =
      "block";
  }

  loginTab?.classList.remove(
    "active"
  );

  registerTab?.classList.add(
    "active"
  );

  clearAccountError();
}


function showAccountError(message) {

  const box =
    getElement(
      "smithxAccountError"
    );

  if (!box) {
    return;
  }

  box.textContent =
    message;

  box.style.display =
    "block";
}


function clearAccountError() {

  const box =
    getElement(
      "smithxAccountError"
    );

  if (!box) {
    return;
  }

  box.textContent =
    "";

  box.style.display =
    "none";
}


/* =====================================================
   CREATE ACCOUNT
===================================================== */

function registerDemoAccount() {

  clearAccountError();

  const name =
    getElement(
      "smithxRegisterName"
    )?.value.trim();

  const email =
    getElement(
      "smithxRegisterEmail"
    )?.value.trim()
      .toLowerCase();

  const password =
    getElement(
      "smithxRegisterPassword"
    )?.value;

  if (!name) {
    showAccountError(
      "Please enter your name."
    );

    return;
  }

  if (!email || !email.includes("@")) {
    showAccountError(
      "Please enter a valid email."
    );

    return;
  }

  if (
    !password ||
    password.length < 4
  ) {
    showAccountError(
      "Password must contain at least 4 characters."
    );

    return;
  }

  const existing =
    getDemoUser();

  if (existing) {
    showAccountError(
      "A demo account already exists on this device. Login instead."
    );

    return;
  }

  const user = {

    name,

    email,

    password,

    username:
      name
        .toLowerCase()
        .replace(
          /[^a-z0-9]+/g,
          "."
        )
        .replace(
          /^\.+|\.+$/g,
          ""
        ),

    bio:
      "SM1THX customer and seller.",

    location:
      "Kenya",

    photo:
      "",

    createdAt:
      new Date().toISOString()
  };

  saveDemoUser(user);

  setDemoSession(true);

  closeAccountModal();

  showToast(
    `Welcome to SM1THX, ${name}!`
  );

  updateAccountButton();
}


/* =====================================================
   LOGIN
===================================================== */

function loginDemoAccount() {

  clearAccountError();

  const email =
    getElement(
      "smithxLoginEmail"
    )?.value.trim()
      .toLowerCase();

  const password =
    getElement(
      "smithxLoginPassword"
    )?.value;

  const user =
    getDemoUser();

  if (!user) {
    showAccountError(
      "No demo account exists yet. Create one first."
    );

    return;
  }

  if (
    email !==
    String(
      user.email
    ).toLowerCase()
  ) {
    showAccountError(
      "Incorrect email."
    );

    return;
  }

  if (
    password !==
    user.password
  ) {
    showAccountError(
      "Incorrect password."
    );

    return;
  }

  setDemoSession(true);

  closeAccountModal();

  showToast(
    `Welcome back, ${user.name}!`
  );

  updateAccountButton();
}


/* =====================================================
   LOGOUT
===================================================== */

function logoutDemoAccount() {

  setDemoSession(false);

  closeProfileDashboard();

  showToast(
    "You have been logged out."
  );

  updateAccountButton();
}


/* =====================================================
   PROFILE DASHBOARD
===================================================== */

function openProfileDashboard() {

  const user =
    getCurrentUser();

  if (!user) {
    openAccountLogin();
    return;
  }

  injectAccountStyles();

  closeProfileDashboard();

  const orders =
    getOrders();

  const products =
    getCustomProducts();

  const analytics =
    getAnalytics();

  const photo =
    user.photo ||
    "https://ui-avatars.com/api/?name=" +
      encodeURIComponent(
        user.name
      ) +
      "&background=eff6ff&color=2563eb&size=200";

  const overlay =
    document.createElement(
      "div"
    );

  overlay.id =
    "smithxProfileDashboard";

  overlay.className =
    "smithx-profile-overlay";

  overlay.innerHTML = `

    <div class="smithx-profile">

      <div class="smithx-profile-cover"></div>

      <div class="smithx-profile-body">

        <div class="smithx-profile-header">

          <img
            id="smithxProfileAvatar"
            class="smithx-profile-avatar"
            src="${escapeHTML(photo)}"
            alt="${escapeHTML(user.name)}"
          >

          <div>

            <h2>
              ${escapeHTML(user.name)}
            </h2>

            <p>
              @${escapeHTML(
                user.username ||
                "smithx-user"
              )}
            </p>

          </div>

        </div>


        <div class="smithx-profile-grid">

          <div class="smithx-profile-stat">

            <span>
              Orders
            </span>

            <strong>
              ${orders.length}
            </strong>

          </div>

          <div class="smithx-profile-stat">

            <span>
              Products
            </span>

            <strong>
              ${products.length}
            </strong>

          </div>

          <div class="smithx-profile-stat">

            <span>
              Total Spent
            </span>

            <strong>
              ${formatKES(
                orders.reduce(
                  (total, order) =>
                    total +
                    Number(
                      order.total
                    || 0
                    ),
                  0
                )
              )}
            </strong>

          </div>

          <div class="smithx-profile-stat">

            <span>
              Demo Revenue
            </span>

            <strong>
              ${formatKES(
                analytics.revenue
              )}
            </strong>

          </div>

        </div>


        <div class="smithx-profile-columns">


          <div class="smithx-profile-card">

            <h3>
              Profile
            </h3>

            <div class="smithx-profile-row">

              <span>
                Name
              </span>

              <strong>
                ${escapeHTML(
                  user.name
                )}
              </strong>

            </div>

            <div class="smithx-profile-row">

              <span>
                Email
              </span>

              <strong>
                ${escapeHTML(
                  user.email
                )}
              </strong>

            </div>

            <div class="smithx-profile-row">

              <span>
                Username
              </span>

              <strong>
                @${escapeHTML(
                  user.username ||
                  "smithx-user"
                )}
              </strong>

            </div>

            <div class="smithx-profile-row">

              <span>
                Location
              </span>

              <strong>
                ${escapeHTML(
                  user.location ||
                  "Not set"
                )}
              </strong>

            </div>

            <div class="smithx-profile-row">

              <span>
                Bio
              </span>

              <strong>
                ${escapeHTML(
                  user.bio ||
                  "No bio yet."
                )}
              </strong>

            </div>

            <label
              class="smithx-profile-photo-upload"
            >
              Change profile photo

              <input
                id="smithxProfilePhotoInput"
                type="file"
                accept="image/*"
              >

            </label>

          </div>


          <div class="smithx-profile-card">

            <h3>
              Account
            </h3>

            <div class="smithx-profile-actions">

              <button
                type="button"
                class="smithx-profile-action"
                onclick="editDemoProfile()"
              >
                ✏️ Edit Profile
              </button>

              <button
                type="button"
                class="smithx-profile-action"
                onclick="openCustomerOrders()"
              >
                📦 My Orders
              </button>

              <button
                type="button"
                class="smithx-profile-action"
                onclick="scrollToSection('seller')"
              >
                🛍️ Seller Studio
              </button>

              <button
                type="button"
                class="smithx-profile-action"
                onclick="openProfileSettings()"
              >
                ⚙️ Account Settings
              </button>

              <button
                type="button"
                class="smithx-profile-action smithx-profile-danger"
                onclick="logoutDemoAccount()"
              >
                🚪 Logout
              </button>

            </div>

          </div>

        </div>

        <div style="
          display:flex;
          gap:10px;
          justify-content:flex-end;
          margin-top:20px;
        ">

          <button
            type="button"
            class="secondary-button"
            onclick="closeProfileDashboard()"
          >
            Close
          </button>

        </div>

      </div>

    </div>
  `;

  document.body.appendChild(
    overlay
  );

  const photoInput =
    getElement(
      "smithxProfilePhotoInput"
    );

  if (photoInput) {

    photoInput.addEventListener(
      "change",
      handleProfilePhoto
    );
  }
}


function closeProfileDashboard() {

  const dashboard =
    getElement(
      "smithxProfileDashboard"
    );

  if (dashboard) {
    dashboard.remove();
  }
}


/* =====================================================
   EDIT PROFILE
===================================================== */

function editDemoProfile() {

  const user =
    getCurrentUser();

  if (!user) {
    return;
  }

  const name =
    prompt(
      "Full name:",
      user.name || ""
    );

  if (
    name === null ||
    !name.trim()
  ) {
    return;
  }

  const username =
    prompt(
      "Username:",
      user.username || ""
    );

  const bio =
    prompt(
      "Bio:",
      user.bio || ""
    );

  const location =
    prompt(
      "Location:",
      user.location || ""
    );

  user.name =
    name.trim();

  user.username =
    (
      username ||
      user.username ||
      "smithx-user"
    )
      .trim()
      .replace(
        /^@/,
        ""
      );

  user.bio =
    (
      bio ||
      ""
    ).trim();

  user.location =
    (
      location ||
      ""
    ).trim();

  saveDemoUser(user);

  closeProfileDashboard();

  openProfileDashboard();

  updateAccountButton();

  showToast(
    "Profile updated."
  );
}


/* =====================================================
   PROFILE PHOTO
===================================================== */

function handleProfilePhoto(event) {

  const file =
    event.target.files?.[0];

  if (!file) {
    return;
  }

  if (
    !file.type.startsWith(
      "image/"
    )
  ) {
    showToast(
      "Please choose an image."
    );

    return;
  }

  const reader =
    new FileReader();

  reader.onload =
    () => {

      const user =
        getDemoUser();

      if (!user) {
        return;
      }

      user.photo =
        reader.result;

      saveDemoUser(user);

      const avatar =
        getElement(
          "smithxProfileAvatar"
        );

      if (avatar) {
        avatar.src =
          user.photo;
      }

      updateAccountButton();

      showToast(
        "Profile photo updated."
      );
    };

  reader.readAsDataURL(
    file
  );
}


/* =====================================================
   ACCOUNT SETTINGS
===================================================== */

function openProfileSettings() {

  const user =
    getCurrentUser();

  if (!user) {
    return;
  }

  const action =
    prompt(
      "Account settings:\n\n" +
      "1 = Change password\n" +
      "2 = Delete demo account\n\n" +
      "Enter 1 or 2:"
    );

  if (action === "1") {

    const current =
      prompt(
        "Current password:"
      );

    if (
      current !==
      user.password
    ) {
      showToast(
        "Incorrect current password."
      );

      return;
    }

    const next =
      prompt(
        "New password:"
      );

    if (
      !next ||
      next.length < 4
    ) {
      showToast(
        "Password must contain at least 4 characters."
      );

      return;
    }

    user.password =
      next;

    saveDemoUser(user);

    showToast(
      "Password changed."
    );

    return;
  }

  if (action === "2") {

    const confirmed =
      confirm(
        "Delete your SM1THX demo account from this device?"
      );

    if (!confirmed) {
      return;
    }

    localStorage.removeItem(
      STORAGE.user
    );

    localStorage.removeItem(
      STORAGE.session
    );

    closeProfileDashboard();

    updateAccountButton();

    showToast(
      "Demo account deleted."
    );
  }
}


/* =====================================================
   ACCOUNT BUTTON
===================================================== */

function createAccountButton() {

  if (
    getElement(
      "smithxAccountButton"
    )
  ) {
    return;
  }

  const button =
    document.createElement(
      "button"
    );

  button.id =
    "smithxAccountButton";

  button.type =
    "button";

  button.className =
    "smithx-account-button";

  button.onclick =
    handleAccountButton;

  /*
    Try to place it in an existing
    navigation/header first.
  */

  const nav =
    document.querySelector(
      "header nav, .nav-actions, .navbar-actions, .header-actions, nav"
    );

  if (nav) {
    nav.appendChild(
      button
    );
  } else {

    button.style.position =
      "fixed";

    button.style.top =
      "15px";

    button.style.right =
      "15px";

    button.style.zIndex =
      "9999";

    document.body.appendChild(
      button
    );
  }

  updateAccountButton();
}


function updateAccountButton() {

  const button =
    getElement(
      "smithxAccountButton"
    );

  if (!button) {
    return;
  }

  const user =
    getCurrentUser();

  if (user) {

    const photo =
      user.photo ||
      "https://ui-avatars.com/api/?name=" +
        encodeURIComponent(
          user.name
        ) +
        "&background=eff6ff&color=2563eb&size=100";

    button.innerHTML = `
      <img
        class="smithx-account-avatar"
        src="${escapeHTML(photo)}"
        alt=""
      >

      <span>
        ${escapeHTML(
          user.name.split(" ")[0]
        )}
      </span>
    `;

  } else {

    button.innerHTML = `
      👤
      <span>
        Login
      </span>
    `;
  }
}


function handleAccountButton() {

  if (
    isLoggedIn()
  ) {
    openProfileDashboard();
  } else {
    openAccountLogin();
  }
}


/* =====================================================
   ACCOUNT KEYBOARD CONTROLS
===================================================== */

function setupAccountKeyboard() {

  document.addEventListener(
    "keydown",
    event => {

      if (
        event.key !==
        "Escape"
      ) {
        return;
      }

      closeAccountModal();
      closeProfileDashboard();
    }
  );
}


/* =====================================================
   LOGIN COMPATIBILITY
===================================================== */

function removeLoginUI() {

  const overlay =
    getElement(
      "loginOverlay"
    );

  const loginButton =
    getElement(
      "loginNavButton"
    );

  if (overlay) {
    overlay.remove();
  }

  if (loginButton) {
    loginButton.remove();
  }
}


function disableOldLoginHandlers() {

  window.openLogin =
    function () {
      openAccountLogin();
    };

  window.closeLogin =
    function () {
      closeAccountModal();
    };
}


function showRegisterForm() {
  showAccountRegisterForm();
}


function showLoginForm() {
  showAccountLoginForm();
}


function togglePassword(
  inputId,
  button
) {
  const input =
    getElement(
      inputId
    );

  if (!input) {
    return;
  }

  if (
    input.type ===
    "password"
  ) {

    input.type =
      "text";

    if (button) {
      button.textContent =
        "🙈";
    }

  } else {

    input.type =
      "password";

    if (button) {
      button.textContent =
        "👁";
    }
  }
}


/* =====================================================
   CONTROLS
===================================================== */

function setupCartControls() {
  /*
    Cart buttons use global functions.
  */
}


function setupKeyboardControls() {

  document.addEventListener(
    "keydown",
    event => {

      if (
        event.key ===
        "Escape"
      ) {

        closeProductModal();
        closeCart();
        closeOrderConfirmation();
      }
    }
  );
}


function setupProductBackdrop() {

  const modal =
    getElement(
      "productModal"
    );

  if (!modal) {
    return;
  }

  modal.addEventListener(
    "click",
    event => {

      if (
        event.target ===
        modal
      ) {
        closeProductModal();
      }
    }
  );
}


function setupTrackerControls() {

  document.addEventListener(
    "keydown",
    event => {

      if (
        event.key ===
          "Enter" &&
        document.activeElement?.id ===
          "orderTrackingInput"
      ) {
        trackOrderFromInput();
      }
    }
  );
}


/* =====================================================
   URL
===================================================== */

function getOrderIdFromCurrentURL() {

  try {

    const params =
      new URLSearchParams(
        window.location.search
      );

    return (
      params.get("order") ||
      ""
    ).trim();

  } catch {

    return "";
  }
}


/* =====================================================
   INITIALIZE
===================================================== */

function initializeSmithX() {

  try {

    removeLoginUI();

    disableOldLoginHandlers();

    injectAccountStyles();

    setupCategories();

    setupSellerCategory();

    renderProducts();

    updateCartUI();

    setupCartControls();

    setupImagePreview();

    setupSearch();

    setupNavigation();

    setupUpdatesToggle();

    setupProductBackdrop();

    setupKeyboardControls();

    setupTrackerControls();

    setupAccountKeyboard();

    trackDailyVisitor();

    updateDashboard();

    renderOrders();

    createTrackerSection();

    resumeDemoTracking();

    createAccountButton();

    const urlOrderId =
      getOrderIdFromCurrentURL();

    if (urlOrderId) {

      const order =
        getOrder(
          urlOrderId
        );

      if (order) {

        initializeDemoTracking(
          order
        );

        renderOrderTracker(
          order
        );
      }
    }

    console.log(
      "SM1THX initialized successfully."
    );

  } catch (error) {

    console.error(
      "SM1THX initialization error:",
      error
    );

    showToast(
      "SM1THX encountered an error. Please refresh."
    );
  }
}


/* =====================================================
   GLOBAL FUNCTIONS
===================================================== */

window.addToCart =
  addToCart;

window.removeFromCart =
  removeFromCart;

window.changeCartQuantity =
  changeCartQuantity;

window.setCartQuantity =
  setCartQuantity;

window.clearShoppingCart =
  clearShoppingCart;

window.openCart =
  openCart;

window.closeCart =
  closeCart;

window.renderCart =
  renderCart;

window.updateCartCount =
  updateCartCount;

window.updateCartUI =
  updateCartUI;

window.demoCheckout =
  demoCheckout;

window.openProductModal =
  openProductModal;

window.closeProductModal =
  closeProductModal;

window.publishProduct =
  publishProduct;

window.resetAnalytics =
  resetAnalytics;

window.toggleUpdateHistory =
  toggleUpdateHistory;

window.scrollToSection =
  scrollToSection;

window.renderProducts =
  renderProducts;

window.showToast =
  showToast;

window.generateProductListing =
  generateProductListing;

window.applyAIProductListing =
  applyAIProductListing;


/* =====================================================
   ACCOUNT GLOBAL FUNCTIONS
===================================================== */

window.openAccountLogin =
  openAccountLogin;

window.closeAccountModal =
  closeAccountModal;

window.showAccountLoginForm =
  showAccountLoginForm;

window.showAccountRegisterForm =
  showAccountRegisterForm;

window.loginDemoAccount =
  loginDemoAccount;

window.registerDemoAccount =
  registerDemoAccount;

window.logoutDemoAccount =
  logoutDemoAccount;

window.openProfileDashboard =
  openProfileDashboard;

window.closeProfileDashboard =
  closeProfileDashboard;

window.editDemoProfile =
  editDemoProfile;

window.openProfileSettings =
  openProfileSettings;

window.handleAccountButton =
  handleAccountButton;


/* =====================================================
   CUSTOMER ORDER GLOBAL FUNCTIONS
===================================================== */

window.openCustomerOrderTracking =
  openCustomerOrderTracking;

window.openCustomerOrders =
  openCustomerOrders;


/* =====================================================
   ORDER GLOBAL FUNCTIONS
===================================================== */

window.updateOrderStatus =
  updateOrderStatus;

window.renderOrders =
  renderOrders;

window.showOrderConfirmation =
  showOrderConfirmation;

window.closeOrderConfirmation =
  closeOrderConfirmation;


/* =====================================================
   TRACKER GLOBAL FUNCTIONS
===================================================== */

window.trackOrder =
  trackOrder;

window.trackOrderFromInput =
  trackOrderFromInput;

window.renderOrderTracker =
  renderOrderTracker;

window.refreshTrackerForOrder =
  refreshTrackerForOrder;

window.startDemoTracking =
  startDemoTracking;

window.stopDemoTracking =
  stopDemoTracking;


/* =====================================================
   DOM READY
===================================================== */

if (
  document.readyState ===
  "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    initializeSmithX
  );

} else {

  initializeSmithX();
}
