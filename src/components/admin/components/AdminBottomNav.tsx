import React from 'react';
import { LayoutDashboard, Package, ShoppingBag, Users, Headphones } from 'lucide-react';
import { useAdmin } from '../AdminContext';
import { AdminScreen } from '../types';

export const AdminBottomNav: React.FC = () => {
  const { currentScreen, navigateAdminScreen, orders, supportTickets } = useAdmin();

  const isDashboardActive = currentScreen === 'dashboard';
  const isProductsActive =
    currentScreen === 'products' ||
    currentScreen === 'add_product' ||
    currentScreen === 'product_details' ||
    currentScreen === 'edit_product';
  const isOrdersActive = currentScreen === 'orders' || currentScreen === 'order_details';
  const isUsersActive = currentScreen === 'users';
  const isSupportActive = currentScreen === 'support';

  const pendingOrdersCount = orders.filter((o) => o.status === 'Preparing' || o.status === 'Pending').length;
  const openTicketsCount = supportTickets.filter((t) => t.status === 'Open').length;

  return (
    <nav className="w-full bg-white border-t border-slate-300 py-1.5 px-2 flex items-center justify-around shrink-0 select-none z-20 shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
      {/* 1. Dashboard */}
      <button
        onClick={() => navigateAdminScreen('dashboard')}
        className={`flex flex-col items-center justify-center gap-0.5 py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
          isDashboardActive ? 'text-red-600' : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        <LayoutDashboard className={`w-5 h-5 ${isDashboardActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
        <span className={`text-[10px] ${isDashboardActive ? 'font-bold' : 'font-medium'}`}>Dashboard</span>
      </button>

      {/* 2. Products */}
      <button
        onClick={() => navigateAdminScreen('products')}
        className={`flex flex-col items-center justify-center gap-0.5 py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
          isProductsActive ? 'text-red-600' : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        <Package className={`w-5 h-5 ${isProductsActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
        <span className={`text-[10px] ${isProductsActive ? 'font-bold' : 'font-medium'}`}>Products</span>
      </button>

      {/* 3. Orders */}
      <button
        onClick={() => navigateAdminScreen('orders')}
        className={`flex flex-col items-center justify-center gap-0.5 py-1 px-2.5 rounded-xl transition-all relative cursor-pointer ${
          isOrdersActive ? 'text-red-600' : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        <ShoppingBag className={`w-5 h-5 ${isOrdersActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
        <span className={`text-[10px] ${isOrdersActive ? 'font-bold' : 'font-medium'}`}>Orders</span>
        {pendingOrdersCount > 0 && (
          <span className="absolute top-0.5 right-1.5 w-4 h-4 bg-red-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center shadow-xs">
            {pendingOrdersCount}
          </span>
        )}
      </button>

      {/* 4. Users */}
      <button
        onClick={() => navigateAdminScreen('users')}
        className={`flex flex-col items-center justify-center gap-0.5 py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
          isUsersActive ? 'text-red-600' : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        <Users className={`w-5 h-5 ${isUsersActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
        <span className={`text-[10px] ${isUsersActive ? 'font-bold' : 'font-medium'}`}>Users</span>
      </button>

      {/* 5. Support & Live Chat */}
      <button
        onClick={() => navigateAdminScreen('support')}
        className={`flex flex-col items-center justify-center gap-0.5 py-1 px-2.5 rounded-xl transition-all relative cursor-pointer ${
          isSupportActive ? 'text-red-600' : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        <Headphones className={`w-5 h-5 ${isSupportActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
        <span className={`text-[10px] ${isSupportActive ? 'font-bold' : 'font-medium'}`}>Support</span>
        {openTicketsCount > 0 && (
          <span className="absolute top-0.5 right-1.5 w-4 h-4 bg-red-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center shadow-xs">
            {openTicketsCount}
          </span>
        )}
      </button>
    </nav>
  );
};
