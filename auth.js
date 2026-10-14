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

async function smxLegacyHash(text) {
  const value = "smx::" + String(text);
  try {
    if (window.crypto && window.crypto.subtle && window.TextEncoder) {
      const buffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
      return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, "0")).join("");
    }
  } catch (error) { /* legacy account migration only */ }
  let hash = 5381;
  for (let i = 0; i < value.length; i++) hash = ((hash << 5) + hash + value.charCodeAt(i)) >>> 0;
  return "djb2-" + hash.toString(16);
}

function smxNewPasswordSalt() {
  if (!window.crypto || !crypto.getRandomValues || !crypto.subtle) {
    throw new Error("Secure password hashing needs a modern browser over HTTPS.");
  }
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("");
}

async function smxSecureHash(text, saltHex) {
  if (!window.crypto || !crypto.subtle || !window.TextEncoder) {
    throw new Error("Secure password hashing needs a modern browser over HTTPS.");
  }
  const salt = new Uint8Array((saltHex.match(/.{2}/g) || []).map(byte => parseInt(byte, 16)));
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(String(text)), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt, iterations: 310000, hash: "SHA-256" }, key, 256);
  return Array.from(new Uint8Array(bits)).map(b => b.toString(16).padStart(2, "0")).join("");
}

async function smxVerifyPassword(user, password) {
  if (user.passwordSalt) return (await smxSecureHash(password, user.passwordSalt)) === user.passwordHash;
  // Upgrade older demo accounts after a successful legacy verification.
  if ((await smxLegacyHash(password)) !== user.passwordHash) return false;
  const passwordSalt = smxNewPasswordSalt();
  smxUpdateUser(user.email, { passwordSalt, passwordHash: await smxSecureHash(password, passwordSalt) });
  return true;
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

async function smxRegister({ name, email, phone, location, password, role, country }) {
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
    country: String(country || "").trim() || "Kenya",
    passwordSalt: smxNewPasswordSalt(),
    passwordHash: "",
    createdAt: now,
    lastLogin: now
  };

  user.passwordHash = await smxSecureHash(password, user.passwordSalt);
  const users = smxGetUsers();
  users.push(user);
  smxSaveUsers(users);
  smxStartSession(cleanEmail);
  return user;
}

async function smxLogin(email, password) {
  const user = smxFindUser(email);
  if (!user) throw new Error("No account found with that email.");
  if (!(await smxVerifyPassword(user, password))) throw new Error("Incorrect password. Please try again.");
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
  if (!(await smxVerifyPassword(user, currentPassword))) throw new Error("Current password is incorrect.");
  if (String(newPassword || "").length < 6) throw new Error("New password must be at least 6 characters.");
  const passwordSalt = smxNewPasswordSalt();
  smxUpdateUser(email, { passwordSalt, passwordHash: await smxSecureHash(newPassword, passwordSalt) });
}

/* Demo password reset. A live version must send a one-time code by
   email or SMS instead of checking details saved in the browser. */
async function smxResetPassword(email, check, newPassword) {
  const user = smxFindUser(email);
  const generic = "We couldn't verify those details. Check the email and phone number or name on the account.";
  if (!user) throw new Error(generic);
  const digits = value => String(value || "").replace(/\D/g, "").replace(/^(254|0)/, "");
  const clean = String(check || "").trim();
  const phoneOk = user.phone && digits(clean).length >= 7 && digits(clean) === digits(user.phone);
  const nameOk = clean.toLowerCase() === String(user.name || "").trim().toLowerCase();
  if (!phoneOk && !nameOk) throw new Error(generic);
  if (String(newPassword || "").length < 6) throw new Error("New password must be at least 6 characters.");
  const passwordSalt = smxNewPasswordSalt();
  smxUpdateUser(user.email, { passwordSalt, passwordHash: await smxSecureHash(newPassword, passwordSalt), passwordResetAt: new Date().toISOString() });
  return user;
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
