"use strict";

/* SmithX demo payment notice */

(function () {
  function showDemoNotice() {
    if (document.getElementById("smithxDemoPaymentNotice")) return;

    const notice = document.createElement("div");
    notice.id = "smithxDemoPaymentNotice";
    notice.setAttribute("role", "status");
    notice.style.cssText = [
      "position:fixed",
      "left:50%",
      "bottom:20px",
      "transform:translateX(-50%)",
      "z-index:9999",
      "max-width:min(92vw,520px)",
      "background:#fff7e6",
      "color:#5f420e",
      "border:1px solid #f0c36d",
      "border-radius:12px",
      "padding:12px 42px 12px 14px",
      "font:600 14px/1.4 Arial, sans-serif",
      "box-shadow:0 10px 30px rgba(0,0,0,.18)"
    ].join(";");

    notice.innerHTML =
      '<strong>Demo only — no real payments.</strong> ' +
      'Checkout and SMX Credit are demonstrations. No M-Pesa or card payment will be charged.';

    const close = document.createElement("button");
    close.type = "button";
    close.setAttribute("aria-label", "Close demo payment notice");
    close.textContent = "×";
    close.style.cssText = [
      "position:absolute",
      "top:6px",
      "right:8px",
      "border:0",
      "background:transparent",
      "color:#5f420e",
      "font-size:20px",
      "font-weight:700",
      "cursor:pointer",
      "line-height:1"
    ].join(";");

    close.addEventListener("click", function () {
      notice.remove();
    });

    notice.appendChild(close);
    document.body.appendChild(notice);

    setTimeout(function () {
      if (notice.parentNode) notice.remove();
    }, 12000);
  }

  function watchCartAndCheckout() {
    const cart = document.getElementById("cartPanel");
    const checkoutButton = Array.from(document.querySelectorAll("button")).find(function (button) {
      return /checkout/i.test(button.textContent || "");
    });

    if (cart && cart.classList.contains("open")) showDemoNotice();
    if (checkoutButton) {
      checkoutButton.addEventListener("click", showDemoNotice);
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    watchCartAndCheckout();

    const observer = new MutationObserver(function () {
      watchCartAndCheckout();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class"]
    });
  });
})();
