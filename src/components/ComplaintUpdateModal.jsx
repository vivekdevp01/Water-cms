import React, { useState, useEffect, useRef } from "react";
import { X, Lock, Check } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../backend/config/firebase";
import toast from "react-hot-toast";

import { Step1Form } from "./Step1Form";
import { Step2Form } from "./Step2Form";
import { Step3Form } from "./Step3Form";
import { Step4Form } from "./Step4Form";
import { Step5Form } from "./Step5Form";
import { Step6Form } from "./Step6Form";
import { Step8Form } from "./Step8Form";
import { Step9Form } from "./Step9Form";
import { Step10Form } from "./Step10Form";
import { Step11Form } from "./Step11Form";


const getWorkflowStageLabel = (complaint, stepIndex) => {
  // if (complaint.isClosed) return "Closed";

  const { flowType } = complaint;

  // Common flow
  if (stepIndex >= 1 && stepIndex <= 6) {
    const commonMap = {
      1: "Verification",
      2: "Assignment",
      3: "Estimated Offer",
      4: "Response Acknowledgement",
      5: "Site Visit",
      6: "Final Offer Decision",
    };
    return commonMap[stepIndex] || `Step ${stepIndex}`;
  }
  // 2. NOW check for Closed status for the final steps
  if (complaint.isClosed && stepIndex === 11) return "Closed";
  
  // Onsite flow
  if (flowType === "ONSITE") {
    const onsiteMap = {
      71: "Onsite → Indent Raised",
      72: "Onsite → Approval",
      73: "Onsite → Spare Issued",
      8: "Rectification",
      9: "QA Verification",
      10: "Billing",
      11: "Closure",
    };
    return onsiteMap[stepIndex] || "Onsite Process";
  }

  // Offsite flow
  if (flowType === "OFFSITE") {
    const offsiteMap = {
      81: "Offsite → Removal",
      82: "Offsite → Store Inward",
      83: "Offsite → Vendor Shortlist",
      84: "Offsite → Vendor Selection",
      85: "Offsite → PO Issued",
      86: "Offsite → Advance Paid",
      87: "Offsite → Dispatch",
      88: "Offsite → Repair",
      89: "Offsite → Return",
      90: "Offsite → QC",
      8: "Rectification",
      9: "QA Verification",
      10: "Billing",
      11: "Closure",
    };
    return offsiteMap[stepIndex] || "Offsite Process";
  }

  return "Unknown Stage";
};

export const ComplaintUpdateModal = ({ complaintId, onClose }) => {
  const [complaint, setComplaint] = useState(null);
  const [stepIndex, setStepIndex] = useState(1);
  const scrollRef = useRef(null);
  const STEPS = [1, 2, 3, 4, 5, 6, 8, 9, 10, 11];

  const fetchComplaint = async () => {
    try {
      const ref = doc(db, "complaints", complaintId);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setComplaint({ id: snap.id, ...snap.data() });
      } else {
        toast.error("Complaint not found");
      }
    } catch (err) {
      toast.error("Failed to load complaint", err);
    }
  };

  /* 🔥 FETCH COMPLAINT FROM FIRESTORE */

  /* INITIAL LOAD */
  useEffect(() => {
    fetchComplaint();
  }, [complaintId]);

  /* SYNC STEP INDEX WITH FIRESTORE */
  useEffect(() => {
    if (complaint?.currentStep) {
      setStepIndex(complaint.currentStep);
    }
  }, [complaint]);

  /* AUTO SCROLL TO TOP ON STEP CHANGE */
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }, [stepIndex]);

  /* 🔥 STEP SAVE HANDLER (MOST IMPORTANT PART) */
  const handleStepSave = async (nextStep) => {
    await fetchComplaint(); // 🔥 refresh Firestore data
    setStepIndex(nextStep); // 🔥 then move UI
  };

  if (!complaint) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* HEADER */}
        <div className="bg-gradient-to-r from-[#f472b6] to-[#fb7185] px-5 py-4 flex justify-between items-center text-white">
          <div>
            <h3 className="text-lg font-bold">Update Complaint</h3>
            <p className="text-[10px] opacity-90">Step by Step Update</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full p-1"
          >
            <X size={22} strokeWidth={3} />
          </button>
        </div>

        {/* BODY */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-5">
          {/* BASIC INFO */}
          <div className="bg-slate-50 p-3 rounded-lg text-sm space-y-1 border">
            <p>
              <strong>Complaint ID:</strong> {complaint.id}
            </p>
            <p>
              <strong>Customer:</strong> {complaint.complaintDetails?.name}
            </p>
            <p>
              <strong>Product:</strong> {complaint.complaintDetails?.product}
            </p>
            {/* <p>
              <strong>Workflow Status:</strong> Step {stepIndex} of 11
            </p> */}
            <p>
              <strong>Workflow Status:</strong>{" "}
              {getWorkflowStageLabel(complaint, stepIndex)}
            </p>
          </div>

          {/* STEP INDICATORS */}
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {[1, 2, 3, 4, 5, 6, 8, 9, 10, 11].map((i) => {
              const isActive = stepIndex === i;
              const currentIdx = STEPS.indexOf(stepIndex);
              // const isPast = STEPS.indexOf(i) < currentIdx;
              const iIdx = STEPS.indexOf(i);

              // Logic: 
              // 1. If we are within Step 1-11, standard comparison works.
              // 2. If stepIndex is 71-73 (Onsite) or 81-90 (Offsite), 
              //    steps 1-6 must be green (isPast = true).
              let isPast = false;
              if (currentIdx !== -1) {
      // Standard path logic
      isPast = iIdx < currentIdx;
    } else {
      // Branching path logic (Entering Step 7 Onsite/Offsite)
      // Since steps 71-90 are NOT in the STEPS array, currentIdx is -1.
      // If we are at step 71+, it means 1-6 are definitely finished.
      if (stepIndex > 6 && i <= 6) {
        isPast = true;
      }
      
      // If we've jumped past Step 7 back into Step 8, the standard logic 
      // above (currentIdx !== -1) will take over again.
    }

              return (
                <button
                  key={i}
                  disabled={!isActive}
                  className={`px-3 py-1.5 rounded text-xs font-bold border flex items-center gap-1.5 ${
                    isActive
                      ? "bg-amber-600 text-white"
                      : isPast
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {isPast && <Check size={12} />}
                  {!isPast && !isActive && <Lock size={10} />}
                  Step {i}
                </button>
              );
            })}
          </div>

          {/* FORMS */}
          <div className="mt-6">
            {stepIndex === 1 && (
              <Step1Form
                complaint={complaint}
                onSuccess={() => handleStepSave(2)}
              />
            )}
            {stepIndex === 2 && (
              <Step2Form
                complaint={complaint}
                onSuccess={() => handleStepSave(3)}
              />
            )}
            {stepIndex === 3 && (
              <Step3Form
                complaint={complaint}
                onSuccess={() => handleStepSave(4)}
              />
            )}
            {stepIndex === 4 && (
              <Step4Form
                complaint={complaint}
                onSuccess={() => handleStepSave(5)}
              />
            )}
            {stepIndex === 5 && (
              <Step5Form
                complaint={complaint}
                onSuccess={() => handleStepSave(6)}
              />
            )}
            {stepIndex === 6 && (
              <Step6Form
                complaint={complaint}
                onSuccess={() => handleStepSave(8)}
              />
            )}
            {stepIndex === 8 && (
              <Step8Form
                complaint={complaint}
                onSuccess={() => handleStepSave(9)}
              />
            )}
            {stepIndex === 9 && (
              <Step9Form
                complaint={complaint}
                onSuccess={() => handleStepSave(10)}
              />
            )}
            {stepIndex === 10 && (
              <Step10Form
                complaint={complaint}
                onSuccess={() => handleStepSave(11)}
              />
            )}
            {stepIndex === 11 && (
              <Step11Form
                complaint={complaint}
                onSuccess={() => toast.success("Workflow completed 🎉")}
              />
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex justify-end p-4 border-t bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-bold bg-white border rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComplaintUpdateModal;
