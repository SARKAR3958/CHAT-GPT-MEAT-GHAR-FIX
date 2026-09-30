import React, { useState } from 'react';
import { Search, SlidersHorizontal, MoreVertical, Ban, CheckCircle, Phone, Mail } from 'lucide-react';
import { useAdmin } from '../AdminContext';
import { AdminHeader } from '../components/AdminHeader';
import { AdminBottomNav } from '../components/AdminBottomNav';
import { AdminUser } from '../types';

export const UsersScreen: React.FC = () => {
  const { users, toggleUserBlock } = useAdmin();
  const [searchQuery, setSearchQuery] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const filteredUsers = users.filter((u) => {
    return (
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  return (
    <div
      onClick={() => setOpenMenuId(null)}
      className="w-full h-full bg-[#F8F9FA] text-slate-800 flex flex-col justify-between overflow-hidden font-sans select-none"
    >
      {/* Header */}
      <AdminHeader title="Users" showDrawer={true} showBell={true} />

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar p-4 space-y-3.5">
        {/* Search Bar & Filter Button */}
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users..."
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-300 rounded-2xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all shadow-2xs"
            />
          </div>

          <button
            onClick={() => setSearchQuery('')}
            className="w-10 h-10 bg-white border border-slate-300 rounded-2xl flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors shadow-2xs shrink-0 cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* Users List Matching Screen 10 */}
        <div className="space-y-2 pt-1">
          {filteredUsers.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-300 text-center space-y-2 shadow-2xs">
              <p className="text-sm font-bold text-slate-800">No users found</p>
              <p className="text-xs text-slate-400">Try searching by name or phone number.</p>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div
                key={user.id}
                className="bg-white p-3 rounded-2xl border border-slate-300 shadow-2xs flex items-center justify-between gap-3 relative hover:border-slate-400 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-11 h-11 rounded-full object-cover shrink-0 bg-slate-100 border border-slate-100"
                  />
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-slate-900 truncate">{user.name}</h3>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">{user.phone}</p>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      user.status === 'Active'
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/60'
                        : 'bg-rose-50 text-rose-600 border border-rose-200/60 flex items-center gap-1'
                    }`}
                  >
                    {user.status === 'Blocked' && <Ban className="w-2.5 h-2.5" />}
                    <span>{user.status}</span>
                  </span>

                  {/* 3-dots Menu Button */}
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === user.id ? null : user.id);
                      }}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {/* Popover Menu */}
                    {openMenuId === user.id && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="absolute right-0 top-8 w-36 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-30 space-y-0.5"
                      >
                        <a
                          href={`tel:${user.phone}`}
                          className="w-full px-3 py-1.5 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                        >
                          <Phone className="w-3.5 h-3.5 text-slate-500" />
                          <span>Call User</span>
                        </a>

                        <button
                          onClick={() => {
                            toggleUserBlock(user.id);
                            setOpenMenuId(null);
                          }}
                          className="w-full px-3 py-1.5 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                        >
                          {user.status === 'Active' ? (
                            <>
                              <Ban className="w-3.5 h-3.5 text-rose-500" />
                              <span className="text-rose-600 font-semibold">Block User</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                              <span className="text-emerald-600 font-semibold">Unblock</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Bottom Nav Bar */}
      <AdminBottomNav />
    </div>
  );
};
