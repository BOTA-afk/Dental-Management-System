"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  LayoutDashboard,
  CalendarDays,
  ClipboardList,
  Pill,
  FileHeart,
  CreditCard,
  Bell,
  UserCircle,
  Search,
  LogOut,
  CheckCircle2,
  Clock,
  FileText,
  X,
  AlertCircle,
  User,
  Shield,
  Activity,
  Check,
  CreditCard as PayIcon,
  Plus
} from "lucide-react";

interface Appointment {
  _id: string;
  treatment: string;
  dentist: {
    _id: string;
    fullName: string;
  };
  date: string;
  time: string;
  status: 'Pending' | 'Confirmed' | 'Scheduled' | 'Arrived' | 'In Progress' | 'Completed' | 'Cancelled';
  notes?: string;
  allergies?: string;
  complains?: string;
  onExamination?: string;
  treatmentPlan?: string;
  treatmentDone?: string;
}

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'booking' | 'reschedule' | 'cancel' | 'billing' | 'general';
  read: boolean;
  createdAt: string;
}

interface Bill {
  _id: string;
  amount: number;
  treatment: string;
  status: 'Paid' | 'Unpaid' | 'Pending' | 'Partially Paid';
  paymentMethod?: 'Cash' | 'Card' | 'N/A';
  date: string;
}

const treatments = ['Regular Checkup', 'Root Canal', 'Consultation', 'Orthodontics', 'Teeth Cleaning', 'Teeth Whitening'];
const timeSlots = ['09:00 AM', '10:00 AM', '11:00 AM', '01:30 PM', '02:30 PM', '03:30 PM'];

export default function PatientDashboard() {
  const [patient, setPatient] = useState<any>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    phoneNumber: "",
    nic: "",
    dob: "",
    gender: "",
    homeAddress: "",
    allergies: ""
  });

  const startEditing = () => {
    setEditForm({
      name: patient?.name || '',
      phoneNumber: patient?.phoneNumber || '',
      nic: patient?.nic || '',
      dob: patient?.dob ? new Date(patient.dob).toISOString().split('T')[0] : '',
      gender: patient?.gender || '',
      homeAddress: patient?.homeAddress || '',
      allergies: patient?.allergies || ''
    });
    setIsEditingProfile(true);
  };

  const calculateAge = (dobString: string) => {
    if (!dobString) return "";
    const today = new Date();
    const birthDate = new Date(dobString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 0 ? `${age} years` : "";
  };

  const handlePatientProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001"}/api/patient/profile`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(editForm)
      });
      const data = await response.json();
      if (response.ok) {
        alert("Profile updated successfully!");
        setPatient(data);
        setIsEditingProfile(false);
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

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [dentists, setDentists] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  
  const [activeTab, setActiveTab] = useState<string>("Dashboard");
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isMedicalRecordsOpen, setIsMedicalRecordsOpen] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState<string | null>(null);
  
  const [bookingForm, setBookingForm] = useState({
    dentistId: '',
    treatment: '',
    date: '',
    time: '',
    notes: ''
  });

  const [bookedSlots, setBookedSlots] = useState<string[]>([]);

  useEffect(() => {
    setBookingForm(prev => ({ ...prev, time: '' }));
  }, [bookingForm.dentistId, bookingForm.date]);

  useEffect(() => {
    if (!bookingForm.dentistId || !bookingForm.date) {
      setBookedSlots([]);
      return;
    }

    const fetchBookedSlots = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001"}/api/patient/appointments/booked-slots?dentistId=${bookingForm.dentistId}&date=${bookingForm.date}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (res.ok) {
          const data = await res.json();
          setBookedSlots(data);
        }
      } catch (err) {
        console.error("Error fetching booked slots:", err);
      }
    };

    fetchBookedSlots();
  }, [bookingForm.dentistId, bookingForm.date]);

  const menu = [
    { title: "Dashboard", icon: LayoutDashboard },
    { title: "My Appointments", icon: CalendarDays },
    { title: "Prescriptions", icon: Pill },
    { title: "Billing & Balance", icon: CreditCard },
    { title: "Notifications", icon: Bell },
    { title: "My Profile", icon: UserCircle },
  ];

  const fetchPatientData = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001"}/api/patient/profile`, {
        headers: { 
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json" 
        }
      });
      if (response.ok) {
        const data = await response.json();
        setPatient(data);
      }
    } catch (error) {
      console.error("Error loading patient:", error);
    }
  };

  const fetchAppointments = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001"}/api/patient/appointments`, {
        headers: { 
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json" 
        }
      });
      if (response.ok) {
        const data = await response.json();
        setAppointments(data);
      }
    } catch (error) {
      console.error("Error loading appointments:", error);
    }
  };

  const fetchDentists = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001"}/api/patient/dentists`, {
        headers: { 
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json" 
        }
      });
      if (response.ok) {
        const data = await response.json();
        setDentists(data);
      }
    } catch (error) {
      console.error("Error loading dentists:", error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001"}/api/patient/notifications`, {
        headers: { 
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json" 
        }
      });
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error("Error loading notifications:", error);
    }
  };

  const fetchBills = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001"}/api/patient/billing`, {
        headers: { 
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json" 
        }
      });
      if (response.ok) {
        const data = await response.json();
        setBills(data);
      }
    } catch (error) {
      console.error("Error loading bills:", error);
    }
  };

  const markNotificationsAsRead = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001"}/api/patient/notifications/read`, {
        method: 'PUT',
        headers: { 
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json" 
        }
      });
      if (response.ok) {
        fetchNotifications();
      }
    } catch (error) {
      console.error("Error reading notifications:", error);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/";
        return;
      }
      fetchPatientData();
      fetchAppointments();
      fetchDentists();
      fetchNotifications();
      fetchBills();

      // Check Stripe redirect success
      const searchParams = new URLSearchParams(window.location.search);
      const isSuccess = searchParams.get('payment_success') === 'true';
      const successBillId = searchParams.get('bill_id');
      if (isSuccess && successBillId) {
        const confirmPayment = async () => {
          try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001"}/api/patient/billing/${successBillId}/pay`, {
              method: 'PUT',
              headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
              }
            });
            if (res.ok) {
              alert("Payment successful! Confirmation email has been sent.");
              window.history.replaceState({}, document.title, window.location.pathname);
              fetchBills();
              fetchNotifications();
            }
          } catch (error) {
            console.error("Error confirming payment:", error);
          }
        };
        confirmPayment();
      }
    }
  }, []);

  useEffect(() => {
    if (activeTab === "Notifications") {
      markNotificationsAsRead();
    }
  }, [activeTab]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("PatientToken");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  const handleCancelAppointment = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001"}/api/patient/appointments/${id}/cancel`, {
        method: 'PUT',
        headers: { 
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json" 
        }
      });
      if (response.ok) {
        alert("Appointment cancelled successfully.");
        fetchAppointments();
        fetchNotifications();
      } else {
        const errData = await response.json();
        alert(errData.message || "Failed to cancel appointment.");
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      alert("Network error.");
    }
  };

  const handleBookAppointmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingForm.dentistId || !bookingForm.treatment || !bookingForm.date || !bookingForm.time) {
      alert("Please fill in all required fields.");
      return;
    }
    setBookingLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001"}/api/patient/appointments`, {
        method: 'POST',
        headers: { 
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json" 
        },
        body: JSON.stringify(bookingForm)
      });
      if (response.ok) {
        alert("Appointment booked successfully! PDF Receipt confirmation has been emailed.");
        setIsBookingOpen(false);
        setBookingForm({ dentistId: '', treatment: '', date: '', time: '', notes: '' });
        fetchAppointments();
        fetchNotifications();
      } else {
        const errData = await response.json();
        alert(errData.message || "Failed to book appointment.");
      }
    } catch (error) {
      console.error(error);
      alert("Network error.");
    } finally {
      setBookingLoading(false);
    }
  };

  const handlePayBill = async (billId: string) => {
    setPaymentLoading(billId);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001"}/api/patient/billing/${billId}/checkout-session`, {
        method: 'POST',
        headers: { 
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json" 
        }
      });
      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      } else {
        const errData = await response.json();
        alert(errData.message || "Failed to process payment.");
      }
    } catch (error) {
      console.error(error);
      alert("Network error.");
    } finally {
      setPaymentLoading(null);
    }
  };

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return <span className="flex items-center gap-1.5 rounded-full bg-green-50 text-green-700 border border-green-200 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider h-fit"><CheckCircle2 size={14} /> Confirmed</span>;
      case 'Scheduled':
        return <span className="flex items-center gap-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider h-fit"><Clock size={14} /> Scheduled</span>;
      case 'Arrived':
        return <span className="flex items-center gap-1.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider h-fit"><CheckCircle2 size={14} /> Arrived</span>;
      case 'Cancelled':
        return <span className="flex items-center gap-1.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider h-fit"><X size={14} /> Cancelled</span>;
      case 'Completed':
        return <span className="flex items-center gap-1.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider h-fit"><CheckCircle2 size={14} /> Completed</span>;
      default:
        return <span className="flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider h-fit"><Clock size={14} /> Pending</span>;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking':
        return <CalendarDays className="text-blue-600" size={18} />;
      case 'cancel':
        return <X className="text-red-600" size={18} />;
      case 'reschedule':
        return <Clock className="text-yellow-600" size={18} />;
      case 'billing':
        return <CreditCard className="text-green-600" size={18} />;
      default:
        return <Bell className="text-slate-600" size={18} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col px-6 py-8 fixed h-screen z-10">
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
        <nav className="flex-1 space-y-2">
          {menu.map((item, index) => {
            const Icon = item.icon;
            const isSelected = activeTab === item.title;
            const showBadge = item.title === "Notifications" && unreadNotificationsCount > 0;
            return (
              <button
                key={index}
                onClick={() => setActiveTab(item.title)}
                className={`w-full flex items-center justify-between rounded-xl px-4 py-3 transition cursor-pointer font-semibold text-sm ${
                  isSelected
                    ? "bg-blue-600 text-white shadow-md shadow-blue-100"
                    : "text-slate-700 hover:bg-slate-100 hover:text-blue-700"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} />
                  <span>{item.title}</span>
                </div>
                {showBadge && (
                  <span className="bg-red-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
        
        {/* Logout Button */}
        <button 
          onClick={handleLogout}
          className="mt-auto flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-semibold text-red-600 transition hover:bg-red-600 hover:text-white cursor-pointer w-full"
        >
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 ml-64">
        {/* Top Header */}
        <header className="flex justify-between items-center mb-8">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              placeholder="Search appointments, doctor..."
              className="pl-11 w-72 rounded-full border border-slate-200 bg-white py-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm transition"
            />
          </div>
          <div className="flex items-center gap-3">
            <img
              src={`https://ui-avatars.com/api/?name=${patient?.name || "User"}&background=2563eb&color=fff`}
              className="w-10 h-10 rounded-full shadow"
              alt="Patient Profile"
            />
            <div>
              <p className="font-semibold text-sm text-slate-800">{patient?.name || "Loading..."}</p>
              <p className="text-[11px] text-slate-500 font-bold uppercase">Patient</p>
            </div>
          </div>
        </header>

        {/* Tab View Selection */}
        {activeTab === "Dashboard" && (
          <div>
            {/* Hero Cards */}
            <div className="grid lg:grid-cols-3 gap-6 mb-8">
              <div 
                onClick={() => setIsBookingOpen(true)}
                className="bg-white border border-slate-200 rounded-3xl p-7 shadow-sm hover:shadow-md hover:scale-[1.01] transition duration-200 cursor-pointer"
              >
                <CalendarDays className="mb-6 text-blue-600" size={34} />
                <h3 className="text-xl font-bold text-slate-800">Book Appointment</h3>
                <p className="text-slate-500 mt-2 text-sm font-semibold">Schedule your next dental visit.</p>
              </div>
              <div 
                onClick={() => setIsMedicalRecordsOpen(true)}
                className="bg-white border border-slate-200 rounded-3xl p-7 shadow-sm hover:shadow-md hover:scale-[1.01] transition duration-200 cursor-pointer"
              >
                <FileText className="mb-6 text-indigo-600" size={34} />
                <h3 className="text-xl font-bold text-slate-800">Medical Records</h3>
                <p className="text-slate-500 mt-2 text-sm font-semibold">Access all your dental records.</p>
              </div>
            </div>

            {/* Main Content Layout */}
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-slate-800">Upcoming Appointments</h3>
                  <button onClick={() => setActiveTab("My Appointments")} className="text-blue-600 text-sm font-semibold hover:underline">
                    View All
                  </button>
                </div>
                
                {appointments.filter(a => a.status !== 'Cancelled' && a.status !== 'Completed').length === 0 ? (
                  <div className="bg-white rounded-3xl p-8 border text-center text-slate-500 font-medium shadow-sm">
                    No upcoming appointments. Click "Book Appointment" to schedule one.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {appointments.filter(a => a.status !== 'Cancelled' && a.status !== 'Completed').slice(0, 2).map((appt) => {
                      const formattedDate = new Date(appt.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      });

                      return (
                        <div key={appt._id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition duration-200">
                          <div className="flex justify-between flex-wrap gap-4">
                            <div className="flex gap-4">
                              <img
                                src={`https://ui-avatars.com/api/?name=${appt.dentist?.fullName || "Doctor"}&background=0ea5e9&color=fff`}
                                className="w-12 h-12 rounded-full shadow-inner"
                                alt="Doctor Avatar"
                              />
                              <div>
                                <h3 className="font-bold text-slate-800">Dr. {appt.dentist?.fullName || "General Dentist"}</h3>
                                <p className="text-slate-500 text-sm font-semibold text-blue-600">{appt.treatment}</p>
                                <div className="flex items-center gap-2 mt-2 text-xs text-slate-500 font-medium">
                                  <Clock size={14} />
                                  {formattedDate} • {appt.time}
                                </div>
                              </div>
                            </div>
                            {getStatusBadge(appt.status)}
                          </div>
                          
                          {appt.notes && (
                            <div className="mt-4 p-3 bg-slate-50 rounded-xl text-xs text-slate-600 border border-dashed border-slate-200">
                              <span className="font-bold text-slate-700 block mb-0.5">My Notes:</span>
                              {appt.notes}
                            </div>
                          )}

                          <div className="mt-6 flex gap-3">
                            <button 
                              onClick={() => handleCancelAppointment(appt._id)}
                              className="rounded-xl border border-red-200 bg-red-50 text-red-600 font-semibold px-4 py-2 text-xs hover:bg-red-600 hover:text-white transition cursor-pointer"
                            >
                              Cancel Booking
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Side notifications column */}
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-slate-800">Recent Alerts</h3>
                  <button onClick={() => setActiveTab("Notifications")} className="text-blue-600 text-sm font-semibold hover:underline">
                    Clear
                  </button>
                </div>
                
                {notifications.length === 0 ? (
                  <div className="bg-white rounded-3xl p-6 border text-center text-slate-400 text-sm font-medium shadow-sm">
                    No recent alerts.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notifications.slice(0, 3).map((notif) => (
                      <div 
                        key={notif._id} 
                        className={`border rounded-2xl p-4 transition ${
                          notif.read ? "bg-white border-slate-100 shadow-sm" : "bg-blue-50 border-blue-100 shadow-sm"
                        }`}
                      >
                        <div className="flex gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                            {getNotificationIcon(notif.type)}
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-slate-800">{notif.title}</h4>
                            <p className="text-xs text-slate-500 mt-0.5">{notif.message}</p>
                            <span className="text-[10px] text-slate-400 block mt-2 font-semibold">
                              {new Date(notif.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab View Selection: Appointments */}
        {activeTab === "My Appointments" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-bold text-slate-800">My Appointments</h3>
                <p className="text-slate-500 text-sm">Full history and booking controls</p>
              </div>
              <button 
                onClick={() => setIsBookingOpen(true)}
                className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-1.5 hover:bg-blue-700 transition cursor-pointer"
              >
                <Plus size={16} /> Book Appointment
              </button>
            </div>

            {appointments.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 border text-center text-slate-500 font-medium">
                No appointments booked yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {appointments.map((appt) => {
                  const formattedDate = new Date(appt.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  });

                  return (
                    <div key={appt._id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition duration-200">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex gap-4">
                          <img
                            src={`https://ui-avatars.com/api/?name=${appt.dentist?.fullName || "Doctor"}&background=0ea5e9&color=fff`}
                            className="w-12 h-12 rounded-full shadow"
                            alt="Doctor Avatar"
                          />
                          <div>
                            <h3 className="font-bold text-slate-800">Dr. {appt.dentist?.fullName || "General Dentist"}</h3>
                            <p className="text-sm font-semibold text-blue-600">{appt.treatment}</p>
                          </div>
                        </div>
                        {getStatusBadge(appt.status)}
                      </div>

                      <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl mb-4 text-xs font-semibold text-slate-600">
                        <div className="flex items-center gap-1">
                          <Clock size={12} className="text-slate-400" /> {appt.time}
                        </div>
                        <div>
                          Date: {formattedDate}
                        </div>
                      </div>
                      
                      {appt.notes && (
                        <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-500 mb-4 font-medium italic border border-dashed">
                          "{appt.notes}"
                        </div>
                      )}

                      {appt.status !== 'Cancelled' && appt.status !== 'Completed' && (
                        <div className="flex gap-2 justify-end">
                          <button 
                            onClick={() => handleCancelAppointment(appt._id)}
                            className="bg-red-50 text-red-600 border border-red-100 hover:bg-red-600 hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer"
                          >
                            Cancel Appointment
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab View Selection: Billing & Balance */}
        {activeTab === "Billing & Balance" && (() => {
          const outstandingBalance = bills
            .filter(b => b.status === 'Unpaid' || b.status === 'Pending' || b.status === 'Partially Paid')
            .reduce((sum, b) => sum + b.amount, 0);

          return (
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-slate-800">Billing & Invoices</h3>
                <p className="text-slate-500 text-sm">Review receipts and complete pending payments</p>
              </div>

              {/* Outstanding Balance card */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center justify-between max-w-3xl">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Outstanding Balance</p>
                  <p className="text-3xl font-black text-slate-800 mt-1">Rs. {outstandingBalance.toLocaleString()}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-2xl">
                  <CreditCard className="text-blue-600" size={24} />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {/* Bills List */}
                <div className="md:col-span-2 space-y-4">
                {bills.length === 0 ? (
                  <div className="bg-white rounded-3xl p-12 border text-center text-slate-500 font-medium">
                    No billing statements found.
                  </div>
                ) : (
                  bills.map((bill) => (
                    <div key={bill._id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition flex items-center justify-between flex-wrap gap-4">
                      <div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                          bill.status === 'Paid' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
                        }`}>
                          {bill.status}
                        </span>
                        <h4 className="font-bold text-lg text-slate-800 mt-2">{bill.treatment}</h4>
                        <p className="text-xs text-slate-400 mt-1 font-semibold">Date: {new Date(bill.date).toLocaleDateString()} | Method: {bill.paymentMethod || 'N/A'}</p>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-xs font-bold text-slate-400 uppercase">Amount Due</p>
                          <p className="text-xl font-black text-slate-800 mt-0.5">Rs. {bill.amount.toLocaleString()}</p>
                        </div>

                        {bill.status === 'Unpaid' && (
                          <button
                            onClick={() => handlePayBill(bill._id)}
                            disabled={paymentLoading === bill._id}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition shadow-md shadow-blue-100 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                          >
                            <PayIcon size={16} />
                            {paymentLoading === bill._id ? "Processing..." : "Pay Now"}
                          </button>
                        )}
                        {bill.status === 'Paid' && (
                          <span className="bg-green-100 text-green-700 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1 border border-green-200">
                            <Check size={14} /> Settled
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Clinic payment sidebar */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 text-white h-fit shadow-lg shadow-slate-100">
                <Shield className="text-blue-400 mb-6" size={32} />
                <h4 className="font-bold text-lg">Secure Checkouts</h4>
                <p className="text-sm opacity-80 mt-2 font-medium">All financial transactions at DentCare are fully secured with industry-grade SSL encryption. Receipts will be instantly emailed to your registered inbox.</p>
                <div className="mt-8 border-t border-slate-700/50 pt-6">
                  <p className="text-xs opacity-50 uppercase tracking-wider">Help Desk</p>
                  <p className="text-sm mt-1 font-semibold">billing@dentcare.com</p>
                </div>
            </div>
          </div>
        </div>
      );
    })()}

        {/* Tab View Selection: Notifications */}
        {activeTab === "Notifications" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-slate-800">Alert Notifications</h3>
              <p className="text-slate-500 text-sm">System updates, appointments, and billing statements</p>
            </div>

            {notifications.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 border text-center text-slate-500 font-medium">
                No notifications yet.
              </div>
            ) : (
              <div className="space-y-4 max-w-3xl">
                {notifications.map((notif) => (
                  <div 
                    key={notif._id} 
                    className={`border rounded-2xl p-5 transition flex gap-4 ${
                      notif.read ? "bg-white border-slate-100 shadow-sm" : "bg-blue-50 border-blue-100 shadow-sm"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notif.type)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">{notif.title}</h4>
                      <p className="text-sm text-slate-600 mt-1 font-medium leading-relaxed">{notif.message}</p>
                      <span className="text-xs text-slate-400 block mt-3 font-semibold">
                        Received on {new Date(notif.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab View Selection: My Profile */}
        {activeTab === "My Profile" && (
          <div className="space-y-6 max-w-3xl animate-fade-in">
            <div>
              <h3 className="text-2xl font-bold text-slate-800">My Profile</h3>
              <p className="text-slate-500 text-sm font-semibold">Personal details and medical record identities</p>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-6">
              <div className="flex items-center gap-4 border-b pb-6">
                <img
                  src={`https://ui-avatars.com/api/?name=${patient?.name || "User"}&background=2563eb&color=fff`}
                  className="w-16 h-16 rounded-full shadow"
                  alt="Profile Avatar"
                />
                <div>
                  <h4 className="text-xl font-bold text-slate-800">{patient?.name || "Loading..."}</h4>
                  <p className="text-sm text-slate-500 font-semibold">{patient?.email}</p>
                </div>
              </div>

              {!isEditingProfile ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                    <div>
                      <p className="text-slate-400 font-semibold uppercase text-xs">Phone Number</p>
                      <p className="font-bold text-slate-800 mt-1">{patient?.phoneNumber || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-semibold uppercase text-xs">National ID Card (NIC)</p>
                      <p className="font-bold text-slate-800 mt-1">{patient?.nic || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-semibold uppercase text-xs">Date of Birth</p>
                      <p className="font-bold text-slate-800 mt-1 flex items-center gap-2">
                        {patient?.dob ? new Date(patient.dob).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : "N/A"}
                        {patient?.dob && (
                          <span className="text-xs bg-blue-50 text-blue-600 px-2.5 py-0.5 rounded-full font-bold">
                            {calculateAge(patient.dob)}
                          </span>
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-semibold uppercase text-xs">Gender</p>
                      <p className="font-bold text-slate-800 mt-1">{patient?.gender || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-semibold uppercase text-xs">Home Address</p>
                      <p className="font-bold text-slate-800 mt-1">{patient?.homeAddress || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-semibold uppercase text-xs">Allergies</p>
                      <p className="font-bold text-slate-850 mt-1 bg-amber-50 text-amber-800 border border-amber-100 rounded-xl px-4 py-2 font-medium">
                        {patient?.allergies || "None declared"}
                      </p>
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <button
                      onClick={startEditing}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl transition cursor-pointer text-sm shadow shadow-blue-100"
                    >
                      Edit Profile
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handlePatientProfileUpdate} className="space-y-4 text-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 font-medium"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Phone Number *</label>
                      <input
                        type="text"
                        value={editForm.phoneNumber}
                        onChange={e => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                        className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 font-medium"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">National ID Card (NIC) *</label>
                      <input
                        type="text"
                        value={editForm.nic}
                        onChange={e => setEditForm({ ...editForm, nic: e.target.value })}
                        className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 font-medium"
                        required
                      />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block font-semibold text-slate-700">Date of Birth *</label>
                        {editForm.dob && (
                          <span className="text-xs text-blue-600 font-bold">
                            Age: {calculateAge(editForm.dob)}
                          </span>
                        )}
                      </div>
                      <input
                        type="date"
                        value={editForm.dob}
                        onChange={e => setEditForm({ ...editForm, dob: e.target.value })}
                        className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 font-medium"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Gender *</label>
                      <select
                        value={editForm.gender}
                        onChange={e => setEditForm({ ...editForm, gender: e.target.value })}
                        className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 font-medium"
                        required
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Home Address *</label>
                      <input
                        type="text"
                        value={editForm.homeAddress}
                        onChange={e => setEditForm({ ...editForm, homeAddress: e.target.value })}
                        className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 font-medium"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Allergies</label>
                    <textarea
                      value={editForm.allergies}
                      onChange={e => setEditForm({ ...editForm, allergies: e.target.value })}
                      className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 font-medium h-20 resize-none"
                      placeholder="List any drug or food allergies..."
                    />
                  </div>
                  <div className="flex gap-3 pt-4 border-t">
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(false)}
                      className="border border-slate-200 px-5 py-2.5 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl transition cursor-pointer shadow-md shadow-blue-100"
                    >
                      {savingProfile ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Patient Booking Modal */}
      {isBookingOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white w-[500px] max-h-[90vh] overflow-y-auto p-8 rounded-3xl shadow-2xl border">
            <h2 className="text-2xl font-bold mb-2 text-slate-800">Book Appointment</h2>
            <p className="text-slate-500 mb-6 text-sm">Select doctor, treatment type, and choose a time slot.</p>

            <form onSubmit={handleBookAppointmentSubmit} className="space-y-5">
              {/* Doctor Selection */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 font-semibold">Select Dentist *</label>
                <select 
                  value={bookingForm.dentistId}
                  onChange={(e) => setBookingForm({ ...bookingForm, dentistId: e.target.value })}
                  className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 font-medium"
                >
                  <option value="">Choose Dentist</option>
                  {dentists.map(d => (
                    <option key={d._id} value={d._id}>Dr. {d.fullName}</option>
                  ))}
                </select>
              </div>

              {/* Treatment Selection */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 font-semibold">Select Treatment *</label>
                <select 
                  value={bookingForm.treatment}
                  onChange={(e) => setBookingForm({ ...bookingForm, treatment: e.target.value })}
                  className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 font-medium"
                >
                  <option value="">Choose Treatment</option>
                  {treatments.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* Date Selection */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 font-semibold font-medium">Date *</label>
                <input 
                  type="date"
                  value={bookingForm.date}
                  onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                  className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 font-medium"
                />
              </div>

              {/* Time Slots */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 font-semibold font-medium">Time Slot *</label>
                <div className="flex flex-wrap gap-2">
                  {timeSlots.map(slot => {
                    const isSelected = bookingForm.time === slot;
                    const isBooked = bookedSlots.includes(slot);
                    return (
                      <button
                        type="button"
                        key={slot}
                        disabled={isBooked}
                        onClick={() => setBookingForm({ ...bookingForm, time: slot })}
                        className={`px-4 py-2.5 rounded-full text-xs font-bold border transition ${
                          isSelected 
                            ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-100" 
                            : isBooked
                            ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed opacity-50"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer"
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 font-semibold font-medium">Note (Optional)</label>
                <textarea 
                  value={bookingForm.notes}
                  onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                  className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 h-24 font-medium transition resize-none font-medium" 
                  placeholder="Enter details/complaints..." 
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsBookingOpen(false)}
                  className="flex-1 py-3.5 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold transition cursor-pointer font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={bookingLoading}
                  className="flex-1 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition shadow-lg shadow-blue-100 disabled:opacity-50 cursor-pointer font-medium"
                >
                  {bookingLoading ? "Booking..." : "Book Appointment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Medical Records Modal */}
      {isMedicalRecordsOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            {/* Close button */}
            <button
              onClick={() => setIsMedicalRecordsOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-650 transition cursor-pointer"
            >
              <X size={20} />
            </button>

            <h2 className="text-2xl font-bold text-slate-900 mb-2">My Medical & Clinical Records</h2>
            <p className="text-slate-500 text-sm mb-6 font-semibold">Historical list of dental check-in clinical notes, complaints, and completed treatments.</p>

            {appointments.filter(appt => appt.complains || appt.onExamination || appt.treatmentPlan || appt.treatmentDone || appt.allergies).length === 0 ? (
              <div className="text-center py-12 text-slate-400 font-medium text-sm border rounded-2xl bg-slate-50">
                No clinical medical records found.
              </div>
            ) : (
              <div className="space-y-4">
                {appointments
                  .filter(appt => appt.complains || appt.onExamination || appt.treatmentPlan || appt.treatmentDone || appt.allergies)
                  .map((appt) => {
                    const formattedDate = new Date(appt.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    });
                    return (
                      <div key={appt._id} className="border border-slate-150 p-5 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-3">
                          <div>
                            <span className="text-xs text-blue-600 font-bold uppercase tracking-wider">{appt.treatment}</span>
                            <span className="block text-slate-900 font-bold text-sm mt-0.5">{formattedDate} • {appt.time}</span>
                          </div>
                          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                            Dr. {appt.dentist?.fullName || "General Dentist"}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">

                          {appt.onExamination && (
                            <div>
                              <span className="font-bold text-slate-400 block uppercase tracking-wider text-[9px]">On Examination Findings</span>
                              <p className="text-slate-700 mt-0.5 font-medium">{appt.onExamination}</p>
                            </div>
                          )}
                          {appt.treatmentPlan && (
                            <div>
                              <span className="font-bold text-slate-400 block uppercase tracking-wider text-[9px]">Proposed Treatment Plan</span>
                              <p className="text-slate-700 mt-0.5 font-medium">{appt.treatmentPlan}</p>
                            </div>
                          )}
                          {appt.treatmentDone && (
                            <div>
                              <span className="font-bold text-slate-400 block uppercase tracking-wider text-[9px]">Treatment Done</span>
                              <p className="text-slate-700 mt-0.5 font-medium">{appt.treatmentDone}</p>
                            </div>
                          )}
                          {appt.allergies && (
                            <div className="sm:col-span-2">
                              <span className="font-bold text-slate-400 block uppercase tracking-wider text-[9px]">Allergies & Medical Warnings</span>
                              <p className="text-amber-850 mt-0.5 font-semibold bg-amber-50 border border-amber-100/50 px-2.5 py-1 rounded-xl w-fit">{appt.allergies}</p>
                            </div>
                          )}
                          {appt.notes && (
                            <div className="sm:col-span-2 border-t border-slate-100 pt-2 mt-1">
                              <span className="font-bold text-slate-400 block uppercase tracking-wider text-[9px]">Clinical Notes</span>
                              <p className="text-slate-600 mt-0.5 font-medium italic">"{appt.notes}"</p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}

            <button
              onClick={() => setIsMedicalRecordsOpen(false)}
              className="w-full mt-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition cursor-pointer text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}