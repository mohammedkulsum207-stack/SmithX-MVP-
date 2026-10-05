"use strict";

/* =====================================================
   SM1THX — ACCOUNT LINK IN NAVIGATION (auth-nav.js)
   Adds a "Login" / account button to the header.
   Safe to remove: delete this file and its <script> tag.
===================================================== */

(function () {
  function readSession() {
    try {
      const session = JSON.parse(localStorage.getItem("smithx_auth_session_v1") || "null");
      if (!session || !session.email) return null;
      const users = JSON.parse(localStorage.getItem("smithx_auth_users_v1") || "[]");
      return (Array.isArray(users) ? users : []).find(u => u.email === session.email) || null;
    } catch (error) {
      return null;
    }
  }

  function initials(name) {
    return String(name || "?").trim().split(/\s+/).slice(0, 2).map(p => p[0] || "").join("").toUpperCase();
  }

  function addAccountLink() {
    if (document.getElementById("smxAccountLink")) return;

    const user = readSession();
    const link = document.createElement("a");
    link.id = "smxAccountLink";
    link.className = "nav-login-btn smx-account-link";
    link.href = user ? "profile.html" : "login.html";
    link.setAttribute("aria-label", user ? "Open your profile" : "Log in or create an account");

    if (user) {
      const first = String(user.name || "").split(/\s+/)[0] || "Account";
      link.innerHTML = '<span class="smx-avatar-dot">' + initials(user.name) + "</span><span>" + first.replace(/[<>&"]/g, "") + "</span>";
    } else {
      link.textContent = "Login";
    }

    link.style.display = "inline-flex";
    link.style.alignItems = "center";
    link.style.gap = "8px";
    link.style.textDecoration = "none";

    const homeCart = document.querySelector(".topbar-inner .cart-button");
    const ordersBack = document.querySelector("header .back-btn");

    if (homeCart && homeCart.parentNode) {
      homeCart.parentNode.insertBefore(link, homeCart);
    } else if (ordersBack && ordersBack.parentNode) {
      link.style.marginLeft = "auto";
      link.style.marginRight = "12px";
      link.style.padding = "9px 16px";
      link.style.borderRadius = "999px";
      link.style.border = "1px solid rgba(255,255,255,.25)";
      link.style.color = "#fff";
      link.style.fontWeight = "600";
      link.style.fontSize = ".9rem";
      ordersBack.parentNode.insertBefore(link, ordersBack);
    }

    const style = document.createElement("style");
    style.textContent =
      ".smx-avatar-dot{display:inline-grid;place-items:center;width:24px;height:24px;border-radius:50%;" +
      "background:#e8a33d;color:#16130f;font-size:.68rem;font-weight:700;letter-spacing:0}" +
      ".smx-account-link:hover{border-color:#e8a33d!important;color:#e8a33d!important}";
    document.head.appendChild(style);
  }

  // app.js removes the old Login button on DOMContentLoaded, so run after it.
  if (document.readyState === "complete") {
    addAccountLink();
  } else {
    window.addEventListener("load", addAccountLink);
  }
})();
