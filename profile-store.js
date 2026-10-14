"use strict";

/* =====================================================
   SM1THX — STORE SETUP + COUNTRY (profile-store.js)
   Adds to profile.html:
     • "Store setup" form in the My Store tab
       (name, unique link, tagline, about, theme,
        preview, publish, share)
     • Country selection in Settings
   Requires auth.js and stores.js.
   To remove: delete this file and its <script> tag.
===================================================== */

const SMX_COUNTRIES = [
  "Kenya", "Uganda", "Tanzania", "Rwanda", "Burundi", "Ethiopia", "South Sudan",
  "Somalia", "DR Congo", "Nigeria", "Ghana", "South Africa", "Other"
];

(function () {
  const user = smxCurrentUser();
  if (!user) return;

  const $ = id => document.getElementById(id);
  const existingStore = smxStoreForOwner(user.email);

  // "My Store" opens the saved storefront. The explicit edit link keeps setup accessible.
  if (existingStore && location.hash === "#store" &&
      !new URLSearchParams(location.search).has("editStore")) {
    location.replace("store.html?s=" + encodeURIComponent(existingStore.slug));
    return;
  }

  /* ---------------- Store setup ---------------- */

  const panel = $("panel-store");
  if (panel && !$("storeSetupForm")) {
    const existing = existingStore;

    const card = document.createElement("form");
    card.className = "card settings-form smx-store-setup";
    card.id = "storeSetupForm";
    card.noValidate = true;
    card.innerHTML = `
      <div class="card-head">
        <h2 class="display">Store setup</h2>
        <span class="smx-store-status" id="storeStatus"></span>
      </div>
      <p class="muted" style="font-size:.9rem;margin:-6px 0 16px;">
        Give your store a name and its own link. Products you publish in Seller Studio while signed in are added to it.
      </p>
      <div id="storeMsg" class="form-message" role="alert"></div>

      <div class="smx-store-grid">
        <div class="field">
          <label for="stName">Store name</label>
          <input class="input" id="stName" type="text" maxlength="50" placeholder="e.g. Amina's Electronics" required>
        </div>
        <div class="field">
          <label for="stSlug">Store link</label>
          <div class="smx-slug-wrap">
            <span>store.html?s=</span>
            <input class="input" id="stSlug" type="text" maxlength="40" placeholder="aminas-electronics" autocapitalize="off" spellcheck="false">
          </div>
          <span class="hint" id="slugHint">Letters, numbers and dashes. Must be unique.</span>
        </div>
      </div>

      <div class="field">
        <label for="stTagline">Tagline <span class="muted" style="font-weight:400;">— optional</span></label>
        <input class="input" id="stTagline" type="text" maxlength="80" placeholder="Genuine phones and accessories, delivered across Nairobi">
      </div>

      <div class="field">
        <label for="stAbout">About your store <span class="muted" style="font-weight:400;">— optional</span></label>
        <textarea class="input" id="stAbout" rows="4" maxlength="600" placeholder="Tell buyers who you are, what you sell and how you deliver."></textarea>
      </div>

      <fieldset class="field" style="border:0;">
        <legend style="font-size:.85rem;font-weight:600;margin-bottom:7px;">Store colour</legend>
        <div class="smx-theme-row">
          ${Object.entries(SMX_STORE_THEMES).map(([key, theme]) => `
            <label class="smx-theme-option" title="${theme.label}">
              <input type="radio" name="stTheme" value="${key}">
              <span style="--swatch:${theme.accent};--swatch-ink:${theme.ink};"></span>
              <small>${theme.label}</small>
            </label>`).join("")}
        </div>
      </fieldset>

      <label class="field">
        <span style="font-size:.85rem;font-weight:600;">Layout</span>
        <select class="input" id="stLayout">
          <option value="grid">Classic grid</option>
          <option value="showcase">Showcase (large photos)</option>
          <option value="compact">Compact (more per row)</option>
        </select>
      </label>

      <label class="smx-publish">
        <input type="checkbox" id="stPublished">
        <span><strong>Publish store</strong><small>Show your store page and "by your store" on product cards.</small></span>
      </label>

      <div class="smx-store-actions">
        <button class="btn btn-primary" type="submit">${existing ? "Save store" : "Create store"}</button>
        <a class="btn btn-outline" id="stPreview" href="#" target="_blank" rel="noopener">Preview</a>
        <button class="btn btn-outline" type="button" id="stShare">Share link</button>
      </div>
    `;

    panel.insertBefore(card, panel.firstChild);

    const name = $("stName");
    const slug = $("stSlug");
    const hint = $("slugHint");
    let slugEdited = Boolean(existing);

    function fill(store) {
      name.value = store ? store.name : "";
      slug.value = store ? store.slug : "";
      $("stTagline").value = store ? store.tagline : "";
      $("stAbout").value = store ? store.description : "";
      $("stPublished").checked = store ? store.published : true;
      const theme = store ? store.theme : "gold";
      const radio = card.querySelector(`input[name="stTheme"][value="${theme}"]`);
      if (radio) radio.checked = true;
      $("stLayout").value = store && store.layout ? store.layout : "grid";
      updateStatus(store);
    }

    function updateStatus(store) {
      const status = $("storeStatus");
      const preview = $("stPreview");
      const share = $("stShare");
      if (!store) {
        status.textContent = "Not created";
        status.dataset.state = "none";
        preview.hidden = true;
        share.hidden = true;
        return;
      }
      status.textContent = store.published ? "Published" : "Draft";
      status.dataset.state = store.published ? "live" : "draft";
      preview.hidden = false;
      preview.href = "store.html?s=" + encodeURIComponent(store.slug);
      share.hidden = !store.published;
    }

    function checkSlug() {
      const clean = smxSlugify(slug.value);
      if (!clean) {
        hint.textContent = "Letters, numbers and dashes. Must be unique.";
        hint.dataset.state = "";
        return;
      }
      const ok = smxIsSlugAvailable(clean, user.email);
      hint.textContent = ok ? "✓ " + clean + " is available" : "✗ " + clean + " is taken or reserved";
      hint.dataset.state = ok ? "ok" : "bad";
    }

    name.addEventListener("input", () => {
      if (!slugEdited) {
        slug.value = smxSlugify(name.value);
        checkSlug();
      }
    });

    slug.addEventListener("input", () => {
      slugEdited = true;
      checkSlug();
    });

    slug.addEventListener("blur", () => {
      slug.value = smxSlugify(slug.value);
      checkSlug();
    });

    card.addEventListener("submit", event => {
      event.preventDefault();
      const msg = $("storeMsg");
      try {
        const store = smxSaveMyStore(user.email, {
          name: name.value,
          slug: slug.value || name.value,
          tagline: $("stTagline").value,
          description: $("stAbout").value,
          theme: (card.querySelector('input[name="stTheme"]:checked') || {}).value,
          published: $("stPublished").checked,
          layout: $("stLayout").value
        });

        if (user.role === "buyer") smxUpdateUser(user.email, { role: "both" });

        slug.value = store.slug;
        slugEdited = true;
        checkSlug();
        updateStatus(store);
        card.querySelector('button[type="submit"]').textContent = "Save store";
        msg.textContent = store.published ? "Your store is live. Opening your storefront…" : "Store saved as a draft.";
        msg.className = "form-message show success";
        // A saved draft is still visible to its owner as a storefront preview.
        window.location.href = "store.html?s=" + encodeURIComponent(store.slug);
      } catch (error) {
        msg.textContent = error.message;
        msg.className = "form-message show error";
      }
    });

    $("stShare").addEventListener("click", async () => {
      const store = smxStoreForOwner(user.email);
      if (!store) return;
      const result = await smxShareLink(smxStoreURL(store.slug), store.name + " on SM1THX");
      if (result === "copied") {
        const msg = $("storeMsg");
        msg.textContent = "Store link copied.";
        msg.className = "form-message show success";
      }
    });

    fill(existing);
    if (existing) checkSlug();
  }

  /* ---------------- Country (Settings) ---------------- */

  const detailsForm = $("detailsForm");
  if (detailsForm && !$("sCountry")) {
    const field = document.createElement("div");
    field.className = "field";
    field.innerHTML = `
      <label for="sCountry">Country</label>
      <select class="input" id="sCountry">
        ${SMX_COUNTRIES.map(country => `<option value="${country}">${country}</option>`).join("")}
      </select>
      <span class="hint">Prices are shown in KES for now. More currencies are coming.</span>`;
    const locField = $("sLocation");
    const anchor = locField ? locField.closest(".field") : null;
    detailsForm.insertBefore(field, anchor ? anchor.nextSibling : detailsForm.querySelector("button"));

    $("sCountry").value = SMX_COUNTRIES.includes(user.country) ? user.country : "Kenya";

    detailsForm.addEventListener("submit", () => {
      smxUpdateUser(user.email, { country: $("sCountry").value });
    });
  }

  /* Open the right tab when the hash changes (e.g. "My Store" link). */
  window.addEventListener("hashchange", () => {
    const tab = document.querySelector('.profile-tab[data-panel="' + location.hash.replace("#", "") + '"]');
    if (tab) tab.click();
  });

  /* ---------------- Styles ---------------- */

  const style = document.createElement("style");
  style.textContent = `
    .smx-store-setup { margin-bottom: 24px; display: grid; gap: 14px; }
    .smx-store-setup .card-head { margin-bottom: 0; }
    .smx-store-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .smx-slug-wrap { display: flex; align-items: stretch; border: 1px solid var(--line, #e8e0d2); border-radius: 12px; overflow: hidden; background: #fff; }
    .smx-slug-wrap span { display: flex; align-items: center; padding: 0 10px; background: var(--ivory, #f6f1e8); color: var(--muted, #6f675a); font-size: .8rem; white-space: nowrap; }
    .smx-slug-wrap .input { border: 0; border-radius: 0; min-width: 0; flex: 1; }
    .hint[data-state="ok"] { color: #2f7a4a; }
    .hint[data-state="bad"] { color: #b4373c; }
    .smx-store-status { font-size: .75rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; padding: 5px 10px; border-radius: 999px; background: var(--ivory, #f6f1e8); color: var(--muted, #6f675a); }
    .smx-store-status[data-state="live"] { background: #e6f2e9; color: #2f7a4a; }
    .smx-store-status[data-state="draft"] { background: #f3e3c2; color: #8a5f14; }
    .smx-theme-row { display: flex; flex-wrap: wrap; gap: 10px; }
    .smx-theme-option { display: grid; justify-items: center; gap: 4px; cursor: pointer; }
    .smx-theme-option input { position: absolute; opacity: 0; pointer-events: none; }
    .smx-theme-option span { width: 44px; height: 44px; border-radius: 12px; background: linear-gradient(135deg, var(--swatch) 0 55%, var(--swatch-ink) 55% 100%); border: 2px solid transparent; box-shadow: 0 0 0 1px rgba(0,0,0,.08); }
    .smx-theme-option input:checked + span { border-color: var(--ink, #16130f); box-shadow: 0 0 0 3px var(--gold-soft, #f3e3c2); }
    .smx-theme-option input:focus-visible + span { outline: 2px solid var(--gold-bright, #e8a33d); outline-offset: 2px; }
    .smx-theme-option small { font-size: .7rem; color: var(--muted, #6f675a); }
    .smx-publish { display: flex; gap: 12px; align-items: flex-start; padding: 14px; border: 1px solid var(--line, #e8e0d2); border-radius: 12px; cursor: pointer; }
    .smx-publish input { margin-top: 4px; width: 18px; height: 18px; accent-color: #c8902e; }
    .smx-publish span { display: grid; gap: 2px; }
    .smx-publish small { color: var(--muted, #6f675a); font-size: .82rem; }
    .smx-store-actions { display: flex; flex-wrap: wrap; gap: 10px; }
    .smx-store-actions [hidden] { display: none !important; }
    @media (max-width: 640px) { .smx-store-grid { grid-template-columns: 1fr; } }
  `;
  document.head.appendChild(style);
})();
