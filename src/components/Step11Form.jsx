// import React, { useState, useEffect } from "react";
// import {
//   Calendar,
//   Bookmark,
//   CheckCircle2,
//   Star,
//   Timer,
//   MessageSquare,
// } from "lucide-react";
// import toast from "react-hot-toast";
// import { updateClosureStep } from "../backend/services/complaintService";

// export const Step11Form = ({ complaint, onSuccess }) => {
//   /* STEP 11 STATES */
//   const [step11_Planned, setStep11Planned] = useState("");
//   const [step11_Actual, setStep11Actual] = useState("");
//   const [step11_Status, setStep11Status] = useState("Pending Closure");
//   const [npsRating, setNpsRating] = useState("");
//   const [crmResponsible, setCrmResponsible] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [showConfirm, setShowConfirm] = useState(false);

//   const today = new Date().toISOString().split("T")[0];

//   /* 🔄 PREFILL LOGIC */
//   useEffect(() => {
//     if (!complaint) return;

//     const step11 = complaint.step11_closure;
//     const step10 = complaint.step10_billing;

//     setStep11Status(step11?.status || "Pending Closure");
//     setNpsRating(step11?.npsRating || "");
//     setCrmResponsible(step11?.crmName || "");

//     // ✅ ACTUAL DATE PREFILL
//     if (step11?.actualAt?.toDate) {
//       setStep11Actual(step11.actualAt.toDate().toISOString().split("T")[0]);
//     }

//     // ✅ PLANNED DATE LOGIC (T+1 from Step 10 or existing)
//     if (step11?.plannedAt?.toDate) {
//       setStep11Planned(step11.plannedAt.toDate().toISOString().split("T")[0]);
//     } else if (step10?.actualAt?.toDate) {
//       const d = new Date(step10.actualAt.toDate());
//       d.setDate(d.getDate() + 1);
//       setStep11Planned(d.toISOString().split("T")[0]);
//     }
//   }, [complaint]);

//   /* ✅ SAVE STEP-11 */
//   const handleSaveStep11 = async () => {
//     if (!crmResponsible || !npsRating) {
//       toast.error("Planned Date, CRM Name and NPS Rating are mandatory");
//       return;
//     }

//     setLoading(true);
//     const toastId = toast.loading("Finalizing closure...");

//     try {
//       await updateClosureStep(complaint.id, {
//         plannedAt: step11_Planned,
//         crmName: crmResponsible,
//         npsRating,
//         status: step11_Status,
//       });

//       toast.success("Complaint successfully closed", { id: toastId });
//       onSuccess?.();
//     } catch (err) {
//       console.error("Step-11 Error:", err);
//       toast.error(err.message || "Failed to close complaint", {
//         id: toastId,
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="space-y-4">
//       {/* CRM RESPONSIBILITY */}
//       <div>
//         <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 mb-1.5">
//           <MessageSquare size={14} className="text-emerald-500" />
//           CRM Responsible <span className="text-red-500">*</span>
//         </label>
//         <input
//           type="text"
//           value={crmResponsible}
//           onChange={(e) => setCrmResponsible(e.target.value)}
//           placeholder="Enter CRM Personnel Name"
//           className="w-full border rounded-lg py-2 px-3 text-sm bg-gray-50 focus:ring-2 focus:ring-emerald-500 outline-none"
//         />
//       </div>

//       {/* NPS RATING */}
//       <div>
//         <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 mb-1.5">
//           <Star size={14} className="text-emerald-500" />
//           NPS Rating (0-10) <span className="text-red-500">*</span>
//         </label>
//         <select
//           value={npsRating}
//           onChange={(e) => setNpsRating(e.target.value)}
//           className="w-full border rounded-lg py-2 px-3 text-sm bg-gray-50 font-bold text-slate-700"
//         >
//           <option value="" disabled>
//             Select Rating
//           </option>
//           {[...Array(11)].map((_, i) => (
//             <option key={i} value={i}>
//               {i} {i === 10 ? "(Promoter)" : i === 0 ? "(Detractor)" : ""}
//             </option>
//           ))}
//         </select>
//       </div>

//       {/* CLOSURE STATUS */}
//       <div>
//         <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 mb-1.5">
//           <CheckCircle2 size={14} className="text-emerald-500" />
//           Final Closure Status
//         </label>
//         <select
//           value={step11_Status}
//           onChange={(e) => setStep11Status(e.target.value)}
//           className="w-full border rounded-lg py-2 px-3 text-sm bg-gray-50 font-medium"
//         >
//           <option value="Pending Closure">Pending Closure</option>
//           <option value="Resolved - Successfully Closed">
//             Resolved - Successfully Closed
//           </option>
//           <option value="Closed - Unresolved/Withdrawn">
//             Closed - Unresolved/Withdrawn
//           </option>
//         </select>
//       </div>

//       {/* TIMELINE SECTION */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         {/* PLANNED DATE */}
//         <div className="bg-slate-50 border border-emerald-100 rounded-lg p-4 relative">
//           <div className="absolute top-0 left-0 w-1 bg-emerald-500 h-full rounded-l-lg"></div>
//           <label className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
//             <Calendar size={12} className="text-emerald-400" />
//             Planned Closure Date <span className="text-red-500">*</span>
//           </label>
//           <input
//             type="date"
//             min={today}
//             value={step11_Planned}
//             onChange={(e) => setStep11Planned(e.target.value)}
//             className="w-full border rounded-md py-2 px-3 text-sm focus:border-emerald-500 outline-none"
//           />
//         </div>

//         {/* ACTUAL DATE */}
//         {/* <div className="bg-slate-50 border border-emerald-200 rounded-lg p-4 relative">
//           <div className="absolute top-0 left-0 w-1 bg-emerald-600 h-full rounded-l-lg"></div>
//           <label className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
//             <Timer size={12} className="text-emerald-500" />
//             Actual Closure Date <span className="text-red-500">*</span>
//           </label>
//           <input
//             type="date"
//             value={step11_Actual}
//             onChange={(e) => setStep11Actual(e.target.value)}
//             className="w-full border rounded-md py-2 px-3 text-sm focus:border-emerald-600 outline-none"
//           />
//         </div> */}
//       </div>

//       {/* CONFIRMATION POPUP */}
//       {showConfirm && (
//         <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs shadow-sm">
//           <p className="font-semibold text-slate-700">
//             Final Action: Are you sure you want to PERMANENTLY CLOSE this
//             complaint with an NPS of
//             <span className="text-emerald-700 font-bold ml-1">
//               {npsRating}/10
//             </span>
//             ?
//           </p>
//           <div className="flex justify-end gap-2 mt-2">
//             <button
//               onClick={() => setShowConfirm(false)}
//               className="px-3 py-1.5 text-xs border rounded bg-white hover:bg-gray-50"
//             >
//               Cancel
//             </button>
//             <button
//               onClick={() => {
//                 setShowConfirm(false);
//                 handleSaveStep11();
//               }}
//               className="px-3 py-1.5 text-xs bg-emerald-600 text-white rounded hover:bg-emerald-700 font-bold shadow-sm"
//             >
//               Complete Closure
//             </button>
//           </div>
//         </div>
//       )}

//       {/* SAVE BUTTON */}
//       <div className="flex justify-end mt-2">
//         <button
//           onClick={() => setShowConfirm(true)}
//           disabled={loading}
//           className={`px-6 py-2 rounded-lg text-xs font-bold text-white flex items-center gap-2 transition-all ${
//             loading
//               ? "bg-gray-400"
//               : "bg-emerald-600 hover:bg-emerald-700 active:scale-95 shadow-md hover:shadow-lg"
//           }`}
//         >
//           <Bookmark size={14} />
//           {loading ? "Closing..." : "Finalize & Close Complaint"}
//         </button>
//       </div>
//     </div>
//   );
// };
import React, { useState, useEffect } from "react";
import {
  Calendar,
  Bookmark,
  CheckCircle2,
  Star,
  MessageSquare,
} from "lucide-react";
import toast from "react-hot-toast";
import { updateClosureStep } from "../backend/services/complaintService";

export const Step11Form = ({ complaint, onSuccess }) => {
  const isAlreadyClosed = complaint?.isClosed === true;

  /* STEP 11 STATES */
  const [step11_Planned, setStep11Planned] = useState("");
  const [step11_Status, setStep11Status] = useState("Pending Closure");
  const [npsRating, setNpsRating] = useState("");
  const [crmResponsible, setCrmResponsible] = useState("");
  const [loading, setLoading] = useState(false);
  // const [showConfirm, setShowConfirm] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (!complaint) return;

    const step11 = complaint.step11_closure;
    const step10 = complaint.step10_billing;

    setStep11Status(step11?.closureStatus || "Pending Closure");
    setNpsRating(step11?.npsRating || "");
    setCrmResponsible(step11?.crmName || "");

    if (step11?.plannedAt?.toDate) {
      setStep11Planned(step11.plannedAt.toDate().toISOString().split("T")[0]);
    } else if (step10?.actualAt?.toDate) {
      const d = new Date(step10.actualAt.toDate());
      d.setDate(d.getDate() + 1);
      setStep11Planned(d.toISOString().split("T")[0]);
    }
  }, [complaint]);

  const handleSaveStep11 = async () => {
    if (isAlreadyClosed) return;

    if (!step11_Planned || !crmResponsible || !npsRating) {
      toast.error("Planned Date, CRM Name and NPS Rating are mandatory");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Finalizing closure...");

    try {
      await updateClosureStep(complaint.id, {
        plannedAt: step11_Planned,
        crmName: crmResponsible,
        npsRating,
        status: step11_Status,
      });

      toast.success("Complaint permanently closed", { id: toastId });
      onSuccess?.();
    } catch (err) {
      toast.error(err.message || "Failed to close complaint", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {isAlreadyClosed && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs p-3 rounded-lg">
          ✅ This complaint is permanently closed. No further changes allowed.
        </div>
      )}

      {/* CRM RESPONSIBLE */}
      <input
        disabled={isAlreadyClosed}
        value={crmResponsible}
        onChange={(e) => setCrmResponsible(e.target.value)}
        placeholder="CRM Responsible"
        className="w-full border rounded-lg p-2 text-sm"
      />

      {/* NPS */}
      <select
        disabled={isAlreadyClosed}
        value={npsRating}
        onChange={(e) => setNpsRating(e.target.value)}
        className="w-full border rounded-lg p-2 text-sm"
      >
        <option value="">Select NPS</option>
        {[...Array(11)].map((_, i) => (
          <option key={i} value={i}>
            {i}
          </option>
        ))}
      </select>

      {/* STATUS */}
      <select
        disabled={isAlreadyClosed}
        value={step11_Status}
        onChange={(e) => setStep11Status(e.target.value)}
        className="w-full border rounded-lg p-2 text-sm"
      >
        {/* <option value="Pending Closure">Pending Closure</option> */}
        <option value="Resolved">Resolved</option>
        <option value="Unresolved">Unresolved</option>
      </select>

      {/* PLANNED DATE */}
      <input
        disabled={isAlreadyClosed}
        type="date"
        min={today}
        value={step11_Planned}
        onChange={(e) => setStep11Planned(e.target.value)}
        className="w-full border rounded-lg p-2 text-sm"
      />

      {/* SAVE */}
      <div className="flex justify-end mt-2">
        <button
          onClick={handleSaveStep11}
          disabled={loading || isAlreadyClosed}
          className={`px-6 py-2 rounded-lg text-xs font-bold text-white flex items-center gap-2 transition-all shadow-md active:scale-95 ${
            isAlreadyClosed
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-emerald-600 hover:bg-emerald-700"
          }`}
        >
          <Bookmark size={14} />
          {loading ? "Closing..." : isAlreadyClosed ? "Complaint Closed" : "Finalize & Close Complaint"}
        </button>
      </div>
    </div>
  );
};