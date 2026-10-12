"use strict";

/* =====================================================
   SM1THX — INTERNATIONAL SETTINGS (intl-config.js)
   Phase 5. One place to edit markets, currencies and
   languages. Nothing here changes what customers are
   charged: every order is still charged in KES.

   Market status:
     "live"     — browse, buy and get delivery
     "waitlist" — browse with local-currency prices,
                  delivery not available yet; visitors can
                  join a waitlist (used to measure demand)

   Payment methods for new markets are NOT decided. They
   are listed as "To be decided" until a provider is chosen.
===================================================== */

window.SMX_INTL = {
  baseCurrency: "KES",

  /* Exchange rates (1 KES = x). Live rates are fetched from
     open.er-api.com (free, updated daily) and cached for
     12 hours. These built-in rates are used if that fails. */
  rates: {
    source: "https://www.exchangerate-api.com",
    sourceLabel: "Exchange Rate API",
    url: "https://open.er-api.com/v6/latest/KES",
    cacheHours: 12,
    fallbackDate: "2026-10-12",
    fallback: {
      KES: 1, USD: 0.007706, EUR: 0.006876, GBP: 0.005826,
      UGX: 31.329201, TZS: 20.350033, RWF: 11.376823, BIF: 23.068863,
      ETB: 1.243389, SSP: 45.131501, CDF: 17.850403, NGN: 10.251722,
      GHS: 0.090849, ZAR: 0.127308, AED: 0.028299
    }
  },

  currencies: {
    KES: { label: "Kenyan shilling", decimals: 0 },
    USD: { label: "US dollar", decimals: 2 },
    EUR: { label: "Euro", decimals: 2 },
    GBP: { label: "British pound", decimals: 2 },
    UGX: { label: "Ugandan shilling", decimals: 0 },
    TZS: { label: "Tanzanian shilling", decimals: 0 },
    RWF: { label: "Rwandan franc", decimals: 0 },
    BIF: { label: "Burundian franc", decimals: 0 },
    ETB: { label: "Ethiopian birr", decimals: 2 },
    SSP: { label: "South Sudanese pound", decimals: 0 },
    CDF: { label: "Congolese franc", decimals: 0 },
    NGN: { label: "Nigerian naira", decimals: 0 },
    GHS: { label: "Ghanaian cedi", decimals: 2 },
    ZAR: { label: "South African rand", decimals: 2 },
    AED: { label: "UAE dirham", decimals: 2 }
  },

  /* Names match the country list used at sign-up. */
  markets: [
    { name: "Kenya",        code: "KE", currency: "KES", status: "live",     region: "EAC", timezones: ["Africa/Nairobi"], payments: ["M-Pesa", "Card", "SMX Credit"] },
    { name: "Uganda",       code: "UG", currency: "UGX", status: "waitlist", region: "EAC", timezones: ["Africa/Kampala"] },
    { name: "Tanzania",     code: "TZ", currency: "TZS", status: "waitlist", region: "EAC", timezones: ["Africa/Dar_es_Salaam"] },
    { name: "Rwanda",       code: "RW", currency: "RWF", status: "waitlist", region: "EAC", timezones: ["Africa/Kigali"] },
    { name: "Burundi",      code: "BI", currency: "BIF", status: "waitlist", region: "EAC", timezones: ["Africa/Bujumbura"] },
    { name: "South Sudan",  code: "SS", currency: "SSP", status: "waitlist", region: "EAC", timezones: ["Africa/Juba"] },
    { name: "DR Congo",     code: "CD", currency: "CDF", status: "waitlist", region: "EAC", timezones: ["Africa/Kinshasa", "Africa/Lubumbashi"] },
    { name: "Somalia",      code: "SO", currency: "USD", status: "waitlist", region: "EAC", timezones: ["Africa/Mogadishu"] },
    { name: "Ethiopia",     code: "ET", currency: "ETB", status: "waitlist", region: "Africa", timezones: ["Africa/Addis_Ababa"] },
    { name: "Nigeria",      code: "NG", currency: "NGN", status: "waitlist", region: "Africa", timezones: ["Africa/Lagos"] },
    { name: "Ghana",        code: "GH", currency: "GHS", status: "waitlist", region: "Africa", timezones: ["Africa/Accra"] },
    { name: "South Africa", code: "ZA", currency: "ZAR", status: "waitlist", region: "Africa", timezones: ["Africa/Johannesburg"] },
    { name: "Other",        code: "XX", currency: "USD", status: "waitlist", region: "World", timezones: [] }
  ],

  languages: {
    en: { label: "English" },
    sw: { label: "Kiswahili (beta)" }
  },

  /* What we tell cross-border shoppers today. */
  customsNote: "Delivery outside Kenya isn't available yet. When it is, import duties and taxes will be shown at checkout before you pay. Within the East African Community, goods made in the EAC can qualify for duty-free entry, but VAT and other taxes can still apply."
};
