import React, { useState } from 'react';
import {
  Search,
  MessageSquare,
  Headphones,
  Phone,
  Send,
  Check,
  Clock,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  Filter,
  User,
  ShoppingBag,
  Paperclip,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useAdmin } from '../AdminContext';
import { AdminHeader } from '../components/AdminHeader';
import { AdminBottomNav } from '../components/AdminBottomNav';
import { AdminSupportTicket } from '../types';

export const SupportScreen: React.FC = () => {
  const {
    supportTickets,
    selectedTicket,
    setSelectedTicket,
    sendTicketReply,
    updateTicketStatus,
  } = useAdmin();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusTab, setSelectedStatusTab] = useState<'All' | 'Open' | 'In Progress' | 'Resolved'>('All');
  const [replyText, setReplyText] = useState('');
  const [activeChatTicket, setActiveChatTicket] = useState<AdminSupportTicket | null>(null);

  // Quick reply options for fast customer resolution
  const QUICK_REPLIES = [
    'Your fresh meat order is out for delivery with our rider! 🛵',
    'We have processed your refund request. Refund will reflect in 2-4 hours. 💳',
    'Our master butcher and quality manager are inspecting this immediately. 🙏',
    'Thank you for contacting Meat Ghar Customer Care! How else can I assist you? 🥩',
    'We apologize for the inconvenience and will deliver fresh replacements right away.',
  ];

  // Stats
  const totalCount = supportTickets.length;
  const openCount = supportTickets.filter((t) => t.status === 'Open').length;
  const inProgressCount = supportTickets.filter((t) => t.status === 'In Progress').length;
  const resolvedCount = supportTickets.filter((t) => t.status === 'Resolved').length;

  const filteredTickets = supportTickets.filter((ticket) => {
    const matchesSearch =
      ticket.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.customerPhone.includes(searchQuery) ||
      ticket.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ticket.orderNumber && ticket.orderNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedStatusTab === 'Open') return ticket.status === 'Open';
    if (selectedStatusTab === 'In Progress') return ticket.status === 'In Progress';
    if (selectedStatusTab === 'Resolved') return ticket.status === 'Resolved';
    return true;
  });

  const handleOpenChat = (ticket: AdminSupportTicket) => {
    setActiveChatTicket(ticket);
    setSelectedTicket(ticket);
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeChatTicket) return;
    sendTicketReply(activeChatTicket.id, replyText);
    setReplyText('');
  };

  const handleQuickReplyClick = (reply: string) => {
    if (!activeChatTicket) return;
    sendTicketReply(activeChatTicket.id, reply);
  };

  // Status badge style helper
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Open':
        return 'bg-rose-50 text-rose-600 border border-rose-200';
      case 'In Progress':
        return 'bg-amber-50 text-amber-600 border border-amber-200';
      case 'Resolved':
        return 'bg-emerald-50 text-emerald-600 border border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-600 border border-slate-200';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-500 text-white';
      case 'Medium':
        return 'bg-amber-500 text-white';
      case 'Low':
        return 'bg-slate-400 text-white';
      default:
        return 'bg-slate-400 text-white';
    }
  };

  return (
    <div className="w-full h-full bg-[#F8F9FA] text-slate-800 flex flex-col justify-between overflow-hidden font-sans select-none relative">
      {/* Header */}
      <AdminHeader
        title={activeChatTicket ? `Chat: ${activeChatTicket.ticketNumber}` : 'Customer Support & Live Chat'}
        showDrawer={!activeChatTicket}
        showBack={!!activeChatTicket}
        showBell={true}
      />

      {/* ========================================================================= */}
      {/* 1. TICKETS LIST VIEW (When no specific chat is open) */}
      {/* ========================================================================= */}
      {!activeChatTicket && (
        <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar p-4 space-y-3.5">
          {/* Top Stat Cards */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white p-2.5 rounded-2xl border border-slate-300 shadow-2xs text-center">
              <span className="text-[10px] font-semibold text-slate-400">Total Tickets</span>
              <p className="text-base font-black text-slate-900 mt-0.5">{totalCount}</p>
            </div>
            <div className="bg-white p-2.5 rounded-2xl border border-rose-200/80 bg-rose-50/20 shadow-2xs text-center">
              <span className="text-[10px] font-bold text-rose-600">Open ({openCount})</span>
              <p className="text-base font-black text-rose-600 mt-0.5">{openCount}</p>
            </div>
            <div className="bg-white p-2.5 rounded-2xl border border-emerald-200/80 bg-emerald-50/20 shadow-2xs text-center">
              <span className="text-[10px] font-bold text-emerald-600">Resolved</span>
              <p className="text-base font-black text-emerald-600 mt-0.5">{resolvedCount}</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search customer, phone, ticket or order #..."
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-300 rounded-2xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all shadow-2xs"
            />
          </div>

          {/* Status Tabs Switcher */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {(['All', 'Open', 'In Progress', 'Resolved'] as const).map((tab) => {
              const isSelected = selectedStatusTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setSelectedStatusTab(tab)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          {/* Tickets List */}
          <div className="space-y-2.5 pt-1">
            {filteredTickets.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-slate-300 text-center space-y-2 shadow-2xs">
                <Headphones className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-slate-800">No support tickets found</p>
                <p className="text-xs text-slate-400">All customer inquiries are up to date.</p>
              </div>
            ) : (
              filteredTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => handleOpenChat(ticket)}
                  className="bg-white p-3.5 rounded-2xl border border-slate-300 shadow-2xs space-y-2.5 hover:border-slate-400 active:scale-[0.99] transition-all cursor-pointer"
                >
                  {/* Top Customer Info Row */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="relative shrink-0">
                        <img
                          src={ticket.customerAvatar}
                          alt={ticket.customerName}
                          className="w-10 h-10 rounded-full object-cover bg-slate-100 border border-slate-200"
                        />
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-slate-900 truncate">{ticket.customerName}</h4>
                          <span className="text-[10px] font-bold text-slate-400">• {ticket.ticketNumber}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate">{ticket.customerPhone}</p>
                      </div>
                    </div>

                    <div className="shrink-0 flex flex-col items-end gap-1">
                      <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full ${getStatusBadge(ticket.status)}`}>
                        {ticket.status}
                      </span>
                      <span className="text-[9.5px] text-slate-400">{ticket.lastUpdated}</span>
                    </div>
                  </div>

                  {/* Subject and tags */}
                  <div className="bg-slate-50 p-2 rounded-xl border border-slate-200/80 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold text-red-600 uppercase tracking-wide">
                        {ticket.category}
                      </span>
                      {ticket.orderNumber && (
                        <span className="text-[10px] font-bold text-slate-600 bg-white px-1.5 py-0.5 rounded-md border border-slate-200">
                          {ticket.orderNumber}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-slate-800 line-clamp-1">{ticket.subject}</p>
                    <p className="text-[11px] text-slate-500 line-clamp-1 italic">
                      "{ticket.lastMessage}"
                    </p>
                  </div>

                  {/* Action Bar */}
                  <div className="flex items-center justify-between pt-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md ${getPriorityBadge(ticket.priority)}`}>
                        {ticket.priority} Priority
                      </span>
                      {ticket.unreadCount > 0 && (
                        <span className="bg-red-600 text-white text-[9.5px] font-black px-1.5 py-0.2 rounded-full shadow-xs">
                          {ticket.unreadCount} new
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-700">
                      <span>Open Live Chat</span>
                      <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. ACTIVE LIVE CHAT CONVERSATION VIEW */}
      {/* ========================================================================= */}
      {activeChatTicket && (
        <div className="flex-1 flex flex-col justify-between overflow-hidden bg-[#F8F9FA]">
          {/* Customer Top Bar */}
          <div className="bg-white p-3 border-b border-slate-300 flex items-center justify-between shrink-0 shadow-2xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <button
                onClick={() => setActiveChatTicket(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center -ml-1 text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
              </button>
              <img
                src={activeChatTicket.customerAvatar}
                alt={activeChatTicket.customerName}
                className="w-9 h-9 rounded-full object-cover bg-slate-100 border border-slate-200"
              />
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-slate-900 truncate">{activeChatTicket.customerName}</h4>
                <p className="text-[10px] text-slate-400 font-medium truncate">
                  {activeChatTicket.customerPhone} {activeChatTicket.orderNumber && `• ${activeChatTicket.orderNumber}`}
                </p>
              </div>
            </div>

            {/* Right Action: Call & Status Change */}
            <div className="flex items-center gap-2 shrink-0">
              <a
                href={`tel:${activeChatTicket.customerPhone}`}
                className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-700 hover:bg-slate-200 cursor-pointer"
                title="Call Customer"
              >
                <Phone className="w-4 h-4" />
              </a>

              <select
                value={activeChatTicket.status}
                onChange={(e) => {
                  const newStatus = e.target.value as 'Open' | 'In Progress' | 'Resolved';
                  updateTicketStatus(activeChatTicket.id, newStatus);
                  setActiveChatTicket({ ...activeChatTicket, status: newStatus });
                }}
                className={`text-xs font-bold px-2 py-1.5 rounded-xl border appearance-none pr-5 relative bg-white cursor-pointer ${getStatusBadge(
                  activeChatTicket.status
                )}`}
              >
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
          </div>

          {/* Chat Messages History Stream */}
          <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar p-4 space-y-3">
            {/* System Info Banner */}
            <div className="bg-amber-50/90 border border-amber-200 p-2.5 rounded-2xl text-center space-y-0.5">
              <span className="text-[11px] font-bold text-amber-800 block">
                {activeChatTicket.ticketNumber} • {activeChatTicket.category}
              </span>
              <p className="text-[10.5px] text-amber-700">{activeChatTicket.subject}</p>
            </div>

            {/* Messages */}
            {activeChatTicket.messages.map((msg) => {
              const isAdmin = msg.sender === 'admin';
              return (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2 ${isAdmin ? 'justify-end' : 'justify-start'}`}
                >
                  {!isAdmin && (
                    <img
                      src={activeChatTicket.customerAvatar}
                      alt="Customer"
                      className="w-7 h-7 rounded-full object-cover bg-slate-100 mb-1 border border-slate-200 shrink-0"
                    />
                  )}

                  <div
                    className={`max-w-[78%] p-3 rounded-2xl shadow-2xs space-y-1 ${
                      isAdmin
                        ? 'bg-red-600 text-white rounded-br-xs'
                        : 'bg-white text-slate-800 border border-slate-300 rounded-bl-xs'
                    }`}
                  >
                    <p className="text-xs font-normal leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    <div
                      className={`flex items-center justify-end gap-1 text-[9px] ${
                        isAdmin ? 'text-red-100' : 'text-slate-400'
                      }`}
                    >
                      <span>{msg.time}</span>
                      {isAdmin && <Check className="w-3 h-3 stroke-[2.5]" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Predefined Replies Chips */}
          <div className="bg-white border-t border-slate-200 p-2 overflow-x-auto no-scrollbar flex items-center gap-1.5 shrink-0">
            <div className="flex items-center gap-1 text-[10px] font-bold text-red-600 px-1 shrink-0">
              <Sparkles className="w-3 h-3" />
              <span>Quick:</span>
            </div>
            {QUICK_REPLIES.map((reply, i) => (
              <button
                key={i}
                onClick={() => handleQuickReplyClick(reply)}
                className="text-[10.5px] font-medium bg-slate-50 hover:bg-red-50 hover:text-red-700 hover:border-red-200 border border-slate-300 px-2.5 py-1 rounded-full text-slate-700 shrink-0 transition-colors cursor-pointer whitespace-nowrap"
              >
                {reply}
              </button>
            ))}
          </div>

          {/* Live Reply Input Form */}
          <form onSubmit={handleSendReply} className="bg-white p-3 border-t border-slate-300 flex items-center gap-2 shrink-0">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Type message to customer..."
              className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all shadow-2xs"
            />
            <button
              type="submit"
              disabled={!replyText.trim()}
              className="w-10 h-10 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-2xl flex items-center justify-center active:scale-95 shadow-md shadow-red-600/20 transition-all cursor-pointer shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Bottom Nav */}
      <AdminBottomNav />
    </div>
  );
};
