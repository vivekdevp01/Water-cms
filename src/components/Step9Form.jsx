import React, { useState, useEffect } from "react";
import { Calendar, Clock, Bookmark, CheckCircle2, UserCheck, Timer, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import { updateQAVerificationStep } from "../backend/services/complaintService";

export const Step9Form = ({ complaint, onSuccess }) => {
  /* STEP 9 STATES */
  const [step9_Planned, setStep9Planned] = useState("");
  // const [step9_Actual, setStep9Actual] = useState("");
  const [step9_Status, setStep9Status] = useState("Pending Verification");
  const [qaEngineer, setQaEngineer] = useState("");
  const [loading, setLoading] = useState(false);
  // const [showConfirm, setShowConfirm] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  /* 🔄 PREFILL LOGIC */
  useEffect(() => {
    if (!complaint) return;

    const step9 = complaint.step9_qa;
    const step8 = complaint.step8_rectification;

    setStep9Status(step9?.status || "Pending Verification");
    setQaEngineer(step9?.engineerName || "");

    // ✅ ACTUAL DATE PREFILL
    // if (step9?.actualAt?.toDate) {
    //   setStep9Actual(step9.actualAt.toDate().toISOString().split("T")[0]);
    // }

    // ✅ PLANNED DATE LOGIC (T+1 from Step 8 or existing)
    if (step9?.plannedAt?.toDate) {
      setStep9Planned(step9.plannedAt.toDate().toISOString().split("T")[0]);
    } else if (step8?.actualAt?.toDate) {
      const d = new Date(step8.actualAt.toDate());
      d.setDate(d.getDate() + 1);
      setStep9Planned(d.toISOString().split("T")[0]);
    }
  }, [complaint]);

  /* ✅ SAVE STEP-9 */
  const handleSaveStep9 = async () => {
    if (!step9_Planned || !qaEngineer) {
      toast.error("Planned Date and QA Engineer Name are mandatory");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Recording QA Verification...");

    try {
      await updateQAVerificationStep(complaint.id, {
        plannedAt: step9_Planned,
        // actualAt: step9_Actual,
        status: step9_Status,
        engineerName: qaEngineer,
      });

      toast.success("QA Verification (Step 9) Completed", { id: toastId });
      onSuccess?.(); 
    } catch (err) {
      console.error("Step-9 Error:", err);
      toast.error(err.message || "Failed to update Step-9", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* QA DELEGATED ENGINEER */}
      <div>
        <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 mb-1.5">
          <UserCheck size={14} className="text-indigo-500" />
          Delegated QA Engineer <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={qaEngineer}
          onChange={(e) => setQaEngineer(e.target.value)}
          placeholder="Enter QA Engineer Name"
          className="w-full border rounded-lg py-2 px-3 text-sm bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none"
        />
      </div>

      {/* VERIFICATION STATUS */}
      <div>
        <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 mb-1.5">
          <ShieldCheck size={14} className="text-indigo-500" />
          Verification Result
        </label>
        <select
          value={step9_Status}
          onChange={(e) => setStep9Status(e.target.value)}
          className="w-full border rounded-lg py-2 px-3 text-sm bg-gray-50"
        >
          <option value="Pending Verification">Pending Verification</option>
          <option value="Verified & Passed">Verified & Passed</option>
          <option value="Failed - Re-work Required">Failed - Re-work Required</option>
        </select>
      </div>

      {/* TIMELINE SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* PLANNED DATE */}
        <div className="bg-slate-50 border border-indigo-100 rounded-lg p-4 relative">
          <div className="absolute top-0 left-0 w-1 bg-indigo-500 h-full rounded-l-lg"></div>
          <label className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
            <Calendar size={12} className="text-indigo-400" />
            Planned QA Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            min={today} // Restriction: Today and Upcoming only
            value={step9_Planned}
            onChange={(e) => setStep9Planned(e.target.value)}
            className="w-full border rounded-md py-2 px-3 text-sm focus:border-indigo-500 outline-none"
          />
        </div>

      </div>

      

      {/* SAVE BUTTON */}
      <div className="flex justify-end mt-2">
        <button
          onClick={handleSaveStep9}
          disabled={loading}
          className={`px-6 py-2 rounded-lg text-xs font-bold text-white flex items-center gap-2 transition-all ${
            loading
              ? "bg-gray-400"
              : "bg-indigo-600 hover:bg-indigo-700 active:scale-95 shadow-md hover:shadow-lg"
          }`}
        >
          <Bookmark size={14} />
          {loading ? "Saving..." : "Save QA Verification"}
        </button>
      </div>
    </div>
  );
};