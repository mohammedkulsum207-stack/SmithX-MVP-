"use strict";

/* =====================================================
   SM1THX — CHECKOUT SETTINGS (checkout-config.js)
   One place to change delivery rates, fees and taxes.

   ⚠ DEMO VALUES. Delivery prices, the transaction fee
   and pickup points below are placeholders until the
   courier, payment provider and fee decisions are made.
   Change the numbers here — nothing else needs editing.
===================================================== */

window.SMX_CHECKOUT = {
  demo: true,
  currency: "KES",

  // Countries SM1THX can deliver to right now.
  deliveryCountries: ["Kenya"],

  delivery: {
    nairobi: {
      label: "Nairobi",
      options: {
        standard: { label: "Standard delivery", price: 250, eta: "1–2 business days", minDays: 1, maxDays: 2 },
        express:  { label: "Express delivery",  price: 500, eta: "Same day if ordered before 2 pm", minDays: 0, maxDays: 1 }
      }
    },
    other: {
      label: "Rest of Kenya",
      options: {
        standard: { label: "Standard delivery", price: 450, eta: "2–4 business days", minDays: 2, maxDays: 4 },
        express:  { label: "Express delivery",  price: 900, eta: "1–2 business days", minDays: 1, maxDays: 2 }
      }
    },
    pickup: {
      label: "Pick up",
      price: 0,
      eta: "Ready in 1–2 business days",
      minDays: 1,
      maxDays: 2,
      points: [
        "SM1THX Pickup — Nairobi CBD (demo)",
        "SM1THX Pickup — Westlands (demo)",
        "SM1THX Pickup — Mombasa (demo)"
      ]
    }
  },

  fees: {
    // Platform transaction fee charged to the buyer. Not decided yet, so 0.
    transactionPercent: 0,
    transactionFixed: 0,
    label: "Transaction fee"
  },

  tax: {
    label: "VAT",
    rate: 0.16,       // Kenya standard rate (KRA)
    included: true    // Item prices already include VAT where applicable
  },

  payment: {
    methods: {
      mpesa: { label: "M-Pesa", note: "Demo: no money moves. A live version will send an M-Pesa prompt to your phone." },
      card:  { label: "Card",   note: "Demo: SM1THX never asks for or stores card numbers. A live version will use the payment provider's secure page." }
    },
    // How long the demo "waiting for payment" step lasts (ms).
    demoDelayMs: 2500
  }
};

window.SMX_KENYA_COUNTIES = [
  "Nairobi", "Mombasa", "Kisumu", "Nakuru", "Kiambu", "Machakos", "Kajiado", "Uasin Gishu",
  "Baringo", "Bomet", "Bungoma", "Busia", "Elgeyo-Marakwet", "Embu", "Garissa", "Homa Bay",
  "Isiolo", "Kakamega", "Kericho", "Kilifi", "Kirinyaga", "Kisii", "Kitui", "Kwale", "Laikipia",
  "Lamu", "Makueni", "Mandera", "Marsabit", "Meru", "Migori", "Murang'a", "Nandi", "Narok",
  "Nyamira", "Nyandarua", "Nyeri", "Samburu", "Siaya", "Taita-Taveta", "Tana River",
  "Tharaka-Nithi", "Trans Nzoia", "Turkana", "Vihiga", "Wajir", "West Pokot"
];
