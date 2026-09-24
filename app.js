// Global State Inventory Database
let marketplaceItems = [
  {
    id: 101,
    name: "Samsung Galaxy S26 Ultra",
    price: 169999,
    desc: "Experience AI features, next-gen 200MP camera matrices, and lightning productivity processing chips built seamlessly.",
    images: [
      "https://unsplash.com",
      "https://unsplash.com"
    ],
    currentImgIndex: 0
  },
  {
    id: 102,
    name: "SmithX Smart Pods Pro",
    price: 12500,
    desc: "Intelligent ambient active cancellation profiles engineered completely tailored for pristine playback fidelity.",
    images: [
      "https://unsplash.com"
    ],
    currentImgIndex: 0
  }
];

let totalSalesCount = 0;

// Dynamic Marketplace Grid Layout Compiler
function renderMarketplace() {
  const container = document.getElementById("marketplaceGrid");
  if (!container) return;
  
  container.innerHTML = "";
  
  marketplaceItems.forEach(item => {
    const fallbackImage = "https://unsplash.com";
    const displayedImage = item.images[item.currentImgIndex] || fallbackImage;
    
    const cardHtml = `
      <div class="product-card">
        <div class="card-gallery">
          <img src="${displayedImage}" alt="${item.name}">
          ${item.images.length > 1 ? `
            <button class="gallery-btn gallery-btn-left" onclick="slideGallery(\${item.id}, -1)">
              <i class="fa-solid fa-chevron-left"></i>
            </button>
            <button class="gallery-btn gallery-btn-right" onclick="slideGallery(\${item.id}, 1)">
              <i class="fa-solid fa-chevron-right"></i>
            </button>
          ` : ""}
        </div>
        <div class="card-info">
          <div class="card-meta">
            <h3>${item.name}</h3>
            <p>${item.desc || 'No description provided.'}</p>
          </div>
          <div class="card-footer">
            <span class="card-price">KES ${item.price.toLocaleString()}</span>
            <button class="btn-buy" onclick="triggerPurchase(${item.price})">Buy Item</button>
          </div>
        </div>
      </div>
    `;
    container.insertAdjacentHTML("beforeend", cardHtml);
  });

  // Keep numerical tracking displays synced up
  document.getElementById("analyticsProducts").innerText = marketplaceItems.length;
}

// Slider Array Boundary Router logic
window.slideGallery = function(itemId, offset) {
  const element = marketplaceItems.find(p => p.id === itemId);
  if (!element) return;
  
  element.currentImgIndex += offset;
  
  if (element.currentImgIndex >= element.images.length) {
    element.currentImgIndex = 0;
  } else if (element.currentImgIndex < 0) {
    element.currentImgIndex = element.images.length - 1;
  }
  
  renderMarketplace();
};

// Purchase simulation event engine hook
window.triggerPurchase = function(amount) {
  totalSalesCount += amount;
  document.getElementById("analyticsSales").innerText = `KES ${totalSalesCount.toLocaleString()}`;
};

// Intercept studio creation submissions to form dynamic item profiles
document.getElementById("productForm").addEventListener("submit", function(e) {
  e.preventDefault();
  
  const title = document.getElementById("prodName").value;
  const valuation = parseFloat(document.getElementById("prodPrice").value) || 0;
  const description = document.getElementById("prodDesc").value;
  const linkText = document.getElementById("prodImages").value;
  
  // Clean raw links split entries cleanly
  const loadedLinks = linkText.split("\n")
    .map(url => url.trim())
    .filter(url => url.length > 0);

  const freshProduct = {
    id: Date.now(),
    name: title,
    price: valuation,
    desc: description,
    images: loadedLinks.length > 0 ? loadedLinks : ["https://unsplash.com"],
    currentImgIndex: 0
  };

  marketplaceItems.unshift(freshProduct);
  renderMarketplace();
  
  // Flush form inputs immediately
  this.reset();
});

// AI Assistant mock string template injector
document.getElementById("aiBtn").addEventListener("click", function() {
  const currentTitle = document.getElementById("prodName").value.trim();
  const descArea = document.getElementById("prodDesc");
  
  if (!currentTitle) {
    descArea.value = "AI Note: Please provide a Product Name first so I can tailor your text hook description!";
    return;
  }
  
  descArea.value = `Premium edition ${currentTitle}. Engineered for elite performance, intuitive controls, and smart commerce ecosystem utility. Includes official distribution manufacturer warranties.`;
});

// Initial boot mounting cycle
renderMarketplace();
