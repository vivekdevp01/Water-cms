import React, { useState, useEffect } from "react";
import { doc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "../backend/config/firebase";
import { Calendar, Clock, Bookmark, CheckCircle2, FileUp } from "lucide-react";
import toast from "react-hot-toast";
import { siteVisitStep } from "../backend/services/complaintService";

export const Step5Form = ({ complaint, onSuccess }) => {
  /* STEP 5 STATES */
  const [siteVisitCopy, setSiteVisitCopy] = useState(null);
  const [step5_Planned, setStep5Planned] = useState("");
  const [step5_Status, setStep5Status] = useState("Draft");
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  /* 🔄 PREFILL FROM FIREBASE */
  useEffect(() => {
    if (!complaint) return;

    const step5 = complaint.step5_siteVisit;
    const step4 = complaint.step4_responseAck;

    setStep5Status(step5?.status || "Draft");

    if (step5?.plannedAt?.toDate) {
      setStep5Planned(step5.plannedAt.toDate().toISOString().split("T")[0]);
    } else if (step4?.actualAt?.toDate) {
      const d = new Date(step4.actualAt.toDate());
      d.setDate(d.getDate() + 1);
      setStep5Planned(d.toISOString().split("T")[0]);
    } else {
      setStep5Planned("");
    }
  }, [complaint]);
  /* ✅ SAVE STEP-5 */
  const handleSaveStep5 = async () => {
    // if (!step5_Planned) {
    //   toast.error("Please fill all mandatory fields");
    //   return;
    // }

    setLoading(true);
    const toastId = toast.loading("Saving Site Visit Details...");

    try {
      const siteVisitCopyUrl = siteVisitCopy
        ? `storage/site-visit/${siteVisitCopy.name}`
        : null;

      const payload = {
        siteVisitCopyUrl,
        step5_Planned,
        step5_Actual: new Date().toISOString(),
        step5_Status,
      };

      await siteVisitStep(complaint.id, payload);

      toast.success("Site visit details saved successfully", { id: toastId });
      onSuccess?.(6); // move to Step-6
    } catch (err) {
      console.error("Step-5 Save Error:", err);
      toast.error("Failed to save site visit details", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* SITE VISIT COPY */}
      <div>
        <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 mb-1.5">
          <FileUp size={14} className="text-blue-500" />
          Upload Site Visit Copy
        </label>
        <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
          <p className="text-xs text-gray-500">
            {siteVisitCopy
              ? siteVisitCopy.name
              : "Click to upload Site Visit Copy"}
          </p>
          <input
            type="file"
            className="hidden"
            onChange={(e) => setSiteVisitCopy(e.target.files[0])}
            accept=".pdf,image/*"
          />
        </label>
      </div>

      {/* STATUS */}
      <div>
        <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 mb-1.5">
          <CheckCircle2 size={14} className="text-blue-500" />
          Site Visit Status <span className="text-red-500">*</span>
        </label>
        <select
          value={step5_Status}
          onChange={(e) => setStep5Status(e.target.value)}
          className="w-full border rounded-lg py-2 px-3 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none"
        >
          <option value="Draft">Draft</option>
          <option value="Scheduled">Scheduled</option>
          {/* <option value="Completed">Completed</option> */}
        </select>
      </div>

      {/* TIMELINE */}
      <div className="bg-slate-50 border border-blue-100 rounded-lg p-4 relative">
        <div className="absolute top-0 left-0 w-1 bg-blue-500 h-full rounded-l-lg"></div>

        <div className="flex items-center gap-2 mb-4">
          <Clock size={16} className="text-blue-600" />
          <h2 className="text-sm font-bold text-slate-700">
            Site Visit Timeline
          </h2>
        </div>

        <div className="space-y-1">
          <label className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <Calendar size={12} className="text-blue-400" />
            Planned Site Visit Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            min={today}
            value={step5_Planned}
            onChange={(e) => setStep5Planned(e.target.value)}
            className="w-full border rounded-md py-1.5 px-3 text-sm focus:ring-1 focus:ring-blue-400 outline-none"
          />
        </div>
      </div>

      {/* SAVE BUTTON */}
      <div className="flex justify-end">
        <button
          onClick={handleSaveStep5}
          disabled={loading}
          className={`px-4 py-2 rounded-lg text-xs font-bold text-white flex items-center gap-2 transition ${
            loading
              ? "bg-gray-400"
              : "bg-amber-600 hover:bg-amber-700 active:scale-95"
          }`}
        >
          <Bookmark size={14} />
          {loading ? "Saving..." : "Confirm Site Visit"}
        </button>
      </div>
    </div>
  );
};
