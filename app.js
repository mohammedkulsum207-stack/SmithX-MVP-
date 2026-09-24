/* =================================
   SMITHX PRODUCTS
================================= */

const products = [

  {
    id: 1,
    name: "Samsung Galaxy S26 Ultra",
    price: 169999,
    description:
      "Premium smartphone with powerful performance and advanced cameras.",
    image:
      "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=900&q=85"
  },

  {
    id: 2,
    name: "Smart Wireless Headphones",
    price: 4500,
    description:
      "Wireless headphones with clear sound and comfortable design.",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=85"
  },

  {
    id: 3,
    name: "Minimal Desk Lamp",
    price: 2800,
    description:
      "Modern desk lamp perfect for work, study and home spaces.",
    image:
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=85"
  },

  {
    id: 4,
    name: "Everyday Travel Backpack",
    price: 3500,
    description:
      "Practical backpack for work, school and everyday travel.",
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=85"
  },

  {
    id: 5,
    name: "Smart Watch",
    price: 6500,
    description:
      "Modern smartwatch for staying connected and tracking activity.",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=85"
  },

  {
    id: 6,
    name: "Premium Sneakers",
    price: 7200,
    description:
      "Comfortable sneakers combining modern style and everyday performance.",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=85"
  }

];


/* =================================
   CART
================================= */

let cart = [];


/* =================================
   ELEMENTS
================================= */

const productsContainer =
  document.getElementById("products");

const cartItems =
  document.getElementById("cartItems");

const cartCount =
  document.getElementById("cartCount");

const cartTotal =
  document.getElementById("cartTotal");

const cartDrawer =
  document.getElementById("cart");

const overlay =
  document.getElementById("cartOverlay");

const message =
  document.getElementById("message");


/* =================================
   DISPLAY PRODUCTS
================================= */

function displayProducts() {

  productsContainer.innerHTML =
    products.map(product => `

      <article class="product">

        <img
          src="${product.image}"
          alt="${product.name}"
        >

        <div class="product-info">

          <h3>
            ${product.name}
          </h3>

          <p class="description">
            ${product.description}
          </p>

          <div class="price">
            KES ${formatMoney(product.price)}
          </div>

          <button
            class="add-btn"
            onclick="addToCart(${product.id})"
          >
            Add to Cart
          </button>

        </div>

      </article>

    `).join("");

}


/* =================================
   ADD TO CART
================================= */

function addToCart(productId) {

  const product =
    products.find(
      item => item.id === productId
    );

  if (!product) {
    return;
  }


  const existing =
    cart.find(
      item => item.id === productId
    );


  if (existing) {

    existing.quantity++;

  } else {

    cart.push({

      ...product,

      quantity: 1

    });

  }


  updateCart();

  openCart();

  showMessage(
    product.name +
    " added to cart"
  );

}


/* =================================
   UPDATE CART
================================= */

function updateCart() {

  const quantity =
    cart.reduce(
      (sum, item) =>
        sum + item.quantity,
      0
    );


  const total =
    cart.reduce(
      (sum, item) =>
        sum +
        item.price *
        item.quantity,
      0
    );


  cartCount.textContent =
    quantity;


  cartTotal.textContent =
    formatMoney(total);


  if (cart.length === 0) {

    cartItems.innerHTML = `

      <div style="
        text-align:center;
        padding:50px 10px;
        color:#687586;
      ">

        <h3>
          Your cart is empty
        </h3>

        <p>
          Add a product to get started.
        </p>

      </div>

    `;

    return;

  }


  cartItems.innerHTML =
    cart.map(item => `

      <div class="cart-item">

        <img
          src="${item.image}"
          alt="${item.name}"
        >


        <div>

          <h4>
            ${item.name}
          </h4>

          <div class="cart-price">
            KES ${formatMoney(item.price)}
          </div>


          <div class="controls">

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
              class="remove"
              onclick="removeFromCart(${item.id})"
            >
              Remove
            </button>

          </div>

        </div>

      </div>

    `).join("");

}


/* =================================
   CHANGE QUANTITY
================================= */

function changeQuantity(
  productId,
  amount
) {

  const item =
    cart.find(
      product =>
        product.id === productId
    );


  if (!item) {
    return;
  }


  item.quantity += amount;


  if (item.quantity <= 0) {

    cart =
      cart.filter(
        product =>
          product.id !== productId
      );

  }


  updateCart();

}


/* =================================
   REMOVE
================================= */

function removeFromCart(productId) {

  cart =
    cart.filter(
      product =>
        product.id !== productId
    );


  updateCart();

}


/* =================================
   OPEN CART
================================= */

function openCart() {

  cartDrawer.classList.add("open");

  overlay.classList.add("show");

}


/* =================================
   CLOSE CART
================================= */

function closeCart() {

  cartDrawer.classList.remove("open");

  overlay.classList.remove("show");

}


/* =================================
   CHECKOUT
================================= */

function checkout() {

  if (cart.length === 0) {

    showMessage(
      "Your cart is empty."
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


  /*
    Demo checkout.
    The customer has successfully
    completed the purchase.
  */

  showMessage(
    "Purchase completed — KES " +
    formatMoney(total)
  );


  cart = [];


  updateCart();

  closeCart();

}


/* =================================
   MONEY FORMAT
================================= */

function formatMoney(value) {

  return Number(value)
    .toLocaleString("en-KE");

}


/* =================================
   MESSAGE
================================= */

let messageTimer;

function showMessage(text) {

  message.textContent =
    text;

  message.classList.add(
    "show"
  );


  clearTimeout(
    messageTimer
  );


  messageTimer =
    setTimeout(
      () => {

        message.classList.remove(
          "show"
        );

      },
      2500
    );

}


/* =================================
   START
================================= */

displayProducts();

updateCart();
