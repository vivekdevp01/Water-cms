import React, { useState, useEffect } from "react";
import {
  Calendar,
  Edit3,
  Clock,
  Bookmark,
  CheckCircle2,
  Users,
  UserCheck,
} from "lucide-react";
import { doc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "../backend/config/firebase";
import toast from "react-hot-toast";
import { collection, query, where, getDocs } from "firebase/firestore";
import { assignEngineerStep } from "../backend/services/complaintService";

export const Step2Form = ({ complaint, onSuccess }) => {
  // Step 2 Fields based on Diagram
  const [assignedDiv, setAssignedDiv] = useState("");
  const [assignedEngineerId, setAssignedEngineerId] = useState("");
  const [assignmentNotes, setAssignmentNotes] = useState("");
  const [step2_Status, setStep2Status] = useState("Unassigned");
  const [step2_Planned, setStep2Planned] = useState("");
  const [engineers, setEngineers] = useState([]);

  const [loading, setLoading] = useState(false);

  // Validation: Only today and future dates
  const today = new Date().toISOString().split("T")[0];
  const addDays = (date, days = 1) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d.toISOString().split("T")[0];
  };

  /* 🔄 Prefill from Firebase */
  // useEffect(() => {
  //   if (complaint) {
  //     setAssignedDiv(complaint.assignedDiv || "");
  //     setAssignedEngineerId(complaint.assignedEngineerId || "");
  //     setAssignmentNotes(complaint.assignmentNotes || "");
  //     setStep2Status(complaint.step2_Status || "Unassigned");
  //     setStep2Planned(complaint.step2_Planned || "");
  //   }
  // }, [complaint]);
  useEffect(() => {
    if (!complaint) return;

    const step2 = complaint.step2_assignment;
    const step1 = complaint.step1_verification;

    setAssignedDiv(step2?.division || "");
    setAssignedEngineerId(step2?.engineerId || "");
    setAssignmentNotes(step2?.remarks || "");
    setStep2Status(step2?.status || "Unassigned");

    // ✅ PRIORITY ORDER
    if (step2?.plannedAt?.toDate) {
      setStep2Planned(step2.plannedAt.toDate().toISOString().split("T")[0]);
    } else if (step1?.actualAt?.toDate) {
      setStep2Planned(addDays(step1.actualAt.toDate(), 1));
    } else if (complaint?.complaintDetails?.createdAt?.toDate) {
      // 🔥 fallback of last resort
      setStep2Planned(
        addDays(complaint.complaintDetails.createdAt.toDate(), 1),
      );
    } else {
      setStep2Planned("");
    }
  }, [complaint]);
  useEffect(() => {
    const fetchEngineers = async () => {
      try {
        const q = query(
          collection(db, "users"),
          where("role", "==", "engineer"),
        );

        const snapshot = await getDocs(q);

        const engineerList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setEngineers(engineerList);

        console.log("Engineers:", engineerList);
      } catch (error) {
        console.error("Error fetching engineers:", error);
      }
    };

    fetchEngineers();
  }, []);

  /* ✅ SAVE STEP-2 */
  const handleSaveStep2 = async () => {
    if (!assignedDiv || !assignedEngineerId || !step2_Status) {
      toast.error("Please fill all mandatory fields");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Assigning Engineer...");

    try {
      const payload = {
        assignedDiv,
        assignedEngineerId,
        assignmentNotes,
        step2_Status,
        // optional override
        step2_Planned: step2_Planned || null,
        step2_Actual: new Date().toISOString(),
      };

      await assignEngineerStep(complaint.id, payload);

      toast.success("Engineer Assigned successfully", { id: toastId });
      onSuccess?.(3); // move UI to Step-3
    } catch (err) {
      console.error("Step-2 Save Error:", err);
      toast.error("Failed to complete Assignment", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* DIVISION DROPDOWN */}
      <div>
        <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 mb-1.5">
          <Users size={14} className="text-blue-500" />
          Division <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          placeholder="Enter Division"
          value={assignedDiv}
          onChange={(e) => setAssignedDiv(e.target.value)}
          className="w-full border rounded-lg py-2 px-3 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        />
      </div>

      {/* ENGINEER SELECTION */}
      <div>
        <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 mb-1.5">
          <UserCheck size={14} className="text-blue-500" />
          Product Engineer <span className="text-red-500">*</span>
        </label>
        {/* <input
          type="text"
          placeholder="Enter Engineer Name"
          value={assignedEngineerId}
          onChange={(e) => setAssignedEngineerId(e.target.value)}
          className="w-full border rounded-lg py-2 px-3 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        /> */}
        <select
          value={assignedEngineerId}
          onChange={(e) => setAssignedEngineerId(e.target.value)}
          className="w-full border rounded-lg py-2 px-3 text-sm bg-gray-50"
        >
          <option value="">Select Engineer</option>

          {engineers.map((eng) => (
            <option key={eng.id} value={eng.id}>
              {eng.name} ({eng.email})
            </option>
          ))}
        </select>
      </div>

      {/* PLANNED ASSIGNMENT DATE */}
      <div>
        <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 mb-1.5">
          <Calendar size={14} className="text-blue-500" />
          Planned Assignment Completion
        </label>

        <p className="text-[11px] text-gray-400 mb-1">
          Auto-calculated based on previous step. You may change if required.
        </p>

        <input
          type="date"
          min={today}
          value={step2_Planned}
          onChange={(e) => setStep2Planned(e.target.value)}
          className="w-full border rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500/20"
        />
      </div>

      {/* ASSIGNMENT STATUS */}
      <div>
        <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 mb-1.5">
          <CheckCircle2 size={14} className="text-blue-500" />
          Assignment Status <span className="text-red-500">*</span>
        </label>
        <select
          value={step2_Status}
          onChange={(e) => setStep2Status(e.target.value)}
          className="w-full border rounded-lg py-2 px-3 text-sm bg-gray-50"
        >
          <option value="Unassigned">Unassigned</option>
          <option value="Assigned">Assigned</option>
          {/* <option value="Re-assigned">Re-assigned</option> */}
        </select>
      </div>

      {/* ASSIGNMENT NOTES (REMARKS) */}
      <div className="bg-slate-50 border border-blue-100 rounded-lg p-4 relative">
        <div className="absolute top-0 left-0 w-1 bg-blue-500 h-full rounded-l-lg"></div>
        <div className="flex items-center gap-2 mb-2">
          <Edit3 size={16} className="text-blue-600" />
          <h2 className="text-sm font-bold text-slate-700">
            Special Instructions
          </h2>
        </div>
        <textarea
          rows="3"
          placeholder="Enter notes for the product engineer..."
          value={assignmentNotes}
          onChange={(e) => setAssignmentNotes(e.target.value)}
          className="w-full border border-gray-200 rounded-md py-1.5 px-3 text-sm resize-none focus:ring-1 focus:ring-blue-400 focus:outline-none"
        />
      </div>

      {/* SAVE BUTTON */}
      <div className="flex justify-end">
        <button
          onClick={handleSaveStep2}
          disabled={loading}
          className={`px-4 py-2 rounded-lg text-xs font-bold text-white flex items-center gap-2 ${
            loading
              ? "bg-gray-400"
              : "bg-amber-600 hover:bg-amber-700 active:scale-95"
          }`}
        >
          <Bookmark size={14} />
          {loading ? "Assigning..." : "Assigned Engineer"}
        </button>
      </div>
    </div>
  );
};
