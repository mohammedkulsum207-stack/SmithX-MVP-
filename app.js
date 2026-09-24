/* =========================
   SMITHX PRODUCTS
========================= */

const defaultProducts = [
  {
    id: 1,
    name: "Samsung Galaxy S26 Ultra",
    price: 169999,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80",
    desc: "A premium flagship smartphone built for powerful performance, photography and everyday productivity.",
    tagline: "Ultra performance. Built for more."
  },

  {
    id: 2,
    name: "Smart Wireless Headphones",
    price: 4500,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
    desc: "Immersive sound with a comfortable wireless design.",
    tagline: "Your sound. Anywhere."
  },

  {
    id: 3,
    name: "Minimal Desk Lamp",
    price: 2800,
    category: "Home",
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80",
    desc: "A modern lamp designed for focused workspaces.",
    tagline: "Light up your best ideas."
  },

  {
    id: 4,
    name: "Everyday Travel Backpack",
    price: 3500,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
    desc: "A durable everyday backpack for work, school and travel.",
    tagline: "Built for wherever you're going."
  },

  {
    id: 5,
    name: "Smart Watch",
    price: 6500,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
    desc: "A stylish smart watch designed to keep you connected throughout the day.",
    tagline: "Stay connected. Stay moving."
  },

  {
    id: 6,
    name: "Premium Sneakers",
    price: 7200,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
    desc: "Comfortable everyday sneakers combining modern style and performance.",
    tagline: "Move with confidence."
  }
];


/* =========================
   LOAD SAVED PRODUCTS
========================= */

let savedProducts = [];

try {

  savedProducts =
    JSON.parse(
      localStorage.getItem("smithxProducts")
    ) || [];

} catch (error) {

  savedProducts = [];

}


/* Remove duplicate default products */

const savedIds =
  new Set(
    savedProducts.map(
      product => product.id
    )
  );


let products = [

  ...defaultProducts.filter(
    product => !savedIds.has(product.id)
  ),

  ...savedProducts

];


/* =========================
   CART / ORDERS
========================= */

let cart = [];

let orders = [];

let revenue = 0;

let selectedImage = "";


/* =========================
   SAVE PRODUCTS
========================= */

function saveProducts() {

  try {

    localStorage.setItem(
      "smithxProducts",
      JSON.stringify(products)
    );

  } catch (error) {

    console.log(
      "Could not save products:",
      error
    );

  }

}


/* =========================
   MONEY
========================= */

function money(amount) {

  return Number(amount)
    .toLocaleString("en-KE");

}


/* =========================
   TOAST
========================= */

function toast(message) {

  const box =
    document.getElementById("toast");

  if (!box) return;

  box.textContent =
    message;

  box.style.display =
    "block";

  setTimeout(() => {

    box.style.display =
      "none";

  }, 2200);

}


/* =========================
   IMAGE UPLOAD
========================= */

const imageInput =
  document.getElementById("image");

const imagePreview =
  document.getElementById("imagePreview");


if (imageInput) {

  imageInput.addEventListener(
    "change",
    function () {

      const file =
        this.files[0];

      if (!file) {

        selectedImage = "";

        if (imagePreview) {

          imagePreview.style.display =
            "none";

        }

        return;

      }


      if (
        !file.type.startsWith("image/")
      ) {

        toast(
          "Please select an image"
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


/* =========================
   MARKETPLACE
========================= */

function render() {

  const container =
    document.getElementById("products");

  const search =
    document.getElementById("search");


  if (!container) return;


  const query =
    (search?.value || "")
      .toLowerCase()
      .trim();


  const filtered =
    products.filter(product =>

      product.name
        .toLowerCase()
        .includes(query)

    );


  if (filtered.length === 0) {

    container.innerHTML = `

      <div style="
        grid-column:1/-1;
        padding:40px;
        text-align:center
      ">

        <h3>
          No products found
        </h3>

        <p class="muted">
          Try another search.
        </p>

      </div>

    `;

    return;

  }


  container.innerHTML =

    filtered.map(product => `

      <article class="card">

        <img
          src="${product.image}"
          alt="${product.name}"
          class="product-image"
          onerror="this.style.display='none'"
        >

        <div class="card-body">

          <small style="
            color:#2563eb;
            font-weight:700;
          ">
            ${product.category || "General"}
          </small>

          <h3>
            ${product.name}
          </h3>

          <p class="muted">
            ${product.desc}
          </p>

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


/* =========================
   PRODUCT DETAILS
========================= */

function openProduct(id) {

  const product =
    products.find(
      p => p.id === id
    );


  if (!product) return;


  let modal =
    document.getElementById(
      "productModal"
    );


  if (!modal) {

    modal =
      document.createElement("div");

    modal.id =
      "productModal";

    document.body.appendChild(
      modal
    );

  }


  modal.innerHTML = `

    <div
      class="product-modal-backdrop"
      onclick="closeProduct()"
    ></div>

    <div class="product-modal">

      <button
        class="product-modal-close"
        onclick="closeProduct()"
      >
        ×
      </button>

      <img
        src="${product.image}"
        alt="${product.name}"
      >

      <div class="product-modal-content">

        <small>
          SMITHX MARKETPLACE
        </small>

        <h2>
          ${product.name}
        </h2>

        <p class="product-tagline">
          ${
            product.tagline ||
            "Quality made simple."
          }
        </p>

        <p class="muted">
          ${product.desc}
        </p>

        <div class="product-modal-price">
          KES ${money(product.price)}
        </div>

        <button
          class="primary"
          onclick="
            addToCart(${product.id});
            closeProduct();
          "
        >
          Add to cart
        </button>

      </div>

    </div>

  `;


  modal.classList.add("show");

}


function closeProduct() {

  const modal =
    document.getElementById(
      "productModal"
    );


  if (modal) {

    modal.classList.remove(
      "show"
    );

  }

}


/* =========================
   CART
========================= */

function addToCart(id) {

  const product =
    products.find(
      p => p.id === id
    );


  if (!product) return;


  const existing =
    cart.find(
      item => item.id === id
    );


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

  toast(
    "Added to cart"
  );

}


function updateCount() {

  const count =
    document.getElementById(
      "count"
    );


  if (!count) return;


  const quantity =
    cart.reduce(
      (sum, item) =>
        sum + item.quantity,
      0
    );


  count.textContent =
    quantity;

}


function openCart() {

  document
    .getElementById("cart")
    ?.classList.add("open");

  renderCart();

}


function closeCart() {

  document
    .getElementById("cart")
    ?.classList.remove("open");

}


function increase(id) {

  const item =
    cart.find(
      p => p.id === id
    );


  if (item) {

    item.quantity++;

  }


  updateCount();

  renderCart();

}


function decrease(id) {

  const item =
    cart.find(
      p => p.id === id
    );


  if (!item) return;


  item.quantity--;


  if (item.quantity <= 0) {

    cart =
      cart.filter(
        p => p.id !== id
      );

  }


  updateCount();

  renderCart();

}


function removeItem(id) {

  cart =
    cart.filter(
      p => p.id !== id
    );


  updateCount();

  renderCart();

  toast(
    "Product removed"
  );

}


function renderCart() {

  const items =
    document.getElementById(
      "items"
    );

  const totalElement =
    document.getElementById(
      "total"
    );


  if (
    !items ||
    !totalElement
  ) return;


  if (cart.length === 0) {

    items.innerHTML =
      "<p class='muted'>Your cart is empty.</p>";

    totalElement.textContent =
      "0";

    return;

  }


  items.innerHTML =

    cart.map(item => `

      <div class="cart-item">

        <div>

          <strong>
            ${item.name}
          </strong>

          <p class="muted">
            KES ${money(item.price)} each
          </p>

          <div>

            <button
              onclick="decrease(${item.id})"
            >
              −
            </button>

            <strong style="margin:0 10px">
              ${item.quantity}
            </strong>

            <button
              onclick="increase(${item.id})"
            >
              +
            </button>

            <button
              onclick="removeItem(${item.id})"
              style="margin-left:10px"
            >
              Remove
            </button>

          </div>

        </div>

        <strong>
          KES ${
            money(
              item.price *
              item.quantity
            )
          }
        </strong>

      </div>

    `).join("");


  const total =
    cart.reduce(
      (sum, item) =>
        sum +
        item.price *
        item.quantity,
      0
    );


  totalElement.textContent =
    money(total);

}


/* =========================
   CHECKOUT
========================= */

function checkout() {

  if (cart.length === 0) {

    toast(
      "Your cart is empty"
    );

    return;

  }


  const total =
    cart.reduce(
      (sum, item) =>
        sum +
        item.price *
        item.quantity,
      0
    );


  const quantity =
    cart.reduce(
      (sum, item) =>
        sum + item.quantity,
      0
    );


  orders.push({

    total,

    quantity,

    date:
      new Date()
        .toLocaleDateString()

  });


  revenue += total;


  updateDashboard();


  toast(
    `Demo checkout — KES ${money(total)}`
  );


  cart = [];


  updateCount();

  renderCart();

}


/* =========================
   AI SELLER STUDIO
========================= */

function ai() {

  const name =
    document
      .getElementById("name")
      ?.value
      .trim();


  const price =
    Number(
      document
        .getElementById("price")
        ?.value || 0
    );


  const desc =
    document.getElementById("desc");

  const aiBox =
    document.getElementById(
      "aiResult"
    );


  if (!name) {

    toast(
      "Enter a product name first"
    );

    return;

  }


  /* =========================
     PRODUCT ANALYSIS
  ========================== */

  const suggestedPrice =
    price > 0
      ? Math.round(
          price * 1.05 / 100
        ) * 100
      : 2500;


  const tagline =
    `${name} — quality made simple.`;


  const description =
    `Discover ${name}, designed to combine practical everyday value with a clean, modern experience. A smart choice for customers looking for quality, convenience and reliability.`;


  let category =
    "General";


  const lowerName =
    name.toLowerCase();


  if (

    lowerName.includes("phone") ||
    lowerName.includes("samsung") ||
    lowerName.includes("laptop") ||
    lowerName.includes("watch") ||
    lowerName.includes("headphone") ||
    lowerName.includes("computer") ||
    lowerName.includes("tablet") ||
    lowerName.includes("earbuds")

  ) {

    category =
      "Electronics";

  }


  else if (

    lowerName.includes("shoe") ||
    lowerName.includes("sneaker") ||
    lowerName.includes("bag") ||
    lowerName.includes("shirt") ||
    lowerName.includes("jacket")

  ) {

    category =
      "Fashion";

  }


  else if (

    lowerName.includes("lamp") ||
    lowerName.includes("chair") ||
    lower
