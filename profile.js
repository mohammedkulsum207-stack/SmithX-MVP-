"use strict";

/* =====================================================
   SM1THX 👤
   PROFILE.JS — DEMO ACCOUNT SYSTEM
   BUYER + SELLER PROFILE / LOGIN
===================================================== */

const PROFILE_STORAGE = {
  account: "smithx_demo_account_v1",
  session: "smithx_demo_session_v1",
  wishlist: "smithx_demo_wishlist_v1",
  orders: "smithx_demo_orders_v1"
};

const DEFAULT_DEMO_ACCOUNT = {
  id: "SMX-DEMO-001",
  name: "John Muchina",
  username: "john",
  email: "john@smithx.demo",
  phone: "",
  location: "Nairobi, Kenya",
  role: "buyer-seller",
  createdAt: "2026-09-29T00:00:00.000Z",
  lastLogin: null
};


/* =====================================================
   STORAGE
===================================================== */

function readProfileStorage(key, fallback = null) {
  try {
    const value = localStorage.getItem(key);

    if (!value) {
      return fallback;
    }

    return JSON.parse(value);
  } catch {
    return fallback;
  }
}


function writeProfileStorage(key, value) {
  try {
    localStorage.setItem(
      key,
      JSON.stringify(value)
    );

    return true;
  } catch {
    return false;
  }
}


/* =====================================================
   ACCOUNT
===================================================== */

function getDemoAccount() {

  const saved = readProfileStorage(
    PROFILE_STORAGE.account,
    null
  );

  if (saved && typeof saved === "object") {
    return {
      ...DEFAULT_DEMO_ACCOUNT,
      ...saved
    };
  }

  writeProfileStorage(
    PROFILE_STORAGE.account,
    DEFAULT_DEMO_ACCOUNT
  );

  return {
    ...DEFAULT_DEMO_ACCOUNT
  };
}


function saveDemoAccount(account) {

  if (!account || typeof account !== "object") {
    return false;
  }

  return writeProfileStorage(
    PROFILE_STORAGE.account,
    account
  );
}


/* =====================================================
   SESSION
===================================================== */

function isDemoLoggedIn() {

  return (
    localStorage.getItem(
      PROFILE_STORAGE.session
    ) === "logged-in"
  );
}


function demoLogin() {

  const account = getDemoAccount();

  account.lastLogin =
    new Date().toISOString();

  saveDemoAccount(account);

  localStorage.setItem(
    PROFILE_STORAGE.session,
    "logged-in"
  );

  refreshProfileUI();

  return account;
}


function demoLogout() {

  localStorage.removeItem(
    PROFILE_STORAGE.session
  );

  refreshProfileUI();
}


/* =====================================================
   LOGIN MODAL
===================================================== */

function openLogin() {

  const modal =
    document.getElementById("loginModal");

  if (!modal) {
    return;
  }

  modal.style.display = "flex";
  modal.setAttribute("aria-hidden", "false");

  document.body.classList.add(
    "modal-open"
  );
}


function closeLogin() {

  const modal =
    document.getElementById("loginModal");

  if (!modal) {
    return;
  }

  modal.style.display = "none";
  modal.setAttribute("aria-hidden", "true");

  document.body.classList.remove(
    "modal-open"
  );
}


/* =====================================================
   HANDLE LOGIN
===================================================== */

function handleDemoLogin(event) {

  if (event) {
    event.preventDefault();
  }

  const emailInput =
    document.getElementById("demoEmail");

  const passwordInput =
    document.getElementById("demoPassword");

  const email =
    emailInput
      ? emailInput.value.trim().toLowerCase()
      : "";

  const password =
    passwordInput
      ? passwordInput.value
      : "";

  /*
     Demo credentials only.
     No real authentication happens here.
  */

  if (
    email !== "john@smithx.demo" ||
    password !== "smithx"
  ) {

    showProfileMessage(
      "Demo login details are incorrect."
    );

    return false;
  }

  demoLogin();

  closeLogin();

  updateLoginButton();

  showProfileMessage(
    "Welcome back to SM1THX, John! 👋"
  );

  return true;
}


/* =====================================================
   LOGIN BUTTON
===================================================== */

function updateLoginButton() {

  const button =
    document.getElementById(
      "loginNavButton"
    );

  if (!button) {
    return;
  }

  if (isDemoLoggedIn()) {

    const account =
      getDemoAccount();

    button.textContent =
      account.name || "Profile";

    button.onclick = function () {
      scrollToProfile();
    };

  } else {

    button.textContent = "Login";

    button.onclick = function () {
      openLogin();
    };

  }
}


/* =====================================================
   PROFILE UI
===================================================== */

function refreshProfileUI() {

  const loggedOut =
    document.getElementById(
      "profileLoggedOut"
    );

  const loggedIn =
    document.getElementById(
      "profileLoggedIn"
    );

  if (!loggedOut || !loggedIn) {
    return;
  }

  if (!isDemoLoggedIn()) {

    loggedOut.style.display = "flex";
    loggedIn.style.display = "none";

    updateLoginButton();

    return;
  }

  loggedOut.style.display = "none";
  loggedIn.style.display = "block";

  renderProfileDetails();
  updateProfileStats();
  updateLoginButton();
}


/* =====================================================
   PROFILE DETAILS
===================================================== */

function renderProfileDetails() {

  const account =
    getDemoAccount();

  setText(
    "profileName",
    account.name
  );

  setText(
    "profileUsername",
    "@" + account.username
  );

  setText(
    "profileRole",
    "BUYER • SELLER"
  );

  setText(
    "profileDetailName",
    account.name
  );

  setText(
    "profileDetailUsername",
    "@" + account.username
  );

  setText(
    "profileDetailEmail",
    account.email
  );

  setText(
    "profileDetailPhone",
    account.phone || "Not added"
  );

  setText(
    "profileDetailLocation",
    account.location || "Not added"
  );
}


/* =====================================================
   PROFILE STATISTICS
===================================================== */

function updateProfileStats() {

  /*
     Cart count is read from the existing
     SM1THX cart system when available.
  */

  let cartCount = 0;

  try {

    if (
      typeof getCartCount === "function"
    ) {
      cartCount =
        Number(getCartCount()) || 0;
    }

  } catch {
    cartCount = 0;
  }


  const orders =
    readProfileStorage(
      PROFILE_STORAGE.orders,
      []
    );

  const wishlist =
    readProfileStorage(
      PROFILE_STORAGE.wishlist,
      []
    );


  let products = [];

  try {

    if (
      typeof getAllProducts === "function"
    ) {
      products =
        getAllProducts() || [];
    }

  } catch {
    products = [];
  }


  setText(
    "profileCartCount",
    cartCount
  );

  setText(
    "profileOrderCount",
    Array.isArray(orders)
      ? orders.length
      : 0
  );

  setText(
    "profileProductCount",
    Array.isArray(products)
      ? products.length
      : 0
  );

  setText(
    "profileWishlistCount",
    Array.isArray(wishlist)
      ? wishlist.length
      : 0
  );
}


/* =====================================================
   PROFILE UPDATE
===================================================== */

function updateDemoProfile(updates = {}) {

  const account =
    getDemoAccount();

  const allowedFields = [
    "name",
    "username",
    "email",
    "phone",
    "location"
  ];

  allowedFields.forEach(function (field) {

    if (
      Object.prototype.hasOwnProperty.call(
        updates,
        field
      )
    ) {

      account[field] =
        String(
          updates[field] ?? ""
        ).trim();

    }

  });

  saveDemoAccount(account);

  refreshProfileUI();

  return account;
}


/* =====================================================
   WISHLIST
===================================================== */

function getDemoWishlist() {

  const wishlist =
    readProfileStorage(
      PROFILE_STORAGE.wishlist,
      []
    );

  return Array.isArray(wishlist)
    ? wishlist
    : [];
}


function saveDemoWishlist(items) {

  return writeProfileStorage(
    PROFILE_STORAGE.wishlist,
    Array.isArray(items)
      ? items
      : []
  );
}


function toggleWishlist(productId) {

  if (!productId) {
    return false;
  }

  const wishlist =
    getDemoWishlist();

  const index =
    wishlist.indexOf(productId);

  if (index >= 0) {

    wishlist.splice(index, 1);

  } else {

    wishlist.push(productId);

  }

  saveDemoWishlist(wishlist);

  updateProfileStats();

  return true;
}


/* =====================================================
   DEMO ORDERS
===================================================== */

function getDemoOrders() {

  const orders =
    readProfileStorage(
      PROFILE_STORAGE.orders,
      []
    );

  return Array.isArray(orders)
    ? orders
    : [];
}


function saveDemoOrders(orders) {

  return writeProfileStorage(
    PROFILE_STORAGE.orders,
    Array.isArray(orders)
      ? orders
      : []
  );
}


function addDemoOrder(order = {}) {

  const orders =
    getDemoOrders();

  const newOrder = {

    id:
      order.id ||
      "SMX-ORDER-" +
      Date.now(),

    status:
      order.status ||
      "Demo Order",

    total:
      Number(order.total) || 0,

    items:
      Array.isArray(order.items)
        ? order.items
        : [],

    createdAt:
      new Date().toISOString()

  };

  orders.push(newOrder);

  saveDemoOrders(orders);

  updateProfileStats();

  return newOrder;
}


/* =====================================================
   LOGOUT + REFRESH
===================================================== */

function demoLogoutAndRefresh() {

  demoLogout();

  showProfileMessage(
    "You have been logged out."
  );

  scrollToProfile();
}


/* =====================================================
   PROFILE NAVIGATION
===================================================== */

function scrollToProfile() {

  const profile =
    document.getElementById("profile");

  if (!profile) {
    return;
  }

  profile.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}


/* =====================================================
   UI HELPERS
===================================================== */

function setText(id, value) {

  const element =
    document.getElementById(id);

  if (!element) {
    return;
  }

  element.textContent =
    value == null
      ? ""
      : String(value);
}


function showProfileMessage(message) {

  /*
     Use existing SM1THX toast when available.
  */

  try {

    if (
      typeof showToast === "function"
    ) {

      showToast(message);

      return;
    }

  } catch {
    // Continue to fallback.
  }


  const toast =
    document.getElementById("toast");

  if (!toast) {
    return;
  }

  toast.textContent = message;

  toast.classList.add("show");

  setTimeout(function () {

    toast.classList.remove("show");

  }, 3000);
}


/* =====================================================
   MODAL BACKDROP
===================================================== */

document.addEventListener(
  "click",
  function (event) {

    const loginModal =
      document.getElementById(
        "loginModal"
      );

    if (
      loginModal &&
      event.target === loginModal
    ) {
      closeLogin();
    }

  }
);


/* =====================================================
   ESC KEY
===================================================== */

document.addEventListener(
  "keydown",
  function (event) {

    if (event.key !== "Escape") {
      return;
    }

    closeLogin();

  }
);


/* =====================================================
   INITIALIZE
===================================================== */

function initializeProfileSystem() {

  /*
     Make sure demo account exists.
  */

  getDemoAccount();

  refreshProfileUI();

}


/*
   Wait until the existing app has had a chance
   to initialize its marketplace/cart functions.
*/

if (
  document.readyState === "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    initializeProfileSystem
  );

} else {

  initializeProfileSystem();

}


/* =====================================================
   PUBLIC API
===================================================== */

window.SM1THX_PROFILE = {

  getAccount:
    getDemoAccount,

  saveAccount:
    saveDemoAccount,

  isLoggedIn:
    isDemoLoggedIn,

  login:
    demoLogin,

  logout:
    demoLogout,

  updateProfile:
    updateDemoProfile,

  getWishlist:
    getDemoWishlist,

  toggleWishlist:
    toggleWishlist,

  getOrders:
    getDemoOrders,

  addOrder:
    addDemoOrder,

  refresh:
    refreshProfileUI

};
