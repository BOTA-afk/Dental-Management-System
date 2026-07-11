"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import ChangePasswordModal from "@/components/ChangePasswordModal";
import PatientDetailsModal from "@/components/PatientDetailsModal";
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  ClipboardList, 
  LogOut, 
  Search, 
  Stethoscope,
  Activity,
  CheckCircle2,
  Clock,
  Lock,
  ChevronRight,
  FileHeart,
  CreditCard,
  MessageSquare,
  FileText,
  Bell,
  User
} from "lucide-react";

interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

interface Patient {
  _id: string;
  name: string;
  dob: string;
  gender: string;
  phoneNumber: string;
  email: string;
  nic: string;
}

interface Appointment {
  _id: string;
  patient: {
    _id: string;
    name: string;
    email: string;
    phoneNumber: string;
  } | null;
  dentist: {
    _id: string;
    name: string;
  } | string | null;
  date: string;
  time: string;
  treatment: string;
  status: string;
  notes?: string;
  allergies?: string;
  complains?: string;
  onExamination?: string;
  treatmentPlan?: string;
  treatmentDone?: string;
}

export default function DentistDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  // Dynamic API state
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [showOnlyToday, setShowOnlyToday] = useState(true);
  
  // Search state for patients
  const [patientSearchQuery, setPatientSearchQuery] = useState("");
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);

  // Modals state
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [filterDate, setFilterDate] = useState<string>(new Date().toISOString().substring(0, 10));
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [isPatientDetailsOpen, setIsPatientDetailsOpen] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false);

  // Form states for reschedule
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("09:00 AM");

  // Form states for new appointment
  const [newApptPatientId, setNewApptPatientId] = useState("");
  const [newApptDate, setNewApptDate] = useState("");
  const [newApptTime, setNewApptTime] = useState("09:00 AM");
  const [newApptTreatment, setNewApptTreatment] = useState("Regular Checkup");
  const [newApptNotes, setNewApptNotes] = useState("");

  // Dentist profile states & handlers
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profilePhone, setProfilePhone] = useState("");
  const [editForm, setEditForm] = useState({
    fullName: "",
    email: "",
    phoneNumber: ""
  });

  const fetchProfilePhone = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/admin/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setProfilePhone(data.phoneNumber || "");
      }
    } catch (err) {
      console.error("Error fetching staff profile phone:", err);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/admin/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editForm)
      });
      const data = await res.json();
      if (res.ok) {
        alert("Profile updated successfully!");
        setProfilePhone(data.phoneNumber || "");
        setIsEditingProfile(false);
        // Sync with localStorage
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const userObj = JSON.parse(storedUser);
          userObj.fullName = data.fullName;
          userObj.email = data.email;
          localStorage.setItem("user", JSON.stringify(userObj));
          setUser(userObj);
        }
      } else {
        alert(data.message || "Failed to update profile.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error updating profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  // Cancel Handler
  const handleCancelAppointment = async (apptId: string) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/admin/appointments/${apptId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'Cancelled' })
      });

      if (res.ok) {
        alert("Appointment cancelled successfully.");
        fetchData(user?.id || "");
      } else {
        const err = await res.json();
        alert(err.message || "Failed to cancel appointment.");
      }
    } catch (error) {
      console.error("Cancel appointment error:", error);
      alert("Network error cancelling appointment.");
    }
  };

  // Reschedule Submit Handler
  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppt) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/admin/appointments/${selectedAppt._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          date: rescheduleDate,
          time: rescheduleTime
        })
      });

      if (res.ok) {
        alert("Appointment rescheduled successfully!");
        setIsRescheduleOpen(false);
        setSelectedAppt(null);
        fetchData(user?.id || "");
      } else {
        const err = await res.json();
        alert(err.message || "Failed to reschedule appointment.");
      }
    } catch (error) {
      console.error("Reschedule error:", error);
      alert("Network error rescheduling appointment.");
    }
  };

  // New Appointment Submit Handler
  const handleNewAppointmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newApptPatientId || !newApptDate || !newApptTime || !newApptTreatment) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/admin/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          patientId: newApptPatientId,
          dentistId: user?.id,
          treatment: newApptTreatment,
          date: newApptDate,
          time: newApptTime,
          notes: newApptNotes,
          status: 'Scheduled'
        })
      });

      if (res.ok) {
        alert("Appointment scheduled successfully!");
        setIsNewAppointmentOpen(false);
        setNewApptPatientId("");
        setNewApptDate("");
        setNewApptTime("09:00 AM");
        setNewApptTreatment("Regular Checkup");
        setNewApptNotes("");
        fetchData(user?.id || "");
      } else {
        const err = await res.json();
        alert(err.message || "Failed to schedule appointment.");
      }
    } catch (error) {
      console.error("New appointment booking error:", error);
      alert("Network error scheduling appointment.");
    }
  };

  const getLocalDateString = (dateInput: string | Date) => {
    const d = new Date(dateInput);
    const year = d.getUTCFullYear();
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleShowPatientDetails = (patientId: string) => {
    const p = patients.find(pat => pat._id === patientId);
    if (p) {
      setSelectedPatient(p);
      setIsPatientDetailsOpen(true);
    } else {
      alert("Patient details not found.");
    }
  };

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/admin/dentist/notifications`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error("Error fetching dentist notifications:", err);
    }
  };

  const markNotificationsAsRead = async () => {
    try {
      const token = localStorage.getItem("token");
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/admin/dentist/notifications/read`,
        {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      fetchNotifications();
    } catch (err) {
      console.error("Error marking dentist notifications as read:", err);
    }
  };

  const fetchData = async (dentistId: string) => {
    try {
      const token = localStorage.getItem("token");
      const headers = { 'Authorization': `Bearer ${token}` };
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

      // 1. Fetch appointments
      const apptRes = await fetch(`${apiBase}/api/admin/appointments`, { headers });
      if (apptRes.ok) {
        const data = await apptRes.json();
        setAppointments(data);
      }

      // 2. Fetch patients
      const patientRes = await fetch(`${apiBase}/api/admin/patients`, { headers });
      if (patientRes.ok) {
        const data = await patientRes.json();
        setPatients(data);
        setFilteredPatients(data);
      }

      // 3. Fetch notifications
      fetchNotifications();
    } catch (error) {
      console.error("Error loading dentist portal data:", error);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (!token || !storedUser) {
        router.push("/login");
        return;
      }

      try {
        const parsedUser: UserProfile = JSON.parse(storedUser);
        if (parsedUser.role !== "dentist") {
          // If not dentist, redirect to admin dashboard (system_admin or assistant)
          router.push("/admin/dashboard");
          return;
        }
        setUser(parsedUser);
        fetchData(parsedUser.id);
        fetchProfilePhone();
        setLoading(false);
      } catch (err) {
        console.error("Error parsing user profile in Dentist Dashboard:", err);
        router.push("/login");
      }
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  const calculateAge = (dobString: string) => {
    if (!dobString) return 'N/A';
    const birthDate = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-100">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">Verifying authorization...</p>
        </div>
      </div>
    );
  }

  const dentistName = user?.fullName || "Dentist";
  const userInitials = user
    ? user.fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
    : "DR";

  const dentistMenuItems = [
    { title: "Dashboard", id: "dashboard", icon: LayoutDashboard },
    { title: "Appointments", id: "appointments", icon: Calendar },
    { title: "Patients", id: "patients", icon: Users },
    { title: "Treatments", id: "treatments", icon: Stethoscope },
    { title: "X-rays & Docs", id: "x-rays", icon: FileHeart },
    { title: "Billing", id: "billing", icon: CreditCard },
    { title: "Messages", id: "messages", icon: MessageSquare },
    { title: "Reports", id: "reports", icon: FileText },
    { title: "My Profile", id: "profile", icon: User },
  ];

  const dentistAppointments = appointments.filter(appt => {
    const dentistId = typeof appt.dentist === 'string' ? appt.dentist : appt.dentist?._id;
    return dentistId === user?.id;
  });

  const filteredDentistAppointments = dentistAppointments.filter(appt => {
    if (!filterDate) return true;
    return getLocalDateString(appt.date) === filterDate;
  });

  const todayStr = new Date().toDateString();
  const todayAppointmentsList = dentistAppointments.filter(appt => {
    return new Date(appt.date).toDateString() === todayStr;
  });

  const appointmentsToRender = showOnlyToday ? todayAppointmentsList : dentistAppointments;

  // Stats computation
  const todaysPatientsCount = todayAppointmentsList.length;
  const completedTodayCount = todayAppointmentsList.filter(appt => appt.status === 'Completed').length;
  const upcomingToday = todayAppointmentsList
    .filter(appt => appt.status !== 'Completed' && appt.status !== 'Cancelled')
    .sort((a, b) => a.time.localeCompare(b.time));
  const nextApptTime = upcomingToday.length > 0 ? upcomingToday[0].time : "No more today";
  const totalTreatmentsCount = dentistAppointments.filter(appt => appt.status === 'Completed').length;

  const stats = [
    { label: "Today's Patients", val: todaysPatientsCount, icon: Users, color: "text-blue-600 bg-blue-50 border-blue-100" },
    { label: "Completed Today", val: completedTodayCount, icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
    { label: "Next Appointment", val: nextApptTime, icon: Clock, color: "text-amber-600 bg-amber-50 border-amber-100" },
    { label: "Total Treatments Done", val: totalTreatmentsCount, icon: Activity, color: "text-purple-600 bg-purple-50 border-purple-100" },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col px-6 py-8 fixed h-screen">
        <div className="mb-10 px-2 flex justify-start">
          <Image 
            src="/logo.png" 
            alt="Dentplus Logo" 
            width={160} 
            height={40} 
            priority
            style={{ width: 'auto', height: 'auto' }}
            className="object-contain"
          />
        </div>

        {/* Menu */}
        <nav className="flex-1 space-y-2">
          {dentistMenuItems.map((item) => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition-all duration-200 ${
                  active
                    ? "bg-blue-600 text-white shadow-md shadow-blue-100"
                    : "text-slate-700 hover:bg-slate-50 hover:text-blue-700"
                }`}
              >
                <item.icon size={20} />
                <span>{item.title}</span>
              </button>
            );
          })}
        </nav>

        {/* Update Password Button */}
        <button
          onClick={() => setIsChangePasswordOpen(true)}
          className="mt-auto flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 font-semibold text-blue-700 transition hover:bg-blue-600 hover:text-white cursor-pointer"
        >
          <Lock size={18} />
          Update Password
        </button>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-semibold text-red-600 transition hover:bg-red-600 hover:text-white cursor-pointer"
        >
          <LogOut size={18} />
          Logout
        </button>

        <ChangePasswordModal
          isOpen={isChangePasswordOpen}
          onClose={() => setIsChangePasswordOpen(false)}
        />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 ml-64 min-h-screen">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-black text-slate-900">
              Welcome back, Dr. {dentistName.replace("Dr. ", "")}
            </h2>
            <p className="text-slate-500 mt-1">Here is your clinical overview for today.</p>
          </div>

          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <div className="relative">
              <button 
                onClick={() => {
                  setIsNotifOpen(!isNotifOpen);
                  if (!isNotifOpen) {
                    markNotificationsAsRead();
                  }
                }}
                className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition cursor-pointer relative"
              >
                <Bell size={20} />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full"></span>
                )}
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-85 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 z-50 animate-fade-in text-left">
                  <div className="flex justify-between items-center border-b pb-2 mb-3">
                    <h4 className="font-bold text-slate-800 text-sm">Notifications</h4>
                    <button 
                      onClick={() => setIsNotifOpen(false)}
                      className="text-xs text-blue-600 font-bold hover:underline cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-4 font-medium">No notifications yet.</p>
                    ) : (
                      notifications.map(notif => (
                        <div key={notif._id} className={`p-3 rounded-xl border text-xs leading-relaxed ${notif.read ? 'bg-white border-slate-100 text-slate-600' : 'bg-blue-50/50 border-blue-100 text-slate-800 font-medium'}`}>
                          <p className="font-bold text-slate-900 mb-0.5">{notif.title}</p>
                          <p>{notif.message}</p>
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            {new Date(notif.createdAt).toLocaleDateString()} at {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search patients, records..."
                className="pl-11 pr-4 py-2.5 w-72 rounded-full border border-slate-300 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="w-11 h-11 rounded-full bg-blue-700 text-white font-bold flex items-center justify-center shadow">
              {userInitials}
            </div>
          </div>
        </header>

        {/* Dynamic content rendering based on activeTab */}
        {activeTab === "dashboard" && (
          <>
            {/* Stats Grid */}
            <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
              {stats.map((item, index) => (
                <div
                  key={index}
                  className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition flex items-center gap-4"
                >
                  <div className={`p-4 rounded-2xl border ${item.color}`}>
                    <item.icon size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900">{item.val}</h3>
                    <p className="text-sm text-slate-500 font-medium">{item.label}</p>
                  </div>
                </div>
              ))}
            </section>

            {/* Core Section */}
            <section className="space-y-8">
              {/* Daily Queue */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-slate-900">
                    {showOnlyToday ? "Today's Appointment Queue" : "All Assigned Appointments"}
                  </h3>
                  <button
                    onClick={() => setShowOnlyToday(!showOnlyToday)}
                    className="text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-full border border-blue-100 transition cursor-pointer"
                  >
                    {showOnlyToday ? "Show Other Days" : "Show Today Only"}
                  </button>
                </div>

                <div className="space-y-4">
                  {appointmentsToRender.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-sm font-medium">
                      No appointments scheduled.
                    </div>
                  ) : (
                    appointmentsToRender.map((appt) => (
                      <div 
                        key={appt._id} 
                        className="flex justify-between items-center p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 font-bold flex items-center justify-center">
                            {appt.patient?.name ? appt.patient.name.charAt(0) : '?'}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900">{appt.patient?.name || 'Unknown Patient'}</h4>
                            <p className="text-xs text-slate-500 font-medium">{appt.treatment}</p>
                            {!showOnlyToday && (
                              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                                Date: {new Date(appt.date).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="text-right min-w-[90px]">
                            <span className="font-bold text-blue-700 text-sm block">{appt.time}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              appt.status === "Completed" ? "bg-emerald-50 text-emerald-700 font-bold uppercase tracking-wider" :
                              appt.status === "Scheduled" ? "bg-blue-50 text-blue-700 font-bold uppercase tracking-wider" :
                              appt.status === "Arrived" ? "bg-purple-50 text-purple-700 font-bold uppercase tracking-wider" :
                              appt.status === "Confirmed" ? "bg-emerald-50 text-emerald-700 font-bold uppercase tracking-wider" :
                              appt.status === "Cancelled" ? "bg-red-50 text-red-700 font-bold uppercase tracking-wider" :
                              "bg-slate-100 text-slate-600"
                            }`}>
                              {appt.status}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedAppt(appt);
                                setIsDetailsOpen(true);
                              }}
                              className="px-2.5 py-1.5 text-xs bg-white border hover:bg-blue-50 border-slate-200 rounded-lg text-slate-600 hover:text-blue-600 transition font-semibold cursor-pointer"
                            >
                              Details
                            </button>
                            
                            {appt.status === 'Completed' && (
                              <button
                                onClick={() => {
                                  setNewApptPatientId(appt.patient?._id || "");
                                  setIsNewAppointmentOpen(true);
                                }}
                                className="px-2.5 py-1.5 text-xs bg-blue-50 border hover:bg-blue-600 hover:text-white border-blue-250 rounded-lg text-blue-600 transition font-semibold cursor-pointer"
                              >
                                New Appointment (Next Visit)
                              </button>
                            )}
                            
                            {appt.status !== 'Completed' && appt.status !== 'Cancelled' && (
                              <>
                                <button
                                  onClick={() => {
                                    setSelectedAppt(appt);
                                    const apptDate = new Date(appt.date);
                                    const formattedDate = apptDate.toISOString().substring(0, 10);
                                    setRescheduleDate(formattedDate);
                                    setRescheduleTime(appt.time);
                                    setIsRescheduleOpen(true);
                                  }}
                                  className="px-2.5 py-1.5 text-xs bg-white border hover:bg-amber-50 border-slate-200 rounded-lg text-slate-600 hover:text-amber-600 transition font-semibold cursor-pointer"
                                >
                                  Reschedule
                                </button>
                                <button
                                  onClick={() => handleCancelAppointment(appt._id)}
                                  className="px-2.5 py-1.5 text-xs bg-red-50 hover:bg-red-100 border border-red-100 rounded-lg text-red-600 transition font-semibold cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>
          </>
        )}

        {activeTab === "patients" && (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Patients Directory</h3>
                <p className="text-slate-500 text-xs mt-0.5">Total patients registered in clinic database.</p>
              </div>

              {/* Search patients */}
              <div className="flex gap-2">
                <div className="relative">
                  <Search
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    placeholder="Search by Name, Email, NIC..."
                    value={patientSearchQuery}
                    onChange={(e) => {
                      setPatientSearchQuery(e.target.value);
                      if (e.target.value === "") {
                        setFilteredPatients(patients);
                      }
                    }}
                    className="pl-10 pr-4 py-2 w-64 rounded-xl border border-slate-300 bg-white text-slate-800 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>
                <button
                  onClick={() => {
                    const query = patientSearchQuery.toLowerCase().trim();
                    if (!query) {
                      setFilteredPatients(patients);
                    } else {
                      const filtered = patients.filter(p => 
                        p.name.toLowerCase().includes(query) ||
                        p.email.toLowerCase().includes(query) ||
                        p.nic.toLowerCase().includes(query)
                      );
                      setFilteredPatients(filtered);
                    }
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-sm transition shadow-sm cursor-pointer"
                >
                  Search
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 text-xs uppercase tracking-wider font-semibold">
                    <th className="p-4 pl-0">Patient Name</th>
                    <th className="p-4">Age</th>
                    <th className="p-4">Gender</th>
                    <th className="p-4">NIC</th>
                    <th className="p-4">Phone Number</th>
                    <th className="p-4">Email</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-700 font-medium">
                  {filteredPatients.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">
                        No patients found matching query.
                      </td>
                    </tr>
                  ) : (
                    filteredPatients.map((p) => (
                      <tr key={p._id} className="hover:bg-slate-50/55 transition">
                        <td className="p-4 pl-0 font-bold text-slate-900">{p.name}</td>
                        <td className="p-4">{calculateAge(p.dob)} yrs</td>
                        <td className="p-4 uppercase text-xs">{p.gender}</td>
                        <td className="p-4 text-xs font-mono">{p.nic}</td>
                        <td className="p-4">{p.phoneNumber}</td>
                        <td className="p-4 text-xs text-slate-500">{p.email}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "appointments" && (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Appointments Schedule</h3>
                <p className="text-slate-500 text-xs mt-0.5">Filter and manage your assigned appointments.</p>
              </div>

              {/* Date Filter Picker */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-slate-500">Select Date:</span>
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-bold text-slate-700 bg-slate-50"
                />
                {filterDate && (
                  <button
                    onClick={() => setFilterDate('')}
                    className="text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-xl transition cursor-pointer border border-red-100"
                  >
                    Clear Filter
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 text-xs uppercase font-semibold">
                    <th className="p-4 pl-0">Time</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Patient</th>
                    <th className="p-4">Treatment</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDentistAppointments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-slate-400 font-medium text-sm">
                        No appointments found for the selected date.
                      </td>
                    </tr>
                  ) : (
                    filteredDentistAppointments.map((appt) => {
                      const pId = typeof appt.patient === 'string' ? appt.patient : appt.patient?._id;
                      return (
                        <tr key={appt._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition">
                          <td className="p-4 pl-0 font-bold text-blue-700 text-sm">{appt.time}</td>
                          <td className="p-4 text-slate-600 text-sm">
                            {new Date(appt.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                          <td className="p-4">
                            <span className="font-bold text-slate-900 block">{appt.patient?.name || 'Unknown'}</span>
                            <span className="text-xs text-slate-400 block mt-0.5">{appt.patient?.email}</span>
                          </td>
                          <td className="p-4 text-slate-600 text-sm font-medium">{appt.treatment}</td>
                          <td className="p-4 text-sm">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                              appt.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                              appt.status === 'Scheduled' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                              appt.status === 'Arrived' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                              appt.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                              appt.status === 'Cancelled' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                              'bg-slate-50 text-slate-600 border-slate-100'
                            }`}>
                              {appt.status}
                            </span>
                          </td>
                          <td className="p-4 text-right space-x-2">
                            <button
                              onClick={() => {
                                if (pId) {
                                  handleShowPatientDetails(pId);
                                } else {
                                  alert("No patient details found.");
                                }
                              }}
                              className="px-3 py-1.5 bg-slate-50 hover:bg-blue-50 border border-slate-200 text-slate-700 hover:text-blue-600 hover:border-blue-200 rounded-lg text-xs font-bold transition cursor-pointer"
                            >
                              Patient Details
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "profile" && (
          <div className="space-y-6 max-w-3xl animate-fade-in">
            <div>
              <h3 className="text-2xl font-bold text-slate-800">My Profile</h3>
              <p className="text-slate-500 text-sm font-semibold">Personal details and staff record identities</p>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-6">
              <div className="flex items-center gap-4 border-b pb-6">
                <div className="w-16 h-16 rounded-full bg-blue-700 text-white font-bold flex items-center justify-center text-xl shadow-inner">
                  {userInitials}
                </div>
                <div>
                  <h4 className="text-xl font-bold text-slate-800">{user?.fullName}</h4>
                  <span className="inline-block mt-1 bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                    Dentist
                  </span>
                </div>
              </div>

              {!isEditingProfile ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                    <div>
                      <p className="text-slate-400 font-semibold uppercase text-xs">Full Name</p>
                      <p className="font-bold text-slate-800 mt-1">{user?.fullName}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-semibold uppercase text-xs">Email Address</p>
                      <p className="font-bold text-slate-800 mt-1">{user?.email}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-semibold uppercase text-xs">Phone Number</p>
                      <p className="font-bold text-slate-800 mt-1">{profilePhone || "N/A"}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setEditForm({
                          fullName: user?.fullName || '',
                          email: user?.email || '',
                          phoneNumber: profilePhone || ''
                        });
                        setIsEditingProfile(true);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-3 rounded-xl transition cursor-pointer text-sm shadow shadow-blue-100"
                    >
                      Edit Profile
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleUpdateProfile} className="space-y-5 text-sm">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name *</label>
                    <input 
                      type="text"
                      value={editForm.fullName}
                      onChange={e => setEditForm({ ...editForm, fullName: e.target.value })}
                      className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 font-medium"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address *</label>
                      <input 
                        type="email"
                        value={editForm.email}
                        onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                        className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 font-medium"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Phone Number</label>
                      <input 
                        type="text"
                        value={editForm.phoneNumber}
                        onChange={e => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                        className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 font-medium"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-slate-100">
                    <button 
                      type="button"
                      onClick={() => setIsEditingProfile(false)}
                      className="px-5 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      disabled={savingProfile}
                      className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition shadow-lg shadow-blue-100 disabled:opacity-50 cursor-pointer"
                    >
                      {savingProfile ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {activeTab !== "dashboard" && activeTab !== "patients" && activeTab !== "appointments" && activeTab !== "profile" && (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-12 text-center">
            <Stethoscope className="mx-auto text-slate-300 mb-4" size={48} />
            <h3 className="text-xl font-bold text-slate-900 mb-1">{activeTab.toUpperCase()} Section</h3>
            <p className="text-slate-500 text-sm">This component is under development in this phase.</p>
          </div>
        )}
      </main>

      {/* View Details Modal */}
      {isDetailsOpen && selectedAppt && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl relative">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Appointment Details</h2>
            <p className="text-slate-500 text-sm mb-6">Full summary of the booked treatment session.</p>

            <div className="space-y-4 text-sm text-slate-700 font-medium">
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-400 font-normal">Patient Name:</span>
                <span className="text-slate-900 font-bold">{selectedAppt.patient?.name || 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-400 font-normal">Patient Email:</span>
                <span className="text-slate-900">{selectedAppt.patient?.email || 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-400 font-normal">Phone Number:</span>
                <span className="text-slate-900">{selectedAppt.patient?.phoneNumber || 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-400 font-normal">Treatment / Service:</span>
                <span className="text-blue-700 font-bold">{selectedAppt.treatment}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-400 font-normal">Date:</span>
                <span className="text-slate-900">{new Date(selectedAppt.date).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-400 font-normal">Time Slot:</span>
                <span className="text-slate-900">{selectedAppt.time}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-400 font-normal">Status:</span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  selectedAppt.status === "Completed" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                  selectedAppt.status === "Scheduled" ? "bg-blue-50 text-blue-700 border border-blue-100" :
                  selectedAppt.status === "Arrived" ? "bg-purple-50 text-purple-700 border border-purple-100" :
                  selectedAppt.status === "Cancelled" ? "bg-red-50 text-red-700 border border-red-100" :
                  "bg-slate-100 text-slate-600"
                }`}>
                  {selectedAppt.status}
                </span>
              </div>
              {(selectedAppt.complains || selectedAppt.onExamination || selectedAppt.treatmentPlan || selectedAppt.treatmentDone || selectedAppt.allergies) && (
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">Check-In Clinical Details</h4>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2 text-xs">
                    {selectedAppt.allergies && (
                      <div>
                        <span className="font-bold text-slate-500 block uppercase text-[9px] tracking-wider">Allergies & Medical Warnings</span>
                        <p className="text-amber-850 font-semibold mt-0.5 bg-amber-50 px-1.5 py-0.5 rounded w-fit">{selectedAppt.allergies}</p>
                      </div>
                    )}
                    {selectedAppt.complains && (
                      <div>
                        <span className="font-bold text-slate-500 block uppercase text-[9px] tracking-wider">Complains</span>
                        <p className="text-slate-800 font-medium mt-0.5">{selectedAppt.complains}</p>
                      </div>
                    )}
                    {selectedAppt.onExamination && (
                      <div>
                        <span className="font-bold text-slate-500 block uppercase text-[9px] tracking-wider">On Examination Findings</span>
                        <p className="text-slate-800 font-medium mt-0.5">{selectedAppt.onExamination}</p>
                      </div>
                    )}
                    {selectedAppt.treatmentPlan && (
                      <div>
                        <span className="font-bold text-slate-500 block uppercase text-[9px] tracking-wider">Proposed Treatment Plan</span>
                        <p className="text-slate-800 font-medium mt-0.5">{selectedAppt.treatmentPlan}</p>
                      </div>
                    )}
                    {selectedAppt.treatmentDone && (
                      <div>
                        <span className="font-bold text-slate-500 block uppercase text-[9px] tracking-wider">Treatment Done</span>
                        <p className="text-slate-800 font-medium mt-0.5">{selectedAppt.treatmentDone}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                setIsDetailsOpen(false);
                setSelectedAppt(null);
              }}
              className="w-full mt-8 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition cursor-pointer text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {isRescheduleOpen && selectedAppt && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl relative">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Reschedule Appointment</h2>
            <p className="text-slate-500 text-sm mb-6 font-medium">Choose a new date and time for the treatment.</p>

            <form onSubmit={handleRescheduleSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-700 text-sm font-bold mb-1.5">New Date</label>
                <input
                  type="date"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 text-sm font-bold mb-1.5">New Time Slot</label>
                <select
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold"
                  required
                >
                  <option value="09:00 AM">09:00 AM</option>
                  <option value="09:30 AM">09:30 AM</option>
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="10:45 AM">10:45 AM</option>
                  <option value="11:30 AM">11:30 AM</option>
                  <option value="01:15 PM">01:15 PM</option>
                  <option value="02:00 PM">02:00 PM</option>
                  <option value="03:00 PM">03:00 PM</option>
                  <option value="04:00 PM">04:00 PM</option>
                </select>
              </div>

              <div className="flex gap-4 pt-4 border-t mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsRescheduleOpen(false);
                    setSelectedAppt(null);
                  }}
                  className="flex-1 py-3 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-semibold cursor-pointer text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-100 cursor-pointer text-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Appointment Modal */}
      {isNewAppointmentOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-8 shadow-2xl relative">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Book Appointment</h2>
            <p className="text-slate-500 text-sm mb-6 font-medium">Schedule a new dental visit for a patient.</p>

            <form onSubmit={handleNewAppointmentSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-700 text-sm font-bold mb-1.5">Select Patient</label>
                <select
                  value={newApptPatientId}
                  onChange={(e) => setNewApptPatientId(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold"
                  required
                >
                  <option value="">-- Choose Patient --</option>
                  {patients.map(p => (
                    <option key={p._id} value={p._id}>{p.name} ({p.email})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 text-sm font-bold mb-1.5">Date</label>
                <input
                  type="date"
                  value={newApptDate}
                  onChange={(e) => setNewApptDate(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 text-sm font-bold mb-1.5">Time Slot</label>
                <select
                  value={newApptTime}
                  onChange={(e) => setNewApptTime(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold"
                  required
                >
                  <option value="09:00 AM">09:00 AM</option>
                  <option value="09:30 AM">09:30 AM</option>
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="10:45 AM">10:45 AM</option>
                  <option value="11:30 AM">11:30 AM</option>
                  <option value="01:15 PM">01:15 PM</option>
                  <option value="02:00 PM">02:00 PM</option>
                  <option value="03:00 PM">03:00 PM</option>
                  <option value="04:00 PM">04:00 PM</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 text-sm font-bold mb-1.5">Treatment / Service</label>
                <select
                  value={newApptTreatment}
                  onChange={(e) => setNewApptTreatment(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold"
                  required
                >
                  <option value="Regular Checkup">Regular Checkup</option>
                  <option value="Teeth Cleaning">Teeth Cleaning</option>
                  <option value="Dental Consultation">Dental Consultation</option>
                  <option value="Root Canal">Root Canal</option>
                  <option value="Tooth Extraction">Tooth Extraction</option>
                  <option value="Dental Filling">Dental Filling</option>
                  <option value="Braces Adjustment">Braces Adjustment</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 text-sm font-bold mb-1.5">Notes (Optional)</label>
                <textarea
                  placeholder="Clinical notes or description..."
                  value={newApptNotes}
                  onChange={(e) => setNewApptNotes(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium h-20"
                />
              </div>

              <div className="flex gap-4 pt-4 border-t mt-6">
                <button
                  type="button"
                  onClick={() => setIsNewAppointmentOpen(false)}
                  className="flex-1 py-3 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-semibold cursor-pointer text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-100 cursor-pointer text-sm"
                >
                  Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <PatientDetailsModal
        isOpen={isPatientDetailsOpen}
        onClose={() => {
          setIsPatientDetailsOpen(false);
          setSelectedPatient(null);
        }}
        patient={selectedPatient}
      />
    </div>
  );
}
