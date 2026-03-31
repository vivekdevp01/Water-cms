import React, { useState, useEffect } from "react";
import { RotateCcw, Calendar, MessageSquare } from "lucide-react";
import toast from "react-hot-toast";
import { offsiteReturnStep } from "../../backend/services/complaintService";

const Step9 = ({ complaintId, complaint, onSuccess }) => {
  const [plannedAt, setPlannedAt] = useState("");
  const [status, setStatus] = useState("Pending");
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);

  /* 🔄 PREFILL LIKE OTHER STEPS */
  useEffect(() => {
    if (!complaint) return;

    const step89 = complaint.offsite?.step89_return;
    const step88 = complaint.offsite?.step88_repair;

    // 1️⃣ Already saved → use it
    if (step89?.plannedAt?.toDate) {
      setPlannedAt(step89.plannedAt.toDate().toISOString().split("T")[0]);
    }
    // 2️⃣ Else auto from previous actualAt + 1 day
    else if (step88?.actualAt?.toDate) {
      const d = new Date(step88.actualAt.toDate());
      d.setDate(d.getDate() + 1);
      setPlannedAt(d.toISOString().split("T")[0]);
    }
    // 3️⃣ Else empty
    else {
      setPlannedAt("");
    }
  }, [complaint]);

  const handleSubmit = async () => {
    if (!plannedAt) {
      toast.error("Planned date is required");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Saving return details...");

    try {
      await offsiteReturnStep(complaintId, {
        plannedAt, // 🔑 auto OR edited
        status,
        remarks,
      });

      toast.success("Return step completed", { id: toastId });
      onSuccess?.(); // ➜ move to Step-10 (QC)
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to save return step", {
        id: toastId,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Planned Date */}
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

      {/* Execution Status */}
      <div className="space-y-1">
        <label className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
          <span className="text-emerald-500">●</span> Execution Status
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

      {/* Remarks */}
      <div className="space-y-1">
        <label className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
          <MessageSquare size={12} /> Remarks
        </label>
        <textarea
          rows={2}
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder="Return logistics notes..."
          className="w-full border rounded p-2 text-xs outline-none"
        />
      </div>

      {/* Submit */}
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

export default Step9;
