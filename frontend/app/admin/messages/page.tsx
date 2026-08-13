"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/admin/Sidebar";
import ChatWindow from "@/components/ChatWindow";
import { MessageSquare, Search } from "lucide-react";

interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

interface Contact {
  id: string;
  name: string;
  email: string;
  role: string;
  model: string;
}

export default function AdminMessagesPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeContact, setActiveContact] = useState<Contact | null>(null);

  const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5009') + '/api';

  // 1. Authentication Check
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (!token || !storedUser) {
        router.push("/admin/login");
        return;
      }

      try {
        const parsedUser: UserProfile = JSON.parse(storedUser);
        if (parsedUser.role !== "system_admin" && parsedUser.role !== "assistant" && parsedUser.role !== "admin") {
          router.push("/admin/login");
          return;
        }
        setUser(parsedUser);
        setLoading(false);
      } catch (err) {
        console.error("Error parsing user profile:", err);
        router.push("/admin/login");
      }
    }
  }, [router]);

  // 2. Fetch Contacts
  useEffect(() => {
    if (!user) return;

    const fetchContacts = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${apiBase}/messages/contacts`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (res.ok) {
          const data = await res.json();
          setContacts(data);
          setFilteredContacts(data);
        }
      } catch (err) {
        console.error("Error fetching contacts:", err);
      }
    };

    fetchContacts();
  }, [user, apiBase]);

  // 3. Handle Search
  useEffect(() => {
    const term = searchTerm.toLowerCase();
    setFilteredContacts(
      contacts.filter(
        (c) =>
          c.name.toLowerCase().includes(term) ||
          c.role.toLowerCase().includes(term) ||
          c.email.toLowerCase().includes(term)
      )
    );
  }, [searchTerm, contacts]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const userInitials = user
    ? user.fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
    : "ST";

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 p-8 ml-64 min-h-screen flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between mb-8 flex-shrink-0">
          <div>
            <h2 className="text-3xl font-black text-slate-900">Messages</h2>
            <p className="text-slate-500 mt-1">Communicate with patients, dentists, and other clinic staff members</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-full bg-blue-700 text-white font-bold flex items-center justify-center shadow">
              {userInitials}
            </div>
          </div>
        </header>

        {/* Messaging Layout */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 min-h-0">
          {/* Contacts Sidebar */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col overflow-hidden h-[600px]">
            {/* Search */}
            <div className="p-4 border-b border-slate-100 flex-shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-3 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="Search contacts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 text-slate-800"
                />
              </div>
            </div>

            {/* Contacts List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
              {filteredContacts.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm">No contacts found</div>
              ) : (
                filteredContacts.map((contact) => (
                  <button
                    key={contact.id}
                    onClick={() => setActiveContact(contact)}
                    className={`w-full flex items-center gap-3 px-6 py-4 text-left hover:bg-slate-50 transition ${
                      activeContact?.id === contact.id ? "bg-blue-50/50 border-r-4 border-blue-600" : ""
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center capitalize text-sm">
                      {contact.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-900 truncate text-sm">{contact.name}</h4>
                      <p className="text-xs text-slate-400 truncate capitalize">{contact.role}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Active Conversation or Placeholder */}
          <div className="md:col-span-2">
            {activeContact && user ? (
              <ChatWindow
                currentUserId={user.id}
                currentUserRole={user.role}
                activeContact={activeContact}
                onBack={() => setActiveContact(null)}
              />
            ) : (
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-12 text-center h-[600px] flex flex-col justify-center items-center">
                <MessageSquare className="text-slate-350 mb-4" size={48} />
                <h3 className="text-xl font-bold text-slate-900 mb-1">Select a Conversation</h3>
                <p className="text-slate-500 text-sm max-w-sm">
                  Choose a patient or dentist from the contact list to start messaging in real-time.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
