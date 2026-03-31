// offsiteSteps.config.js
import {
  Wrench,
  Package,
  Users,
  UserCheck,
  FileText,
  CreditCard,
  Truck,
  Settings,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";

export const OFFSITE_TIMELINE_STEPS = [
  {
    key: "step81_removal",
    title: "Step 1: Component Removal",
    icon: Wrench,
    color: "bg-blue-500",
  },
  {
    key: "step82_storeInward",
    title: "Step 2: Store Inward",
    icon: Package,
    color: "bg-indigo-500",
  },
  {
    key: "step83_vendorShortlist",
    title: "Step 3: Vendor Shortlisting",
    icon: Users,
    color: "bg-amber-500",
  },
  {
    key: "step84_vendorSelection",
    title: "Step 4: Vendor Selection",
    icon: UserCheck,
    color: "bg-purple-500",
  },
  {
    key: "step85_po",
    title: "Step 5: PO Issuance",
    icon: FileText,
    color: "bg-pink-500",
  },
  {
    key: "step86_advance",
    title: "Step 6: Advance Payment",
    icon: CreditCard,
    color: "bg-teal-500",
  },
  {
    key: "step87_dispatch",
    title: "Step 7: Dispatch to Vendor",
    icon: Truck,
    color: "bg-cyan-500",
  },
  {
    key: "step88_repair",
    title: "Step 8: Vendor Repair",
    icon: Settings,
    color: "bg-orange-500",
  },
  {
    key: "step89_return",
    title: "Step 9: Return Logistics",
    icon: RotateCcw,
    color: "bg-lime-500",
  },
  {
    key: "step90_qc",
    title: "Step 10: QC & Testing",
    icon: CheckCircle2,
    color: "bg-emerald-500",
  },
];
