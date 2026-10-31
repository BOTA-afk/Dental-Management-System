"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import DentistSidebar from "@/components/dentist/Sidebar";
import ProfileDropdown from "@/components/ProfileDropdown";
import { calculateAge } from "@/lib/utils";
import {
  ArrowLeft,
  Plus,
  Pencil,
  Lock,
  CalendarCheck,
  Phone,
  Mail,
  MapPin,
  IdCard,
  AlertTriangle
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
  homeAddress?: string;
  allergies?: string;
  createdAt?: string;
}

interface TreatmentRecord {
  _id: string;
  treatmentName: string;
  drugs: string;
  treatmentsDone: string;
  totalCost: number;
  paidAmount: number;
  date: string;
  createdAt: string;
  dentist?: { _id: string; fullName: string } | null;
}

interface Appointment {
  _id: string;
  date: string;
  time: string;
  treatment: string;
  status: string;
  treatmentDone?: string;
}

interface Prescription {
  _id: string;
  date: string;
  medications: { name: string; dosage: string }[];
}

// One row of the history table — either a saved treatment record or a past appointment
interface HistoryRow {
  key: string;
  date: string;
  treatmentName: string;
  drugs: string;
  treatmentsDone: string;
  totalCost?: number;
  paidAmount?: number;
  record?: TreatmentRecord;
}

const EDIT_WINDOW_MS = 24 * 60 * 60 * 1000;
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5009";

const emptyForm = { treatmentName: "", drugs: "", treatmentsDone: "", totalCost: "", paidAmount: "" };

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });

const sameDay = (a: string, b: string) => new Date(a).toDateString() === new Date(b).toDateString();

export default function DentistPatientProfilePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const patientId = params?.id;

  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [records, setRecords] = useState<TreatmentRecord[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [now, setNow] = useState(() => Date.now());

  // Add / edit record modal
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<TreatmentRecord | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    if (!patientId) return;
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const [patientRes, recordsRes, apptRes, rxRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/patients/${patientId}`, { headers }),
        fetch(`${API_BASE}/api/admin/patients/${patientId}/treatment-records`, { headers }),
        fetch(`${API_BASE}/api/admin/appointments?patientId=${patientId}`, { headers }),
        fetch(`${API_BASE}/api/admin/prescriptions?patientId=${patientId}`, { headers })
      ]);

      if (patientRes.ok) setPatient(await patientRes.json());
      if (recordsRes.ok) setRecords(await recordsRes.json());
      if (apptRes.ok) setAppointments(await apptRes.json());
      if (rxRes.ok) setPrescriptions(await rxRes.json());
    } catch (error) {
      console.error("Error loading patient profile:", error);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (!token || !storedUser) {
      router.push("/admin/login");
      return;
    }
    try {
      const parsedUser: UserProfile = JSON.parse(storedUser);
      if (parsedUser.role !== "dentist") {
        router.push("/admin/dashboard");
        return;
      }
      setUser(parsedUser);
      fetchData();
    } catch (err) {
      console.error("Error parsing user profile:", err);
      router.push("/admin/login");
    }
  }, [router, fetchData]);

  // Re-evaluate the 24h edit window every minute so buttons lock without a reload
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  const canEdit = (record: TreatmentRecord) => now - new Date(record.createdAt).getTime() < EDIT_WINDOW_MS;

  const openAddForm = () => {
    setEditingRecord(null);
    setForm(emptyForm);
    setIsFormOpen(true);
  };

  const openEditForm = (record: TreatmentRecord) => {
    setEditingRecord(record);
    setForm({
      treatmentName: record.treatmentName,
      drugs: record.drugs,
      treatmentsDone: record.treatmentsDone,
      totalCost: String(record.totalCost ?? ""),
      paidAmount: String(record.paidAmount ?? "")
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.treatmentName.trim()) {
      alert("Treatment name is required.");
      return;
    }
    if ((Number(form.paidAmount) || 0) > (Number(form.totalCost) || 0)) {
      alert("Paid amount cannot exceed total cost.");
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const url = editingRecord
        ? `${API_BASE}/api/admin/treatment-records/${editingRecord._id}`
        : `${API_BASE}/api/admin/patients/${patientId}/treatment-records`;
      const res = await fetch(url, {
        method: editingRecord ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          treatmentName: form.treatmentName,
          drugs: form.drugs,
          treatmentsDone: form.treatmentsDone,
          totalCost: Number(form.totalCost) || 0,
          paidAmount: Number(form.paidAmount) || 0
        })
      });

      if (res.ok) {
        setIsFormOpen(false);
        setEditingRecord(null);
        setForm(emptyForm);
        fetchData();
      } else {
        const err = await res.json();
        alert(err.message || "Failed to save record.");
      }
    } catch (error) {
      console.error("Save treatment record error:", error);
      alert("Network error saving record.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const userInitials = user
    ? user.fullName.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2)
    : "DR";

  // Past appointments = anything before now that wasn't cancelled
  const pastAppointments = appointments.filter(
    (a) => a.status !== "Cancelled" && new Date(a.date).getTime() <= now
  );

  const drugsForDay = (date: string) =>
    prescriptions
      .filter((rx) => sameDay(rx.date, date))
      .flatMap((rx) => rx.medications.map((m) => `${m.name}${m.dosage ? ` (${m.dosage})` : ""}`))
      .join(", ");

  // Saved records first (newest on top), then past appointments (newest first)
  const historyRows: HistoryRow[] = [
    ...records.map((r) => ({
      key: `rec-${r._id}`,
      date: r.date,
      treatmentName: r.treatmentName,
      drugs: r.drugs,
      treatmentsDone: r.treatmentsDone,
      totalCost: r.totalCost,
      paidAmount: r.paidAmount,
      record: r
    })),
    ...[...pastAppointments]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .map((a) => ({
        key: `appt-${a._id}`,
        date: a.date,
        treatmentName: a.treatment,
        drugs: drugsForDay(a.date),
        treatmentsDone: a.treatmentDone || ""
      }))
  ];

  const visitDates = [...records.map((r) => r.date), ...pastAppointments.map((a) => a.date)];
  const lastVisit = visitDates.length
    ? visitDates.reduce((latest, d) => (new Date(d) > new Date(latest) ? d : latest))
    : null;

  const age = calculateAge(patient?.dob);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <DentistSidebar />

      <main className="flex-1 p-8 ml-64 min-h-screen">
        <header className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-blue-700 cursor-pointer"
          >
            <ArrowLeft size={18} /> Back
          </button>
          <ProfileDropdown user={user} initials={userInitials} />
        </header>

        {!patient ? (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-12 text-center text-slate-400 font-medium">
            Patient not found.
          </div>
        ) : (
          <>
            {/* Patient header */}
            <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 mb-6">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-2xl font-black">
                    {patient.name.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2)}
                  </div>
                  <div>
                    <h1 className="text-3xl font-black text-slate-900">{patient.name}</h1>
                    <p className="text-slate-500 mt-1 font-medium">
                      {patient.gender} · {age !== null ? `${age} years old` : "Age N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-emerald-50 border border-emerald-100">
                  <CalendarCheck className="text-emerald-600" size={22} />
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-700">Last Visit</p>
                    <p className="text-sm font-bold text-slate-900">{lastVisit ? formatDate(lastVisit) : "No visits yet"}</p>
                  </div>
                </div>
              </div>

              {patient.allergies && (
                <div className="mt-6 flex items-center gap-2 px-4 py-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 text-sm font-semibold">
                  <AlertTriangle size={16} /> Allergies: {patient.allergies}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                <InfoItem label="Date of Birth" value={patient.dob ? `${formatDate(patient.dob)}${age !== null ? ` (${age} yrs)` : ""}` : "N/A"} />
                <InfoItem label="NIC" value={patient.nic || "N/A"} icon={<IdCard size={15} />} />
                <InfoItem label="Phone" value={patient.phoneNumber || "N/A"} icon={<Phone size={15} />} />
                <InfoItem label="Email" value={patient.email || "N/A"} icon={<Mail size={15} />} />
                <InfoItem label="Address" value={patient.homeAddress || "N/A"} icon={<MapPin size={15} />} />
                <InfoItem label="Registered" value={patient.createdAt ? formatDate(patient.createdAt) : "N/A"} />
              </div>
            </section>

            {/* Past appointments / treatment history */}
            <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Past Appointments</h3>
                  <p className="text-slate-500 text-xs mt-0.5">Treatment history. Records can be edited within 24 hours of saving.</p>
                </div>
                <button
                  onClick={openAddForm}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-100 cursor-pointer text-sm"
                >
                  <Plus size={16} /> Add New
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 text-xs uppercase font-semibold">
                      <th className="p-4 pl-0">Appointment Date</th>
                      <th className="p-4">Treatment Name</th>
                      <th className="p-4">Drugs Given</th>
                      <th className="p-4">Treatments Done</th>
                      <th className="p-4">Cost / Paid</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyRows.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-12 text-slate-400 font-medium text-sm">
                          No past appointments or treatment records.
                        </td>
                      </tr>
                    ) : (
                      historyRows.map((row) => {
                        const editable = row.record ? canEdit(row.record) : false;
                        return (
                          <tr key={row.key} className="border-b border-slate-50 hover:bg-slate-50/50 transition align-top">
                            <td className="p-4 pl-0 font-bold text-blue-700 text-sm whitespace-nowrap">{formatDate(row.date)}</td>
                            <td className="p-4 text-slate-900 text-sm font-semibold">{row.treatmentName}</td>
                            <td className="p-4 text-slate-600 text-sm whitespace-pre-line">{row.drugs || "—"}</td>
                            <td className="p-4 text-slate-600 text-sm whitespace-pre-line">{row.treatmentsDone || "—"}</td>
                            <td className="p-4 text-slate-600 text-sm whitespace-nowrap">
                              {row.totalCost !== undefined ? (
                                <>
                                  Rs. {row.totalCost.toLocaleString()}
                                  <span className="block text-xs text-emerald-600 font-semibold">
                                    Paid Rs. {(row.paidAmount || 0).toLocaleString()}
                                  </span>
                                </>
                              ) : "—"}
                            </td>
                            <td className="p-4 text-right">
                              {row.record && (
                                <button
                                  onClick={() => row.record && openEditForm(row.record)}
                                  disabled={!editable}
                                  title={editable ? "Edit record" : "Editing is locked 24 hours after saving"}
                                  className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs border rounded-lg font-semibold transition ${
                                    editable
                                      ? "bg-white border-slate-200 text-slate-600 hover:bg-amber-50 hover:text-amber-600 cursor-pointer"
                                      : "bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed"
                                  }`}
                                >
                                  {editable ? <Pencil size={12} /> : <Lock size={12} />} Edit
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </main>

      {/* Add / Edit Treatment Record Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl relative max-h-[90vh] modal-scroll">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              {editingRecord ? "Edit Treatment Record" : "Add Treatment Record"}
            </h2>
            <p className="text-slate-500 text-sm mb-6 font-medium">
              Date: {formatDate(editingRecord ? editingRecord.date : new Date().toISOString())} (set automatically)
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-700 text-sm font-bold mb-1.5">Treatment Name *</label>
                <input
                  type="text"
                  value={form.treatmentName}
                  onChange={(e) => setForm({ ...form, treatmentName: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 text-sm font-bold mb-1.5">Drugs</label>
                <textarea
                  placeholder="e.g. Amoxicillin 500mg, Paracetamol 500mg"
                  value={form.drugs}
                  onChange={(e) => setForm({ ...form, drugs: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium h-20"
                />
              </div>

              <div>
                <label className="block text-slate-700 text-sm font-bold mb-1.5">Treatments Done</label>
                <textarea
                  value={form.treatmentsDone}
                  onChange={(e) => setForm({ ...form, treatmentsDone: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium h-20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 text-sm font-bold mb-1.5">Total Cost (Rs.)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.totalCost}
                    onChange={(e) => setForm({ ...form, totalCost: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 text-sm font-bold mb-1.5">Paid Amount (Rs.)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.paidAmount}
                    onChange={(e) => setForm({ ...form, paidAmount: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => setIsFormOpen(false)} className="btn-cancel">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl font-bold shadow-md shadow-blue-100 cursor-pointer text-sm"
                >
                  {saving ? "Saving..." : editingRecord ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoItem({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
      <p className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 flex items-center gap-1.5">
        {icon} {label}
      </p>
      <p className="text-sm font-bold text-slate-800 mt-1 break-words">{value}</p>
    </div>
  );
}
