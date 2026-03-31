import React, { useState, useEffect } from "react";
import { Calendar, MessageSquare, Activity, Package } from "lucide-react";
import toast from "react-hot-toast";
import { onsiteSpareIssueStep } from "../../backend/services/complaintService";
import { useNavigate } from "react-router-dom";


const Step3 = ({ complaintId, complaint, onSuccess }) => {
  const navigate = useNavigate();
  const [plannedAt, setPlannedAt] = useState("");
  const [status, setStatus] = useState("Pending");
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);

  /* 🔄 AUTO PREFILL (CONSISTENT WITH OTHER STEPS) */
  useEffect(() => {
    if (!complaint) return;

    const step73 = complaint.onsite?.step73_spareIssue;
    const step72 = complaint.onsite?.step72_approval;

    // 1️⃣ Already saved → use stored planned date
    if (step73?.plannedAt?.toDate) {
      setPlannedAt(step73.plannedAt.toDate().toISOString().split("T")[0]);
    }
    // 2️⃣ Else → previous step actual + 1 day
    else if (step72?.actualAt?.toDate) {
      const d = new Date(step72.actualAt.toDate());
      d.setDate(d.getDate() + 1);
      setPlannedAt(d.toISOString().split("T")[0]);
    } else {
      setPlannedAt("");
    }

    setStatus(step73?.status || "Pending");
    setRemarks(step73?.remarks || "");
  }, [complaint]);

  const handleSubmit = async () => {
  if (!plannedAt) {
    toast.error("Planned date is required");
    return;
  }

  setLoading(true);
  const toastId = toast.loading("Saving Spare Receipt Step...");

  try {
    await onsiteSpareIssueStep(complaintId, {
      plannedAt,
      status,
      remarks,
    });

    toast.success("Spare receipt step saved", { id: toastId });

    onSuccess?.();

    // ✅ REDIRECT TO FMS
    navigate("/complaintFMS", {
      replace: true,
      state: { complaintId }, // optional but recommended
    });

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
        <Package size={14} className="text-blue-600" />
        Take / receive the spare from central godown
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
          <Activity size={12} className="text-emerald-500" /> Execution Status
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full border rounded p-2 text-xs outline-none bg-white"
        >
          <option value="Pending">Pending</option>
          {/* <option value="In Transit">In Transit</option> */}
          <option value="Received">Received</option>
          {/* <option value="Issue Raised">Issue Raised</option> */}
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
          placeholder="Spare collection / receipt notes..."
          className="w-full border rounded p-2 text-xs outline-none"
        />
      </div>

      {/* Submit */}
      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`px-4 py-2 rounded-lg text-xs font-bold text-white transition ${
            loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Saving..." : "Confirm Spare Receipt"}
        </button>
      </div>
    </div>
  );
};

export default Step3;
