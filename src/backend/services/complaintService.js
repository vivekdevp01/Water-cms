// import { db } from "../config/firebase";
// import {
//   collection,
//   addDoc,
//   Timestamp,
//   updateDoc,
//   doc,
// } from "firebase/firestore";
// import { STEPS } from "../constants/stepsConstant";

// /* ======================
//    CREATE COMPLAINT
// ====================== */
// export const createComplaint = async (data) => {
//   return await addDoc(collection(db, "complaints"), {
//     complaintDetails: {
//       ...data,
//       createdAt: Timestamp.now(),
//     },
//     step1_assignEngineer: {},
//     step2_warrantyCheck: {},
//     step3_siteVisit: {},
//     step4_consumable: {},
//     step5_payment: {},
//     step6_completion: {},
//     currentStep: STEPS.ASSIGN_ENGINEER,
//     status: "OPEN",
//   });
// };

// /* ======================
//    STEP 1 – ASSIGN ENGINEER
// ====================== */
// export const assignEngineerStep = async (complaintId, data) => {
//   if (!complaintId) {
//     throw new Error("Complaint ID is required");
//   }

//   return await updateDoc(doc(db, "complaints", complaintId), {
//     step1_assignEngineer: {
//       status: data.status || "Done", // Dropdown
//       assignedIsoNo: data.assignedIsoNo || null, // Input / dropdown
//       warrantyDate: data.warrantyDate
//         ? Timestamp.fromDate(new Date(data.warrantyDate))
//         : null,
//       division: data.division || null, // Dropdown
//       engineer: data.engineer || null, // Dropdown
//       nextFollowUpDate: data.nextFollowUpDate
//         ? Timestamp.fromDate(new Date(data.nextFollowUpDate))
//         : null,
//       remarks: data.remarks || null, // Textarea
//       actualTime: Timestamp.now(), // Auto (hidden)
//     },

//     // Move workflow forward
//     currentStep: STEPS.WARRANTY_CHECK,
//   });
// };

// /* ======================
//    STEP 2 – WARRANTY CHECK
// ====================== */
// export const warrantyCheckStep = async (complaintId, data) => {
//   if (!complaintId) {
//     throw new Error("Complaint ID is required");
//   }

//   return await updateDoc(doc(db, "complaints", complaintId), {
//     step2_warrantyCheck: {
//       status: data.status || "Done", // Done / Pending
//       warrantyStatus: data.warrantyStatus || null, // IN-W / OUT-W
//       enquiryFormFilled: !!data.enquiryFormFilled, // true / false
//       offerSent: !!data.offerSent, // true / false
//       nextFollowUpDate: data.nextFollowUpDate
//         ? Timestamp.fromDate(new Date(data.nextFollowUpDate))
//         : null,
//       remarks: data.remarks || null,
//       actualTime: Timestamp.now(), // auto
//     },

//     // Move workflow forward
//     currentStep: STEPS.SITE_VISIT,
//   });
// };

// /* ======================
//    STEP 3 – SITE VISIT
// ====================== */
// export const siteVisitStep = async (complaintId, data) => {
//   if (!complaintId) {
//     throw new Error("Complaint ID is required");
//   }
//   return await updateDoc(doc(db, "complaints", complaintId), {
//     step3_siteVisit: {
//       status: data.status || "Done",
//       nextFollowUpDate: data.nextFollowUpDate
//         ? Timestamp.fromDate(new Date(data.nextFollowUpDate))
//         : null,
//       remarks: data.remarks || null,
//       actualTime: Timestamp.now(),
//     },
//     currentStep: STEPS.CONSUMABLE_CHECK,
//   });
// };

// export const consumableCheckStep = async (complaintId, data) => {
//   if (!complaintId) {
//     throw new Error("Complaint ID is required");
//   }
//   return await updateDoc(doc(db, "complaints", complaintId), {
//     step4_consumable: {
//       consumableRequired:
//         data.consumableRequired === "Yes" || data.consumableRequired === true,
//       nextFollowUpDate: data.nextFollowUpDate
//         ? Timestamp.fromDate(new Date(data.nextFollowUpDate))
//         : null,
//       remarks: data.remarks || null,
//       actualTime: Timestamp.now(),
//     },

//     // Move workflow forward
//     currentStep: STEPS.PAYMENT,
//   });
// };

// /* ======================
//    STEP 5 – PAYMENT COLLECTION
// ====================== */
// export const paymentCollectionStep = async (complaintId, data) => {
//   if (!complaintId) {
//     throw new Error("Complaint ID is required");
//   }

//   return await updateDoc(doc(db, "complaints", complaintId), {
//     step5_payment: {
//       paymentCollected:
//         data.paymentCollected === "Yes" || data.paymentCollected === true,

//       supportDocMeta: data.supportDoc
//         ? {
//             fileName: data.supportDoc.name,
//             fileType: data.supportDoc.type,
//             fileSize: data.supportDoc.size,
//           }
//         : null,

//       nextFollowUpDate: data.nextFollowUpDate
//         ? Timestamp.fromDate(new Date(data.nextFollowUpDate))
//         : null,

//       remarks: data.remarks || null,
//       actualTime: Timestamp.now(),
//     },

//     // Move workflow forward
//     currentStep: STEPS.COMPLETION,
//   });
// };

// /* ======================
//    STEP 6 – COMPLETION / RESOLUTION
// ====================== */
// export const completionStep = async (complaintId, data) => {
//   if (!complaintId) {
//     throw new Error("Complaint ID is required");
//   }

//   return await updateDoc(doc(db, "complaints", complaintId), {
//     step6_completion: {
//       status: data.status || "Done", // Done / Pending / Archive
//       siteUploadMeta: data.siteUpload
//         ? {
//             fileName: data.siteUpload.name,
//             fileType: data.siteUpload.type,
//             fileSize: data.siteUpload.size,
//           }
//         : null,

//       nextFollowUpDate: data.nextFollowUpDate
//         ? Timestamp.fromDate(new Date(data.nextFollowUpDate))
//         : null,

//       remarks: data.remarks || null,
//       actualTime: Timestamp.now(),
//     },

//     // FINAL STATUS
//     status: "CLOSED",
//   });
// };
import { db } from "../config/firebase";
import {
  collection,
  addDoc,
  Timestamp,
  updateDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { STEPS } from "../constants/stepsConstant";

/* ======================
   CREATE COMPLAINT
====================== */
export const createComplaint = async (data) => {
  return await addDoc(collection(db, "complaints"), {
    complaintDetails: {
      ...data,
      createdAt: Timestamp.now(),
    },

    // Workflow control
    currentStep: STEPS.VERIFICATION,
    status: "OPEN",
    isClosed: false,
    flowType: null,

    // COMMON STEPS
    step1_verification: {},
    step2_assignment: {},
    step3_estimatedOffer: {},
    step4_responseAck: {},
    step5_siteVisit: {},
    step6_finalOffer: {},

    // ONSITE
    onsite: {
      step71_indent: {},
      step72_approval: {},
      step73_spareIssue: {},
    },

    // OFFSITE
    offsite: {
      step81_removal: {},
      step82_storeInward: {},
      step83_vendorShortlist: {},
      step84_vendorSelection: {},
      step85_po: {},
      step86_advance: {},
      step87_dispatch: {},
      step88_repair: {},
      step89_return: {},
      step90_qc: {},
      // step91_reinstall: {},
    },

    // SHARED END
    step8_rectification: {},
    step9_qa: {},
    step10_billing: {},
    step11_closure: {},
  });
};

const now = () => Timestamp.now();
// import { Timestamp } from "firebase/firestore";

// export const now = () => Timestamp.now();

export const addDays = (timestamp, days = 1) => {
  if (!timestamp) return null;
  const d = timestamp.toDate();
  d.setDate(d.getDate() + days);
  return Timestamp.fromDate(d);
};
export const resolvePlannedAt = ({
  userPlanned,
  prevActual,
  fallbackDays = 1,
}) => {
  if (userPlanned) {
    return Timestamp.fromDate(new Date(userPlanned));
  }

  if (prevActual) {
    return addDays(prevActual, fallbackDays);
  }

  return null;
};

/* ======================
   STEP 1 – VERIFICATION
====================== */
export const verificationStep = async (id, data) => {
  if (!id) throw new Error("Complaint ID is required");

  return await updateDoc(doc(db, "complaints", id), {
    step1_verification: {
      // Complaint Type
      complaintType: data.complaintType, // IW / OW / I-C

      // Bill details
      billDetails: {
        billNo: data.billDetails?.billNo || null,
        billDate: data.billDetails?.billDate
          ? Timestamp.fromDate(new Date(data.billDetails.billDate))
          : null,
        modelNo: data.billDetails?.modelNo || null,
      },

      // Dummy media metadata (NO Firebase Storage)
      mediaMeta: Array.isArray(data.mediaUrls)
        ? data.mediaUrls.map((path) => ({
            path,
            uploadedAt: now(),
          }))
        : [],

      // Remote resolution notes
      remoteResolutionNotes: data.remoteResolutionNotes || null,

      // Planned & actual
      plannedAt: data.step1_Planned
        ? Timestamp.fromDate(new Date(data.step1_Planned))
        : null,

      actualAt: now(),

      // Status from UI dropdown
      status: data.step1_Status || "Pending",
    },

    // 🔑 Move workflow forward (RULE-SAFE)
    currentStep: STEPS.ASSIGN_ENGINEER, // Step 2
  });
};

/* ======================
   STEP 2 – ASSIGN ENGINEER
====================== */
export const assignEngineerStep = async (id, data) => {
  if (!id) throw new Error("Complaint ID is required");

  const ref = doc(db, "complaints", id);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    throw new Error("Complaint not found");
  }

  const complaint = snap.data();

  return updateDoc(ref, {
    step2_assignment: {
      division: data.assignedDiv || null,
      engineerId: data.assignedEngineerId || null,
      status: data.step2_Status || "Unassigned",

      plannedAt: resolvePlannedAt({
        userPlanned: data.step2_Planned,
        prevActual: complaint.step1_verification?.actualAt,
      }),

      actualAt: now(),
      remarks: data.assignmentNotes || null,
    },

    currentStep: STEPS.ESTIMATED_OFFER,
  });
};

/* ======================
   STEP 3 – ESTIMATED OFFER
====================== */
export const estimatedOfferStep = async (id, data) => {
  if (!id) throw new Error("Complaint ID is required");

  const ref = doc(db, "complaints", id);
  const snap = await getDoc(ref);
  const complaint = snap.data();

  return updateDoc(ref, {
    step3_estimatedOffer: {
      quotationId: data.quotationId || null,
      estimatedCost: Number(data.estimatedCost) || 0,

      offerCopyMeta: data.offerCopyUrl
        ? { path: data.offerCopyUrl, uploadedAt: now() }
        : null,

      validUntil: data.validUntil
        ? Timestamp.fromDate(new Date(data.validUntil))
        : null,

      // 🔥 planned date auto OR override
      plannedAt: resolvePlannedAt({
        userPlanned: data.step3_Planned,
        prevActual: complaint.step2_assignment?.actualAt,
      }),

      actualAt: now(),
      status: data.step3_Status || "Draft",
    },

    currentStep: STEPS.RESPONSE_ACK,
    updatedAt: now(),
  });
};

/* ======================
   STEP 4 – RESPONSE ACK
====================== */
// import { getDoc } from "firebase/firestore";

export const responseAckStep = async (complaintId, data) => {
  if (!complaintId) throw new Error("Complaint ID is required");

  const ref = doc(db, "complaints", complaintId);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    throw new Error("Complaint not found");
  }

  const complaint = snap.data();

  return updateDoc(ref, {
    step4_responseAck: {
      acknowledgeCopyMeta: data.acknowledgeCopyUrl
        ? { path: data.acknowledgeCopyUrl, uploadedAt: now() }
        : null,

      poCopyMeta: data.poCopyUrl
        ? { path: data.poCopyUrl, uploadedAt: now() }
        : null,

      // 🔥 AUTO OR OVERRIDE
      plannedAt: resolvePlannedAt({
        userPlanned: data.step4_Planned,
        prevActual: complaint.step3_estimatedOffer?.actualAt,
      }),

      actualAt: now(),
      status: data.step4_Status || "Draft",
    },

    currentStep: STEPS.SITE_VISIT,
    updatedAt: now(),
  });
};

/* ======================
   STEP 5 – SITE VISIT
====================== */
export const siteVisitStep = async (complaintId, data) => {
  if (!complaintId) throw new Error("Complaint ID is required");

  const ref = doc(db, "complaints", complaintId);
  const snap = await getDoc(ref);

  if (!snap.exists()) throw new Error("Complaint not found");

  const complaint = snap.data();

  return updateDoc(ref, {
    step5_siteVisit: {
      siteVisitCopyMeta: data.siteVisitCopyUrl
        ? { path: data.siteVisitCopyUrl, uploadedAt: now() }
        : null,

      plannedAt: resolvePlannedAt({
        userPlanned: data.step5_Planned,
        prevActual: complaint.step4_responseAck?.actualAt,
      }),

      actualAt: now(),
      status: data.step5_Status || "Draft",
    },

    currentStep: STEPS.FINAL_OFFER_ACK,
    updatedAt: now(),
  });
};

/* ======================
   STEP 6 – FINAL OFFER ACK
====================== */
export const finalOfferAckStep = async (complaintId, data) => {
  if (!complaintId) throw new Error("Complaint ID is required");

  const ref = doc(db, "complaints", complaintId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("Complaint not found");

  const complaint = snap.data();

  // 🔑 Decide flow
  let flowType = null;
  let nextStep = null;

  if (data.status2 === "On-Site") {
    flowType = "ONSITE";
    nextStep = STEPS.ONSITE_INDENT; // 71
  } else if (data.status2 === "Off-Site") {
    flowType = "OFFSITE";
    nextStep = STEPS.OFFSITE_REMOVAL; // 81
  } else {
    throw new Error("Invalid Status-2 value");
  }

  return updateDoc(ref, {
    step6_finalOffer: {
      // ✅ AUTO OR OVERRIDE (SAME PATTERN)
      plannedAt: resolvePlannedAt({
        userPlanned: data.step6_Planned,
        prevActual: complaint.step5_siteVisit?.actualAt,
      }),

      actualAt: now(),

      finalCopyMeta: data.finalCopyUrl
        ? { path: data.finalCopyUrl, uploadedAt: now() }
        : null,

      status: data.step6_Status || "Draft",
      status2: data.status2,
      remarks: data.remarks || null,
    },

    flowType,
    currentStep: nextStep,
    updatedAt: now(),
  });
};

/* ======================
   STEP 7 – DECIDE FLOW
====================== */
// export const decideFlowStep = async (id, flowType) => {
//   if (!["ONSITE", "OFFSITE"].includes(flowType)) {
//     throw new Error("Invalid flow type");
//   }

//   return updateDoc(doc(db, "complaints", id), {
//     flowType,
//     currentStep:
//       flowType === "ONSITE" ? STEPS.ONSITE_INDENT : STEPS.OFFSITE_REMOVAL,
//   });
// };

//  offsite

/* ======================
    COMMON UTILITIES
====================== */
// export const buildStepPayload = (data) => ({
//   plannedAt: data.plannedAt
//     ? Timestamp.fromDate(new Date(data.plannedAt))
//     : null,

//   actualAt: Timestamp.now(),

//   status: data.status || "Pending",
//   remarks: data.remarks || null,

//   // timeDelay: data.timeDelay || null, // optional (can compute later)
// });

// export const offsiteRemovalStep = async (id, data) =>
//   updateDoc(doc(db, "complaints", id), {
//     "offsite.step81_removal": buildStepPayload(data),
//     currentStep: STEPS.OFFSITE_STORE_INWARD, // 82
//     updatedAt: now(),
//   });

export const offsiteRemovalStep = async (id, data) => {
  if (!id) throw new Error("Complaint ID is required");

  const ref = doc(db, "complaints", id);
  const snap = await getDoc(ref);

  if (!snap.exists()) throw new Error("Complaint not found");

  const complaint = snap.data();

  return updateDoc(ref, {
    "offsite.step81_removal": {
      plannedAt: resolvePlannedAt({
        userPlanned: data.plannedAt,
        prevActual: complaint.step6_finalOffer?.actualAt, // 🔑 SOURCE
      }),

      actualAt: now(),
      status: data.status || "Pending",
      remarks: data.remarks || null,
    },

    // 🔑 AUTO MOVE TO NEXT STEP
    currentStep: STEPS.OFFSITE_STORE_INWARD, // 82
    updatedAt: now(),
  });
};

export const offsiteStoreInwardStep = async (id, data) => {
  if (!id) throw new Error("Complaint ID is required");

  const ref = doc(db, "complaints", id);
  const snap = await getDoc(ref);

  if (!snap.exists()) throw new Error("Complaint not found");

  const complaint = snap.data();

  return updateDoc(ref, {
    "offsite.step82_storeInward": {
      plannedAt: resolvePlannedAt({
        userPlanned: data.plannedAt,
        prevActual: complaint.offsite?.step81_removal?.actualAt,
      }),

      actualAt: now(),
      status: data.status || "Pending",
      remarks: data.remarks || null,
    },

    currentStep: STEPS.OFFSITE_VENDOR_SHORTLIST, // 83
    updatedAt: now(),
  });
};

// import { doc, updateDoc, getDoc, Timestamp } from "firebase/firestore";
// import { db } from "../config/firebase";
// import { STEPS } from "../constants/stepsConstant";
// import { resolvePlannedAt } from "./complaintService"; // wherever you defined it

// const now = () => Timestamp.now();

export const offsiteVendorShortlistStep = async (id, data) => {
  if (!id) throw new Error("Complaint ID is required");

  const ref = doc(db, "complaints", id);
  const snap = await getDoc(ref);

  if (!snap.exists()) throw new Error("Complaint not found");

  const complaint = snap.data();

  return updateDoc(ref, {
    "offsite.step83_vendorShortlist": {
      plannedAt: resolvePlannedAt({
        userPlanned: data.plannedAt,
        prevActual: complaint.offsite?.step82_storeInward?.actualAt,
      }),

      actualAt: now(),
      status: data.status || "Pending",
      remarks: data.remarks || null,
    },

    currentStep: STEPS.OFFSITE_VENDOR_SELECTION, // 84
    updatedAt: now(),
  });
};

export const offsiteVendorSelectionStep = async (id, data) => {
  if (!id) throw new Error("Complaint ID is required");

  const ref = doc(db, "complaints", id);
  const snap = await getDoc(ref);

  if (!snap.exists()) throw new Error("Complaint not found");

  const complaint = snap.data();

  return updateDoc(ref, {
    "offsite.step84_vendorSelection": {
      plannedAt: resolvePlannedAt({
        userPlanned: data.plannedAt,
        prevActual: complaint.offsite?.step83_vendorShortlist?.actualAt,
      }),

      actualAt: now(),
      status: data.status || "Pending",
      remarks: data.remarks || null,
    },

    currentStep: STEPS.OFFSITE_PO, // 85
    updatedAt: now(),
  });
};

export const offsitePoIssuedStep = async (id, data) => {
  if (!id) throw new Error("Complaint ID is required");

  const ref = doc(db, "complaints", id);
  const snap = await getDoc(ref);

  if (!snap.exists()) throw new Error("Complaint not found");

  const complaint = snap.data();

  return updateDoc(ref, {
    "offsite.step85_po": {
      plannedAt: resolvePlannedAt({
        userPlanned: data.plannedAt,
        prevActual: complaint.offsite?.step84_vendorSelection?.actualAt,
      }),

      actualAt: now(),
      status: data.status || "Pending",
      remarks: data.remarks || null,
    },

    currentStep: STEPS.OFFSITE_ADVANCE, // 86
    updatedAt: now(),
  });
};

export const offsiteAdvancePaymentStep = async (id, data) => {
  if (!id) throw new Error("Complaint ID is required");

  const ref = doc(db, "complaints", id);
  const snap = await getDoc(ref);

  if (!snap.exists()) throw new Error("Complaint not found");

  const complaint = snap.data();

  return updateDoc(ref, {
    "offsite.step86_advance": {
      plannedAt: resolvePlannedAt({
        userPlanned: data.plannedAt,
        prevActual: complaint.offsite?.step85_po?.actualAt,
      }),

      actualAt: now(),
      status: data.status || "Pending",
      remarks: data.remarks || null,
    },

    currentStep: STEPS.OFFSITE_DISPATCH, // 87
    updatedAt: now(),
  });
};

export const offsiteDispatchStep = async (id, data) => {
  if (!id) throw new Error("Complaint ID is required");

  const ref = doc(db, "complaints", id);
  const snap = await getDoc(ref);

  if (!snap.exists()) throw new Error("Complaint not found");

  const complaint = snap.data();

  return updateDoc(ref, {
    "offsite.step87_dispatch": {
      plannedAt: resolvePlannedAt({
        userPlanned: data.plannedAt,
        prevActual: complaint.offsite?.step86_advance?.actualAt,
      }),

      actualAt: now(),
      status: data.status || "Pending",
      remarks: data.remarks || null,
    },

    currentStep: STEPS.OFFSITE_REPAIR, // 88
    updatedAt: now(),
  });
};

export const offsiteRepairStep = async (id, data) => {
  if (!id) throw new Error("Complaint ID is required");

  const ref = doc(db, "complaints", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("Complaint not found");

  const complaint = snap.data();

  return updateDoc(ref, {
    "offsite.step88_repair": {
      plannedAt: resolvePlannedAt({
        userPlanned: data.plannedAt,
        prevActual: complaint.offsite?.step87_dispatch?.actualAt,
      }),

      actualAt: now(),
      status: data.status || "Pending",
      remarks: data.remarks || null,
    },

    currentStep: STEPS.OFFSITE_RETURN, // 89
    updatedAt: now(),
  });
};

export const offsiteReturnStep = async (id, data) => {
  if (!id) throw new Error("Complaint ID is required");

  const ref = doc(db, "complaints", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("Complaint not found");

  const complaint = snap.data();

  return updateDoc(ref, {
    "offsite.step89_return": {
      plannedAt: resolvePlannedAt({
        userPlanned: data.plannedAt,
        prevActual: complaint.offsite?.step88_repair?.actualAt,
      }),

      actualAt: now(),
      status: data.status || "Pending",
      remarks: data.remarks || null,
    },

    currentStep: STEPS.OFFSITE_QC, // 90
    updatedAt: now(),
  });
};

export const offsiteQcStep = async (id, data) => {
  if (!id) throw new Error("Complaint ID is required");

  const ref = doc(db, "complaints", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("Complaint not found");

  const complaint = snap.data();

  return updateDoc(ref, {
    "offsite.step90_qc": {
      plannedAt: resolvePlannedAt({
        userPlanned: data.plannedAt,
        prevActual: complaint.offsite?.step89_return?.actualAt,
      }),

      actualAt: now(),
      status: data.status || "Pending",
      remarks: data.remarks || null,
    },

    currentStep: STEPS.ONSITE_RECTIFICATION, // 8
    updatedAt: now(),
  });
};

// onsite

export const onsiteIndentStep = async (complaintId, data) => {
  if (!complaintId) throw new Error("Complaint ID is required");

  const ref = doc(db, "complaints", complaintId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("Complaint not found");

  const complaint = snap.data();

  return updateDoc(ref, {
    "onsite.step71_indent": {
      plannedAt: resolvePlannedAt({
        userPlanned: data.plannedAt,
        prevActual: complaint.step6_finalOffer?.actualAt, // 🔥 FROM STEP-6
      }),

      actualAt: now(),
      status: data.status || "Pending",
      remarks: data.remarks || null,

      indentCopyMeta: data.indentFile
        ? {
            fileName: data.indentFile.name,
            fileType: data.indentFile.type,
            fileSize: data.indentFile.size,
            uploadedAt: now(),
          }
        : null,
    },

    currentStep: STEPS.ONSITE_APPROVAL, // 72
    updatedAt: now(),
  });
};

/* ======================
   MORE STEPS TO BE ADDED
====================== */
export const onsiteApprovalStep = async (complaintId, data) => {
  if (!complaintId) throw new Error("Complaint ID is required");

  const ref = doc(db, "complaints", complaintId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("Complaint not found");

  const complaint = snap.data();

  return updateDoc(ref, {
    "onsite.step72_approval": {
      plannedAt: resolvePlannedAt({
        userPlanned: data.plannedAt,
        prevActual: complaint.onsite?.step71_indent?.actualAt,
      }),

      actualAt: now(),
      status: data.status || "Pending",
      remarks: data.remarks || null,
    },

    currentStep: STEPS.ONSITE_SPARE_ISSUE, // 73
    updatedAt: now(),
  });
};

export const onsiteSpareIssueStep = async (complaintId, data) => {
  if (!complaintId) throw new Error("Complaint ID is required");

  const ref = doc(db, "complaints", complaintId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("Complaint not found");

  const complaint = snap.data();

  return updateDoc(ref, {
    "onsite.step73_spareIssue": {
      plannedAt: resolvePlannedAt({
        userPlanned: data.plannedAt,
        prevActual: complaint.onsite?.step72_approval?.actualAt,
      }),

      actualAt: now(),
      status: data.status || "Pending",
      remarks: data.remarks || null,
    },

    currentStep: STEPS.ONSITE_RECTIFICATION, // step 8
    updatedAt: now(),
  });
};
/* ======================
   STEP 8 – RECTIFICATION
====================== */
export const updateRectificationStep = async (complaintId, data) => {
  if (!complaintId) throw new Error("Complaint ID is required");

  const ref = doc(db, "complaints", complaintId);
  const snap = await getDoc(ref);

  if (!snap.exists()) throw new Error("Complaint not found");

  const complaint = snap.data();

  return updateDoc(ref, {
    step8_rectification: {
      // 👷 Delegated Engineer
      engineerName: data.engineerName || null,

      // 📅 Planned date (AUTO from previous step OR manual override)
      plannedAt: resolvePlannedAt({
        userPlanned: data.plannedAt,
        prevActual:
          complaint.flowType === "ONSITE"
            ? complaint.onsite?.step73_spareIssue?.actualAt
            : complaint.offsite?.step90_qc?.actualAt,
      }),

      // ⏱ Actual completion
      actualAt:now(),

      // 📌 Status
      status: data.status || "In Progress",

      remarks: data.remarks || null,
    },

    // 🔑 Move to QA
    currentStep: STEPS.QA, // Step 9
    updatedAt: now(),
  });
};
export const updateQAVerificationStep = async (id, data) => {
  if (!id) throw new Error("Complaint ID is required");

  const ref = doc(db, "complaints", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("Complaint not found");

  const complaint = snap.data();

  return updateDoc(ref, {
    step9_qa: {
      qaResult: data.qaResult || "PASS", // ✅ FIXED

      plannedAt: resolvePlannedAt({
        userPlanned: data.plannedAt,
        prevActual: complaint.step8_rectification?.actualAt,
      }),

      actualAt: now(),
      status: data.status || "Completed", // ✅ FIXED
      remarks: data.remarks || null,
    },

    currentStep: STEPS.BILLING, // step 10
    updatedAt: now(),
  });
};
export const updateBillingCollectionStep = async (id, data) => {
  if (!id) throw new Error("Complaint ID is required");

  const ref = doc(db, "complaints", id);
  const snap = await getDoc(ref);

  if (!snap.exists()) throw new Error("Complaint not found");

  const complaint = snap.data();

  /* 🛑 RULE GUARD */
  // if (complaint.currentStep !== STEPS.BILLING) {
  //   throw new Error("Complaint is not ready for billing");
  // }

  return updateDoc(ref, {
    step10_billing: {
      // invoiceNo: data.invoiceNo || null,
      // invoiceAmount: Number(data.invoiceAmount) || 0,

      // invoiceCopyMeta: data.invoiceCopyUrl
      //   ? { path: data.invoiceCopyUrl, uploadedAt: now() }
      //   : null,

      crmName: data.crmName || null,

      plannedAt: resolvePlannedAt({
        userPlanned: data.plannedAt,
        prevActual: complaint.step9_qa?.actualAt,
      }),

      actualAt: now(),
      status: data.status || "Invoice Pending",
      remarks: data.remarks || null,
    },

    /* ✅ MOVE TO FINAL STEP */
    currentStep: STEPS.CLOSURE, // 11
    updatedAt: now(),
  });
};
// export const updateClosureStep = async (id, data) => {
//   if (!id) throw new Error("Complaint ID is required");

//   const ref = doc(db, "complaints", id);
//   const snap = await getDoc(ref);

//   if (!snap.exists()) {
//     throw new Error("Complaint not found");
//   }

//   const complaint = snap.data();

//   /* 🛑 HARD GUARD — must already be at step 11 */
//   if (complaint.currentStep !== STEPS.CLOSURE) {
//     throw new Error("Complaint is not ready for closure");
//   }

//   return updateDoc(ref, {
//     step11_closure: {
//       closureType: data.closureType || "Resolved", // Resolved / Rejected / Cancelled
//       closureNotes: data.remarks || null,
//       actualAt: now(),
//     },

//     /* 🔐 FINAL STATE — NO STEP CHANGE */
//     status: "CLOSED",
//     isClosed: true,
//     updatedAt: now(),
//   });
// };
export const updateClosureStep = async (id, data) => {
  if (!id) throw new Error("Complaint ID is required");

  const ref = doc(db, "complaints", id);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    throw new Error("Complaint not found");
  }

  const complaint = snap.data();

  /* 🛑 HARD GUARD */
  if (complaint.currentStep !== STEPS.CLOSURE) {
    throw new Error("Complaint is not ready for closure");
  }

  return updateDoc(ref, {
    step11_closure: {
      ...(complaint.step11_closure || {}),

      plannedAt: data.plannedAt
        ? Timestamp.fromDate(new Date(data.plannedAt))
        : null,

      crmName: data.crmName || null,
      npsRating: Number(data.npsRating),

      closureStatus: data.status ,
      actualAt: now(), // ✅ SYSTEM CONTROLLED
    },

    /* 🔐 FINAL STATE */
    status: "CLOSED",
    isClosed: true,
    updatedAt: now(),
  });
};

export const rectificationStep = async (id, data) => {
  if (!id) throw new Error("Complaint ID is required");

  const ref = doc(db, "complaints", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("Complaint not found");

  const complaint = snap.data();

  return updateDoc(ref, {
    step8_rectification: {
      plannedAt: resolvePlannedAt({
        userPlanned: data.plannedAt,
        prevActual:
          complaint.flowType === "OFFSITE"
            ? complaint.offsite?.step90_qc?.actualAt
            : complaint.onsite?.step73_spareIssue?.actualAt,
      }),

      actualAt: now(),
      status: data.status || "Pending",
      remarks: data.remarks || null,
    },

    currentStep: STEPS.QA, // step 9
    updatedAt: now(),
  });
};

export const qaStep = async (id, data) => {
  if (!id) throw new Error("Complaint ID is required");

  const ref = doc(db, "complaints", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("Complaint not found");

  const complaint = snap.data();

  return updateDoc(ref, {
    step9_qa: {
      qaResult: data.qaResult || "PASS", // PASS / FAIL

      plannedAt: resolvePlannedAt({
        userPlanned: data.plannedAt,
        prevActual: complaint.step8_rectification?.actualAt,
      }),

      actualAt: now(),
      status: data.status || "Completed",
      remarks: data.remarks || null,
    },

    currentStep: STEPS.BILLING, // step 10
    updatedAt: now(),
  });
};
// export const billingStep = async (id, data) => {
//   if (!id) throw new Error("Complaint ID is required");

//   const ref = doc(db, "complaints", id);
//   const snap = await getDoc(ref);

//   if (!snap.exists()) throw new Error("Complaint not found");

//   const complaint = snap.data();

//   /* 🛑 RULE GUARD */
//   if (complaint.currentStep !== STEPS.BILLING) {
//     throw new Error("Complaint is not ready for billing");
//   }

//   return updateDoc(ref, {
//     step10_billing: {
//       // invoiceNo: data.invoiceNo || null,
//       // invoiceAmount: Number(data.invoiceAmount) || 0,

//       // invoiceCopyMeta: data.invoiceCopyUrl
//       //   ? { path: data.invoiceCopyUrl, uploadedAt: now() }
//       //   : null,

//       plannedAt: resolvePlannedAt({
//         userPlanned: data.plannedAt,
//         prevActual: complaint.step9_qa?.actualAt,
//       }),

//       actualAt: now(),
//       status: data.status || "Completed",
//       crmName: data.crmName || null,

//       remarks: data.remarks || null,
//     },

//     /* ✅ MOVE TO FINAL STEP */
//     currentStep: STEPS.CLOSURE, // 11
//     updatedAt: now(),
//   });
// };
export const billingStep = async (id, data) => {
  if (!id) throw new Error("Complaint ID is required");

  const ref = doc(db, "complaints", id);
  const snap = await getDoc(ref);

  if (!snap.exists()) throw new Error("Complaint not found");

  const complaint = snap.data();

  /* 🛑 RULE GUARD */
  // if (complaint.currentStep !== STEPS.BILLING) {
  //   throw new Error("Complaint is not ready for billing");
  // }

  return updateDoc(ref, {
    step10_billing: {
      crmName: data.crmName || null,

      status: data.status || "Invoice Pending",

      plannedAt: resolvePlannedAt({
        userPlanned: data.plannedAt, // 👈 from UI
        prevActual: complaint.step9_qa?.actualAt,
      }),

      actualAt: now(), // 👈 AUTO calculated

      remarks: data.remarks || null,
    },

    /* ✅ MOVE TO NEXT STEP */
    currentStep: STEPS.CLOSURE,
    updatedAt: now(),
  });
};

export const closureStep = async (id, data) => {
  if (!id) throw new Error("Complaint ID is required");

  const ref = doc(db, "complaints", id);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    throw new Error("Complaint not found");
  }

  const complaint = snap.data();

  /* 🛑 HARD GUARD — must already be at step 11 */
  if (complaint.currentStep !== STEPS.CLOSURE) {
    throw new Error("Complaint is not ready for closure");
  }

  return updateDoc(ref, {
    step11_closure: {
      closureType: data.closureType || "Resolved", // Resolved / Rejected / Cancelled
      closureNotes: data.remarks || null,
      actualAt: now(),
    },

    /* 🔐 FINAL STATE — NO STEP CHANGE */
    status: "CLOSED",
    isClosed: true,
    updatedAt: now(),
  });
};