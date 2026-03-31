import React, { useEffect, useState } from "react";
import { collection, getDocs, onSnapshot } from "firebase/firestore";
import { db } from "../backend/config/firebase";
import { Link } from "react-router-dom";
import {
  Eye,
  Edit2,
  Filter,
  ClipboardList,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Truck,
  LayoutDashboard,
} from "lucide-react";
import { ComplaintViewModal } from "./ComplaintViewModal";
import { STEPSS } from "../backend/constants/stepsConstant";
import { ComplaintUpdateModal } from "./ComplaintUpdateModal";
import STEP_LABEL_MAP from "./STEP_LABEL_MAP";
import STEP_DISPLAY_MAP from "./STEP_DISPLAY_MAP";

const getWorkflowStageLabel = (complaint) => {
  const { currentStep, flowType } = complaint;

  // 🔐 FINAL
  if (complaint.isClosed) return "Closed";

  // 🌿 Common flow
  if (currentStep >= 1 && currentStep <= 6) {
    return `Step ${currentStep}`;
  }

  // 🟦 ONSITE FLOW
  if (flowType === "ONSITE") {
    const onsiteMap = {
      71: "Onsite → Indent Raised",
      72: "Onsite → Approval",
      73: "Onsite → Spare Issued",
      8: "Rectification",
      9: "QA Verification",
      10: "Billing",
      11: "Closure",
    };
    return onsiteMap[currentStep] || "Onsite Process";
  }

  // 🟧 OFFSITE FLOW
  if (flowType === "OFFSITE") {
    const offsiteMap = {
      81: "Offsite → Removal",
      82: "Offsite → Store Inward",
      83: "Offsite → Vendor Shortlist",
      84: "Offsite → Vendor Selection",
      85: "Offsite → PO Issued",
      86: "Offsite → Advance Paid",
      87: "Offsite → Dispatch",
      88: "Offsite → Repair",
      89: "Offsite → Return",
      90: "Offsite → QC",
      8: "Rectification",
      9: "QA Verification",
      10: "Billing",
      11: "Closure",
    };
    return offsiteMap[currentStep] || "Offsite Process";
  }

  return "Unknown Stage";
};

const ComplaintFMS = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [updatingComplaint, setUpdatingComplaint] = useState(null);

  // --- PAGINATION STATE ---
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  // --- ALL FILTERS RESTORED + STEP FILTER ADDED ---
  const [filters, setFilters] = useState({
    name: "",
    contactPerson: "",
    contactNo: "",
    address: "",
    product: "",
    natureOfComplaint: "",
    complaintReceivedFrom: "",
    warrantyStatus: "",
    assignedTo: "",
    currentStep: "", // New step-specific filter
    sortByLatest: true,
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, "complaints"));
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setComplaints(data);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const q = collection(db, "complaints");
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setComplaints(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      name: "",
      contactPerson: "",
      contactNo: "",
      address: "",
      product: "",
      natureOfComplaint: "",
      complaintReceivedFrom: "",
      warrantyStatus: "",
      assignedTo: "",
      currentStep: "",
      sortByLatest: true,
    });
    setCurrentPage(1);
  };

  // --- FILTERING LOGIC ---
  const filteredComplaints = complaints
    .filter((c) => {
      const cd = c.complaintDetails || {};
      const cStep = c.currentStep !== undefined ? String(c.currentStep) : "0";
      return (
        (!filters.name ||
          (c.name || cd.name || "")
            .toLowerCase()
            .includes(filters.name.toLowerCase())) &&
        (!filters.contactPerson ||
          (c.contactPerson || cd.contactPerson || "")
            .toLowerCase()
            .includes(filters.contactPerson.toLowerCase())) &&
        (!filters.contactNo ||
          (c.registeredContactNo || cd.registeredContactNo || "").includes(
            filters.contactNo,
          )) &&
        (!filters.address ||
          (c.address || cd.address || "")
            .toLowerCase()
            .includes(filters.address.toLowerCase())) &&
        (!filters.product ||
          (c.product || cd.product || "")
            .toLowerCase()
            .includes(filters.product.toLowerCase())) &&
        (!filters.natureOfComplaint ||
          (c.natureOfComplaint || cd.natureOfComplaint || "")
            .toLowerCase()
            .includes(filters.natureOfComplaint.toLowerCase())) &&
        (!filters.complaintReceivedFrom ||
          (c.complaintReceivedFrom || "")
            .toLowerCase()
            .includes(filters.complaintReceivedFrom.toLowerCase())) &&
        (!filters.warrantyStatus ||
          (cd.warrantyStatus || c.warrantyStatus || "").toLowerCase() ===
            filters.warrantyStatus.toLowerCase()) &&
        (!filters.assignedTo ||
          (c.step1_assignEngineer?.engineer || "")
            .toLowerCase()
            .includes(filters.assignedTo.toLowerCase())) &&
        (!filters.currentStep || cStep === filters.currentStep)
      );
    })
    .sort((a, b) => {
      if (!filters.sortByLatest) return 0;
      const dateA = a.complaintDetails?.createdAt?.toDate?.() || new Date(0);
      const dateB = b.complaintDetails?.createdAt?.toDate?.() || new Date(0);
      return dateB - dateA;
    });

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredComplaints.slice(
    indexOfFirstRecord,
    indexOfLastRecord,
  );
  const totalPages = Math.ceil(filteredComplaints.length / recordsPerPage);

  // const getCurrentStepBadge = (currentStep = 1) => {
  //   const map = {
  //     1: "Verification",
  //     2: "Assignment",
  //     3: "Estimated Offer",
  //     4: "Response Acknowledgement",
  //     5: "Site Visit",
  //     6: "Final Offer Decision",
  //     7: "Final Offer Decision",
  //     8: "Rectification",
  //     9: "QA Verification",
  //     10: "Billing Process",
  //     11: "Clouser with NPS rating",
  //   };

  //   if (currentStep >= 11) {
  //     return {
  //       label: "Closed",
  //       color: "bg-emerald-100 text-emerald-700 border-emerald-200",
  //     };
  //   }

  //   return {
  //     label: `Step ${currentStep}: ${map[currentStep]}`,
  //     color: "bg-blue-100 text-blue-700 border-blue-200",
  //   };
  // };
  const getCurrentStepBadge = (complaint) => {
    const { currentStep, isClosed } = complaint;

    if (isClosed) {
      return {
        label: "Closed",
        color: "bg-emerald-100 text-emerald-700 border-emerald-200",
      };
    }

    const displayStep = STEP_DISPLAY_MAP[currentStep] ?? currentStep;
    const stepLabel = STEP_LABEL_MAP[currentStep] ?? "In Progress";

    return {
      label: `Step ${displayStep}: ${stepLabel}`,
      color: "bg-blue-100 text-blue-700 border-blue-200",
    };
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      {/* MODALS */}
      {selectedComplaint && (
        <ComplaintViewModal
          complaint={selectedComplaint}
          onClose={() => setSelectedComplaint(null)}
        />
      )}
      {updatingComplaint && (
        <ComplaintUpdateModal
          complaintId={updatingComplaint}
          onClose={() => setUpdatingComplaint(null)}
        />
      )}

      {/* HEADER */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Complaint Management System
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            End-to-end service tracking and operational management.
          </p>
        </div>

        {/* --- NAVIGATION TOGGLE BUTTONS MOVED NEXT TO REFRESH --- */}
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 transition shadow-sm"
          >
            <LayoutDashboard size={14} />
            Dashboard
          </Link>

          <div className="flex items-center bg-slate-200 p-1 rounded-xl shadow-inner">
            <Link
              to="/onsite-mgmt"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all text-slate-600 hover:bg-white hover:text-blue-600"
            >
              <ClipboardList size={14} /> On-Site
            </Link>
            <div className="w-[1px] h-4 bg-slate-300 mx-1"></div>
            <Link
              to="/offsite-mgmt"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all text-slate-600 hover:bg-white hover:text-amber-600"
            >
              <Truck size={14} /> Off-Site
            </Link>
          </div>

          <button
            onClick={loadData}
            className="p-2 bg-white border rounded-lg hover:bg-gray-50 text-slate-600 transition-colors shadow-sm"
          >
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
          </button>
          {/* FILTER BOX */}
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200 flex items-center gap-3">
            <ClipboardList className="text-blue-500" size={20} />
            <span className="text-sm font-bold text-slate-700 whitespace-nowrap">
              Total: {filteredComplaints.length} / {complaints.length}
            </span>
          </div>
        </div>
      </div>

      {/* FILTER BOX - ALL FILTERS INCLUDED */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6 text-xs">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-slate-700 font-bold">
            <Filter size={18} className="text-blue-600" />{" "}
            <h2 className="text-sm">Filter Search Leads</h2>
          </div>
          <div className="flex gap-3">
            <label className="flex items-center gap-2 font-bold text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                className="rounded text-blue-600"
                checked={filters.sortByLatest}
                onChange={(e) =>
                  setFilters((p) => ({ ...p, sortByLatest: e.target.checked }))
                }
              />{" "}
              Latest First
            </label>
            <button
              onClick={clearFilters}
              className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-gray-50 transition-all"
            >
              <RefreshCw size={14} /> Reset Filters
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Customer Name
            </label>
            <input
              type="text"
              name="name"
              value={filters.name}
              onChange={handleFilterChange}
              placeholder="Search..."
              className="w-full p-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500/20 outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Contact Person
            </label>
            <input
              type="text"
              name="contactPerson"
              value={filters.contactPerson}
              onChange={handleFilterChange}
              placeholder="Search..."
              className="w-full p-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500/20 outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Phone No.
            </label>
            <input
              type="text"
              name="contactNo"
              value={filters.contactNo}
              onChange={handleFilterChange}
              placeholder="Search..."
              className="w-full p-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500/20 outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Product
            </label>
            <input
              type="text"
              name="product"
              value={filters.product}
              onChange={handleFilterChange}
              placeholder="Search..."
              className="w-full p-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500/20 outline-none"
            />
          </div>

          {/* <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Engineer (S1)
            </label>
            <input
              type="text"
              name="assignedTo"
              value={filters.assignedTo}
              onChange={handleFilterChange}
              placeholder="Search engineer..."
              className="w-full p-2 border border-slate-200 rounded-md outline-none"
            />
          </div> */}

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Address
            </label>
            <input
              type="text"
              name="address"
              value={filters.address}
              onChange={handleFilterChange}
              placeholder="Search address..."
              className="w-full p-2 border border-slate-200 rounded-md outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Complaint Nature
            </label>
            <input
              type="text"
              name="natureOfComplaint"
              value={filters.natureOfComplaint}
              onChange={handleFilterChange}
              placeholder="Search..."
              className="w-full p-2 border border-slate-200 rounded-md outline-none"
            />
          </div>
          {/* <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Received From
            </label>
            <input
              type="text"
              name="complaintReceivedFrom"
              value={filters.complaintReceivedFrom}
              onChange={handleFilterChange}
              placeholder="Search..."
              className="w-full p-2 border border-slate-200 rounded-md outline-none"
            />
          </div> */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Warranty Status
            </label>
            <select
              name="warrantyStatus"
              value={filters.warrantyStatus}
              onChange={handleFilterChange}
              className="w-full p-2 border border-slate-200 rounded-md bg-white"
            >
              <option value="">All Status</option>
              <option value="In-Warranty">In Warranty</option>
              <option value="Out-of-Warranty">Out of Warranty</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Workflow Step
            </label>
            <select
              name="currentStep"
              value={filters.currentStep}
              onChange={handleFilterChange}
              className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-700"
            >
              <option value="">All Steps</option>
              <option value="1">Step 1 – Verification</option>
              <option value="2">Step 2 – Assignment</option>
              <option value="3">Step 3 – Estimated Offer</option>
              <option value="4">Step 4 – Response Ack</option>
              <option value="5">Step 5 – Site Visit</option>
              <option value="6">Step 6 – Final Offer</option>
              <option value="8">Step 8 - Rectification</option>
              <option value="9">Step 9 - QA Verification</option>
              <option value="10">Step 10 - Billing</option>
              <option value="11">Step 11 - Closure</option>
            </select>
          </div>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-[11px] text-left border-collapse min-w-[2400px]">
            <thead className="bg-slate-900 text-slate-200 sticky top-0 z-10">
              <tr className="uppercase tracking-wider font-bold">
                <th className="p-4 border-r border-slate-800">Lead ID</th>
                <th className="p-4 border-r border-slate-800">Status</th>
                <th className="p-4 bg-slate-800 border-r border-slate-700">
                  Customer Name
                </th>
                <th className="p-4 border-r border-slate-800">Phone</th>
                <th className="p-4 border-r border-slate-800">Product</th>
                <th className="p-4 border-r border-slate-800">
                  Installation Date
                </th>
                <th className="p-4 border-r border-slate-800">
                  Warranty Status
                </th>

                {/* Workflow Specific Columns mapped to steps */}
                <th className="p-4 border-r border-slate-800 text-center">
                  Verification (S1)
                </th>
                <th className="p-4 border-r border-slate-800 text-center">
                  Assignment (S2)
                </th>
                <th className="p-4 border-r border-slate-800 text-center">
                  Est. Offer (S3)
                </th>
                <th className="p-4 border-r border-slate-800 text-center">
                  Response (S4)
                </th>
                <th className="p-4 border-r border-slate-800 text-center">
                  Site Visit (S5)
                </th>
                <th className="p-4 border-r border-slate-800 text-center">
                  Final Offer (S6)
                </th>
                {/* Branching Logic Step */}
                <th className="p-4 border-r border-slate-800 text-center bg-amber-900/20">
                  S7: Execution Flow
                </th>
                <th className="p-4 border-r border-slate-800 text-center bg-emerald-900/20">
                  S8: Rectify
                </th>
                <th className="p-4 border-r border-slate-800 text-center bg-emerald-900/20">
                  S9: QA Check
                </th>
                <th className="p-4 border-r border-slate-800 text-center bg-emerald-900/20">
                  S10: Billing
                </th>
                <th className="p-4 border-r border-slate-800 text-center bg-emerald-900/20">
                  S11: Closure
                </th>

                <th className="p-4 sticky right-0 bg-slate-900 text-center shadow-[-10px_0px_20px_rgba(0,0,0,0.3)]">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr>
                  <td
                    colSpan="13"
                    className="p-20 text-center text-slate-400 font-bold text-lg animate-pulse"
                  >
                    Synchronizing Workflow Data...
                  </td>
                </tr>
              ) : currentRecords.length === 0 ? (
                <tr>
                  <td
                    colSpan="13"
                    className="p-20 text-center text-slate-400 font-bold"
                  >
                    No records found matching filters.
                  </td>
                </tr>
              ) : (
                currentRecords.map((c) => {
                  const cd = c.complaintDetails || {};
                  // const step = getCurrentStepBadge(c.currentStep || 0);
                  const step = getCurrentStepBadge(c);

                  const instDate =
                    c.dateOfInstallation || cd.dateOfInstallation;

                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-blue-50/40 transition-colors whitespace-nowrap group"
                    >
                      <td className="p-4 border-r font-mono font-bold text-blue-600 bg-slate-50/50">
                        {c.id.slice(0, 8)}
                      </td>
                      <td className="p-4 border-r">
                        <span
                          className={`px-2.5 py-1 rounded-full font-black text-[9px] border shadow-sm ${step.color}`}
                        >
                          {step.label}
                        </span>
                      </td>
                      <td className="p-4 border-r font-bold text-slate-800 uppercase">
                        {c.name || cd.name || "—"}
                      </td>
                      <td className="p-4 border-r text-slate-600">
                        {c.registeredContactNo || cd.registeredContactNo || "—"}
                      </td>
                      <td className="p-4 border-r font-medium text-slate-700">
                        {c.product || cd.product || "—"}
                      </td>
                      <td className="p-4 border-r text-slate-500 font-medium">
                        {instDate?.toDate
                          ? instDate.toDate().toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="p-4 border-r font-bold">
                        <span
                          className={`px-2 py-1 rounded-full text-[10px] ${
                            cd.warrantyStatus === "In-Warranty"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {cd.warrantyStatus || "—"}
                        </span>
                      </td>

                      {/* S1: Engineer */}
                      {/* S1 – Verification */}
                      <td className="p-4 border-r text-center">
                        {c.step1_verification?.actualAt ? "DONE" : "PENDING"}
                      </td>

                      {/* S2 – Assignment */}
                      <td className="p-4 border-r text-center">
                        {c.step2_assignment?.engineerId
                          ? "ASSIGNED"
                          : "PENDING"}
                      </td>

                      {/* S3 – Estimated Offer */}
                      <td className="p-4 border-r text-center">
                        {c.step3_estimatedOffer?.estimatedCost
                          ? "OFFERED"
                          : "PENDING"}
                      </td>

                      {/* S4 – Response Ack */}
                      <td className="p-4 border-r text-center">
                        {c.step4_responseAck?.status || "PENDING"}
                      </td>

                      {/* S5 – Site Visit */}
                      <td className="p-4 border-r text-center">
                        {c.step5_siteVisit?.actualAt ? "VISITED" : "PENDING"}
                      </td>

                      {/* S6 – Final Offer */}
                      <td className="p-4 border-r text-center font-bold">
                        {c.step6_finalOffer?.status2 || "PENDING"}
                      </td>

                      {/* S7 Branching Detection */}
                      <td className="p-4 border-r text-center">
                        {c.flowType === "ONSITE" ? (
                          <span className="text-blue-600 font-bold flex items-center justify-center gap-1">
                            <ClipboardList size={10} /> ON-SITE ({c.currentStep}
                            )
                          </span>
                        ) : c.flowType === "OFFSITE" ? (
                          <span className="text-amber-600 font-bold flex items-center justify-center gap-1">
                            <Truck size={10} /> OFF-SITE ({c.currentStep})
                          </span>
                        ) : (
                          "PENDING"
                        )}
                      </td>

                      {/* Shared Steps S8 - S11 */}
                      <td className="p-4 border-r text-center font-bold">
                        {c.step8_rectification?.status || "PENDING"}
                      </td>
                      <td className="p-4 border-r text-center">
                        {c.step9_qa?.qaResult ? (
                          <span
                            className={
                              c.step9_qa.qaResult === "PASS"
                                ? "text-emerald-600"
                                : "text-red-600"
                            }
                          >
                            {c.step9_qa.qaResult}
                          </span>
                        ) : (
                          "PENDING"
                        )}
                      </td>
                      <td className="p-4 border-r text-center">
                        {c.step10_billing?.status || "PENDING"}
                      </td>
                      <td className="p-4 border-r text-center font-black text-emerald-600">
                        {c.step11_closure?.closureStatus || "OPEN"}
                      </td>

                      <td className="p-4 sticky right-0 bg-white border-l shadow-[-10px_0px_20px_rgba(0,0,0,0.05)]">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => setSelectedComplaint(c)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg font-bold transition-all"
                          >
                            <Eye size={14} /> View
                          </button>
                          <button
                            onClick={() => setUpdatingComplaint(c.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white rounded-lg font-bold transition-all"
                          >
                            <Edit2 size={14} /> Update
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* --- PAGINATION FOOTER --- */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-slate-500 font-bold uppercase tracking-tight">
            Showing{" "}
            <span className="text-slate-900">{indexOfFirstRecord + 1}</span> to{" "}
            <span className="text-slate-900">
              {Math.min(indexOfLastRecord, filteredComplaints.length)}
            </span>{" "}
            of{" "}
            <span className="text-slate-900">{filteredComplaints.length}</span>{" "}
            records
          </p>
          <div className="flex gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
              className="p-2 border border-slate-200 rounded-lg bg-white hover:bg-gray-100 disabled:opacity-40 transition-all shadow-sm"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="flex gap-1">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 text-xs font-black rounded-lg border transition-all ${
                    currentPage === i + 1
                      ? "bg-slate-900 text-white border-slate-900 shadow-md"
                      : "bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className="p-2 border border-slate-200 rounded-lg bg-white hover:bg-gray-100 disabled:opacity-40 transition-all shadow-sm"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
      <p className="mt-6 text-[9px] text-slate-400 font-black uppercase tracking-[0.3em] text-center">
        Operational Service Ledger • CMS System
      </p>
    </div>
  );
};

export default ComplaintFMS;
