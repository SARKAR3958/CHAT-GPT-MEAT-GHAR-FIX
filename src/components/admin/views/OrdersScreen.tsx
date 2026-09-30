import React, { useState } from 'react';
import { Search, ChevronRight, Filter } from 'lucide-react';
import { useAdmin } from '../AdminContext';
import { AdminHeader } from '../components/AdminHeader';
import { AdminBottomNav } from '../components/AdminBottomNav';
import { AdminOrder, OrderStatus } from '../types';

export const OrdersScreen: React.FC = () => {
  const { orders, navigateAdminScreen, setSelectedOrder } = useAdmin();
  const [selectedStatus, setSelectedStatus] = useState<'All' | OrderStatus>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const statusOptions: Array<'All' | OrderStatus> = ['All', 'Preparing', 'On the Way', 'Delivered', 'Cancelled'];

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = selectedStatus === 'All' || order.status === selectedStatus;
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const handleOrderClick = (order: AdminOrder) => {
    setSelectedOrder(order);
    navigateAdminScreen('order_details');
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Preparing':
        return 'bg-amber-50 text-amber-600 border border-amber-200/60';
      case 'On the Way':
        return 'bg-blue-50 text-blue-600 border border-blue-200/60';
      case 'Delivered':
        return 'bg-emerald-50 text-emerald-600 border border-emerald-200/60';
      case 'Cancelled':
      default:
        return 'bg-rose-50 text-rose-600 border border-rose-200/60';
    }
  };

  return (
    <div className="w-full h-full bg-[#F8F9FA] text-slate-800 flex flex-col justify-between overflow-hidden font-sans select-none">
      {/* Header */}
      <AdminHeader title="Orders" showDrawer={true} showBell={true} />

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar p-4 space-y-3.5">
        {/* Status Filter Tab Switchers */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {statusOptions.map((status) => {
            const isSelected = selectedStatus === status;
            return (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {status}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by order ID or user..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-300 rounded-2xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all shadow-2xs"
          />
        </div>

        {/* Orders List Matching Screen 8 */}
        <div className="space-y-2 pt-1">
          {filteredOrders.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-300 text-center space-y-2 shadow-2xs">
              <p className="text-sm font-bold text-slate-800">No orders match filter</p>
              <p className="text-xs text-slate-400">Try changing status or search terms.</p>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const firstItem = order.items[0];
              return (
                <div
                  key={order.id}
                  onClick={() => handleOrderClick(order)}
                  className="bg-white p-3 rounded-2xl border border-slate-300 shadow-2xs flex items-center justify-between gap-3 active:scale-[0.99] hover:border-slate-400 transition-all cursor-pointer"
                >
                  {/* Left: Thumbnail & Details */}
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={firstItem?.image || 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=120&auto=format&fit=crop&q=80'}
                      alt={firstItem?.name || 'Dish'}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=120&auto=format&fit=crop&q=80';
                      }}
                      className="w-12 h-12 rounded-xl object-cover shrink-0 bg-slate-100 border border-slate-100"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 tracking-tight">{order.orderNumber}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">{firstItem?.name || 'Item'}</p>
                      <p className="text-xs font-bold text-slate-800 mt-1">Rs. {order.total}</p>
                    </div>
                  </div>

                  {/* Right: Status Pill, Time & Chevron */}
                  <div className="shrink-0 flex items-center gap-2">
                    <div className="flex flex-col items-end gap-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getStatusBadge(order.status)}`}>
                        {order.status}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">{order.time}</span>
                    </div>

                    <ChevronRight className="w-4 h-4 text-slate-300 stroke-[2.5]" />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Bottom Nav Bar */}
      <AdminBottomNav />
    </div>
  );
};
