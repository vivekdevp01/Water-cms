import React, { useState, useEffect } from "react";
import { doc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "../backend/config/firebase";
import {
  Calendar,
  Edit3,
  Clock,
  Bookmark,
  CheckCircle2,
  Hash,
  IndianRupee,
  FileUp,
} from "lucide-react";
import toast from "react-hot-toast";
import { estimatedOfferStep } from "../backend/services/complaintService";

export const Step3Form = ({ complaint, onSuccess }) => {
  // Step 3 Fields (Quotation Logic)
  const addDays = (date, days = 1) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d.toISOString().split("T")[0];
  };
  const [quotationId, setQuotationId] = useState("");
  const [estimatedCost, setEstimatedCost] = useState("");
  const [offerFile, setOfferFile] = useState(null); // Local file state
  const [validUntil, setValidUntil] = useState("");
  const [step3_Planned, setStep3Planned] = useState("");
  const [step3_Status, setStep3Status] = useState("Draft");
  const [loading, setLoading] = useState(false);

  // Date validation (Today for min values)
  const today = new Date().toISOString().split("T")[0];

  /* 🔄 Prefill from Firebase */
  useEffect(() => {
    if (!complaint) return;

    const step3 = complaint.step3_estimatedOffer;
    const step2 = complaint.step2_assignment;

    setQuotationId(step3?.quotationId || "");
    setEstimatedCost(step3?.estimatedCost || "");
    setStep3Status(step3?.status || "Draft");

    // 🔥 PLANNED DATE LOGIC
    if (step3?.plannedAt?.toDate) {
      // already saved → show it
      setStep3Planned(step3.plannedAt.toDate().toISOString().split("T")[0]);
    } else if (step2?.actualAt?.toDate) {
      // not saved yet → auto-generate preview
      setStep3Planned(addDays(step2.actualAt.toDate(), 1));
    } else {
      setStep3Planned("");
    }

    // Valid Until
    if (step3?.validUntil?.toDate) {
      setValidUntil(step3.validUntil.toDate().toISOString().split("T")[0]);
    } else {
      setValidUntil("");
    }
  }, [complaint]);

  /* ✅ SAVE STEP-3 */
  const handleSaveStep3 = async () => {
    if (!quotationId || !estimatedCost) {
      toast.error("Please fill all mandatory quotation fields");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Saving Offer Details...");

    try {
      const offerCopyUrl = offerFile
        ? `storage/offers/${offerFile.name}` // dummy path
        : null;

      const payload = {
        quotationId,
        estimatedCost: Number(estimatedCost),
        offerCopyUrl,
        validUntil,
        // / / optional override
        step3_Planned: step3_Planned || null,
        step3_Actual: new Date().toISOString(),
        step3_Status,
      };

      await estimatedOfferStep(complaint.id, payload);

      toast.success("Estimated Offer saved successfully", { id: toastId });
      onSuccess?.(4); // move to Step-4
    } catch (err) {
      console.error("Step-3 Save Error:", err);
      toast.error("Failed to save estimated offer", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* QUOTATION ID & COST */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 mb-1.5">
            <Hash size={14} className="text-blue-500" />
            Quotation ID <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="REQ-2024-001"
            value={quotationId}
            onChange={(e) => setQuotationId(e.target.value)}
            className="w-full border rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
          />
        </div>
        <div>
          <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 mb-1.5">
            <IndianRupee size={14} className="text-blue-500" />
            Estimated Cost <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            placeholder="0.00"
            value={estimatedCost}
            onChange={(e) => setEstimatedCost(e.target.value)}
            className="w-full border rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
          />
        </div>
      </div>

      {/* OFFER COPY UPLOAD */}
      <div>
        <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 mb-1.5">
          <FileUp size={14} className="text-blue-500" />
          Upload Offer Copy (PDF/Image)
        </label>
        <div className="flex items-center justify-center w-full">
          <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
            <p className="text-xs text-gray-500">
              {offerFile ? offerFile.name : "Click to select Quotation Format"}
            </p>
            <input
              type="file"
              className="hidden"
              onChange={(e) => setOfferFile(e.target.files[0])}
              accept=".pdf,image/*"
            />
          </label>
        </div>
      </div>

      {/* STATUS PICKLIST */}
      <div>
        <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 mb-1.5">
          <CheckCircle2 size={14} className="text-blue-500" />
          Offer Status <span className="text-red-500">*</span>
        </label>
        <select
          value={step3_Status}
          onChange={(e) => setStep3Status(e.target.value)}
          className="w-full border rounded-lg py-2 px-3 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="Draft">Draft</option>
          <option value="Sent">Sent</option>
          {/* <option value="Accepted">Accepted</option> */}
          {/* <option value="Rejected">Rejected</option> */}
        </select>
      </div>

      {/* DATES SECTION */}
      <div className="bg-slate-50 border border-blue-100 rounded-lg p-4 relative">
        <div className="absolute top-0 left-0 w-1 bg-blue-500 h-full rounded-l-lg"></div>

        <div className="flex items-center gap-2 mb-4">
          <Clock size={16} className="text-blue-600" />
          <h2 className="text-sm font-bold text-slate-700">
            Timeline & Validity
          </h2>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <Calendar size={12} className="text-blue-400" />
              Planned Offer Date
            </label>

            <p className="text-[11px] text-gray-400 mb-1">
              Auto-generated from previous step. You may change it.
            </p>

            <input
              type="date"
              min={today}
              value={step3_Planned}
              onChange={(e) => setStep3Planned(e.target.value)}
              className="w-full border rounded-md py-1.5 px-3 text-sm focus:ring-1 focus:ring-blue-400 outline-none"
            />
          </div>
          {/* 
          <div className="space-y-1">
            <label className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <Edit3 size={12} className="text-blue-400" />
              Valid Until <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              min={today}
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
              className="w-full border border-gray-200 rounded-md py-1.5 px-3 text-sm focus:ring-1 focus:ring-blue-400 outline-none"
            />
          </div> */}
        </div>
      </div>

      {/* SAVE BUTTON */}
      <div className="flex justify-end">
        <button
          onClick={handleSaveStep3}
          disabled={loading}
          className={`px-4 py-2 rounded-lg text-xs font-bold text-white transition-all flex items-center gap-2 ${
            loading
              ? "bg-gray-400"
              : "bg-amber-600 hover:bg-amber-700 active:scale-95"
          }`}
        >
          <Bookmark size={14} />
          {loading ? "Generating Offer..." : "Send Estimated Offer"}
        </button>
      </div>
    </div>
  );
};
