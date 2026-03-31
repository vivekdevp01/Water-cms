import React, { useEffect, useState } from "react";
import { X, Check, Lock } from "lucide-react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../backend/config/firebase";
import toast from "react-hot-toast";

/* STEP FORMS */
import Step1 from "./onsite/Step1";
import Step2 from "./onsite/Step2";
import Step3 from "./onsite/Step3";

const ONSITE_UI_STEPS = [
  { fs: 71, ui: 1, label: "Fill Indent", Component: Step1 },
  { fs: 72, ui: 2, label: "HOD Approval", Component: Step2 },
  { fs: 73, ui: 3, label: "Spare Issue", Component: Step3 },
];

const OnSiteUpdateModal = ({ complaintId, initialComplaint, onClose }) => {
  const [complaint, setComplaint] = useState(initialComplaint || null);

  /* 🔴 REALTIME FIRESTORE */
  useEffect(() => {
    if (!complaintId) return;

    const ref = doc(db, "complaints", complaintId);
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setComplaint({ id: snap.id, ...snap.data() });
      }
    });

    return unsub;
  }, [complaintId]);

  if (!complaint) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm z-50">
        <div className="bg-white p-6 rounded-xl shadow-xl text-sm font-medium">
          Loading complaint details...
        </div>
      </div>
    );
  }

  const activeFsStep = Number(complaint.currentStep ?? 71);
  const stepConfig =
    ONSITE_UI_STEPS.find((s) => s.fs === activeFsStep) || ONSITE_UI_STEPS[0];
  const ActiveForm = stepConfig.Component;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[80vh]">
        {/* FIXED HEADER */}
        <div className="bg-gradient-to-r from-[#f472b6] to-[#fb7185] px-5 py-4 flex justify-between items-center text-white shrink-0">
          <div>
            <h3 className="text-lg font-bold">Onsite Workflow</h3>
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
          {/* COMPLAINT BASIC DETAILS */}
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
              <strong>Workflow Status:</strong> Step {stepConfig.ui} of{" "}
              {ONSITE_UI_STEPS.length} —{" "}
              <span className="font-semibold text-slate-900">
                {stepConfig.label}
              </span>
            </p>
          </div>

          {/* STEP TABS: Strict Sequential Logic with Icons */}
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {ONSITE_UI_STEPS.map((s) => {
              const isActive = s.fs === activeFsStep;
              const isPast = s.fs < activeFsStep;
              const isFuture = s.fs > activeFsStep;

              return (
                <button
                  key={s.fs}
                  disabled={!isActive} // Only the current step is clickable
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
            <ActiveForm complaintId={complaint.id} complaint={complaint} />
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

export default OnSiteUpdateModal;
