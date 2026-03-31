import React, { useState, useEffect } from "react";
import { Calendar, Clock, Bookmark, CheckCircle2, UserCheck, Timer }  from "lucide-react";
import toast from "react-hot-toast";
import { updateRectificationStep } from "../backend/services/complaintService";

export const Step8Form = ({ complaint, onSuccess }) => {
  /* STEP 8 STATES */
  const [step8_Planned, setStep8Planned] = useState("");
  // const [step8_Actual, setStep8Actual] = useState("");
  const [step8_Status, setStep8Status] = useState("In Progress");
  const [delegatedEngineer, setDelegatedEngineer] = useState("");
  const [loading, setLoading] = useState(false);
  // const [showConfirm, setShowConfirm] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  /* 🔄 PREFILL LOGIC */
  // Load existing data when complaint prop changes
  useEffect(() => {
    if (!complaint) return;

    const step8 = complaint.step8_rectification;
    const step7 = complaint.flowType === "ONSITE" 
      ? complaint.onsite?.step73_spareIssue 
      : complaint.offsite?.step90_qc;

    setStep8Status(step8?.status || "In Progress");
    setDelegatedEngineer(step8?.engineerName || "");

    // ✅ ACTUAL DATE PREFILL
    // if (step8?.actualAt?.toDate) {
    //   setStep8Actual(step8.actualAt.toDate().toISOString().split("T")[0]);
    // }

    // ✅ PLANNED DATE LOGIC (T+1 from previous step or existing)
    if (step8?.plannedAt?.toDate) {
      setStep8Planned(step8.plannedAt.toDate().toISOString().split("T")[0]);
    } else if (step7?.actualAt?.toDate) {
      const d = new Date(step7.actualAt.toDate());
      d.setDate(d.getDate() + 1);
      setStep8Planned(d.toISOString().split("T")[0]);
    }
  }, [complaint]);

  /* ✅ SAVE STEP-8 */
  const handleSaveStep8 = async () => {
    if (!step8_Planned || !delegatedEngineer) {
      toast.error("Planned Date and Engineer Name are mandatory");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Updating Rectification details...");

    try {
      await updateRectificationStep(complaint.id, {
        plannedAt: step8_Planned,
        // actualAt: step8_Actual,
        status: step8_Status,
        engineerName: delegatedEngineer,
      });

      toast.success("Rectification (Step 8) Completed", { id: toastId });
      onSuccess?.(); 
    } catch (err) {
      console.error("Step-8 Error:", err);
      toast.error(err.message || "Failed to update Step-8", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* DELEGATED ENGINEER */}
      <div>
        <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 mb-1.5">
          <UserCheck size={14} className="text-blue-500" />
          Delegated Engineer <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={delegatedEngineer}
          onChange={(e) => setDelegatedEngineer(e.target.value)}
          placeholder="Enter Engineer Name"
          className="w-full border rounded-lg py-2 px-3 text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      {/* RECTIFICATION STATUS */}
      <div>
        <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 mb-1.5">
          <CheckCircle2 size={14} className="text-blue-500" />
          Work Status
        </label>
        <select
          value={step8_Status}
          onChange={(e) => setStep8Status(e.target.value)}
          className="w-full border rounded-lg py-2 px-3 text-sm bg-gray-50"
        >
          <option value="In Progress">In Progress</option>
          {/* <option value="Partially Completed">Partially Completed</option> */}
          <option value="Completed">Completed</option>
          {/* <option value="On Hold">On Hold</option> */}
        </select>
      </div>

      {/* TIMELINE SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* PLANNED DATE */}
        <div className="bg-slate-50 border border-blue-100 rounded-lg p-4 relative">
          <div className="absolute top-0 left-0 w-1 bg-blue-500 h-full rounded-l-lg"></div>
          <label className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
            <Calendar size={12} className="text-blue-400" />
            Planned Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            min={today} // 📅 Restrictions: Today and Upcoming only
            value={step8_Planned}
            onChange={(e) => setStep8Planned(e.target.value)}
            className="w-full border rounded-md py-2 px-3 text-sm focus:border-blue-500 outline-none"
          />
        </div>

        {/* ACTUAL DATE */}
        {/* <div className="bg-slate-50 border border-emerald-100 rounded-lg p-4 relative">
          <div className="absolute top-0 left-0 w-1 bg-emerald-500 h-full rounded-l-lg"></div>
          <label className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
            <Timer size={12} className="text-emerald-400" />
            Actual Completion Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={step8_Actual}
            onChange={(e) => setStep8Actual(e.target.value)}
            className="w-full border rounded-md py-2 px-3 text-sm focus:border-emerald-500 outline-none"
          />
        </div> */}
      </div>

      {/* CONFIRMATION POPUP */}
      {/* {showConfirm && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs">
          <p className="font-semibold text-slate-700">
            Confirm Step 8: Rectification completion for 
            <span className="text-blue-700 font-bold ml-1">{delegatedEngineer || "the assigned engineer"}</span>?
          </p>
          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={() => setShowConfirm(false)}
              className="px-3 py-1.5 text-xs border rounded bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setShowConfirm(false);
                handleSaveStep8();
              }}
              className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Confirm Update
            </button>
          </div>
        </div>
      )} */}

      {/* SAVE BUTTON */}
      {/* SAVE BUTTON - NOW CALLS handleSaveStep8 DIRECTLY */}
      <div className="flex justify-end mt-2">
        <button
          onClick={handleSaveStep8}
          disabled={loading}
          className={`px-6 py-2 rounded-lg text-xs font-bold text-white flex items-center gap-2 transition-all ${
            loading
              ? "bg-gray-400"
              : "bg-blue-600 hover:bg-blue-700 active:scale-95 shadow-md hover:shadow-lg"
          }`}
        >
          <Bookmark size={14} />
          {loading ? "Saving..." : "Save Step 8 Details"}
        </button>
      </div>
    </div>
  );
};