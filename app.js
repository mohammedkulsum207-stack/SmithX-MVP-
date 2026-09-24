/* =========================================================
   SMITHX MVP
   Marketplace + Cart + Seller Studio + AI + Dashboard
   ========================================================= */


/* =========================================================
   DEFAULT SIX PRODUCTS
   These are ALWAYS available when the marketplace loads.
   ========================================================= */

const DEFAULT_PRODUCTS = [

  {
    id: "default-1",
    name: "Samsung Galaxy S26 Ultra",
    price: 169999,
    description:
      "A premium flagship smartphone with powerful performance, advanced cameras and a large immersive display.",
    image:
      "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=900&q=85"
  },

  {
    id: "default-2",
    name: "Smart Wireless Headphones",
    price: 4500,
    description:
      "Wireless headphones designed for clear sound, comfortable listening and everyday entertainment.",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=85"
  },

  {
    id: "default-3",
    name: "Minimal Desk Lamp",
    price: 2800,
    description:
      "A modern minimalist desk lamp that brings clean lighting and a stylish look to your workspace.",
    image:
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=85"
  },

  {
    id: "default-4",
    name: "Everyday Travel Backpack",
    price: 3500,
    description:
      "A practical everyday backpack with enough room for work, travel, school and daily essentials.",
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=85"
  },

  {
    id: "default-5",
    name: "Smart Watch",
    price: 6500,
    description:
      "A modern smart watch designed for notifications, activity tracking and everyday convenience.",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=85"
  },

  {
    id: "default-6",
    name: "Premium Sneakers",
    price: 7200,
    description:
      "Comfortable modern sneakers built for everyday movement with a clean premium design.",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=85"
  }

];


/* =========================================================
   STORAGE
   ========================================================= */

const PRODUCTS_KEY = "smithx_custom_products_v2";
const CART_KEY = "smithx_cart_v2";
const ANALYTICS_KEY = "smithx_analytics_v2";
const VISITOR_KEY = "smithx_daily_visitor_v2";


/* =========================================================
   STATE
   ========================================================= */

let customProducts = loadCustomProducts();
let cart = loadCart();
let analytics = loadAnalytics();


/* =========================================================
   DOM
   ========================================================= */

const productsGrid = document.getElementById("productsGrid");
const noProducts = document.getElementById("noProducts");

const searchInput = document.getElementById("searchInput");

const cartDrawer = document.getElementById("cartDrawer");
const cartOverlay = document.getElementById("cartOverlay");

const cartItems = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");
const cartTotal = document.getElementById("cartTotal");

const productImage = document.getElementById("productImage");
const previewImage = document.getElementById("previewImage");
const imagePreview = document.getElementById("imagePreview");

const publishProductButton =
  document.getElementById("publishProduct");

const aiGenerateButton =
  document.getElementById("aiGenerate");

const aiResult =
  document.getElementById("aiResult");


/* =========================================================
   HELPERS
   ========================================================= */

function money(value) {
  return "KES " + Number(value).toLocaleString("en-KE");
}


function getAllProducts() {
  return [...DEFAULT_PRODUCTS, ...customProducts];
}


function scrollToSection(id) {
  document.getElementById(id)?.scrollIntoView({
    behavior: "smooth"
  });
}


function showToast(message) {

  const toast = document.getElementById("toast");

  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}


/* =========================================================
   PRODUCT STORAGE
   ========================================================= */

function loadCustomProducts() {

  try {

    const saved =
      localStorage.getItem(PRODUCTS_KEY);

    if (!saved) return [];

    const parsed = JSON.parse(saved);

    return Array.isArray(parsed) ? parsed : [];

  } catch {

    return [];
  }
}


function saveCustomProducts() {

  localStorage.setItem(
    PRODUCTS_KEY,
    JSON.stringify(customProducts)
  );
}


/* =========================================================
   CART STORAGE
   ========================================================= */

function loadCart() {

  try {

    const saved =
      localStorage.getItem(CART_KEY);

    if (!saved) return [];

    const parsed = JSON.parse(saved);

    return Array.isArray(parsed) ? parsed : [];

  } catch {

    return [];
  }
}


function saveCart() {

  localStorage.setItem(
    CART_KEY,
    JSON.stringify(cart)
  );
}


/* =========================================================
   ANALYTICS STORAGE
   ========================================================= */

function todayKey() {

  const now = new Date();

  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0")
  ].join("-");
}


function loadAnalytics() {

  try {

    const saved =
      localStorage.getItem(ANALYTICS_KEY);

    if (!saved) {

      return {
        date: todayKey(),
        users: 0,
        sales: 0,
        orders: 0
      };

    }

    const data = JSON.parse(saved);

    if (data.date !== todayKey()) {

      return {
        date: todayKey(),
        users: 0,
        sales: 0,
        orders: 0
      };

    }

    return {
      date: todayKey(),
      users: Number(data.users) || 0,
      sales: Number(data.sales) || 0,
      orders: Number(data.orders) || 0
    };

  } catch {

    return {
      date: todayKey(),
      users: 0,
      sales: 0,
      orders: 0
    };
  }
}


function saveAnalytics() {

  localStorage.setItem(
    ANALYTICS_KEY,
    JSON.stringify(analytics)
  );
}


/* =========================================================
   DAILY VISITOR
   One visit per browser/device per day.
   ========================================================= */

function registerTodayUser() {

  const today = todayKey();

  const previous =
    localStorage.getItem(VISITOR_KEY);

  if (previous !== today) {

    analytics.users++;

    analytics.date = today;

    saveAnalytics();

    localStorage.setItem(
      VISITOR_KEY,
      today
    );
  }
}


/* =========================================================
   RENDER PRODUCTS
   ========================================================= */

function renderProducts(searchTerm = "") {

  const products = getAllProducts();

  const term =
    searchTerm.trim().toLowerCase();

  const filtered = products.filter(product => {

    if (!term) return true;

    return (
      product.name.toLowerCase().includes(term) ||
      product.description.toLowerCase().includes(term)
    );

  });


  productsGrid.innerHTML = "";


  if (filtered.length === 0) {

    noProducts.classList.remove("hidden");

    return;
  }

  noProducts.classList.add("hidden");


  filtered.forEach(product => {

    const card =
      document.createElement("article");

    card.className = "product-card";

    card.innerHTML = `

      <div class="product-image">
        <img
          src="${escapeAttribute(product.image)}"
          alt="${escapeAttribute(product.name)}"
          loading="lazy"
        >
      </div>

      <div class="product-info">

        <h3>${escapeHTML(product.name)}</h3>

        <p class="product-description">
          ${escapeHTML(product.description)}
        </p>

        <div class="product-price">
          ${money(product.price)}
        </div>

        <div class="product-actions">

          <button
            class="view-btn"
            onclick="openProductModal('${product.id}')"
          >
            View
          </button>

          <button
            class="add-btn"
            onclick="addToCart('${product.id}')"
          >
            Add to Cart
          </button>

        </div>

      </div>
    `;

    productsGrid.appendChild(card);
  });


  updateDashboard();
}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(value) {

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


function escapeAttribute(value) {

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}


/* =========================================================
   PRODUCT MODAL
   ========================================================= */

let selectedModalProduct = null;


function openProductModal(id) {

  const product =
    getAllProducts().find(
      item => item.id === id
    );

  if (!product) return;

  selectedModalProduct = product;

  document.getElementById("modalImage").src =
    product.image;

  document.getElementById("modalImage").alt =
    product.name;

  document.getElementById("modalName").textContent =
    product.name;

  document.getElementById("modalPrice").textContent =
    money(product.price);

  document.getElementById("modalDescription").textContent =
    product.description;

  document
    .getElementById("productModal")
    .classList.remove("hidden");
}


function closeProductModal() {

  document
    .getElementById("productModal")
    .classList.add("hidden");

  selectedModalProduct = null;
}


document.getElementById("modalAdd").addEventListener(
  "click",
  () => {

    if (!selectedModalProduct) return;

    addToCart(selectedModalProduct.id);

    closeProductModal();
  }
);


/* =========================================================
   CART
   ========================================================= */

function addToCart(productId) {

  const product =
    getAllProducts().find(
      item => item.id === productId
    );

  if (!product) return;


  const existing =
    cart.find(
      item => item.id === productId
    );


  if (existing) {

    existing.quantity++;

  } else {

    cart.push({
      id: product.id,
      quantity: 1
    });

  }


  saveCart();

  renderCart();

  openCart();

  showToast(
    product.name + " added to cart"
  );
}


function increaseQuantity(productId) {

  const item =
    cart.find(
      product => product.id === productId
    );

  if (!item) return;

  item.quantity++;

  saveCart();

  renderCart();
}


function decreaseQuantity(productId) {

  const item =
    cart.find(
      product => product.id === productId
    );

  if (!item) return;


  item.quantity--;


  if (item.quantity <= 0) {

    cart =
      cart.filter(
        product => product.id !== productId
      );
  }


  saveCart();

  renderCart();
}


function removeFromCart(productId) {

  cart =
    cart.filter(
      item => item.id !== productId
    );

  saveCart();

  renderCart();
}


/* =========================================================
   CART RENDER
   ========================================================= */

function renderCart() {

  cartItems.innerHTML = "";

  let total = 0;
  let count = 0;


  cart.forEach(item => {

    const product =
      getAllProducts().find(
        p => p.id === item.id
      );

    if (!product) return;


    const lineTotal =
      product.price * item.quantity;

    total += lineTotal;

    count += item.quantity;


    const row =
      document.createElement("div");

    row.className = "cart-item";

    row.innerHTML = `

      <img
        src="${escapeAttribute(product.image)}"
        alt="${escapeAttribute(product.name)}"
      >

      <div>

        <h4>
          ${escapeHTML(product.name)}
        </h4>

        <div class="cart-item-price">
          ${money(lineTotal)}
        </div>

        <div class="quantity-controls">

          <button
            onclick="decreaseQuantity('${product.id}')"
          >
            −
          </button>

          <strong>${item.quantity}</strong>

          <button
            onclick="increaseQuantity('${product.id}')"
          >
            +
          </button>

          <button
            class="remove-item"
            onclick="removeFromCart('${product.id}')"
          >
            Remove
          </button>

        </div>

      </div>
    `;


    cartItems.appendChild(row);

  });


  cartCount.textContent = count;

  cartTotal.textContent = money(total);


  if (cart.length === 0) {

    cartItems.innerHTML = `
      <div class="empty-state">
        Your cart is empty.
      </div>
    `;
  }
}


/* =========================================================
   CART OPEN/CLOSE
   ========================================================= */

function openCart() {

  cartDrawer.classList.add("open");

  cartOverlay.classList.add("active");
}


function closeCart() {

  cartDrawer.classList.remove("open");

  cartOverlay.classList.remove("active");
}


document
  .getElementById("openCart")
  .addEventListener("click", openCart);


document
  .getElementById("closeCart")
  .addEventListener("click", closeCart);


cartOverlay.addEventListener(
  "click",
  closeCart
);


/* =========================================================
   CHECKOUT
   ========================================================= */

document
  .getElementById("checkoutButton")
  .addEventListener("click", checkout);


function checkout() {

  if (cart.length === 0) {

    showToast("Your cart is empty.");

    return;
  }


  let total = 0;


  cart.forEach(item => {

    const product =
      getAllProducts().find(
        p => p.id === item.id
      );

    if (product) {

      total +=
        product.price *
        item.quantity;
    }
  });


  analytics.sales += total;

  analytics.orders++;

  analytics.date = todayKey();

  saveAnalytics();


  cart = [];

  saveCart();

  renderCart();

  updateDashboard();

  closeCart();


  showToast(
    "Demo checkout completed successfully."
  );


  scrollToSection("dashboard");
}


/* =========================================================
   IMAGE UPLOAD
   Compress uploaded image before localStorage.
   ========================================================= */

productImage.addEventListener(
  "change",
  event => {

    const file =
      event.target.files?.[0];

    if (!file) return;


    const reader =
      new FileReader();


    reader.onload = () => {

      previewImage.src =
        reader.result;

      imagePreview.classList.remove(
        "hidden"
      );
    };


    reader.readAsDataURL(file);
  }
);


/* =========================================================
   COMPRESS IMAGE
   Prevents localStorage from becoming too large.
   ========================================================= */

function compressImage(file) {

  return new Promise(
    (resolve, reject) => {

      const reader =
        new FileReader();


      reader.onload = event => {

        const img =
          new Image();


        img.onload = () => {

          const maxSize = 1200;

          let width = img.width;
          let height = img.height;


          if (width > maxSize ||
              height > maxSize) {

            if (width > height) {

              height =
                height *
                (maxSize / width);

              width = maxSize;

            } else {

              width =
                width *
                (maxSize / height);

              height = maxSize;
            }
          }


          const canvas =
            document.createElement("canvas");

          canvas.width = width;
          canvas.height = height;


          const ctx =
            canvas.getContext("2d");


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
              .78
            )
          );

        };


        img.onerror = reject;

        img.src = event.target.result;
      };


      reader.onerror = reject;

      reader.readAsDataURL(file);
    }
  );
}


/* =========================================================
   PUBLISH PRODUCT
   ========================================================= */

publishProductButton.addEventListener(
  "click",
  publishProduct
);


async function publishProduct() {

  if (customProducts.length >= 3) {

    showToast(
      "You have reached the 3 additional product limit."
    );

    return;
  }


  const name =
    document
      .getElementById("productName")
      .value.trim();


  const price =
    Number(
      document
        .getElementById("productPrice")
        .value
    );


  const description =
    document
      .getElementById("productDescription")
      .value.trim();


  const file =
    productImage.files?.[0];


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


  if (!file) {

    showToast("Choose a product image.");

    return;
  }


  try {

    publishProductButton.disabled = true;

    publishProductButton.textContent =
      "Publishing...";


    const image =
      await compressImage(file);


    const newProduct = {

      id:
        "custom-" +
        Date.now(),

      name,

      price,

      description,

      image
    };


    customProducts.push(
      newProduct
    );


    saveCustomProducts();


    document
      .getElementById("productName")
      .value = "";

    document
      .getElementById("productPrice")
      .value = "";

    document
      .getElementById("productDescription")
      .value = "";

    productImage.value = "";

    imagePreview.classList.add(
      "hidden"
    );


    renderProducts();

    updateDashboard();


    showToast(
      "Product published to SmithX Marketplace!"
    );


    scrollToSection("marketplace");


  } catch (error) {

    console.error(error);

    showToast(
      "Could not save the image. Try another image."
    );

  } finally {

    publishProductButton.disabled = false;

    publishProductButton.textContent =
      "＋ Publish Product";
  }
}


/* =========================================================
   AI SELLER ASSISTANT
   ========================================================= */

aiGenerateButton.addEventListener(
  "click",
  generateAIProduct
);


function generateAIProduct() {

  const name =
    document
      .getElementById("productName")
      .value.trim();


  if (!name) {

    showToast(
      "Enter a product name first."
    );

    return;
  }


  const price =
    Number(
      document
        .getElementById("productPrice")
        .value
    );


  const generatedDescription =
    `${name} is a modern product designed to combine quality, convenience and everyday value. Perfect for customers looking for a reliable addition to their lifestyle.`;


  const suggestedPrice =
    price > 0
      ? Math.round(price / 100) * 100
      : 5000;


  document
    .getElementById("productDescription")
    .value =
      generatedDescription;


  aiResult.innerHTML = `

    <strong>AI Product Assistant</strong>

    <p>
      Suggested description generated for
      <strong>${escapeHTML(name)}</strong>.
    </p>

    <p>
      Suggested demo price:
      <strong>${money(suggestedPrice)}</strong>
    </p>

  `;


  aiResult.classList.remove(
    "hidden"
  );


  showToast(
    "AI product details generated."
  );
}


/* =========================================================
   DASHBOARD
   ========================================================= */

function updateDashboard() {

  const productCount =
    getAllProducts().length;


  const users =
    analytics.users;


  const sales =
    analytics.sales;


  const orders =
    analytics.orders;


  document
    .getElementById("heroProducts")
    .textContent =
      productCount;


  document
    .getElementById("heroUsers")
    .textContent =
      users;


  document
    .getElementById("heroSales")
    .textContent =
      money(sales);


  document
    .getElementById("dashboardProducts")
    .textContent =
      productCount;


  document
    .getElementById("dashboardUsers")
    .textContent =
      users;


  document
    .getElementById("dashboardSales")
    .textContent =
      money(sales);


  document
    .getElementById("dashboardOrders")
    .textContent =
      orders;


  document
    .getElementById("activityProducts")
    .textContent =
      productCount;


  document
    .getElementById("activityUsers")
    .textContent =
      users;


  document
    .getElementById("activitySales")
    .textContent =
      money(sales);


  document
    .getElementById("activityOrders")
    .textContent =
      orders;
}


/* =========================================================
   RESET ANALYTICS
   ========================================================= */

document
  .getElementById("resetAnalytics")
  .addEventListener(
    "click",
    resetAnalytics
  );


function resetAnalytics() {

  const confirmed =
    confirm(
      "Reset today's SmithX demo analytics?"
    );


  if (!confirmed) return;


  analytics = {

    date: todayKey(),

    users: 0,

    sales: 0,

    orders: 0
  };


  localStorage.removeItem(
    VISITOR_KEY
  );


  saveAnalytics();

  registerTodayUser();

  updateDashboard();


  showToast(
    "Demo analytics have been reset."
  );
}


/* =========================================================
   SEARCH
   ========================================================= */

searchInput.addEventListener(
  "input",
  event => {

    renderProducts(
      event.target.value
    );
  }
);


/* =========================================================
   START SMITHX
   ========================================================= */

function initializeSmithX() {

  /*
    IMPORTANT:
    Render the six default products immediately.
  */

  registerTodayUser();

  renderProducts();

  renderCart();

  updateDashboard();

}


initializeSmithX();
