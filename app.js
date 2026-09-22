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
  return n.toLocaleString("en-KE");
}

function renderProducts() {
  const search = document.getElementById("search");
  const productsContainer = document.getElementById("products");

  if (!productsContainer) return;

  const q = (search?.value || "").toLowerCase();

  productsContainer.innerHTML = products
    .filter(p => p.name.toLowerCase().includes(q))
    .map(p => `
      <article class="card">
        <img
          src="${p.image}"
          alt="${p.name}"
          class="product-image"
          onerror="this.src='https://via.placeholder.com/800x600?text=SmithX+Product'"
        >

        <div class="card-body">
          <h3>${p.name}</h3>

          <p class="muted">${p.desc}</p>

          <div class="price">
            KES ${money(p.price)}
          </div>

          <button class="primary" onclick="addToCart(${p.id})">
            Add to cart
          </button>
        </div>
      </article>
    `)
    .join("");
}

function addToCart(id) {
  const product = products.find(p => p.id === id);

  if (!product) return;

  cart.push(product);

  const cartCount = document.getElementById("cartCount");

  if (cartCount) {
    cartCount.textContent = cart.length;
  }

  toast("Added to cart");
}

function openCart() {
  document.getElementById("cart")?.classList.add("open");
  renderCart();
}

function closeCart() {
  document.getElementById("cart")?.classList.remove("open");
}

function renderCart() {
  const cartItems = document.getElementById("cartItems");
  const total = document.getElementById("total");

  if (!cartItems || !total) return;

  if (cart.length === 0) {
    cartItems.innerHTML =
      "<p class='muted'>Your cart is empty.</p>";
  } else {
    cartItems.innerHTML = cart
      .map(p => `
        <div class="cart-item">
          <span>${p.name}</span>
          <b>KES ${money(p.price)}</b>
        </div>
      `)
      .join("");
  }

  total.textContent = money(
    cart.reduce((sum, p) => sum + p.price, 0)
  );
}

function checkout() {
  if (cart.length === 0) {
    toast("Your cart is empty");
    return;
  }

  toast("Demo checkout complete");

  cart = [];

  const cartCount = document.getElementById("cartCount");

  if (cartCount) {
    cartCount.textContent = 0;
  }

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
  productForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("pname").value;
    const price = Number(
      document.getElementById("pprice").value
    );
    const desc =
      document.getElementById("pdesc").value ||
      "A new product available on SmithX.";

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
