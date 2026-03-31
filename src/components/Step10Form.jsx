import React, { useState, useEffect } from "react";
import { Calendar, Bookmark, Receipt, Timer, CreditCard } from "lucide-react";
import toast from "react-hot-toast";
import { updateBillingCollectionStep } from "../backend/services/complaintService";
// import { updateBillingCollectionStep } from "../backend/services/complaintService";

export const Step10Form = ({ complaint, onSuccess }) => {
  /* STEP 10 STATES */
  const [step10_Planned, setStep10Planned] = useState("");
  // const [step10_Actual, setStep10Actual] = useState(""); // read-only
  const [step10_Status, setStep10Status] = useState("Invoice Pending");
  const [crmResponsible, setCrmResponsible] = useState("");
  const [loading, setLoading] = useState(false);
  // const [showConfirm, setShowConfirm] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  /* 🔄 PREFILL LOGIC */
  useEffect(() => {
    if (!complaint) return;

    const step10 = complaint.step10_billing;
    const step9 = complaint.step9_qa;

    setStep10Status(step10?.status || "Invoice Pending");
    setCrmResponsible(step10?.crmName || "");

    // ✅ ACTUAL DATE (READ ONLY – from backend)
    // if (step10?.actualAt?.toDate) {
    //   setStep10Actual(step10.actualAt.toDate().toISOString().split("T")[0]);
    // }

    // ✅ PLANNED DATE (existing OR T+1 from Step-9)
    if (step10?.plannedAt?.toDate) {
      setStep10Planned(step10.plannedAt.toDate().toISOString().split("T")[0]);
    } else if (step9?.actualAt?.toDate) {
      const d = new Date(step9.actualAt.toDate());
      d.setDate(d.getDate() + 1);
      setStep10Planned(d.toISOString().split("T")[0]);
    }
  }, [complaint]);

  /* ✅ SAVE STEP-10 */
  const handleSaveStep10 = async () => {
    if (!step10_Planned || !crmResponsible) {
      toast.error("Planned Date and CRM Name are mandatory");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Processing Billing & Collection...");

    try {
      await updateBillingCollectionStep(complaint.id, {
        plannedAt: step10_Planned,
        status: step10_Status,
        crmName: crmResponsible,
      });

      toast.success("Billing & Collection (Step 10) Updated", {
        id: toastId,
      });

      onSuccess?.();
    } catch (err) {
      console.error("Step-10 Error:", err);
      toast.error(err.message || "Failed to update Step-10", {
        id: toastId,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* CRM RESPONSIBILITY */}
      <div>
        <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 mb-1.5">
          <Receipt size={14} className="text-purple-500" />
          CRM Responsible <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={crmResponsible}
          onChange={(e) => setCrmResponsible(e.target.value)}
          placeholder="Enter CRM Personnel Name"
          className="w-full border rounded-lg py-2 px-3 text-sm bg-gray-50 focus:ring-2 focus:ring-purple-500 outline-none"
        />
      </div>

      {/* BILLING STATUS */}
      <div>
        <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 mb-1.5">
          <CreditCard size={14} className="text-purple-500" />
          Billing & Collection Status
        </label>
        <select
          value={step10_Status}
          onChange={(e) => setStep10Status(e.target.value)}
          className="w-full border rounded-lg py-2 px-3 text-sm bg-gray-50"
        >
          {/* <option value="Invoice Pending">Invoice Pending</option> */}
          {/* <option value="Invoice Raised">Invoice Raised</option> */}
          <option value="Payment Partial">Payment Partial</option>
          <option value="Payment Collected">Payment Collected</option>
          <option value="FOC (Free of Charge)">FOC (Free of Charge)</option>
        </select>
      </div>

      {/* TIMELINE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* PLANNED DATE */}
        <div className="bg-slate-50 border border-purple-100 rounded-lg p-4 relative">
          <div className="absolute top-0 left-0 w-1 bg-purple-500 h-full rounded-l-lg"></div>
          <label className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
            <Calendar size={12} className="text-purple-400" />
            Planned Billing Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            min={today}
            value={step10_Planned}
            onChange={(e) => setStep10Planned(e.target.value)}
            className="w-full border rounded-md py-2 px-3 text-sm focus:border-purple-500 outline-none"
          />
        </div>

        {/* ACTUAL DATE – READ ONLY */}
        {/* <div className="bg-slate-50 border border-emerald-100 rounded-lg p-4 relative">
          <div className="absolute top-0 left-0 w-1 bg-emerald-500 h-full rounded-l-lg"></div>
          <label className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
            <Timer size={12} className="text-emerald-400" />
            Actual Billing Date
          </label>
          <input
            type="date"
            value={step10_Actual}
            disabled
            className="w-full border rounded-md py-2 px-3 text-sm bg-gray-100 cursor-not-allowed"
          />
        </div> */}
      </div>


      {/* SAVE */}
      <div className="flex justify-end mt-2">
        <button
          onClick={handleSaveStep10}
          disabled={loading}
          className={`px-6 py-2 rounded-lg text-xs font-bold text-white flex items-center gap-2 transition-all shadow-md active:scale-95 ${
            loading ? "bg-gray-400" : "bg-purple-600 hover:bg-purple-700"
          }`}
        >
          <Bookmark size={14} />
          {loading ? "Processing..." : "Save Step 10 Details"}
        </button>
      </div>
    </div>
  );
};