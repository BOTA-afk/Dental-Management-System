"use client";

import React, { useState, useEffect } from "react";
import { X, History, ArrowUpRight, ArrowDownLeft, RefreshCw, Search, Calendar, Filter } from "lucide-react";

interface LogEntry {
  _id: string;
  item: {
    _id: string;
    name: string;
    category: string;
    unit: string;
  } | null;
  type: "restock" | "usage";
  quantity: number;
  user?: {
    fullName: string;
    email: string;
    role: string;
  } | null;
  notes?: string;
  createdAt: string;
}

interface InventoryLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InventoryLogsModal({ isOpen, onClose }: InventoryLogsModalProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "restock" | "usage">("all");

  const apiBase = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5009") + "/api";

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${apiBase}/inventory/logs`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
        setFilteredLogs(data);
      }
    } catch (err) {
      console.error("Error fetching inventory logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLogs();
    }
  }, [isOpen]);

  useEffect(() => {
    let result = [...logs];
    if (typeFilter !== "all") {
      result = result.filter((l) => l.type === typeFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (l) =>
          l.item?.name?.toLowerCase().includes(q) ||
          l.notes?.toLowerCase().includes(q) ||
          l.user?.fullName?.toLowerCase().includes(q)
      );
    }
    setFilteredLogs(result);
  }, [logs, typeFilter, search]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fade-in backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-4xl p-6 md:p-8 shadow-2xl relative border border-slate-100 max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center justify-between mb-6 pr-10">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 text-purple-600 rounded-2xl">
              <History size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900">Inventory Transaction Audit Logs</h3>
              <p className="text-slate-500 text-sm">Real-time log of usage, restocking activities, and order fulfillments</p>
            </div>
          </div>
          <button
            onClick={fetchLogs}
            className="p-2.5 border rounded-xl hover:bg-slate-50 text-slate-600 transition"
            title="Refresh Logs"
          >
            <RefreshCw size={16} />
          </button>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5 items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by item, notes, or staff..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter size={16} className="text-slate-400" />
            <div className="bg-slate-100 p-1 rounded-xl flex gap-1 text-xs font-bold">
              <button
                onClick={() => setTypeFilter("all")}
                className={`px-3 py-1.5 rounded-lg transition ${
                  typeFilter === "all" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All ({logs.length})
              </button>
              <button
                onClick={() => setTypeFilter("restock")}
                className={`px-3 py-1.5 rounded-lg transition ${
                  typeFilter === "restock" ? "bg-emerald-600 text-white shadow-sm" : "text-emerald-700 hover:bg-emerald-50"
                }`}
              >
                Restock
              </button>
              <button
                onClick={() => setTypeFilter("usage")}
                className={`px-3 py-1.5 rounded-lg transition ${
                  typeFilter === "usage" ? "bg-rose-600 text-white shadow-sm" : "text-rose-700 hover:bg-rose-50"
                }`}
              >
                Usage
              </button>
            </div>
          </div>
        </div>

        {/* Logs Table */}
        <div className="overflow-y-auto flex-1 border border-slate-200 rounded-2xl">
          {loading ? (
            <div className="p-12 text-center text-slate-400">Loading transaction logs...</div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-12 text-center text-slate-400 font-semibold">No transaction records found matching filters.</div>
          ) : (
            <table className="w-full text-left border-collapse text-sm">
              <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Item</th>
                  <th className="py-3 px-4">Activity</th>
                  <th className="py-3 px-4 text-center">Qty</th>
                  <th className="py-3 px-4">Performed By</th>
                  <th className="py-3 px-4">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log) => {
                  const isRestock = log.type === "restock";
                  return (
                    <tr key={log._id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4 text-xs text-slate-500 font-medium whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block">{log.item?.name || "Deleted Item"}</span>
                        <span className="text-[11px] text-slate-400">{log.item?.category || "N/A"}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                            isRestock ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}
                        >
                          {isRestock ? <ArrowUpRight size={14} /> : <ArrowDownLeft size={14} />}
                          {isRestock ? "Restocked" : "Usage"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-slate-800">
                        {isRestock ? `+${log.quantity}` : `-${log.quantity}`} {log.item?.unit || ""}
                      </td>
                      <td className="py-3 px-4 text-xs">
                        <p className="font-semibold text-slate-800">{log.user?.fullName || "Staff Member"}</p>
                        <p className="text-slate-400 text-[10px]">{log.user?.role || "Staff"}</p>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-600 max-w-xs truncate" title={log.notes}>
                        {log.notes || <span className="text-slate-300 italic">No notes logged</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
