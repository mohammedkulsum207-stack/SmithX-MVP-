/* =========================================================
   SM1THX 🛒 — APP.JS
   MVP VERSION 6.0
   RELIABLE CART + DEMO CHECKOUT
   LOGIN REMOVED
========================================================= */

"use strict";


/* =========================================================
   DEFAULT PRODUCTS
========================================================= */

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


/* =========================================================
   CATEGORIES
========================================================= */

const CATEGORIES = [
  "All",
  "Electronics",
  "Fashion",
  "Home",
  "Beauty",
  "Accessories"
];


/* =========================================================
   STORAGE
========================================================= */

const STORAGE = {
  products: "smithx_custom_products_v2",
  cart: "smithx_cart_v2",
  analytics: "smithx_analytics_v2",
  visitor: "smithx_daily_visitor_v2"
};


/* =========================================================
   STATE
========================================================= */

let currentCategory = "All";
let currentSearch = "";


/* =========================================================
   HELPERS
========================================================= */

function formatKES(value) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0
  }).format(Number(value) || 0);
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
    const parsed = JSON.parse(value);

    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}


function getElement(id) {
  return document.getElementById(id);
}


/* =========================================================
   PRODUCTS
========================================================= */

function getCustomProducts() {
  const products = safeJSONParse(
    localStorage.getItem(STORAGE.products),
    []
  );

  return Array.isArray(products)
    ? products
    : [];
}


function saveCustomProducts(products) {
  localStorage.setItem(
    STORAGE.products,
    JSON.stringify(
      Array.isArray(products)
        ? products
        : []
    )
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
    product => product.id === productId
  );
}


/* =========================================================
   CART STORAGE
========================================================= */

function getCart() {
  const stored = safeJSONParse(
    localStorage.getItem(STORAGE.cart),
    []
  );

  if (!Array.isArray(stored)) {
    return [];
  }

  const cleaned = [];
  const seen = new Set();

  stored.forEach(item => {
    if (!item || !item.id) {
      return;
    }

    if (seen.has(item.id)) {
      return;
    }

    const product = findProduct(item.id);

    if (!product) {
      return;
    }

    let quantity =
      Number.parseInt(item.quantity, 10);

    if (!Number.isFinite(quantity)) {
      quantity = 1;
    }

    quantity = Math.max(1, quantity);

    seen.add(item.id);

    cleaned.push({
      id: item.id,
      quantity
    });
  });

  return cleaned;
}


function saveCart(cart) {
  const safeCart =
    Array.isArray(cart)
      ? cart
      : [];

  localStorage.setItem(
    STORAGE.cart,
    JSON.stringify(safeCart)
  );
}


function clearCart() {
  localStorage.removeItem(
    STORAGE.cart
  );
}


/* =========================================================
   CART CALCULATIONS
========================================================= */

function getCartCount() {
  return getCart().reduce(
    (total, item) => {
      const quantity =
        Number.parseInt(
          item.quantity,
          10
        ) || 0;

      return total + Math.max(
        0,
        quantity
      );
    },
    0
  );
}


function calculateCartTotals() {
  const cart = getCart();

  let subtotal = 0;
  let itemCount = 0;

  const validItems = [];

  cart.forEach(item => {
    const product =
      findProduct(item.id);

    if (!product) {
      return;
    }

    const quantity =
      Math.max(
        1,
        Number.parseInt(
          item.quantity,
          10
        ) || 1
      );

    const price =
      Math.max(
        0,
        Number(product.price) || 0
      );

    subtotal +=
      price * quantity;

    itemCount += quantity;

    validItems.push({
      id: product.id,
      quantity
    });
  });

  return {
    subtotal,
    total: subtotal,
    itemCount,
    validItems
  };
}


/* =========================================================
   ANALYTICS
========================================================= */

function getAnalytics() {
  const data = safeJSONParse(
    localStorage.getItem(
      STORAGE.analytics
    ),
    {
      visitors: 0,
      orders: 0,
      revenue: 0,
      productViews: 0
    }
  );

  return {
    visitors:
      Number(data.visitors) || 0,

    orders:
      Number(data.orders) || 0,

    revenue:
      Number(data.revenue) || 0,

    productViews:
      Number(data.productViews) || 0
  };
}


function saveAnalytics(data) {
  localStorage.setItem(
    STORAGE.analytics,
    JSON.stringify(data)
  );
}


function trackEvent(
  type,
  amount = 0
) {
  const analytics =
    getAnalytics();

  if (type === "visitor") {
    analytics.visitors += 1;
  }

  if (type === "order") {
    analytics.orders += 1;

    analytics.revenue +=
      Number(amount) || 0;
  }

  if (type === "productView") {
    analytics.productViews += 1;
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
      .split("T")[0];

  const previous =
    localStorage.getItem(
      STORAGE.visitor
    );

  if (previous !== today) {
    localStorage.setItem(
      STORAGE.visitor,
      today
    );

    trackEvent(
      "visitor"
    );
  }
}


/* =========================================================
   CATEGORIES
========================================================= */

function setupCategories() {
  const container =
    getElement(
      "categoryFilters"
    );

  if (!container) {
    return;
  }

  container.innerHTML =
    CATEGORIES
      .map(category => `
        <button
          type="button"
          class="category-filter ${
            category === currentCategory
              ? "active"
              : ""
          }"
          data-category="${escapeHTML(category)}"
        >
          ${escapeHTML(category)}
        </button>
      `)
      .join("");

  container
    .querySelectorAll(
      ".category-filter"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          currentCategory =
            button.dataset.category ||
            "All";

          container
            .querySelectorAll(
              ".category-filter"
            )
            .forEach(item => {
              item.classList.remove(
                "active"
              );
            });

          button.classList.add(
            "active"
          );

          renderProducts();
        }
      );
    });
}


function setupSellerCategory() {
  const select =
    getElement(
      "productCategory"
    );

  if (!select) {
    return;
  }

  select.innerHTML =
    CATEGORIES
      .filter(
        category =>
          category !== "All"
      )
      .map(category => `
        <option value="${escapeHTML(category)}">
          ${escapeHTML(category)}
        </option>
      `)
      .join("");
}


/* =========================================================
   PRODUCT RENDERING
========================================================= */

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

  const products =
    getAllProducts()
      .filter(product => {

        const matchesCategory =
          currentCategory === "All" ||
          product.category ===
            currentCategory;

        const searchable = `
          ${product.name}
          ${product.description}
          ${product.category}
        `.toLowerCase();

        const matchesSearch =
          !search ||
          searchable.includes(
            search
          );

        return (
          matchesCategory &&
          matchesSearch
        );
      });

  if (!products.length) {
    grid.innerHTML = `
      <div class="empty-state">
        <h3>No products found</h3>
        <p>
          Try another search or category.
        </p>
      </div>
    `;

    return;
  }

  grid.innerHTML =
    products
      .map(product => `
        <article class="product-card">

          <button
            type="button"
            class="product-image-button"
            onclick="openProductModal('${escapeHTML(product.id)}')"
          >
            <img
              src="${escapeHTML(product.image)}"
              alt="${escapeHTML(product.name)}"
              loading="lazy"
              onerror="this.src='https://via.placeholder.com/900x700?text=SM1THX+Product'"
            >
          </button>

          <div class="product-card-body">

            <span class="product-category">
              ${escapeHTML(product.category)}
            </span>

            <h3>
              ${escapeHTML(product.name)}
            </h3>

            <p>
              ${escapeHTML(product.description)}
            </p>

            <div class="product-card-bottom">

              <strong>
                ${formatKES(product.price)}
              </strong>

              <button
                type="button"
                class="primary-button small-button"
                onclick="addToCart('${escapeHTML(product.id)}')"
              >
                Add to cart
              </button>

            </div>

          </div>

        </article>
      `)
      .join("");
}


/* =========================================================
   PRODUCT MODAL
========================================================= */

function openProductModal(
  productId
) {
  const product =
    findProduct(productId);

  if (!product) {
    return;
  }

  const modal =
    getElement(
      "productModal"
    );

  const content =
    getElement(
      "productModalContent"
    );

  if (!modal || !content) {
    return;
  }

  content.innerHTML = `
    <div class="product-modal-layout">

      <div class="product-modal-image">
        <img
          src="${escapeHTML(product.image)}"
          alt="${escapeHTML(product.name)}"
          onerror="this.src='https://via.placeholder.com/900x700?text=SM1THX+Product'"
        >
      </div>

      <div class="product-modal-info">

        <span class="product-category">
          ${escapeHTML(product.category)}
        </span>

        <h2>
          ${escapeHTML(product.name)}
        </h2>

        <div class="modal-price">
          ${formatKES(product.price)}
        </div>

        <p>
          ${escapeHTML(product.description)}
        </p>

        <button
          type="button"
          class="primary-button"
          onclick="
            addToCart('${escapeHTML(product.id)}');
            closeProductModal();
          "
        >
          Add to cart
        </button>

      </div>

    </div>
  `;

  modal.classList.add(
    "active"
  );

  modal.setAttribute(
    "aria-hidden",
    "false"
  );

  trackEvent(
    "productView"
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
    "active"
  );

  modal.setAttribute(
    "aria-hidden",
    "true"
  );
}


/* =========================================================
   CART — ADD
========================================================= */

function addToCart(
  productId
) {
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
        item.id === productId
    );

  if (existing) {
    existing.quantity =
      Math.max(
        1,
        Number(existing.quantity) || 1
      ) + 1;
  } else {
    cart.push({
      id: productId,
      quantity: 1
    });
  }

  saveCart(cart);

  updateCartUI();

  showToast(
    `${product.name} added to cart.`
  );
}


/* =========================================================
   CART — REMOVE
========================================================= */

function removeFromCart(
  productId
) {
  const product =
    findProduct(productId);

  const cart =
    getCart().filter(
      item =>
        item.id !== productId
    );

  saveCart(cart);

  updateCartUI();

  if (product) {
    showToast(
      `${product.name} removed from cart.`
    );
  }
}


/* =========================================================
   CART — QUANTITY
========================================================= */

function changeCartQuantity(
  productId,
  amount
) {
  const change =
    Number.parseInt(
      amount,
      10
    );

  if (!Number.isFinite(change)) {
    return;
  }

  const cart =
    getCart();

  const item =
    cart.find(
      cartItem =>
        cartItem.id === productId
    );

  if (!item) {
    return;
  }

  const currentQuantity =
    Math.max(
      1,
      Number.parseInt(
        item.quantity,
        10
      ) || 1
    );

  const newQuantity =
    currentQuantity + change;

  if (newQuantity <= 0) {
    removeFromCart(
      productId
    );

    return;
  }

  item.quantity =
    newQuantity;

  saveCart(cart);

  updateCartUI();
}


/* =========================================================
   CART — SET EXACT QUANTITY
========================================================= */

function setCartQuantity(
  productId,
  quantity
) {
  const newQuantity =
    Number.parseInt(
      quantity,
      10
    );

  if (
    !Number.isFinite(
      newQuantity
    )
  ) {
    return;
  }

  if (newQuantity <= 0) {
    removeFromCart(
      productId
    );

    return;
  }

  const cart =
    getCart();

  const item =
    cart.find(
      cartItem =>
        cartItem.id === productId
    );

  if (!item) {
    return;
  }

  item.quantity =
    newQuantity;

  saveCart(cart);

  updateCartUI();
}


/* =========================================================
   CART — CLEAR
========================================================= */

function clearShoppingCart(
  showMessage = true
) {
  clearCart();

  updateCartUI();

  if (showMessage) {
    showToast(
      "Cart cleared."
    );
  }
}


/* =========================================================
   CART — RENDER
========================================================= */

function renderCart() {
  const container =
    getElement(
      "cartItems"
    );

  const subtotalElement =
    getElement(
      "cartSubtotal"
    );

  const totalElement =
    getElement(
      "cartTotal"
    );

  if (!container) {
    return;
  }

  const totals =
    calculateCartTotals();

  /*
    Save cleaned cart.
    This prevents deleted products
    from remaining inside the cart.
  */
  saveCart(
    totals.validItems
  );

  if (!totals.validItems.length) {

    container.innerHTML = `
      <div class="empty-state">

        <div style="font-size:42px;">
          🛒
        </div>

        <h3>
          Your cart is empty
        </h3>

        <p>
          Add products from the marketplace.
        </p>

      </div>
    `;

    if (subtotalElement) {
      subtotalElement.textContent =
        formatKES(0);
    }

    if (totalElement) {
      totalElement.textContent =
        formatKES(0);
    }

    return;
  }

  container.innerHTML =
    totals.validItems
      .map(item => {

        const product =
          findProduct(
            item.id
          );

        if (!product) {
          return "";
        }

        const quantity =
          Math.max(
            1,
            Number.parseInt(
              item.quantity,
              10
            ) || 1
          );

        const lineTotal =
          Number(product.price) *
          quantity;

        return `
          <div class="cart-item">

            <img
              src="${escapeHTML(product.image)}"
              alt="${escapeHTML(product.name)}"
              onerror="this.src='https://via.placeholder.com/200x150?text=SM1THX'"
            >

            <div>

              <h4>
                ${escapeHTML(product.name)}
              </h4>

              <p>
                ${formatKES(product.price)}
              </p>

              <p>
                <strong>
                  ${formatKES(lineTotal)}
                </strong>
              </p>

              <div
                style="
                  display:flex;
                  align-items:center;
                  gap:8px;
                  margin-top:8px;
                "
              >

                <button
                  type="button"
                  aria-label="Decrease quantity"
                  onclick="
                    changeCartQuantity(
                      '${escapeHTML(product.id)}',
                      -1
                    )
                  "
                >
                  −
                </button>

                <strong>
                  ${quantity}
                </strong>

                <button
                  type="button"
                  aria-label="Increase quantity"
                  onclick="
                    changeCartQuantity(
                      '${escapeHTML(product.id)}',
                      1
                    )
                  "
                >
                  +
                </button>

              </div>

              <button
                type="button"
                style="
                  margin-top:7px;
                  border:0;
                  background:none;
                  color:#dc2626;
                  font-size:12px;
                  font-weight:800;
                  cursor:pointer;
                "
                onclick="
                  removeFromCart(
                    '${escapeHTML(product.id)}'
                  )
                "
              >
                Remove
              </button>

            </div>

          </div>
        `;
      })
      .join("");

  if (subtotalElement) {
    subtotalElement.textContent =
      formatKES(
        totals.subtotal
      );
  }

  if (totalElement) {
    totalElement.textContent =
      formatKES(
        totals.total
      );
  }
}


/* =========================================================
   CART — COUNT
========================================================= */

function updateCartCount() {
  const element =
    getElement(
      "cartCount"
    );

  if (!element) {
    return;
  }

  element.textContent =
    getCartCount();
}


/* =========================================================
   CART — FULL UI REFRESH
========================================================= */

function updateCartUI() {
  renderCart();
  updateCartCount();
}


/* =========================================================
   CART — OPEN
========================================================= */

function openCart() {
  const panel =
    getElement(
      "cartPanel"
    );

  if (!panel) {
    console.error(
      "SM1THX: cartPanel not found."
    );

    return;
  }

  updateCartUI();

  panel.classList.add(
    "active"
  );

  /*
    Some versions of the CSS use
    active, others may use open.
    Keeping both makes the control
    more reliable without changing CSS.
  */
  panel.classList.add(
    "open"
  );

  panel.setAttribute(
    "aria-hidden",
    "false"
  );

  document.body.classList.add(
    "cart-open"
  );
}


/* =========================================================
   CART — CLOSE
========================================================= */

function closeCart() {
  const panel =
    getElement(
      "cartPanel"
    );

  if (!panel) {
    return;
  }

  panel.classList.remove(
    "active"
  );

  panel.classList.remove(
    "open"
  );

  panel.setAttribute(
    "aria-hidden",
    "true"
  );

  document.body.classList.remove(
    "cart-open"
  );
}


/* =========================================================
   DEMO CHECKOUT
========================================================= */

function demoCheckout() {
  const totals =
    calculateCartTotals();

  if (
    !totals.validItems.length ||
    totals.total <= 0
  ) {
    showToast(
      "Your cart is empty."
    );

    return;
  }

  const order = {
    id:
      "SMX-DEMO-" +
      Date.now(),

    items:
      totals.validItems.map(
        item => ({
          id: item.id,
          quantity: item.quantity
        })
      ),

    total:
      totals.total,

    createdAt:
      new Date().toISOString()
  };

  /*
    Demo checkout does not charge
    real money.
  */

  trackEvent(
    "order",
    totals.total
  );

  /*
    Store the latest demo order
    for MVP demonstration purposes.
  */
  localStorage.setItem(
    "smithx_last_demo_order",
    JSON.stringify(order)
  );

  /*
    Clear cart only after the
    order has been successfully
    prepared.
  */
  clearCart();

  updateCartUI();

  closeCart();

  showToast(
    `Demo checkout complete! Order ${order.id}`
  );
}


/* =========================================================
   IMAGE PREVIEW
========================================================= */

function setupImagePreview() {
  const input =
    getElement(
      "productImage"
    );

  const preview =
    getElement(
      "imagePreview"
    );

  const previewImage =
    getElement(
      "previewImage"
    );

  if (
    !input ||
    !preview ||
    !previewImage
  ) {
    return;
  }

  input.addEventListener(
    "change",
    () => {

      const file =
        input.files?.[0];

      if (!file) {

        preview.style.display =
          "none";

        previewImage.src =
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

        preview.style.display =
          "none";

        previewImage.src =
          "";

        return;
      }

      const reader =
        new FileReader();

      reader.onload =
        event => {

          previewImage.src =
            event.target.result;

          preview.style.display =
            "block";
        };

      reader.onerror =
        () => {

          showToast(
            "Could not preview the image."
          );
        };

      reader.readAsDataURL(
        file
      );
    }
  );
}


/* =========================================================
   IMAGE COMPRESSION
========================================================= */

function compressImage(
  file,
  maxWidth = 1200,
  quality = 0.82
) {
  return new Promise(
    (resolve, reject) => {

      const reader =
        new FileReader();

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
                width > maxWidth
              ) {

                const ratio =
                  maxWidth /
                  width;

                width =
                  maxWidth;

                height =
                  Math.round(
                    height *
                    ratio
                  );
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
                    "Canvas unavailable"
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
            () => {

              reject(
                new Error(
                  "Image could not load"
                )
              );
            };

          img.src =
            event.target.result;
        };

      reader.onerror =
        () => {

          reject(
            new Error(
              "File could not be read"
            )
          );
        };

      reader.readAsDataURL(
        file
      );
    }
  );
}


/* =========================================================
   PUBLISH PRODUCT
========================================================= */

async function publishProduct(
  event
) {
  if (event) {
    event.preventDefault();
  }

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

  if (
    !nameInput ||
    !priceInput ||
    !descriptionInput
  ) {
    return;
  }

  const name =
    nameInput.value.trim();

  const price =
    Number(
      priceInput.value
    );

  const category =
    categoryInput?.value ||
    "Electronics";

  const description =
    descriptionInput.value.trim();

  if (!name) {
    showToast(
      "Please enter a product name."
    );

    return;
  }

  if (
    !Number.isFinite(price) ||
    price <= 0
  ) {
    showToast(
      "Please enter a valid price."
    );

    return;
  }

  if (!description) {
    showToast(
      "Please add a product description."
    );

    return;
  }

  let image =
    "https://via.placeholder.com/900x700?text=SM1THX+Product";

  if (
    imageInput?.files?.[0]
  ) {

    try {

      image =
        await compressImage(
          imageInput.files[0]
        );

    } catch {

      showToast(
        "Could not process the product image."
      );

      return;
    }
  }

  const customProducts =
    getCustomProducts();

  const product = {
    id:
      "custom-" +
      Date.now() +
      "-" +
      Math.random()
        .toString(36)
        .slice(2, 8),

    name,
    price,
    category,
    description,
    image
  };

  customProducts.push(
    product
  );

  saveCustomProducts(
    customProducts
  );

  nameInput.value =
    "";

  priceInput.value =
    "";

  descriptionInput.value =
    "";

  if (imageInput) {
    imageInput.value =
      "";
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
    preview.style.display =
      "none";
  }

  if (previewImage) {
    previewImage.src =
      "";
  }

  renderProducts();

  updateDashboard();

  showToast(
    "Product published successfully!"
  );

  getElement(
    "market"
  )?.scrollIntoView({
    behavior: "smooth"
  });
}


/* =========================================================
   DASHBOARD
========================================================= */

function updateDashboard() {
  const products =
    getAllProducts();

  const analytics =
    getAnalytics();

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
      analytics.visitors;
  }
}


function resetAnalytics() {
  localStorage.removeItem(
    STORAGE.analytics
  );

  updateDashboard();

  showToast(
    "Demo analytics have been reset."
  );
}


/* =========================================================
   UPDATE HISTORY
========================================================= */

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
    history.style.display ===
      "";

  history.style.display =
    hidden
      ? "block"
      : "none";

  if (button) {
    button.textContent =
      hidden
        ? "Hide updates"
        : "View Updates";
  }
}


function setupUpdatesToggle() {
  /*
    HTML already controls this.
  */
}


/* =========================================================
   SEARCH
========================================================= */

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
    () => {

      currentSearch =
        input.value || "";

      renderProducts();
    }
  );
}


/* =========================================================
   NAVIGATION
========================================================= */

function scrollToSection(
  id
) {
  const element =
    getElement(id);

  if (!element) {
    return;
  }

  element.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}


function setupNavigation() {
  document
    .querySelectorAll(
      'a[href^="#"]'
    )
    .forEach(link => {

      link.addEventListener(
        "click",
        event => {

          const id =
            link.getAttribute(
              "href"
            );

          if (
            !id ||
            id === "#"
          ) {
            return;
          }

          const target =
            document.querySelector(
              id
            );

          if (!target) {
            return;
          }

          event.preventDefault();

          target.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });
        }
      );
    });
}


/* =========================================================
   TOAST
========================================================= */

function showToast(
  message
) {
  const toast =
    getElement(
      "toast"
    );

  if (!toast) {
    return;
  }

  toast.textContent =
    message;

  toast.classList.add(
    "show"
  );

  clearTimeout(
    showToast.timeout
  );

  showToast.timeout =
    setTimeout(
      () => {

        toast.classList.remove(
          "show"
        );

      },
      2800
    );
}


/* =========================================================
   REMOVE LOGIN UI
========================================================= */

function removeLoginUI() {

  /*
    Remove the login button from
    the navigation.
  */

  const loginButton =
    getElement(
      "loginNavButton"
    );

  if (loginButton) {
    loginButton.remove();
  }


  /*
    Remove the login overlay
    completely.
  */

  const loginOverlay =
    getElement(
      "loginOverlay"
    );

  if (loginOverlay) {
    loginOverlay.remove();
  }


  /*
    Hide any remaining login/register
    sections if another HTML version
    contains them outside the overlay.
  */

  document
    .querySelectorAll(
      "#loginFormSection, #registerFormSection"
    )
    .forEach(element => {
      element.remove();
    });
}


/* =========================================================
   CART CONTROLS
========================================================= */

function setupCartControls() {

  /*
    Force every cart button to
    open the same cart function.
  */

  document
    .querySelectorAll(
      ".cart-button"
    )
    .forEach(button => {

      button.onclick =
        openCart;
    });


  /*
    Make close buttons inside
    the cart close the cart.
  */

  const panel =
    getElement(
      "cartPanel"
    );

  if (!panel) {
    return;
  }

  panel
    .querySelectorAll(
      ".modal-close, [data-close-cart]"
    )
    .forEach(button => {

      button.onclick =
        closeCart;
    });


  /*
    If the cart has a backdrop,
    clicking the backdrop closes it.
  */

  panel.addEventListener(
    "click",
    event => {

      if (
        event.target ===
        panel
      ) {
        closeCart();
      }
    }
  );
}


/* =========================================================
   KEYBOARD CONTROLS
========================================================= */

function setupKeyboardControls() {
  document.addEventListener(
    "keydown",
    event => {

      if (
        event.key !==
        "Escape"
      ) {
        return;
      }

      closeProductModal();
      closeCart();
    }
  );
}


/* =========================================================
   PRODUCT BACKDROP
========================================================= */

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


/* =========================================================
   PREVENT BROKEN LOGIN INLINE HANDLERS
========================================================= */

function disableOldLoginHandlers() {

  /*
    The old HTML may still contain
    onclick="openLogin()".

    We remove the element above,
    but this harmless fallback prevents
    a ReferenceError if an old cached
    HTML element is encountered.
  */

  window.openLogin =
    function () {
      removeLoginUI();
    };

  window.closeLogin =
    function () {
      removeLoginUI();
    };
}


/* =========================================================
   INITIALIZE
========================================================= */

function initializeSmithX() {

  /*
    Remove Login immediately.
  */

  removeLoginUI();

  disableOldLoginHandlers();


  /*
    Marketplace.
  */

  setupCategories();

  setupSellerCategory();

  renderProducts();


  /*
    Cart.
  */

  updateCartUI();

  setupCartControls();


  /*
    Seller Studio.
  */

  setupImagePreview();


  /*
    Search.
  */

  setupSearch();


  /*
    Navigation.
  */

  setupNavigation();


  /*
    Updates.
  */

  setupUpdatesToggle();


  /*
    Product modal.
  */

  setupProductBackdrop();


  /*
    Keyboard.
  */

  setupKeyboardControls();


  /*
    Analytics.
  */

  trackDailyVisitor();

  updateDashboard();
}


/* =========================================================
   DOM READY
========================================================= */

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


/* =========================================================
   GLOBAL FUNCTIONS
========================================================= */

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
