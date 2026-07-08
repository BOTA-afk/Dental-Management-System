import {
  LayoutDashboard,
  Users,
  CreditCard,
  CalendarCheck,
  Activity,
  ShieldCheck,
  Stethoscope,
  UserCheck,
  Building,
  Clock,
  Lock,
  FileText,
  UserPlus
} from "lucide-react";

export const menuItems = [
  { title: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard, roles: ["system_admin", "assistant", "nurse", "receptionist", "lab_assistant"] },
  { title: "Account Creation", href: "/admin/account-creation", icon: UserPlus, roles: ["system_admin"] },
  { title: "All Doctors", href: "/admin/doctors", icon: Stethoscope, roles: ["system_admin"] },
  { title: "Manage Staff", href: "/admin/staff", icon: ShieldCheck, roles: ["system_admin"] },
  { title: "Reception Desk", href: "/admin/receptionist-dashboard", icon: LayoutDashboard, roles: ["receptionist"] },
  { title: "Appointments", href: "/admin/appointments", icon: CalendarCheck, roles: ["receptionist"] },
  { title: "Patients Check In", href: "/admin/check-in", icon: UserCheck, roles: ["receptionist"] },
  { title: "Billing & Invoices", href: "/admin/billing", icon: CreditCard, roles: ["receptionist", "system_admin"] },
  { title: "OPD Queue", href: "/admin/queue", icon: Activity, roles: ["nurse"] },
  { title: "Reports", href: "/admin/reports", icon: FileText, roles: ["system_admin"] },
  { title: "Supply Request", href: "/admin/supply", icon: FileText, roles: ["nurse", "receptionist"] },
  { title: "Password", href: "/admin/forget-password", icon: Lock, roles: ["nurse", "receptionist", "lab_assistant"] }
];