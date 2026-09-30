import React, { useState } from 'react';
import {
  ArrowLeft,
  User,
  MapPin,
  ShoppingCart,
  ClipboardList,
  Ticket,
  Wallet,
  Bell,
  HelpCircle,
  FileText,
  Shield,
  Info,
  LogOut,
  ChevronRight,
  Edit2,
  Home,
  Grid,
  X,
  CheckCircle2,
  ShieldCheck,
  Share2,
} from 'lucide-react';
import { HeaderMeatGharLogo, MeatGharLogo } from '../MeatGharLogo';
import { useCart } from '../../context/CartContext';

interface MyProfileScreenProps {
  userName: string;
  userPhone: string;
  currentAddress?: string;
  onBack: () => void;
  onNavigateOption: (screen: string) => void;
  onLogout: () => void;
}

export const MyProfileScreen: React.FC<MyProfileScreenProps> = ({
  userName,
  userPhone,
  currentAddress = 'No address set',
  onBack,
  onNavigateOption,
  onLogout,
}) => {
  const { cartCount } = useCart();
  const [activeModal, setActiveModal] = useState<'about' | 'privacy' | 'terms' | null>(null);

  const menuItems = [
    {
      id: 'profile_edit',
      icon: User,
      title: 'My Profile',
      subtitle: 'View and edit your personal details',
      badge: null,
    },
    {
      id: 'cart',
      icon: ShoppingCart,
      title: 'My Cart',
      subtitle: 'View items in your cart & proceed to checkout',
      badge: cartCount > 0 ? String(cartCount) : null,
    },
    {
      id: 'addresses',
      icon: MapPin,
      title: 'My Addresses',
      subtitle: 'Manage your delivery addresses',
      badge: null,
    },
    {
      id: 'orders',
      icon: ClipboardList,
      title: 'My Orders',
      subtitle: 'Track your orders and view history',
      badge: null,
    },
    {
      id: 'referral',
      icon: Share2,
      title: 'Share Meat Ghar',
      subtitle: 'Share the store link with friends',
      badge: null,
    },
    {
      id: 'coupons',
      icon: Ticket,
      title: 'Coupons',
      subtitle: 'View and manage your available coupons',
      badge: 'New',
    },
    {
      id: 'wallet',
      icon: Wallet,
      title: 'Wallet',
      subtitle: 'Your wallet balance and transactions',
      badge: null,
    },
    {
      id: 'notifications',
      icon: Bell,
      title: 'Notifications',
      subtitle: 'Order updates, offers and more',
      badge: null,
    },
    {
      id: 'support',
      icon: HelpCircle,
      title: 'Help & Support',
      subtitle: 'Get help or contact us',
      badge: null,
    },
    {
      id: 'terms',
      icon: FileText,
      title: 'Terms & Conditions',
      subtitle: 'Read our terms and conditions',
      badge: null,
    },
    {
      id: 'privacy',
      icon: Shield,
      title: 'Privacy Policy',
      subtitle: 'How we protect your data',
      badge: null,
    },
    {
      id: 'about',
      icon: Info,
      title: 'About Meat Ghar',
      subtitle: 'Version 1.0.0',
      badge: null,
    },
  ];

  const handleItemClick = (id: string) => {
    if (id === 'about' || id === 'privacy' || id === 'terms') {
      setActiveModal(id);
    } else {
      onNavigateOption(id);
    }
  };

  return (
    <div className="w-full h-full min-h-0 bg-slate-50 text-slate-800 flex flex-col justify-between relative overflow-hidden select-none font-sans">
      {/* Header */}
      <div className="bg-white px-4 pt-3 pb-3 border-b border-slate-200 shadow-2xs z-20">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <button
              onClick={onBack}
              className="p-1.5 rounded-full hover:bg-slate-100 text-[#BA181B] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-extrabold text-slate-900">My Profile</h2>
          </div>

          <HeaderMeatGharLogo />
        </div>
        <p className="text-xs text-slate-500 font-normal">
          Manage your account and preferences.
        </p>
      </div>

      {/* Main Scrollable Settings Menu */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-3 no-scrollbar pb-16">
        {/* Profile Card */}
        <div className="bg-red-50/50 border border-red-200/80 rounded-2xl p-3.5 flex items-start gap-3 shadow-2xs">
          <div className="w-12 h-12 rounded-full bg-[#1e293b] text-white font-bold flex items-center justify-center text-lg shadow-sm shrink-0 mt-0.5">
            <User className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <h3 className="text-sm font-extrabold text-slate-900 leading-snug">
              {userName || 'User'}
            </h3>
            <p className="text-xs text-slate-600 font-medium flex items-center gap-1">
              <span>📞</span> <span>{userPhone ? `+91 ${userPhone}` : 'No phone set'}</span>
            </p>
            <div className="pt-1.5 border-t border-red-200/60 flex items-start gap-1 text-[11px] text-slate-600 font-medium leading-tight">
              <MapPin className="w-3.5 h-3.5 text-[#BA181B] shrink-0 mt-0.5" />
              <span className="line-clamp-2">
                {currentAddress}
              </span>
            </div>
          </div>
        </div>

        {/* Menu Items List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs divide-y divide-slate-100 overflow-hidden">
          {menuItems.map((item) => {
            const ItemIcon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-red-50 text-[#BA181B] flex items-center justify-center shrink-0">
                    <ItemIcon className="w-5 h-5 stroke-[2]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900 leading-snug">
                      {item.title}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-medium">
                      {item.subtitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {item.badge && (
                    <span className="bg-[#BA181B] text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded-full shadow-2xs tracking-tight">
                      {item.badge}
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </button>
            );
          })}

          {/* Logout Item */}
          <button
            onClick={onLogout}
            className="w-full p-3.5 flex items-center justify-between hover:bg-red-50 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                <LogOut className="w-5 h-5 stroke-[2]" />
              </div>
              <div>
                <h4 className="text-xs font-black text-red-700 leading-snug">Logout</h4>
                <p className="text-[10px] text-red-400 font-medium">
                  Sign out from your account
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-red-400" />
          </button>
        </div>
      </div>

      {/* POPUP MODAL DIALOGS */}
      {activeModal && (
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl border border-slate-200 max-h-[85vh] flex flex-col justify-between overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                {activeModal === 'about' && <Info className="w-5 h-5 text-[#BA181B]" />}
                {activeModal === 'privacy' && <Shield className="w-5 h-5 text-[#BA181B]" />}
                {activeModal === 'terms' && <FileText className="w-5 h-5 text-[#BA181B]" />}
                <h3 className="text-base font-extrabold text-slate-900 capitalize">
                  {activeModal === 'about' && 'About Meat Ghar'}
                  {activeModal === 'privacy' && 'Privacy Policy'}
                  {activeModal === 'terms' && 'Terms & Conditions'}
                </h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto py-4 space-y-3.5 text-xs text-slate-600 leading-relaxed no-scrollbar">
              {activeModal === 'about' && (
                <>
                  <div className="flex flex-col items-center justify-center text-center pb-2 border-b border-slate-100">
                    <MeatGharLogo variant="red" size="md" showTagline={true} />
                    <span className="text-[10px] text-slate-400 font-bold mt-1">Version 1.0.0</span>
                  </div>

                  <p>
                    <strong>Meat Ghar</strong> is your trusted online fresh meat store dedicated to delivering <strong>fresh</strong> Chicken, Mutton, Seafood & Exotic meats right to your doorstep.
                  </p>

                  <div className="bg-red-50/80 border border-red-200/80 rounded-xl p-3 space-y-2">
                    <h4 className="font-extrabold text-[#BA181B] text-xs">Why Choose Meat Ghar?</h4>
                    <ul className="space-y-1.5 text-[11px] text-slate-700">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span><strong>100% Fresh Daily Catch</strong> — Never frozen.</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span><strong>Delivery Updates</strong> from the store.</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span><strong>Custom Cleaned Cuts</strong> — Full, Skinless & Bone-in.</span>
                      </li>
                    </ul>
                  </div>

                  <p className="text-[11px] text-slate-500">
                    Need assistance? Open Help & Support to contact the store.
                  </p>
                </>
              )}

              {activeModal === 'privacy' && (
                <>
                  <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl p-2.5">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span className="text-[11px] font-bold">Your privacy & data security is our top priority.</span>
                  </div>

                  <p>
                    At Meat Ghar, we collect essential information such as your name, phone number, and delivery address strictly to fulfill your fresh meat orders seamlessly.
                  </p>

                  <div className="space-y-2">
                    <h4 className="font-extrabold text-slate-900 text-xs">1. Data Usage</h4>
                    <p className="text-[11px] text-slate-500">
                      We use your details to dispatch riders, provide delivery status updates, and provide special offers.
                    </p>

                    <h4 className="font-extrabold text-slate-900 text-xs">2. Payment Security</h4>
                    <p className="text-[11px] text-slate-500">
                      Meat Ghar supports Cash on Delivery and verified wallet payments. Card details are not collected.
                    </p>

                    <h4 className="font-extrabold text-slate-900 text-xs">3. No Third-Party Selling</h4>
                    <p className="text-[11px] text-slate-500">
                      We never sell or lease your personal information to external marketers or advertisers.
                    </p>
                  </div>
                </>
              )}

              {activeModal === 'terms' && (
                <>
                  <p>
                    By placing an order on the Meat Ghar mobile application, you agree to comply with the following terms and conditions:
                  </p>

                  <div className="space-y-2.5">
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-xs">1. Freshness & Quality Assurance</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        All meat products are cut fresh upon order confirmation. If you receive an unsatisfactory batch, report within 2 hours of delivery for immediate replacement or full refund.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-extrabold text-slate-900 text-xs">2. Delivery Timelines</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Delivery availability and timing depend on the store and your address.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-extrabold text-slate-900 text-xs">3. Order Cancellations</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Contact support to request a cancellation. Wallet refunds are credited after an administrator cancels an eligible order.
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-100 shrink-0">
              <button
                onClick={() => setActiveModal(null)}
                className="w-full py-2.5 bg-[#BA181B] hover:bg-red-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fixed Bottom Navigation (Never scrolls) */}
      <div className="shrink-0 bg-white border-t border-slate-200/90 px-4 py-2 flex items-center justify-around z-30 shadow-md">
        <button onClick={() => onNavigateOption('home')} className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-slate-600 cursor-pointer">
          <Home className="w-5 h-5 stroke-[1.8]" />
          <span className="text-[10px] font-medium text-slate-500">Home</span>
        </button>

        <button onClick={() => onNavigateOption('category')} className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-slate-600 cursor-pointer">
          <Grid className="w-5 h-5 stroke-[1.8]" />
          <span className="text-[10px] font-medium text-slate-500">Categories</span>
        </button>

        <button onClick={() => onNavigateOption('orders')} className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-slate-600 cursor-pointer">
          <ClipboardList className="w-5 h-5 stroke-[1.8]" />
          <span className="text-[10px] font-medium text-slate-500">Orders</span>
        </button>

        <button onClick={() => onNavigateOption('cart')} className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-slate-600 relative cursor-pointer">
          <ShoppingCart className="w-5 h-5 text-slate-400 stroke-[1.8]" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#BA181B] text-white text-[9px] font-extrabold flex items-center justify-center border-1.5 border-white shadow-2xs">
              {cartCount}
            </span>
          )}
          <span className="text-[10px] font-medium text-slate-500">Cart</span>
        </button>

        <button onClick={() => onNavigateOption('profile')} className="flex flex-col items-center gap-0.5 text-[#BA181B] relative cursor-pointer">
          <User className="w-5 h-5 text-[#BA181B] stroke-[#BA181B] stroke-[2.2]" />
          <span className="text-[10px] font-bold text-[#BA181B]">Profile</span>
          <div className="w-7 h-[2.5px] bg-[#BA181B] rounded-full absolute -bottom-1.5" />
        </button>
      </div>
    </div>
  );
};
