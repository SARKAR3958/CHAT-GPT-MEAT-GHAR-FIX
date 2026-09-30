import {supabase} from '../../lib/supabase';
import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ShoppingCart,
  ClipboardList,
  RotateCcw,
  Eye,
  Home,
  Grid,
  User,
  Share2,
} from 'lucide-react';
import { HeaderMeatGharLogo } from '../MeatGharLogo';
import { AppImage } from '../common/AppImage';
import { useCart } from '../../context/CartContext';

interface MyOrdersScreenProps {
  onBack: () => void;
  onSelectOrderDetails: (orderId: string) => void;
  onNavigateTab: (tab: string) => void;
  isOrderDelivered?: boolean;
}

interface OrderItem {
  productId: string;
  quantity:number;
  unit:string;
  quantityKg?:number;
  image:string;
  name: string;
  qty: string;
  prep: string;
  price: string;
}

interface Order {
  id: string;
  date: string;
  time: string;
  status: 'Completed' | 'Active' | 'Cancelled';
  statusLabel: string;
  totalAmount: string;
  deliveredText?: string;
  items: OrderItem[];
}

export const MyOrdersScreen: React.FC<MyOrdersScreenProps> = ({
  onBack,
  onSelectOrderDetails,
  onNavigateTab,
  isOrderDelivered = false,
}) => {
  const { cartCount,addToCart } = useCart();
  const [activeTab, setActiveTab] = useState<'Active' | 'Completed' | 'Cancelled'>(
    isOrderDelivered ? 'Completed' : 'Active'
  );

  const [loadError,setLoadError]=useState('');
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      const {data:{user}}=await supabase.auth.getUser(); if(!user)return;
      const { data, error } = await supabase
        .from('orders')
        .select('*').eq('user_id',user.id)
        .order('created_at', { ascending: false });

      if (error) {
        setLoadError(error.message);
        return;
      }

      if (data) {
        setOrders(data.map((o: any) => ({
          id: o.id,
          date: new Date(o.created_at).toLocaleDateString(),
          time: new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: o.status === 'Delivered' ? 'Completed' : o.status === 'Cancelled' ? 'Cancelled' : 'Active',
          statusLabel: o.status,
          totalAmount: `₹${o.total_amount}`,
          deliveredText: o.status === 'Delivered'
            ? `Delivered on ${new Date(o.delivered_at || o.created_at).toLocaleDateString()}`
            : `Status: ${o.status}`,
          items: (o.items || []).map((it: any) => ({
            productId:it.productId,quantity:it.quantity,unit:it.unit,quantityKg:it.quantityKg,
            name: it.name,
            qty: `${it.quantity || 1} ${it.unit || 'Unit'}`,
            prep: 'Full Cleaned',
            price: `₹${it.price}`,
            image: it.image || '/images/chicken_curry_cut_wide_1790508282856.jpg',
          })),
        })));
      }
    };
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter((o) => o.status === activeTab);

  return (
    <div className="w-full h-full bg-slate-50 text-slate-800 flex flex-col justify-between relative overflow-hidden select-none font-sans">
      {loadError && <p role="alert" className="p-3 bg-red-50 text-red-800">{loadError}</p>}
      {/* 1. FIXED TOP HEADER (Never scrolls) */}
      <div className="shrink-0 bg-white px-4 pt-3 pb-3 border-b border-slate-200/90 shadow-2xs z-30">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2.5">
            <button
              onClick={onBack}
              className="p-1 rounded-full hover:bg-slate-100 text-[#BA181B] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
            </button>
            <h2 className="text-base font-black text-slate-900 leading-tight">My Orders</h2>
          </div>

          <HeaderMeatGharLogo />
        </div>

        <p className="text-xs text-slate-500 font-medium mb-3">
          Track your orders, view details and reorder your favourite meat.
        </p>

        {/* Tab Filters */}
        <div className="flex items-center bg-slate-100/90 p-1 rounded-2xl border border-slate-200/60">
          {(['Active', 'Completed', 'Cancelled'] as const).map((tab) => {
            const isSelected = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-[#BA181B] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. SCROLLABLE ORDERS LIST ONLY */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3.5 no-scrollbar">
        {filteredOrders.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-2 bg-white rounded-2xl p-6 border border-slate-200">
            <ClipboardList className="w-10 h-10 text-slate-300" />
            <h3 className="text-sm font-bold text-slate-700">No {activeTab} Orders</h3>
            <p className="text-xs text-slate-400">You don't have any {activeTab.toLowerCase()} orders right now.</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs space-y-3 hover:border-red-200 transition-all"
            >
              {/* Card Header: Order ID & Date + Status Badge */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div>
                  <h3 className="text-xs font-black text-slate-900">Order #{order.id}</h3>
                  <p className="text-[10px] text-slate-400 font-medium">
                    {order.date} &bull; {order.time}
                  </p>
                </div>

                <span
                  className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${
                    order.status === 'Active'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : order.status === 'Completed'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}
                >
                  {order.statusLabel}
                </span>
              </div>

              {/* Items in Order */}
              <div className="space-y-2">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2.5">
                    <AppImage
                      src={item.image}
                      alt={item.name}
                      className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0 border border-slate-100"
                    />
                    <div className="flex-1 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-slate-900 line-clamp-1">{item.name}</p>
                        <p className="text-[10px] text-slate-500">
                          {item.qty} &bull; {item.prep}
                        </p>
                      </div>
                      <span className="font-extrabold text-slate-900">{item.price}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Amount Box */}
              <div className="bg-slate-50 border border-slate-200/90 rounded-xl px-3 py-2 flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                  Total Amount
                </span>
                <span className="text-base font-black text-[#BA181B]">{order.totalAmount}</span>
              </div>

              {/* Delivered Text */}
              {order.deliveredText && (
                <div
                  className={`rounded-xl px-3 py-2 text-center text-xs font-bold border ${
                    order.status === 'Completed'
                      ? 'bg-emerald-50/90 text-emerald-800 border-emerald-200'
                      : 'bg-amber-50/90 text-amber-800 border-amber-200'
                  }`}
                >
                  <span>{order.deliveredText}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => onSelectOrderDetails(order.id)}
                  className="py-2 px-3 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-600" />
                  <span>View Details</span>
                </button>

                <button
                  onClick={() => {for(const item of order.items)addToCart({id:item.productId,name:item.name,price:Number(item.price.replace(/[^0-9.]/g,'')),quantity:item.quantity,quantityKg:item.quantityKg,weight:item.unit,image:item.image});onNavigateTab('cart');}}
                  className="py-2 px-3 bg-[#BA181B] hover:bg-red-800 active:bg-red-900 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Order Again</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 3. FIXED BOTTOM NAVIGATION BAR (Never scrolls) */}
      <div className="shrink-0 bg-white border-t border-slate-200/90 px-4 py-2 flex items-center justify-around z-30 shadow-md">
        <button
          onClick={() => onNavigateTab('home')}
          className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-slate-600 cursor-pointer"
        >
          <Home className="w-5 h-5 stroke-[1.8]" />
          <span className="text-[10px] font-medium text-slate-500">Home</span>
        </button>

        <button
          onClick={() => onNavigateTab('category')}
          className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-slate-600 cursor-pointer"
        >
          <Grid className="w-5 h-5 stroke-[1.8]" />
          <span className="text-[10px] font-medium text-slate-500">Categories</span>
        </button>

        <button
          onClick={() => onNavigateTab('cart')}
          className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-slate-600 relative cursor-pointer"
        >
          <ShoppingCart className="w-5 h-5 text-slate-400 stroke-[1.8]" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#BA181B] text-white text-[9px] font-extrabold flex items-center justify-center border-1.5 border-white shadow-2xs">
              {cartCount}
            </span>
          )}
          <span className="text-[10px] font-medium text-slate-500">Cart</span>
        </button>

        <button
          onClick={() => onNavigateTab('orders')}
          className="flex flex-col items-center gap-0.5 text-[#BA181B] relative cursor-pointer"
        >
          <ClipboardList className="w-5 h-5 text-[#BA181B] stroke-[#BA181B] stroke-[2.2]" />
          <span className="text-[10px] font-bold text-[#BA181B]">Orders</span>
          <div className="w-7 h-[2.5px] bg-[#BA181B] rounded-full absolute -bottom-1.5" />
        </button>

        <button
          onClick={() => onNavigateTab('share')}
          className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-slate-600 cursor-pointer"
        >
          <Share2 className="w-5 h-5 stroke-[1.8]" />
          <span className="text-[10px] font-medium text-slate-500">Share</span>
        </button>
      </div>
    </div>
  );
};
