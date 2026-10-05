"use strict";

/* =====================================================
   SM1THX 👤
   PROFILE.JS — DEMO ACCOUNT SYSTEM
   BUYER + SELLER PROFILE
   FRONTEND ONLY — NO FIREBASE
   NO BACKEND
===================================================== */


/* =====================================================
   STORAGE
===================================================== */

const PROFILE_STORAGE = {

  account:
    "smithx_demo_account_v2",

  session:
    "smithx_demo_session_v2",

  wishlist:
    "smithx_demo_wishlist_v2",

  profilePhoto:
    "smithx_demo_profile_photo_v2"

};


/* =====================================================
   DEFAULT DEMO ACCOUNT
===================================================== */

const DEFAULT_DEMO_ACCOUNT = {

  id:
    "SMX-DEMO-001",

  name:
    "John Muchina",

  username:
    "john",

  email:
    "john@smithx.demo",

  phone:
    "",

  location:
    "Nairobi, Kenya",

  bio:
    "Building the future of commerce with SM1THX.",

  role:
    "buyer-seller",

  createdAt:
    "2026-09-29T00:00:00.000Z",

  lastLogin:
    null

};


/* =====================================================
   STORAGE HELPERS
===================================================== */

function readProfileStorage(
  key,
  fallback = null
) {

  try {

    const value =
      localStorage.getItem(key);

    if (!value) {
      return fallback;
    }

    return JSON.parse(value);

  } catch {

    return fallback;

  }

}


function writeProfileStorage(
  key,
  value
) {

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

  const saved =
    readProfileStorage(
      PROFILE_STORAGE.account,
      null
    );


  if (
    saved &&
    typeof saved === "object"
  ) {

    return {

      ...DEFAULT_DEMO_ACCOUNT,

      ...saved

    };

  }


  const account = {

    ...DEFAULT_DEMO_ACCOUNT

  };


  writeProfileStorage(
    PROFILE_STORAGE.account,
    account
  );


  return account;

}


function saveDemoAccount(
  account
) {

  if (
    !account ||
    typeof account !== "object"
  ) {

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

function getDemoSession() {

  const session =
    readProfileStorage(
      PROFILE_STORAGE.session,
      null
    );


  if (
    !session ||
    typeof session !== "object"
  ) {

    return null;

  }


  return session;

}


function isDemoLoggedIn() {

  const session =
    getDemoSession();


  return !!(
    session &&
    session.loggedIn === true
  );

}


function createDemoSession() {

  const session = {

    loggedIn:
      true,

    accountId:
      getDemoAccount().id,

    loginAt:
      new Date().toISOString()

  };


  writeProfileStorage(
    PROFILE_STORAGE.session,
    session
  );


  return session;

}


function destroyDemoSession() {

  try {

    localStorage.removeItem(
      PROFILE_STORAGE.session
    );

  } catch {

    // Ignore storage errors.

  }

}


/* =====================================================
   LOGIN
===================================================== */

function demoLogin(
  email = "john@smithx.demo",
  password = "smithx"
) {

  const normalizedEmail =
    String(email || "")
      .trim()
      .toLowerCase();


  /*
     DEMO CREDENTIALS

     Email:
     john@smithx.demo

     Password:
     smithx

     This is NOT real authentication.
  */

  if (
    normalizedEmail !==
      "john@smithx.demo" ||
    password !==
      "smithx"
  ) {

    showProfileMessage(
      "Incorrect demo email or password."
    );

    return false;

  }


  const account =
    getDemoAccount();


  account.lastLogin =
    new Date().toISOString();


  saveDemoAccount(
    account
  );


  createDemoSession();


  refreshProfileUI();


  showProfileMessage(
    "Welcome back to SM1THX, " +
    (account.name || "there") +
    "! 👋"
  );


  return true;

}


/* =====================================================
   LOGOUT
===================================================== */

function demoLogout() {

  destroyDemoSession();

  refreshProfileUI();

  updateLoginButton();

}


/* =====================================================
   LOGIN MODAL
===================================================== */

function openLogin() {

  ensureAccountUI();


  const modal =
    document.getElementById(
      "loginModal"
    );


  if (!modal) {
    return;
  }


  modal.style.display =
    "flex";


  modal.setAttribute(
    "aria-hidden",
    "false"
  );


  document.body.classList.add(
    "modal-open"
  );


  setTimeout(function () {

    const email =
      document.getElementById(
        "demoEmail"
      );


    if (email) {

      email.focus();

    }

  }, 50);

}


function closeLogin() {

  const modal =
    document.getElementById(
      "loginModal"
    );


  if (!modal) {
    return;
  }


  modal.style.display =
    "none";


  modal.setAttribute(
    "aria-hidden",
    "true"
  );


  document.body.classList.remove(
    "modal-open"
  );

}


/* =====================================================
   LOGIN FORM
===================================================== */

function handleDemoLogin(
  event
) {

  if (event) {

    event.preventDefault();

  }


  const emailInput =
    document.getElementById(
      "demoEmail"
    );


  const passwordInput =
    document.getElementById(
      "demoPassword"
    );


  const email =
    emailInput
      ? emailInput.value.trim()
      : "";


  const password =
    passwordInput
      ? passwordInput.value
      : "";


  if (
    !demoLogin(
      email,
      password
    )
  ) {

    return false;

  }


  closeLogin();


  return true;

}


/* =====================================================
   CREATE DEMO ACCOUNT
===================================================== */

function createDemoAccount(
  name,
  email,
  password
) {

  name =
    String(name || "")
      .trim();


  email =
    String(email || "")
      .trim()
      .toLowerCase();


  password =
    String(password || "");


  if (!name) {

    showProfileMessage(
      "Please enter your name."
    );

    return false;

  }


  if (!email) {

    showProfileMessage(
      "Please enter your email."
    );

    return false;

  }


  if (!email.includes("@")) {

    showProfileMessage(
      "Please enter a valid email."
    );

    return false;

  }


  if (password.length < 4) {

    showProfileMessage(
      "Demo password must be at least 4 characters."
    );

    return false;

  }


  const username =
    name
      .toLowerCase()
      .replace(
        /[^a-z0-9]+/g,
        "-"
      )
      .replace(
        /^-+|-+$/g,
        ""
      ) ||
      "smithx-user";


  const account = {

    ...DEFAULT_DEMO_ACCOUNT,

    id:
      "SMX-DEMO-" +
      Date.now(),

    name:
      name,

    username:
      username,

    email:
      email,

    createdAt:
      new Date().toISOString(),

    lastLogin:
      new Date().toISOString()

  };


  saveDemoAccount(
    account
  );


  createDemoSession();


  refreshProfileUI();


  closeLogin();


  showProfileMessage(
    "Demo account created successfully! 🎉"
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
      "👤 " +
      (
        account.name ||
        "Profile"
      );


    button.onclick =
      function () {

        openProfileDashboard();

      };


    button.setAttribute(
      "aria-label",
      "Open profile"
    );


  } else {

    button.textContent =
      "Login";


    button.onclick =
      function () {

        openLogin();

      };


    button.setAttribute(
      "aria-label",
      "Login"
    );

  }

}


/* =====================================================
   PROFILE DASHBOARD
===================================================== */

function openProfileDashboard() {

  ensureAccountUI();


  const profile =
    document.getElementById(
      "profileDashboard"
    );


  if (!profile) {
    return;
  }


  if (!isDemoLoggedIn()) {

    openLogin();

    return;

  }


  profile.style.display =
    "flex";


  profile.setAttribute(
    "aria-hidden",
    "false"
  );


  document.body.classList.add(
    "modal-open"
  );


  renderProfileDetails();

  updateProfileStats();

}


function closeProfileDashboard() {

  const profile =
    document.getElementById(
      "profileDashboard"
    );


  if (!profile) {
    return;
  }


  profile.style.display =
    "none";


  profile.setAttribute(
    "aria-hidden",
    "true"
  );


  document.body.classList.remove(
    "modal-open"
  );

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
    "@" +
      (
        account.username ||
        "smithx-user"
      )
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
    "@" +
      (
        account.username ||
        "smithx-user"
      )
  );


  setText(
    "profileDetailEmail",
    account.email
  );


  setText(
    "profileDetailPhone",
    account.phone ||
      "Not added"
  );


  setText(
    "profileDetailLocation",
    account.location ||
      "Not added"
  );


  setText(
    "profileBio",
    account.bio ||
      "Building the future of commerce with SM1THX."
  );


  setProfilePhoto(
    getProfilePhoto()
  );

}


/* =====================================================
   PROFILE STATISTICS
===================================================== */

function updateProfileStats() {

  let cartCount =
    0;


  try {

    if (
      typeof getCartCount ===
      "function"
    ) {

      cartCount =
        Number(
          getCartCount()
        ) || 0;

    }

  } catch {

    cartCount =
      0;

  }


  let orders =
    [];


  /*
     Prefer the main SM1THX order system.
  */

  try {

    if (
      typeof getOrders ===
      "function"
    ) {

      const mainOrders =
        getOrders();


      if (
        Array.isArray(
          mainOrders
        )
      ) {

        orders =
          mainOrders;

      }

    }

  } catch {

    orders =
      [];

  }


  const wishlist =
    getDemoWishlist();


  let products =
    [];


  try {

    if (
      typeof getAllProducts ===
      "function"
    ) {

      const allProducts =
        getAllProducts();


      if (
        Array.isArray(
          allProducts
        )
      ) {

        products =
          allProducts;

      }

    }

  } catch {

    products =
      [];

  }


  setText(
    "profileCartCount",
    cartCount
  );


  setText(
    "profileOrderCount",
    orders.length
  );


  setText(
    "profileProductCount",
    products.length
  );


  setText(
    "profileWishlistCount",
    wishlist.length
  );

}


/* =====================================================
   PROFILE UPDATE
===================================================== */

function updateDemoProfile(
  updates = {}
) {

  const account =
    getDemoAccount();


  const allowedFields = [

    "name",
    "username",
    "email",
    "phone",
    "location",
    "bio"

  ];


  allowedFields.forEach(
    function (field) {

      if (
        Object.prototype.hasOwnProperty.call(
          updates,
          field
        )
      ) {

        account[field] =
          String(
            updates[field] ??
            ""
          ).trim();

      }

    }
  );


  saveDemoAccount(
    account
  );


  refreshProfileUI();


  showProfileMessage(
    "Profile updated."
  );


  return account;

}


/* =====================================================
   PROFILE EDIT FORM
===================================================== */

function openEditProfile() {

  ensureAccountUI();


  const account =
    getDemoAccount();


  const name =
    prompt(
      "Your name:",
      account.name || ""
    );


  if (name === null) {
    return;
  }


  const username =
    prompt(
      "Username:",
      account.username || ""
    );


  if (username === null) {
    return;
  }


  const phone =
    prompt(
      "Phone:",
      account.phone || ""
    );


  if (phone === null) {
    return;
  }


  const location =
    prompt(
      "Location:",
      account.location || ""
    );


  if (location === null) {
    return;
  }


  updateDemoProfile({

    name:
      name,

    username:
      username,

    phone:
      phone,

    location:
      location

  });

}


/* =====================================================
   PROFILE PHOTO
===================================================== */

function getProfilePhoto() {

  try {

    return (
      localStorage.getItem(
        PROFILE_STORAGE.profilePhoto
      ) ||
      ""
    );

  } catch {

    return "";

  }

}


function saveProfilePhoto(
  image
) {

  if (!image) {
    return false;
  }


  try {

    localStorage.setItem(
      PROFILE_STORAGE.profilePhoto,
      image
    );


    renderProfileDetails();


    showProfileMessage(
      "Profile photo updated."
    );


    return true;

  } catch {

    showProfileMessage(
      "The image is too large for demo storage."
    );


    return false;

  }

}


function setProfilePhoto(
  image
) {

  const images =
    document.querySelectorAll(
      "[data-smithx-profile-photo]"
    );


  images.forEach(
    function (img) {

      if (image) {

        img.src =
          image;

      } else {

        img.removeAttribute(
          "src"
        );

        img.alt =
          "SM1THX profile";

      }

    }
  );


  const fallback =
    document.querySelectorAll(
      ".smithx-profile-photo-fallback"
    );


  fallback.forEach(
    function (element) {

      element.textContent =
        getInitials(
          getDemoAccount().name
        );

    }
  );

}


function handleProfilePhoto(
  event
) {

  const input =
    event.target;


  if (
    !input ||
    !input.files ||
    !input.files[0]
  ) {

    return;

  }


  const file =
    input.files[0];


  if (
    !file.type.startsWith(
      "image/"
    )
  ) {

    showProfileMessage(
      "Please choose an image."
    );

    return;

  }


  const reader =
    new FileReader();


  reader.onload =
    function () {

      saveProfilePhoto(
        reader.result
      );

    };


  reader.readAsDataURL(
    file
  );

}


/* =====================================================
   INITIALS
===================================================== */

function getInitials(
  name
) {

  const value =
    String(
      name || "SM1THX"
    )
      .trim();


  if (!value) {
    return "S";
  }


  const parts =
    value.split(/\s+/);


  if (
    parts.length === 1
  ) {

    return parts[0]
      .slice(0, 2)
      .toUpperCase();

  }


  return (
    parts[0][0] +
    parts[parts.length - 1][0]
  ).toUpperCase();

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


  return Array.isArray(
    wishlist
  )
    ? wishlist
    : [];

}


function saveDemoWishlist(
  items
) {

  return writeProfileStorage(

    PROFILE_STORAGE.wishlist,

    Array.isArray(items)
      ? items
      : []

  );

}


function toggleWishlist(
  productId
) {

  if (!productId) {
    return false;
  }


  const wishlist =
    getDemoWishlist();


  const index =
    wishlist.indexOf(
      productId
    );


  if (index >= 0) {

    wishlist.splice(
      index,
      1
    );

  } else {

    wishlist.push(
      productId
    );

  }


  saveDemoWishlist(
    wishlist
  );


  updateProfileStats();


  return true;

}


/* =====================================================
   DEMO ORDER COMPATIBILITY
===================================================== */

function getDemoOrders() {

  try {

    if (
      typeof getOrders ===
      "function"
    ) {

      const orders =
        getOrders();


      if (
        Array.isArray(
          orders
        )
      ) {

        return orders;

      }

    }

  } catch {

    // Continue.

  }


  return [];

}


function saveDemoOrders(
  orders
) {

  /*
     The real SM1THX order system
     owns the main order storage.

     This function remains for
     compatibility with older
     profile code.
  */

  if (
    !Array.isArray(
      orders
    )
  ) {

    return false;

  }


  return true;

}


function addDemoOrder(
  order = {}
) {

  try {

    if (
      typeof getOrders ===
      "function" &&
      typeof saveOrders ===
      "function"
    ) {

      const orders =
        getOrders();


      const newOrder = {

        ...order,

        id:
          order.id ||
          "SMX-ORDER-" +
          Date.now(),

        createdAt:
          order.createdAt ||
          new Date().toISOString()

      };


      orders.push(
        newOrder
      );


      saveOrders(
        orders
      );


      updateProfileStats();


      return newOrder;

    }

  } catch {

    // Continue to fallback.

  }


  return {

    id:
      order.id ||
      "SMX-ORDER-" +
      Date.now(),

    ...order,

    createdAt:
      order.createdAt ||
      new Date().toISOString()

  };

}


/* =====================================================
   MY ORDERS
===================================================== */

function openMyOrders() {

  window.location.href =
    "my-orders.html";

}


/* =====================================================
   SELLER PRODUCTS
===================================================== */

function openSellerStudio() {

  closeProfileDashboard();


  if (
    typeof scrollToSection ===
    "function"
  ) {

    scrollToSection(
      "seller"
    );

    return;

  }


  const seller =
    document.getElementById(
      "seller"
    );


  if (seller) {

    seller.scrollIntoView({
      behavior:
        "smooth"
    });

  }

}


/* =====================================================
   ACCOUNT SETTINGS
===================================================== */

function openAccountSettings() {

  const account =
    getDemoAccount();


  const email =
    prompt(
      "Email:",
      account.email || ""
    );


  if (email === null) {
    return;
  }


  const bio =
    prompt(
      "Bio:",
      account.bio || ""
    );


  if (bio === null) {
    return;
  }


  updateDemoProfile({

    email:
      email,

    bio:
      bio

  });

}


/* =====================================================
   DELETE DEMO ACCOUNT
===================================================== */

function deleteDemoAccount() {

  const confirmed =
    window.confirm(
      "Delete your SM1THX demo account? This will remove your demo profile, session and wishlist."
    );


  if (!confirmed) {
    return;
  }


  try {

    localStorage.removeItem(
      PROFILE_STORAGE.account
    );

    localStorage.removeItem(
      PROFILE_STORAGE.session
    );

    localStorage.removeItem(
      PROFILE_STORAGE.wishlist
    );

    localStorage.removeItem(
      PROFILE_STORAGE.profilePhoto
    );

  } catch {

    // Ignore.

  }


  closeProfileDashboard();


  refreshProfileUI();


  showProfileMessage(
    "Demo account deleted."
  );

}


/* =====================================================
   PROFILE NAVIGATION
===================================================== */

function scrollToProfile() {

  if (
    isDemoLoggedIn()
  ) {

    openProfileDashboard();

    return;

  }


  openLogin();

}


/* =====================================================
   UI HELPERS
===================================================== */

function setText(
  id,
  value
) {

  const element =
    document.getElementById(
      id
    );


  if (!element) {
    return;
  }


  element.textContent =
    value == null
      ? ""
      : String(value);

}


function showProfileMessage(
  message
) {

  try {

    if (
      typeof showToast ===
      "function"
    ) {

      showToast(
        message
      );

      return;

    }

  } catch {

    // Continue.

  }


  const toast =
    document.getElementById(
      "toast"
    );


  if (!toast) {
    return;
  }


  toast.textContent =
    message;


  toast.classList.add(
    "show"
  );


  setTimeout(
    function () {

      toast.classList.remove(
        "show"
      );

    },
    3000
  );

}


/* =====================================================
   ACCOUNT UI
   CREATED AUTOMATICALLY IF MISSING
===================================================== */

function ensureAccountUI() {

  /*
     Login modal
  */

  if (
    !document.getElementById(
      "loginModal"
    )
  ) {

    const modal =
      document.createElement(
        "div"
      );


    modal.id =
      "loginModal";


    modal.className =
      "smithx-account-overlay";


    modal.setAttribute(
      "aria-hidden",
      "true"
    );


    modal.innerHTML = `

      <div
        class="smithx-account-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="smithxLoginTitle"
      >

        <button
          type="button"
          class="smithx-account-close"
          onclick="closeLogin()"
          aria-label="Close login"
        >
          ×
        </button>

        <div class="smithx-account-brand">
          <div class="smithx-account-mark">
            🛒
          </div>

          <div>
            <strong>SM1THX</strong>
            <span>SHOP • BUY • GROW</span>
          </div>
        </div>

        <div class="smithx-account-heading">

          <p>WELCOME BACK</p>

          <h2 id="smithxLoginTitle">
            Login to SM1THX
          </h2>

          <span>
            Demo account access
          </span>

        </div>

        <form
          id="smithxLoginForm"
          class="smithx-account-form"
        >

          <label>
            Email

            <input
              id="demoEmail"
              type="email"
              autocomplete="email"
              placeholder="john@smithx.demo"
              required
            >

          </label>

          <label>
            Password

            <input
              id="demoPassword"
              type="password"
              autocomplete="current-password"
              placeholder="smithx"
              required
            >

          </label>

          <button
            type="submit"
            class="primary-button full-width"
          >
            Login
          </button>

        </form>

        <div class="smithx-demo-credentials">

          <strong>
            Demo credentials
          </strong>

          <span>
            john@smithx.demo
          </span>

          <span>
            Password: smithx
          </span>

        </div>

        <button
          type="button"
          class="secondary-button full-width"
          onclick="showDemoRegisterForm()"
        >
          Create Demo Account
        </button>

      </div>

    `;


    document.body.appendChild(
      modal
    );


    const form =
      document.getElementById(
        "smithxLoginForm"
      );


    if (form) {

      form.addEventListener(
        "submit",
        handleDemoLogin
      );

    }

  }


  /*
     Profile dashboard
  */

  if (
    !document.getElementById(
      "profileDashboard"
    )
  ) {

    const dashboard =
      document.createElement(
        "div"
      );


    dashboard.id =
      "profileDashboard";


    dashboard.className =
      "smithx-account-overlay";


    dashboard.setAttribute(
      "aria-hidden",
      "true"
    );


    dashboard.innerHTML = `

      <div
        class="smithx-profile-dashboard"
        role="dialog"
        aria-modal="true"
      >

        <button
          type="button"
          class="smithx-account-close"
          onclick="closeProfileDashboard()"
          aria-label="Close profile"
        >
          ×
        </button>


        <div class="smithx-profile-cover">

          <div class="smithx-profile-photo-wrap">

            <div class="smithx-profile-photo">

              <span
                class="smithx-profile-photo-fallback"
              >
                JM
              </span>

              <img
                data-smithx-profile-photo
                alt="SM1THX profile photo"
              >

            </div>

            <label
              class="smithx-photo-upload"
              title="Change profile photo"
            >

              📷

              <input
                type="file"
                accept="image/*"
                onchange="handleProfilePhoto(event)"
                hidden
              >

            </label>

          </div>

        </div>


        <div class="smithx-profile-body">

          <div class="smithx-profile-header">

            <div>

              <p
                class="smithx-profile-role"
                id="profileRole"
              >
                BUYER • SELLER
              </p>

              <h2
                id="profileName"
              >
                John Muchina
              </h2>

              <p
                id="profileUsername"
              >
                @john
              </p>

            </div>


            <button
              type="button"
              class="secondary-button"
              onclick="openEditProfile()"
            >
              Edit Profile
            </button>

          </div>


          <p
            id="profileBio"
            class="smithx-profile-bio"
          >
            Building the future of commerce with SM1THX.
          </p>


          <div class="smithx-profile-stats">

            <div class="smithx-profile-stat">

              <strong
                id="profileOrderCount"
              >
                0
              </strong>

              <span>
                Orders
              </span>

            </div>


            <div class="smithx-profile-stat">

              <strong
                id="profileProductCount"
              >
                0
              </strong>

              <span>
                Products
              </span>

            </div>


            <div class="smithx-profile-stat">

              <strong
                id="profileCartCount"
              >
                0
              </strong>

              <span>
                Cart
              </span>

            </div>


            <div class="smithx-profile-stat">

              <strong
                id="profileWishlistCount"
              >
                0
              </strong>

              <span>
                Wishlist
              </span>

            </div>

          </div>


          <div class="smithx-profile-grid">

            <div class="smithx-profile-card">

              <p class="smithx-profile-card-label">
                PROFILE
              </p>

              <h3>
                Personal Information
              </h3>


              <div class="smithx-profile-row">

                <span>
                  Name
                </span>

                <strong
                  id="profileDetailName"
                >
                  John Muchina
                </strong>

              </div>


              <div class="smithx-profile-row">

                <span>
                  Username
                </span>

                <strong
                  id="profileDetailUsername"
                >
                  @john
                </strong>

              </div>


              <div class="smithx-profile-row">

                <span>
                  Email
                </span>

                <strong
                  id="profileDetailEmail"
                >
                  john@smithx.demo
                </strong>

              </div>


              <div class="smithx-profile-row">

                <span>
                  Phone
                </span>

                <strong
                  id="profileDetailPhone"
                >
                  Not added
                </strong>

              </div>


              <div class="smithx-profile-row">

                <span>
                  Location
                </span>

                <strong
                  id="profileDetailLocation"
                >
                  Nairobi, Kenya
                </strong>

              </div>

            </div>


            <div class="smithx-profile-card">

              <p class="smithx-profile-card-label">
                SM1THX
              </p>

              <h3>
                Account Actions
              </h3>


              <button
                type="button"
                class="smithx-profile-action"
                onclick="openMyOrders()"
              >
                <span>
                  📦
                </span>

                <div>
                  <strong>
                    My Orders
                  </strong>

                  <small>
                    View your purchases and tracking
                  </small>
                </div>

              </button>


              <button
                type="button"
                class="smithx-profile-action"
                onclick="openSellerStudio()"
              >
                <span>
                  🏪
                </span>

                <div>
                  <strong>
                    Seller Studio
                  </strong>

                  <small>
                    Create and manage products
                  </small>
                </div>

              </button>


              <button
                type="button"
                class="smithx-profile-action"
                onclick="openAccountSettings()"
              >
                <span>
                  ⚙️
                </span>

                <div>
                  <strong>
                    Account Settings
                  </strong>

                  <small>
                    Manage your profile
                  </small>
                </div>

              </button>

            </div>

          </div>


          <div class="smithx-profile-danger">

            <div>

              <strong>
                Demo Account
              </strong>

              <p>
                This is a frontend-only SM1THX demonstration account.
              </p>

            </div>


            <div class="smithx-profile-actions">

              <button
                type="button"
                class="secondary-button"
                onclick="demoLogoutAndClose()"
              >
                Logout
              </button>


              <button
                type="button"
                class="smithx-danger-button"
                onclick="deleteDemoAccount()"
              >
                Delete Demo Account
              </button>

            </div>

          </div>

        </div>

      </div>

    `;


    document.body.appendChild(
      dashboard
    );

  }

}


/* =====================================================
   REGISTER FORM
===================================================== */

function showDemoRegisterForm() {

  ensureAccountUI();


  const modal =
    document.getElementById(
      "loginModal"
    );


  if (!modal) {
    return;
  }


  const box =
    modal.querySelector(
      ".smithx-account-modal"
    );


  if (!box) {
    return;
  }


  box.innerHTML = `

    <button
      type="button"
      class="smithx-account-close"
      onclick="closeLogin()"
      aria-label="Close"
    >
      ×
    </button>


    <div class="smithx-account-brand">

      <div class="smithx-account-mark">
        🛒
      </div>

      <div>
        <strong>SM1THX</strong>
        <span>SHOP • BUY • GROW</span>
      </div>

    </div>


    <div class="smithx-account-heading">

      <p>JOIN SM1THX</p>

      <h2>
        Create Demo Account
      </h2>

      <span>
        No Firebase. No backend.
      </span>

    </div>


    <form
      id="smithxRegisterForm"
      class="smithx-account-form"
    >

      <label>
        Full Name

        <input
          id="demoRegisterName"
          type="text"
          placeholder="John Muchina"
          required
        >

      </label>


      <label>
        Email

        <input
          id="demoRegisterEmail"
          type="email"
          placeholder="you@example.com"
          required
        >

      </label>


      <label>
        Password

        <input
          id="demoRegisterPassword"
          type="password"
          placeholder="Create a password"
          minlength="4"
          required
        >

      </label>


      <button
        type="submit"
        class="primary-button full-width"
      >
        Create Account
      </button>

    </form>


    <button
      type="button"
      class="secondary-button full-width"
      onclick="showDemoLoginForm()"
    >
      ← Back to Login
    </button>

  `;


  const form =
    document.getElementById(
      "smithxRegisterForm"
    );


  if (form) {

    form.addEventListener(
      "submit",
      function (event) {

        event.preventDefault();


        const name =
          document.getElementById(
            "demoRegisterName"
          ).value;


        const email =
          document.getElementById(
            "demoRegisterEmail"
          ).value;


        const password =
          document.getElementById(
            "demoRegisterPassword"
          ).value;


        createDemoAccount(
          name,
          email,
          password
        );

      }
    );

  }

}


function showDemoLoginForm() {

  const modal =
    document.getElementById(
      "loginModal"
    );


  if (!modal) {
    return;
  }


  const box =
    modal.querySelector(
      ".smithx-account-modal"
    );


  if (!box) {
    return;
  }


  box.innerHTML = `

    <button
      type="button"
      class="smithx-account-close"
      onclick="closeLogin()"
      aria-label="Close"
    >
      ×
    </button>


    <div class="smithx-account-brand">

      <div class="smithx-account-mark">
        🛒
      </div>

      <div>
        <strong>SM1THX</strong>
        <span>SHOP • BUY • GROW</span>
      </div>

    </div>


    <div class="smithx-account-heading">

      <p>WELCOME BACK</p>

      <h2>
        Login to SM1THX
      </h2>

      <span>
        Demo account access
      </span>

    </div>


    <form
      id="smithxLoginForm"
      class="smithx-account-form"
    >

      <label>
        Email

        <input
          id="demoEmail"
          type="email"
          placeholder="john@smithx.demo"
          required
        >

      </label>


      <label>
        Password

        <input
          id="demoPassword"
          type="password"
          placeholder="smithx"
          required
        >

      </label>


      <button
        type="submit"
        class="primary-button full-width"
      >
        Login
      </button>

    </form>


    <div class="smithx-demo-credentials">

      <strong>
        Demo credentials
      </strong>

      <span>
        john@smithx.demo
      </span>

      <span>
        Password: smithx
      </span>

    </div>


    <button
      type="button"
      class="secondary-button full-width"
      onclick="showDemoRegisterForm()"
    >
      Create Demo Account
    </button>

  `;


  const form =
    document.getElementById(
      "smithxLoginForm"
    );


  if (form) {

    form.addEventListener(
      "submit",
      handleDemoLogin
    );

  }

}


/* =====================================================
   LOGOUT AND CLOSE
===================================================== */

function demoLogoutAndClose() {

  demoLogout();

  closeProfileDashboard();

  showProfileMessage(
    "You have been logged out."
  );

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


    const profileDashboard =
      document.getElementById(
        "profileDashboard"
      );


    if (
      loginModal &&
      event.target ===
        loginModal
    ) {

      closeLogin();

    }


    if (
      profileDashboard &&
      event.target ===
        profileDashboard
    ) {

      closeProfileDashboard();

    }

  }
);


/* =====================================================
   ESC KEY
===================================================== */

document.addEventListener(
  "keydown",
  function (event) {

    if (
      event.key !==
      "Escape"
    ) {

      return;

    }


    closeLogin();

    closeProfileDashboard();

  }
);


/* =====================================================
   REFRESH PROFILE UI
===================================================== */

function refreshProfileUI() {

  ensureAccountUI();


  const loggedOut =
    document.getElementById(
      "profileLoggedOut"
    );


  const loggedIn =
    document.getElementById(
      "profileLoggedIn"
    );


  if (
    loggedOut &&
    loggedIn
  ) {

    if (
      isDemoLoggedIn()
    ) {

      loggedOut.style.display =
        "none";

      loggedIn.style.display =
        "block";

    } else {

      loggedOut.style.display =
        "flex";

      loggedIn.style.display =
        "none";

    }

  }


  if (
    isDemoLoggedIn()
  ) {

    renderProfileDetails();

    updateProfileStats();

  }


  updateLoginButton();

}


/* =====================================================
   INITIALIZATION
===================================================== */

function initializeProfileSystem() {

  /*
     Create the default demo account
     if one does not exist.
  */

  getDemoAccount();


  ensureAccountUI();


  refreshProfileUI();

}


/* =====================================================
   PUBLIC API
===================================================== */

window.SM1THX_PROFILE = {

  getAccount:
    getDemoAccount,

  saveAccount:
    saveDemoAccount,

  getSession:
    getDemoSession,

  isLoggedIn:
    isDemoLoggedIn,

  login:
    demoLogin,

  logout:
    demoLogout,

  updateProfile:
    updateDemoProfile,

  editProfile:
    openEditProfile,

  getWishlist:
    getDemoWishlist,

  saveWishlist:
    saveDemoWishlist,

  toggleWishlist:
    toggleWishlist,

  getOrders:
    getDemoOrders,

  addOrder:
    addDemoOrder,

  openProfile:
    openProfileDashboard,

  closeProfile:
    closeProfileDashboard,

  refresh:
    refreshProfileUI

};


/* =====================================================
   GLOBAL COMPATIBILITY
===================================================== */

window.openLogin =
  openLogin;

window.closeLogin =
  closeLogin;

window.handleDemoLogin =
  handleDemoLogin;

window.demoLogin =
  demoLogin;

window.demoLogout =
  demoLogout;

window.createDemoAccount =
  createDemoAccount;

window.openProfileDashboard =
  openProfileDashboard;

window.closeProfileDashboard =
  closeProfileDashboard;

window.openEditProfile =
  openEditProfile;

window.handleProfilePhoto =
  handleProfilePhoto;

window.openMyOrders =
  openMyOrders;

window.openSellerStudio =
  openSellerStudio;

window.openAccountSettings =
  openAccountSettings;

window.deleteDemoAccount =
  deleteDemoAccount;

window.demoLogoutAndClose =
  demoLogoutAndClose;

window.scrollToProfile =
  scrollToProfile;

window.toggleWishlist =
  toggleWishlist;


/* =====================================================
   START
===================================================== */

if (
  document.readyState ===
  "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    initializeProfileSystem
  );

} else {

  initializeProfileSystem();

}
