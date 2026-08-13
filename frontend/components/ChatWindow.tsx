"use client";

import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Send, ArrowLeft } from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  email: string;
  role: string;
  model: string;
}

interface Message {
  _id: string;
  senderId: {
    _id: string;
    fullName?: string;
    name?: string;
  };
  senderModel: string;
  receiverId: {
    _id: string;
    fullName?: string;
    name?: string;
  };
  receiverModel: string;
  message: string;
  createdAt: string;
}

interface ChatWindowProps {
  currentUserId: string;
  currentUserRole: string;
  activeContact: Contact;
  onBack?: () => void;
}

export default function ChatWindow({ currentUserId, currentUserRole, activeContact, onBack }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5009') + '/api';
  const socketUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5009';

  // 1. Fetch Chat History
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${apiBase}/messages/history/${activeContact.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (res.ok) {
          const data = await res.json();
          setMessages(data);
        }
      } catch (err) {
        console.error("Error fetching chat history:", err);
      }
    };

    fetchHistory();
  }, [activeContact.id, apiBase]);

  // 2. Setup Socket connection
  useEffect(() => {
    const newSocket = io(socketUrl);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to socket server');
      newSocket.emit('register', currentUserId);
    });

    newSocket.on('newMessage', (msg: Message) => {
      // Check if message belongs to the current open conversation
      const msgSenderId = typeof msg.senderId === 'object' ? msg.senderId._id : msg.senderId;
      const msgReceiverId = typeof msg.receiverId === 'object' ? msg.receiverId._id : msg.receiverId;

      if (
        (msgSenderId === currentUserId && msgReceiverId === activeContact.id) ||
        (msgSenderId === activeContact.id && msgReceiverId === currentUserId)
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, [currentUserId, activeContact.id, socketUrl]);

  // 3. Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 4. Send Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${apiBase}/messages/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          receiverId: activeContact.id,
          receiverModel: activeContact.model,
          message: inputMessage
        })
      });

      if (res.ok) {
        setInputMessage('');
      } else {
        console.error("Failed to send message via REST");
      }
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-slate-100 bg-slate-50/50">
        {onBack && (
          <button onClick={onBack} className="md:hidden text-slate-500 hover:text-slate-900 transition">
            <ArrowLeft size={20} />
          </button>
        )}
        <div>
          <h3 className="font-bold text-slate-950">{activeContact.name}</h3>
          <p className="text-xs text-blue-600 font-semibold capitalize">{activeContact.role}</p>
        </div>
      </div>

      {/* Messages body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30">
        {messages.map((msg) => {
          const senderIdStr = typeof msg.senderId === 'object' ? msg.senderId._id : msg.senderId;
          const isMe = senderIdStr === currentUserId;

          return (
            <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                  isMe
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
                }`}
              >
                <p>{msg.message}</p>
                <span
                  className={`block text-[10px] mt-1 text-right ${
                    isMe ? 'text-blue-100' : 'text-slate-400'
                  }`}
                >
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Footer / Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-100 flex gap-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 text-sm text-slate-800"
        />
        <button
          type="submit"
          disabled={!inputMessage.trim()}
          className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl disabled:opacity-50 transition"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
