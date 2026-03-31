import React, { useState, useEffect } from "react";
import { Calendar, MessageSquare, Activity, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import { onsiteApprovalStep } from "../../backend/services/complaintService";

const Step2 = ({ complaintId, complaint, onSuccess }) => {
  const [plannedAt, setPlannedAt] = useState("");
  const [status, setStatus] = useState("Pending");
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);

  /* 🔄 AUTO PREFILL (SAME PATTERN AS OTHER STEPS) */
  useEffect(() => {
    if (!complaint) return;

    const step72 = complaint.onsite?.step72_approval;
    const step71 = complaint.onsite?.step71_indent;

    // 1️⃣ Already saved → use stored planned date
    if (step72?.plannedAt?.toDate) {
      setPlannedAt(step72.plannedAt.toDate().toISOString().split("T")[0]);
    }
    // 2️⃣ Else → previous step actual + 1 day
    else if (step71?.actualAt?.toDate) {
      const d = new Date(step71.actualAt.toDate());
      d.setDate(d.getDate() + 1);
      setPlannedAt(d.toISOString().split("T")[0]);
    } else {
      setPlannedAt("");
    }

    setStatus(step72?.status || "Pending");
    setRemarks(step72?.remarks || "");
  }, [complaint]);

  const handleSubmit = async () => {
    if (!plannedAt) {
      toast.error("Planned date is required");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Saving Approval Step...");

    try {
      await onsiteApprovalStep(complaintId, {
        plannedAt, // 🔥 auto OR edited
        status,
        remarks,
      });

      toast.success("Approval step saved", { id: toastId });
      onSuccess?.(); // 🔁 Firestore snapshot moves to Step-73
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to save step", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
        <CheckCircle size={14} className="text-blue-600" />
        Get approval from HOD / Commercial Head
      </div>

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

      {/* Status */}
      <div className="space-y-1">
        <label className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
          <Activity size={12} className="text-emerald-500" /> Approval Status
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full border rounded p-2 text-xs outline-none bg-white"
        >
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Approved">Approved</option>
          {/* <option value="Rejected">Rejected</option> */}
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
          placeholder="Approval notes..."
          className="w-full border rounded p-2 text-xs outline-none"
        />
      </div>

      {/* Submit */}
      <div className="flex justify-end">
        {/* <button
          onClick={handleSubmit}
          disabled={loading}
          className={`px-4 py-2 rounded-lg text-xs font-bold text-white transition ${
            loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Saving..." : "Confirm Approval Step"}
        </button> */}
        <div className="flex flex-col items-end gap-2">
        {status === "Pending" && (
          <p className="text-[10px] text-amber-600 font-medium">
            * Please update status from "Pending" to save
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
          {loading ? "Saving..." : "Confirm Approval Step"}
        </button>
      </div>
      </div>
    </div>
  );
};

export default Step2;
