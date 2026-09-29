"use strict";

/* =====================================================
   SM1THX 🛒
   APP.JS
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
   LOCAL STORAGE
===================================================== */

const STORAGE = {

  products:
    "smithx_custom_products_v2",

  cart:
    "smithx_cart_v2",

  analytics:
    "smithx_analytics_v2",

  visitor:
    "smithx_daily_visitor_v2"

};


/* =====================================================
   STATE
===================================================== */

let currentCategory = "All";
let currentSearch = "";

let latestAIProduct = null;


/* =====================================================
   AI BACKEND
===================================================== */

/*
   IMPORTANT

   Do NOT put an AI API key in this file.

   This URL will be replaced when we create
   the Python backend.
*/

const AI_API_URL =
  "YOUR_PYTHON_BACKEND_URL/api/generate-product";


/* =====================================================
   HELPERS
===================================================== */

function formatKES(value) {

  const number = Number(value) || 0;

  return (
    "KES " +
    number.toLocaleString("en-KE")
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


function safeJSONParse(value, fallback) {

  try {

    return JSON.parse(value);

  } catch {

    return fallback;

  }

}


function getElement(id) {

  return document.getElementById(id);

}


/* =====================================================
   PRODUCTS
===================================================== */

function getCustomProducts() {

  const saved =
    localStorage.getItem(
      STORAGE.products
    );

  return safeJSONParse(
    saved,
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


function findProduct(productId) {

  return getAllProducts().find(
    product =>
      product.id === productId
  );

}


/* =====================================================
   CART
===================================================== */

function getCart() {

  const saved =
    localStorage.getItem(
      STORAGE.cart
    );

  return safeJSONParse(
    saved,
    []
  );

}


function saveCart(cart) {

  localStorage.setItem(
    STORAGE.cart,
    JSON.stringify(cart)
  );

}


function clearCart() {

  saveCart([]);

}


function getCartCount() {

  return getCart().reduce(
    (total, item) =>
      total + Number(item.quantity || 0),
    0
  );

}


function calculateCartTotals() {

  const cart = getCart();

  let subtotal = 0;

  cart.forEach(item => {

    const product =
      findProduct(item.productId);

    if (!product) return;

    subtotal +=
      Number(product.price) *
      Number(item.quantity || 0);

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
      "Product not found."
    );

    return;

  }


  const cart = getCart();

  const existing =
    cart.find(
      item =>
        item.productId === productId
    );


  if (existing) {

    existing.quantity =
      Number(existing.quantity || 0) + 1;

  } else {

    cart.push({

      productId,
      quantity: 1

    });

  }


  saveCart(cart);

  updateCartUI();

  trackEvent("cart_add", {
    productId
  });

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
        item.productId !== productId
    );

  saveCart(cart);

  updateCartUI();

}


/* =====================================================
   CHANGE CART QUANTITY
===================================================== */

function changeCartQuantity(
  productId,
  change
) {

  const cart = getCart();

  const item =
    cart.find(
      cartItem =>
        cartItem.productId === productId
    );


  if (!item) return;


  item.quantity =
    Number(item.quantity || 0) +
    Number(change);


  if (item.quantity <= 0) {

    const newCart =
      cart.filter(
        cartItem =>
          cartItem.productId !== productId
      );

    saveCart(newCart);

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

  const cart = getCart();

  const item =
    cart.find(
      cartItem =>
        cartItem.productId === productId
    );


  if (!item) return;


  const newQuantity =
    Math.max(
      0,
      Number(quantity) || 0
    );


  item.quantity =
    newQuantity;


  if (newQuantity === 0) {

    saveCart(
      cart.filter(
        cartItem =>
          cartItem.productId !== productId
      )
    );

  } else {

    saveCart(cart);

  }


  updateCartUI();

}


/* =====================================================
   CLEAR SHOPPING CART
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

  if (!container) return;


  const cart = getCart();


  if (!cart.length) {

    container.innerHTML = `

      <div class="empty-state">

        <strong>
          Your cart is empty.
        </strong>

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


    if (subtotal)
      subtotal.textContent =
        formatKES(0);

    if (total)
      total.textContent =
        formatKES(0);

    return;

  }


  container.innerHTML = "";


  cart.forEach(item => {

    const product =
      findProduct(item.productId);

    if (!product) return;


    const quantity =
      Number(item.quantity || 1);


    const itemElement =
      document.createElement("div");


    itemElement.className =
      "cart-item";


    itemElement.innerHTML = `

      <div class="cart-item-image">

        <img
          src="${escapeHTML(product.image || "")}"
          alt="${escapeHTML(product.name)}"
        >

      </div>

      <div class="cart-item-info">

        <strong>
          ${escapeHTML(product.name)}
        </strong>

        <span>
          ${formatKES(product.price)}
        </span>

        <div class="cart-item-controls">

          <button
            type="button"
            onclick="changeCartQuantity('${product.id}', -1)"
          >
            −
          </button>

          <span>
            ${quantity}
          </span>

          <button
            type="button"
            onclick="changeCartQuantity('${product.id}', 1)"
          >
            +
          </button>

          <button
            type="button"
            onclick="removeFromCart('${product.id}')"
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
    getElement("cartSubtotal");

  const total =
    getElement("cartTotal");


  if (subtotal)
    subtotal.textContent =
      formatKES(totals.subtotal);

  if (total)
    total.textContent =
      formatKES(totals.total);

}


/* =====================================================
   CART COUNT
===================================================== */

function updateCartCount() {

  const element =
    getElement("cartCount");

  if (!element) return;

  element.textContent =
    getCartCount();

}


/* =====================================================
   UPDATE CART UI
===================================================== */

function updateCartUI() {

  updateCartCount();

  renderCart();

}


/* =====================================================
   OPEN CART
===================================================== */

function openCart() {

  const panel =
    getElement("cartPanel");

  if (!panel) return;


  panel.classList.add(
    "open"
  );


  renderCart();

}


/* =====================================================
   CLOSE CART
===================================================== */

function closeCart() {

  const panel =
    getElement("cartPanel");

  if (!panel) return;


  panel.classList.remove(
    "open"
  );

}


/* =====================================================
   ANALYTICS
===================================================== */

function getAnalytics() {

  const saved =
    localStorage.getItem(
      STORAGE.analytics
    );


  return safeJSONParse(
    saved,
    {
      orders: 0,
      revenue: 0,
      events: []
    }
  );

}


function saveAnalytics(
  analytics
) {

  localStorage.setItem(
    STORAGE.analytics,
    JSON.stringify(analytics)
  );

}


function trackEvent(
  eventName,
  data = {}
) {

  const analytics =
    getAnalytics();


  analytics.events =
    analytics.events || [];


  analytics.events.push({

    event:
      eventName,

    data,

    timestamp:
      new Date().toISOString()

  });


  /*
    Keep the demo analytics
    lightweight.
  */

  if (
    analytics.events.length >
    500
  ) {

    analytics.events =
      analytics.events.slice(-500);

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

    const data = {

      date: today,

      count: 1

    };


    localStorage.setItem(
      STORAGE.visitor,
      JSON.stringify(data)
    );


  } else {

    /*
      Only count once per page load.
    */

    if (
      !sessionStorage.getItem(
        "smithx_visitor_counted"
      )
    ) {

      saved.count =
        Number(saved.count || 0) + 1;


      localStorage.setItem(
        STORAGE.visitor,
        JSON.stringify(saved)
      );

    }

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

  if (!container) return;


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
        "category-button";


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

  if (!select) return;


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

  if (!grid) return;


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

          const text =
            [
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

        <strong>
          No products found.
        </strong>

        <p>
          Try another search or category.
        </p>

      </div>

    `;

    return;

  }


  grid.innerHTML =
    products.map(
      product => `

        <article class="product-card">

          <button
            type="button"
            class="product-image-button"
            onclick="openProductModal('${product.id}')"
          >

            <img
              src="${escapeHTML(product.image || "")}"
              alt="${escapeHTML(product.name)}"
              loading="lazy"
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
                onclick="addToCart('${product.id}')"
              >
                Add to cart
              </button>

            </div>

          </div>

        </article>

      `
    )
    .join("");

}


/* =====================================================
   PRODUCT MODAL
===================================================== */

function openProductModal(
  productId
) {

  const product =
    findProduct(productId);

  const modal =
    getElement(
      "productModal"
    );

  const content =
    getElement(
      "productModalContent"
    );


  if (
    !product ||
    !modal ||
    !content
  ) return;


  content.innerHTML = `

    <div class="product-modal-layout">

      <div>

        <img
          src="${escapeHTML(product.image || "")}"
          alt="${escapeHTML(product.name)}"
        >

      </div>


      <div>

        <span class="product-category">
          ${escapeHTML(product.category)}
        </span>


        <h2>
          ${escapeHTML(product.name)}
        </h2>


        <strong class="product-modal-price">
          ${formatKES(product.price)}
        </strong>


        <p>
          ${escapeHTML(product.description)}
        </p>


        <button
          type="button"
          class="primary-button"
          onclick="addToCart('${product.id}'); closeProductModal();"
        >
          Add to cart
        </button>

      </div>

    </div>

  `;


  modal.classList.add(
    "open"
  );


  modal.setAttribute(
    "aria-hidden",
    "false"
  );

}


function closeProductModal() {

  const modal =
    getElement(
      "productModal"
    );

  if (!modal) return;


  modal.classList.remove(
    "open"
  );


  modal.setAttribute(
    "aria-hidden",
    "true"
  );

}


/* =====================================================
   DEMO CHECKOUT
===================================================== */

function demoCheckout() {

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


  analytics.orders =
    Number(analytics.orders || 0) + 1;


  analytics.revenue =
    Number(analytics.revenue || 0) +
    Number(totals.total || 0);


  saveAnalytics(
    analytics
  );


  const orderId =
    `SMX-DEMO-${Date.now()}`;


  localStorage.setItem(
    "smithx_last_demo_order",
    JSON.stringify({

      orderId,

      total:
        totals.total,

      createdAt:
        new Date().toISOString()

    })
  );


  trackEvent(
    "demo_order",
    {

      orderId,

      total:
        totals.total

    }
  );


  clearCart();

  updateCartUI();

  closeCart();

  updateDashboard();


  showToast(
    `Demo order ${orderId} created!`
  );

}


/* =====================================================
   IMAGE PREVIEW
===================================================== */

function setupImagePreview() {

  const input =
    getElement(
      "productImage"
    );

  const preview =
    getElement(
      "imagePreview"
    );

  const image =
    getElement(
      "previewImage"
    );


  if (
    !input ||
    !preview ||
    !image
  ) return;


  input.addEventListener(
    "change",
    () => {

      const file =
        input.files &&
        input.files[0];


      if (!file) {

        preview.classList.add(
          "hidden"
        );

        image.src = "";

        return;

      }


      if (
        !file.type.startsWith(
          "image/"
        )
      ) {

        showToast(
          "Please choose an image file."
        );

        input.value = "";

        return;

      }


      const reader =
        new FileReader();


      reader.onload =
        event => {

          image.src =
            event.target.result;

          preview.classList.remove(
            "hidden"
          );

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
    (resolve, reject) => {

      const reader =
        new FileReader();


      reader.onerror =
        reject;


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

                height =
                  Math.round(
                    height *
                    (maxWidth / width)
                  );

                width =
                  maxWidth;

              }


              const canvas =
                document.createElement(
                  "canvas"
                );


              canvas.width =
                width;

              canvas.height =
                height;


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


      reader.readAsDataURL(
        file
      );

    }
  );

}


/* =====================================================
   PUBLISH PRODUCT
===================================================== */

async function publishProduct() {

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
    nameInput?.value.trim();


  const price =
    Number(
      priceInput?.value
    );


  const category =
    categoryInput?.value;


  const description =
    descriptionInput?.value.trim();


  if (!name) {

    showToast(
      "Please enter a product name."
    );

    nameInput?.focus();

    return;

  }


  if (
    !price ||
    price <= 0
  ) {

    showToast(
      "Please enter a valid price."
    );

    priceInput?.focus();

    return;

  }


  if (!category) {

    showToast(
      "Please select a category."
    );

    categoryInput?.focus();

    return;

  }


  if (!description) {

    showToast(
      "Please add a product description."
    );

    descriptionInput?.focus();

    return;

  }


  let image = "";


  try {

    const file =
      imageInput?.files?.[0];


    if (file) {

      image =
        await compressImage(
          file
        );

    }

  } catch (error) {

    console.error(
      "Image processing error:",
      error
    );

    showToast(
      "Could not process the image."
    );

    return;

  }


  /*
    If seller does not upload an image,
    use a clean placeholder.
  */

  if (!image) {

    image =
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80";

  }


  const product = {

    id:
      `custom-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`,

    name,

    price,

    category,

    description,

    image

  };


  const products =
    getCustomProducts();


  products.push(
    product
  );


  saveCustomProducts(
    products
  );


  trackEvent(
    "product_published",
    {
      productId:
        product.id,

      name:
        product.name,

      price:
        product.price,

      category:
        product.category

    }
  );


  /*
    Reset form.
  */

  if (nameInput)
    nameInput.value = "";

  if (priceInput)
    priceInput.value = "";

  if (descriptionInput)
    descriptionInput.value = "";

  if (imageInput)
    imageInput.value = "";


  if (categoryInput)
    categoryInput.selectedIndex = 0;


  const preview =
    getElement(
      "imagePreview"
    );

  const previewImage =
    getElement(
      "previewImage"
    );


  if (preview)
    preview.classList.add(
      "hidden"
    );

  if (previewImage)
    previewImage.src = "";


  /*
    Reset AI state.
  */

  latestAIProduct = null;


  const aiResult =
    getElement(
      "aiProductResult"
    );

  if (aiResult)
    aiResult.style.display =
      "none";


  renderProducts();

  updateDashboard();


  showToast(
    "✓ Product published successfully!"
  );


  scrollToSection(
    "market"
  );

}


/* =====================================================
   SM1THX AI PRODUCT ASSISTANT
===================================================== */

async function generateProductListing() {

  const productNameInput =
    getElement(
      "productName"
    );


  const generateButton =
    getElement(
      "generateProductButton"
    );


  const resultBox =
    getElement(
      "aiProductResult"
    );


  if (!productNameInput) {

    showToast(
      "Product name field not found."
    );

    return;

  }


  const productName =
    productNameInput.value.trim();


  if (!productName) {

    showToast(
      "Enter a product name first."
    );

    productNameInput.focus();

    return;

  }


  const currentPrice =
    getElement(
      "productPrice"
    )?.value || "";


  const currentCategory =
    getElement(
      "productCategory"
    )?.value || "";


  const currentDescription =
    getElement(
      "productDescription"
    )?.value.trim() || "";


  /*
    Loading state.
  */

  if (generateButton) {

    generateButton.disabled =
      true;

    generateButton.innerHTML =
      "✨ Generating Listing...";

  }


  if (resultBox) {

    resultBox.style.display =
      "block";

    resultBox.innerHTML = `

      <div class="ai-result-item">

        <span>
          SM1THX AI
        </span>

        <strong>
          Creating your product listing...
        </strong>

        <p>
          SM1THX is analyzing your product.
        </p>

      </div>

    `;

  }


  try {

    /*
      Send product information
      to Python backend.
    */

    const response =
      await fetch(
        AI_API_URL,
        {

          method: "POST",

          headers: {

            "Content-Type":
              "application/json"

          },

          body:
            JSON.stringify({

              productName,

              currentPrice,

              category:
                currentCategory,

              description:
                currentDescription

            })

        }
      );


    if (!response.ok) {

      throw new Error(
        `AI server returned ${response.status}`
      );

    }


    const data =
      await response.json();


    latestAIProduct =
      data;


    /*
      TITLE
    */

    const titleElement =
      getElement(
        "aiGeneratedTitle"
      );


    if (titleElement) {

      titleElement.textContent =
        data.title ||
        productName;

    }


    /*
      DESCRIPTION
    */

    const descriptionElement =
      getElement(
        "aiGeneratedDescription"
      );


    if (descriptionElement) {

      descriptionElement.textContent =
        data.description || "";

    }


    /*
      CATEGORY
    */

    const categoryElement =
      getElement(
        "aiGeneratedCategory"
      );


    if (categoryElement) {

      categoryElement.textContent =
        data.category ||
        "Other";

    }


    /*
      PRICE
    */

    const priceElement =
      getElement(
        "aiGeneratedPrice"
      );


    if (priceElement) {

      const price =
        Number(
          data.price || 0
        );


      priceElement.textContent =
        price > 0
          ? formatKES(price)
          : "Not available";

    }


    /*
      FEATURES
    */

    const featuresElement =
      getElement(
        "aiGeneratedFeatures"
      );


    if (featuresElement) {

      featuresElement.innerHTML =
        "";


      const features =
        Array.isArray(
          data.features
        )
          ? data.features
          : [];


      features.forEach(
        feature => {

          const li =
            document.createElement(
              "li"
            );


          li.textContent =
            feature;


          featuresElement.appendChild(
            li
          );

        }
      );

    }


    /*
      SEO KEYWORDS
    */

    const seoElement =
      getElement(
        "aiGeneratedSEO"
      );


    if (seoElement) {

      if (
        Array.isArray(
          data.seo_keywords
        )
      ) {

        seoElement.textContent =
          data.seo_keywords.join(
            ", "
          );

      } else {

        seoElement.textContent =
          data.seo_keywords || "";

      }

    }


    /*
      AD CAPTION
    */

    const adElement =
      getElement(
        "aiGeneratedAd"
      );


    if (adElement) {

      adElement.textContent =
        data.ad_caption || "";

    }


    if (resultBox) {

      resultBox.style.display =
        "block";

    }


    showToast(
      "✨ AI listing generated!"
    );


  } catch (error) {

    console.error(
      "SM1THX AI error:",
      error
    );


    if (resultBox) {

      resultBox.innerHTML = `

        <div class="ai-result-item">

          <span>
            SM1THX AI
          </span>

          <strong>
            AI backend not connected yet
          </strong>

          <p>
            The SM1THX frontend is ready.
            Next we need to connect the
            Python AI backend.
          </p>

        </div>

      `;

    }


    showToast(
      "AI backend is not connected yet."
    );


  } finally {

    if (generateButton) {

      generateButton.disabled =
        false;

      generateButton.innerHTML =
        "✨ Generate Listing";

    }

  }

}


/* =====================================================
   APPLY AI LISTING
===================================================== */

function applyAIProductListing() {

  if (!latestAIProduct) {

    showToast(
      "Generate an AI listing first."
    );

    return;

  }


  const productName =
    getElement(
      "productName"
    );


  const productPrice =
    getElement(
      "productPrice"
    );


  const productCategory =
    getElement(
      "productCategory"
    );


  const productDescription =
    getElement(
      "productDescription"
    );


  /*
    TITLE
  */

  if (
    productName &&
    latestAIProduct.title
  ) {

    productName.value =
      latestAIProduct.title;

  }


  /*
    PRICE
  */

  if (
    productPrice &&
    latestAIProduct.price
  ) {

    productPrice.value =
      Number(
        latestAIProduct.price
      );

  }


  /*
    CATEGORY
  */

  if (
    productCategory &&
    latestAIProduct.category
  ) {

    const category =
      latestAIProduct.category;


    const matchingOption =
      Array.from(
        productCategory.options
      ).find(
        option =>
          option.value.toLowerCase() ===
          String(category).toLowerCase()
      );


    if (matchingOption) {

      productCategory.value =
        matchingOption.value;

    }

  }


  /*
    DESCRIPTION + FEATURES
  */

  if (productDescription) {

    let description =
      latestAIProduct.description ||
      "";


    const features =
      Array.isArray(
        latestAIProduct.features
      )
        ? latestAIProduct.features
        : [];


    if (features.length) {

      description +=
        "\n\nKey Features:\n" +
        features
          .map(
            feature =>
              `• ${feature}`
          )
          .join("\n");

    }


    productDescription.value =
      description;

  }


  /*
    Return seller to form.
  */

  if (productName) {

    productName.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });

  }


  showToast(
    "✓ AI listing applied to your product form!"
  );

}


/* =====================================================
   DASHBOARD
===================================================== */

function updateDashboard() {

  const products =
    getAllProducts();


  const analytics =
    getAnalytics();


  const visitorData =
    safeJSONParse(
      localStorage.getItem(
        STORAGE.visitor
      ),
      {
        count: 0
      }
    );


  const productsElement =
    getElement(
      "dashboardProducts"
    );


  const ordersElement =
    getElement(
      "dashboardOrders"
    );


  const revenueElement =
    getElement(
      "dashboardRevenue"
    );


  const visitorsElement =
    getElement(
      "dashboardVisitors"
    );


  if (productsElement) {

    productsElement.textContent =
      products.length;

  }


  if (ordersElement) {

    ordersElement.textContent =
      Number(
        analytics.orders || 0
      );

  }


  if (revenueElement) {

    revenueElement.textContent =
      formatKES(
        analytics.revenue || 0
      );

  }


  if (visitorsElement) {

    visitorsElement.textContent =
      Number(
        visitorData.count || 0
      );

  }

}


/* =====================================================
   RESET ANALYTICS
===================================================== */

function resetAnalytics() {

  saveAnalytics({

    orders: 0,

    revenue: 0,

    events: []

  });


  updateDashboard();


  showToast(
    "Demo analytics reset."
  );

}


/* =====================================================
   UPDATES
===================================================== */

function toggleUpdateHistory() {

  const history =
    getElement(
      "updateHistory"
    );


  const button =
    getElement(
      "updatesToggle"
    );


  if (!history) return;


  const isHidden =
    history.style.display ===
    "none" ||
    !history.style.display;


  history.style.display =
    isHidden
      ? "block"
      : "none";


  if (button) {

    button.textContent =
      isHidden
        ? "Hide Updates"
        : "View Updates";

  }

}


function setupUpdatesToggle() {

  const history =
    getElement(
      "updateHistory"
    );


  if (history) {

    history.style.display =
      "none";

  }

}


/* =====================================================
   SEARCH
===================================================== */

function setupSearch() {

  const input =
    getElement(
      "productSearch"
    );


  if (!input) return;


  input.addEventListener(
    "input",
    event => {

      currentSearch =
        event.target.value;


      renderProducts();

    }
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


  if (!section) return;


  section.scrollIntoView({

    behavior: "smooth",

    block: "start"

  });

}


function setupNavigation() {

  document
    .querySelectorAll(
      'a[href^="#"]'
    )
    .forEach(
      link => {

        link.addEventListener(
          "click",
          event => {

            const targetId =
              link
                .getAttribute("href")
                .slice(1);


            const target =
              getElement(
                targetId
              );


            if (!target) return;


            event.preventDefault();


            scrollToSection(
              targetId
            );

          }
        );

      }
    );

}


/* =====================================================
   TOAST
===================================================== */

let toastTimer = null;


function showToast(
  message
) {

  const toast =
    getElement(
      "toast"
    );


  if (!toast) {

    console.log(
      message
    );

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
      3000
    );

}


/* =====================================================
   LOGIN COMPATIBILITY
===================================================== */

function removeLoginUI() {

  const overlay =
    getElement(
      "loginOverlay"
    );


  const loginButton =
    getElement(
      "loginNavButton"
    );


  /*
    The current MVP does not yet
    require authentication.
  */

  if (overlay) {

    overlay.remove();

  }


  if (loginButton) {

    loginButton.remove();

  }

}


function disableOldLoginHandlers() {

  /*
    Keep these functions available so
    older HTML does not throw errors.
  */

  window.openLogin =
    function () {

      removeLoginUI();

    };


  window.closeLogin =
    function () {

      removeLoginUI();

    };

}


function showRegisterForm() {

  const login =
    getElement(
      "loginFormSection"
    );


  const register =
    getElement(
      "registerFormSection"
    );


  if (login)
    login.style.display =
      "none";


  if (register)
    register.style.display =
      "block";

}


function showLoginForm() {

  const login =
    getElement(
      "loginFormSection"
    );


  const register =
    getElement(
      "registerFormSection"
    );


  if (login)
    login.style.display =
      "block";


  if (register)
    register.style.display =
      "none";

}


function togglePassword(
  inputId,
  button
) {

  const input =
    getElement(
      inputId
    );


  if (!input) return;


  if (
    input.type ===
    "password"
  ) {

    input.type =
      "text";


    if (button)
      button.textContent =
        "🙈";

  } else {

    input.type =
      "password";


    if (button)
      button.textContent =
        "👁";

  }

}


/* =====================================================
   CART CONTROLS
===================================================== */

function setupCartControls() {

  document.addEventListener(
    "keydown",
    event => {

      if (
        event.key ===
        "Escape"
      ) {

        closeCart();

        closeProductModal();

      }

    }
  );

}


/* =====================================================
   PRODUCT BACKDROP
===================================================== */

function setupProductBackdrop() {

  const modal =
    getElement(
      "productModal"
    );


  if (!modal) return;


  modal.addEventListener(
    "click",
    event => {

      if (
        event.target ===
        modal
      ) {

        closeProductModal();

      }

    }
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

        closeProductModal();

        closeCart();

      }

    }
  );

}


/* =====================================================
   INITIALIZE SM1THX
===================================================== */

function initializeSmithX() {

  /*
    Authentication is not active
    in this MVP.
  */

  removeLoginUI();

  disableOldLoginHandlers();


  /*
    Marketplace
  */

  setupCategories();

  setupSellerCategory();

  renderProducts();


  /*
    Cart
  */

  updateCartUI();

  setupCartControls();


  /*
    Seller
  */

  setupImagePreview();


  /*
    Search/navigation
  */

  setupSearch();

  setupNavigation();


  /*
    Updates
  */

  setupUpdatesToggle();


  /*
    Product modal
  */

  setupProductBackdrop();

  setupKeyboardControls();


  /*
    Visitor analytics
  */

  trackDailyVisitor();


  /*
    Dashboard
  */

  updateDashboard();

}


/* =====================================================
   GLOBAL FUNCTIONS
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

window.renderCart =
  renderCart;

window.updateCartCount =
  updateCartCount;

window.updateCartUI =
  updateCartUI;

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

window.renderProducts =
  renderProducts;

window.showToast =
  showToast;


/*
   AI functions
*/

window.generateProductListing =
  generateProductListing;

window.applyAIProductListing =
  applyAIProductListing;


/* =====================================================
   DOM READY
===================================================== */

if (
  document.readyState ===
  "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    initializeSmithX
  );

} else {

  initializeSmithX();

}
