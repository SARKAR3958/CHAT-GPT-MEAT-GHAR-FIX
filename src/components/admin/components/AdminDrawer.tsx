import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Layers,
  Sparkles,
  BarChart3,
  Settings,
  Headphones,
  Flame,
  Image as ImageIcon,
  LogOut,
  X,
  ExternalLink,
  Bell,
} from 'lucide-react';
import { useAdmin } from '../AdminContext';
import { AdminScreen } from '../types';

interface NavItem {
  id: AdminScreen;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const AdminDrawer: React.FC<{ onSwitchToCustomerApp?: () => void }> = ({ onSwitchToCustomerApp }) => {
  const {
    isDrawerOpen,
    setIsDrawerOpen,
    currentScreen,
    navigateAdminScreen,
    logoutAdmin,
  } = useAdmin();

  const menuItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'push_notifications', label: 'Push Notifications', icon: Bell },
    { id: 'flash_deals', label: '⚡ Flash Deals', icon: Flame },
    { id: 'banners', label: 'Sliding Banners', icon: ImageIcon },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'support', label: 'Support & Live Chat', icon: Headphones },
    { id: 'categories', label: 'Categories', icon: Layers },
    { id: 'offers', label: 'Offers & Discounts', icon: Sparkles },
    { id: 'reports_settings', label: 'Reports & Settings', icon: Settings },
  ];

  const handleNav = (screen: AdminScreen) => {
    navigateAdminScreen(screen);
    setIsDrawerOpen(false);
  };

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsDrawerOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs"
          />

          {/* Slide Drawer Content (Dark themed as per Screen 3) */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 280 }}
            className="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-[#121418] text-white flex flex-col justify-between shadow-2xl overflow-hidden font-sans select-none"
          >
            {/* Top User Profile Header */}
            <div className="p-6 pt-7 border-b border-white/5">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-slate-800 border-2 border-slate-700/80 overflow-hidden flex items-center justify-center shadow-inner">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80"
                    alt="Admin Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <h3 className="text-base font-bold text-white tracking-tight">Admin</h3>
                <p className="text-xs text-slate-400 font-medium">Super Admin</p>
              </div>
            </div>

            {/* Menu Navigation List */}
            <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar py-4 px-3 space-y-1">
              {menuItems.map((item, index) => {
                const Icon = item.icon;
                const isActive =
                  currentScreen === item.id ||
                  (item.id === 'products' && (currentScreen === 'products' || currentScreen === 'add_product' || currentScreen === 'product_details')) ||
                  (item.id === 'orders' && (currentScreen === 'orders' || currentScreen === 'order_details'));

                return (
                  <button
                    key={`${item.id}-${index}`}
                    onClick={() => handleNav(item.id)}
                    className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#E53935] text-white shadow-lg shadow-red-950/40'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-white/5 space-y-2">
              {onSwitchToCustomerApp && (
                <button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    onSwitchToCustomerApp();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4 text-slate-400" />
                  <span>Switch to Customer App</span>
                </button>
              )}

              <button
                onClick={logoutAdmin}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-[#E53935] hover:bg-red-950/20 transition-colors cursor-pointer"
              >
                <LogOut className="w-5 h-5 text-[#E53935]" />
                <span>Logout</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
