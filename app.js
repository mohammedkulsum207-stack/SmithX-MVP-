/* =========================================================
   SMITHX MVP — APP.JS
   Version 3.0
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
    description: "Premium flagship smartphone with advanced performance, camera technology and a modern design.",
    image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "default-2",
    name: "Smart Wireless Headphones",
    price: 4500,
    category: "Electronics",
    description: "Wireless headphones with a comfortable design and immersive sound.",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "default-3",
    name: "Minimal Desk Lamp",
    price: 2800,
    category: "Home",
    description: "Clean modern desk lamp designed for workspaces, bedrooms and study areas.",
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "default-4",
    name: "Everyday Travel Backpack",
    price: 3500,
    category: "Accessories",
    description: "Lightweight everyday backpack for school, work, travel and daily use.",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "default-5",
    name: "Smart Watch",
    price: 6500,
    category: "Electronics",
    description: "Modern smartwatch for everyday activity tracking, notifications and convenience.",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "default-6",
    name: "Premium Sneakers",
    price: 7200,
    category: "Fashion",
    description: "Modern everyday sneakers combining comfort, style and versatility.",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80"
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
   STORAGE KEYS
   ========================================================= */

const STORAGE = {
  products: "smithx_custom_products_v2",
  cart: "smithx_cart_v2",
  analytics: "smithx_analytics_v2",
  visitor: "smithx_daily_visitor_v2"
};

const DEMO_USER_KEY = "smithx_demo_user_v1";

/* =========================================================
   GLOBAL STATE
   ========================================================= */

let currentCategory = "All";
let currentSearch = "";
let currentProductId = null;

/* =========================================================
   BASIC HELPERS
   ========================================================= */

function formatKES(value) {
  const number = Number(value) || 0;

  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0
  }).format(number);
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

/* =========================================================
   PRODUCT STORAGE
   ========================================================= */

function getCustomProducts() {
  return safeJSONParse(
    localStorage.getItem(STORAGE.products),
    []
  );
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

/* =========================================================
   CART STORAGE
   ========================================================= */

function getCart() {
  return safeJSONParse(
    localStorage.getItem(STORAGE.cart),
    []
  );
}

function saveCart(cart) {
  localStorage.setItem(
    STORAGE.cart,
    JSON.stringify(cart)
  );
}

/* =========================================================
   ANALYTICS
   ========================================================= */

function getAnalytics() {
  return safeJSONParse(
    localStorage.getItem(STORAGE.analytics),
    {
      visitors: 0,
      orders: 0,
      revenue: 0,
      productViews: 0
    }
  );
}

function saveAnalytics(data) {
  localStorage.setItem(
    STORAGE.analytics,
    JSON.stringify(data)
  );
}

function trackEvent(type, amount = 0) {
  const analytics = getAnalytics();

  if (type === "visitor") {
    analytics.visitors += 1;
  }

  if (type === "order") {
    analytics.orders += 1;
    analytics.revenue += Number(amount) || 0;
  }

  if (type === "productView") {
    analytics.productViews += 1;
  }

  saveAnalytics(analytics);

  updateDashboard();
}

function trackDailyVisitor() {
  const today = new Date().toISOString().split("T")[0];
  const previous = localStorage.getItem(STORAGE.visitor);

  if (previous !== today) {
    localStorage.setItem(STORAGE.visitor, today);
    trackEvent("visitor");
  }
}

/* =========================================================
   CATEGORY FILTER
   ========================================================= */

function setupCategories() {
  const container =
    document.getElementById("categoryFilters");

  if (!container) return;

  container.innerHTML = CATEGORIES.map(category => `
    <button
      type="button"
      class="category-btn ${category === currentCategory ? "active" : ""}"
      data-category="${escapeHTML(category)}"
    >
      ${escapeHTML(category)}
    </button>
  `).join("");

  container.querySelectorAll(".category-btn")
    .forEach(button => {
      button.addEventListener("click", () => {
        currentCategory =
          button.dataset.category || "All";

        container.querySelectorAll(".category-btn")
          .forEach(btn => btn.classList.remove("active"));

        button.classList.add("active");

        renderProducts();
      });
    });
}

/* =========================================================
   SELLER CATEGORY
   ========================================================= */

function setupSellerCategory() {
  const select =
    document.getElementById("productCategory");

  if (!select) return;

  select.innerHTML = CATEGORIES
    .filter(category => category !== "All")
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
    document.getElementById("productsGrid");

  if (!grid) return;

  const search =
    currentSearch.trim().toLowerCase();

  const products = getAllProducts().filter(product => {
    const matchesCategory =
      currentCategory === "All" ||
      product.category === currentCategory;

    const searchableText = `
      ${product.name}
      ${product.description}
      ${product.category}
    `.toLowerCase();

    const matchesSearch =
      !search ||
      searchableText.includes(search);

    return matchesCategory && matchesSearch;
  });

  if (!products.length) {
    grid.innerHTML = `
      <div class="empty-state">
        <h3>No products found</h3>
        <p>Try another search or category.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = products.map(product => `
    <article class="product-card">
      <button
        type="button"
        class="product-image-button"
        onclick="openProductModal('${escapeHTML(product.id)}')"
        aria-label="View ${escapeHTML(product.name)}"
      >
        <img
          src="${escapeHTML(product.image)}"
          alt="${escapeHTML(product.name)}"
          loading="lazy"
          onerror="this.src='https://via.placeholder.com/800x600?text=SmithX+Product'"
        >
      </button>

      <div class="product-card-body">
        <span class="product-category">
          ${escapeHTML(product.category)}
        </span>

        <h3>${escapeHTML(product.name)}</h3>

        <p>
          ${escapeHTML(product.description)}
        </p>

        <div class="product-card-bottom">
          <strong>${formatKES(product.price)}</strong>

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
  `).join("");
}

/* =========================================================
   PRODUCT MODAL
   ========================================================= */

function openProductModal(productId) {
  const product =
    getAllProducts().find(item => item.id === productId);

  if (!product) return;

  currentProductId = productId;

  const modal =
    document.getElementById("productModal");

  const content =
    document.getElementById("productModalContent");

  if (!modal || !content) return;

  content.innerHTML = `
    <div class="product-modal-layout">

      <div class="product-modal-image">
        <img
          src="${escapeHTML(product.image)}"
          alt="${escapeHTML(product.name)}"
          onerror="this.src='https://via.placeholder.com/800x600?text=SmithX+Product'"
        >
      </div>

      <div class="product-modal-info">

        <span class="product-category">
          ${escapeHTML(product.category)}
        </span>

        <h2>${escapeHTML(product.name)}</h2>

        <div class="modal-price">
          ${formatKES(product.price)}
        </div>

        <p>
          ${escapeHTML(product.description)}
        </p>

        <button
          type="button"
          class="primary-button"
          onclick="addToCart('${escapeHTML(product.id)}'); closeProductModal();"
        >
          Add to cart
        </button>

      </div>

    </div>
  `;

  modal.classList.add("active");

  trackEvent("productView");
}

function closeProductModal() {
  const modal =
    document.getElementById("productModal");

  if (modal) {
    modal.classList.remove("active");
  }

  currentProductId = null;
}

/* =========================================================
   CART
   ========================================================= */

function addToCart(productId) {
  const product =
    getAllProducts().find(item => item.id === productId);

  if (!product) return;

  const cart = getCart();

  const existing =
    cart.find(item => item.id === productId);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      quantity: 1
    });
  }

  saveCart(cart);

  renderCart();
  updateCartCount();

  showToast(`${product.name} added to cart.`);
}

function removeFromCart(productId) {
  let cart = getCart();

  cart = cart.filter(
    item => item.id !== productId
  );

  saveCart(cart);

  renderCart();
  updateCartCount();
}

function changeCartQuantity(productId, amount) {
  const cart = getCart();

  const item =
    cart.find(cartItem => cartItem.id === productId);

  if (!item) return;

  item.quantity += amount;

  if (item.quantity <= 0) {
    removeFromCart(productId);
    return;
  }

  saveCart(cart);

  renderCart();
  updateCartCount();
}

function renderCart() {
  const container =
    document.getElementById("cartItems");

  const subtotalElement =
    document.getElementById("cartSubtotal");

  const totalElement =
    document.getElementById("cartTotal");

  if (!container) return;

  const cart = getCart();

  if (!cart.length) {
    container.innerHTML = `
      <div class="empty-cart">
        <div class="empty-cart-icon">🛒</div>
        <h3>Your cart is empty</h3>
        <p>Add products from the marketplace.</p>
      </div>
    `;

    if (subtotalElement) {
      subtotalElement.textContent = formatKES(0);
    }

    if (totalElement) {
      totalElement.textContent = formatKES(0);
    }

    return;
  }

  let subtotal = 0;

  container.innerHTML = cart.map(item => {
    const product =
      getAllProducts().find(
        productItem => productItem.id === item.id
      );

    if (!product) return "";

    const quantity =
      Number(item.quantity) || 1;

    const lineTotal =
      Number(product.price) * quantity;

    subtotal += lineTotal;

    return `
      <div class="cart-item">

        <img
          src="${escapeHTML(product.image)}"
          alt="${escapeHTML(product.name)}"
          onerror="this.src='https://via.placeholder.com/200x150?text=SmithX'"
        >

        <div class="cart-item-info">

          <h4>${escapeHTML(product.name)}</h4>

          <strong>
            ${formatKES(product.price)}
          </strong>

          <div class="cart-quantity">

            <button
              type="button"
              onclick="changeCartQuantity('${escapeHTML(product.id)}', -1)"
            >
              −
            </button>

            <span>${quantity}</span>

            <button
              type="button"
              onclick="changeCartQuantity('${escapeHTML(product.id)}', 1)"
            >
              +
            </button>

          </div>

          <button
            type="button"
            class="remove-cart-item"
            onclick="removeFromCart('${escapeHTML(product.id)}')"
          >
            Remove
          </button>

        </div>

      </div>
    `;
  }).join("");

  if (subtotalElement) {
    subtotalElement.textContent =
      formatKES(subtotal);
  }

  if (totalElement) {
    totalElement.textContent =
      formatKES(subtotal);
  }
}

function updateCartCount() {
  const element =
    document.getElementById("cartCount");

  if (!element) return;

  const total =
    getCart().reduce(
      (sum, item) =>
        sum + (Number(item.quantity) || 0),
      0
    );

  element.textContent = total;
}

function openCart() {
  const panel =
    document.getElementById("cartPanel");

  if (!panel) return;

  panel.classList.add("active");

  renderCart();
}

function closeCart() {
  const panel =
    document.getElementById("cartPanel");

  if (panel) {
    panel.classList.remove("active");
  }
}

/* =========================================================
   DEMO CHECKOUT
   ========================================================= */

function demoCheckout() {
  const cart = getCart();

  if (!cart.length) {
    showToast("Your cart is empty.");
    return;
  }

  let total = 0;

  cart.forEach(item => {
    const product =
      getAllProducts().find(
        productItem => productItem.id === item.id
      );

    if (product) {
      total +=
        Number(product.price) *
        Number(item.quantity || 1);
    }
  });

  trackEvent("order", total);

  localStorage.removeItem(STORAGE.cart);

  renderCart();
  updateCartCount();

  showToast(
    "Demo checkout complete. Thank you for testing SmithX!"
  );
}

/* =========================================================
   IMAGE COMPRESSION
   ========================================================= */

function compressImage(file, maxWidth = 1200, quality = 0.82) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("No image selected."));
      return;
    }

    const reader = new FileReader();

    reader.onload = event => {
      const img = new Image();

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          const ratio = maxWidth / width;

          width = maxWidth;
          height = Math.round(height * ratio);
        }

        const canvas =
          document.createElement("canvas");

        canvas.width = width;
        canvas.height = height;

        const context =
          canvas.getContext("2d");

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

      img.onerror = reject;
      img.src = event.target.result;
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/* =========================================================
   IMAGE PREVIEW
   ========================================================= */

function setupImagePreview() {
  const input =
    document.getElementById("productImage");

  const preview =
    document.getElementById("imagePreview");

  const previewImage =
    document.getElementById("previewImage");

  if (!input || !preview || !previewImage) {
    return;
  }

  input.addEventListener("change", () => {
    const file = input.files?.[0];

    if (!file) {
      preview.style.display = "none";
      previewImage.src = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = event => {
      previewImage.src = event.target.result;
      preview.style.display = "block";
    };

    reader.readAsDataURL(file);
  });
}

/* =========================================================
   PUBLISH PRODUCT
   ========================================================= */

async function publishProduct(event) {
  if (event) {
    event.preventDefault();
  }

  const nameInput =
    document.getElementById("productName");

  const priceInput =
    document.getElementById("productPrice");

  const descriptionInput =
    document.getElementById("productDescription");

  const categoryInput =
    document.getElementById("productCategory");

  const imageInput =
    document.getElementById("productImage");

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
    Number(priceInput.value);

  const description =
    descriptionInput.value.trim();

  const category =
    categoryInput?.value || "Electronics";

  if (!name) {
    showToast("Please enter a product name.");
    return;
  }

  if (!price || price <= 0) {
    showToast("Please enter a valid price.");
    return;
  }

  if (!description) {
    showToast("Please add a product description.");
    return;
  }

  const customProducts =
    getCustomProducts();

  if (customProducts.length >= 3) {
    showToast(
      "Demo limit reached. You can publish up to 3 custom products."
    );
    return;
  }

  let image =
    "https://via.placeholder.com/900x700?text=SmithX+Product";

  if (imageInput?.files?.[0]) {
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

  customProducts.push(product);

  saveCustomProducts(customProducts);

  nameInput.value = "";
  priceInput.value = "";
  descriptionInput.value = "";

  if (imageInput) {
    imageInput.value = "";
  }

  const preview =
    document.getElementById("imagePreview");

  const previewImage =
    document.getElementById("previewImage");

  if (preview) {
    preview.style.display = "none";
  }

  if (previewImage) {
    previewImage.src = "";
  }

  renderProducts();
  updateDashboard();

  showToast(
    "Product published successfully!"
  );

  document
    .getElementById("market")
    ?.scrollIntoView({
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

  const dashboardProducts =
    document.getElementById("dashboardProducts");

  const dashboardOrders =
    document.getElementById("dashboardOrders");

  const dashboardRevenue =
    document.getElementById("dashboardRevenue");

  const dashboardVisitors =
    document.getElementById("dashboardVisitors");

  if (dashboardProducts) {
    dashboardProducts.textContent =
      products.length;
  }

  if (dashboardOrders) {
    dashboardOrders.textContent =
      analytics.orders;
  }

  if (dashboardRevenue) {
    dashboardRevenue.textContent =
      formatKES(analytics.revenue);
  }

  if (dashboardVisitors) {
    dashboardVisitors.textContent =
      analytics.visitors;
  }
}

function resetAnalytics() {
  localStorage.removeItem(STORAGE.analytics);

  updateDashboard();

  showToast(
    "Demo analytics have been reset."
  );
}

/* =========================================================
   UPDATES
   ========================================================= */

function setupUpdatesToggle() {
  const button =
    document.getElementById("updatesToggle");

  const history =
    document.getElementById("updateHistory");

  if (!button || !history) return;

  button.addEventListener("click", () => {
    const hidden =
      history.style.display === "none" ||
      history.style.display === "";

    history.style.display =
      hidden ? "block" : "none";

    button.textContent =
      hidden ? "Hide updates" : "View updates";
  });
}

/* =========================================================
   NAVIGATION
   ========================================================= */

function setupNavigation() {
  document
    .querySelectorAll('a[href^="#"]')
    .forEach(link => {
      link.addEventListener("click", event => {
        const targetId =
          link.getAttribute("href");

        if (
          !targetId ||
          targetId === "#"
        ) {
          return;
        }

        const target =
          document.querySelector(targetId);

        if (!target) return;

        event.preventDefault();

        target.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      });
    });
}

/* =========================================================
   SEARCH
   ========================================================= */

function setupSearch() {
  const searchInput =
    document.getElementById("productSearch");

  if (!searchInput) return;

  searchInput.addEventListener(
    "input",
    () => {
      currentSearch =
        searchInput.value || "";

      renderProducts();
    }
  );
}

/* =========================================================
   TOAST
   ========================================================= */

function showToast(message) {
  const toast =
    document.getElementById("toast");

  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(
    showToast.timeout
  );

  showToast.timeout =
    setTimeout(() => {
      toast.classList.remove("show");
    }, 2800);
}

/* =========================================================
   DEMO LOGIN SYSTEM
   ========================================================= */

function getDemoUser() {
  return safeJSONParse(
    localStorage.getItem(DEMO_USER_KEY),
    null
  );
}

function saveDemoUser(user) {
  localStorage.setItem(
    DEMO_USER_KEY,
    JSON.stringify(user)
  );
}

/* =========================================================
   OPEN LOGIN
   ========================================================= */

function openLogin() {
  const overlay =
    document.getElementById("loginOverlay");

  if (!overlay) return;

  overlay.classList.add("active");

  document.body.classList.add(
    "login-open"
  );

  showLoginForm();

  setTimeout(() => {
    document
      .getElementById("loginEmail")
      ?.focus();
  }, 150);
}

/* =========================================================
   CLOSE LOGIN
   ========================================================= */

function closeLogin() {
  const overlay =
    document.getElementById("loginOverlay");

  if (!overlay) return;

  overlay.classList.remove("active");

  document.body.classList.remove(
    "login-open"
  );
}

/* =========================================================
   LOGIN / REGISTER TABS
   ========================================================= */

function showLoginForm() {
  const loginSection =
    document.getElementById(
      "loginFormSection"
    );

  const registerSection =
    document.getElementById(
      "registerFormSection"
    );

  if (loginSection) {
    loginSection.style.display =
      "block";
  }

  if (registerSection) {
    registerSection.style.display =
      "none";
  }
}

function showRegisterForm() {
  const loginSection =
    document.getElementById(
      "loginFormSection"
    );

  const registerSection =
    document.getElementById(
      "registerFormSection"
    );

  if (loginSection) {
    loginSection.style.display =
      "none";
  }

  if (registerSection) {
    registerSection.style.display =
      "block";
  }
}

/* =========================================================
   PASSWORD VISIBILITY
   ========================================================= */

function togglePassword(inputId, button) {
  const input =
    document.getElementById(inputId);

  if (!input) return;

  if (input.type === "password") {
    input.type = "text";

    if (button) {
      button.textContent = "Hide";
    }
  } else {
    input.type = "password";

    if (button) {
      button.textContent = "Show";
    }
  }
}

/* =========================================================
   DEMO REGISTER
   ========================================================= */

function demoRegister(event) {
  if (event) {
    event.preventDefault();
  }

  const name =
    document
      .getElementById("registerName")
      ?.value
      .trim();

  const email =
    document
      .getElementById("registerEmail")
      ?.value
      .trim()
      .toLowerCase();

  const password =
    document
      .getElementById("registerPassword")
      ?.value;

  const accountType =
    document
      .getElementById("accountType")
      ?.value || "Seller";

  if (!name) {
    showToast("Please enter your name.");
    return;
  }

  if (!email) {
    showToast("Please enter your email.");
    return;
  }

  if (!password || password.length < 4) {
    showToast(
      "Password must contain at least 4 characters."
    );
    return;
  }

  /*
    DEMO ONLY:
    The password is intentionally NOT stored.
    This is not real production authentication.
  */

  const user = {
    name,
    email,
    accountType,
    loggedIn: true,
    createdAt: new Date().toISOString()
  };

  saveDemoUser(user);

  updateLoginButton();

  closeLogin();

  showToast(
    `Welcome to SmithX, ${name}!`
  );
}

/* =========================================================
   DEMO LOGIN
   ========================================================= */

function demoLogin(event) {
  if (event) {
    event.preventDefault();
  }

  const email =
    document
      .getElementById("loginEmail")
      ?.value
      .trim()
      .toLowerCase();

  const password =
    document
      .getElementById("loginPassword")
      ?.value;

  const user =
    getDemoUser();

  if (!email) {
    showToast(
      "Please enter your email."
    );
    return;
  }

  if (!password) {
    showToast(
      "Please enter your password."
    );
    return;
  }

  if (!user) {
    showToast(
      "No demo account found. Create an account first."
    );

    showRegisterForm();

    const registerEmail =
      document.getElementById(
        "registerEmail"
      );

    if (registerEmail) {
      registerEmail.value = email;
    }

    return;
  }

  if (user.email !== email) {
    showToast(
      "Email does not match the demo account."
    );
    return;
  }

  user.loggedIn = true;

  saveDemoUser(user);

  updateLoginButton();

  closeLogin();

  showToast(
    `Welcome back, ${user.name}!`
  );
}

/* =========================================================
   LOGOUT
   ========================================================= */

function logoutDemoUser() {
  const user =
    getDemoUser();

  if (!user) return;

  user.loggedIn = false;

  saveDemoUser(user);

  updateLoginButton();

  showToast(
    "You have been logged out."
  );
}

/* =========================================================
   LOGIN BUTTON
   ========================================================= */

function updateLoginButton() {
  /*
    IMPORTANT:
    We use ONE button only.
    This prevents duplicate login buttons
    and keeps the button visible on mobile.
  */

  let loginButton =
    document.getElementById(
      "smithxLoginButton"
    );

  /*
    Compatibility with the previous HTML
    in case the old ID still exists.
  */

  if (!loginButton) {
    loginButton =
      document.getElementById(
        "loginNavButton"
      );
  }

  if (!loginButton) return;

  const user =
    getDemoUser();

  if (user && user.loggedIn) {
    loginButton.textContent =
      `👤 ${user.name}`;

    loginButton.onclick =
      logoutDemoUser;

    loginButton.title =
      "Click to logout";

    loginButton.setAttribute(
      "aria-label",
      `Logout ${user.name}`
    );
  } else {
    loginButton.textContent =
      "Login";

    loginButton.onclick =
      openLogin;

    loginButton.title =
      "Login to SmithX";

    loginButton.setAttribute(
      "aria-label",
      "Login to SmithX"
    );
  }
}

/* =========================================================
   LOGIN CONTROLS
   ========================================================= */

function setupLoginControls() {
  const overlay =
    document.getElementById(
      "loginOverlay"
    );

  const loginForm =
    document.getElementById(
      "loginForm"
    );

  const registerForm =
    document.getElementById(
      "registerForm"
    );

  if (loginForm) {
    loginForm.addEventListener(
      "submit",
      demoLogin
    );
  }

  if (registerForm) {
    registerForm.addEventListener(
      "submit",
      demoRegister
    );
  }

  /*
    Clicking the dark area outside
    the login card closes the popup.
  */

  if (overlay) {
    overlay.addEventListener(
      "click",
      event => {
        if (event.target === overlay) {
          closeLogin();
        }
      }
    );
  }

  /*
    Prevent clicks inside the login card
    from closing the popup.
  */

  const loginCard =
    document.querySelector(
      ".login-card"
    );

  if (loginCard) {
    loginCard.addEventListener(
      "click",
      event => {
        event.stopPropagation();
      }
    );
  }
}

/* =========================================================
   AUTOMATIC LOGIN POPUP
   ========================================================= */

function showAutomaticLogin() {
  const user =
    getDemoUser();

  /*
    If the visitor is already logged in,
    do not show the popup.
  */

  if (
    user &&
    user.loggedIn
  ) {
    return;
  }

  /*
    Small delay gives the SmithX page
    time to render before the popup appears.
  */

  setTimeout(() => {
    openLogin();
  }, 500);
}

/* =========================================================
   KEYBOARD CONTROLS
   ========================================================= */

function setupKeyboardControls() {
  document.addEventListener(
    "keydown",
    event => {
      if (event.key !== "Escape") {
        return;
      }

      closeProductModal();
      closeCart();
      closeLogin();
    }
  );
}

/* =========================================================
   INITIALIZATION
   ========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    /* Product marketplace */
    setupCategories();
    setupSellerCategory();
    renderProducts();

    /* Cart */
    renderCart();
    updateCartCount();

    /* Seller image upload */
    setupImagePreview();

    /* Search */
    setupSearch();

    /* Navigation */
    setupNavigation();

    /* Updates */
    setupUpdatesToggle();

    /* Analytics */
    trackDailyVisitor();
    updateDashboard();

    /* Login */
    setupLoginControls();
    updateLoginButton();

    /*
      Automatically open login for
      visitors who are not logged in.
    */
    showAutomaticLogin();

    /* Keyboard */
    setupKeyboardControls();
  }
);

/* =========================================================
   GLOBAL FUNCTIONS
   ========================================================= */

window.openLogin = openLogin;
window.closeLogin = closeLogin;

window.showLoginForm =
  showLoginForm;

window.showRegisterForm =
  showRegisterForm;

window.togglePassword =
  togglePassword;

window.demoLogin =
  demoLogin;

window.demoRegister =
  demoRegister;

window.logoutDemoUser =
  logoutDemoUser;

window.addToCart =
  addToCart;

window.removeFromCart =
  removeFromCart;

window.changeCartQuantity =
  changeCartQuantity;

window.openCart =
  openCart;

window.closeCart =
  closeCart;

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
