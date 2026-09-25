/* =========================================================
   SM1THX 🛒 — APP.JS
   MVP VERSION 4.0
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

const DEMO_USER_KEY = "smithx_demo_user_v1";


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
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}


/* =========================================================
   PRODUCTS
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
   CART
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
  const today =
    new Date().toISOString().split("T")[0];

  const previous =
    localStorage.getItem(STORAGE.visitor);

  if (previous !== today) {
    localStorage.setItem(
      STORAGE.visitor,
      today
    );

    trackEvent("visitor");
  }
}


/* =========================================================
   CATEGORIES
========================================================= */

function setupCategories() {
  const container =
    document.getElementById("categoryFilters");

  if (!container) return;

  container.innerHTML =
    CATEGORIES.map(category => `
      <button
        type="button"
        class="category-filter ${
          category === currentCategory ? "active" : ""
        }"
        data-category="${escapeHTML(category)}"
      >
        ${escapeHTML(category)}
      </button>
    `).join("");

  container
    .querySelectorAll(".category-filter")
    .forEach(button => {

      button.addEventListener("click", () => {

        currentCategory =
          button.dataset.category || "All";

        container
          .querySelectorAll(".category-filter")
          .forEach(item =>
            item.classList.remove("active")
          );

        button.classList.add("active");

        renderProducts();
      });

    });
}


function setupSellerCategory() {
  const select =
    document.getElementById("productCategory");

  if (!select) return;

  select.innerHTML =
    CATEGORIES
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

  const products =
    getAllProducts().filter(product => {

      const matchesCategory =
        currentCategory === "All" ||
        product.category === currentCategory;

      const searchable =
        `
        ${product.name}
        ${product.description}
        ${product.category}
        `
        .toLowerCase();

      const matchesSearch =
        !search ||
        searchable.includes(search);

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
    products.map(product => `

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

    `).join("");
}


/* =========================================================
   PRODUCT MODAL
========================================================= */

function openProductModal(productId) {

  const product =
    getAllProducts().find(
      item => item.id === productId
    );

  if (!product) return;

  const modal =
    document.getElementById("productModal");

  const content =
    document.getElementById(
      "productModalContent"
    );

  if (!modal || !content) return;


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


  modal.classList.add("active");

  trackEvent("productView");
}


function closeProductModal() {

  const modal =
    document.getElementById(
      "productModal"
    );

  if (modal) {
    modal.classList.remove("active");
  }
}


/* =========================================================
   CART FUNCTIONS
========================================================= */

function addToCart(productId) {

  const product =
    getAllProducts().find(
      item => item.id === productId
    );

  if (!product) return;

  const cart = getCart();

  const existing =
    cart.find(
      item => item.id === productId
    );


  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      id: productId,
      quantity: 1
    });
  }


  saveCart(cart);

  renderCart();
  updateCartCount();

  showToast(
    `${product.name} added to cart.`
  );
}


function removeFromCart(productId) {

  const cart =
    getCart().filter(
      item => item.id !== productId
    );

  saveCart(cart);

  renderCart();
  updateCartCount();
}


function changeCartQuantity(
  productId,
  amount
) {

  const cart = getCart();

  const item =
    cart.find(
      cartItem =>
        cartItem.id === productId
    );

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


/* =========================================================
   RENDER CART
========================================================= */

function renderCart() {

  const container =
    document.getElementById(
      "cartItems"
    );

  const subtotalElement =
    document.getElementById(
      "cartSubtotal"
    );

  const totalElement =
    document.getElementById(
      "cartTotal"
    );

  if (!container) return;


  const cart = getCart();


  if (!cart.length) {

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


  let subtotal = 0;


  container.innerHTML =
    cart.map(item => {

      const product =
        getAllProducts().find(
          productItem =>
            productItem.id === item.id
        );

      if (!product) return "";


      const quantity =
        Number(item.quantity) || 1;


      subtotal +=
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
    document.getElementById(
      "cartCount"
    );

  if (!element) return;


  const count =
    getCart().reduce(
      (total, item) =>
        total +
        (Number(item.quantity) || 0),
      0
    );


  element.textContent = count;
}


function openCart() {

  const panel =
    document.getElementById(
      "cartPanel"
    );

  if (!panel) return;

  panel.classList.add("active");

  renderCart();
}


function closeCart() {

  const panel =
    document.getElementById(
      "cartPanel"
    );

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
    showToast(
      "Your cart is empty."
    );
    return;
  }


  let total = 0;


  cart.forEach(item => {

    const product =
      getAllProducts().find(
        productItem =>
          productItem.id === item.id
      );

    if (product) {
      total +=
        Number(product.price) *
        Number(item.quantity || 1);
    }

  });


  trackEvent(
    "order",
    total
  );


  localStorage.removeItem(
    STORAGE.cart
  );


  renderCart();
  updateCartCount();


  showToast(
    "Demo checkout complete. Thank you for testing SM1THX 🛒!"
  );
}


/* =========================================================
   IMAGE PREVIEW
========================================================= */

function setupImagePreview() {

  const input =
    document.getElementById(
      "productImage"
    );

  const preview =
    document.getElementById(
      "imagePreview"
    );

  const previewImage =
    document.getElementById(
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

        previewImage.src = "";

        return;
      }


      const reader =
        new FileReader();


      reader.onload = event => {

        previewImage.src =
          event.target.result;

        preview.style.display =
          "block";
      };


      reader.readAsDataURL(file);

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


      reader.onload = event => {

        const img =
          new Image();


        img.onload = () => {

          let width =
            img.width;

          let height =
            img.height;


          if (width > maxWidth) {

            const ratio =
              maxWidth / width;

            width = maxWidth;

            height =
              Math.round(
                height * ratio
              );
          }


          const canvas =
            document.createElement(
              "canvas"
            );


          canvas.width = width;
          canvas.height = height;


          const context =
            canvas.getContext(
              "2d"
            );


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


      reader.onerror =
        reject;

      reader.readAsDataURL(file);
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
    document.getElementById(
      "productName"
    );

  const priceInput =
    document.getElementById(
      "productPrice"
    );

  const categoryInput =
    document.getElementById(
      "productCategory"
    );

  const descriptionInput =
    document.getElementById(
      "productDescription"
    );

  const imageInput =
    document.getElementById(
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
    Number(priceInput.value);

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
    !price ||
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


  nameInput.value = "";
  priceInput.value = "";
  descriptionInput.value = "";


  if (imageInput) {
    imageInput.value = "";
  }


  const preview =
    document.getElementById(
      "imagePreview"
    );

  const previewImage =
    document.getElementById(
      "previewImage"
    );


  if (preview) {
    preview.style.display =
      "none";
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


  const productsElement =
    document.getElementById(
      "dashboardProducts"
    );

  const ordersElement =
    document.getElementById(
      "dashboardOrders"
    );

  const revenueElement =
    document.getElementById(
      "dashboardRevenue"
    );

  const visitorsElement =
    document.getElementById(
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
   UPDATES
========================================================= */

function toggleUpdateHistory() {

  const history =
    document.getElementById(
      "updateHistory"
    );

  const button =
    document.getElementById(
      "updatesToggle"
    );


  if (!history) return;


  const hidden =
    history.style.display === "none" ||
    history.style.display === "";


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

  const button =
    document.getElementById(
      "updatesToggle"
    );

  if (!button) return;


  button.addEventListener(
    "click",
    toggleUpdateHistory
  );
}


/* =========================================================
   SEARCH
========================================================= */

function setupSearch() {

  const input =
    document.getElementById(
      "productSearch"
    );

  if (!input) return;


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

function scrollToSection(id) {

  const element =
    document.getElementById(id);

  if (!element) return;


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


          if (!target) return;


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

function showToast(message) {

  const toast =
    document.getElementById(
      "toast"
    );

  if (!toast) return;


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
   LOGIN SYSTEM
========================================================= */

function getDemoUser() {

  return safeJSONParse(
    localStorage.getItem(
      DEMO_USER_KEY
    ),
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
   OPEN / CLOSE LOGIN
========================================================= */

function openLogin() {

  const overlay =
    document.getElementById(
      "loginOverlay"
    );

  if (!overlay) return;


  overlay.classList.add(
    "active"
  );


  showLoginForm();


  setTimeout(() => {

    document
      .getElementById(
        "loginEmail"
      )
      ?.focus();

  }, 150);
}


function closeLogin() {

  const overlay =
    document.getElementById(
      "loginOverlay"
    );

  if (!overlay) return;


  overlay.classList.remove(
    "active"
  );
}


/* =========================================================
   LOGIN / REGISTER FORMS
========================================================= */

function showLoginForm() {

  const login =
    document.getElementById(
      "loginFormSection"
    );

  const register =
    document.getElementById(
      "registerFormSection"
    );


  if (login) {
    login.style.display =
      "block";
  }


  if (register) {
    register.style.display =
      "none";
  }
}


function showRegisterForm() {

  const login =
    document.getElementById(
      "loginFormSection"
    );

  const register =
    document.getElementById(
      "registerFormSection"
    );


  if (login) {
    login.style.display =
      "none";
  }


  if (register) {
    register.style.display =
      "block";
  }
}


/* =========================================================
   PASSWORD TOGGLE
========================================================= */

function togglePassword(
  inputId,
  button
) {

  const input =
    document.getElementById(
      inputId
    );

  if (!input) return;


  if (
    input.type ===
    "password"
  ) {

    input.type = "text";

    if (button) {
      button.textContent =
        "Hide";
    }

  } else {

    input.type =
      "password";

    if (button) {
      button.textContent =
        "Show";
    }
  }
}


/* =========================================================
   REGISTER
========================================================= */

function demoRegister(event) {

  if (event) {
    event.preventDefault();
  }


  const name =
    document
      .getElementById(
        "registerName"
      )
      ?.value
      .trim();


  const email =
    document
      .getElementById(
        "registerEmail"
      )
      ?.value
      .trim()
      .toLowerCase();


  const password =
    document.getElementById(
      "registerPassword"
    )?.value;


  const accountType =
    document.getElementById(
      "accountType"
    )?.value ||
    "buyer";


  if (!name) {
    showToast(
      "Please enter your name."
    );
    return;
  }


  if (!email) {
    showToast(
      "Please enter your email."
    );
    return;
  }


  if (
    !password ||
    password.length < 4
  ) {

    showToast(
      "Password must contain at least 4 characters."
    );

    return;
  }


  const user = {

    name,
    email,
    accountType,
    loggedIn: true,

    createdAt:
      new Date().toISOString()
  };


  saveDemoUser(
    user
  );


  updateLoginButton();

  closeLogin();


  showToast(
    `Welcome to SM1THX 🛒, ${name}!`
  );
}


/* =========================================================
   LOGIN
========================================================= */

function demoLogin(event) {

  if (event) {
    event.preventDefault();
  }


  const email =
    document
      .getElementById(
        "loginEmail"
      )
      ?.value
      .trim()
      .toLowerCase();


  const password =
    document
      .getElementById(
        "loginPassword"
      )
      ?.value;


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


  const user =
    getDemoUser();


  if (!user) {

    showToast(
      "Create a demo account first."
    );

    showRegisterForm();


    const registerEmail =
      document.getElementById(
        "registerEmail"
      );


    if (registerEmail) {
      registerEmail.value =
        email;
    }


    return;
  }


  if (
    user.email !== email
  ) {

    showToast(
      "Email does not match the demo account."
    );

    return;
  }


  user.loggedIn = true;


  saveDemoUser(
    user
  );


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


  user.loggedIn =
    false;


  saveDemoUser(
    user
  );


  updateLoginButton();


  showToast(
    "You have been logged out."
  );
}


/* =========================================================
   LOGIN BUTTON
========================================================= */

function updateLoginButton() {

  const button =
    document.getElementById(
      "loginNavButton"
    );

  if (!button) return;


  const user =
    getDemoUser();


  if (
    user &&
    user.loggedIn
  ) {

    button.textContent =
      `👤 ${user.name}`;

    button.onclick =
      logoutDemoUser;

    button.title =
      "Click to logout";

  } else {

    button.textContent =
      "Login";

    button.onclick =
      openLogin;

    button.title =
      "Login to SM1THX 🛒";
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


  if (overlay) {

    overlay.addEventListener(
      "click",
      event => {

        if (
          event.target ===
          overlay
        ) {
          closeLogin();
        }

      }
    );
  }
}


/* =========================================================
   KEYBOARD
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

    setupCategories();

    setupSellerCategory();

    renderProducts();


    renderCart();

    updateCartCount();


    setupImagePreview();

    setupSearch();

    setupNavigation();

    setupUpdatesToggle();


    trackDailyVisitor();

    updateDashboard();


    setupLoginControls();

    updateLoginButton();


    setupKeyboardControls();

  }
);


/* =========================================================
   GLOBAL FUNCTIONS
========================================================= */

window.openLogin =
  openLogin;

window.closeLogin =
  closeLogin;

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

window.toggleUpdateHistory =
  toggleUpdateHistory;

window.scrollToSection =
  scrollToSection;
