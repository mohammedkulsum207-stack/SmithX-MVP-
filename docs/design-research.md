# SMITHX design research and storefront direction

**Reviewed:** 14 October 2026  
**Scope:** Public storefront, product discovery, shared visual language, seller-facing pages, auction page, mobile and accessibility.

## Executive decision

SMITHX should use a restrained monochrome identity: white canvas, near-black type and primary actions, a small number of neutral-grey surfaces, fine borders, and product photography as the main source of colour. The design should feel editorial and premium without sacrificing the speed and clarity expected of a multi-category marketplace.

The most important change is structural, not decorative: establish one shopping hierarchy, reduce competing visual treatments, and make product discovery the central task.

## Research reviewed

### Ecommerce usability and information architecture

- **Baymard Institute — Homepage and Category Navigation UX (2026 update, 13 October 2026):** https://baymard.com/research-articles/ecommerce-navigation-best-practice  
  The 2026 benchmark reports that 61% of desktop and 65% of mobile sites assessed perform mediocrely or poorly in homepage/category navigation. The practical implication for SMITHX is to make shopping categories, search and the route into products immediately clear.
- **Baymard Institute — Product Lists UX:** https://baymard.com/research/ecommerce-product-lists  
  Product lists need to support scanning and meaningful comparison; filters and sorting are part of the core shopping experience, not decorative extras.
- **Baymard Institute — Product-list best practices:** https://baymard.com/research-articles/current-state-product-list-and-filtering  
  Its 2025 benchmark reported mediocre-or-worse product-list UX on 58% of desktop and 78% of mobile sites assessed. The reviewed recommendations include essential filters where relevant and a visible overview of applied filters.
- **Nielsen Norman Group — Homepage, Navigation and Product Comparisons:** https://www.nngroup.com/reports/ecommerce-ux-homepages-and-category-pages/  
  The report emphasizes clear product organization, useful navigation, showing what the retailer sells and establishing trust.
- **Nielsen Norman Group — Search, Filters and Routing Pages:** https://www.nngroup.com/reports/ecommerce-ux-search-including-faceted-search/  
  Search results and listing pages must handle varied search intent and help users refine product sets.
- **Nielsen Norman Group — Product Pages:** https://www.nngroup.com/reports/ecommerce-ux-product-pages-including-reviews/  
  Product pages should make price, availability, product details, imagery and the purchase action easy to evaluate.

### Visual design, components and accessibility

- **TikTok Shop — Shop Tab 101 (2026):** https://seller-us.tiktok.com/university/essay?knowledge_id=603906625865518&lang=en  
  Its marketplace guidance describes search, category browsing, product recommendations and shop pages as distinct discovery paths. For SMITHX, this supports keeping direct catalogue search and category browsing prominent even as social commerce and auctions become part of the wider product.
- **TikTok Shop — High-quality product pages:** https://seller.tiktok.com/blog/title/10022408/  
  Seller guidance recommends clear product titles, high-quality product imagery and complete descriptions. The transferable lesson is to make listings informative and scannable; social-commerce-specific ranking claims are not assumed to apply to SMITHX.
- **Ecommerce redesign case study — Simply Natural:** https://blackfiremarketing.co.uk/case-studies/simply-natural  
  Illustrates the balance between an editorial, image-led storefront and the less-visible catalogue structure and product data needed to make a large store usable.
- **Ecommerce redesign case study — Shopify UX audit and redesign:** https://lauravardanyan.com/projects/shopify-ecom/  
  Emphasizes mobile-first layouts, clear product actions and a reusable component system.


- **Shopify — Ecommerce website design examples and 2026 trends:** https://www.shopify.com/blog/11863377-30-beautiful-and-creative-ecommerce-website-designs  
  Useful for comparative inspiration, but patterns should be selected for their shopping utility rather than copied wholesale.
- **Shopify — Product page examples and practices (2026):** https://www.shopify.com/blog/product-page  
  Product information, imagery, layout and clear next actions should work together to answer buying questions.
- **Smashing Magazine — Design-system components:** https://www.smashingmagazine.com/2022/12/anatomy-themed-design-system-components/  
  A consistent interface comes from reusable component decisions and semantic design tokens, not isolated styling patches.
- **Smashing Magazine — Rethinking pixel-perfect design:** https://shop.smashingmagazine.com/2026/01/rethinking-pixel-perfect-web-design/  
  Responsive design should follow reusable rules and tokens rather than brittle one-off dimensions.
- **W3C — WCAG 2.2:** https://www.w3.org/TR/wcag/  
  Normal text generally needs at least 4.5:1 contrast; meaningful UI controls and states need sufficient non-text contrast.
- **MDN — Reduced motion:** https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-reduced-motion  
  Non-essential motion should respect the visitor's operating-system preference.

## How sources were weighted

The review combined usability research, accessibility standards, commerce-platform guidance, and public storefront redesign case studies. Official research and platform documentation were weighted more heavily than creator opinions or trend roundups because they provide clearer methods, context, or directly applicable marketplace guidance.

YouTube, Instagram and TikTok were included in the discovery search. The most directly applicable, verifiable material returned was TikTok Shop's official guidance on marketplace discovery and listing quality. Public video/social results for the other platforms were too noisy or promotional to treat as reliable UX evidence on their own. Their visual trends should be used as inspiration only after the underlying shopping flow is sound.

## Repository findings

1. The storefront loads the base stylesheet plus several phase/add-on stylesheets and later overrides. That means the visual result depends on cascade order, not one clearly owned design system.
2. The base CSS still describes a beige/gold visual direction, while later files attempt to neutralize it. Some hard-coded auction badge and button colours can survive variable changes.
3. The homepage previously began with a small discovery heading and then went directly into search and products. It had little visual hierarchy to distinguish the marketplace from a generic catalogue.
4. Product-card spacing, image sizing and typography were declared in more than one stylesheet.
5. The project remains a prototype: browser-local account, listing, order and analytics behavior is not the same as a production commerce backend. Visual polish must not imply verified payments, shipping or buyer protection that has not been implemented.

## Design decisions

### Colour

| Role | Value | Use |
|---|---|---|
| Canvas | #FFFFFF | Main page background |
| Primary ink | #171717 | Headings, primary actions and key values |
| Secondary ink | #525252 | Secondary text and neutral controls |
| Muted text | #737373 | Labels and supporting copy |
| Surface | #F5F5F5 | Search fields, image wells and quiet panels |
| Border | #E5E5E5 | Card edges, dividers and input borders |
| Dark surface | #171717 | One deliberate featured action area, with white text |

No decorative gold, blue, green or red should be used as brand accents. Functional status distinctions must still be understandable through labels and text, not colour alone.

### Type and spacing

- Use the existing system sans-serif stack for a stable, fast-loading interface; do not add another remote font dependency just to make the page feel premium.
- Use a strong display scale for the main shopping headline, comfortable line-height for descriptions, and compact uppercase labels only for metadata.
- Use a consistent spacing rhythm based on 4px steps.
- Keep controls around 44px or taller for comfortable touch use.
- Use a restrained radius system: 12px controls and 15–16px cards. Avoid mixing many rounded-pill and oversized-card treatments.
- Product photos should dominate the product card; product titles, prices and actions should line up consistently.

### Homepage structure

1. Compact brand/navigation header.
2. Clear product-first headline and one-sentence explanation.
3. One secondary auction-discovery panel; no oversized vision/analytics/seller dashboard content on the shopping homepage.
4. Prominent search and cart access.
5. Clear category chips.
6. A labelled catalogue and consistent product grid.
7. Straightforward footer with prototype status stated accurately.

### Product discovery and responsive behavior

- Preserve existing search and category-filter JavaScript hooks.
- Use four columns on wide screens, three on medium screens and two on phones where the viewport allows it.
- Keep the search field and category controls obvious; on narrow screens, stack the cart action when horizontal space is insufficient.
- Keep product imagery in a consistent aspect ratio and make the whole image affordance keyboard-focusable.
- Future work should add genuine sort options, category-specific filters, applied-filter chips, pagination/loading states and robust empty states without faking unavailable backend behavior.

### Shared pages

- Keep the same monochrome palette, input contrast, button hierarchy, card borders and focus states on seller and auction pages.
- Keep seller analytics behind the seller role gate and separate from store management.
- Keep auction status/payment wording explicitly demo-only until server-authoritative bidding, settlement and payments exist.

## Implementation in this pass

- Added a dedicated, product-first visual hierarchy to the homepage.
- Added a monochrome auction discovery panel without turning the homepage into a promotional landing page.
- Standardized homepage search, category chips, catalogue label, product image ratio, card spacing and responsive grid density.
- Added shared neutral finishing rules for forms, cards, buttons and auction status badges.
- Recorded the source set and decisions here so future edits can follow a documented system rather than adding unrelated visual patches.

## Validation still required

- Inspect rendered pages on a real browser at mobile and desktop widths; automated CSS/static checks do not replace visual QA.
- Check keyboard navigation, focus visibility, zoom/reflow and contrast in the actual rendered interface.
- Verify every route and interaction after changes.
- Re-run CI and check the GitHub Pages preview after merge.
- Do not describe the marketplace as production-ready until its backend, database, authentication, order lifecycle and payment processing are implemented and verified.
