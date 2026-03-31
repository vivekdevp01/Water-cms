import React from "react";
import {
  X,
  User,
  Phone,
  Package,
  Shield,
  Calendar,
  MapPin,
  ClipboardList,
  CheckCircle2,
  Hash,
  FileText,
  AlertCircle,
  IndianRupee,
  HardHat,
  Search,
  Users,
  ExternalLink,
  Truck,
  Settings,
  CreditCard,
} from "lucide-react";

/* ---------------- HELPER: FILE LINK ---------------- */
const FileLink = ({ url, label }) => {
  if (!url) return null;
  return (
    <div className="col-span-2 mt-1">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-[11px] font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors"
      >
        <ExternalLink size={12} />
        View Attachment: {label}
      </a>
    </div>
  );
};

// Helper to format Firebase Timestamps safely
const formatTime = (ts) => ts?.toDate?.() ? ts.toDate().toLocaleDateString() : (ts || "Not updated");

// Helper to handle the mediaMeta array structure saved in Step 1
const MediaGallery = ({ mediaArray }) => {
  if (!mediaArray || mediaArray.length === 0) return <p className="text-xs text-gray-300 italic">No media</p>;
  return (
    <div className="flex flex-wrap gap-2 col-span-2">
      {mediaArray.map((item, idx) => (
        <FileLink key={idx} url={item.path} label={`Attachment ${idx + 1}`} />
      ))}
    </div>
  );
};

/* ---------------- INFO ROW ---------------- */
const InfoRow = ({ icon: Icon, label, value, color = "text-gray-400" }) => (
  <div className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
    <Icon size={14} className={`${color} mt-0.5`} />
    <div>
      <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">
        {label}
      </p>
      <p
        className={`text-sm font-medium ${
          value ? "text-gray-700" : "text-gray-300 italic"
        }`}
      >
        {value || "Not updated"}
      </p>
    </div>
  </div>
);

/* ---------------- STEP CARD ---------------- */
const StepCard = ({ title, icon: Icon, color, isCompleted, children }) => (
  <div className="relative pl-6 pb-6 last:pb-0">
    <div className="absolute left-[11px] top-7 bottom-0 w-0.5 bg-gray-100 last:hidden" />
    <div className={`absolute left-0 top-0 p-1.5 rounded-full z-10 shadow-sm ${isCompleted ? color : "bg-gray-300"} text-white`}>
      {isCompleted ? <Icon size={12} /> : <AlertCircle size={12} />}
    </div>
    <div className={`bg-white border rounded-xl p-4 shadow-sm ${isCompleted ? "opacity-100" : "opacity-60 bg-gray-50/40"}`}>
      <div className="flex justify-between items-center mb-2 border-b pb-1">
        <h4 className="text-xs font-bold text-gray-800">{title}</h4>
      </div>
      <div className="grid grid-cols-2 gap-3">{children}</div>
    </div>
  </div>
);

/* ---------------- MAIN MODAL ---------------- */
export const ComplaintViewModal = ({ complaint, onClose }) => {
  if (!complaint) return null;

  const d = complaint.complaintDetails || {};

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#f8fafc] w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* HEADER */}
        <div className="bg-slate-900 px-6 py-5 flex justify-between items-center text-white">
          <div>
            <h2 className="text-xl font-bold">Complaint Master View</h2>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Ref ID: {complaint.id}
            </p>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-white/10 p-2 rounded-full"
          >
            <X size={22} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LEFT PANEL */}
            <div className="space-y-6">
              <section>
                <h3 className="text-[11px] font-black text-blue-600 uppercase mb-3 flex items-center gap-2">
                  <User size={14} /> Customer Details
                </h3>
                <div className="bg-white p-4 rounded-xl border shadow-sm">
                  <InfoRow icon={User} label="Customer Name" value={d.name} />
                  <InfoRow
                    icon={Phone}
                    label="Phone"
                    value={d.registeredContactNo}
                  />
                  <InfoRow icon={MapPin} label="Address" value={d.address} />
                </div>
              </section>

              <section>
                <h3 className="text-[11px] font-black text-indigo-600 uppercase mb-3 flex items-center gap-2">
                  <Package size={14} /> Asset Details
                </h3>
                <div className="bg-white p-4 rounded-xl border shadow-sm">
                  <InfoRow icon={Package} label="Product" value={d.product} />
                  <InfoRow
                    icon={Shield}
                    label="Warranty Status"
                    value={d.warrantyStatus}
                  />
                  <InfoRow
                    icon={Calendar}
                    label="Installation Date"
                    value={d.dateOfInstallation?.toDate?.().toLocaleDateString()}
                  />
                  <InfoRow
                    icon={ClipboardList}
                    label="Issue Nature"
                    value={d.natureOfComplaint}
                  />
                </div>
              </section>
            </div>

            {/* WORKFLOW */}
            <div className="lg:col-span-2 space-y-1">
              <h3 className="text-[11px] font-black text-emerald-600 uppercase mb-4 flex items-center gap-2">
                <HardHat size={14} /> Decision Workflow
              </h3>

              {/* STEP 1 */}
              
                <StepCard
                  title="Step 1: Verification"
                  icon={Search}
                  color="bg-blue-500"
                  isCompleted={!!complaint.step1_verification?.actualAt}
                >
                  {/* Complaint Type */}
                  <InfoRow 
                    label="Complaint Type" 
                    value={complaint.step1_verification?.complaintType} 
                    icon={Hash} 
                  />

                  {/* Bill Copy Details Group */}
                  <div className="col-span-2 bg-slate-50 p-3 rounded-lg border border-slate-100 mt-1">
                    <p className="text-[9px] font-black text-slate-500 uppercase mb-2 tracking-widest flex items-center gap-1">
                      <FileText size={10} /> Bill Copy Details
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <InfoRow 
                        label="Bill Number" 
                        value={complaint.step1_verification?.billDetails?.billNo} 
                        icon={Hash} 
                      />
                      <InfoRow 
                        label="Bill Date" 
                        value={formatTime(complaint.step1_verification?.billDetails?.billDate)}
                        icon={Calendar} 
                      />
                      <div className="col-span-2">
                        <InfoRow 
                          label="Model Number" 
                          value={complaint.step1_verification?.billDetails?.modelNo} 
                          icon={Settings} 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Media Uploads */}
                  <div className="col-span-2">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mt-2 mb-1">Uploaded Media</p>
                    <div className="flex flex-wrap gap-2">
                      {complaint.step1_verification?.verificationMedia?.map((url, index) => (
                        <FileLink key={index} url={url} label={`Media ${index + 1}`} />
                        
                      ))}
                      <MediaGallery mediaArray={complaint.step1_verification?.mediaMeta} />
                      
                    </div>
                  </div>

                  {/* Status & Planning */}
                  <InfoRow 
                    label="Planned Completion" 
                    value={formatTime(complaint.step1_verification?.plannedAt)} 
                    icon={Calendar} 
                    color="text-amber-500"
                  />
                  <InfoRow 
                    label="Verification Status" 
                    value={complaint.step1_verification?.status} 
                    icon={CheckCircle2} 
                    color={complaint.step1_verification?.status === "Verified" ? "text-emerald-500" : "text-amber-500"}
                  />

                  {/* Resolution Log */}
                  <div className="col-span-2 bg-slate-50 p-3 rounded-lg border border-slate-100 mt-1">
                  <p className="text-[9px] font-black text-slate-500 uppercase mb-2 tracking-widest flex items-center gap-1">
                    <FileText size={10} />Remarks 
                  </p>
                  <p className="text-sm font-medium text-gray-700 leading-relaxed">
                    {complaint.step1_verification?.remarks || "No special instructions provided."}
                  </p>
                </div>
                  
                </StepCard>

              {/* STEP 2 */}
              
              <StepCard
                title="Step 2: Assignment"
                icon={User}
                color="bg-indigo-500"
                isCompleted={!!complaint.step2_assignment?.actualAt}
              >
                {/* Division & Product Engineer */}
                <InfoRow 
                  label="Division" 
                  value={complaint.step2_assignment?.division} 
                  icon={Users} 
                />
                <InfoRow 
                  label="Product Engineer" 
                  value={complaint.step2_assignment?.engineerId} 
                  icon={User} 
                />

                {/* Planned Assignment Completion */}
                <div className="col-span-2">
                  <InfoRow 
                    label="Planned Assignment Completion" 
                    value={formatTime(complaint.step2_assignment?.plannedAt)} 
                    icon={Calendar} 
                    color="text-amber-500"
                  />
                  
                </div>

                {/* Assignment Status */}
                <div className="col-span-2">
                  <InfoRow 
                    label="Assignment Status" 
                    value={complaint.step2_assignment?.status} 
                    icon={CheckCircle2} 
                    color={complaint.step2_assignment?.status === "Assigned" ? "text-emerald-500" : "text-amber-500"}
                  />
                </div>

                {/* Special Instructions */}
                <div className="col-span-2 bg-slate-50 p-3 rounded-lg border border-slate-100 mt-1">
                  <p className="text-[9px] font-black text-slate-500 uppercase mb-2 tracking-widest flex items-center gap-1">
                    <FileText size={10} />Remarks 
                  </p>
                  <p className="text-sm font-medium text-gray-700 leading-relaxed">
                    {complaint.step2_assignment?.remarks || "No special instructions provided."}
                  </p>
                </div>
              </StepCard>

              {/* STEP 3 */}
              
              <StepCard
                title="Step 3: Estimated Offer"
                icon={IndianRupee}
                color="bg-amber-500"
                isCompleted={!!complaint.step3_estimatedOffer?.actualAt}
              >
                {/* Quotation ID & Estimated Cost */}
                <InfoRow 
                  label="Quotation ID" 
                  value={complaint.step3_estimatedOffer?.quotationId} 
                  icon={Hash} 
                />
                <InfoRow 
                  label="Estimated Cost" 
                  value={complaint.step3_estimatedOffer?.estimatedCost} 
                  icon={IndianRupee} 
                />

                {/* Offer Status */}
                <div className="col-span-2">
                  <InfoRow 
                    label="Offer Status" 
                    value={complaint.step3_estimatedOffer?.status} 
                    icon={CheckCircle2} 
                    color={complaint.step3_estimatedOffer?.offerStatus === "Sent" ? "text-emerald-500" : "text-amber-500"}
                  />
                </div>

                {/* Uploaded Offer Copy */}
                <div className="col-span-2">
                  <FileLink 
                    url={complaint.step3_estimatedOffer?.offerCopyMeta?.path} 
                    label="Offer Copy (PDF/Image)" 
                  />
                </div>

                {/* Timeline & Validity Group */}
                <div className="col-span-2 bg-slate-50 p-3 rounded-lg border border-slate-100 mt-1">
                  <p className="text-[9px] font-black text-slate-500 uppercase mb-2 tracking-widest flex items-center gap-1">
                    <Calendar size={10} /> Timeline & Validity
                  </p>
                  <div className="space-y-1">
                    <InfoRow 
                      label="Planned Offer Date" 
                      value={formatTime(complaint.step3_estimatedOffer?.plannedAt)} 
                      icon={Calendar} 
                    />
                    <InfoRow 
                      label="Offer Validity Until" 
                      value={formatTime(complaint.step3_estimatedOffer?.validUntil)} 
                      icon={Calendar} 
                    />
                    
                  </div>
                  <div className="col-span-2 bg-slate-50 p-3 rounded-lg border border-slate-100 mt-1">
                  <p className="text-[9px] font-black text-slate-500 uppercase mb-2 tracking-widest flex items-center gap-1">
                    <FileText size={10} />Remarks 
                  </p>
                  <p className="text-sm font-medium text-gray-700 leading-relaxed">
                    {complaint.step3_estimatedOffer.remarks || "No special instructions provided."}
                  </p>
                </div>
                </div>
              </StepCard>

              {/* STEP 4 */}
              
              <StepCard
                title="Step 4: Response Acknowledgement"
                icon={CheckCircle2}
                color="bg-purple-500"
                isCompleted={!!complaint.step4_responseAck?.actualAt}
              >
                {/* Status Section */}
                <div className="col-span-2">
                  <InfoRow 
                    label="Acceptance Status" 
                    value={complaint.step4_responseAck?.status} 
                    icon={CheckCircle2} 
                    color={complaint.step4_responseAck?.status === "Accepted" ? "text-emerald-500" : "text-amber-500"}
                  />
                </div>

                {/* Document Uploads */}
                <div className="col-span-2 space-y-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mt-2 mb-1">Uploaded Documents</p>
                  <div className="flex flex-wrap gap-3">
                    <FileLink 
                      url={complaint.step4_responseAck?.acknowledgeCopyMeta?.path} 
                      label="Acknowledge Copy" 
                    />
                    <FileLink 
                      url={complaint.step4_responseAck?.poCopyMeta?.path} 
                      label="Purchase Order (PO) Copy" 
                    />
                  </div>
                </div>

                {/* Acceptance Timeline Group */}
                <div className="col-span-2 bg-slate-50 p-3 rounded-lg border border-slate-100 mt-2">
                  <p className="text-[9px] font-black text-slate-500 uppercase mb-2 tracking-widest flex items-center gap-1">
                    <Calendar size={10} /> Acceptance Timeline
                  </p>
                  <div className="space-y-1">
                    <InfoRow 
                      label="Planned Acceptance Date" 
                      value={formatTime(complaint.step4_responseAck?.plannedAt)} 
                      icon={Calendar} 
                    />
                  </div>
                  <div className="col-span-2 bg-slate-50 p-3 rounded-lg border border-slate-100 mt-1">
                  <p className="text-[9px] font-black text-slate-500 uppercase mb-2 tracking-widest flex items-center gap-1">
                    <FileText size={10} />Remarks 
                  </p>
                  <p className="text-sm font-medium text-gray-700 leading-relaxed">
                    {complaint.step4_responseAck?.remarks || "No special instructions provided."}
                  </p>
                </div>
                </div>
              </StepCard>

              {/* STEP 5 */}
              
              <StepCard
                title="Step 5: Site Visit"
                icon={MapPin}
                color="bg-pink-500"
                isCompleted={!!complaint.step5_siteVisit?.actualAt}
              >
                {/* Status Section */}
                <div className="col-span-2">
                  <InfoRow 
                    label="Site Visit Status" 
                    value={complaint.step5_siteVisit?.status} 
                    icon={CheckCircle2} 
                    color={complaint.step5_siteVisit?.status=== "Confirmed" ? "text-emerald-500" : "text-amber-500"}
                  />
                </div>

                {/* Document Uploads */}
                <div className="col-span-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mt-2 mb-1">Visit Documentation</p>
                  <FileLink 
                    url={complaint.step5_siteVisit?.siteVisitCopyMeta?.path} 
                    label="Site Visit Copy" 
                  />
                </div>

                {/* Site Visit Timeline Group */}
                <div className="col-span-2 bg-slate-50 p-3 rounded-lg border border-slate-100 mt-2">
                  <p className="text-[9px] font-black text-slate-500 uppercase mb-2 tracking-widest flex items-center gap-1">
                    <Calendar size={10} /> Site Visit Timeline
                  </p>
                  <div className="space-y-1">
                    <InfoRow 
                      label="Planned Site Visit Date" 
                      value={formatTime(complaint.step5_siteVisit?.plannedAt)} 
                      icon={Calendar} 
                    />
                  </div>
                  <div className="col-span-2 bg-slate-50 p-3 rounded-lg border border-slate-100 mt-1">
                  <p className="text-[9px] font-black text-slate-500 uppercase mb-2 tracking-widest flex items-center gap-1">
                    <FileText size={10} />Remarks 
                  </p>
                  <p className="text-sm font-medium text-gray-700 leading-relaxed">
                    {complaint.step5_siteVisit?.remarks || "No special instructions provided."}
                  </p>
                </div>
                </div>
              </StepCard>

              {/* STEP 6 */}
              
              <StepCard
                title="Step 6: Final Offer Decision"
                icon={CheckCircle2}
                color="bg-emerald-500"
                isCompleted={!!complaint.step6_finalOffer?.actualAt}
              >
                {/* Final Status Section */}
                <InfoRow 
                  label="Final Status" 
                  value={complaint.step6_finalOffer?.status} 
                  icon={CheckCircle2} 
                  color={complaint.step6_finalOffer?.status === "Completed" ? "text-emerald-500" : "text-amber-500"}
                />
                
                {/* Rectification Type */}
                <InfoRow 
                  label="Rectification Type" 
                  value={complaint.flowType}
                  icon={Settings} 
                />

                {/* Document Uploads */}
                <div className="col-span-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mt-2 mb-1">Final Documentation</p>
                  <FileLink 
                    url={complaint.step6_finalOffer?.finalCopyMeta?.path} 
                    label="Final Copy" 
                  />
                </div>

                {/* Final Decision Timeline Group */}
                <div className="col-span-2 bg-slate-50 p-3 rounded-lg border border-slate-100 mt-2">
                  <p className="text-[9px] font-black text-slate-500 uppercase mb-2 tracking-widest flex items-center gap-1">
                    <Calendar size={10} /> Final Timeline
                  </p>
                  <div className="space-y-1">
                    <InfoRow 
                      label="Planned Offer Date" 
                      value={formatTime(complaint.step6_finalOffer?.plannedAt)} 
                      icon={Calendar} 
                    />
                    
                  </div>
                  <div className="col-span-2 bg-slate-50 p-3 rounded-lg border border-slate-100 mt-1">
                  <p className="text-[9px] font-black text-slate-500 uppercase mb-2 tracking-widest flex items-center gap-1">
                    <FileText size={10} />Remarks 
                  </p>
                  <p className="text-sm font-medium text-gray-700 leading-relaxed">
                    {complaint.step6_finalOffer?.remarks || "No special instructions provided."}
                  </p>
                </div>
                </div>
              </StepCard>

              {/* STEP 7 */}
              {/* STEP 7: FLOW-SPECIFIC STATUS */}
              <StepCard
                title={`Step 7: ${complaint.flowType === "ONSITE" ? "On-Site Indent" : "Off-Site Logistics"}`}
                icon={complaint.flowType === "ONSITE" ? ClipboardList : Truck}
                color={complaint.flowType === "ONSITE" ? "bg-blue-500" : "bg-amber-500"}
                isCompleted={
                  complaint.flowType === "ONSITE" 
                    ? !!complaint.onsite?.step73_spareIssue?.actualAt 
                    : !!complaint.offsite?.step90_qc?.actualAt
                }
              >
                {/* ON-SITE DATA MAPPING */}
                {complaint.flowType === "ONSITE" && (
                  <>
                    <InfoRow 
                      label="Current On-Site Step" 
                      value={complaint.currentStep === 71 ? "Indent Creation" : complaint.currentStep === 72 ? "HOD Approval" : "Spare Issued"} 
                      icon={CheckCircle2} 
                    />
                    <InfoRow 
                      label="Indent Status" 
                      value={complaint.onsite?.step71_indent?.status} 
                      icon={FileText} 
                    />
                    <FileLink url={complaint.onsite?.step71_indent?.indentCopyMeta?.path} label="Indent Copy" />
                    <div className="col-span-2">
                      <InfoRow label="Approval Remarks" value={complaint.onsite?.step72_approval?.remarks} icon={FileText} />
                    </div>
                  </>
                )}

                {/* OFF-SITE DATA MAPPING */}
                {complaint.flowType === "OFFSITE" && (
                  <>
                    <InfoRow 
                      label="Current Location" 
                      value={complaint.offsite?.step82_storeInward?.status === "Done" ? "In-Store" : "In-Transit"} 
                      icon={MapPin} 
                    />
                    <InfoRow 
                      label="Logistics Status" 
                      value={
                        complaint.currentStep === 81 ? "Removal" : 
                        complaint.currentStep === 85 ? "PO Issued" : 
                        complaint.currentStep === 90 ? "QC Completed" : "Processing"
                      } 
                      icon={Truck} 
                    />
                    <div className="col-span-2">
                      <InfoRow label="Latest Logistics Remarks" value={complaint.offsite?.step90_qc?.remarks || complaint.offsite?.step81_removal?.remarks} icon={FileText} />
                    </div>
                  </>
                )}
              </StepCard>

              {/* STEP 8 */}
              {/* STEP 8 - CORRECTED MAPPING FOR RECTIFICATION */}
              <StepCard
                title="Step 8: Rectification"
                icon={Settings}
                color="bg-blue-600"
                isCompleted={!!complaint.step8_rectification?.actualAt}
              >
                {/* Delegated Engineer - Mapped to 'engineerName' from service */}
                <div className="col-span-2">
                  <InfoRow 
                    label="Delegated Engineer" 
                    value={complaint.step8_rectification?.engineerName} 
                    icon={User} 
                  />
                </div>

                {/* Work Status - Mapped to 'status' from service */}
                <div className="col-span-2">
                  <InfoRow 
                    label="Work Status" 
                    value={complaint.step8_rectification?.status} 
                    icon={CheckCircle2} 
                    color={complaint.step8_rectification?.status === "Completed" ? "text-emerald-500" : "text-amber-500"}
                  />
                </div>

                {/* Planned Date Section */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 mt-2">
                  <p className="text-[9px] font-black text-slate-500 uppercase mb-2 tracking-widest flex items-center gap-1">
                    <Calendar size={10} /> Planned Timeline
                  </p>
                  <InfoRow 
                    label="Planned Date" 
                    value={formatTime(complaint.step8_rectification?.plannedAt)} 
                    icon={Calendar} 
                  />
                </div>

                {/* Remarks Section */}
                <div className="col-span-2">
                  <InfoRow 
                    label="Technical Remarks" 
                    value={complaint.step8_rectification?.remarks} 
                    icon={FileText} 
                  />
                </div>
              </StepCard>

              {/* STEP 9 */}
              
              {/* STEP 9 - CORRECTED KEY MAPPING */}
              <StepCard
                title="Step 9: QA Verification"
                icon={Shield}
                color="bg-purple-600"
                // FIXED: Changed step9_qaVerification to step9_qa
                isCompleted={!!complaint.step9_qa?.actualAt}
              >
                {/* FIXED: Changed mappings from complaint.step9_qaVerification to complaint.step9_qa */}
                <InfoRow 
                  label="QA Result" 
                  value={complaint.step9_qa?.qaResult} 
                  icon={Shield} 
                  color={complaint.step9_qa?.qaResult === 'PASS' ? 'text-emerald-600' : 'text-rose-600'} 
                />
                <InfoRow 
                  label="Overall Status" 
                  value={complaint.step9_qa?.status} 
                  icon={CheckCircle2} 
                />
                <InfoRow 
                  label="QA Date" 
                  value={formatTime(complaint.step9_qa?.actualAt)} 
                  icon={Calendar} 
                />

                <div className="col-span-2">
                  <InfoRow 
                    label="QA Remarks" 
                    value={complaint.step9_qa?.remarks} 
                    icon={FileText} 
                  />
                </div>          
              </StepCard>

              {/* STEP 10 */}
              
              <StepCard
                title="Step 10: Billing & Collection"
                icon={IndianRupee}
                color="bg-purple-600"
                isCompleted={!!complaint.step10_billing?.actualAt}
              >
                {/* CRM Responsible Personnel */}
                <div className="col-span-2">
                  <InfoRow 
                    label="CRM Responsible" 
                    value={complaint.step10_billing?.crmName} 
                    icon={User} 
                  />
                </div>

                {/* Billing & Collection Status */}
                <div className="col-span-2">
                  <InfoRow 
                    label="Billing & Collection Status" 
                    value={complaint.step10_billing?.status} 
                    icon={CheckCircle2} 
                    color={complaint.step10_billing?.status === "Collected" ? "text-emerald-500" : "text-amber-500"}
                  />
                </div>

                {/* Planned Billing Date Section */}
                <div className="col-span-2 bg-slate-50 p-3 rounded-lg border border-slate-100 mt-2">
                  <p className="text-[9px] font-black text-slate-500 uppercase mb-2 tracking-widest flex items-center gap-1">
                    <Calendar size={10} /> Billing Timeline
                  </p>
                  <div className="space-y-1">
                    <InfoRow 
                      label="Billing Date" 
                      value={formatTime(complaint.step10_billing?.actualAt)} 
                      icon={Calendar} 
                    />
                  </div>
                </div>
                <div className="col-span-2">
                   <InfoRow label="Billing Remarks" value={complaint.step10_billing?.remarks} icon={FileText} />
                </div>
              </StepCard>

              {/* STEP 11 */}
              {/* STEP 11 - CORRECTED MAPPING BASED ON SERVICE LOGIC */}
                  <StepCard
                    title="Step 11: Finalization & Closure"
                    icon={CheckCircle2}
                    color="bg-emerald-600"
                    isCompleted={!!complaint.step11_closure?.actualAt}
                  >
                    {/* CRM Responsible */}
                    <div className="col-span-2">
                      <InfoRow 
                        label="CRM Responsible" 
                        value={complaint.step11_closure?.crmName} 
                        icon={User} 
                      />
                    </div>

                    {/* Closure Type - Mapped to service 'closureType' */}
                    {/* <InfoRow 
                      label="Closure Type" 
                      value={complaint.step11_closure?.closureType} 
                      icon={CheckCircle2} 
                      color={complaint.step11_closure?.closureType === "Resolved" ? "text-emerald-500" : "text-amber-500"}
                    /> */}

                    {/* NPS Rating */}
                    <InfoRow 
                      label="Net Promoter Score (NPS)" 
                      value={complaint.step11_closure?.npsRating} 
                      icon={Users} 
                    />

                    {/* Final Timeline Section */}
                    <div className="col-span-2 bg-slate-50 p-3 rounded-lg border border-slate-100 mt-2">
                      <p className="text-[9px] font-black text-slate-500 uppercase mb-2 tracking-widest flex items-center gap-1">
                        <Calendar size={10} /> Final Timeline
                      </p>
                      <div className="space-y-1">
                        <InfoRow 
                          label="Closure Date" 
                          value={formatTime(complaint.step11_closure?.actualAt)} 
                          icon={Calendar} 
                        />
                      </div>
                    </div>

                    {/* Closure Notes - Mapped to service 'closureNotes' */}
                    <div className="col-span-2">
                      <InfoRow 
                        label="Final Closing Notes" 
                        value={complaint.step11_closure?.closureNotes} 
                        icon={FileText} 
                      />
                    </div>
                  </StepCard>

            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="bg-white px-6 py-4 flex justify-end border-t">
          <button
            onClick={onClose}
            className="px-8 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComplaintViewModal;