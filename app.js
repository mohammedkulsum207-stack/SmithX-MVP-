let products = [
  {
    id: 1,
    name: "Smart Wireless Headphones",
    price: 4500,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
    desc: "Immersive sound with a comfortable wireless design.",
    tagline: "Your sound. Anywhere."
  },
  {
    id: 2,
    name: "Minimal Desk Lamp",
    price: 2800,
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80",
    desc: "A modern lamp designed for focused workspaces.",
    tagline: "Light up your best ideas."
  },
  {
    id: 3,
    name: "Everyday Travel Backpack",
    price: 3500,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
    desc: "A durable everyday backpack for work and travel.",
    tagline: "Built for wherever you're going."
  }
];

let cart = [];
let orders = [];
let revenue = 0;

/* -------------------------
   BASIC HELPERS
------------------------- */

function money(amount) {
  return Number(amount).toLocaleString("en-KE");
}

function toast(message) {
  const box = document.getElementById("toast");

  if (!box) return;

  box.textContent = message;
  box.style.display = "block";

  setTimeout(() => {
    box.style.display = "none";
  }, 2200);
}

/* -------------------------
   MARKETPLACE
------------------------- */

function render() {
  const container = document.getElementById("products");
  const search = document.getElementById("search");

  if (!container) return;

  const query = (search?.value || "").toLowerCase();

  const filtered = products.filter(product =>
    product.name.toLowerCase().includes(query)
  );

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column:1/-1;padding:40px;text-align:center">
        <h3>No products found</h3>
        <p class="muted">Try another search.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(product => `
    <article class="card">

      <img
        src="${product.image}"
        alt="${product.name}"
        class="product-image"
        onerror="this.style.display='none'"
      >

      <div class="card-body">
        <h3>${product.name}</h3>

        <p class="muted">${product.desc}</p>

        <div class="price">
          KES ${money(product.price)}
        </div>

        <button
          class="secondary"
          onclick="openProduct(${product.id})"
        >
          View product
        </button>

        <button
          class="primary"
          onclick="addToCart(${product.id})"
        >
          Add to cart
        </button>
      </div>

    </article>
  `).join("");
}

/* -------------------------
   PRODUCT DETAILS
------------------------- */

function openProduct(id) {
  const product = products.find(p => p.id === id);

  if (!product) return;

  let modal = document.getElementById("productModal");

  if (!modal) {
    modal = document.createElement("div");
    modal.id = "productModal";
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="product-modal-backdrop" onclick="closeProduct()"></div>

    <div class="product-modal">
      <button class="product-modal-close" onclick="closeProduct()">×</button>

      <img
        src="${product.image}"
        alt="${product.name}"
      >

      <div class="product-modal-content">
        <small>SMITHX MARKETPLACE</small>

        <h2>${product.name}</h2>

        <p class="product-tagline">
          ${product.tagline || "Quality made simple."}
        </p>

        <p class="muted">
          ${product.desc}
        </p>

        <div class="product-modal-price">
          KES ${money(product.price)}
        </div>

        <button
          class="primary"
          onclick="addToCart(${product.id}); closeProduct();"
        >
          Add to cart
        </button>
      </div>
    </div>
  `;

  modal.classList.add("show");
}

function closeProduct() {
  const modal = document.getElementById("productModal");

  if (modal) {
    modal.classList.remove("show");
  }
}

/* -------------------------
   CART
------------------------- */

function addToCart(id) {
  const product = products.find(p => p.id === id);

  if (!product) return;

  const existing = cart.find(item => item.id === id);

  if (existing) {
    existing.quantity++;
  } else {
    cart.push({
      ...product,
      quantity: 1
    });
  }

  updateCount();
  renderCart();
  toast("Added to cart");
}

function updateCount() {
  const count = document.getElementById("count");

  if (!count) return;

  const quantity = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  count.textContent = quantity;
}

function openCart() {
  document.getElementById("cart")?.classList.add("open");
  renderCart();
}

function closeCart() {
  document.getElementById("cart")?.classList.remove("open");
}

function increase(id) {
  const item = cart.find(p => p.id === id);

  if (item) {
    item.quantity++;
  }

  updateCount();
  renderCart();
}

function decrease(id) {
  const item = cart.find(p => p.id === id);

  if (!item) return;

  item.quantity--;

  if (item.quantity <= 0) {
    cart = cart.filter(p => p.id !== id);
  }

  updateCount();
  renderCart();
}

function removeItem(id) {
  cart = cart.filter(p => p.id !== id);

  updateCount();
  renderCart();

  toast("Product removed");
}

function renderCart() {
  const items = document.getElementById("items");
  const totalElement = document.getElementById("total");

  if (!items || !totalElement) return;

  if (cart.length === 0) {
    items.innerHTML =
      "<p class='muted'>Your cart is empty.</p>";

    totalElement.textContent = "0";
    return;
  }

  items.innerHTML = cart.map(item => `
    <div class="cart-item">

      <div>
        <strong>${item.name}</strong>

        <p class="muted">
          KES ${money(item.price)} each
        </p>

        <div>
          <button onclick="decrease(${item.id})">−</button>

          <strong style="margin:0 10px">
            ${item.quantity}
          </strong>

          <button onclick="increase(${item.id})">+</button>

          <button
            onclick="removeItem(${item.id})"
            style="margin-left:10px"
          >
            Remove
          </button>
        </div>
      </div>

      <strong>
        KES ${money(item.price * item.quantity)}
      </strong>

    </div>
  `).join("");

  const total = cart.reduce(
    (sum, item) =>
      sum + item.price * item.quantity,
    0
  );

  totalElement.textContent = money(total);
}

/* -------------------------
   DEMO CHECKOUT
------------------------- */

function checkout() {
  if (cart.length === 0) {
    toast("Your cart is empty");
    return;
  }

  const total = cart.reduce(
    (sum, item) =>
      sum + item.price * item.quantity,
    0
  );

  const quantity = cart.reduce(
    (sum, item) =>
      sum + item.quantity,
    0
  );

  orders.push({
    total: total,
    quantity: quantity,
    date: new Date().toLocaleDateString()
  });

  revenue += total;

  updateDashboard();

  toast(`Demo checkout — KES ${money(total)}`);

  cart = [];

  updateCount();
  renderCart();
}

/* -------------------------
   AI SELLER ASSISTANT
------------------------- */

function ai() {
  const name = document
    .getElementById("name")
    ?.value
    .trim();

  const priceInput = document.getElementById("price");

  const price = Number(priceInput?.value || 0);

  if (!name) {
    toast("Enter a product name first");
    return;
  }

  const suggestedPrice = price || 2500;

  document.getElementById("desc").value =
    `Discover ${name}, designed to combine practical everyday value with a clean, modern experience. A great choice for customers looking for quality, convenience and reliability.`;

  let aiBox = document.getElementById("aiResult");

  if (!aiBox) {
    aiBox = document.createElement("div");
    aiBox.id = "aiResult";

    const aiSection = document.querySelector(".ai");

    if (aiSection) {
      aiSection.appendChild(aiBox);
    }
  }

  aiBox.innerHTML = `
    <div class="ai-result">
      <strong>✦ SmithX AI Insights</strong>

      <p>
        <b>Suggested tagline:</b>
        ${name} — quality made simple.
      </p>

      <p>
        <b>Suggested price:</b>
        KES ${money(suggestedPrice)}
      </p>

      <p>
        <b>Recommendation:</b>
        Highlight the product's convenience, quality and everyday value.
      </p>
    </div>
  `;

  toast("SmithX AI generated product insights");
}

/* -------------------------
   SELLER PRODUCT CREATION
------------------------- */

const form = document.getElementById("form");

if (form) {
  form.addEventListener("submit", function(e) {
    e.preventDefault();

    const name =
      document.getElementById("name").value.trim();

    const price =
      Number(document.getElementById("price").value);

    const desc =
      document.getElementById("desc").value.trim() ||
      "A new product available on SmithX.";

    if (!name || !price) {
      toast("Enter a product name and price");
      return;
    }

    products.unshift({
      id: Date.now(),
      name: name,
      price: price,
      image:
        "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80",
      desc: desc,
      tagline: `${name} — quality made simple.`
    });

    form.reset();

    const aiResult = document.getElementById("aiResult");

    if (aiResult) {
      aiResult.innerHTML = "";
    }

    render();
    updateDashboard();

    toast("Product added to marketplace");
  });
}

/* -------------------------
   SELLER DASHBOARD
------------------------- */

function createDashboard() {
  if (document.getElementById("sellerDashboard")) {
    return;
  }

  const sellerSection = document.getElementById("seller");

  if (!sellerSection) return;

  const dashboard = document.createElement("div");

  dashboard.id = "sellerDashboard";

  dashboard.innerHTML = `
    <div class="dashboard-header">
      <div>
        <small>SELLER DASHBOARD</small>
        <h2>Your SmithX business</h2>
      </div>

      <span class="dashboard-live">
        ● Demo mode
      </span>
    </div>

    <div class="dashboard-grid">

      <div class="dashboard-card">
        <span>Products</span>
        <strong id="dashProducts">0</strong>
        <small>Listed on marketplace</small>
      </div>

      <div class="dashboard-card">
        <span>Orders</span>
        <strong id="dashOrders">0</strong>
        <small>Demo orders received</small>
      </div>

      <div class="dashboard-card">
        <span>Revenue</span>
        <strong id="dashRevenue">KES 0</strong>
        <small>Demo sales revenue</small>
      </div>

    </div>

    <div class="dashboard-insight">
      <strong>✦ SmithX Business Insight</strong>
      <p id="dashboardInsight">
        Add products and complete a demo checkout to see your business activity.
      </p>
    </div>
  `;

  sellerSection.insertAdjacentElement("afterend", dashboard);

  updateDashboard();
}

function updateDashboard() {
  const productsElement =
    document.getElementById("dashProducts");

  const ordersElement =
    document.getElementById("dashOrders");

  const revenueElement =
    document.getElementById("dashRevenue");

  if (productsElement) {
    productsElement.textContent = products.length;
  }

  if (ordersElement) {
    ordersElement.textContent = orders.length;
  }

  if (revenueElement) {
    revenueElement.textContent =
      `KES ${money(revenue)}`;
  }

  const insight =
    document.getElementById("dashboardInsight");

  if (!insight) return;

  if (orders.length === 0) {
    insight.textContent =
      "Add products and complete a demo checkout to see your business activity.";
  } else {
    insight.textContent =
      `You have ${orders.length} demo order${orders.length === 1 ? "" : "s"} and KES ${money(revenue)} in demo revenue. SmithX can use this data to help sellers understand their business performance.`;
  }
}

/* -------------------------
   EXTRA DESIGN
------------------------- */

function addNewStyles() {
  if (document.getElementById("smithxExtraStyles")) {
    return;
  }

  const style = document.createElement("style");

  style.id = "smithxExtraStyles";

  style.textContent = `
    .card .secondary,
    .card .primary {
      width: 100%;
      margin: 5px 0;
    }

    .product-tagline {
      color: #2563eb;
      font-weight: 700;
      margin: 10px 0 20px;
    }

    #productModal {
      position: fixed;
      inset: 0;
      z-index: 500;
      display: none;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    #productModal.show {
      display: flex;
    }

    .product-modal-backdrop {
      position: absolute;
      inset: 0;
      background: rgba(17, 24, 39, 0.65);
      backdrop-filter: blur(5px);
    }

    .product-modal {
      position: relative;
      z-index: 2;
      width: min(850px, 100%);
      max-height: 90vh;
      overflow: auto;
      display: grid;
      grid-template-columns: 1fr 1fr;
      background: white;
      border-radius: 22px;
      overflow: hidden;
      box-shadow: 0 30px 80px rgba(0,0,0,.25);
    }

    .product-modal > img {
      width: 100%;
      height: 100%;
      min-height: 350px;
      object-fit: cover;
    }

    .product-modal-content {
      padding: 40px;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .product-modal-content small {
      color: #2563eb;
      font-weight: 800;
      letter-spacing: 1.5px;
    }

    .product-modal-content h2 {
      font-size: 34px;
      line-height: 1.1;
      margin: 12px 0;
    }

    .product-modal-price {
      font-size: 25px;
      font-weight: 800;
      margin: 25px 0;
    }

    .product-modal-close {
      position: absolute;
      top: 15px;
      right: 15px;
      z-index: 5;
      width: 38px;
      height: 38px;
      border: 0;
      border-radius: 50%;
      background: white;
      font-size: 25px;
      cursor: pointer;
      box-shadow: 0 5px 20px rgba(0,0,0,.12);
    }

    #sellerDashboard {
      padding: 70px 6%;
      background: #f7f8fa;
    }

    .dashboard-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
      margin-bottom: 25px;
    }

    .dashboard-header small {
      color: #2563eb;
      font-weight: 800;
      letter-spacing: 1.5px;
    }

    .dashboard-header h2 {
      margin-top: 6px;
      font-size: 34px;
    }

    .dashboard-live {
      background: #dcfce7;
      color: #166534;
      padding: 8px 13px;
      border-radius: 30px;
      font-size: 13px;
      font-weight: 700;
    }

    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 18px;
    }

    .dashboard-card {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 16px;
      padding: 22px;
    }

    .dashboard-card span {
      display: block;
      color: #6b7280;
      font-size: 14px;
    }

    .dashboard-card strong {
      display: block;
      font-size: 30px;
      margin: 8px 0;
    }

    .dashboard-card small {
      color: #9ca3af;
    }

    .dashboard-insight {
      margin-top: 18px;
      padding: 22px;
      border-radius: 16px;
      background: #eef2ff;
      border: 1px solid #dbeafe;
    }

    .dashboard-insight strong {
      color: #2563eb;
    }

    .dashboard-insight p {
      color: #4b5563;
      margin-top: 7px;
    }

    .ai-result {
      margin-top: 18px;
      padding: 18px;
      border-radius: 12px;
      background: #eef2ff;
      color: #374151;
      border: 1px solid #dbeafe;
    }

    .ai-result strong {
      color: #2563eb;
    }

    .ai-result p {
      margin: 8px 0;
      color: #4b5563;
    }

    @media (max-width: 800px) {

      .product-modal {
        grid-template-columns: 1fr;
      }

      .product-modal > img {
        min-height: 220px;
        max-height: 260px;
      }

      .product-modal-content {
        padding: 25px;
      }

      .product-modal-content h2 {
        font-size: 28px;
      }

      .dashboard-grid {
        grid-template-columns: 1fr;
      }

      .dashboard-header {
        align-items: flex-start;
        flex-direction: column;
      }

      #sellerDashboard {
        padding: 55px 5%;
      }
    }
  `;

  document.head.appendChild(style);
}

/* -------------------------
   START
------------------------- */

addNewStyles();
createDashboard();
render();
updateCount();
