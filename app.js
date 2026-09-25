/* =========================================================
   SMITHX MVP — APP.JS
   Version 1.8
   ========================================================= */


const DEFAULT_PRODUCTS = [

  {
    id: "s26-ultra",
    name: "Samsung Galaxy S26 Ultra",
    price: 169999,
    description:
      "Premium Samsung smartphone with advanced performance, camera technology and a large high-resolution display.",
    image:
      "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=900&q=85"
  },

  {
    id: "wireless-headphones",
    name: "Smart Wireless Headphones",
    price: 4500,
    description:
      "Comfortable wireless headphones with immersive sound and a modern everyday design.",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=85"
  },

  {
    id: "desk-lamp",
    name: "Minimal Desk Lamp",
    price: 2800,
    description:
      "Modern minimalist desk lamp designed for workspaces, study areas and home offices.",
    image:
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=85"
  },

  {
    id: "travel-backpack",
    name: "Everyday Travel Backpack",
    price: 3500,
    description:
      "Practical everyday backpack with a clean design for travel, school and work.",
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=85"
  },

  {
    id: "smart-watch",
    name: "Smart Watch",
    price: 6500,
    description:
      "Modern smartwatch designed for everyday activity tracking, notifications and convenience.",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=85"
  },

  {
    id: "premium-sneakers",
    name: "Premium Sneakers",
    price: 7200,
    description:
      "Modern everyday sneakers combining comfort, style and a clean premium look.",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=85"
  }

];


const STORAGE = {

  products: "smithx_custom_products_v2",

  cart: "smithx_cart_v2",

  analytics: "smithx_analytics_v2",

  visitor: "smithx_daily_visitor_v2"

};


/* =========================================================
   UTILITIES
========================================================= */

function formatKES(amount) {

  return (
    "KES " +
    Number(amount || 0).toLocaleString("en-KE")
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


function getTodayKey() {

  return new Date()
    .toISOString()
    .slice(0, 10);

}


function registerDailyVisitor() {

  const today = getTodayKey();

  let visitorData;

  try {

    visitorData = JSON.parse(
      localStorage.getItem(STORAGE.visitor) || "null"
    );

  } catch {

    visitorData = null;

  }


  if (
    !visitorData ||
    visitorData.date !== today
  ) {

    visitorData = {

      date: today,

      count: 1

    };

    localStorage.setItem(
      STORAGE.visitor,
      JSON.stringify(visitorData)
    );

    return 1;

  }


  return Number(
    visitorData.count || 0
  );

}


function getDailyVisitors() {

  try {

    const data = JSON.parse(
      localStorage.getItem(STORAGE.visitor) || "null"
    );

    if (
      !data ||
      data.date !== getTodayKey()
    ) {

      return 0;

    }

    return Number(
      data.count || 0
    );

  } catch {

    return 0;

  }

}


/* =========================================================
   RENDER PRODUCTS
========================================================= */

function renderProducts(searchTerm = "") {

  const grid =
    document.getElementById("productsGrid");

  if (!grid) return;


  const products =
    getAllProducts();


  const term =
    String(searchTerm)
      .trim()
      .toLowerCase();


  const filteredProducts =
    products.filter(product => {

      if (!term) return true;

      return (

        String(product.name)
          .toLowerCase()
          .includes(term)

        ||

        String(product.description)
          .toLowerCase()
          .includes(term)

      );

    });


  if (
    filteredProducts.length === 0
  ) {

    grid.innerHTML = `

      <div style="
        grid-column:1/-1;
        text-align:center;
        padding:50px 20px;
        color:#667085;
      ">

        <h3>
          No products found
        </h3>

        <p>
          Try another search.
        </p>

      </div>

    `;

    return;

  }


  grid.innerHTML =

    filteredProducts

      .map(product => `

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
                onclick="viewProduct('${escapeHTML(product.id)}')"
              >
                View
              </button>


              <button
                type="button"
                onclick="addToCart('${escapeHTML(product.id)}')"
              >
                Add to Cart
              </button>

            </div>

          </div>

        </article>

      `)

      .join("");


  updateProductStats();

}


/* =========================================================
   PRODUCT STATS
========================================================= */

function updateProductStats() {

  const products =
    getAllProducts();


  const productCount =
    document.getElementById("productCount");


  const totalProducts =
    document.getElementById("totalProducts");


  if (productCount) {

    productCount.textContent =
      products.length;

  }


  if (totalProducts) {

    totalProducts.textContent =
      products.length;

  }

}


/* =========================================================
   PRODUCT MODAL
========================================================= */

function viewProduct(productId) {

  const product =
    getAllProducts()
      .find(item => item.id === productId);


  if (!product) return;


  const modal =
    document.getElementById("productModal");


  const content =
    document.getElementById(
      "productModalContent"
    );


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


        <h2>
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
          onclick="
            addToCart('${escapeHTML(product.id)}');
            closeProductModal();
          "
        >
          Add to Cart
        </button>

      </div>

    </div>

  `;


  modal.classList.add("active");

  modal.setAttribute(
    "aria-hidden",
    "false"
  );

}


function closeProductModal() {

  const modal =
    document.getElementById("productModal");


  if (!modal) return;


  modal.classList.remove("active");

  modal.setAttribute(
    "aria-hidden",
    "true"
  );

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


/* =========================================================
   ADD TO CART
========================================================= */

function addToCart(productId) {

  const product =
    getAllProducts()
      .find(item => item.id === productId);


  if (!product) {

    showToast(
      "Product could not be found."
    );

    return;

  }


  const cart =
    getCart();


  const existing =
    cart.find(
      item => item.id === productId
    );


  if (existing) {

    existing.quantity =
      Number(existing.quantity || 0) + 1;

  } else {

    cart.push({

      id: productId,

      quantity: 1

    });

  }


  saveCart(cart);


  updateCartCount();

  renderCart();


  showToast(
    `${product.name} added to cart`
  );

}


/* =========================================================
   REMOVE
========================================================= */

function removeFromCart(productId) {

  const cart =
    getCart()
      .filter(
        item => item.id !== productId
      );


  saveCart(cart);


  renderCart();

  updateCartCount();


  showToast(
    "Product removed from cart."
  );

}


/* =========================================================
   QUANTITY
========================================================= */

function changeQuantity(
  productId,
  amount
) {

  const cart =
    getCart();


  const item =
    cart.find(
      cartItem =>
        cartItem.id === productId
    );


  if (!item) return;


  item.quantity =
    Number(item.quantity || 0) +
    Number(amount || 0);


  if (item.quantity <= 0) {

    const updatedCart =
      cart.filter(
        cartItem =>
          cartItem.id !== productId
      );

    saveCart(updatedCart);

  } else {

    saveCart(cart);

  }


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


  const cart =
    getCart();


  const products =
    getAllProducts();


  if (cart.length === 0) {

    container.innerHTML = `

      <div style="
        padding:35px 10px;
        text-align:center;
        color:#667085;
      ">

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


  let total = 0;


  container.innerHTML =

    cart

      .map(item => {

        const product =
          products.find(
            p => p.id === item.id
          );


        if (!product) return "";


        const quantity =
          Number(item.quantity || 0);


        const itemTotal =
          Number(product.price) *
          quantity;


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
                margin-top:8px;
              ">

                <button
                  type="button"
                  onclick="
                    changeQuantity(
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
                    changeQuantity(
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
                class="cart-remove"
                onclick="
                  removeFromCart(
                    '${escapeHTML(product.id)}'
                  )
                "
              >
                Remove
              </button>

            </div>


            <strong>
              ${formatKES(itemTotal)}
            </strong>

          </div>

        `;

      })

      .join("");


  if (subtotalElement) {

    subtotalElement.textContent =
      formatKES(total);

  }


  if (totalElement) {

    totalElement.textContent =
      formatKES(total);

  }

}


/* =========================================================
   CART COUNT
========================================================= */

function updateCartCount() {

  const cart =
    getCart();


  const count =
    cart.reduce(
      (sum, item) =>
        sum +
        Number(item.quantity || 0),
      0
    );


  const elements =
    document.querySelectorAll(
      "#cartCount, .cart-count"
    );


  elements.forEach(element => {

    element.textContent =
      count;

  });

}


/* =========================================================
   OPEN CART
========================================================= */

function openCart() {

  const panel =
    document.getElementById(
      "cartPanel"
    );


  if (!panel) {

    console.error(
      "SMITHX: Cart panel not found."
    );

    return;

  }


  renderCart();

  updateCartCount();


  panel.classList.add("active");

}


/* =========================================================
   CLOSE CART
========================================================= */

function closeCart() {

  const panel =
    document.getElementById(
      "cartPanel"
    );


  if (!panel) return;


  panel.classList.remove("active");

}


/* =========================================================
   CHECKOUT
========================================================= */

function checkout() {

  const cart =
    getCart();


  if (cart.length === 0) {

    showToast(
      "Your cart is empty."
    );

    return;

  }


  const products =
    getAllProducts();


  let total = 0;


  cart.forEach(item => {

    const product =
      products.find(
        p => p.id === item.id
      );


    if (product) {

      total +=
        Number(product.price) *
        Number(item.quantity || 0);

    }

  });


  if (total <= 0) {

    showToast(
      "Unable to calculate your order."
    );

    return;

  }


  const analytics =
    getAnalytics();


  analytics.sales =
    Number(analytics.sales || 0) +
    total;


  analytics.orders =
    Number(analytics.orders || 0) +
    1;


  saveAnalytics(analytics);


  localStorage.removeItem(
    STORAGE.cart
  );


  renderCart();

  updateCartCount();

  updateDashboard();


  showToast(
    "Demo checkout completed successfully."
  );


  setTimeout(() => {

    closeCart();

  }, 1200);

}


/* =========================================================
   IMAGE UPLOAD
========================================================= */

function compressImage(
  file,
  maxWidth = 900,
  quality = 0.78
) {

  return new Promise(
    (resolve, reject) => {

      const reader =
        new FileReader();


      reader.onload =
        event => {

          const image =
            new Image();


          image.onload =
            () => {

              const scale =
                Math.min(
                  1,
                  maxWidth /
                    image.width
                );


              const canvas =
                document.createElement(
                  "canvas"
                );


              canvas.width =
                Math.round(
                  image.width *
                  scale
                );


              canvas.height =
                Math.round(
                  image.height *
                  scale
                );


              const ctx =
                canvas.getContext(
                  "2d"
                );


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


          image.onerror =
            reject;


          image.src =
            event.target.result;

        };


      reader.onerror =
        reject;


      reader.readAsDataURL(file);

    }
  );

}


async function handleProductImage(event) {

  const file =
    event.target.files &&
    event.target.files[0];


  if (!file) return;


  if (!file.type.startsWith("image/")) {

    showToast(
      "Please choose an image file."
    );

    return;

  }


  try {

    const compressed =
      await compressImage(file);


    const preview =
      document.getElementById(
        "previewImage"
      );


    const previewBox =
      document.getElementById(
        "imagePreview"
      );


    if (preview) {

      preview.src =
        compressed;

    }


    if (previewBox) {

      previewBox.classList.remove(
        "hidden"
      );

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
   PUBLISH PRODUCT
========================================================= */

function publishProduct() {

  const nameInput =
    document.getElementById(
      "productName"
    );


  const priceInput =
    document.getElementById(
      "productPrice"
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


  if (!description) {

    showToast(
      "Enter a product description."
    );

    return;

  }


  if (!image) {

    showToast(
      "Choose a product image."
    );

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


  customProducts.push(
    product
  );


  saveCustomProducts(
    customProducts
  );


  nameInput.value = "";

  priceInput.value = "";

  descriptionInput.value = "";

  imageInput.value = "";


  delete imageInput.dataset.image;


  const preview =
    document.getElementById(
      "previewImage"
    );


  const previewBox =
    document.getElementById(
      "imagePreview"
    );


  if (preview) {

    preview.src = "";

  }


  if (previewBox) {

    previewBox.classList.add(
      "hidden"
    );

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

function updateDashboard() {

  const products =
    getAllProducts();


  const analytics =
    getAnalytics();


  const visitors =
    getDailyVisitors();


  const productCount =
    document.getElementById(
      "dashboardProducts"
    );


  const ordersCount =
    document.getElementById(
      "dashboardOrders"
    );


  const revenue =
    document.getElementById(
      "dashboardRevenue"
    );


  const visitorsElement =
    document.getElementById(
      "dashboardVisitors"
    );


  if (productCount) {

    productCount.textContent =
      products.length;

  }


  if (ordersCount) {

    ordersCount.textContent =
      Number(
        analytics.orders || 0
      );

  }


  if (revenue) {

    revenue.textContent =
      formatKES(
        analytics.sales || 0
      );

  }


  if (visitorsElement) {

    visitorsElement.textContent =
      visitors;

  }


  updateProductStats();

}


/* =========================================================
   RESET ANALYTICS
========================================================= */

function resetAnalytics() {

  const confirmed =
    window.confirm(
      "Reset demo sales and order analytics?"
    );


  if (!confirmed) return;


  saveAnalytics({

    sales: 0,

    orders: 0

  });


  updateDashboard();


  showToast(
    "Dashboard analytics reset."
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


  if (!history || !button) {

    return;

  }


  const isHidden =
    history.style.display === "none" ||
    history.style.display === "";


  if (isHidden) {

    history.style.display =
      "block";


    button.textContent =
      "Hide Updates";

  } else {

    history.style.display =
      "none";


    button.textContent =
      "View Updates";

  }

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
   TOAST
========================================================= */

let toastTimer = null;


function showToast(message) {

  const toast =
    document.getElementById(
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
    toastTimer
  );


  toastTimer =
    setTimeout(() => {

      toast.classList.remove(
        "show"
      );

    }, 3000);

}


/* =========================================================
   SEARCH
========================================================= */

function setupSearch() {

  const searchInput =
    document.getElementById(
      "productSearch"
    );


  if (!searchInput) {

    return;

  }


  searchInput.addEventListener(
    "input",
    event => {

      renderProducts(
        event.target.value
      );

    }
  );

}


/* =========================================================
   MODAL
========================================================= */

function setupModalClosing() {

  const modal =
    document.getElementById(
      "productModal"
    );


  if (!modal) return;


  modal.addEventListener(
    "click",
    event => {

      if (
        event.target === modal
      ) {

        closeProductModal();

      }

    }
  );

}


/* =========================================================
   ESCAPE KEY
========================================================= */

function setupKeyboardControls() {

  document.addEventListener(
    "keydown",
    event => {

      if (
        event.key === "Escape"
      ) {

        closeProductModal();

        closeCart();

      }

    }
  );

}


/* =========================================================
   INITIALIZE
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    registerDailyVisitor();

    renderProducts();

    renderCart();

    updateCartCount();

    updateDashboard();

    setupSearch();

    setupModalClosing();

    setupKeyboardControls();


    /* Updates hidden initially */

    const updateHistory =
      document.getElementById(
        "updateHistory"
      );


    const updateButton =
      document.getElementById(
        "updatesToggle"
      );


    if (updateHistory) {

      updateHistory.style.display =
        "none";

    }


    if (updateButton) {

      updateButton.textContent =
        "View Updates";

    }

  }
);
