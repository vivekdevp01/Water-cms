import React, { useState, useEffect } from "react";
import {
  Calendar,
  Edit3,
  Clock,
  Bookmark,
  CheckCircle2,
  FileText,
  Upload,
  Layers,
} from "lucide-react";
// import { updateVerificationStep } from "../backend/complaintService";
import toast from "react-hot-toast";
import { verificationStep } from "../backend/services/complaintService";

export const Step1Form = ({ complaint, onSuccess }) => {
  const [complaintType, setComplaintType] = useState("");
  const [files, setFiles] = useState([]); // Store actual file objects
  const [remoteResolutionNotes, setRemoteResolutionNotes] = useState("");
  const [step1_Status, setStep1Status] = useState("Pending");

  const [billNo, setBillNo] = useState("");
  const [billDate, setBillDate] = useState("");
  const [modelNo, setModelNo] = useState("");

  const [step1_Planned, setStep1Planned] = useState("");
  const [loading, setLoading] = useState(false);

  // Get today's date in YYYY-MM-DD format for calendar validation
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (complaint) {
      setComplaintType(complaint.complaintType || "");
      setRemoteResolutionNotes(complaint.remoteResolutionNotes || "");
      setStep1Status(complaint.step1_Status || "Pending");
      setStep1Planned(complaint.step1_Planned || "");
      setBillNo(complaint.billDetails?.billNo || "");
      setBillDate(complaint.billDetails?.billDate || "");
      setModelNo(complaint.billDetails?.modelNo || "");
    }
  }, [complaint]);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
  };

  const handleSaveStep1 = async () => {
    if (!complaintType || !step1_Status || !billNo || !step1_Planned) {
      toast.error("Please fill all mandatory fields");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Uploading files and saving...");

    try {
      // Logic for File Upload would go here (e.g., Firebase Storage)
      // For now, we'll pass the file names or a placeholder array
      const uploadedUrls = files.map((f) => `placeholder_path/${f.name}`);

      const payload = {
        complaintType,
        mediaUrls: uploadedUrls,
        remoteResolutionNotes,
        billDetails: { billNo, billDate, modelNo },
        step1_Status,
        step1_Planned,
        step1_Actual: new Date().toISOString(),
      };

      await verificationStep(complaint.id, payload);
      toast.success("Verification completed successfully", { id: toastId });
      onSuccess?.(2);
    } catch (err) {
      toast.error("Failed to update Verification", { id: toastId },err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* COMPLAINT TYPE */}
      <div>
        <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 mb-1.5">
          <Layers size={14} className="text-blue-500" />
          Complaint Type <span className="text-red-500">*</span>
        </label>
        <select
          value={complaintType}
          onChange={(e) => setComplaintType(e.target.value)}
          className="w-full border rounded-lg py-2 px-3 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="" disabled>
            Select Type
          </option>
          <option value="IW">In-Warranty (IW)</option>
          <option value="OW">Out-of-Warranty (OW)</option>
          <option value="I-C">Installation/Commissioning (I-C)</option>
        </select>
      </div>

      {/* BILL DETAILS */}
      <div className="p-3 border rounded-lg bg-gray-50/50 space-y-3">
        <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-tighter">
          <FileText size={14} /> Bill Copy Details
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input
            placeholder="Bill Number"
            value={billNo}
            onChange={(e) => setBillNo(e.target.value)}
            className="border rounded px-2 py-1.5 text-sm"
          />
          <input
            type="date"
            value={billDate}
            onChange={(e) => setBillDate(e.target.value)}
            className="border rounded px-2 py-1.5 text-sm"
          />
          <input
            placeholder="Model Number"
            className="border rounded px-2 py-1.5 text-sm col-span-2"
            value={modelNo}
            onChange={(e) => setModelNo(e.target.value)}
          />
        </div>
      </div>

      {/* SYSTEM FILE UPLOAD */}
      <div>
        <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 mb-1.5">
          <Upload size={14} className="text-blue-500" />
          Upload Media (Photos/Videos)
        </label>
        <div className="flex items-center justify-center w-full">
          <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <p className="text-xs text-gray-500">
                {files.length > 0
                  ? `${files.length} files selected`
                  : "Click to upload from system"}
              </p>
            </div>
            <input
              type="file"
              className="hidden"
              multiple
              onChange={handleFileChange}
              accept="image/*,video/*"
            />
          </label>
        </div>
      </div>

      {/* PLANNED DATE WITH VALIDATION */}
      <div>
        <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 mb-1.5">
          <Calendar size={14} className="text-blue-500" />
          Planned Completion Date <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          min={today} // This disables all dates before today
          value={step1_Planned}
          onChange={(e) => setStep1Planned(e.target.value)}
          className="w-full border rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500/20"
        />
        <p className="text-[10px] text-gray-400 mt-1">
          Note: Only today or future dates allowed.
        </p>
      </div>

      {/* STATUS */}
      <div>
        <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 mb-1.5">
          <CheckCircle2 size={14} className="text-blue-500" />
          Verification Status <span className="text-red-500">*</span>
        </label>
        <select
          value={step1_Status}
          onChange={(e) => setStep1Status(e.target.value)}
          className="w-full border rounded-lg py-2 px-3 text-sm bg-gray-50"
        >
          <option value="Pending">Pending</option>
          <option value="Remote Closed">Remote Closed</option>
          <option value="N/A">N/A</option>
          <option value="Approved for Visit">Approved for Visit</option>
        </select>
      </div>

      {/* REMOTE RESOLUTION */}
      <div className="bg-slate-50 border border-blue-100 rounded-lg p-4 relative">
        <div className="absolute top-0 left-0 w-1 bg-blue-500 h-full rounded-l-lg"></div>
        <div className="flex items-center gap-2 mb-2">
          <Clock size={16} className="text-blue-600" />
          <h2 className="text-sm font-bold text-slate-700">
            Remote Resolution Log
          </h2>
        </div>
        <textarea
          rows="2"
          placeholder="Attempts to close remotely..."
          value={remoteResolutionNotes}
          onChange={(e) => setRemoteResolutionNotes(e.target.value)}
          className="w-full border border-gray-200 rounded-md py-1.5 px-3 text-sm focus:ring-2 focus:ring-blue-500/10"
          
        />
      </div>

      <div className="flex justify-end">
        {/* <button
          onClick={handleSaveStep1}
          disabled={loading}
          className={`px-4 py-2 rounded-lg text-xs font-bold text-white flex items-center gap-2 ${
            loading
              ? "bg-gray-400"
              : "bg-amber-600 hover:bg-amber-700 active:scale-95"
          }`}
        >
          <Bookmark size={14} />
          {loading ? "Processing..." : "Complete Verification"}
        </button> */}
        {step1_Status === "Pending" && (
          <p className="text-[10px] text-red-400 mt-1 text-left mr-4">
            * Please change status from "Pending" to proceed.
          </p>
        )}
        <button
            onClick={handleSaveStep1}
            // Disable if loading OR if status is "Pending"
            disabled={loading || step1_Status === "Pending"} 
            className={`px-4 py-2 rounded-lg text-xs font-bold text-white flex items-center gap-2 transition-colors ${
              loading || step1_Status === "Pending"
                ? "bg-gray-400 cursor-not-allowed" // Grayscale style for disabled state
                : "bg-amber-600 hover:bg-amber-700 active:scale-95"
            }`}
          >
            <Bookmark size={14} />
            {loading ? "Processing..." : "Complete Verification"}
          </button>
      </div>
    </div>
  );
};
