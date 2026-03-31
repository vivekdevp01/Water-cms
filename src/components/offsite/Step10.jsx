import React, { useEffect, useState } from "react";
import { ShieldCheck, Calendar, MessageSquare } from "lucide-react";
import toast from "react-hot-toast";
import { offsiteQcStep } from "../../backend/services/complaintService";
import { useNavigate } from "react-router-dom";


const Step10 = ({ complaintId, complaint, onSuccess }) => {
  const navigate = useNavigate();
  const [plannedAt, setPlannedAt] = useState("");
  const [qcResult, setQcResult] = useState("QC PASS");
  const [status, setStatus] = useState("Pending");
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);

  /* 🔄 AUTO PREFILL (LIKE OTHER STEPS) */
  useEffect(() => {
    if (!complaint) return;

    const step90 = complaint.offsite?.step90_qc;
    const step89 = complaint.offsite?.step89_return;

    // 1️⃣ Already saved
    if (step90?.plannedAt?.toDate) {
      setPlannedAt(step90.plannedAt.toDate().toISOString().split("T")[0]);
    }
    // 2️⃣ Auto from previous actualAt + 1 day
    else if (step89?.actualAt?.toDate) {
      const d = new Date(step89.actualAt.toDate());
      d.setDate(d.getDate() + 1);
      setPlannedAt(d.toISOString().split("T")[0]);
    } else {
      setPlannedAt("");
    }

    setStatus(step90?.status || "Pending");
    setRemarks(step90?.remarks || "");
  }, [complaint]);

  /* ✅ SAVE STEP-10 */
  const handleSubmit = async () => {
  if (!plannedAt) {
    toast.error("Planned date is required");
    return;
  }

  setLoading(true);
  const toastId = toast.loading("Saving QC details...");

  try {
    await offsiteQcStep(complaintId, {
      plannedAt,
      status,
      remarks: `${qcResult}${remarks ? " | " + remarks : ""}`,
    });

    toast.success("QC completed successfully", { id: toastId });

    onSuccess?.();

    // 🔀 FINAL REDIRECT
    navigate("/complaintFMS", {
      replace: true,
      state: { complaintId },
    });

  } catch (err) {
    console.error(err);
    toast.error(err.message || "Failed to save QC step", {
      id: toastId,
    });
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="space-y-4">
      {/* QC RESULT */}
      <div className="space-y-1">
        <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
          <ShieldCheck size={14} /> QC Result{" "}
          <span className="text-red-500">*</span>
        </label>
        <select
          value={qcResult}
          onChange={(e) => setQcResult(e.target.value)}
          className="w-full border rounded p-2 text-xs font-bold outline-none"
        >
          <option value="QC PASS" className="text-green-600">
            QC PASS
          </option>
          <option value="QC FAIL" className="text-red-600">
            QC FAIL
          </option>
        </select>
      </div>

      {/* PLANNED DATE */}
      <div className="space-y-1">
        <label className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
          <Calendar size={12} /> Planned Date{" "}
          <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          value={plannedAt}
          onChange={(e) => setPlannedAt(e.target.value)}
          className="w-full border rounded p-2 text-xs outline-none"
        />
      </div>

      {/* EXECUTION STATUS */}
      <div className="space-y-1">
        <label className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
          <span className="text-emerald-500">●</span> Execution Status{" "}
          <span className="text-red-500">*</span>
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full border border-slate-200 rounded p-2 text-xs outline-none bg-white"
        >
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
          {/* <option value="On Hold">On Hold / Delayed</option> */}
          {/* <option value="Cancelled">Cancelled</option> */}
        </select>
      </div>

      {/* REMARKS */}
      <div className="space-y-1">
        <label className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
          <MessageSquare size={12} /> Remarks
        </label>
        <textarea
          rows={2}
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder="Final inspection notes..."
          className="w-full border rounded p-2 text-xs outline-none"
        />
      </div>

      {/* SUBMIT */}
      {/* Submit */}
      <div className="flex flex-col items-end gap-2">
        {status === "Pending" && (
          <p className="text-[10px] text-amber-600 font-medium">
            * Change status from "Pending" to enable saving
          </p>
        )}
        <button
          onClick={handleSubmit}
          // Disable if loading OR if status is "Pending"
          disabled={loading || status === "Pending"}
          className={`px-4 py-2 rounded-lg text-xs font-bold text-white transition-all ${
            loading || status === "Pending"
              ? "bg-gray-300 cursor-not-allowed opacity-80"
              : "bg-blue-600 hover:bg-blue-700 active:scale-95 shadow-sm"
          }`}
        >
          {loading ? "Saving..." : "Confirm Store Inward"}
        </button>
      </div>
    </div>
  );
};

export default Step10;
