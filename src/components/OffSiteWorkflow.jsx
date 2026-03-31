import React, { useEffect, useState } from "react";
import { X, Check, Lock } from "lucide-react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../backend/config/firebase";

/* OFFSITE STEP FORMS */
import Step1 from "./offsite/Step1";
import Step2 from "./offsite/Step2";
import Step3 from "./offsite/Step3";
import Step4 from "./offsite/Step4";
import Step5 from "./offsite/Step5";
import Step6 from "./offsite/Step6";
import Step7 from "./offsite/Step7";
import Step8 from "./offsite/Step8";
import Step9 from "./offsite/Step9";
import Step10 from "./offsite/Step10";

const OFFSITE_UI_STEPS = [
  { fs: 81, ui: 1, label: "Removal", Component: Step1 },
  { fs: 82, ui: 2, label: "Store Inward", Component: Step2 },
  { fs: 83, ui: 3, label: "Vendor Shortlist", Component: Step3 },
  { fs: 84, ui: 4, label: "Vendor Selection", Component: Step4 },
  { fs: 85, ui: 5, label: "PO Issued", Component: Step5 },
  { fs: 86, ui: 6, label: "Advance Payment", Component: Step6 },
  { fs: 87, ui: 7, label: "Dispatch", Component: Step7 },
  { fs: 88, ui: 8, label: "Repair", Component: Step8 },
  { fs: 89, ui: 9, label: "Return", Component: Step9 },
  { fs: 90, ui: 10, label: "QC", Component: Step10 },
];

const OffsiteUpdateModal = ({ complaintId, initialComplaint, onClose }) => {
  const [complaint, setComplaint] = useState(initialComplaint || null);

  useEffect(() => {
    if (!complaintId) return;
    const ref = doc(db, "complaints", complaintId);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          setComplaint({ id: snap.id, ...snap.data() });
        }
      },
      (err) => {
        console.error("Firestore error:", err);
      },
    );
    return unsub;
  }, [complaintId]);

  if (!complaint) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
        <div className="bg-white p-4 rounded text-sm">Loading complaint…</div>
      </div>
    );
  }

  const activeFsStep = Number(complaint.currentStep ?? 81);
  const stepConfig =
    OFFSITE_UI_STEPS.find((s) => s.fs === activeFsStep) || OFFSITE_UI_STEPS[0];
  const ActiveForm = stepConfig.Component;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[85vh]">
        {/* FIXED HEADER - Styled to match Step 1 */}
        <div className="bg-gradient-to-r from-[#f472b6] to-[#fb7185] px-5 py-4 flex justify-between items-center text-white shrink-0">
          <div>
            <h3 className="text-lg font-bold">Offsite Workflow</h3>
            <p className="text-[10px] opacity-90 leading-tight">
              Step by Step Update
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 transition rounded-full p-1"
          >
            <X size={22} strokeWidth={3} />
          </button>
        </div>

        {/* SCROLLABLE BODY */}
        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
          {/* COMPLAINT INFO */}
          <div className="bg-slate-50 p-3 rounded-lg text-sm space-y-1 border border-slate-200 text-slate-700">
            <p>
              <strong>Complaint ID:</strong> {complaint.id}
            </p>
            <p>
              <strong>Customer:</strong>{" "}
              {complaint.complaintDetails?.name || "—"}
            </p>
            <p>
              <strong>Product:</strong>{" "}
              {complaint.complaintDetails?.product || "—"}
            </p>
            <p>
              <strong>Workflow Status:</strong> Step {stepConfig.ui} of 10 —{" "}
              <span className="font-semibold text-slate-900">
                {stepConfig.label}
              </span>
            </p>
          </div>

          {/* STEP TABS: Matched perfectly with your first code */}
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {OFFSITE_UI_STEPS.map((s) => {
              const isActive = s.fs === activeFsStep;
              const isPast = s.fs < activeFsStep;
              const isFuture = s.fs > activeFsStep;

              return (
                <button
                  key={s.fs}
                  disabled={!isActive} // Only current step is interactive
                  className={`px-3 py-1.5 rounded text-xs font-bold border transition-all flex items-center gap-1.5 shadow-sm ${
                    isActive
                      ? "bg-amber-600 text-white border-amber-600 ring-2 ring-amber-600/20"
                      : isPast
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 opacity-80 cursor-not-allowed"
                        : "bg-slate-100 text-slate-400 border-slate-200 opacity-60 cursor-not-allowed"
                  }`}
                >
                  {isPast && (
                    <Check
                      size={12}
                      strokeWidth={3}
                      className="text-emerald-600"
                    />
                  )}
                  {isFuture && <Lock size={10} />}
                  Step {s.ui}
                </button>
              );
            })}
          </div>

          {/* FORM AREA */}
          <div className="mt-6">
            <ActiveForm complaint={complaint} complaintId={complaint.id} />
          </div>
        </div>

        {/* FIXED FOOTER */}
        <div className="flex justify-end gap-3 p-4 border-t bg-slate-50 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default OffsiteUpdateModal;
