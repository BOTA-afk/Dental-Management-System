"use client";

import React, { useState, useMemo } from "react";
import { Search, UserCheck, Check, ChevronDown, X, AlertTriangle } from "lucide-react";

export interface PatientOption {
  _id: string;
  name: string;
  email?: string;
  phoneNumber?: string;
  allergies?: string;
  nic?: string;
  gender?: string;
  dob?: string;
}

interface PatientSelectorProps {
  patients: PatientOption[];
  selectedPatientId: string;
  onSelectPatient: (patientId: string) => void;
  label?: string;
  required?: boolean;
}

export default function PatientSelector({
  patients,
  selectedPatientId,
  onSelectPatient,
  label = "Select Patient",
  required = true,
}: PatientSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const selectedPatient = useMemo(() => {
    return patients.find((p) => p._id === selectedPatientId) || null;
  }, [patients, selectedPatientId]);

  const filteredPatients = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return patients;
    return patients.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.phoneNumber?.includes(q) ||
        p.email?.toLowerCase().includes(q) ||
        p.nic?.toLowerCase().includes(q)
    );
  }, [patients, searchQuery]);

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-bold text-slate-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {selectedPatient && (
          <button
            type="button"
            onClick={() => {
              setIsDropdownOpen(true);
              setSearchQuery("");
            }}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 transition cursor-pointer"
          >
            Change Patient
          </button>
        )}
      </div>

      {/* Hidden input to guarantee native form validation if required */}
      <input
        type="text"
        required={required}
        value={selectedPatientId}
        onChange={() => {}}
        className="sr-only"
        tabIndex={-1}
      />

      {/* If a patient is selected and dropdown is closed, show selected card */}
      {selectedPatient && !isDropdownOpen ? (
        <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-2xl flex items-center justify-between gap-4 transition hover:bg-blue-50">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shadow-sm text-sm">
              {selectedPatient.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-base">{selectedPatient.name}</span>
                <span className="flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full">
                  <UserCheck size={11} /> Selected
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                {selectedPatient.phoneNumber || "No phone"} • {selectedPatient.email || "No email"}
              </p>
              {selectedPatient.allergies && (
                <div className="flex items-center gap-1.5 mt-1.5 text-xs text-amber-800 font-semibold bg-amber-100/70 border border-amber-200 px-2 py-0.5 rounded-lg w-fit">
                  <AlertTriangle size={12} className="text-amber-700 flex-shrink-0" />
                  <span>Allergies: {selectedPatient.allergies}</span>
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsDropdownOpen(true);
              setSearchQuery("");
            }}
            className="px-3 py-1.5 bg-white border border-blue-200 hover:border-blue-300 text-blue-700 text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
          >
            Switch
          </button>
        </div>
      ) : (
        /* Patient search and selection panel */
        <div className="border border-slate-200 rounded-2xl bg-white p-3 space-y-3 shadow-xs">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              autoFocus={isDropdownOpen}
              placeholder="Search patient by name, phone, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* List of Patients */}
          <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1 divide-y divide-slate-100">
            {filteredPatients.length === 0 ? (
              <div className="py-6 text-center text-slate-400 text-xs font-medium">
                No patients found matching "{searchQuery}".
              </div>
            ) : (
              filteredPatients.map((patient) => {
                const isSelected = patient._id === selectedPatientId;
                return (
                  <div
                    key={patient._id}
                    onClick={() => {
                      onSelectPatient(patient._id);
                      setIsDropdownOpen(false);
                      setSearchQuery("");
                    }}
                    className={`pt-1.5 first:pt-0 pb-1.5 px-3 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition ${
                      isSelected
                        ? "bg-blue-50/80 border border-blue-200"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs">
                        {patient.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 text-sm block">
                          {patient.name}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          {patient.phoneNumber || patient.email || "Registered Patient"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {patient.allergies && (
                        <span className="hidden sm:inline-block bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Allergies
                        </span>
                      )}
                      {isSelected ? (
                        <span className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs">
                          <Check size={14} />
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-lg transition">
                          Select
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {selectedPatient && isDropdownOpen && (
            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(false)}
                className="text-xs text-slate-500 hover:text-slate-800 font-semibold px-2 py-1"
              >
                Keep Current ({selectedPatient.name})
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
