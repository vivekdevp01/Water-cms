import React, { useState, useEffect } from "react";
import { Calendar, MessageSquare, Activity } from "lucide-react";
import toast from "react-hot-toast";
import { offsiteRemovalStep } from "../../backend/services/complaintService";

const Step1 = ({ complaint, onSuccess }) => {
  const [plannedAt, setPlannedAt] = useState("");
  const [status, setStatus] = useState("Pending");
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);

  /* 🔄 PREFILL LIKE STEP-5 / STEP-6 */
  useEffect(() => {
    if (!complaint) return;

    const step81 = complaint.offsite?.step81_removal;
    const step6 = complaint.step6_finalOffer;

    if (step81?.plannedAt?.toDate) {
      setPlannedAt(step81.plannedAt.toDate().toISOString().split("T")[0]);
    } else if (step6?.actualAt?.toDate) {
      const d = new Date(step6.actualAt.toDate());
      d.setDate(d.getDate() + 1);
      setPlannedAt(d.toISOString().split("T")[0]);
    } else {
      setPlannedAt("");
    }
  }, [complaint]);

  const handleSubmit = async () => {
    setLoading(true);
    const toastId = toast.loading("Saving Component Removal...");

    try {
      await offsiteRemovalStep(complaint.id, {
        plannedAt, // auto OR edited
        status,
        remarks,
      });

      toast.success("Component removal saved", { id: toastId });
      onSuccess?.(); // move to Step 82
    } catch (err) {
      toast.error(err.message || "Failed to save step", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Planned Date */}
      <div className="space-y-1">
        <label className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
          <Calendar size={12} /> Planned Date
        </label>
        <input
          type="date"
          value={plannedAt}
          onChange={(e) => setPlannedAt(e.target.value)}
          className="w-full border rounded p-2 text-xs outline-none"
        />
      </div>

      {/* Status */}
      <div className="space-y-1">
        <label className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
          <Activity size={12} className="text-emerald-500" /> Execution Status
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full border rounded p-2 text-xs outline-none bg-white"
        >
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Done">Done</option>
          {/* <option value="On Hold">On Hold</option> */}
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
          placeholder="Process notes..."
          className="w-full border rounded p-2 text-xs outline-none"
        />
      </div>

      {/* Submit */}
      {/* <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`px-4 py-2 rounded-lg text-xs font-bold text-white ${
            loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Saving..." : "Confirm Removal"}
        </button>
      </div> */}
      <div className="flex flex-col items-end gap-2">
        {status === "Pending" && (
          <p className="text-[10px] text-amber-600 font-medium italic">
            * Please select a status other than "Pending" to save.
          </p>
        )}
        <button
          onClick={handleSubmit}
          // Button is disabled if: loading OR status is still "Pending"
          disabled={loading || status === "Pending"}
          className={`px-4 py-2 rounded-lg text-xs font-bold text-white transition-all ${
            loading || status === "Pending"
              ? "bg-gray-300 cursor-not-allowed opacity-80"
              : "bg-blue-600 hover:bg-blue-700 active:scale-95 shadow-sm"
          }`}
        >
          {loading ? "Saving..." : "Confirm Removal"}
        </button>
      </div>
    </div>
  );
};

export default Step1;
