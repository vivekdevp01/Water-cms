import React, { useState, useEffect } from "react";
import { doc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "../backend/config/firebase";
import {
  Calendar,
  Edit3,
  Clock,
  Bookmark,
  CheckCircle2,
  FileUp,
} from "lucide-react";
import toast from "react-hot-toast";
import { responseAckStep } from "../backend/services/complaintService";

export const Step4Form = ({ complaint, onSuccess }) => {
  /* STEP 4 STATES */
  const [ackCopy, setAckCopy] = useState(null);
  const [poCopy, setPoCopy] = useState(null);
  const [step4_Planned, setStep4Planned] = useState("");
  const [step4_Status, setStep4Status] = useState("Draft");
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  /* 🔄 PREFILL FROM FIREBASE */
  const addDays = (date, days = 1) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d.toISOString().split("T")[0];
  };

  useEffect(() => {
    if (!complaint) return;

    const step4 = complaint.step4_responseAck;
    const step3 = complaint.step3_estimatedOffer;

    setStep4Status(step4?.status || "Draft");

    // 🔥 PLANNED DATE DISPLAY LOGIC
    if (step4?.plannedAt?.toDate) {
      // already saved
      setStep4Planned(step4.plannedAt.toDate().toISOString().split("T")[0]);
    } else if (step3?.actualAt?.toDate) {
      // preview auto-generated
      setStep4Planned(addDays(step3.actualAt.toDate(), 1));
    } else {
      setStep4Planned("");
    }
  }, [complaint]);

  /* ✅ SAVE STEP-4 */
  const handleSaveStep4 = async () => {
    if (!step4_Status) {
      toast.error("Please fill all mandatory fields");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Saving Acceptance Details...");

    try {
      const acknowledgeCopyUrl = ackCopy
        ? `storage/acknowledge/${ackCopy.name}`
        : null;

      const poCopyUrl = poCopy ? `storage/po/${poCopy.name}` : null;

      const payload = {
        acknowledgeCopyUrl,
        poCopyUrl,
        step4_Planned: step4_Planned || null,
        step4_Actual: new Date().toISOString(),
        step4_Status,
      };

      await responseAckStep(complaint.id, payload);

      toast.success("Acceptance details saved successfully", { id: toastId });
      onSuccess?.(5); // move to Step-5
    } catch (err) {
      console.error("Step-4 Save Error:", err);
      toast.error("Failed to save acceptance details", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* ACKNOWLEDGE COPY */}
      <div>
        <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 mb-1.5">
          <FileUp size={14} className="text-blue-500" />
          Upload Acknowledge Copy
        </label>
        <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
          <p className="text-xs text-gray-500">
            {ackCopy ? ackCopy.name : "Click to upload Acknowledge Copy"}
          </p>
          <input
            type="file"
            className="hidden"
            onChange={(e) => setAckCopy(e.target.files[0])}
            accept=".pdf,image/*"
          />
        </label>
      </div>

      {/* PO COPY */}
      <div>
        <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 mb-1.5">
          <FileUp size={14} className="text-blue-500" />
          Upload PO Copy
        </label>
        <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
          <p className="text-xs text-gray-500">
            {poCopy ? poCopy.name : "Click to upload Purchase Order"}
          </p>
          <input
            type="file"
            className="hidden"
            onChange={(e) => setPoCopy(e.target.files[0])}
            accept=".pdf,image/*"
          />
        </label>
      </div>

      {/* STATUS */}
      <div>
        <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 mb-1.5">
          <CheckCircle2 size={14} className="text-blue-500" />
          Acceptance Status <span className="text-red-500">*</span>
        </label>
        <select
          value={step4_Status}
          onChange={(e) => setStep4Status(e.target.value)}
          className="w-full border rounded-lg py-2 px-3 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none"
        >
          <option value="Draft">Draft</option>
          <option value="Received">Received</option>
          <option value="Verified">Verified</option>
        </select>
      </div>

      {/* TIMELINE */}
      <div className="bg-slate-50 border border-blue-100 rounded-lg p-4 relative">
        <div className="absolute top-0 left-0 w-1 bg-blue-500 h-full rounded-l-lg"></div>

        <div className="flex items-center gap-2 mb-4">
          <Clock size={16} className="text-blue-600" />
          <h2 className="text-sm font-bold text-slate-700">
            Acceptance Timeline
          </h2>
        </div>

        <div className="space-y-1">
          <label className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <Calendar size={12} className="text-blue-400" />
            Planned Acceptance Date
          </label>

          <p className="text-[11px] text-gray-400 mb-1">
            Auto-generated from previous step. You may change it.
          </p>

          <input
            type="date"
            min={today}
            value={step4_Planned}
            onChange={(e) => setStep4Planned(e.target.value)}
            className="w-full border rounded-md py-1.5 px-3 text-sm focus:ring-1 focus:ring-blue-400 outline-none"
          />
        </div>
      </div>

      {/* SAVE BUTTON */}
      <div className="flex justify-end">
        <button
          onClick={handleSaveStep4}
          disabled={loading}
          className={`px-4 py-2 rounded-lg text-xs font-bold text-white flex items-center gap-2 transition ${
            loading
              ? "bg-gray-400"
              : "bg-amber-600 hover:bg-amber-700 active:scale-95"
          }`}
        >
          <Bookmark size={14} />
          {loading ? "Saving..." : "Confirm Acceptance"}
        </button>
      </div>
    </div>
  );
};
