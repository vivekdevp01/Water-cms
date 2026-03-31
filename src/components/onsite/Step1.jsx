import React, { useState, useEffect } from "react";
import { Calendar, MessageSquare, Activity } from "lucide-react";
import toast from "react-hot-toast";
import { onsiteIndentStep } from "../../backend/services/complaintService";

const Step1 = ({ complaintId, complaint, onSuccess }) => {
  const [plannedAt, setPlannedAt] = useState("");
  const [status, setStatus] = useState("Pending");
  const [remarks, setRemarks] = useState("");
  const [indentFile, setIndentFile] = useState(null);
  const [loading, setLoading] = useState(false);

  /* 🔄 AUTO PREFILL (SAME AS OFFSITE) */
  useEffect(() => {
    if (!complaint) return;

    const step71 = complaint.onsite?.step71_indent;
    const step6 = complaint.step6_finalOffer;

    // 1️⃣ If already saved → show stored planned date
    if (step71?.plannedAt?.toDate) {
      setPlannedAt(step71.plannedAt.toDate().toISOString().split("T")[0]);
    }
    // 2️⃣ Else → auto from Step-6 actual + 1 day
    else if (step6?.actualAt?.toDate) {
      const d = new Date(step6.actualAt.toDate());
      d.setDate(d.getDate() + 1);
      setPlannedAt(d.toISOString().split("T")[0]);
    } else {
      setPlannedAt("");
    }

    setStatus(step71?.status || "Pending");
    setRemarks(step71?.remarks || "");
  }, [complaint]);

  const handleSubmit = async () => {
    if (!plannedAt) {
      toast.error("Planned date is required");
      return;
    }

    if (!indentFile && !complaint?.onsite?.step71_indent?.indentCopyMeta) {
      toast.error("Indent copy is required");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Saving Onsite Indent...");

    try {
      await onsiteIndentStep(complaintId, {
        plannedAt, // 🔥 auto OR edited
        status,
        remarks,
        indentFile,
      });

      toast.success("Onsite indent saved successfully", { id: toastId });
      onSuccess?.(); // 🔁 Firestore snapshot moves to Step-72
    } catch (err) {
      console.error(err);
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

      {/* Indent Copy */}
      <div className="space-y-1">
        <label className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
          📎 Indent Copy <span className="text-red-500">*</span>
        </label>
        <input
          type="file"
          onChange={(e) => setIndentFile(e.target.files[0])}
          className="w-full border rounded p-2 text-xs outline-none"
        />
        {indentFile && (
          <p className="text-[10px] text-green-600">
            Selected: {indentFile.name}
          </p>
        )}
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
      <div className="flex justify-end">
        {/* <button
          onClick={handleSubmit}
          disabled={loading}
          className={`px-4 py-2 rounded-lg text-xs font-bold text-white transition ${
            loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Saving..." : "Confirm Onsite Step"}
        </button> */}
        <button
          onClick={handleSubmit}
          // Button is disabled if: currently loading OR status is still "Pending"
          disabled={loading || status === "Pending"}
          className={`px-4 py-2 rounded-lg text-xs font-bold text-white transition-all ${
            loading || status === "Pending"
              ? "bg-gray-300 cursor-not-allowed opacity-70"
              : "bg-blue-600 hover:bg-blue-700 active:scale-95"
          }`}
        >
          {loading ? "Saving..." : "Confirm Onsite Step"}
        </button>
      </div>
    </div>
  );
};

export default Step1;
