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

function createId(prefix = "smithx") {
  return (
    prefix +
    "-" +
    Date.now() +
    "-" +
    Math.random()
      .toString(36)
      .slice(2, 8)
  );
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
                class="product-image-button"
                onclick="openProductModal('${safeId}')"
                aria-label="View ${escapeHTML(
                  product.name
                )}"
              >
                <img
                  class="product-image"
                  src="${escapeHTML(
                    product.image || ""
                  )}"
                  alt="${escapeHTML(
                    product.name
                  )}"
                  loading="lazy"
                  onerror="this.style.display='none'"
                >
              </button>

              <div class="product-card-content">

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

                  <strong class="product-price">
                    ${formatKES(
                      product.price
                    )}
                  </strong>

                  <button
                    type="button"
                    class="primary-button"
                    onclick="addToCart('${safeId}')"
                  >
                    Add to Cart
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
   MARKETPLACE SEARCH
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
        event.target.value || "";

      renderProducts();
    }
  );
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

  if (
    !product ||
    !modal
  ) {
    return;
  }

  const image =
    getElement(
      "modalProductImage"
    );

  const title =
    getElement(
      "modalProductTitle"
    );

  const description =
    getElement(
      "modalProductDescription"
    );

  const price =
    getElement(
      "modalProductPrice"
    );

  const category =
    getElement(
      "modalProductCategory"
    );

  if (image) {
    image.src =
      product.image || "";

    image.alt =
      product.name || "";
  }

  if (title) {
    title.textContent =
      product.name || "";
  }

  if (description) {
    description.textContent =
      product.description || "";
  }

  if (price) {
    price.textContent =
      formatKES(
        product.price
      );
  }

  if (category) {
    category.textContent =
      product.category || "";
  }

  modal.dataset.productId =
    String(product.id);

  modal.classList.add(
    "open"
  );

  modal.setAttribute(
    "aria-hidden",
    "false"
  );

  trackEvent(
    "product_view",
    {
      productId:
        product.id,
      productName:
        product.name
    }
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

function addModalProductToCart() {
  const modal =
    getElement(
      "productModal"
    );

  if (!modal) {
    return;
  }

  const productId =
    modal.dataset.productId;

  if (!productId) {
    return;
  }

  addToCart(productId);

  closeProductModal();
}

/* =====================================================
   SELLER IMAGE PREVIEW
===================================================== */

function setupImagePreview() {
  const input =
    getElement(
      "productImage"
    );

  if (!input) {
    return;
  }

  input.addEventListener(
    "change",
    () => {
      const file =
        input.files &&
        input.files[0];

      const preview =
        getElement(
          "imagePreview"
        );

      const previewImage =
        getElement(
          "previewImage"
        );

      if (
        !file ||
        !preview ||
        !previewImage
      ) {
        return;
      }

      if (
        !file.type.startsWith(
          "image/"
        )
      ) {
        showToast(
          "Please select an image file."
        );

        input.value = "";

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

      reader.readAsDataURL(
        file
      );
    }
  );
}

/* =====================================================
   COMPRESS IMAGE
===================================================== */

function compressImage(
  file,
  maxWidth = 1200,
  quality = 0.82
) {
  return new Promise(
    resolve => {
      if (
        !file ||
        !file.type.startsWith(
          "image/"
        )
      ) {
        resolve("");
        return;
      }

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
                width >
                maxWidth
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

              const ctx =
                canvas.getContext(
                  "2d"
                );

              ctx.drawImage(
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
            () => resolve("");

          img.src =
            event.target.result;
        };

      reader.onerror =
        () => resolve("");

      reader.readAsDataURL(
        file
      );
    }
  );
}

/* =====================================================
   SELLER FORM
===================================================== */

function resetSellerForm() {
  const form =
    getElement(
      "sellerProductForm"
    );

  if (form) {
    form.reset();
  }

  const preview =
    getElement(
      "imagePreview"
    );

  if (preview) {
    preview.style.display =
      "none";
  }

  const previewImage =
    getElement(
      "previewImage"
    );

  if (previewImage) {
    previewImage.removeAttribute(
      "src"
    );
  }

  const aiResult =
    getElement(
      "aiProductResult"
    );

  if (aiResult) {
    aiResult.style.display =
      "none";
  }

  latestAIProduct = null;
}

async function createSellerProduct(
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

  const name =
    nameInput
      ? nameInput.value.trim()
      : "";

  const price =
    priceInput
      ? Number(priceInput.value)
      : 0;

  const category =
    categoryInput
      ? categoryInput.value
      : "Electronics";

  const description =
    descriptionInput
      ? descriptionInput.value.trim()
      : "";

  if (!name) {
    showToast(
      "Enter a product name."
    );

    return;
  }

  if (
    !Number.isFinite(price) ||
    price <= 0
  ) {
    showToast(
      "Enter a valid price."
    );

    return;
  }

  let image = "";

  if (
    imageInput &&
    imageInput.files &&
    imageInput.files[0]
  ) {
    showToast(
      "Preparing product image..."
    );

    image =
      await compressImage(
        imageInput.files[0]
      );
  }

  const product = {
    id: createId("product"),
    name,
    price,
    category:
      CATEGORIES.includes(
        category
      ) &&
      category !== "All"
        ? category
        : "Electronics",
    description:
      description ||
      "A new product available on SM1THX.",
    image,
    createdAt:
      new Date().toISOString()
  };

  const products =
    getCustomProducts();

  products.push(product);

  saveCustomProducts(
    products
  );

  renderProducts();
  updateDashboard();

  trackEvent(
    "product_created",
    {
      productId:
        product.id,
      productName:
        product.name,
      price:
        product.price
    }
  );

  showToast(
    `${product.name} published successfully.`
  );

  resetSellerForm();
}

/* =====================================================
   LOCAL DEMO AI
   NO API
   NO OPENAI
   NO RENDER
===================================================== */

function detectDemoCategory(
  productName,
  selectedCategory
) {
  if (
    CATEGORIES.includes(
      selectedCategory
    ) &&
    selectedCategory !== "All"
  ) {
    return selectedCategory;
  }

  const name =
    productName.toLowerCase();

  const electronicsWords = [
    "phone",
    "iphone",
    "samsung",
    "galaxy",
    "laptop",
    "computer",
    "tablet",
    "ipad",
    "headphone",
    "earbud",
    "speaker",
    "camera",
    "television",
    "tv",
    "console",
    "gaming",
    "watch",
    "smart"
  ];

  const fashionWords = [
    "shoe",
    "sneaker",
    "shirt",
    "dress",
    "jacket",
    "jeans",
    "trouser",
    "hoodie",
    "fashion",
    "clothing"
  ];

  const homeWords = [
    "lamp",
    "chair",
    "table",
    "desk",
    "sofa",
    "bed",
    "kitchen",
    "home",
    "furniture",
    "decor"
  ];

  const beautyWords = [
    "beauty",
    "perfume",
    "makeup",
    "cosmetic",
    "lotion",
    "cream",
    "skin",
    "hair",
    "shampoo"
  ];

  const accessoryWords = [
    "bag",
    "backpack",
    "wallet",
    "belt",
    "case",
    "accessory",
    "sunglasses"
  ];

  if (
    electronicsWords.some(
      word =>
        name.includes(word)
    )
  ) {
    return "Electronics";
  }

  if (
    fashionWords.some(
      word =>
        name.includes(word)
    )
  ) {
    return "Fashion";
  }

  if (
    homeWords.some(
      word =>
        name.includes(word)
    )
  ) {
    return "Home";
  }

  if (
    beautyWords.some(
      word =>
        name.includes(word)
    )
  ) {
    return "Beauty";
  }

  if (
    accessoryWords.some(
      word =>
        name.includes(word)
    )
  ) {
    return "Accessories";
  }

  return "Accessories";
}

function getDemoFeatures(
  category
) {
  const features = {
    Electronics: [
      "Modern everyday design",
      "Designed for convenient daily use",
      "Practical choice for technology shoppers",
      "Clean and versatile style",
      "Suitable for everyday customers"
    ],

    Fashion: [
      "Modern everyday style",
      "Comfort-focused design",
      "Easy to pair with different looks",
      "Versatile for daily use",
      "Suitable for everyday wear"
    ],

    Home: [
      "Clean modern design",
      "Practical for everyday spaces",
      "Easy to style with your setup",
      "Versatile home use",
      "Suitable for modern interiors"
    ],

    Beauty: [
      "Simple everyday beauty option",
      "Easy to include in a routine",
      "Modern presentation",
      "Versatile everyday use",
      "Suitable for personal care shoppers"
    ],

    Accessories: [
      "Modern everyday style",
      "Practical design",
      "Easy to pair with different products",
      "Versatile daily use",
      "Suitable for everyday customers"
    ]
  };

  return (
    features[category] ||
    features.Accessories
  );
}

function buildDemoDescription(
  productName,
  category,
  originalDescription
) {
  const cleanOriginal =
    String(
      originalDescription || ""
    ).trim();

  if (cleanOriginal) {
    return (
      cleanOriginal +
      " " +
      `Discover ${productName} on SM1THX, a ${category.toLowerCase()} option designed for everyday shoppers.`
    );
  }

  return (
    `Discover ${productName} on SM1THX. ` +
    `This ${category.toLowerCase()} product is presented with a clean, practical listing designed to help customers understand what they are shopping for. ` +
    `A versatile choice for everyday use and online shopping.`
  );
}

function buildDemoSEO(
  productName,
  category
) {
  const cleanName =
    productName.trim();

  return [
    cleanName,
    `buy ${cleanName}`,
    `shop ${cleanName}`,
    `${category} Kenya`,
    `SM1THX ${cleanName}`
  ];
}

function buildDemoAdCaption(
  productName
) {
  return (
    `Discover ${productName} on SM1THX. ` +
    `Shop now and find your next everyday favorite.`
  );
}

function cleanProductTitle(
  productName
) {
  const clean =
    productName
      .replace(/\s+/g, " ")
      .trim();

  if (!clean) {
    return "New SM1THX Product";
  }

  return clean
    .split(" ")
    .map(
      word => {
        if (!word) {
          return word;
        }

        if (
          word.length <= 3 ||
          word ===
            word.toUpperCase()
        ) {
          return word;
        }

        return (
          word.charAt(0).toUpperCase() +
          word.slice(1)
        );
      }
    )
    .join(" ");
}

/* =====================================================
   GENERATE DEMO AI LISTING
===================================================== */

async function generateProductListing() {
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

  const resultBox =
    getElement(
      "aiProductResult"
    );

  const generateButton =
    getElement(
      "generateProductButton"
    );

  const productName =
    nameInput
      ? nameInput.value.trim()
      : "";

  const currentPrice =
    priceInput
      ? Number(priceInput.value) || 0
      : 0;

  const selectedCategory =
    categoryInput
      ? categoryInput.value
      : "";

  const currentDescription =
    descriptionInput
      ? descriptionInput.value.trim()
      : "";

  if (!productName) {
    showToast(
      "Enter a product name first."
    );

    if (nameInput) {
      nameInput.focus();
    }

    return;
  }

  if (generateButton) {
    generateButton.disabled =
      true;

    generateButton.dataset.originalText =
      generateButton.textContent;

    generateButton.textContent =
      "Creating listing...";
  }

  if (resultBox) {
    resultBox.style.display =
      "block";

    resultBox.innerHTML = `
      <div class="ai-product-result">
        <div class="ai-result-item">
          <strong>SM1THX Demo AI</strong>
          <p>
            Creating your product listing...
          </p>
        </div>
      </div>
    `;
  }

  /*
    Small delay makes the demo feel like
    an AI assistant while everything is
    still generated locally in the browser.
  */

  await new Promise(
    resolve =>
      setTimeout(
        resolve,
        500
      )
  );

  try {
    const category =
      detectDemoCategory(
        productName,
        selectedCategory
      );

    const title =
      cleanProductTitle(
        productName
      );

    const description =
      buildDemoDescription(
        productName,
        category,
        currentDescription
      );

    const features =
      getDemoFeatures(
        category
      );

    const seoKeywords =
      buildDemoSEO(
        productName,
        category
      );

    const adCaption =
      buildDemoAdCaption(
        productName
      );

    latestAIProduct = {
      title,
      description,
      category,
      price: currentPrice,
      features,
      seo_keywords:
        seoKeywords,
      ad_caption:
        adCaption
    };

    const titleOutput =
      getElement(
        "aiGeneratedTitle"
      );

    const descriptionOutput =
      getElement(
        "aiGeneratedDescription"
      );

    const categoryOutput =
      getElement(
        "aiGeneratedCategory"
      );

    const priceOutput =
      getElement(
        "aiGeneratedPrice"
      );

    const featuresOutput =
      getElement(
        "aiGeneratedFeatures"
      );

    const seoOutput =
      getElement(
        "aiGeneratedSEO"
      );

    const adOutput =
      getElement(
        "aiGeneratedAd"
      );

    if (titleOutput) {
      titleOutput.textContent =
        title;
    }

    if (descriptionOutput) {
      descriptionOutput.textContent =
        description;
    }

    if (categoryOutput) {
      categoryOutput.textContent =
        category;
    }

    if (priceOutput) {
      priceOutput.textContent =
        currentPrice > 0
          ? formatKES(
              currentPrice
            )
          : "Add a price";
    }

    if (featuresOutput) {
      featuresOutput.innerHTML =
        features
          .map(
            feature =>
              `<li>${escapeHTML(
                feature
              )}</li>`
          )
          .join("");
    }

    if (seoOutput) {
      seoOutput.textContent =
        seoKeywords.join(
          ", "
        );
    }

    if (adOutput) {
      adOutput.textContent =
        adCaption;
    }

    if (resultBox) {
      resultBox.style.display =
        "block";
    }

    trackEvent(
      "demo_ai_generation",
      {
        productName,
        category
      }
    );

    showToast(
      "SM1THX Demo AI created your listing."
    );
  } catch (error) {
    console.error(
      "Demo AI error:",
      error
    );

    showToast(
      "Could not create the listing."
    );
  } finally {
    if (generateButton) {
      generateButton.disabled =
        false;

      generateButton.textContent =
        generateButton.dataset.originalText ||
        "Generate with AI";
    }
  }
}

/* =====================================================
   APPLY DEMO AI LISTING
===================================================== */

function applyAIProductListing() {
  if (!latestAIProduct) {
    showToast(
      "Generate a listing first."
    );

    return;
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

  if (nameInput) {
    nameInput.value =
      latestAIProduct.title;
  }

  if (
    categoryInput &&
    CATEGORIES.includes(
      latestAIProduct.category
    )
  ) {
    categoryInput.value =
      latestAIProduct.category;
  }

  if (
    priceInput &&
    Number(
      latestAIProduct.price
    ) > 0
  ) {
    priceInput.value =
      latestAIProduct.price;
  }

  if (descriptionInput) {
    let finalDescription =
      latestAIProduct.description;

    if (
      Array.isArray(
        latestAIProduct.features
      ) &&
      latestAIProduct.features
        .length
    ) {
      finalDescription +=
        "\n\nKey features:\n" +
        latestAIProduct.features
          .map(
            feature =>
              "• " + feature
          )
          .join("\n");
    }

    descriptionInput.value =
      finalDescription;
  }

  showToast(
    "AI listing applied to your product."
  );
}

/* =====================================================
   DASHBOARD
===================================================== */

function getDailyVisitorCount() {
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
    saved &&
    saved.date === today
  ) {
    return Number(
      saved.count || 0
    );
  }

  return 0;
}

function updateDashboard() {
  const analytics =
    getAnalytics();

  const customProducts =
    getCustomProducts();

  const totalProducts =
    DEFAULT_PRODUCTS.length +
    customProducts.length;

  const visitors =
    getDailyVisitorCount();

  const ordersElement =
    getElement(
      "dashboardOrders"
    );

  const revenueElement =
    getElement(
      "dashboardRevenue"
    );

  const productsElement =
    getElement(
      "dashboardProducts"
    );

  const visitorsElement =
    getElement(
      "dashboardVisitors"
    );

  if (ordersElement) {
    ordersElement.textContent =
      String(
        analytics.orders
      );
  }

  if (revenueElement) {
    revenueElement.textContent =
      formatKES(
        analytics.revenue
      );
  }

  if (productsElement) {
    productsElement.textContent =
      String(
        totalProducts
      );
  }

  if (visitorsElement) {
    visitorsElement.textContent =
      String(
        visitors
      );
  }

  /*
    Compatibility with alternate
    dashboard IDs used by earlier MVP
    versions.
  */

  const ordersAlt =
    getElement("ordersCount");

  const revenueAlt =
    getElement("revenueCount");

  const productsAlt =
    getElement("productsCount");

  const visitorsAlt =
    getElement("visitorsCount");

  if (ordersAlt) {
    ordersAlt.textContent =
      String(
        analytics.orders
      );
  }

  if (revenueAlt) {
    revenueAlt.textContent =
      formatKES(
        analytics.revenue
      );
  }

  if (productsAlt) {
    productsAlt.textContent =
      String(
        totalProducts
      );
  }

  if (visitorsAlt) {
    visitorsAlt.textContent =
      String(
        visitors
      );
  }
}

/* =====================================================
   DEMO CHECKOUT
===================================================== */

function checkout() {
  const cart =
    getCart();

  if (!cart.length) {
    showToast(
      "Your cart is empty."
    );

    return;
  }

  const totals =
    calculateCartTotals();

  const analytics =
    getAnalytics();

  analytics.orders += 1;

  analytics.revenue +=
    totals.total;

  saveAnalytics(
    analytics
  );

  trackEvent(
    "checkout",
    {
      amount:
        totals.total,
      items:
        getCartCount()
    }
  );

  clearCart();

  updateCartUI();
  updateDashboard();

  closeCart();

  showToast(
    "Demo checkout completed successfully."
  );
}

/* =====================================================
   CHECKOUT ALIASES
===================================================== */

function demoCheckout() {
  checkout();
}

function handleCheckout() {
  checkout();
}

/* =====================================================
   UPDATES / UPDATE MANAGER
===================================================== */

function setupUpdateManager() {
  const updateButton =
    getElement(
      "checkUpdatesButton"
    );

  if (!updateButton) {
    return;
  }

  updateButton.addEventListener(
    "click",
    () => {
      showToast(
        "SM1THX is up to date."
      );

      const status =
        getElement(
          "updateStatus"
        );

      if (status) {
        status.textContent =
          "System checked — no update required.";
      }
    }
  );
}

function checkForUpdates() {
  showToast(
    "SM1THX is up to date."
  );
}

/* =====================================================
   TOAST
===================================================== */

function showToast(message) {
  let toast =
    getElement(
      "toast"
    );

  if (!toast) {
    toast =
      document.createElement(
        "div"
      );

    toast.id =
      "toast";

    toast.className =
      "toast";

    document.body.appendChild(
      toast
    );
  }

  toast.textContent =
    String(message);

  toast.classList.add(
    "show"
  );

  if (toastTimer) {
    clearTimeout(
      toastTimer
    );
  }

  toastTimer =
    setTimeout(
      () => {
        toast.classList.remove(
          "show"
        );
      },
      2800
    );
}

/* =====================================================
   NAVIGATION
===================================================== */

function scrollToSection(
  sectionId
) {
  const section =
    getElement(
      sectionId
    );

  if (!section) {
    return;
  }

  section.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

function setupNavigation() {
  document
    .querySelectorAll(
      "[data-scroll]"
    )
    .forEach(
      element => {
        element.addEventListener(
          "click",
          event => {
            event.preventDefault();

            const target =
              element.dataset
                .scroll;

            if (target) {
              scrollToSection(
                target
              );
            }
          }
        );
      }
    );
}

/* =====================================================
   LOGIN / DEMO ACCOUNT
===================================================== */

function openLogin() {
  const modal =
    getElement(
      "loginModal"
    );

  if (!modal) {
    return;
  }

  modal.classList.add(
    "open"
  );

  modal.setAttribute(
    "aria-hidden",
    "false"
  );
}

function closeLogin() {
  const modal =
    getElement(
      "loginModal"
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

function handleLogin(
  event
) {
  if (event) {
    event.preventDefault();
  }

  closeLogin();

  showToast(
    "Demo login successful."
  );
}

/* =====================================================
   KEYBOARD CONTROLS
===================================================== */

function setupKeyboardControls() {
  document.addEventListener(
    "keydown",
    event => {
      if (
        event.key ===
        "Escape"
      ) {
        closeCart();
        closeProductModal();
        closeLogin();
      }
    }
  );
}

/* =====================================================
   CLICK OUTSIDE MODALS
===================================================== */

function setupModalClosing() {
  const productModal =
    getElement(
      "productModal"
    );

  if (productModal) {
    productModal.addEventListener(
      "click",
      event => {
        if (
          event.target ===
          productModal
        ) {
          closeProductModal();
        }
      }
    );
  }

  const loginModal =
    getElement(
      "loginModal"
    );

  if (loginModal) {
    loginModal.addEventListener(
      "click",
      event => {
        if (
          event.target ===
          loginModal
        ) {
          closeLogin();
        }
      }
    );
  }
}

/* =====================================================
   EVENT BINDINGS
===================================================== */

function setupEventBindings() {
  const sellerForm =
    getElement(
      "sellerProductForm"
    );

  if (sellerForm) {
    sellerForm.addEventListener(
      "submit",
      createSellerProduct
    );
  }

  const cartButton =
    getElement(
      "cartButton"
    );

  if (cartButton) {
    cartButton.addEventListener(
      "click",
      openCart
    );
  }

  const closeCartButton =
    getElement(
      "closeCartButton"
    );

  if (closeCartButton) {
    closeCartButton.addEventListener(
      "click",
      closeCart
    );
  }

  const checkoutButton =
    getElement(
      "checkoutButton"
    );

  if (checkoutButton) {
    checkoutButton.addEventListener(
      "click",
      checkout
    );
  }

  const clearCartButton =
    getElement(
      "clearCartButton"
    );

  if (clearCartButton) {
    clearCartButton.addEventListener(
      "click",
      clearShoppingCart
    );
  }

  const closeProductButton =
    getElement(
      "closeProductModalButton"
    );

  if (closeProductButton) {
    closeProductButton.addEventListener(
      "click",
      closeProductModal
    );
  }

  const modalCartButton =
    getElement(
      "modalAddToCartButton"
    );

  if (modalCartButton) {
    modalCartButton.addEventListener(
      "click",
      addModalProductToCart
    );
  }

  const closeLoginButton =
    getElement(
      "closeLoginButton"
    );

  if (closeLoginButton) {
    closeLoginButton.addEventListener(
      "click",
      closeLogin
    );
  }

  const loginForm =
    getElement(
      "loginForm"
    );

  if (loginForm) {
    loginForm.addEventListener(
      "submit",
      handleLogin
    );
  }

  const generateButton =
    getElement(
      "generateProductButton"
    );

  if (generateButton) {
    generateButton.addEventListener(
      "click",
      generateProductListing
    );
  }

  const applyAIButton =
    getElement(
      "applyAIProductButton"
    );

  if (applyAIButton) {
    applyAIButton.addEventListener(
      "click",
      applyAIProductListing
    );
  }

  const closeCartOverlay =
    getElement(
      "cartOverlay"
    );

  if (closeCartOverlay) {
    closeCartOverlay.addEventListener(
      "click",
      closeCart
    );
  }
}

/* =====================================================
   INITIALIZE
===================================================== */

function initSmithX() {
  setupCategories();
  setupSellerCategory();
  setupSearch();
  setupImagePreview();
  setupNavigation();
  setupUpdateManager();
  setupEventBindings();
  setupKeyboardControls();
  setupModalClosing();

  normalizeCart();
  updateCartUI();

  renderProducts();

  trackDailyVisitor();
  updateDashboard();

  console.log(
    "SM1THX MVP initialized successfully."
  );
  console.log(
    "SM1THX Demo AI is running locally."
  );
}

/* =====================================================
   START APP
===================================================== */

if (
  document.readyState ===
  "loading"
) {
  document.addEventListener(
    "DOMContentLoaded",
    initSmithX
  );
} else {
  initSmithX();
}

/* =====================================================
   GLOBAL COMPATIBILITY
   Allows existing HTML onclick handlers
   to continue working.
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

window.openProductModal =
  openProductModal;

window.closeProductModal =
  closeProductModal;

window.addModalProductToCart =
  addModalProductToCart;

window.generateProductListing =
  generateProductListing;

window.applyAIProductListing =
  applyAIProductListing;

window.createSellerProduct =
  createSellerProduct;

window.checkout =
  checkout;

window.demoCheckout =
  demoCheckout;

window.handleCheckout =
  handleCheckout;

window.openLogin =
  openLogin;

window.closeLogin =
  closeLogin;

window.handleLogin =
  handleLogin;

window.checkForUpdates =
  checkForUpdates;

window.scrollToSection =
  scrollToSection;
