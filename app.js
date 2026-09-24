/* =========================================
   SMITHX MVP
   ========================================= */


/* =========================================
   SIX ORIGINAL PRODUCTS
   ========================================= */

const defaultProducts = [

  {
    id: "smithx-1",

    name: "Samsung Galaxy S26 Ultra",

    price: 169999,

    description:
      "A premium smartphone with powerful performance, advanced cameras and a modern flagship design.",

    category: "Electronics",

    image:
      "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=900&q=85"
  },


  {
    id: "smithx-2",

    name: "Smart Wireless Headphones",

    price: 4500,

    description:
      "Wireless headphones with clear sound, comfortable design and long-lasting battery life.",

    category: "Electronics",

    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=85"
  },


  {
    id: "smithx-3",

    name: "Minimal Desk Lamp",

    price: 2800,

    description:
      "A modern minimalist desk lamp designed for work, study and stylish home spaces.",

    category: "Home",

    image:
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=85"
  },


  {
    id: "smithx-4",

    name: "Everyday Travel Backpack",

    price: 3500,

    description:
      "A practical everyday backpack with enough space for work, school and travel essentials.",

    category: "Fashion",

    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=85"
  },


  {
    id: "smithx-5",

    name: "Smart Watch",

    price: 6500,

    description:
      "A modern smartwatch designed to keep you connected while tracking your daily activity.",

    category: "Electronics",

    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=85"
  },


  {
    id: "smithx-6",

    name: "Premium Sneakers",

    price: 7200,

    description:
      "Comfortable premium sneakers combining modern style with everyday performance.",

    category: "Fashion",

    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=85"
  }

];



/* =========================================
   STORAGE
   ========================================= */

const PRODUCTS_KEY =
  "smithx_products_v2";

const ANALYTICS_KEY =
  "smithx_analytics_v2";

const VISITOR_KEY =
  "smithx_visitor_v2";



/* =========================================
   STATE
   ========================================= */

let products =
  loadProducts();

let cart = [];

let selectedImage = "";

let analytics =
  loadAnalytics();



/* =========================================
   ELEMENTS
   ========================================= */

const productGrid =
  document.getElementById(
    "productGrid"
  );

const searchInput =
  document.getElementById(
    "searchInput"
  );

const productForm =
  document.getElementById(
    "productForm"
  );

const productImage =
  document.getElementById(
    "productImage"
  );

const imagePreview =
  document.getElementById(
    "imagePreview"
  );

const imagePreviewContainer =
  document.getElementById(
    "imagePreviewContainer"
  );



/* =========================================
   LOAD PRODUCTS
   ========================================= */

function loadProducts() {

  try {

    const saved =
      localStorage.getItem(
        PRODUCTS_KEY
      );


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
      "Products could not be loaded.",
      error
    );

  }


  /*
    IMPORTANT:

    If there are no saved products,
    ALWAYS use the original six.
  */

  return [...defaultProducts];

}



/* =========================================
   SAVE PRODUCTS
   ========================================= */

function saveProducts() {

  try {

    localStorage.setItem(
      PRODUCTS_KEY,
      JSON.stringify(products)
    );

  } catch (error) {

    console.log(
      "Products could not be saved.",
      error
    );

    showToast(
      "The image is too large to save."
    );

  }

}



/* =========================================
   DATE
   ========================================= */

function today() {

  const date =
    new Date();

  return (
    date.getFullYear() +
    "-" +
    String(
      date.getMonth() + 1
    ).padStart(2, "0") +
    "-" +
    String(
      date.getDate()
    ).padStart(2, "0")
  );

}



/* =========================================
   ANALYTICS
   ========================================= */

function newAnalytics() {

  return {

    date: today(),

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

      const data =
        JSON.parse(saved);


      if (
        data.date === today()
      ) {

        return {

          date: data.date,

          users:
            Number(data.users) || 0,

          sales:
            Number(data.sales) || 0,

          orders:
            Number(data.orders) || 0,

          amountUsed:
            Number(data.amountUsed) || 0

        };

      }

    }

  } catch (error) {

    console.log(
      "Analytics could not be loaded.",
      error
    );

  }


  const fresh =
    newAnalytics();


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
   COUNT TODAY'S UNIQUE VISITOR
   ========================================= */

function registerVisitor() {

  const currentDay =
    today();

  const lastVisit =
    localStorage.getItem(
      VISITOR_KEY
    );


  if (
    lastVisit !== currentDay
  ) {

    analytics.users += 1;

    localStorage.setItem(
      VISITOR_KEY,
      currentDay
    );

    saveAnalytics();

  }

}



/* =========================================
   MONEY
   ========================================= */

function money(value) {

  return Number(value || 0)
    .toLocaleString("en-KE");

}



/* =========================================
   RENDER PRODUCTS
   ========================================= */

function renderProducts() {

  const search =
    searchInput
      ? searchInput.value
          .toLowerCase()
          .trim()
      : "";


  const filtered =
    products.filter(
      product => {

        return (

          product.name
            .toLowerCase()
            .includes(search)

          ||

          product.description
            .toLowerCase()
            .includes(search)

          ||

          product.category
            .toLowerCase()
            .includes(search)

        );

      }
    );


  if (!productGrid) {
    return;
  }


  if (filtered.length === 0) {

    productGrid.innerHTML = `

      <div class="empty-cart">

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


  productGrid.innerHTML =
    filtered.map(
      product => `

        <article class="product-card">

          <img
            class="product-image"
            src="${safe(product.image)}"
            alt="${safe(product.name)}"
          >


          <div class="product-info">

            <span class="product-category">
              ${safe(product.category)}
            </span>


            <h3>
              ${safe(product.name)}
            </h3>


            <p class="product-description">
              ${safe(product.description)}
            </p>


            <div class="product-price">
              KES ${money(product.price)}
            </div>


            <div class="product-actions">

              <button
                class="primary-button"
                onclick="addToCart('${product.id}')"
              >
                Add to Cart
              </button>


              <button
                class="view-button"
                onclick="viewProduct('${product.id}')"
              >
                View
              </button>

            </div>

          </div>

        </article>

      `
    ).join("");


  updateDashboard();

}



/* =========================================
   ADD TO CART
   ========================================= */

function addToCart(id) {

  const product =
    products.find(
      item =>
        String(item.id) ===
        String(id)
    );


  if (!product) {
    return;
  }


  const existing =
    cart.find(
      item =>
        String(item.id) ===
        String(id)
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
    product.name +
    " added to cart"
  );

}



/* =========================================
   CART
   ========================================= */

function updateCart() {

  const count =
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


  document.getElementById(
    "cartCount"
  ).textContent =
    count;


  document.getElementById(
    "cartTotal"
  ).textContent =
    money(total);


  const container =
    document.getElementById(
      "cartItems"
    );


  if (!container) {
    return;
  }


  if (cart.length === 0) {

    container.innerHTML = `

      <div class="empty-cart">

        <h3>
          Your cart is empty
        </h3>

        <p>
          Add products from the
          marketplace.
        </p>

      </div>

    `;

    return;

  }


  container.innerHTML =
    cart.map(
      item => `

        <div class="cart-item">

          <img
            class="cart-item-image"
            src="${safe(item.image)}"
            alt="${safe(item.name)}"
          >


          <div>

            <h4>
              ${safe(item.name)}
            </h4>


            <div class="cart-item-price">
              KES ${money(item.price)}
            </div>


            <div class="quantity-controls">

              <button
                onclick="changeQuantity('${item.id}', -1)"
              >
                −
              </button>


              <span>
                ${item.quantity}
              </span>


              <button
                onclick="changeQuantity('${item.id}', 1)"
              >
                +
              </button>


              <button
                class="remove-button"
                onclick="removeFromCart('${item.id}')"
              >
                Remove
              </button>

            </div>

          </div>

        </div>

      `
    ).join("");

}



/* =========================================
   CHANGE QUANTITY
   ========================================= */

function changeQuantity(
  id,
  amount
) {

  const item =
    cart.find(
      product =>
        String(product.id) ===
        String(id)
    );


  if (!item) {
    return;
  }


  item.quantity += amount;


  if (item.quantity <= 0) {

    cart =
      cart.filter(
        product =>
          String(product.id) !==
          String(id)
      );

  }


  updateCart();

}



/* =========================================
   REMOVE
   ========================================= */

function removeFromCart(id) {

  cart =
    cart.filter(
      item =>
        String(item.id) !==
        String(id)
    );


  updateCart();

}



/* =========================================
   OPEN CART
   ========================================= */

function openCart() {

  document
    .getElementById("cartDrawer")
    .classList.add("open");


  document
    .getElementById("cartOverlay")
    .classList.add("show");

}



/* =========================================
   CLOSE CART
   ========================================= */

function closeCart() {

  document
    .getElementById("cartDrawer")
    .classList.remove("open");


  document
    .getElementById("cartOverlay")
    .classList.remove("show");

}



/* =========================================
   CHECKOUT
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


  /*
    Record the completed purchase.
  */

  analytics.sales += total;

  analytics.amountUsed += total;

  analytics.orders += 1;


  saveAnalytics();


  /*
    Empty cart after successful
    demo checkout.
  */

  cart = [];


  updateCart();

  updateDashboard();

  closeCart();


  showToast(
    "Demo checkout completed!"
  );

}



/* =========================================
   IMAGE UPLOAD
   ========================================= */

productImage.addEventListener(
  "change",
  function () {

    const file =
      this.files[0];


    if (!file) {

      selectedImage = "";

      imagePreviewContainer
        .classList.remove("show");

      return;

    }


    if (
      !file.type.startsWith(
        "image/"
      )
    ) {

      showToast(
        "Please choose an image."
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


        imagePreview.src =
          selectedImage;


        imagePreviewContainer
          .classList.add("show");

      };


    reader.readAsDataURL(file);

  }
);



/* =========================================
   CREATE PRODUCT
   ========================================= */

productForm.addEventListener(
  "submit",
  function (event) {

    event.preventDefault();


    const name =
      document
        .getElementById(
          "productName"
        )
        .value
        .trim();


    const price =
      Number(
        document
          .getElementById(
            "productPrice"
          )
          .value
      );


    const description =
      document
        .getElementById(
          "productDescription"
        )
        .value
        .trim();


    if (!name) {

      showToast(
        "Enter a product name."
      );

      return;

    }


    if (
      !price ||
      price <= 0
    ) {

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


    /*
      If the seller did not choose
      an image, use a SmithX image
      instead of leaving the card blank.
    */

    const image =
      selectedImage ||
      createProductPlaceholder(name);


    const newProduct = {

      id:
        "custom-" +
        Date.now(),

      name,

      price,

      description,

      category:
        "Seller Product",

      image

    };


    /*
      Add the new product to the
      marketplace.
    */

    products.push(
      newProduct
    );


    saveProducts();


    renderProducts();


    updateDashboard();


    /*
      Clear the form.
    */

    productForm.reset();


    selectedImage = "";


    imagePreview.src = "";

    imagePreviewContainer
      .classList.remove("show");


    showToast(
      "Product published successfully!"
    );


    /*
      Take the seller back toward
      the marketplace so they can
      see the new product.
    */

    document
      .getElementById("market")
      .scrollIntoView({
        behavior: "smooth"
      });

  }
);



/* =========================================
   AI DESCRIPTION
   ========================================= */

function generateDescription() {

  const name =
    document
      .getElementById(
        "productName"
      )
      .value
      .trim();


  const description =
    document.getElementById(
      "productDescription"
    );


  if (!name) {

    showToast(
      "Enter the product name first."
    );

    return;

  }


  description.value =
    `${name} combines quality, modern design and everyday practicality to give customers a reliable product for their needs. Discover and shop this product through SmithX.`;


  showToast(
    "AI description generated."
  );

}



/* =========================================
   PRODUCT MODAL
   ========================================= */

function viewProduct(id) {

  const product =
    products.find(
      item =>
        String(item.id) ===
        String(id)
    );


  if (!product) {
    return;
  }


  document.getElementById(
    "modalImage"
  ).src =
    product.image;


  document.getElementById(
    "modalCategory"
  ).textContent =
    product.category;


  document.getElementById(
    "modalName"
  ).textContent =
    product.name;


  document.getElementById(
    "modalPrice"
  ).textContent =
    "KES " +
    money(product.price);


  document.getElementById(
    "modalDescription"
  ).textContent =
    product.description;


  document.getElementById(
    "modalAddButton"
  ).onclick =
    function () {

      addToCart(product.id);

      closeProductModal();

    };


  document
    .getElementById(
      "productModal"
    )
    .classList.add("show");

}



/* =========================================
   CLOSE PRODUCT MODAL
   ========================================= */

function closeProductModal() {

  document
    .getElementById(
      "productModal"
    )
    .classList.remove("show");

}



/* =========================================
   DASHBOARD
   ========================================= */

function updateDashboard() {

  /*
    Product count
  */

  document.getElementById(
    "heroProductCount"
  ).textContent =
    products.length;


  document.getElementById(
    "dashboardProducts"
  ).textContent =
    products.length;


  document.getElementById(
    "activityProducts"
  ).textContent =
    products.length;


  /*
    Today's users
  */

  document.getElementById(
    "heroUsers"
  ).textContent =
    analytics.users;


  document.getElementById(
    "dashboardUsers"
  ).textContent =
    analytics.users;


  document.getElementById(
    "activityUsers"
  ).textContent =
    analytics.users;


  /*
    Sales
  */

  const sales =
    "KES " +
    money(analytics.sales);


  document.getElementById(
    "heroSales"
  ).textContent =
    sales;


  document.getElementById(
    "dashboardSales"
  ).textContent =
    sales;


  /*
    Orders
  */

  document.getElementById(
    "dashboardOrders"
  ).textContent =
    analytics.orders;


  document.getElementById(
    "activityPurchases"
  ).textContent =
    analytics.orders;


  /*
    Total amount used
  */

  document.getElementById(
    "activityAmount"
  ).textContent =
    "KES " +
    money(analytics.amountUsed);

}



/* =========================================
   RESET ANALYTICS
   ========================================= */

function resetAnalytics() {

  const answer =
    confirm(
      "Reset today's SmithX demo analytics?"
    );


  if (!answer) {
    return;
  }


  analytics =
    newAnalytics();


  saveAnalytics();


  /*
    Remove today's visitor record
    so the next fresh visit can be
    counted again.
  */

  localStorage.removeItem(
    VISITOR_KEY
  );


  updateDashboard();


  showToast(
    "Demo analytics reset."
  );

}



/* =========================================
   TOAST
   ========================================= */

let toastTimer;


function showToast(message) {

  const toast =
    document.getElementById(
      "toast"
    );


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
      function () {

        toast.classList.remove(
          "show"
        );

      },
      2500
    );

}



/* =========================================
   PRODUCT IMAGE FALLBACK
   ========================================= */

function createProductPlaceholder(
  name
) {

  const svg = `

    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="900"
      height="600"
      viewBox="0 0 900 600"
    >

      <rect
        width="900"
        height="600"
        fill="#edf3fb"
      />

      <text
        x="450"
        y="285"
        text-anchor="middle"
        font-family="Arial"
        font-size="44"
        font-weight="bold"
        fill="#1769ff"
      >
        SMITHX
      </text>

      <text
        x="450"
        y="340"
        text-anchor="middle"
        font-family="Arial"
        font-size="22"
        fill="#52627a"
      >
        ${name}
      </text>

    </svg>

  `;


  return (
    "data:image/svg+xml;charset=UTF-8," +
    encodeURIComponent(svg)
  );

}



/* =========================================
   SECURITY
   ========================================= */

function safe(value) {

  return String(value)
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );

}



/* =========================================
   SEARCH
   ========================================= */

searchInput.addEventListener(
  "input",
  renderProducts
);



/* =========================================
   INITIALIZE
   ========================================= */

function initializeSmithX() {

  /*
    Count this browser as today's
    visitor.
  */

  registerVisitor();


  /*
    Render the six products.
  */

  renderProducts();


  /*
    Render cart.
  */

  updateCart();


  /*
    Render dashboard.
  */

  updateDashboard();

}



/* =========================================
   START
   ========================================= */

initializeSmithX();
