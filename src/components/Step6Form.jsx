import React, { useState, useEffect } from "react";
import { Calendar, Clock, Bookmark, CheckCircle2, FileUp } from "lucide-react";
import toast from "react-hot-toast";
import { finalOfferAckStep } from "../backend/services/complaintService";
import { useNavigate } from "react-router-dom";


export const Step6Form = ({ complaint, onSuccess }) => {
  const navigate = useNavigate();
  /* STEP 6 STATES */
  const [finalCopy, setFinalCopy] = useState(null);
  const [step6_Planned, setStep6Planned] = useState("");
  const [step6_Status, setStep6Status] = useState("Draft");
  const [step6_Status2, setStep6Status2] = useState("");
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  /* 🔄 PREFILL */
  useEffect(() => {
    if (!complaint) return;

    const step6 = complaint.step6_finalOffer;
    const step5 = complaint.step5_siteVisit;

    setStep6Status(step6?.status || "Draft");
    setStep6Status2(step6?.status2 || "");

    // ✅ SAME LOGIC AS STEP-5
    if (step6?.plannedAt?.toDate) {
      setStep6Planned(step6.plannedAt.toDate().toISOString().split("T")[0]);
    } else if (step5?.actualAt?.toDate) {
      const d = new Date(step5.actualAt.toDate());
      d.setDate(d.getDate() + 1);
      setStep6Planned(d.toISOString().split("T")[0]);
    } else {
      setStep6Planned("");
    }
  }, [complaint]);

  /* ✅ SAVE STEP-6 */
  const handleSaveStep6 = async () => {
  if (!step6_Planned || !step6_Status2) {
    toast.error("Planned date & On-Site / Off-Site are mandatory");
    return;
  }

  setLoading(true);
  const toastId = toast.loading("Finalizing & deciding flow...");

  try {
    const finalCopyUrl = finalCopy ? `storage/final/${finalCopy.name}` : null;

    await finalOfferAckStep(complaint.id, {
      step6_Planned,
      step6_Status,
      status2: step6_Status2,
      finalCopyUrl,
    });

    toast.success("Final offer acknowledged & flow decided", {
      id: toastId,
    });

    onSuccess?.();

    // 🔀 REDIRECT BASED ON FLOW
    if (step6_Status2 === "Off-Site") {
      navigate("/offsite-mgmt");
    } else if (step6_Status2 === "On-Site") {
      navigate("/onsite-mgmt");
    }

  } catch (err) {
    console.error("Step-6 Error:", err);
    toast.error(err.message || "Failed to complete Step-6", {
      id: toastId,
    });
  } finally {
    setLoading(false);
  }

};

  return (
    <div className="space-y-4">
      {/* FINAL COPY */}
      <div>
        <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 mb-1.5">
          <FileUp size={14} className="text-blue-500" />
          Upload Final Copy
        </label>
        <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
          <p className="text-xs text-gray-500">
            {finalCopy ? finalCopy.name : "Click to upload Final Copy"}
          </p>
          <input
            type="file"
            className="hidden"
            onChange={(e) => setFinalCopy(e.target.files[0])}
            accept=".pdf,image/*"
          />
        </label>
      </div>

      {/* FINAL STATUS */}
      <div>
        <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 mb-1.5">
          <CheckCircle2 size={14} className="text-blue-500" />
          Final Status
        </label>
        <select
          value={step6_Status}
          onChange={(e) => setStep6Status(e.target.value)}
          className="w-full border rounded-lg py-2 px-3 text-sm bg-gray-50"
        >
          <option value="Draft">Draft</option>
          <option value="Submitted">Submitted</option>
          {/* <option value="Approved">Approved</option> */}
        </select>
      </div>

      {/* 🔑 FLOW DECISION */}
      <div>
        <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 mb-1.5">
          <CheckCircle2 size={14} className="text-blue-500" />
          Rectification Type <span className="text-red-500">*</span>
        </label>
        <select
          value={step6_Status2}
          onChange={(e) => setStep6Status2(e.target.value)}
          className="w-full border rounded-lg py-2 px-3 text-sm bg-gray-50"
        >
          <option value="" disabled>
            Select Type
          </option>
          <option value="On-Site">On-Site</option>
          <option value="Off-Site">Off-Site</option>
        </select>
      </div>

      {/* TIMELINE */}
      <div className="bg-slate-50 border border-blue-100 rounded-lg p-4 relative">
        <div className="absolute top-0 left-0 w-1 bg-blue-500 h-full rounded-l-lg"></div>
        <div className="space-y-1">
          <label className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <Calendar size={12} className="text-blue-400" />
            Planned Offer Date
          </label>

          <p className="text-[11px] text-gray-400 mb-1">
            Auto-generated from previous step. You may change it.
          </p>
        </div>
        <input
          type="date"
          min={today}
          value={step6_Planned}
          onChange={(e) => setStep6Planned(e.target.value)}
          className="w-full border rounded-md py-2 px-3 text-sm"
        />
      </div>
      {/* CONFIRMATION POPUP */}
      {showConfirm && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs">
          <p className="font-semibold text-slate-700">
            Are you sure you want to proceed with:
            <span className="text-amber-700 font-bold ml-1">
              {step6_Status2}
            </span>
            ?
          </p>

          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={() => setShowConfirm(false)}
              className="px-3 py-1.5 text-xs border rounded bg-white"
            >
              Cancel
            </button>

            <button
              onClick={() => {
                setShowConfirm(false);
                handleSaveStep6();
              }}
              className="px-3 py-1.5 text-xs bg-amber-600 text-white rounded"
            >
              Yes, Proceed
            </button>
          </div>
        </div>
      )}

      {/* SAVE */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowConfirm(true)}
          disabled={loading}
          className={`px-4 py-2 rounded-lg text-xs font-bold text-white flex items-center gap-2 ${
            loading
              ? "bg-gray-400"
              : "bg-amber-600 hover:bg-amber-700 active:scale-95"
          }`}
        >
          <Bookmark size={14} />
          {loading ? "Processing..." : "Confirm & Complete"}
        </button>
      </div>
    </div>
  );
};
