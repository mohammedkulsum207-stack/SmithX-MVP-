"use strict";

/* =====================================================
   SM1THX — SMX CREDIT WALLET (wallet.js)
   Phase 3 · DEMO prepaid store credit.

   Model (decided Oct 2026):
     • 1 SMX = KES 1, always. No exchange rate.
     • Topped up with M-Pesa (demo), spent only on SM1THX.
     • Not transferable between users. No interest.
     • Never expires. Unused balance can be withdrawn
       back to M-Pesa at full value.
     • Refunds for orders paid with SMX go back to SMX.

   ⚠ No real money moves. Before going live, stored
   credit counts as e-money in Kenya: SM1THX would need
   Central Bank of Kenya authorisation or a licensed
   partner holding customer funds in trust, and the
   ledger must move to a secure server.

   The ledger is append-only. The balance is always
   recalculated from the entries, every entry records
   the balance after it, and each action has a unique
   key so it can't be applied twice.
===================================================== */

const SMX_WALLET = {
  key: "smithx_wallet_v1",
  sessionKey: "smithx_auth_session_v1",
  usersKey: "smithx_auth_users_v1",
  currency: "SMX",
  kesPerSmx: 1,
  limits: {
    minTopUp: 50,
    maxTopUp: 75000,          // per top-up (mirrors CBK e-money per-transaction cap)
    maxBalance: 100000,       // SM1THX demo cap on any one wallet
    monthlyLoad: 1000000,     // mirrors CBK aggregate monthly load limit
    minWithdraw: 50
  },
  demo: true
};

const SMX_WALLET_TYPES = {
  topup:    { label: "Top-up",        sign: +1 },
  spend:    { label: "Payment",       sign: -1 },
  refund:   { label: "Refund",        sign: +1 },
  withdraw: { label: "Withdrawal",    sign: -1 }
};

function smxWalletRead() {
  try {
    const data = JSON.parse(localStorage.getItem(SMX_WALLET.key));
    return data && typeof data === "object" ? data : {};
  } catch (error) {
    return {};
  }
}

function smxWalletWrite(data) {
  localStorage.setItem(SMX_WALLET.key, JSON.stringify(data));
}

/* Signed-in user, read directly so this file works on every page. */
function smxWalletUser() {
  try {
    const session = JSON.parse(localStorage.getItem(SMX_WALLET.sessionKey) || "null");
    if (!session || !session.email) return null;
    const users = JSON.parse(localStorage.getItem(SMX_WALLET.usersKey) || "[]");
    return (Array.isArray(users) ? users : []).find(user => user.email === session.email) || null;
  } catch (error) {
    return null;
  }
}

function smxWalletEntries(email) {
  const owner = String(email || "").toLowerCase();
  const wallet = smxWalletRead()[owner];
  return wallet && Array.isArray(wallet.entries) ? wallet.entries.slice() : [];
}

/* Recalculate from scratch and check every recorded balance. */
function smxWalletAudit(email) {
  let balance = 0;
  const problems = [];
  smxWalletEntries(email).forEach((entry, index) => {
    const type = SMX_WALLET_TYPES[entry.type];
    const amount = Number(entry.amount);
    if (!type || !Number.isInteger(amount) || amount <= 0) {
      problems.push("Entry " + (index + 1) + " is not valid.");
      return;
    }
    balance += type.sign * amount;
    if (balance < 0) problems.push("Balance went below zero at entry " + (index + 1) + ".");
    if (Number(entry.balanceAfter) !== balance) problems.push("Entry " + (index + 1) + " doesn't match the running balance.");
  });
  return { balance, ok: problems.length === 0, problems };
}

function smxWalletBalance(email) {
  const audit = smxWalletAudit(email);
  return audit.ok ? audit.balance : 0;
}

function smxWalletLoadedThisMonth(email) {
  const now = new Date();
  return smxWalletEntries(email)
    .filter(entry => entry.type === "topup")
    .filter(entry => {
      const at = new Date(entry.at);
      return at.getFullYear() === now.getFullYear() && at.getMonth() === now.getMonth();
    })
    .reduce((sum, entry) => sum + Number(entry.amount), 0);
}

function smxWalletFindByKey(email, key) {
  return smxWalletEntries(email).find(entry => entry.key === key) || null;
}

/*
  Record one wallet action. Returns { entry, duplicate }.
  Throws a friendly Error if the action isn't allowed.
*/
function smxWalletRecord(email, { type, amount, key, ref, note, method }) {
  const owner = String(email || "").toLowerCase();
  if (!owner) throw new Error("Sign in to use SMX Credit.");
  if (!SMX_WALLET_TYPES[type]) throw new Error("Unknown wallet action.");
  if (!key) throw new Error("Missing action key.");

  const existing = smxWalletFindByKey(owner, key);
  if (existing) return { entry: existing, duplicate: true };

  const value = Number(amount);
  if (!Number.isInteger(value) || value <= 0) throw new Error("Enter a whole amount above zero.");

  const audit = smxWalletAudit(owner);
  if (!audit.ok) throw new Error("Your wallet records don't add up, so the wallet is paused. Contact SM1THX support.");

  const L = SMX_WALLET.limits;
  const balance = audit.balance;

  if (type === "topup") {
    if (value < L.minTopUp) throw new Error("The smallest top-up is " + smxWalletFormat(L.minTopUp) + ".");
    if (value > L.maxTopUp) throw new Error("The largest single top-up is " + smxWalletFormat(L.maxTopUp) + ".");
    if (balance + value > L.maxBalance) {
      throw new Error("A wallet can hold up to " + smxWalletFormat(L.maxBalance) + ". You can add up to " + smxWalletFormat(Math.max(0, L.maxBalance - balance)) + ".");
    }
    if (smxWalletLoadedThisMonth(owner) + value > L.monthlyLoad) throw new Error("This would go over the monthly top-up limit of " + smxWalletFormat(L.monthlyLoad) + ".");
  }

  if (type === "spend" || type === "withdraw") {
    if (value > balance) throw new Error("Not enough SMX Credit. Your balance is " + smxWalletFormat(balance) + ".");
    if (type === "withdraw" && value < L.minWithdraw) throw new Error("The smallest withdrawal is " + smxWalletFormat(L.minWithdraw) + ".");
  }

  const entry = {
    id: "SMXT-" + Date.now().toString(36).toUpperCase() + "-" + Math.random().toString(36).slice(2, 6).toUpperCase(),
    type,
    amount: value,
    balanceAfter: balance + SMX_WALLET_TYPES[type].sign * value,
    key,
    ref: ref || "",
    note: note || "",
    method: method || "",
    at: new Date().toISOString(),
    demo: SMX_WALLET.demo
  };

  const data = smxWalletRead();
  const wallet = data[owner] && Array.isArray(data[owner].entries) ? data[owner] : { createdAt: entry.at, entries: [] };
  wallet.entries.push(entry);
  data[owner] = wallet;
  smxWalletWrite(data);

  return { entry, duplicate: false };
}

function smxWalletFormat(value) {
  return "SMX " + Math.round(Number(value) || 0).toLocaleString("en-KE");
}

function smxWalletKES(value) {
  return "KES " + Math.round((Number(value) || 0) * SMX_WALLET.kesPerSmx).toLocaleString("en-KE");
}

/* Add an "SMX Wallet" link to whichever navigation the page has. */
(function () {
  function addLink() {
    const nav = document.querySelector(".nav-links") || document.querySelector(".header-links");
    if (!nav || nav.querySelector('a[href="wallet.html"]')) return;
    const link = document.createElement("a");
    link.href = "wallet.html";
    link.textContent = "SMX Wallet";
    const anchor = nav.querySelector('a[href="profile.html#store"]') || nav.querySelector('a[href="my-orders.html"]');
    nav.insertBefore(link, anchor ? anchor.nextSibling : null);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => setTimeout(addLink, 0));
  } else {
    setTimeout(addLink, 0);
  }
})();
