import React from "react";
import getDelay from "../backend/utils/getDelay";
import { ONSITE_TIMELINE_STEPS } from "../backend/constants/onSiteWork";
import { AlertCircle, Calendar, CheckCircle2, X } from "lucide-react";

/* ---------------- INFO ROW ---------------- */
const InfoRow = ({ icon: Icon, label, value, color = "text-gray-400" }) => (
  <div className="flex items-start gap-3 py-1.5 border-b border-gray-50 last:border-0">
    <Icon size={14} className={`${color} mt-0.5`} />
    <div>
      <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">
        {label}
      </p>
      <p className="text-xs font-medium text-gray-700">{value ?? "—"}</p>
    </div>
  </div>
);

/* ---------------- STEP CARD ---------------- */
const StepCard = ({ title, icon: Icon, color, isCompleted, children }) => (
  <div className="relative pl-6 pb-6 last:pb-0">
    {/* Vertical line */}
    <div className="absolute left-[11px] top-7 bottom-0 w-0.5 bg-gray-100 last:hidden" />

    {/* Step Icon */}
    <div
      className={`absolute left-0 top-0 p-1.5 rounded-full z-10 shadow-sm ${
        isCompleted ? color : "bg-gray-300"
      } text-white`}
    >
      {isCompleted ? <Icon size={12} /> : <AlertCircle size={12} />}
    </div>

    {/* Card */}
    <div
      className={`bg-white border rounded-xl p-4 shadow-sm transition-all ${
        isCompleted
          ? "opacity-100 border-gray-100"
          : "opacity-60 bg-gray-50/40 border-gray-50"
      }`}
    >
      <div className="flex justify-between items-center mb-2 border-b border-gray-50 pb-1">
        <h4 className="text-xs font-bold text-gray-800">{title}</h4>

        {!isCompleted && (
          <span className="text-[9px] font-bold text-gray-400 uppercase">
            Inactive
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">{children}</div>
    </div>
  </div>
);

/* ---------------- MAIN MODAL ---------------- */
export const OnsiteComplaintViewModal = ({ complaint, onClose }) => {
  if (!complaint) return null;

  const onsite = complaint.onsite || {};

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#f8fafc] w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* HEADER */}
        <div className="bg-slate-900 px-6 py-5 flex justify-between items-center text-white">
          <div>
            <h2 className="text-xl font-bold">Onsite Workflow Timeline</h2>
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
          <div className="space-y-1">
            {ONSITE_TIMELINE_STEPS.map((step) => {
              const data = onsite[step.key];
              const completed = !!data?.actualAt;

              return (
                <StepCard
                  key={step.key}
                  title={step.title}
                  icon={step.icon}
                  color={step.color}
                  isCompleted={completed}
                >
                  <InfoRow
                    icon={Calendar}
                    label="Planned Date"
                    value={data?.plannedAt?.toDate()?.toLocaleDateString()}
                  />

                  <InfoRow
                    icon={Calendar}
                    label="Actual Date"
                    value={data?.actualAt?.toDate()?.toLocaleDateString()}
                  />

                  <InfoRow
                    icon={CheckCircle2}
                    label="Status"
                    value={data?.status}
                  />

                  <InfoRow
                    icon={AlertCircle}
                    label="Delay"
                    value={getDelay(data?.plannedAt, data?.actualAt)}
                    color="text-red-500"
                  />

                  <div className="col-span-2">
                    <p className="text-[10px] uppercase text-gray-400">
                      Remarks
                    </p>
                    <p className="text-xs italic text-gray-700">
                      {data?.remarks || "—"}
                    </p>
                  </div>
                </StepCard>
              );
            })}
          </div>
        </div>

        {/* FOOTER */}
        <div className="bg-white px-6 py-4 flex justify-end border-t">
          <button
            onClick={onClose}
            className="px-8 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnsiteComplaintViewModal;
