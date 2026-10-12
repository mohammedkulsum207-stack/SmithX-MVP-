"use strict";

/* =====================================================
   SM1THX — COMFORT (comfort.js)
   • "Skip to content" link for keyboard and screen-reader
     users.
   • Hidden panels (cart drawer, closed dialogs) can't be
     reached with Tab while they're closed.
   To remove: delete this file, comfort.css and their tags.
===================================================== */

(function () {
  function addSkipLink() {
    if (document.querySelector(".smx-skip")) return;
    const main = document.querySelector("main") || document.querySelector("section");
    if (!main) return;
    if (!main.id) main.id = "smxMain";
    if (!main.hasAttribute("tabindex")) main.setAttribute("tabindex", "-1");
    const link = document.createElement("a");
    link.className = "smx-skip";
    link.href = "#" + main.id;
    link.textContent = "Skip to content";
    link.addEventListener("click", e => {
      e.preventDefault();
      main.focus({ preventScroll: false });
      main.scrollIntoView();
    });
    document.body.prepend(link);
  }

  /* Keep `inert` in step with aria-hidden on panels and dialogs. */
  function syncInert(el) {
    if (!("inert" in el)) return;
    const hidden = el.getAttribute("aria-hidden") === "true";
    if (el.inert !== hidden) el.inert = hidden;
  }

  function watchHidden() {
    const targets = () => document.querySelectorAll("#cartPanel, .modal, [role='dialog'][aria-hidden], aside[aria-hidden]");
    targets().forEach(syncInert);
    new MutationObserver(mutations => {
      mutations.forEach(m => {
        if (m.type === "attributes" && m.target.nodeType === 1 && m.target.hasAttribute("aria-hidden")) syncInert(m.target);
      });
    }).observe(document.body, { attributes: true, attributeFilter: ["aria-hidden"], subtree: true });
  }

  function start() {
    addSkipLink();
    watchHidden();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
