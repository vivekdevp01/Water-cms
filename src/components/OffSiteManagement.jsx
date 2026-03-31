import React, { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../backend/config/firebase";
import { Link, useNavigate } from "react-router-dom"; 
import { Edit2, Eye, LayoutDashboard, Truck, Filter, RefreshCw, ClipboardList, ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";

import OffsiteUpdateModal from "./OffSiteWorkflow";
import { OffsiteComplaintViewModal } from "./OffsiteComplaintViewModal";

const OFFSITE_STEPS = [
  { fs: 81, label: "REMOVAL (S1)", key: "step81_removal" },
  { fs: 82, label: "INWARD (S2)", key: "step82_storeInward" },
  { fs: 83, label: "VENDOR LIST (S3)", key: "step83_vendorShortlist" },
  { fs: 84, label: "VENDOR FINAL (S4)", key: "step84_vendorSelection" },
  { fs: 85, label: "PO (S5)", key: "step85_po" },
  { fs: 86, label: "ADVANCE (S6)", key: "step86_advance" },
  { fs: 87, label: "DISPATCH (S7)", key: "step87_dispatch" },
  { fs: 88, label: "REPAIR (S8)", key: "step88_repair" },
  { fs: 89, label: "RETURN (S9)", key: "step89_return" },
  { fs: 90, label: "QC (S10)", key: "step90_qc" },
];

const getOffsiteStatusBadge = (currentStep = 81) => {
  const map = {
    81: "Step 1: Removal",
    82: "Step 2: Store Inward",
    83: "Step 3: Vendor Shortlist",
    84: "Step 4: Vendor Selection",
    85: "Step 5: PO Issued",
    86: "Step 6: Advance Payment",
    87: "Step 7: Dispatch",
    88: "Step 8: Repair",
    89: "Step 9: Return",
    90: "Completed",
  };
  return map[currentStep] || "In Progress";
};

const OffSiteManagement = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [viewComplaint, setViewComplaint] = useState(null);
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const [filters, setFilters] = useState({
    name: "",
    product: "",
    warrantyStatus: "",
    currentStep: "",
    sortByLatest: true,
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(1); 
  };

  const clearFilters = () => {
    setFilters({
      name: "",
      product: "",
      warrantyStatus: "",
      currentStep: "",
      sortByLatest: true,
    });
    setCurrentPage(1);
  };

  useEffect(() => {
    const q = query(
      collection(db, "complaints"),
      where("flowType", "==", "OFFSITE")
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      setComplaints(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredComplaints = complaints
    .filter((c) => {
      const cd = c.complaintDetails || {};
      const cStep = c.currentStep !== undefined ? String(c.currentStep) : "";
      return (
        (!filters.name || (cd.name || "").toLowerCase().includes(filters.name.toLowerCase())) &&
        (!filters.product || (cd.product || "").toLowerCase().includes(filters.product.toLowerCase())) &&
        (!filters.warrantyStatus || (cd.warrantyStatus || "").toLowerCase() === filters.warrantyStatus.toLowerCase()) &&
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
  const currentRecords = filteredComplaints.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredComplaints.length / recordsPerPage);

  if (viewComplaint) {
    return <OffsiteComplaintViewModal complaint={viewComplaint} onClose={() => setViewComplaint(null)} />;
  }

  if (selectedComplaint) {
    return (
      <OffsiteUpdateModal
        complaintId={selectedComplaint.id}
        initialComplaint={selectedComplaint}
        onClose={() => setSelectedComplaint(null)}
      />
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      <div className="mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-amber-100 rounded-lg">
            <Truck className="text-amber-600" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Off-Site Workflow</h1>
            <p className="text-sm text-slate-500 font-medium">Repair & Vendor Management Ledger</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 shadow-sm">
            <LayoutDashboard size={14} /> Dashboard
          </Link>
          <button onClick={() => navigate("/complaintfms")} className="flex items-center gap-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold shadow-sm">
            <ArrowLeft size={14} /> View FMS
          </button>
          <div className="flex items-center bg-slate-200 p-1 rounded-xl shadow-inner">
            <Link to="/onsite-mgmt" className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all text-slate-600 hover:bg-white hover:text-blue-600">
              <ClipboardList size={14} /> On-Site
            </Link>
            <div className="w-[1px] h-4 bg-slate-300 mx-1"></div>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-white text-amber-600 shadow-sm border border-amber-100">
              <Truck size={14} /> Off-Site
            </button>
          </div>
        </div>
      </div>

      {/* FILTER BOX */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-6 text-xs">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-slate-700 font-bold">
            <Filter size={18} className="text-amber-500" /> <h2 className="text-sm">Search Off-Site Leads</h2>
          </div>
          <button onClick={clearFilters} className="text-amber-600 hover:text-amber-700 text-[11px] font-black uppercase tracking-wider flex items-center gap-1">
            <RefreshCw size={12} /> Reset
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <input type="text" name="name" value={filters.name} onChange={handleFilterChange} placeholder="Search Customer..." className="p-2.5 border rounded-lg bg-slate-50 outline-none" />
          <input type="text" name="product" value={filters.product} onChange={handleFilterChange} placeholder="Search Product..." className="p-2.5 border rounded-lg bg-slate-50 outline-none" />
          <select name="warrantyStatus" value={filters.warrantyStatus} onChange={handleFilterChange} className="p-2.5 border rounded-lg bg-slate-50 outline-none">
            <option value="">All Warranty Status</option>
            <option value="In-Warranty">In Warranty</option>
            <option value="Out-of-Warranty">Out of Warranty</option>
          </select>
          <select name="currentStep" value={filters.currentStep} onChange={handleFilterChange} className="p-2.5 border rounded-lg bg-slate-50 outline-none">
            <option value="">All Steps</option>
            {OFFSITE_STEPS.map(s => <option key={s.fs} value={s.fs}>{s.label}</option>)}
          </select>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="min-w-[2200px] w-full text-[11px] text-left border-collapse">
            <thead className="bg-slate-900 text-slate-200 sticky top-0 z-10 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-4 border-r border-slate-800">Lead ID</th>
                <th className="p-4 bg-slate-800 border-r border-slate-700">Customer</th>
                <th className="p-4 bg-slate-800 border-r border-slate-700">Product</th>
                <th className="p-4 border-r border-slate-800 text-center">Current Status</th>
                {OFFSITE_STEPS.map((s) => (
                  <th key={s.fs} className="p-4 border-r border-slate-800 text-center opacity-80">{s.label}</th>
                ))}
                <th className="p-4 sticky right-0 bg-slate-900 text-center shadow-[-10px_0px_20px_rgba(0,0,0,0.3)]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr><td colSpan={15} className="p-20 text-center text-slate-400 font-bold text-lg animate-pulse">Synchronizing Off-Site Data...</td></tr>
              ) : currentRecords.length === 0 ? (
                <tr><td colSpan={15} className="p-20 text-center text-slate-400 font-bold">No records found matching filters.</td></tr>
              ) : (
                currentRecords.map((c) => (
                  <tr key={c.id} className="hover:bg-amber-50/30 transition-colors whitespace-nowrap group">
                    <td className="p-4 border-r font-mono font-bold text-amber-600 bg-slate-50/50">{c.id.slice(0, 8)}</td>
                    <td className="p-4 border-r font-bold text-slate-800 uppercase">{c.complaintDetails?.name || "—"}</td>
                    <td className="p-4 border-r font-medium text-slate-700">{c.complaintDetails?.product || "—"}</td>
                    <td className="p-4 border-r text-center">
                      <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-black text-[9px] border shadow-sm">
                        {getOffsiteStatusBadge(c.currentStep)}
                      </span>
                    </td>
                    {OFFSITE_STEPS.map((s) => {
                      const stepData = c.offsite?.[s.key]; // ACCESS NESTED OFFSITE OBJECT
                      const isDone = !!stepData?.actualAt; // CHECK IF STEP IS COMPLETED
                      const isActive = c.currentStep === s.fs;

                      return (
                        <td key={s.fs} className="p-4 border-r text-center">
                          <span className={`px-3 py-1 rounded-full text-[9px] font-black tracking-tighter shadow-sm border ${
                              isDone ? "bg-emerald-50 text-emerald-700 border-emerald-100" : 
                              isActive ? "bg-amber-100 text-amber-700 border-amber-200 animate-pulse" : 
                              "bg-slate-50 text-slate-400 border-slate-100"
                            }`}>
                            {isDone ? (stepData.status || "DONE") : isActive ? "● ACTIVE" : "PENDING"}
                          </span>
                        </td>
                      );
                    })}
                    <td className="p-4 sticky right-0 bg-white border-l shadow-[-10px_0px_20px_rgba(0,0,0,0.05)] z-20 text-center">
                      <div className="flex gap-2 justify-center">
                        <button onClick={() => setViewComplaint(c)} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg font-bold transition-all"><Eye size={14} /> View</button>
                        <button onClick={() => setSelectedComplaint(c)} className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white rounded-lg font-bold transition-all"><Edit2 size={14} /> Update</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* PAGINATION FOOTER */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-4">
          <p className="text-[11px] text-slate-500 font-bold uppercase">Showing {indexOfFirstRecord + 1} to {Math.min(indexOfLastRecord, filteredComplaints.length)} of {filteredComplaints.length} records</p>
          <div className="flex gap-2">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="p-2 border rounded-lg bg-white disabled:opacity-40"><ChevronLeft size={16} /></button>
            <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(prev => prev + 1)} className="p-2 border rounded-lg bg-white disabled:opacity-40"><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OffSiteManagement;