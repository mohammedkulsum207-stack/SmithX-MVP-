"use strict";

/* =====================================================
   SM1THX — DEMO ACCOUNTS (auth.js)
   Used by login.html, profile.html and auth-nav.js.
   Accounts live only in this browser (localStorage).
   This is a demo login, not real security.
   To remove the feature, delete: auth.js, auth.css,
   auth-nav.js, login.html, profile.html, and the
   auth-nav.js <script> line in index.html / my-orders.html.
===================================================== */

const SMX_AUTH = {
  users: "smithx_auth_users_v1",
  session: "smithx_auth_session_v1",
  // Read-only keys owned by the existing MVP (app.js)
  orders: "smithx_orders_v2",
  cart: "smithx_cart_v2",
  products: "smithx_custom_products_v2",
  analytics: "smithx_analytics_v2"
};

const SMX_DEMO_USER = {
  name: "Amina Wanjiku",
  email: "demo@smithx.co.ke",
  password: "demo1234",
  phone: "0712 345 678",
  location: "Nairobi",
  role: "both"
};

function smxRead(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null || raw === undefined) return fallback;
    const parsed = JSON.parse(raw);
    return parsed === null ? fallback : parsed;
  } catch (error) {
    return fallback;
  }
}

function smxWrite(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    return false;
  }
}

async function smxHash(text) {
  const value = "smx::" + String(text);
  try {
    if (window.crypto && window.crypto.subtle && window.TextEncoder) {
      const buffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
      return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, "0")).join("");
    }
  } catch (error) { /* fall through */ }
  let hash = 5381;
  for (let i = 0; i < value.length; i++) hash = ((hash << 5) + hash + value.charCodeAt(i)) >>> 0;
  return "djb2-" + hash.toString(16);
}

function smxNormalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function smxGetUsers() {
  const users = smxRead(SMX_AUTH.users, []);
  return Array.isArray(users) ? users : [];
}

function smxSaveUsers(users) {
  return smxWrite(SMX_AUTH.users, users);
}

function smxFindUser(email) {
  const target = smxNormalizeEmail(email);
  return smxGetUsers().find(user => user.email === target) || null;
}

function smxCurrentUser() {
  const session = smxRead(SMX_AUTH.session, null);
  if (!session || !session.email) return null;
  return smxFindUser(session.email);
}

function smxStartSession(email) {
  smxWrite(SMX_AUTH.session, { email: smxNormalizeEmail(email), startedAt: new Date().toISOString() });
}

function smxSignOut() {
  try { localStorage.removeItem(SMX_AUTH.session); } catch (error) { /* ignore */ }
}

async function smxRegister({ name, email, phone, location, password, role }) {
  const cleanEmail = smxNormalizeEmail(email);
  const cleanName = String(name || "").trim();

  if (cleanName.length < 2) throw new Error("Please enter your full name.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) throw new Error("Please enter a valid email address.");
  if (String(password || "").length < 6) throw new Error("Password must be at least 6 characters.");
  if (smxFindUser(cleanEmail)) throw new Error("An account with this email already exists. Try signing in.");

  const now = new Date().toISOString();
  const user = {
    id: "SMX-U" + Date.now().toString(36).toUpperCase(),
    name: cleanName,
    email: cleanEmail,
    phone: String(phone || "").trim(),
    location: String(location || "").trim() || "Nairobi",
    role: ["buyer", "seller", "both"].includes(role) ? role : "buyer",
    passwordHash: await smxHash(password),
    createdAt: now,
    lastLogin: now
  };

  const users = smxGetUsers();
  users.push(user);
  smxSaveUsers(users);
  smxStartSession(cleanEmail);
  return user;
}

async function smxLogin(email, password) {
  const user = smxFindUser(email);
  if (!user) throw new Error("No account found with that email.");
  const hash = await smxHash(password);
  if (hash !== user.passwordHash) throw new Error("Incorrect password. Please try again.");
  smxUpdateUser(user.email, { lastLogin: new Date().toISOString() });
  smxStartSession(user.email);
  return user;
}

async function smxEnsureDemoUser() {
  if (!smxFindUser(SMX_DEMO_USER.email)) {
    await smxRegister(SMX_DEMO_USER);
    smxSignOut();
  }
}

function smxUpdateUser(email, changes) {
  const target = smxNormalizeEmail(email);
  const users = smxGetUsers().map(user => (user.email === target ? { ...user, ...changes } : user));
  smxSaveUsers(users);
  return users.find(user => user.email === target) || null;
}

async function smxChangePassword(email, currentPassword, newPassword) {
  const user = smxFindUser(email);
  if (!user) throw new Error("Account not found.");
  if ((await smxHash(currentPassword)) !== user.passwordHash) throw new Error("Current password is incorrect.");
  if (String(newPassword || "").length < 6) throw new Error("New password must be at least 6 characters.");
  smxUpdateUser(email, { passwordHash: await smxHash(newPassword) });
}

function smxDeleteAccount(email) {
  const target = smxNormalizeEmail(email);
  smxSaveUsers(smxGetUsers().filter(user => user.email !== target));
  smxSignOut();
}

function smxInitials(name) {
  return String(name || "?").trim().split(/\s+/).slice(0, 2).map(part => part[0] || "").join("").toUpperCase() || "?";
}

function smxFormatKES(value) {
  return "KES " + Math.round(Number(value) || 0).toLocaleString("en-KE");
}

function smxFormatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });
}

function smxEscape(value) {
  return String(value ?? "").replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
}
