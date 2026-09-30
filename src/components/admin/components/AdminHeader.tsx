import React, { useState } from 'react';
import { ChevronLeft, Bell, Menu, RefreshCw, Database } from 'lucide-react';
import { useAdmin } from '../AdminContext';

interface AdminHeaderProps {
  title: string;
  showBack?: boolean;
  showBell?: boolean;
  showDrawer?: boolean;
  rightAction?: React.ReactNode;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  title,
  showBack = false,
  showBell = true,
  showDrawer = false,
  rightAction,
}) => {
  const { goBackAdmin, toggleDrawer, orders, isSupabaseConnected, syncWithSupabase, showToast } = useAdmin();
  const [isSyncing, setIsSyncing] = useState(false);
  const pendingOrdersCount = orders.filter((o) => o.status === 'Preparing' || o.status === 'Pending').length;

  const handleManualSync = async () => {
    setIsSyncing(true);
    await syncWithSupabase();
    setIsSyncing(false);
  };

  return (
    <header className="w-full bg-white border-b border-slate-300 px-4 pt-3 pb-3 flex items-center justify-between shrink-0 select-none z-20">
      <div className="flex items-center gap-2.5">
        {showBack && (
          <button
            onClick={goBackAdmin}
            className="w-8 h-8 rounded-full flex items-center justify-center -ml-1 text-slate-700 hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
            aria-label="Go Back"
          >
            <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
          </button>
        )}

        {showDrawer && (
          <button
            onClick={toggleDrawer}
            className="w-8 h-8 rounded-full flex items-center justify-center -ml-1 text-slate-800 hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
            aria-label="Open Menu"
          >
            <Menu className="w-6 h-6 stroke-[2.2]" />
          </button>
        )}

        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-none">{title}</h1>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isSupabaseConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
            <span className="text-[10px] text-slate-500 font-semibold">
              {isSupabaseConnected ? 'Connected' : 'Connection unavailable'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        {/* Manual Supabase Sync Button */}
        <button
          onClick={handleManualSync}
          title="Sync with Supabase"
          className="p-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 active:scale-95 transition-all flex items-center gap-1 text-[11px] font-semibold cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isSyncing ? 'animate-spin text-red-600' : ''}`} />
          <span className="hidden sm:inline">Sync</span>
        </button>

        {rightAction}

        {showBell && (
          <div className="relative">
            <button
              onClick={() => toggleDrawer()}
              className="w-9 h-9 rounded-full flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors relative cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5 text-slate-800" />
              {pendingOrdersCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-600 rounded-full ring-2 ring-white" />
              )}
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

