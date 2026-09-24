const defaultProducts = [
  {
    id: 1,
    name: "Samsung Galaxy S26 Ultra",
    price: 169999,
    description: "A premium flagship smartphone built for powerful performance, photography and productivity.",
    image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: 2,
    name: "Smart Wireless Headphones",
    price: 4500,
    description: "Wireless headphones with immersive sound, modern design and comfortable all-day listening.",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: 3,
    name: "Minimal Desk Lamp",
    price: 2800,
    description: "A modern desk lamp designed for clean workspaces, studying and home offices.",
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: 4,
    name: "Everyday Travel Backpack",
    price: 3500,
    description: "A practical backpack designed for everyday travel, work, school and outdoor adventures.",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: 5,
    name: "Smart Watch",
    price: 6500,
    description: "A modern smartwatch combining notifications, fitness tools and everyday convenience.",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: 6,
    name: "Premium Sneakers",
    price: 7500,
    description: "Comfortable modern sneakers designed for everyday movement and a clean streetwear look.",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80"
  }
];

let products = JSON.parse(localStorage.getItem("smithx_products"));

if (!products || products.length === 0) {
  products = defaultProducts;
  saveProducts();
}

let cart = JSON.parse(localStorage.getItem("smithx_cart")) || [];

let analytics = JSON.parse(localStorage.getItem("smithx_analytics")) || {
  date: new Date().toDateString(),
  visitors: 0,
  sales: 0,
  orders: 0
};

function saveProducts() {
  localStorage.setItem("smithx_products", JSON.stringify(products));
}

function saveCart() {
  localStorage.setItem("smithx_cart", JSON.stringify(cart));
}

function saveAnalytics() {
  localStorage.setItem("smithx_analytics", JSON.stringify(analytics));
}


/* DAILY USERS */

function updateDailyUsers() {

  const today = new Date().toDateString();

  if (analytics.date !== today) {
    analytics = {
      date: today,
      visitors: 0,
      sales: 0,
      orders: 0
    };
  }

  const visitorKey = "smithx_visit_" + today;

  if (!sessionStorage.getItem(visitorKey)) {
    analytics.visitors++;
    sessionStorage.setItem(visitorKey, "true");
    saveAnalytics();
  }
}


/* NAVIGATION */

function showSection(sectionId) {

  document.querySelectorAll(".section").forEach(section => {
    section.classList.remove("active");
  });

  const section = document.getElementById(sectionId);

  if (section) {
    section.classList.add("active");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  updateDashboard();
}


/* PRODUCTS */

function renderProducts() {

  const grid = document.getElementById("productsGrid");

  if (!grid) return;

  const search = document
    .getElementById("searchInput")
    .value
    .toLowerCase();

  const filtered = products.filter(product =>
    product.name.toLowerCase().includes(search) ||
    product.description.toLowerCase().includes(search)
  );

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:60px">
        <h3>No products found</h3>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(product => `
    <div class="product-card">

      <img
        class="product-image"
        src="${product.image}"
        alt="${escapeHTML(product.name)}"
      >

      <div class="product-info">

        <h3>${escapeHTML(product.name)}</h3>

        <p>
          ${escapeHTML(product.description)}
        </p>

        <div class="product-price">
          ${formatMoney(product.price)}
        </div>

        <div class="product-actions">

          <button
            class="secondary"
            onclick="viewProduct(${product.id})"
          >
            View
          </button>

          <button
            class="primary"
            onclick="addToCart(${product.id})"
          >
            Add
          </button>

        </div>

      </div>
    </div>
  `).join("");
}


/* PRODUCT VIEW */

function viewProduct(id) {

  const product = products.find(p => p.id === id);

  if (!product) return;

  document.getElementById("modalImage").src = product.image;
  document.getElementById("modalName").textContent = product.name;
  document.getElementById("modalPrice").textContent = formatMoney(product.price);
  document.getElementById("modalDescription").textContent = product.description;

  document.getElementById("modalAddButton").onclick = function() {
    addToCart(product.id);
    closeProduct();
  };

  document.getElementById("productModal").classList.remove("hidden");
}

function closeProduct() {
  document.getElementById("productModal").classList.add("hidden");
}


/* CART */

function addToCart(id) {

  const product = products.find(p => p.id === id);

  if (!product) return;

  cart.push(product);

  saveCart();
  updateCartCount();

  showToast(product.name + " added to cart");
}

function removeFromCart(index) {

  cart.splice(index, 1);

  saveCart();
  renderCart();
  updateCartCount();
}

function openCart() {
  renderCart();
  document.getElementById("cartModal").classList.remove("hidden");
}

function closeCart() {
  document.getElementById("cartModal").classList.add("hidden");
}

function renderCart() {

  const container = document.getElementById("cartItems");

  if (cart.length === 0) {

    container.innerHTML = `
      <div style="padding:30px 0;text-align:center;color:#667085">
        Your cart is empty.
      </div>
    `;

    document.getElementById("cartTotal").textContent = "KES 0";
    return;
  }

  container.innerHTML = cart.map((item, index) => `
    <div class="cart-item">

      <img src="${item.image}" alt="${escapeHTML(item.name)}">

      <div class="cart-item-info">
        <h4>${escapeHTML(item.name)}</h4>
        <span>${formatMoney(item.price)}</span>
      </div>

      <button
        class="remove-item"
        onclick="removeFromCart(${index})"
      >
        Remove
      </button>

    </div>
  `).join("");

  const total = cart.reduce((sum, item) => sum + Number(item.price), 0);

  document.getElementById("cartTotal").textContent =
    formatMoney(total);
}

function updateCartCount() {
  document.getElementById("cartCount").textContent = cart.length;
}


/* CHECKOUT */

function checkout() {

  if (cart.length === 0) {
    showToast("Your cart is empty.");
    return;
  }

  const total = cart.reduce(
    (sum, item) => sum + Number(item.price),
    0
  );

  analytics.sales += total;
  analytics.orders++;

  saveAnalytics();

  cart = [];

  saveCart();

  renderCart();
  updateCartCount();
  updateDashboard();

  showToast(
    "Demo purchase completed — " + formatMoney(total)
  );

  setTimeout(() => {
    closeCart();
  }, 1200);
}


/* SELLER PRODUCT CREATION */

document
  .getElementById("productImage")
  .addEventListener("change", function(event) {

    const file = event.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = function(e) {

      document.getElementById("imagePreview").innerHTML = `
        <img src="${e.target.result}" alt="Preview">
      `;
    };

    reader.readAsDataURL(file);
  });


function createProduct() {

  const name =
    document.getElementById("productName").value.trim();

  const price =
    Number(document.getElementById("productPrice").value);

  const description =
    document.getElementById("productDescription").value.trim();

  const imageInput =
    document.getElementById("productImage");

  if (!name || !price || !description) {

    showSellerMessage(
      "Please complete the product information."
    );

    return;
  }

  if (!imageInput.files[0]) {

    showSellerMessage(
      "Please upload a product image."
    );

    return;
  }

  const reader = new FileReader();

  reader.onload = function(event) {

    const newProduct = {
      id: Date.now(),
      name: name,
      price: price,
      description: description,
      image: event.target.result
    };

    products.unshift(newProduct);

    saveProducts();

    document.getElementById("productName").value = "";
    document.getElementById("productPrice").value = "";
    document.getElementById("productDescription").value = "";
    document.getElementById("productImage").value = "";

    document.getElementById("imagePreview").innerHTML =
      "<span>Image preview</span>";

    showSellerMessage(
      "✓ Product published successfully!"
    );

    renderProducts();
    updateDashboard();

    setTimeout(() => {
      showSection("market");
    }, 700);
  };

  reader.readAsDataURL(imageInput.files[0]);
}


/* DASHBOARD */

function updateDashboard() {

  const productCount = products.length;
  const visitors = analytics.visitors;
  const sales = analytics.sales;
  const orders = analytics.orders;

  document.getElementById("analyticsProducts").textContent =
    productCount;

  document.getElementById("analyticsUsers").textContent =
    visitors;

  document.getElementById("analyticsSales").textContent =
    formatMoney(sales);

  document.getElementById("analyticsOrders").textContent =
    orders;

  document.getElementById("activityProducts").textContent =
    productCount;

  document.getElementById("activityUsers").textContent =
    visitors;

  document.getElementById("activitySales").textContent =
    formatMoney(sales);

  document.getElementById("activityOrders").textContent =
    orders;

  document.getElementById("homeProducts").textContent =
    productCount;

  document.getElementById("homeVisitors").textContent =
    visitors;

  document.getElementById("homeSales").textContent =
    formatMoney(sales);
}


/* RESET */

function resetDemoData() {

  const confirmed = confirm(
    "Reset demo sales, orders and today's users?"
  );

  if (!confirmed) return;

  analytics = {
    date: new Date().toDateString(),
    visitors: 0,
    sales: 0,
    orders: 0
  };

  saveAnalytics();

  updateDailyUsers();
  updateDashboard();

  showToast("Demo analytics reset.");
}


/* HELPERS */

function formatMoney(amount) {

  return "KES " + Number(amount).toLocaleString("en-KE");
}

function showSellerMessage(message) {

  const element =
    document.getElementById("sellerMessage");

  element.textContent = message;

  setTimeout(() => {
    element.textContent = "";
  }, 3500);
}

function showToast(message) {

  const toast = document.getElementById("toast");

  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}

function escapeHTML(text) {

  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


/* START */

updateDailyUsers();
renderProducts();
updateCartCount();
updateDashboard();
