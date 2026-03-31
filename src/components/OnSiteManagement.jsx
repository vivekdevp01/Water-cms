import React, { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../backend/config/firebase";
import { Link, useNavigate } from "react-router-dom";
import { Edit2, LayoutDashboard , Eye, Filter, RefreshCw, ClipboardList, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";

import OnsiteUpdateModal from "./OnSiteWorkflow";
import { OnsiteComplaintViewModal } from "./OnsiteComplaintViewModal";

/* 🔵 ONSITE STEP DEFINITIONS WITH KEYS MAPPED TO FIREBASE */
const ONSITE_STEPS = [
  { fs: 71, label: "FILL INDENT (S1)", key: "step71_indent" },
  { fs: 72, label: "HOD APPROVAL (S2)", key: "step72_approval" },
  { fs: 73, label: "SPARE ISSUE (S3)", key: "step73_spareIssue" },
];

const getOnsiteStatusBadge = (currentStep = 71) => {
  const map = {
    71: "Step 1: Indent Creation",
    72: "Step 2: HOD / Commercial Approval",
    73: "Step 3: Spare Issue",
    8: "Rectification",
  };
  return map[currentStep] || "In Progress";
};

const OnSiteManagement = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [viewComplaint, setViewComplaint] = useState(null);
  const navigate = useNavigate();

  // --- PAGINATION STATE ---
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
      where("flowType", "==", "ONSITE")
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
    return <OnsiteComplaintViewModal complaint={viewComplaint} onClose={() => setViewComplaint(null)} />;
  }

  if (selectedComplaint) {
    return (
      <OnsiteUpdateModal
        complaintId={selectedComplaint.id}
        initialComplaint={selectedComplaint}
        onClose={() => setSelectedComplaint(null)}
      />
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      
      {/* HEADER SECTION */}
      <div className="mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            <ClipboardList className="text-blue-600" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">On-Site Workflow</h1>
            <p className="text-sm text-slate-500 font-medium">Internal Indent & Spares Management</p>
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
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-white text-blue-600 shadow-sm border border-blue-100">
              On-Site
            </button>
            <div className="w-[1px] h-4 bg-slate-300 mx-1"></div>
            <Link to="/offsite-mgmt" className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all text-slate-600 hover:bg-white hover:text-amber-600">
              Off-Site
            </Link>
          </div>
        </div>
      </div>

      {/* FILTER SECTION */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-6 text-xs">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-slate-700 font-bold">
            <Filter size={18} className="text-blue-500" /> <h2 className="text-sm">Filter On-Site Records</h2>
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 font-bold text-slate-600 cursor-pointer">
              <input 
                type="checkbox" 
                className="rounded border-slate-300 text-blue-600"
                checked={filters.sortByLatest} 
                onChange={(e) => setFilters(p => ({...p, sortByLatest: e.target.checked}))} 
              /> Latest First
            </label>
            <button onClick={clearFilters} className="text-amber-600 hover:text-amber-700 text-[11px] font-black uppercase tracking-wider flex items-center gap-1">
              <RefreshCw size={12} /> Reset
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <input type="text" name="name" value={filters.name} onChange={handleFilterChange} placeholder="Search Customer..." className="p-2.5 border border-slate-200 rounded-lg bg-slate-50 outline-none font-medium" />
          <input type="text" name="product" value={filters.product} onChange={handleFilterChange} placeholder="Search Product..." className="p-2.5 border border-slate-200 rounded-lg bg-slate-50 outline-none font-medium" />
          <select name="warrantyStatus" value={filters.warrantyStatus} onChange={handleFilterChange} className="p-2.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-700 outline-none">
            <option value="">All Status</option>
            <option value="In-Warranty">In Warranty</option>
            <option value="Out-of-Warranty">Out of Warranty</option>
          </select>
          <select name="currentStep" value={filters.currentStep} onChange={handleFilterChange} className="p-2.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-700 outline-none">
            <option value="">All Steps</option>
            {ONSITE_STEPS.map(s => <option key={s.fs} value={s.fs}>{s.label}</option>)}
          </select>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="min-w-[1600px] w-full text-[11px] text-left border-collapse">
            <thead className="bg-slate-900 text-slate-200 sticky top-0 z-10 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-4 border-r border-slate-800">Lead ID</th>
                <th className="p-4 bg-slate-800 border-r border-slate-700">Customer</th>
                <th className="p-4 bg-slate-800 border-r border-slate-700">Product</th>
                <th className="p-4 border-r border-slate-800 text-center">Current Status</th>
                {ONSITE_STEPS.map((s) => (
                  <th key={s.fs} className="p-4 border-r border-slate-800 text-center opacity-80">{s.label}</th>
                ))}
                <th className="p-4 sticky right-0 bg-slate-900 text-center shadow-[-10px_0px_20px_rgba(0,0,0,0.3)]">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr><td colSpan={8} className="p-20 text-center text-slate-400 font-bold text-lg animate-pulse">Synchronizing On-Site Data...</td></tr>
              ) : currentRecords.length === 0 ? (
                <tr><td colSpan={8} className="p-20 text-center text-slate-400 font-bold">No records found matching filters.</td></tr>
              ) : (
                currentRecords.map((c) => {
                  const cd = c.complaintDetails || {};
                  return (
                    <tr key={c.id} className="hover:bg-blue-50/40 transition-colors whitespace-nowrap group">
                      <td className="p-4 border-r font-mono font-bold text-blue-600 bg-slate-50/50">{c.id.slice(0, 8)}</td>
                      <td className="p-4 border-r font-bold text-slate-800 uppercase">{cd.name || "—"}</td>
                      <td className="p-4 border-r font-medium text-slate-700">{cd.product || "—"}</td>
                      <td className="p-4 border-r text-center">
                        <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-black text-[9px] border shadow-sm">
                          {getOnsiteStatusBadge(c.currentStep)}
                        </span>
                      </td>

                      {ONSITE_STEPS.map((s) => {
                        const stepData = c.onsite?.[s.key]; // ACCESS NESTED ONSITE OBJECT
                        const isDone = !!stepData?.actualAt; 
                        const isActive = c.currentStep === s.fs;
                        
                        return (
                          <td key={s.fs} className="p-4 border-r text-center">
                            <span className={`px-3 py-1 rounded-full text-[9px] font-black tracking-tighter shadow-sm border ${
                                isDone ? "bg-emerald-50 text-emerald-700 border-emerald-100" : 
                                isActive ? "bg-blue-100 text-blue-700 border-blue-200 animate-pulse" : 
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
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* --- PAGINATION FOOTER --- */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-slate-500 font-bold uppercase tracking-tight">
            Showing <span className="text-slate-900">{indexOfFirstRecord + 1}</span> to <span className="text-slate-900">{Math.min(indexOfLastRecord, filteredComplaints.length)}</span> of <span className="text-slate-900">{filteredComplaints.length}</span> records
          </p>
          <div className="flex gap-2">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="p-2 border border-slate-200 rounded-lg bg-white disabled:opacity-40 transition-all shadow-sm"><ChevronLeft size={16} /></button>
            <div className="flex gap-1">
              {[...Array(totalPages)].map((_, i) => (
                <button key={i} onClick={() => setCurrentPage(i + 1)} className={`px-3 py-1 text-xs font-black rounded-lg border transition-all ${currentPage === i + 1 ? "bg-slate-900 text-white border-slate-900 shadow-md" : "bg-white text-slate-600 hover:bg-slate-50"}`}>{i + 1}</button>
              ))}
            </div>
            <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(prev => prev + 1)} className="p-2 border border-slate-200 rounded-lg bg-white disabled:opacity-40 transition-all shadow-sm"><ChevronRight size={16} /></button>
          </div>
        </div>
      </div> 
      <p className="mt-6 text-[9px] text-slate-400 font-black uppercase tracking-[0.3em] text-center">On-Site Spares Module • System v2.1</p>
    </div>
  );
};

export default OnSiteManagement;