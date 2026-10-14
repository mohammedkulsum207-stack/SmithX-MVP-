"use strict";

/* =====================================================
   SMITHX — PHASE 4 ASSISTANTS (phase4-ai.js)

   1. Product listing assistant (index.html, Seller Studio)
      • Fixes the result box being wiped by the loading
        message, so AI results actually show.
      • If the AI service is down or out of credits, writes
        a built-in draft instead of showing an error.

   2. Store Assistant (profile.html, My Store tab)
      • Suggests 3 store concepts — colour theme, layout,
        tagline, About text — plus ready-to-post promo
        captions. Sellers edit and approve; nothing is
        saved until they press "Save store".
      • Uses built-in suggestions (no AI service needed).

   To remove: delete this file and its <script> tags.
===================================================== */

const SMX_CATEGORY_WORDS = {
  Electronics: { items: "electronics", nouns: ["phones", "gadgets", "accessories"], promise: "genuine products with warranty", adjectives: ["genuine", "reliable", "latest"], features: ["Genuine, brand-new stock", "Tested before dispatch", "Warranty support on eligible items", "Fast delivery across Kenya"] },
  Fashion: { items: "fashion", nouns: ["outfits", "fits", "pieces"], promise: "fresh styles at fair prices", adjectives: ["fresh", "stylish", "everyday"], features: ["Quality fabrics that last", "True-to-size fit guide", "Easy exchanges on sizing", "New drops every week"] },
  Home: { items: "home goods", nouns: ["home essentials", "decor", "kitchenware"], promise: "pieces that make a house feel like home", adjectives: ["cosy", "practical", "beautiful"], features: ["Durable, easy-care materials", "Carefully packed for delivery", "Designed for everyday use", "Great for gifting"] },
  Beauty: { items: "beauty products", nouns: ["skincare", "beauty essentials", "self-care"], promise: "authentic beauty, honestly priced", adjectives: ["authentic", "gentle", "glow-worthy"], features: ["100% authentic products", "Clear ingredient information", "Sealed and freshly stocked", "Suitable for everyday routines"] },
  Accessories: { items: "accessories", nouns: ["accessories", "bags", "watches"], promise: "the finishing touch for every look", adjectives: ["timeless", "statement", "everyday"], features: ["Quality finishes", "Gift-ready packaging", "Pieces for every occasion", "Fast delivery"] },
  Other: { items: "products", nouns: ["products", "finds", "essentials"], promise: "quality you can count on", adjectives: ["quality", "trusted", "handpicked"], features: ["Quality checked before dispatch", "Clear photos and descriptions", "Friendly support", "Delivery across Kenya"] }
};

const SMX_STYLES = {
  premium:  { label: "Premium",  themes: ["gold", "violet"],    layout: "showcase", voice: "refined" },
  friendly: { label: "Friendly", themes: ["emerald", "ocean"],  layout: "grid",     voice: "warm" },
  bold:     { label: "Bold",     themes: ["sunset", "rose"],    layout: "showcase", voice: "energetic" },
  minimal:  { label: "Minimal",  themes: ["ocean", "gold"],     layout: "compact",  voice: "clean" },
  eco:      { label: "Natural",  themes: ["emerald", "gold"],   layout: "grid",     voice: "grounded" }
};

const SMX_LAYOUTS = {
  grid: "Classic grid",
  showcase: "Showcase (large photos)",
  compact: "Compact (more per row)"
};

function smxPick(list, seed) {
  return list[Math.abs(seed) % list.length];
}

function smxTitleCase(text) {
  return String(text || "").trim().replace(/\s+/g, " ").replace(/\b([a-z])/g, (m, c) => c.toUpperCase());
}

/* ---------------- Product listing draft ---------------- */

function smxDraftListing({ name, category, price, description }) {
  const cat = SMX_CATEGORY_WORDS[category] ? category : "Other";
  const w = SMX_CATEGORY_WORDS[cat];
  const title = smxTitleCase(name);
  const extra = description ? " " + String(description).trim().replace(/\s+/g, " ") : "";
  const seed = title.length;
  const lead = {
    Electronics: `Upgrade your day with the ${title}.`,
    Fashion: `Step out in the ${title}.`,
    Home: `Bring comfort home with the ${title}.`,
    Beauty: `Treat yourself to the ${title}.`,
    Accessories: `Finish every look with the ${title}.`,
    Other: `Meet the ${title}.`
  }[cat];

  const words = title.toLowerCase().split(/\s+/).filter(word => word.length > 2);
  return {
    title,
    category: cat,
    price: Number(price) || 0,
    description: `${lead}${extra} ${smxPick(["Sold by a verified SMITHX seller", "Listed on SMITHX by a trusted seller", "Available now on SMITHX"], seed)} with ${w.promise}. Order today and track delivery from checkout to your door.`.replace(/\s+/g, " ").trim(),
    features: w.features,
    seo_keywords: Array.from(new Set([...words, cat.toLowerCase(), "buy " + words.slice(0, 2).join(" "), "kenya", "nairobi", "sm1thx"])).slice(0, 8),
    ad_caption: `${smxPick(["New on SMITHX", "Just listed", "Now available"], seed)}: ${title}${Number(price) ? " for KES " + Number(price).toLocaleString("en-KE") : ""}. ${smxPick(["Order now, delivered fast.", "Tap to shop before it sells out.", "Fast delivery across Kenya."], seed + 1)}`,
    source: "built-in"
  };
}

/* ---------------- Store concepts ---------------- */

function smxStoreConcepts({ name, sells, category, style, location }) {
  const cat = SMX_CATEGORY_WORDS[category] ? category : "Other";
  const w = SMX_CATEGORY_WORDS[cat];
  const st = SMX_STYLES[style] || SMX_STYLES.friendly;
  const what = String(sells || "").trim() || w.nouns[0];
  const where = String(location || "").trim() || "Kenya";
  const store = String(name || "").trim() || "our store";

  const taglines = {
    refined: [`Curated ${what}, delivered across ${where}.`, `${smxTitleCase(w.adjectives[0])} ${what}. Quietly exceptional.`, `Where quality ${what} meets great service.`],
    warm: [`Your friendly spot for ${what} in ${where}.`, `Great ${what}, real people, fast delivery.`, `${smxTitleCase(what)} you'll love — sorted.`],
    energetic: [`The boldest ${what} in ${where}.`, `Big energy. Better ${what}.`, `${smxTitleCase(what)} that turn heads.`],
    clean: [`${smxTitleCase(what)}. Simply done.`, `Less noise, better ${what}.`, `Good ${what}, honest prices.`],
    grounded: [`Thoughtful ${what} from ${where}.`, `${smxTitleCase(what)} made to last.`, `Good for you, good for ${where}.`]
  }[st.voice];

  const abouts = [
    `Welcome to ${store}. We sell ${what} — ${w.promise}. Every order is checked before it leaves us, and you can track it on SMITHX from checkout to delivery. Based in ${where}, delivering across Kenya.`,
    `${store} started with one goal: make it easy to find ${w.adjectives[1]} ${what} without the guesswork. Clear photos, honest descriptions and fast delivery. Questions? Message us any time.`,
    `At ${store}, we handpick ${what} we'd use ourselves. Expect ${w.adjectives[0]} quality, fair prices and friendly service. Pay with M-Pesa, card or SMX Credit, and get updates at every step.`
  ];

  return [0, 1, 2].map(i => {
    const theme = st.themes[i % st.themes.length];
    const layout = i === 2 ? (st.layout === "grid" ? "showcase" : "grid") : st.layout;
    return {
      id: "c" + i,
      theme,
      layout,
      tagline: taglines[i].slice(0, 80),
      description: abouts[i].slice(0, 600),
      promos: [
        `${smxPick(["New", "Fresh", "Just in"], i)} at ${store}: ${what} with ${w.promise}. Shop now on SMITHX.`,
        `Looking for ${what} in ${where}? ${store} has you covered. Pay with M-Pesa, delivered fast.`,
        `${smxTitleCase(w.adjectives[2])} ${what}, fair prices, tracked delivery. Visit ${store} on SMITHX today.`
      ]
    };
  });
}

/* =====================================================
   1. PRODUCT LISTING ASSISTANT (index.html)
===================================================== */

(function () {
  if (typeof generateProductListing !== "function") return;
  const box = document.getElementById("aiProductResult");
  if (!box) return;
  const template = box.innerHTML;

  function fill(data, builtIn) {
    box.innerHTML = template;
    box.style.display = "block";
    const set = (id, value) => { const el = document.getElementById(id); if (el) el.textContent = value; };
    set("aiGeneratedTitle", data.title || "");
    set("aiGeneratedDescription", data.description || "");
    set("aiGeneratedCategory", data.category || "");
    set("aiGeneratedPrice", Number(data.price) > 0 ? "KES " + Number(data.price).toLocaleString("en-KE") : "Set your price");
    const features = document.getElementById("aiGeneratedFeatures");
    if (features) {
      features.innerHTML = "";
      (Array.isArray(data.features) ? data.features : []).forEach(text => {
        const li = document.createElement("li");
        li.textContent = text;
        features.appendChild(li);
      });
    }
    set("aiGeneratedSEO", Array.isArray(data.seo_keywords) ? data.seo_keywords.join(", ") : data.seo_keywords || "");
    set("aiGeneratedAd", data.ad_caption || "");
    if (builtIn) {
      const note = document.createElement("p");
      note.className = "smx-ai-note";
      note.textContent = "Built-in draft — the SMITHX AI service is offline right now. Edit anything before you publish.";
      box.prepend(note);
    }
  }

  const original = window.generateProductListing;
  window.generateProductListing = async function () {
    const nameInput = document.getElementById("productName");
    if (!nameInput || !nameInput.value.trim()) return original();
    const before = typeof latestAIProduct !== "undefined" ? latestAIProduct : null;
    await original();
    const after = typeof latestAIProduct !== "undefined" ? latestAIProduct : null;

    if (after && after !== before && !after.error) {
      fill(after, false);
      return;
    }

    const draft = smxDraftListing({
      name: nameInput.value,
      category: (document.getElementById("productCategory") || {}).value,
      price: (document.getElementById("productPrice") || {}).value,
      description: (document.getElementById("productDescription") || {}).value
    });
    latestAIProduct = draft;
    fill(draft, true);
    if (typeof showToast === "function") showToast("Draft listing ready — review it below.");
  };

  const style = document.createElement("style");
  style.textContent = ".smx-ai-note{margin:0 0 12px;padding:10px 14px;border-radius:12px;background:#f3e3c2;color:#5f420e;font-size:.85rem;}";
  document.head.appendChild(style);
})();

/* =====================================================
   2. STORE ASSISTANT (profile.html)
===================================================== */

(function () {
  const form = document.getElementById("storeSetupForm");
  if (!form) return;

  const user = typeof smxCurrentUser === "function" ? smxCurrentUser() : null;
  const esc = value => String(value ?? "").replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));

  const panel = document.createElement("section");
  panel.className = "card smx-assist";
  panel.id = "storeAssistant";
  panel.innerHTML = `
    <div class="card-head">
      <h2 class="display">Store Assistant</h2>
      <span class="smx-assist-tag">Optional</span>
    </div>
    <p class="muted" style="font-size:.9rem;margin:-6px 0 14px;">Answer three quick questions and get store designs and promo captions. You choose what to keep — nothing is saved until you press <strong>Save store</strong>.</p>
    <div class="smx-assist-grid">
      <label class="field"><span>What do you sell?</span><input class="input" id="asSells" maxlength="60" placeholder="e.g. phones and accessories"></label>
      <label class="field"><span>Main category</span>
        <select class="input" id="asCategory">${Object.keys(SMX_CATEGORY_WORDS).map(c => `<option>${c}</option>`).join("")}</select>
      </label>
      <label class="field"><span>Store style</span>
        <select class="input" id="asStyle">${Object.entries(SMX_STYLES).map(([k, v]) => `<option value="${k}">${v.label}</option>`).join("")}</select>
      </label>
    </div>
    <button class="btn btn-primary" type="button" id="asGo">Suggest designs</button>
    <div id="asResults" class="smx-assist-results" aria-live="polite"></div>
    <p class="muted" style="font-size:.78rem;margin-top:12px;">Built-in suggestions. Smarter AI suggestions can be added once the SMITHX AI service is topped up.</p>`;
  form.insertAdjacentElement("afterend", panel);

  function setField(id, value) {
    const el = document.getElementById(id);
    if (!el) return;
    el.value = value;
    el.dispatchEvent(new Event("input", { bubbles: true }));
  }

  function storeName() {
    const typed = document.getElementById("stName").value.trim();
    if (typed) return typed;
    const sells = document.getElementById("asSells").value.trim();
    const first = user && user.name ? user.name.split(/\s+/)[0] : "My";
    return first + "'s " + smxTitleCase(sells || "Store");
  }

  function apply(concept) {
    if (!document.getElementById("stName").value.trim()) setField("stName", storeName());
    setField("stTagline", concept.tagline);
    setField("stAbout", concept.description);
    const theme = form.querySelector(`input[name="stTheme"][value="${concept.theme}"]`);
    if (theme) theme.checked = true;
    const layout = document.getElementById("stLayout");
    if (layout) layout.value = concept.layout;
    form.scrollIntoView({ behavior: "smooth", block: "start" });
    const msg = document.getElementById("storeMsg");
    if (msg) {
      msg.textContent = "Design applied to the form. Edit anything, then press Save store to approve it.";
      msg.className = "form-message show success";
    }
  }

  document.getElementById("asGo").addEventListener("click", () => {
    const concepts = smxStoreConcepts({
      name: storeName(),
      sells: document.getElementById("asSells").value,
      category: document.getElementById("asCategory").value,
      style: document.getElementById("asStyle").value,
      location: user ? user.location : ""
    });
    const results = document.getElementById("asResults");
    results.innerHTML = concepts.map((c, i) => {
      const t = (typeof SMX_STORE_THEMES !== "undefined" ? SMX_STORE_THEMES : {})[c.theme] || { accent: "#e8a33d", ink: "#16130f", label: c.theme };
      return `
        <article class="smx-concept">
          <div class="smx-concept-banner" style="background:${t.ink};">
            <span style="background:${t.accent};color:${t.ink};">${esc(storeName().replace(/[^A-Za-z0-9 ]/g, "").split(/\s+/).map(w => w[0]).join("").slice(0, 2).toUpperCase())}</span>
            <div><strong style="color:#fff;">${esc(storeName())}</strong><small style="color:${t.accent};">${esc(c.tagline)}</small></div>
          </div>
          <div class="smx-concept-body">
            <p class="smx-concept-meta">Design ${i + 1} · ${esc(t.label)} · ${esc(SMX_LAYOUTS[c.layout])}</p>
            <p class="smx-concept-about">${esc(c.description)}</p>
            <details>
              <summary>Promo captions (${c.promos.length})</summary>
              <ul>${c.promos.map(p => `<li><span>${esc(p)}</span><button type="button" class="smx-copy" data-copy="${esc(p)}">Copy</button></li>`).join("")}</ul>
            </details>
            <button type="button" class="btn btn-outline" data-apply="${i}">Use this design</button>
          </div>
        </article>`;
    }).join("");
    results.querySelectorAll("[data-apply]").forEach(button => button.addEventListener("click", () => apply(concepts[Number(button.dataset.apply)])));
    results.querySelectorAll("[data-copy]").forEach(button => button.addEventListener("click", async () => {
      try { await navigator.clipboard.writeText(button.dataset.copy); button.textContent = "Copied"; }
      catch (error) { window.prompt("Copy this caption:", button.dataset.copy); }
      setTimeout(() => { button.textContent = "Copy"; }, 1500);
    }));
  });

  const style = document.createElement("style");
  style.textContent = `
    .smx-assist { margin-bottom: 24px; display: grid; gap: 12px; }
    .smx-assist .card-head { margin-bottom: 0; }
    .smx-assist-tag { font-size: .72rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; padding: 5px 10px; border-radius: 999px; background: #f3e3c2; color: #8a5f14; }
    .smx-assist-grid { display: grid; grid-template-columns: 1.4fr 1fr 1fr; gap: 12px; }
    .smx-assist-grid .field span { font-size: .85rem; font-weight: 600; }
    .smx-assist > .btn { justify-self: start; }
    .smx-assist-results { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
    .smx-assist-results:empty { display: none; }
    .smx-concept { border: 1px solid var(--line, #e8e0d2); border-radius: 16px; overflow: hidden; background: #fff; display: flex; flex-direction: column; }
    .smx-concept-banner { display: flex; align-items: center; gap: 12px; padding: 18px 16px; }
    .smx-concept-banner > span { width: 44px; height: 44px; flex: 0 0 44px; display: grid; place-items: center; border-radius: 12px; font-weight: 700; }
    .smx-concept-banner div { display: grid; gap: 2px; min-width: 0; }
    .smx-concept-banner strong { font-size: 1.05rem; }
    .smx-concept-banner small { font-size: .78rem; }
    .smx-concept-body { padding: 14px 16px 16px; display: grid; gap: 10px; flex: 1; align-content: start; }
    .smx-concept-meta { font-size: .72rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: #8a5f14; }
    .smx-concept-about { font-size: .86rem; color: #3d372e; }
    .smx-concept details { font-size: .85rem; }
    .smx-concept summary { cursor: pointer; font-weight: 600; }
    .smx-concept ul { list-style: none; padding: 0; margin: 8px 0 0; display: grid; gap: 8px; }
    .smx-concept li { display: grid; grid-template-columns: 1fr auto; gap: 8px; align-items: start; padding: 8px 10px; border-radius: 10px; background: #f6f1e8; }
    .smx-copy { border: 1px solid rgba(22,19,15,.2); background: #fff; border-radius: 8px; padding: 4px 10px; font: inherit; font-size: .78rem; cursor: pointer; }
    .smx-concept .btn { margin-top: auto; }
    @media (max-width: 900px) { .smx-assist-results, .smx-assist-grid { grid-template-columns: 1fr; } }
  `;
  document.head.appendChild(style);
})();
