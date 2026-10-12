"use strict";

/* SmithX theme button overrides */

function smithxApplyThemeButtonClasses() {
  document.querySelectorAll("button, a").forEach(function (element) {
    const text = (element.textContent || "").trim().toLowerCase();

    if (text.includes("add to cart")) {
      element.classList.add("btn-add-to-cart");
    }

    if (text.includes("checkout")) {
      element.classList.add("btn-checkout");
    }
  });
}

document.addEventListener("DOMContentLoaded", smithxApplyThemeButtonClasses);

const smithxThemeObserver = new MutationObserver(function () {
  smithxApplyThemeButtonClasses();
});

smithxThemeObserver.observe(document.body, {
  childList: true,
  subtree: true
});
