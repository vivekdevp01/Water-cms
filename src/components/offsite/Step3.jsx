import React, { useState, useEffect } from "react";
import { Calendar, MessageSquare, Activity } from "lucide-react";
import toast from "react-hot-toast";
import { offsiteVendorShortlistStep } from "../../backend/services/complaintService";

const Step3 = ({ complaint, complaintId, onSuccess }) => {
  const [plannedAt, setPlannedAt] = useState("");
  const [status, setStatus] = useState("Pending");
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);

  /* 🔄 AUTO PREFILL (LIKE STEP-1 & STEP-2) */
  useEffect(() => {
    if (!complaint) return;

    const step83 = complaint.offsite?.step83_vendorShortlist;
    const step82 = complaint.offsite?.step82_storeInward;

    if (step83?.plannedAt?.toDate) {
      setPlannedAt(step83.plannedAt.toDate().toISOString().split("T")[0]);
    } else if (step82?.actualAt?.toDate) {
      const d = new Date(step82.actualAt.toDate());
      d.setDate(d.getDate() + 1);
      setPlannedAt(d.toISOString().split("T")[0]);
    } else {
      setPlannedAt("");
    }

    setStatus(step83?.status || "Pending");
    setRemarks(step83?.remarks || "");
  }, [complaint]);

  const handleSubmit = async () => {
    setLoading(true);
    const toastId = toast.loading("Saving Vendor Shortlisting...");

    try {
      await offsiteVendorShortlistStep(complaintId, {
        plannedAt,
        status,
        remarks,
      });

      toast.success("Vendor shortlisting saved", { id: toastId });
      onSuccess?.(); // 🔥 Firestore moves to Step-84
    } catch (err) {
      toast.error(err.message || "Failed to save step", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Planned Date */}
      <div>
        <label className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
          <Calendar size={12} /> Planned Date
        </label>
        <input
          type="date"
          value={plannedAt}
          onChange={(e) => setPlannedAt(e.target.value)}
          className="w-full border rounded p-2 text-xs"
        />
      </div>

      {/* Status */}
      <div>
        <label className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
          <Activity size={12} /> Execution Status
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full border rounded p-2 text-xs bg-white"
        >
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Done">Done</option>
          {/* <option value="On Hold">On Hold</option> */}
          {/* <option value="Cancelled">Cancelled</option> */}
        </select>
      </div>

      {/* Remarks */}
      <div>
        <label className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
          <MessageSquare size={12} /> Remarks
        </label>
        <textarea
          rows={2}
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          className="w-full border rounded p-2 text-xs"
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

export default Step3;
