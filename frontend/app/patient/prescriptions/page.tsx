"use client";

import React, { useState, useEffect } from "react";
import { Pill, Search } from "lucide-react";
import PatientSidebar from "@/components/patient/Sidebar";

export default function PatientPrescriptions() {
  const [patient, setPatient] = useState<any>(null);

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

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/";
        return;
      }
      fetchPatientData();
    }
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800">
      <PatientSidebar />

      {/* Main Content */}
      <main className="flex-1 p-8 ml-64">
        {/* Top Header */}
        <header className="flex justify-between items-center mb-8">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              placeholder="Search prescriptions..."
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

        {/* Prescriptions list placeholder */}
        <div className="space-y-6">
          <div>
            <h3 className="text-2xl font-bold text-slate-800">My Prescriptions</h3>
            <p className="text-slate-500 text-sm">Issued medical prescriptions and dental dosages</p>
          </div>

          <div className="bg-white rounded-3xl p-16 border text-center max-w-3xl mx-auto mt-12 shadow-sm flex flex-col items-center justify-center">
            <div className="bg-indigo-50 p-6 rounded-full text-indigo-600 mb-6">
              <Pill size={40} />
            </div>
            <h4 className="text-xl font-bold text-slate-800 mb-2">No Active Prescriptions</h4>
            <p className="text-slate-500 text-sm max-w-md font-semibold leading-relaxed">
              You do not have any active medical prescriptions. Any prescriptions or dosage instructions issued by your dentist during your clinic visits will automatically appear here.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
