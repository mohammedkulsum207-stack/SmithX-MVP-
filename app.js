/* =========================================
   SMITHX MVP
   Marketplace + Seller Studio + Cart
========================================= */


/* =========================================
   DEFAULT PRODUCTS
========================================= */

const defaultProducts = [
  {
    id: 1,
    name: "Samsung Galaxy S26 Ultra",
    price: 169999,
    description:
      "Experience powerful performance, advanced cameras and a premium smartphone experience.",
    category: "Electronics",
    image:
      "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=1000&q=80"
  },

  {
    id: 2,
    name: "Smart Wireless Headphones",
    price: 4500,
    description:
      "Wireless headphones with clear sound, comfortable design and long-lasting battery life.",
    category: "Electronics",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80"
  },

  {
    id: 3,
    name: "Minimal Desk Lamp",
    price: 2800,
    description:
      "Modern minimalist desk lamp designed for comfortable work and study environments.",
    category: "Home",
    image:
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1000&q=80"
  },

  {
    id: 4,
    name: "Everyday Travel Backpack",
    price: 3500,
    description:
      "A practical everyday backpack with enough space for work, school and travel essentials.",
    category: "Fashion",
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1000&q=80"
  },

  {
    id: 5,
    name: "Smart Watch",
    price: 6500,
    description:
      "A modern smartwatch designed to keep you connected while tracking your daily activity.",
    category: "Electronics",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=80"
  },

  {
    id: 6,
    name: "Premium Sneakers",
    price: 7200,
    description:
      "Comfortable premium sneakers combining modern style with everyday performance.",
    category: "Fashion",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=80"
  }
];


/* =========================================
   STORAGE KEYS
========================================= */

const PRODUCTS_KEY = "smithx_saved_products";
const ANALYTICS_KEY = "smithx_demo_analytics";
const VISITOR_KEY = "smithx_demo_visitor";


/* =========================================
   STATE
========================================= */

let products = loadProducts();

let cart = [];

let selectedImage = "";

let analytics = loadAnalytics();


/* =========================================
   DOM
========================================= */

const productsContainer =
  document.getElementById("products");

const searchInput =
  document.getElementById("search");

const form =
  document.getElementById("form");

const imageInput =
  document.getElementById("image");

const imagePreview =
  document.getElementById("imagePreview");

const cartPanel =
  document.getElementById("cart");

const cartItems =
  document.getElementById("items");

const cartTotal =
  document.getElementById("total");

const cartCount =
  document.getElementById("count");

const toast =
  document.getElementById("toast");


/* =========================================
   PRODUCTS
========================================= */

function loadProducts() {

  try {

    const saved =
      localStorage.getItem(PRODUCTS_KEY);

    if (saved) {

      const parsed =
        JSON.parse(saved);

      if (
        Array.isArray(parsed) &&
        parsed.length > 0
      ) {
        return parsed;
      }
    }

  } catch (error) {

    console.log(
      "Could not load saved products.",
      error
    );

  }

  return [...defaultProducts];
}


function saveProducts() {

  try {

    localStorage.setItem(
      PRODUCTS_KEY,
      JSON.stringify(products)
    );

  } catch (error) {

    console.log(
      "Could not save products.",
      error
    );

    showToast(
      "Product could not be saved. Image may be too large."
    );
  }
}


/* =========================================
   ANALYTICS
========================================= */

function todayKey() {

  const now = new Date();

  const year =
    now.getFullYear();

  const month =
    String(now.getMonth() + 1)
      .padStart(2, "0");

  const day =
    String(now.getDate())
      .padStart(2, "0");

  return `${year}-${month}-${day}`;
}


function emptyAnalytics() {

  return {

    date: todayKey(),

    users: 0,

    sales: 0,

    orders: 0,

    amountUsed: 0

  };
}


function loadAnalytics() {

  try {

    const saved =
      localStorage.getItem(
        ANALYTICS_KEY
      );

    if (saved) {

      const parsed =
        JSON.parse(saved);

      if (
        parsed &&
        parsed.date === todayKey()
      ) {

        return {

          date: parsed.date,

          users:
            Number(parsed.users) || 0,

          sales:
            Number(parsed.sales) || 0,

          orders:
            Number(parsed.orders) || 0,

          amountUsed:
            Number(parsed.amountUsed) || 0

        };

      }

    }

  } catch (error) {

    console.log(
      "Could not load analytics.",
      error
    );

  }

  const fresh =
    emptyAnalytics();

  localStorage.setItem(
    ANALYTICS_KEY,
    JSON.stringify(fresh)
  );

  return fresh;
}


function saveAnalytics() {

  localStorage.setItem(
    ANALYTICS_KEY,
    JSON.stringify(analytics)
  );
}


/* =========================================
   TODAY'S USERS
========================================= */

function registerTodayUser() {

  const today =
    todayKey();

  const previousVisit =
    localStorage.getItem(
      VISITOR_KEY
    );

  if (previousVisit !== today) {

    analytics.users += 1;

    localStorage.setItem(
      VISITOR_KEY,
      today
    );

    saveAnalytics();

  }

}


/* =========================================
   FORMAT MONEY
========================================= */

function formatMoney(value) {

  return Number(value || 0)
    .toLocaleString("en-KE");

}


/* =========================================
   RENDER MARKETPLACE
========================================= */

function render() {

  const query =
    searchInput
      ? searchInput.value
          .toLowerCase()
          .trim()
      : "";

  const filtered =
    products.filter(product => {

      const name =
        product.name
          .toLowerCase();

      const description =
        (product.description || "")
          .toLowerCase();

      const category =
        (product.category || "")
          .toLowerCase();

      return (
        name.includes(query) ||
        description.includes(query) ||
        category.includes(query)
      );

    });


  if (!productsContainer) {
    return;
  }


  if (filtered.length === 0) {

    productsContainer.innerHTML = `

      <div class="empty-state">

        <h3>
          No products found
        </h3>

        <p>
          Try another search.
        </p>

      </div>

    `;

    updateStats();

    return;

  }


  productsContainer.innerHTML =
    filtered.map(product => `

      <article class="card">

        <img
          src="${escapeAttribute(product.image)}"
          alt="${escapeAttribute(product.name)}"
          onerror="this.src='${fallbackImage()}'"
        >

        <div class="card-content">

          <small>
            ${escapeHTML(product.category || "General")}
          </small>

          <h3>
            ${escapeHTML(product.name)}
          </h3>

          <p>
            ${escapeHTML(product.description || "")}
          </p>

          <div class="price">
            KES ${formatMoney(product.price)}
          </div>

          <button
            class="primary"
            onclick="addToCart(${product.id})"
          >
            Add to cart
          </button>

          <button
            class="secondary"
            onclick="viewProduct(${product.id})"
          >
            View product
          </button>

        </div>

      </article>

    `).join("");

  updateStats();
}


/* =========================================
   STATS
========================================= */

function updateStats() {

  const productCount =
    document.getElementById(
      "productCount"
    );

  const usersCount =
    document.getElementById(
      "usersCount"
    );

  const salesCount =
    document.getElementById(
      "salesCount"
    );

  const ordersCount =
    document.getElementById(
      "ordersCount"
    );

  if (productCount) {

    productCount.textContent =
      products.length;

  }

  if (usersCount) {

    usersCount.textContent =
      analytics.users;

  }

  if (salesCount) {

    salesCount.textContent =
      `KES ${formatMoney(analytics.sales)}`;

  }

  if (ordersCount) {

    ordersCount.textContent =
      analytics.orders;

  }

}


/* =========================================
   ADD TO CART
========================================= */

function addToCart(productId) {

  const product =
    products.find(
      item =>
        Number(item.id) === Number(productId)
    );

  if (!product) {
    return;
  }


  const existing =
    cart.find(
      item =>
        Number(item.id) === Number(productId)
    );


  if (existing) {

    existing.quantity += 1;

  } else {

    cart.push({

      ...product,

      quantity: 1

    });

  }


  updateCart();

  showToast(
    `${product.name} added to cart`
  );

}


/* =========================================
   CART
========================================= */

function updateCart() {

  const quantity =
    cart.reduce(
      (total, item) =>
        total + item.quantity,
      0
    );


  const total =
    cart.reduce(
      (sum, item) =>
        sum +
        Number(item.price) *
        item.quantity,
      0
    );


  if (cartCount) {

    cartCount.textContent =
      quantity;

  }


  if (cartTotal) {

    cartTotal.textContent =
      formatMoney(total);

  }


  if (!cartItems) {
    return;
  }


  if (cart.length === 0) {

    cartItems.innerHTML = `

      <div class="empty-cart">

        <p>
          Your cart is empty.
        </p>

      </div>

    `;

    return;

  }


  cartItems.innerHTML =
    cart.map(item => `

      <div class="cart-item">

        <img
          src="${escapeAttribute(item.image)}"
          alt="${escapeAttribute(item.name)}"
          onerror="this.src='${fallbackImage()}'"
        >

        <div>

          <h4>
            ${escapeHTML(item.name)}
          </h4>

          <p>
            KES ${formatMoney(item.price)}
          </p>

          <div class="cart-controls">

            <button
              onclick="changeQuantity(${item.id}, -1)"
            >
              −
            </button>

            <span>
              ${item.quantity}
            </span>

            <button
              onclick="changeQuantity(${item.id}, 1)"
            >
              +
            </button>

            <button
              onclick="removeFromCart(${item.id})"
            >
              ×
            </button>

          </div>

        </div>

      </div>

    `).join("");

}


function openCart() {

  cartPanel.classList.add(
    "open"
  );

}


function closeCart() {

  cartPanel.classList.remove(
    "open"
  );

}


function changeQuantity(
  productId,
  change
) {

  const item =
    cart.find(
      product =>
        Number(product.id) ===
        Number(productId)
    );

  if (!item) {
    return;
  }


  item.quantity += change;


  if (item.quantity <= 0) {

    cart =
      cart.filter(
        product =>
          Number(product.id) !==
          Number(productId)
      );

  }


  updateCart();

}


function removeFromCart(productId) {

  cart =
    cart.filter(
      item =>
        Number(item.id) !==
        Number(productId)
    );

  updateCart();

}


/* =========================================
   DEMO CHECKOUT
========================================= */

function checkout() {

  if (cart.length === 0) {

    showToast(
      "Your cart is empty."
    );

    return;

  }


  const total =
    cart.reduce(
      (sum, item) =>
        sum +
        Number(item.price) *
        item.quantity,
      0
    );


  analytics.sales += total;

  analytics.amountUsed += total;

  analytics.orders += 1;


  saveAnalytics();


  cart = [];

  updateCart();

  updateStats();

  closeCart();


  showToast(
    `Demo purchase completed — KES ${formatMoney(total)}`
  );

}


/* =========================================
   IMAGE UPLOAD
========================================= */

if (imageInput) {

  imageInput.addEventListener(
    "change",
    function () {

      const file =
        this.files &&
        this.files[0];

      if (!file) {

        selectedImage = "";

        if (imagePreview) {

          imagePreview.style.display =
            "none";

        }

        return;

      }


      if (!file.type.startsWith("image/")) {

        showToast(
          "Please select an image."
        );

        this.value = "";

        return;

      }


      const reader =
        new FileReader();


      reader.onload =
        function (event) {

          selectedImage =
            event.target.result;


          if (imagePreview) {

            imagePreview.src =
              selectedImage;

            imagePreview.style.display =
              "block";

          }

        };


      reader.readAsDataURL(file);

    }
  );

}


/* =========================================
   CREATE PRODUCT
========================================= */

if (form) {

  form.addEventListener(
    "submit",
    function (event) {

      event.preventDefault();


      const name =
        document
          .getElementById("name")
          .value
          .trim();


      const price =
        Number(
          document
            .getElementById("price")
            .value
        );


      const description =
        document
          .getElementById("desc")
          .value
          .trim();


      if (!name) {

        showToast(
          "Enter a product name."
        );

        return;

      }


      if (!price || price <= 0) {

        showToast(
          "Enter a valid price."
        );

        return;

      }


      const product = {

        id:
          Date.now(),

        name,

        price,

        description:
          description ||
          "A new product published on SmithX.",

        category:
          "General",

        image:
          selectedImage ||
          fallbackImage()

      };


      products.unshift(
        product
      );


      saveProducts();

      render();


      form.reset();

      selectedImage = "";


      if (imagePreview) {

        imagePreview.src = "";

        imagePreview.style.display =
          "none";

      }


      showToast(
        "Product published successfully."
      );


      document
        .getElementById("market")
        ?.scrollIntoView({
          behavior: "smooth"
        });

    }
  );

}


/* =========================================
   AI SELLER ASSISTANT
========================================= */

function ai() {

  const nameInput =
    document.getElementById(
      "name"
    );

  const descInput =
    document.getElementById(
      "desc"
    );

  if (!nameInput || !descInput) {
    return;
  }


  const name =
    nameInput.value.trim();


  if (!name) {

    showToast(
      "Enter a product name first."
    );

    nameInput.focus();

    return;

  }


  descInput.value =
    `${name} combines modern design, quality and everyday practicality to give customers a reliable product for their needs. Shop with confidence through SmithX.`;


  showToast(
    "AI product description generated."
  );

}


/* =========================================
   PRODUCT DETAILS
========================================= */

function viewProduct(productId) {

  const product =
    products.find(
      item =>
        Number(item.id) ===
        Number(productId)
    );

  if (!product) {
    return;
  }


  const existing =
    document.querySelector(
      ".product-modal"
    );


  if (existing) {
    existing.remove();
  }


  const modal =
    document.createElement(
      "div"
    );


  modal.className =
    "product-modal open";


  modal.innerHTML = `

    <div class="product-modal-box">

      <button
        class="close"
        onclick="this.closest('.product-modal').remove()"
      >
        ×
      </button>

      <img
        src="${escapeAttribute(product.image)}"
        alt="${escapeAttribute(product.name)}"
        onerror="this.src='${fallbackImage()}'"
      >

      <small>
        ${escapeHTML(product.category || "General")}
      </small>

      <h2>
        ${escapeHTML(product.name)}
      </h2>

      <div class="price">
        KES ${formatMoney(product.price)}
      </div>

      <p>
        ${escapeHTML(product.description || "")}
      </p>

      <br>

      <button
        class="primary wide"
        onclick="
          addToCart(${product.id});
          this.closest('.product-modal').remove();
        "
      >
        Add to cart
      </button>

    </div>

  `;


  modal.addEventListener(
    "click",
    function (event) {

      if (event.target === modal) {

        modal.remove();

      }

    }
  );


  document.body.appendChild(
    modal
  );

}


/* =========================================
   TOAST
========================================= */

let toastTimer;


function showToast(message) {

  if (!toast) {
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
      2800
    );

}


/* =========================================
   RESET DEMO ANALYTICS
========================================= */

function resetDemoAnalytics() {

  const confirmed =
    confirm(
      "Reset today's demo analytics?"
    );


  if (!confirmed) {
    return;
  }


  analytics =
    emptyAnalytics();


  saveAnalytics();


  localStorage.removeItem(
    VISITOR_KEY
  );


  updateStats();


  showToast(
    "Demo analytics reset."
  );

}


/* =========================================
   FALLBACK IMAGE
========================================= */

function fallbackImage() {

  return `
    data:image/svg+xml;charset=UTF-8,
    ${encodeURIComponent(`
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="800"
        height="600"
        viewBox="0 0 800 600"
      >
        <rect
          width="800"
          height="600"
          fill="#eef3f9"
        />

        <text
          x="400"
          y="300"
          text-anchor="middle"
          dominant-baseline="middle"
          font-family="Arial"
          font-size="42"
          font-weight="700"
          fill="#1769ff"
        >
          SMITHX
        </text>
      </svg>
    `)}
  `;

}


/* =========================================
   SECURITY HELPERS
========================================= */

function escapeHTML(value) {

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


function escapeAttribute(value) {

  return escapeHTML(value);

}


/* =========================================
   ADD DASHBOARD
========================================= */

function createDashboard() {

  const existing =
    document.getElementById(
      "sellerDashboard"
    );

  if (existing) {
    updateDashboard();
    return;
  }


  const dashboard =
    document.createElement(
      "section"
    );


  dashboard.id =
    "sellerDashboard";


  dashboard.innerHTML = `

    <div class="dashboard-header">

      <small>
        SELLER DASHBOARD
      </small>

      <h2>
        Store Analytics
      </h2>

    </div>


    <div class="dashboard-grid">

      <div class="dashboard-card">

        <strong id="productCount">
          ${products.length}
        </strong>

        <span>
          Products
        </span>

        <small>
          Products in marketplace
        </small>

      </div>


      <div class="dashboard-card">

        <strong id="usersCount">
          ${analytics.users}
        </strong>

        <span>
          Today's Users
        </span>

        <small>
          Demo users today
        </small>

      </div>


      <div class="dashboard-card">

        <strong id="salesCount">
          KES ${formatMoney(analytics.sales)}
        </strong>

        <span>
          Demo Sales
        </span>

        <small>
          Total completed purchases
        </small>

      </div>


      <div class="dashboard-card">

        <strong id="ordersCount">
          ${analytics.orders}
        </strong>

        <span>
          Orders
        </span>

        <small>
          Completed demo orders
        </small>

      </div>

    </div>


    <div class="activity">

      <h3>
        Store Activity
      </h3>


      <div class="activity-row">

        <span>
          Marketplace products
        </span>

        <strong>
          ${products.length}
        </strong>

      </div>


      <div class="activity-row">

        <span>
          People who visited today
        </span>

        <strong id="activityUsers">
          ${analytics.users}
        </strong>

      </div>


      <div class="activity-row">

        <span>
          Total amount used
        </span>

        <strong id="activityAmount">
          KES ${formatMoney(analytics.amountUsed)}
        </strong>

      </div>


      <div class="activity-row">

        <span>
          Completed purchases
        </span>

        <strong id="activityOrders">
          ${analytics.orders}
        </strong>

      </div>


      <button
        class="reset-button"
        onclick="resetDemoAnalytics()"
      >
        Reset Demo Analytics
      </button>

    </div>

  `;


  const seller =
    document.getElementById(
      "seller"
    );


  if (seller) {

    seller.insertAdjacentElement(
      "afterend",
      dashboard
    );

  }

}


/* =========================================
   UPDATE DASHBOARD
========================================= */

function updateDashboard() {

  const productCount =
    document.getElementById(
      "productCount"
    );

  const usersCount =
    document.getElementById(
      "usersCount"
    );

  const salesCount =
    document.getElementById(
      "salesCount"
    );

  const ordersCount =
    document.getElementById(
      "ordersCount"
    );

  const activityUsers =
    document.getElementById(
      "activityUsers"
    );

  const activityAmount =
    document.getElementById(
      "activityAmount"
    );

  const activityOrders =
    document.getElementById(
      "activityOrders"
    );


  if (productCount) {

    productCount.textContent =
      products.length;

  }


  if (usersCount) {

    usersCount.textContent =
      analytics.users;

  }


  if (salesCount) {

    salesCount.textContent =
      `KES ${formatMoney(analytics.sales)}`;

  }


  if (ordersCount) {

    ordersCount.textContent =
      analytics.orders;

  }


  if (activityUsers) {

    activityUsers.textContent =
      analytics.users;

  }


  if (activityAmount) {

    activityAmount.textContent =
      `KES ${formatMoney(analytics.amountUsed)}`;

  }


  if (activityOrders) {

    activityOrders.textContent =
      analytics.orders;

  }

}


/* =========================================
   DASHBOARD STYLES
========================================= */

function addDashboardStyles() {

  if (
    document.getElementById(
      "smithxDashboardStyles"
    )
  ) {
    return;
  }


  const style =
    document.createElement(
      "style"
    );


  style.id =
    "smithxDashboardStyles";


  style.textContent = `

    #sellerDashboard {
      background: #f7f9fc;
    }

    .dashboard-header {
      margin-bottom: 30px;
    }

    .dashboard-grid {
      display: grid;
      grid-template-columns:
        repeat(4, minmax(0, 1fr));
      gap: 18px;
    }

    .dashboard-card {
      background: #ffffff;
      border: 1px solid #e3e8ef;
      border-radius: 18px;
      padding: 25px;
    }

    .dashboard-card strong {
      display: block;
      color: #1769ff;
      font-size: 28px;
      margin-bottom: 7px;
    }

    .dashboard-card span {
      display: block;
      font-weight: 800;
      font-size: 16px;
      margin-bottom: 5px;
    }

    .dashboard-card small {
      color: #64748b;
      letter-spacing: 0;
      font-weight: 500;
    }

    .activity {
      margin-top: 25px;
      padding: 25px;
      background: #ffffff;
      border: 1px solid #e3e8ef;
      border-radius: 18px;
    }

    .activity h3 {
      margin-bottom: 20px;
    }

    .activity-row {
      display: flex;
      justify-content: space-between;
      gap: 20px;
      padding: 16px 0;
      border-bottom: 1px solid #edf0f5;
    }

    .activity-row strong {
      color: #1769ff;
    }

    .reset-button {
      margin-top: 20px;
      padding: 11px 16px;
      border: 1px solid #dce2eb;
      border-radius: 9px;
      background: white;
      cursor: pointer;
      font-weight: 700;
    }

    .reset-button:hover {
      border-color: #1769ff;
      color: #1769ff;
    }

    .empty-state,
    .empty-cart {
      padding: 40px;
      text-align: center;
      background: white;
      border-radius: 15px;
      border: 1px solid #e4e9f1;
    }

    .card .secondary {
      width: 100%;
      margin: 10px 0 0;
    }

    @media (max-width: 900px) {
      .dashboard-grid {
        grid-template-columns:
          repeat(2, minmax(0, 1fr));
      }
    }

    @media (max-width: 600px) {
      .dashboard-grid {
        grid-template-columns: 1fr;
      }
    }

  `;


  document.head.appendChild(
    style
  );

}


/* =========================================
   START SMITHX
========================================= */

function startSmithX() {

  addDashboardStyles();

  createDashboard();

  registerTodayUser();

  render();

  updateCart();

  updateStats();

  updateDashboard();

}


/* =========================================
   START
========================================= */

if (
  document.readyState ===
  "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    startSmithX
  );

} else {

  startSmithX();

}
