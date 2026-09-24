/* =========================================================
   SMITHX MVP — APP.JS
   ========================================================= */

const DEFAULT_PRODUCTS = [
  {
    id: "s26-ultra",
    name: "Samsung Galaxy S26 Ultra",
    price: 169999,
    description: "Premium Samsung smartphone with advanced performance, camera technology and a large high-resolution display.",
    image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=900&q=85"
  },
  {
    id: "wireless-headphones",
    name: "Smart Wireless Headphones",
    price: 4500,
    description: "Comfortable wireless headphones with immersive sound and a modern everyday design.",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=85"
  },
  {
    id: "desk-lamp",
    name: "Minimal Desk Lamp",
    price: 2800,
    description: "Modern minimalist desk lamp designed for workspaces, study areas and home offices.",
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=85"
  },
  {
    id: "travel-backpack",
    name: "Everyday Travel Backpack",
    price: 3500,
    description: "Practical everyday backpack with a clean design for travel, school and work.",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=85"
  },
  {
    id: "smart-watch",
    name: "Smart Watch",
    price: 6500,
    description: "Modern smartwatch designed for everyday activity tracking, notifications and convenience.",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=85"
  },
  {
    id: "premium-sneakers",
    name: "Premium Sneakers",
    price: 7200,
    description: "Modern everyday sneakers combining comfort, style and a clean premium look.",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=85"
  }
];

const STORAGE = {
  products: "smithx_custom_products_v2",
  cart: "smithx_cart_v2",
  analytics: "smithx_analytics_v2",
  visitor: "smithx_daily_visitor_v2"
};


/* =========================================================
   HELPERS
   ========================================================= */

function formatKES(amount) {
  return "KES " + Number(amount || 0).toLocaleString("en-KE");
}

function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


/* =========================================================
   PRODUCTS
   ========================================================= */

function getCustomProducts() {
  try {
    return JSON.parse(
      localStorage.getItem(STORAGE.products) || "[]"
    );
  } catch {
    return [];
  }
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
   ANALYTICS
   ========================================================= */

function getAnalytics() {
  try {
    return JSON.parse(
      localStorage.getItem(STORAGE.analytics) ||
      '{"sales":0,"orders":0}'
    );
  } catch {
    return {
      sales: 0,
      orders: 0
    };
  }
}

function saveAnalytics(data) {
  localStorage.setItem(
    STORAGE.analytics,
    JSON.stringify(data)
  );
}


/* =========================================================
   DAILY VISITOR
   ========================================================= */

function registerDailyVisitor() {
  const today = new Date().toISOString().slice(0, 10);

  let visitorData;

  try {
    visitorData = JSON.parse(
      localStorage.getItem(STORAGE.visitor) || "null"
    );
  } catch {
    visitorData = null;
  }

  if (!visitorData || visitorData.date !== today) {
    visitorData = {
      date: today,
      count: 1
    };

    localStorage.setItem(
      STORAGE.visitor,
      JSON.stringify(visitorData)
    );
  }

  return visitorData.count;
}

function getDailyVisitors() {
  try {
    const data = JSON.parse(
      localStorage.getItem(STORAGE.visitor) || "null"
    );

    const today = new Date().toISOString().slice(0, 10);

    if (!data || data.date !== today) {
      return 0;
    }

    return Number(data.count || 0);
  } catch {
    return 0;
  }
}


/* =========================================================
   MARKETPLACE
   ========================================================= */

function renderProducts(searchTerm = "") {
  const grid = document.getElementById("productsGrid");

  if (!grid) {
    console.error("SMITHX ERROR: productsGrid not found.");
    return;
  }

  const products = getAllProducts();

  const term = searchTerm
    .trim()
    .toLowerCase();

  const filteredProducts = products.filter(product => {
    if (!term) return true;

    return (
      product.name.toLowerCase().includes(term) ||
      product.description.toLowerCase().includes(term)
    );
  });

  if (filteredProducts.length === 0) {
    grid.innerHTML = `
      <div style="
        grid-column: 1 / -1;
        text-align: center;
        padding: 50px 20px;
        color: #667085;
      ">
        <h3>No products found</h3>
        <p>Try another search.</p>
      </div>
    `;

    return;
  }

  grid.innerHTML = filteredProducts.map(product => `
    <article class="product-card">

      <div class="product-image">
        <img
          src="${escapeHTML(product.image)}"
          alt="${escapeHTML(product.name)}"
          loading="lazy"
          onerror="this.style.display='none'"
        >
      </div>

      <div class="product-content">

        <h3>
          ${escapeHTML(product.name)}
        </h3>

        <p class="product-description">
          ${escapeHTML(product.description)}
        </p>

        <div class="product-price">
          ${formatKES(product.price)}
        </div>

        <div class="product-actions">

          <button
            type="button"
            onclick="viewProduct('${product.id}')"
          >
            View
          </button>

          <button
            type="button"
            onclick="addToCart('${product.id}')"
          >
            Add to Cart
          </button>

        </div>

      </div>

    </article>
  `).join("");

  updateProductStats();
}


/* =========================================================
   PRODUCT VIEW
   ========================================================= */

function viewProduct(productId) {
  const product = getAllProducts()
    .find(item => item.id === productId);

  if (!product) return;

  const modal = document.getElementById("productModal");
  const content = document.getElementById("productModalContent");

  if (!modal || !content) return;

  content.innerHTML = `
    <div class="product-modal-grid">

      <div class="product-modal-image">
        <img
          src="${escapeHTML(product.image)}"
          alt="${escapeHTML(product.name)}"
        >
      </div>

      <div>

        <p class="hero-eyebrow">
          SMITHX MARKETPLACE
        </p>

        <h2 style="font-size:32px;margin-bottom:12px;">
          ${escapeHTML(product.name)}
        </h2>

        <div class="product-price">
          ${formatKES(product.price)}
        </div>

        <p style="
          color:#667085;
          margin:20px 0;
        ">
          ${escapeHTML(product.description)}
        </p>

        <button
          class="primary-button"
          type="button"
          onclick="addToCart('${product.id}'); closeProductModal();"
        >
          Add to Cart
        </button>

      </div>

    </div>
  `;

  modal.classList.add("active");
}

function closeProductModal() {
  const modal = document.getElementById("productModal");

  if (modal) {
    modal.classList.remove("active");
  }
}


/* =========================================================
   CART
   ========================================================= */

function getCart() {
  try {
    return JSON.parse(
      localStorage.getItem(STORAGE.cart) || "[]"
    );
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(
    STORAGE.cart,
    JSON.stringify(cart)
  );
}

function addToCart(productId) {
  const product = getAllProducts()
    .find(item => item.id === productId);

  if (!product) return;

  const cart = getCart();

  const existing = cart.find(
    item => item.id === productId
  );

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

  showToast(
    `${product.name} added to cart`
  );
}

function removeFromCart(productId) {
  const cart = getCart()
    .filter(item => item.id !== productId);

  saveCart(cart);

  renderCart();
  updateCartCount();
}

function changeQuantity(productId, amount) {
  const cart = getCart();

  const item = cart.find(
    cartItem => cartItem.id === productId
  );

  if (!item) return;

  item.quantity += amount;

  if (item.quantity <= 0) {
    const updatedCart = cart.filter(
      cartItem => cartItem.id !== productId
    );

    saveCart(updatedCart);
  } else {
    saveCart(cart);
  }

  renderCart();
  updateCartCount();
}

function renderCart() {
  const container = document.getElementById("cartItems");
  const subtotalElement = document.getElementById("cartSubtotal");
  const totalElement = document.getElementById("cartTotal");

  if (!container) return;

  const cart = getCart();
  const products = getAllProducts();

  if (cart.length === 0) {
    container.innerHTML = `
      <div style="
        padding:35px 10px;
        text-align:center;
        color:#667085;
      ">
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

  let total = 0;

  container.innerHTML = cart.map(item => {
    const product = products.find(
      p => p.id === item.id
    );

    if (!product) return "";

    const itemTotal =
      Number(product.price) * item.quantity;

    total += itemTotal;

    return `
      <div class="cart-item">

        <img
          src="${escapeHTML(product.image)}"
          alt="${escapeHTML(product.name)}"
        >

        <div>
          <h4>
            ${escapeHTML(product.name)}
          </h4>

          <p>
            ${formatKES(product.price)}
          </p>

          <div style="
            display:flex;
            align-items:center;
            gap:8px;
            margin-top:7px;
          ">

            <button
              type="button"
              onclick="changeQuantity('${product.id}', -1)"
              style="
                width:27px;
                height:27px;
                border:1px solid #d0d5dd;
                background:white;
                border-radius:6px;
              "
            >
              −
            </button>

            <strong>
              ${item.quantity}
            </strong>

            <button
              type="button"
              onclick="changeQuantity('${product.id}', 1)"
              style="
                width:27px;
                height:27px;
                border:1px solid #d0d5dd;
                background:white;
                border-radius:6px;
              "
            >
              +
            </button>

          </div>

          <button
            type="button"
            class="cart-remove"
            onclick="removeFromCart('${product.id}')"
          >
            Remove
          </button>

        </div>

        <strong>
          ${formatKES(itemTotal)}
        </strong>

      </div>
    `;
  }).join("");

  if (subtotalElement) {
    subtotalElement.textContent =
      formatKES(total);
  }

  if (totalElement) {
    totalElement.textContent =
      formatKES(total);
  }
}

function updateCartCount() {
  const cart = getCart();

  const count = cart.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0
  );

  const elements = document.querySelectorAll(
    "#cartCount, .cart-count"
  );

  elements.forEach(element => {
    element.textContent = count;
  });
}

function openCart() {
  const panel = document.getElementById("cartPanel");

  if (panel) {
    panel.classList.add("active");
  }

  renderCart();
}

function closeCart() {
  const panel = document.getElementById("cartPanel");

  if (panel) {
    panel.classList.remove("active");
  }
}


/* =========================================================
   CHECKOUT
   ========================================================= */

function checkout() {
  const cart = getCart();

  if (cart.length === 0) {
    showToast("Your cart is empty.");
    return;
  }

  const products = getAllProducts();

  let total = 0;

  cart.forEach(item => {
    const product = products.find(
      p => p.id === item.id
    );

    if (product) {
      total +=
        Number(product.price) *
        Number(item.quantity);
    }
  });

  const analytics = getAnalytics();

  analytics.sales += total;
  analytics.orders += 1;

  saveAnalytics(analytics);

  localStorage.removeItem(STORAGE.cart);

  renderCart();
  updateCartCount();
  updateDashboard();

  showToast(
    "Demo checkout completed successfully."
  );
}


/* =========================================================
   IMAGE UPLOAD
   ========================================================= */

function compressImage(file, maxWidth = 900, quality = 0.78) {
  return new Promise((resolve, reject) => {

    const reader = new FileReader();

    reader.onload = event => {

      const image = new Image();

      image.onload = () => {

        const scale = Math.min(
          1,
          maxWidth / image.width
        );

        const canvas = document.createElement("canvas");

        canvas.width =
          Math.round(image.width * scale);

        canvas.height =
          Math.round(image.height * scale);

        const ctx = canvas.getContext("2d");

        ctx.drawImage(
          image,
          0,
          0,
          canvas.width,
          canvas.height
        );

        resolve(
          canvas.toDataURL(
            "image/jpeg",
            quality
          )
        );
      };

      image.onerror = reject;
      image.src = event.target.result;
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function handleProductImage(event) {
  const file =
    event.target.files &&
    event.target.files[0];

  if (!file) return;

  try {

    const compressed =
      await compressImage(file);

    const preview =
      document.getElementById("previewImage");

    const previewBox =
      document.getElementById("imagePreview");

    if (preview) {
      preview.src = compressed;
    }

    if (previewBox) {
      previewBox.classList.remove("hidden");
    }

    event.target.dataset.image =
      compressed;

  } catch (error) {
    console.error(error);

    showToast(
      "Could not process this image."
    );
  }
}


/* =========================================================
   SELLER STUDIO
   ========================================================= */

function publishProduct() {

  const nameInput =
    document.getElementById("productName");

  const priceInput =
    document.getElementById("productPrice");

  const descriptionInput =
    document.getElementById("productDescription");

  const imageInput =
    document.getElementById("productImage");

  if (
    !nameInput ||
    !priceInput ||
    !descriptionInput ||
    !imageInput
  ) {
    return;
  }

  const name =
    nameInput.value.trim();

  const price =
    Number(priceInput.value);

  const description =
    descriptionInput.value.trim();

  const image =
    imageInput.dataset.image || "";

  if (!name) {
    showToast("Enter a product name.");
    return;
  }

  if (!price || price <= 0) {
    showToast("Enter a valid price.");
    return;
  }

  if (!description) {
    showToast("Enter a product description.");
    return;
  }

  if (!image) {
    showToast("Choose a product image.");
    return;
  }

  const customProducts =
    getCustomProducts();

  if (customProducts.length >= 3) {
    showToast(
      "Seller Studio limit reached: 3 additional products."
    );
    return;
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
    description,
    image
  };

  customProducts.push(product);

  saveCustomProducts(customProducts);

  nameInput.value = "";
  priceInput.value = "";
  descriptionInput.value = "";
  imageInput.value = "";
  delete imageInput.dataset.image;

  const preview =
    document.getElementById("previewImage");

  const previewBox =
    document.getElementById("imagePreview");

  if (preview) {
    preview.src = "";
  }

  if (previewBox) {
    previewBox.classList.add("hidden");
  }

  renderProducts();
  updateDashboard();

  showToast(
    "Product published to the marketplace."
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

function updateProductStats() {
  const count =
    getAllProducts().length;

  const heroProducts =
    document.getElementById("heroProductCount");

  const dashboardProducts =
    document.getElementById("dashboardProducts");

  const activityProducts =
    document.getElementById("activityProducts");

  if (heroProducts) {
    heroProducts.textContent = count;
  }

  if (dashboardProducts) {
    dashboardProducts.textContent = count;
  }

  if (activityProducts) {
    activityProducts.textContent = count;
  }
}

function updateDashboard() {

  const analytics =
    getAnalytics();

  const visitors =
    getDailyVisitors();

  const products =
    getAllProducts().length;

  const sales =
    Number(analytics.sales || 0);

  const orders =
    Number(analytics.orders || 0);

  const heroProducts =
    document.getElementById("heroProductCount");

  const heroVisitors =
    document.getElementById("heroVisitorCount");

  const heroSales =
    document.getElementById("heroSales");

  const heroOrders =
    document.getElementById("heroOrders");

  const dashboardProducts =
    document.getElementById("dashboardProducts");

  const dashboardVisitors =
    document.getElementById("dashboardVisitors");

  const dashboardSales =
    document.getElementById("dashboardSales");

  const dashboardOrders =
    document.getElementById("dashboardOrders");

  const activityProducts =
    document.getElementById("activityProducts");

  const activityVisitors =
    document.getElementById("activityVisitors");

  const activitySales =
    document.getElementById("activitySales");

  const activityOrders =
    document.getElementById("activityOrders");

  if (heroProducts)
    heroProducts.textContent = products;

  if (heroVisitors)
    heroVisitors.textContent = visitors;

  if (heroSales)
    heroSales.textContent = formatKES(sales);

  if (heroOrders)
    heroOrders.textContent = orders;

  if (dashboardProducts)
    dashboardProducts.textContent = products;

  if (dashboardVisitors)
    dashboardVisitors.textContent = visitors;

  if (dashboardSales)
    dashboardSales.textContent = formatKES(sales);

  if (dashboardOrders)
    dashboardOrders.textContent = orders;

  if (activityProducts)
    activityProducts.textContent = products;

  if (activityVisitors)
    activityVisitors.textContent = visitors;

  if (activitySales)
    activitySales.textContent = formatKES(sales);

  if (activityOrders)
    activityOrders.textContent = orders;
}

function resetAnalytics() {

  const confirmed =
    confirm(
      "Reset demo sales, orders and today's visitor count?"
    );

  if (!confirmed) return;

  localStorage.setItem(
    STORAGE.analytics,
    JSON.stringify({
      sales: 0,
      orders: 0
    })
  );

  const today =
    new Date().toISOString().slice(0, 10);

  localStorage.setItem(
    STORAGE.visitor,
    JSON.stringify({
      date: today,
      count: 1
    })
  );

  updateDashboard();

  showToast(
    "Demo analytics reset."
  );
}


/* =========================================================
   SEARCH
   ========================================================= */

function searchProducts() {
  const input =
    document.getElementById("productSearch");

  if (!input) return;

  renderProducts(input.value);
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


/* =========================================================
   UPDATE HISTORY
   ========================================================= */

function toggleUpdateHistory() {

  const extra =
    document.getElementById(
      "updateHistoryExtra"
    );

  if (!extra) return;

  extra.classList.toggle("hidden");
}


/* =========================================================
   TOAST
   ========================================================= */

let toastTimer;

function showToast(message) {

  const toast =
    document.getElementById("toast");

  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2600);
}


/* =========================================================
   INITIALIZE SMITHX
   ========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    console.log(
      "SMITHX MVP loading..."
    );

    /*
      IMPORTANT:
      Register this browser as today's visitor.
    */
    registerDailyVisitor();

    /*
      Render the six default products
      immediately when the marketplace opens.
    */
    renderProducts();

    /*
      Load saved cart.
    */
    renderCart();
    updateCartCount();

    /*
      Load dashboard analytics.
    */
    updateDashboard();

    /*
      Product image upload.
    */
    const imageInput =
      document.getElementById(
        "productImage"
      );

    if (imageInput) {
      imageInput.addEventListener(
        "change",
        handleProductImage
      );
    }

    /*
      Publish product.
    */
    const publishButton =
      document.getElementById(
        "publishProduct"
      );

    if (publishButton) {
      publishButton.addEventListener(
        "click",
        publishProduct
      );
    }

    /*
      Search.
    */
    const searchInput =
      document.getElementById(
        "productSearch"
      );

    if (searchInput) {
      searchInput.addEventListener(
        "input",
        searchProducts
      );
    }

    /*
      Checkout.
    */
    const checkoutButton =
      document.getElementById(
        "checkoutButton"
      );

    if (checkoutButton) {
      checkoutButton.addEventListener(
        "click",
        checkout
      );
    }

    /*
      Reset analytics.
    */
    const resetButton =
      document.getElementById(
        "resetAnalytics"
      );

    if (resetButton) {
      resetButton.addEventListener(
        "click",
        resetAnalytics
      );
    }

    /*
      Close product modal when
      clicking outside the content.
    */
    const modal =
      document.getElementById(
        "productModal"
      );

    if (modal) {
      modal.addEventListener(
        "click",
        event => {
          if (event.target === modal) {
            closeProductModal();
          }
        }
      );
    }

    console.log(
      "SMITHX MVP ready.",
      getAllProducts().length,
      "products loaded."
    );
  }
);
