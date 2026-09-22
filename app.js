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

function money(amount) {
  return Number(amount).toLocaleString("en-KE");
}

function render() {
  const container = document.getElementById("products");
  const search = document.getElementById("search");

  if (!container) return;

  const query = (search?.value || "").toLowerCase();

  const filtered = products.filter(product =>
    product.name.toLowerCase().includes(query)
  );

  container.innerHTML = filtered.map(product => `
    <article class="card">

      <img
        src="${product.image}"
        alt="${product.name}"
        class="product-image"
        onerror="this.style.display='none'"
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

  updateCount();
  renderCart();
  toast("Added to cart");
}

function updateCount() {
  const count = document.getElementById("count");

  if (!count) return;

  const quantity = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  count.textContent = quantity;
}

function openCart() {
  document.getElementById("cart")?.classList.add("open");
  renderCart();
}

function closeCart() {
  document.getElementById("cart")?.classList.remove("open");
}

function increase(id) {
  const item = cart.find(p => p.id === id);

  if (item) {
    item.quantity++;
  }

  updateCount();
  renderCart();
}

function decrease(id) {
  const item = cart.find(p => p.id === id);

  if (!item) return;

  item.quantity--;

  if (item.quantity <= 0) {
    cart = cart.filter(p => p.id !== id);
  }

  updateCount();
  renderCart();
}

function removeItem(id) {
  cart = cart.filter(p => p.id !== id);

  updateCount();
  renderCart();

  toast("Product removed");
}

function renderCart() {
  const items = document.getElementById("items");
  const totalElement = document.getElementById("total");

  if (!items || !totalElement) return;

  if (cart.length === 0) {
    items.innerHTML =
      "<p class='muted'>Your cart is empty.</p>";

    totalElement.textContent = "0";
    return;
  }

  items.innerHTML = cart.map(item => `
    <div class="cart-item">

      <div>
        <strong>${item.name}</strong>

        <p class="muted">
          KES ${money(item.price)} each
        </p>

        <div>
          <button onclick="decrease(${item.id})">−</button>

          <strong style="margin:0 10px">
            ${item.quantity}
          </strong>

          <button onclick="increase(${item.id})">+</button>

          <button
            onclick="removeItem(${item.id})"
            style="margin-left:10px"
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
    (sum, item) =>
      sum + item.price * item.quantity,
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
    (sum, item) =>
      sum + item.price * item.quantity,
    0
  );

  toast(`Demo checkout — KES ${money(total)}`);

  cart = [];

  updateCount();
  renderCart();
}

function toast(message) {
  const box = document.getElementById("toast");

  if (!box) return;

  box.textContent = message;
  box.style.display = "block";

  setTimeout(() => {
    box.style.display = "none";
  }, 2000);
}

const form = document.getElementById("form");

if (form) {
  form.addEventListener("submit", function(e) {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();

    const price = Number(
      document.getElementById("price").value
    );

    const desc =
      document.getElementById("desc").value.trim() ||
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

    form.reset();

    render();

    toast("Product added to marketplace");
  });
}

function ai() {
  const name = document
    .getElementById("name")
    ?.value
    .trim();

  if (!name) {
    toast("Enter a product name first");
    return;
  }

  document.getElementById("desc").value =
    `Discover ${name}, designed to combine practical everyday value with a clean, modern experience. A great choice for customers looking for quality and convenience.`;

  toast("AI description generated");
}

render();
updateCount();
