import React, { useState } from 'react';
import { Phone, MapPin, CheckCircle, Clock, Truck, XCircle, ChevronDown, Check } from 'lucide-react';
import { useAdmin } from '../AdminContext';
import { AdminHeader } from '../components/AdminHeader';
import { OrderStatus } from '../types';

export const OrderDetailsScreen: React.FC = () => {
  const { selectedOrder, updateOrderStatus, navigateAdminScreen } = useAdmin();
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  if (!selectedOrder) {
    return (
      <div className="w-full h-full bg-[#F8F9FA] flex flex-col justify-center items-center p-6 text-center">
        <p className="text-sm font-bold text-slate-800">No order selected</p>
        <button
          onClick={() => navigateAdminScreen('orders')}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  const allStatuses: OrderStatus[] = ['Preparing', 'On the Way', 'Delivered', 'Cancelled'];

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

  const handleNextStatus = () => {
    if (selectedOrder.status === 'Preparing') {
      updateOrderStatus(selectedOrder.id, 'On the Way');
    } else if (selectedOrder.status === 'On the Way') {
      updateOrderStatus(selectedOrder.id, 'Delivered');
    } else {
      updateOrderStatus(selectedOrder.id, 'Delivered');
    }
  };

  return (
    <div className="w-full h-full bg-[#F8F9FA] text-slate-800 flex flex-col justify-between overflow-hidden font-sans select-none">
      {/* Header */}
      <AdminHeader title="Order Details" showBack={true} showBell={false} />

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar p-4 space-y-3.5">
        {/* ========================================================================= */}
        {/* Order Header Box Matching Screen 9 */}
        {/* ========================================================================= */}
        <div className="bg-white p-4 rounded-3xl border border-slate-300 shadow-2xs flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">{selectedOrder.orderNumber}</h2>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              {selectedOrder.date} • {selectedOrder.time}
            </p>
          </div>

          <span className={`text-xs font-bold px-3 py-1 rounded-full ${getStatusBadge(selectedOrder.status)}`}>
            {selectedOrder.status}
          </span>
        </div>

        {/* ========================================================================= */}
        {/* Customer Information Card */}
        {/* ========================================================================= */}
        <div className="bg-white p-4 rounded-3xl border border-slate-300 shadow-2xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={selectedOrder.customerAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80'}
              alt={selectedOrder.customerName}
              className="w-11 h-11 rounded-full object-cover shrink-0 bg-slate-100 border border-slate-200"
            />
            <div className="min-w-0">
              <h3 className="text-xs font-bold text-slate-900 truncate">{selectedOrder.customerName}</h3>
              <p className="text-[11px] text-slate-400 truncate mt-0.5">{selectedOrder.customerPhone}</p>
            </div>
          </div>

          <a
            href={`tel:${selectedOrder.customerPhone}`}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-2xl text-xs font-bold text-slate-700 active:scale-95 transition-all shrink-0 cursor-pointer"
          >
            <Phone className="w-3.5 h-3.5 text-slate-600" />
            <span>Call</span>
          </a>
        </div>

        {/* ========================================================================= */}
        {/* Delivery Address Card */}
        {/* ========================================================================= */}
        <div className="bg-white p-4 rounded-3xl border border-slate-300 shadow-2xs flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center text-red-600 shrink-0 mt-0.5 border border-red-100">
            <MapPin className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-slate-900">Delivery Address</h4>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">{selectedOrder.deliveryAddress}</p>
          </div>
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0 mt-1" />
        </div>

        {/* ========================================================================= */}
        {/* Order Items List */}
        {/* ========================================================================= */}
        <div className="bg-white p-4 rounded-3xl border border-slate-300 shadow-2xs space-y-3">
          <h4 className="text-xs font-bold text-slate-900">Order Items</h4>

          <div className="divide-y divide-slate-200">
            {selectedOrder.items.map((item, idx) => (
              <div key={idx} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=120&auto=format&fit=crop&q=80'}
                    alt={item.name}
                    className="w-10 h-10 rounded-xl object-cover shrink-0 bg-slate-100 border border-slate-200"
                  />
                  <div className="min-w-0">
                    <h5 className="text-xs font-bold text-slate-900 truncate">{item.name}</h5>
                    <p className="text-[11px] text-slate-400">x{item.quantity}</p>
                  </div>
                </div>

                <span className="text-xs font-bold text-slate-900 shrink-0">
                  Rs. {item.price * item.quantity}
                </span>
              </div>
            ))}
          </div>

          {/* Pricing Breakdown */}
          <div className="pt-3 border-t border-slate-200 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Sub Total</span>
              <span className="font-semibold text-slate-800">Rs. {selectedOrder.subTotal}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Delivery Fee</span>
              <span className="font-semibold text-slate-800">Rs. {selectedOrder.deliveryFee}</span>
            </div>
            <div className="flex justify-between text-slate-900 font-bold text-sm pt-2 border-t border-dashed border-slate-300">
              <span>Total</span>
              <span className="text-red-600">Rs. {selectedOrder.total}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* Bottom Fixed Action Buttons Matching Screen 9 */}
      {/* ========================================================================= */}
      <div className="bg-white border-t border-slate-300 p-4 shrink-0 space-y-2 relative">
        {/* Status Dropdown Popover */}
        {showStatusDropdown && (
          <div className="absolute bottom-20 inset-x-4 bg-white rounded-3xl shadow-2xl border border-slate-300 p-2 z-30 space-y-1">
            <p className="text-[11px] font-bold text-slate-400 px-3 py-1.5 uppercase">Select Order Status</p>
            {allStatuses.map((st) => (
              <button
                key={st}
                onClick={() => {
                  updateOrderStatus(selectedOrder.id, st);
                  setShowStatusDropdown(false);
                }}
                className={`w-full px-3.5 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                  selectedOrder.status === st
                    ? 'bg-red-50 text-red-600'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{st}</span>
                {selectedOrder.status === st && <Check className="w-4 h-4 text-red-600" />}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowStatusDropdown(!showStatusDropdown)}
            className="flex-1 py-3 bg-white hover:bg-slate-50 border-2 border-red-600 text-red-600 font-bold text-xs rounded-2xl flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
          >
            <span>Update Status</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleNextStatus}
            className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-red-600/20 transition-all cursor-pointer"
          >
            <span>
              {selectedOrder.status === 'Preparing'
                ? 'Dispatch Order'
                : selectedOrder.status === 'On the Way'
                ? 'Mark as Delivered'
                : 'Mark as Completed'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
