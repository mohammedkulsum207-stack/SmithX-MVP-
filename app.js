let products = [
  {
    id: 1,
    name: "Smart Wireless Headphones",
    price: 4500,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
    desc: "Immersive sound with a comfortable wireless design."
  },
  {
    id: 2,
    name: "Minimal Desk Lamp",
    price: 2800,
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80",
    desc: "A modern lamp designed for focused workspaces."
  },
  {
    id: 3,
    name: "Everyday Travel Backpack",
    price: 3500,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
    desc: "A durable everyday backpack for work and travel."
  }
];

let cart = [];

function money(n) {
  return Number(n).toLocaleString("en-KE");
}

function renderProducts() {
  const search = document.getElementById("search");
  const container = document.getElementById("products");

  if (!container) return;

  const q = (search?.value || "").toLowerCase();

  const filtered = products.filter(product =>
    product.name.toLowerCase().includes(q)
  );

  container.innerHTML = filtered.map(product => `
    <article class="card">

      <img
        src="${product.image}"
        alt="${product.name}"
        class="product-image"
        onerror="this.src='https://via.placeholder.com/800x600?text=SmithX+Product'"
      >

      <div class="card-body">

        <h3>${product.name}</h3>

        <p class="muted">${product.desc}</p>

        <div class="price">
          KES ${money(product.price)}
        </div>

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

  updateCartCount();
  renderCart();

  toast("Added to cart");
}

function updateCartCount() {
  const cartCount = document.getElementById("cartCount");

  if (!cartCount) return;

  const count = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  cartCount.textContent = count;
}

function openCart() {
  document.getElementById("cart")?.classList.add("open");
  renderCart();
}

function closeCart() {
  document.getElementById("cart")?.classList.remove("open");
}

function increaseQuantity(id) {
  const item = cart.find(p => p.id === id);

  if (item) {
    item.quantity++;
  }

  updateCartCount();
  renderCart();
}

function decreaseQuantity(id) {
  const item = cart.find(p => p.id === id);

  if (!item) return;

  item.quantity--;

  if (item.quantity <= 0) {
    cart = cart.filter(p => p.id !== id);
  }

  updateCartCount();
  renderCart();
}

function removeFromCart(id) {
  cart = cart.filter(p => p.id !== id);

  updateCartCount();
  renderCart();

  toast("Product removed");
}

function renderCart() {
  const cartItems = document.getElementById("cartItems");
  const totalElement = document.getElementById("total");

  if (!cartItems || !totalElement) return;

  if (cart.length === 0) {
    cartItems.innerHTML =
      "<p class='muted'>Your cart is empty.</p>";

    totalElement.textContent = "0";
    return;
  }

  cartItems.innerHTML = cart.map(item => `
    <div class="cart-item">

      <div>
        <strong>${item.name}</strong>

        <div class="muted">
          KES ${money(item.price)} each
        </div>

        <div style="margin-top:8px;">

          <button onclick="decreaseQuantity(${item.id})">
            −
          </button>

          <strong style="margin:0 10px;">
            ${item.quantity}
          </strong>

          <button onclick="increaseQuantity(${item.id})">
            +
          </button>

          <button
            onclick="removeFromCart(${item.id})"
            style="margin-left:10px;"
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
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  totalElement.textContent = money(total);
}

function checkout() {
  if (cart.length === 0) {
    toast("Your cart is empty");
    return;
  }

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  toast(`Demo checkout: KES ${money(total)}`);

  cart = [];

  updateCartCount();
  renderCart();
}

function toast(message) {
  const toastBox = document.getElementById("toast");

  if (!toastBox) return;

  toastBox.textContent = message;
  toastBox.style.display = "block";

  setTimeout(() => {
    toastBox.style.display = "none";
  }, 1800);
}

const productForm = document.getElementById("productForm");

if (productForm) {
  productForm.addEventListener("submit", function(e) {
    e.preventDefault();

    const name = document.getElementById("pname").value.trim();
    const price = Number(
      document.getElementById("pprice").value
    );

    const desc =
      document.getElementById("pdesc").value.trim() ||
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
      desc: desc
    });

    productForm.reset();

    renderProducts();

    toast("Product added to marketplace");

    document.getElementById("market")?.scrollIntoView({
      behavior: "smooth"
    });
  });
}

function generateDescription() {
  const name = document
    .getElementById("pname")
    ?.value
    .trim();

  if (!name) {
    toast("Enter a product name first");
    return;
  }

  document.getElementById("pdesc").value =
    `Discover ${name}, designed to combine practical everyday value with a clean, modern experience. A great choice for customers looking for quality and convenience.`;

  toast("AI description generated");
}

const search = document.getElementById("search");

if (search) {
  search.addEventListener("input", renderProducts);
}

renderProducts();
updateCartCount();
