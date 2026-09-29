"use strict";

/* =====================================================
   SM1THX 👤
   PROFILE.JS — DEMO ACCOUNT SYSTEM
   MVP ONLY — LOCAL STORAGE
===================================================== */

const PROFILE_STORAGE = {
  account: "smithx_demo_account_v1",
  session: "smithx_demo_session_v1"
};

/* =====================================================
   DEFAULT DEMO ACCOUNT
===================================================== */

const DEFAULT_DEMO_ACCOUNT = {
  id: "SMX-DEMO-001",
  name: "John Muchina",
  username: "john",
  email: "john@smithx.demo",
  phone: "",
  location: "Nairobi, Kenya",
  role: "buyer-seller",
  createdAt: new Date().toISOString(),
  lastLogin: null
};

/* =====================================================
   STORAGE HELPERS
===================================================== */

function getDemoAccount() {
  const saved = localStorage.getItem(
    PROFILE_STORAGE.account
  );

  if (!saved) {
    localStorage.setItem(
      PROFILE_STORAGE.account,
      JSON.stringify(DEFAULT_DEMO_ACCOUNT)
    );

    return DEFAULT_DEMO_ACCOUNT;
  }

  try {
    return JSON.parse(saved);
  } catch {
    localStorage.setItem(
      PROFILE_STORAGE.account,
      JSON.stringify(DEFAULT_DEMO_ACCOUNT)
    );

    return DEFAULT_DEMO_ACCOUNT;
  }
}

function saveDemoAccount(account) {
  localStorage.setItem(
    PROFILE_STORAGE.account,
    JSON.stringify(account)
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

  return account;
}

function demoLogout() {
  localStorage.removeItem(
    PROFILE_STORAGE.session
  );
}

/* =====================================================
   PROFILE UPDATE
===================================================== */

function updateDemoProfile(updates = {}) {
  const account = getDemoAccount();

  const allowedFields = [
    "name",
    "username",
    "email",
    "phone",
    "location"
  ];

  allowedFields.forEach(field => {
    if (
      Object.prototype.hasOwnProperty.call(
        updates,
        field
      )
    ) {
      account[field] =
        String(updates[field] ?? "").trim();
    }
  });

  saveDemoAccount(account);

  return account;
}

/* =====================================================
   GLOBAL COMPATIBILITY
===================================================== */

window.SM1THX_PROFILE = {
  getAccount: getDemoAccount,
  saveAccount: saveDemoAccount,
  isLoggedIn: isDemoLoggedIn,
  login: demoLogin,
  logout: demoLogout,
  updateProfile: updateDemoProfile
};
