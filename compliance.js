/* SmithX compliance foundation. English only. */
const SMITHX_COMPLIANCE = {
  supportedCountries: {
    KE: {
      name: "Kenya",
      currency: "KES",
      sellerEligibility: {
        minimumAge: 18,
        requiredContact: ["email", "phone"],
        requiresIdentityVerificationForPayouts: true,
        acceptedIdentityDocuments: ["National ID", "Passport", "Business registration certificate"],
        notes: "Kenyan sellers must provide accurate contact details. Identity or business verification is required before payouts."
      },
      productRules: {
        prohibited: [
          "Illegal drugs and controlled substances",
          "Weapons, ammunition, and explosive devices",
          "Counterfeit or unauthorised branded goods",
          "Stolen goods",
          "Wildlife products and protected species items",
          "Human remains, body parts, or bodily fluids",
          "Hate speech, terrorist, or extremist material",
          "Sexual services or explicit sexual content",
          "Gambling services requiring an unlicensed operator",
          "Financial products requiring an unlicensed provider"
        ],
        restricted: [
          {
            category: "Alcohol",
            requirement: "Seller must hold applicable licences and comply with Kenyan age restrictions."
          },
          {
            category: "Medicines and health products",
            requirement: "Seller must be authorised and provide required product information."
          },
          {
            category: "Electronics with batteries",
            requirement: "Seller must provide safety information and comply with transport rules."
          },
          {
            category: "Food and consumables",
            requirement: "Seller must provide expiry dates, storage information, and applicable compliance details."
          }
        ]
      }
    }
  },
  defaultCountry: "KE",
  internationalTransactionsEnabled: false
};

function smithxGetCountryRules(countryCode) {
  const code = (countryCode || SMITHX_COMPLIANCE.defaultCountry).toUpperCase();
  return SMITHX_COMPLIANCE.supportedCountries[code] || null;
}

function smithxIsSellerEligible(countryCode, sellerProfile) {
  const rules = smithxGetCountryRules(countryCode);
  if (!rules) return { eligible: false, reason: "Country is not supported yet." };
  const profile = sellerProfile || {};
  const missing = [];
  if ((profile.age || 0) < rules.sellerEligibility.minimumAge) missing.push("Seller must meet the minimum age requirement.");
  rules.sellerEligibility.requiredContact.forEach(function (field) {
    if (!profile[field]) missing.push("Missing " + field + ".");
  });
  if (rules.sellerEligibility.requiresIdentityVerificationForPayouts && !profile.identityVerified) {
    missing.push("Identity or business verification is required before payouts.");
  }
  return { eligible: missing.length === 0, reasons: missing };
}

function smithxCheckProduct(countryCode, product) {
  const rules = smithxGetCountryRules(countryCode);
  if (!rules) return { allowed: false, status: "unsupported_country", reason: "Country is not supported yet." };
  const category = (product && product.category ? String(product.category) : "").toLowerCase();
  const prohibited = rules.productRules.prohibited.map(function (item) { return item.toLowerCase(); });
  if (prohibited.indexOf(category) !== -1) {
    return { allowed: false, status: "prohibited", reason: "This product category is prohibited on SmithX." };
  }
  const restricted = rules.productRules.restricted.find(function (rule) {
    return rule.category.toLowerCase() === category;
  });
  if (restricted) {
    return { allowed: true, status: "restricted", requirement: restricted.requirement };
  }
  return { allowed: true, status: "allowed" };
}
