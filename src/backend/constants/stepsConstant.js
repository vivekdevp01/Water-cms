// export const STEPS = {
//   ASSIGN_ENGINEER: 1,
//   WARRANTY_CHECK: 2,
//   SITE_VISIT: 3,
//   CONSUMABLE_CHECK: 4,
//   PAYMENT: 5,
//   COMPLETION: 6,
// };
// export const STEPSS = {
//   1: "Engineer Assignment",
//   2: "Warranty Verification",
//   3: "Site Visit",
//   4: "Consumable",
//   5: "Payment",
//   6: "Completed",
// };
export const STEPS = {
  // Common
  VERIFICATION: 1,
  ASSIGN_ENGINEER: 2,
  ESTIMATED_OFFER: 3,
  RESPONSE_ACK: 4,
  SITE_VISIT: 5,
  FINAL_OFFER_ACK: 6,
  // FLOW_DECISION: 7,

  // Onsite
  ONSITE_INDENT: 71,
  ONSITE_APPROVAL: 72,
  ONSITE_SPARE_ISSUE: 73,

  // Shared again
  ONSITE_RECTIFICATION: 8,
  QA: 9,
  BILLING: 10,
  CLOSURE: 11,

  // Offsite
  OFFSITE_REMOVAL: 81,
  OFFSITE_STORE_INWARD: 82,
  OFFSITE_VENDOR_SHORTLIST: 83,
  OFFSITE_VENDOR_SELECTION: 84,
  OFFSITE_PO: 85,
  OFFSITE_ADVANCE: 86,
  OFFSITE_DISPATCH: 87,
  OFFSITE_REPAIR: 88,
  OFFSITE_RETURN: 89,
  OFFSITE_QC: 90,
  // OFFSITE_REINSTALL: 91,
};

export const STEPSS = {
  1: "Verification",
  2: "Engineer Assignment",
  3: "Estimated Offer",
  4: "Response Acknowledgement",
  5: "Site Visit",
  6: "Final Offer Acknowledgement",
  // 7: "Onsite / Offsite Decision",

  71: "Indent",
  72: "HOD Approval",
  73: "Spare Issue",

  8: "Onsite Rectification",
  9: "QA Verification",
  10: "Billing",
  11: "Closure",

  81: "Component Removal",
  82: "Store Inward",
  83: "Vendor Shortlisting",
  84: "Vendor Selection",
  85: "PO Issuance",
  86: "Advance Payment",
  87: "Dispatch to Vendor",
  88: "Vendor Repair",
  89: "Vendor Return",
  90: "QC & Testing",
  // 91: "Re-installation",
};
