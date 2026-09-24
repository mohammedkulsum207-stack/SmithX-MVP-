/* =========================================================
   SMITHX MVP — APP.JS
   AI removed for current MVP
   ========================================================= */


/* =========================================================
   DEFAULT PRODUCTS
========================================================= */

const DEFAULT_PRODUCTS = [
  {
    id: "default-1",
    name: "Samsung Galaxy S26 Ultra",
    price: 169999,
    description:
      "Premium flagship smartphone with advanced performance, display and camera technology.",
    image:
      "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=900&q=80"
  },

  {
    id: "default-2",
    name: "Smart Wireless Headphones",
    price: 4500,
    description:
      "Wireless headphones designed for clear sound, everyday comfort and convenient listening.",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80"
  },

  {
    id: "default-3",
    name: "Minimal Desk Lamp",
    price: 2800,
    description:
      "Modern desk lamp with a clean minimalist design for workspaces and study areas.",
    image:
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=80"
  },

  {
    id: "default-4",
    name: "Everyday Travel Backpack",
    price: 3500,
    description:
      "Practical everyday backpack designed for commuting, travel and carrying essential items.",
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80"
  },

  {
    id: "default-5",
    name: "Smart Watch",
    price: 6500,
    description:
      "Modern smartwatch combining useful everyday features with a clean wearable design.",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80"
  },

  {
    id: "default-6",
    name: "Premium Sneakers",
    price: 7200,
    description:
      "Comfortable modern sneakers designed for everyday wear and an active lifestyle.",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80"
  }
];


/* =========================================================
   STORAGE KEYS
========================================================= */

const PRODUCT_KEY = "smithx_custom_products_v2";
const CART_KEY = "smithx_cart_v2";
const ANALYTICS_KEY = "smithx_analytics_v2";
const VISITOR_KEY = "smithx_daily_visitor_v2";


/* =========================================================
   HELPERS
========================================================= */

function formatKES(value) {
  const number = Number(value) || 0;

  return (
    "KES " +
    number.toLocaleString("en-KE", {
      maximumFractionDigits: 0
    })
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
      localStorage.getItem(PRODUCT_KEY) || "[]"
    );
  } catch (error) {
    return [];
  }
}


function saveCustomProducts(products) {
  localStorage.setItem(
    PRODUCT_KEY,
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
    const saved = JSON.parse(
      localStorage.getItem(ANALYTICS_KEY)
    );

    return {
      sales: Number(saved?.sales) || 0,
      orders: Number(saved?.orders) || 0
    };

  } catch (error) {

    return {
      sales: 0,
      orders: 0
    };
  }
}


function saveAnalytics(data) {
  localStorage.setItem(
    ANALYTICS_KEY,
    JSON.stringify(data)
  );
}


/* =========================================================
   DAILY VISITOR
========================================================= */

function registerDailyVisitor() {

  const today =
    new Date().toISOString().split("T")[0];

  let data;

  try {
    data = JSON.parse(
      localStorage.getItem(VISITOR_KEY) || "null"
    );
  } catch (error) {
    data = null;
  }


  if (!data || data.date !== today) {

    data = {
      date: today,
      count: 1
    };

    localStorage.setItem(
      VISITOR_KEY,
      JSON.stringify(data)
    );

    return;
  }


  /*
    For this MVP we count the browser once per day.
  */

  if (!data.count) {
    data.count = 1;

    localStorage.setItem(
      VISITOR_KEY,
      JSON.stringify(data)
    );
  }
}


function getVisitorCount() {

  try {

    const data = JSON.parse(
      localStorage.getItem(VISITOR_KEY) || "null"
    );

    const today =
      new Date().toISOString().split("T")[0];

    if (data && data.date === today) {
      return Number(data.count) || 0;
    }

  } catch (error) {}

  return 0;
}


/* =========================================================
   RENDER MARKETPLACE
========================================================= */

function renderProducts(products = getAllProducts()) {

  const grid =
    document.getElementById("productsGrid");

  if (!grid) return;


  if (!products.length) {

    grid.innerHTML = `
      <div style="grid-column:1/-1;padding:30px;text-align:center;">
        <h3>No products found</h3>
        <p style="color:#667085;margin-top:8px;">
          Try another search.
        </p>
      </div>
    `;

    return;
  }


  grid.innerHTML = products.map(product => {

    const image =
      product.image ||
      "https://via.placeholder.com/700x500?text=SMITHX";


    return `
      <article class="product-card">

        <div class="product-image">

          <img
            src="${escapeHTML(image)}"
            alt="${escapeHTML(product.name)}"
            loading="lazy"
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
              onclick="viewProduct('${product.id}')"
            >
              View
            </button>

            <button
              onclick="addToCart('${product.id}')"
            >
              Add to Cart
            </button>

          </div>

        </div>

      </article>
    `;

  }).join("");
}


/* =========================================================
   PRODUCT MODAL
========================================================= */

function viewProduct(id) {

  const product =
    getAllProducts().find(
      item => String(item.id) === String(id)
    );

  if (!product) return;


  const modal =
    document.getElementById("productModal");

  const content =
    document.getElementById("productModalContent");

  if (!modal || !content) return;


  content.innerHTML = `

    <div class="product-modal-image">

      <img
        src="${escapeHTML(product.image)}"
        alt="${escapeHTML(product.name)}"
      >

    </div>


    <div>

      <div class="ai-category">
        SMITHX MARKETPLACE
      </div>

      <h2>
        ${escapeHTML(product.name)}
      </h2>

      <br>

      <div class="product-price">
        ${formatKES(product.price)}
      </div>

      <p style="color:#667085;margin:18px 0;">
        ${escapeHTML(product.description)}
      </p>


      <button
        class="primary-button"
        onclick="addToCart('${product.id}'); closeProductModal();"
      >
        Add to Cart
      </button>

    </div>

  `;


  modal.classList.add("active");
}


function closeProductModal() {

  const modal =
    document.getElementById("productModal");

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
      localStorage.getItem(CART_KEY) || "[]"
    );

  } catch (error) {

    return [];
  }
}


function saveCart(cart) {

  localStorage.setItem(
    CART_KEY,
    JSON.stringify(cart)
  );
}


function addToCart(id) {

  const product =
    getAllProducts().find(
      item => String(item.id) === String(id)
    );

  if (!product) return;


  const cart = getCart();

  const existing =
    cart.find(
      item => String(item.id) === String(id)
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


function removeFromCart(id) {

  let cart = getCart();

  cart = cart.filter(
    item => String(item.id) !== String(id)
  );

  saveCart(cart);

  renderCart();

  updateCartCount();
}


function changeQuantity(id, change) {

  const cart = getCart();

  const item =
    cart.find(
      entry => String(entry.id) === String(id)
    );

  if (!item) return;


  item.quantity += change;


  if (item.quantity <= 0) {

    removeFromCart(id);

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

  const products = getAllProducts();


  if (!cart.length) {

    container.innerHTML = `
      <div style="padding:25px 0;color:#667085;">
        Your cart is empty.
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
        products.find(
          p => String(p.id) === String(item.id)
        );

      if (!product) return "";


      const lineTotal =
        Number(product.price) *
        Number(item.quantity);


      subtotal += lineTotal;


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
              gap:8px;
              align-items:center;
              margin-top:6px;
            ">

              <button
                onclick="changeQuantity('${product.id}', -1)"
                style="
                  border:1px solid #d0d5dd;
                  background:white;
                  border-radius:6px;
                  width:26px;
                  height:26px;
                "
              >
                −
              </button>

              <strong>
                ${item.quantity}
              </strong>

              <button
                onclick="changeQuantity('${product.id}', 1)"
                style="
                  border:1px solid #d0d5dd;
                  background:white;
                  border-radius:6px;
                  width:26px;
                  height:26px;
                "
              >
                +
              </button>

            </div>

          </div>


          <div style="text-align:right;">

            <strong>
              ${formatKES(lineTotal)}
            </strong>

            <br>

            <button
              class="cart-remove"
              onclick="removeFromCart('${product.id}')"
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

  const cart =
    getCart();

  const count =
    cart.reduce(
      (total, item) =>
        total + Number(item.quantity || 0),
      0
    );


  const element =
    document.getElementById("cartCount");

  if (element) {
    element.textContent = count;
  }
}


function openCart() {

  const panel =
    document.getElementById("cartPanel");

  if (panel) {
    panel.classList.add("active");
  }

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
   CHECKOUT
========================================================= */

function checkout() {

  const cart =
    getCart();

  if (!cart.length) {

    showToast(
      "Your cart is empty"
    );

    return;
  }


  const products =
    getAllProducts();


  let orderTotal = 0;


  cart.forEach(item => {

    const product =
      products.find(
        p => String(p.id) === String(item.id)
      );

    if (product) {

      orderTotal +=
        Number(product.price) *
        Number(item.quantity);

    }

  });


  const analytics =
    getAnalytics();


  analytics.sales +=
    orderTotal;

  analytics.orders +=
    1;


  saveAnalytics(analytics);


  saveCart([]);

  renderCart();

  updateCartCount();

  updateDashboard();


  showToast(
    "Demo checkout completed successfully"
  );


  closeCart();
}


/* =========================================================
   IMAGE COMPRESSION
========================================================= */

function compressImage(
  file,
  maxWidth = 1000,
  quality = 0.82
) {

  return new Promise((resolve, reject) => {

    const reader =
      new FileReader();


    reader.onload = event => {

      const image =
        new Image();


      image.onload = () => {

        let width =
          image.width;

        let height =
          image.height;


        if (width > maxWidth) {

          height =
            height *
            (maxWidth / width);

          width =
            maxWidth;

        }


        const canvas =
          document.createElement("canvas");

        canvas.width =
          width;

        canvas.height =
          height;


        const context =
          canvas.getContext("2d");


        context.drawImage(
          image,
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


      image.onerror =
        reject;

      image.src =
        event.target.result;

    };


    reader.onerror =
      reject;

    reader.readAsDataURL(file);

  });
}


/* =========================================================
   IMAGE UPLOAD PREVIEW
========================================================= */

let uploadedProductImage = "";


async function handleProductImage(event) {

  const file =
    event.target.files?.[0];

  if (!file) return;


  if (!file.type.startsWith("image/")) {

    showToast(
      "Please select an image file"
    );

    return;
  }


  try {

    uploadedProductImage =
      await compressImage(file);


    const previewBox =
      document.getElementById("imagePreview");

    const preview =
      document.getElementById("previewImage");


    if (preview) {

      preview.src =
        uploadedProductImage;

    }


    if (previewBox) {

      previewBox.classList.remove(
        "hidden"
      );

    }

  } catch (error) {

    console.error(error);

    showToast(
      "Could not process image"
    );

  }
}


/* =========================================================
   PUBLISH PRODUCT
========================================================= */

function publishProduct() {

  const name =
    document
      .getElementById("productName")
      ?.value
      .trim();


  const price =
    Number(
      document
        .getElementById("productPrice")
        ?.value
    );


  const description =
    document
      .getElementById("productDescription")
      ?.value
      .trim();


  if (!name) {

    showToast(
      "Enter a product name"
    );

    return;
  }


  if (!price || price <= 0) {

    showToast(
      "Enter a valid price"
    );

    return;
  }


  if (!description) {

    showToast(
      "Enter a product description"
    );

    return;
  }


  const customProducts =
    getCustomProducts();


  if (customProducts.length >= 3) {

    showToast(
      "The MVP allows up to 3 additional products"
    );

    return;
  }


  const product = {

    id:
      "custom-" +
      Date.now(),

    name,

    price,

    description,

    image:
      uploadedProductImage ||
      "https://via.placeholder.com/700x500?text=SMITHX+PRODUCT"

  };


  customProducts.push(
    product
  );


  saveCustomProducts(
    customProducts
  );


  /*
    Reset form
  */

  document.getElementById(
    "productName"
  ).value = "";


  document.getElementById(
    "productPrice"
  ).value = "";


  document.getElementById(
    "productDescription"
  ).value = "";


  document.getElementById(
    "productImage"
  ).value = "";


  uploadedProductImage = "";


  const previewBox =
    document.getElementById(
      "imagePreview"
    );

  if (previewBox) {

    previewBox.classList.add(
      "hidden"
    );

  }


  renderProducts();

  updateDashboard();


  showToast(
    "Product published successfully"
  );


  scrollToSection(
    "market"
  );
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
    getVisitorCount();


  const productCount =
    products.length;


  /*
    Hero
  */

  const heroProducts =
    document.getElementById(
      "heroProductCount"
    );

  const heroVisitors =
    document.getElementById(
      "heroVisitorCount"
    );

  const heroSales =
    document.getElementById(
      "heroSales"
    );

  const heroOrders =
    document.getElementById(
      "heroOrders"
    );


  if (heroProducts)
    heroProducts.textContent =
      productCount;

  if (heroVisitors)
    heroVisitors.textContent =
      visitors;

  if (heroSales)
    heroSales.textContent =
      formatKES(analytics.sales);

  if (heroOrders)
    heroOrders.textContent =
      analytics.orders;


  /*
    Dashboard
  */

  const dashboardProducts =
    document.getElementById(
      "dashboardProducts"
    );

  const dashboardVisitors =
    document.getElementById(
      "dashboardVisitors"
    );

  const dashboardSales =
    document.getElementById(
      "dashboardSales"
    );

  const dashboardOrders =
    document.getElementById(
      "dashboardOrders"
    );


  if (dashboardProducts)
    dashboardProducts.textContent =
      productCount;

  if (dashboardVisitors)
    dashboardVisitors.textContent =
      visitors;

  if (dashboardSales)
    dashboardSales.textContent =
      formatKES(analytics.sales);

  if (dashboardOrders)
    dashboardOrders.textContent =
      analytics.orders;


  /*
    Activity
  */

  const activityProducts =
    document.getElementById(
      "activityProducts"
    );

  const activityVisitors =
    document.getElementById(
      "activityVisitors"
    );

  const activitySales =
    document.getElementById(
      "activitySales"
    );

  const activityOrders =
    document.getElementById(
      "activityOrders"
    );


  if (activityProducts)
    activityProducts.textContent =
      productCount;

  if (activityVisitors)
    activityVisitors.textContent =
      visitors;

  if (activitySales)
    activitySales.textContent =
      formatKES(analytics.sales);

  if (activityOrders)
    activityOrders.textContent =
      analytics.orders;
}


/* =========================================================
   RESET ANALYTICS
========================================================= */

function resetAnalytics() {

  const confirmed =
    window.confirm(
      "Reset demo sales, orders and today's visitor count?"
    );


  if (!confirmed) return;


  localStorage.removeItem(
    ANALYTICS_KEY
  );

  localStorage.removeItem(
    VISITOR_KEY
  );


  registerDailyVisitor();

  updateDashboard();


  showToast(
    "Demo analytics reset"
  );
}


/* =========================================================
   SEARCH
========================================================= */

function searchProducts(value) {

  const search =
    String(value || "")
      .trim()
      .toLowerCase();


  if (!search) {

    renderProducts();

    return;
  }


  const filtered =
    getAllProducts().filter(product => {

      const text =
        `${product.name} ${product.description}`
          .toLowerCase();

      return text.includes(search);

    });


  renderProducts(
    filtered
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


/* =========================================================
   UPDATE HISTORY
========================================================= */

function toggleUpdateHistory() {

  const element =
    document.getElementById(
      "updateHistoryExtra"
    );

  if (!element) return;


  element.classList.toggle(
    "hidden"
  );
}


/* =========================================================
   TOAST
========================================================= */

let toastTimer;


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
    toastTimer
  );


  toastTimer =
    setTimeout(() => {

      toast.classList.remove(
        "show"
      );

    }, 2500);
}


/* =========================================================
   EVENT LISTENERS
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    /*
      Register today's browser visit.
    */

    registerDailyVisitor();


    /*
      Marketplace.
    */

    renderProducts();


    /*
      Cart.
    */

    renderCart();

    updateCartCount();


    /*
      Dashboard.
    */

    updateDashboard();


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
        event => {
          searchProducts(
            event.target.value
          );
        }
      );

    }


    /*
      Product image.
    */

    const productImage =
      document.getElementById(
        "productImage"
      );


    if (productImage) {

      productImage.addEventListener(
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

  }
);


/* =========================================================
   CLOSE MODAL WHEN CLICKING OUTSIDE
========================================================= */

document.addEventListener(
  "click",
  event => {

    const modal =
      document.getElementById(
        "productModal"
      );


    if (
      modal &&
      event.target === modal
    ) {

      closeProductModal();

    }

  }
);
