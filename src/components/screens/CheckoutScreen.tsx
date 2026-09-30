import React, { useState, useRef } from 'react';
import {
  ArrowLeft,
  MapPin,
  Clock,
  ShieldCheck,
  CreditCard,
  Wallet,
  Building,
  DollarSign,
  Lock,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { HeaderMeatGharLogo } from '../MeatGharLogo';
import { GreenTickLottie } from '../GreenTickLottie';
import { useCart } from '../../context/CartContext';
import { supabase } from '../../lib/supabase';

interface CheckoutScreenProps {
  onBack: () => void;
  onPlaceOrder: () => void;
}

export const CheckoutScreen: React.FC<CheckoutScreenProps> = ({
  onBack,
  onPlaceOrder,
}) => {
  const { totalAmount, subtotal, deliveryFee, taxes, taxRate, storeOpen, pricingError, couponCode, discount, couponError, couponLoading, cartItems, clearCart } = useCart();
  const [selectedPayment, setSelectedPayment] = useState<'upi' | 'card' | 'netbanking' | 'wallet' | 'cod'>('cod');
  const [isSuccessModal, setIsSuccessModal] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const displayTotal = totalAmount;
  const [savedDeliveryAddress,setSavedDeliveryAddress] = useState('Select a saved address');
  const [customerName,setCustomerName] = useState('');
  const [isSubmitting,setIsSubmitting] = useState(false);
  const submitting = useRef(false);
  const requestId = useRef(crypto.randomUUID());
  React.useEffect(()=>{void (async()=>{try {
    const {data:{user},error:authError}=await supabase.auth.getUser(); if(authError || !user) throw new Error('Please sign in');
    const {data:address,error}=await supabase.from('addresses').select('*').eq('id',localStorage.getItem('meatghar_selected_address_id') || '').eq('user_id',user.id).single(); if(error) throw error;
    setSavedDeliveryAddress([address.house_flat,address.street_road,address.locality,address.city].filter(Boolean).join(', '));setCustomerName(address.full_name);
    const {data:wallet,error:walletError}=await supabase.from('user_wallets').select('balance').eq('user_id',user.id).maybeSingle(); if(walletError) throw walletError; setWalletBalance(Number(wallet?.balance || 0));
  }catch(error:any){setErrorMessage(error.message);}})();},[]);
  const handlePlaceOrderClick = async () => {
    if(submitting.current) return;
    submitting.current=true;setIsSubmitting(true);setErrorMessage('');
    try {
      if(pricingError) throw new Error(pricingError);
      if(!storeOpen) throw new Error('The store is currently closed');
      if(couponLoading || couponError) throw new Error(couponError || 'Wait for coupon validation');
      if(!cartItems.length) throw new Error('Your cart is empty.');
      if(selectedPayment !== 'cod' && selectedPayment !== 'wallet') throw new Error('Online payment is not configured. Choose Cash on Delivery or Wallet.');
      const addressId=localStorage.getItem('meatghar_selected_address_id');if(!addressId) throw new Error('Select a saved delivery address first.');
      const {data:order,error}=await supabase.rpc('place_order',{p_request:requestId.current,p_address:addressId,p_items:cartItems.map(item=>({productId:item.productId || item.id,quantity:item.quantity,quantityKg:item.quantityKg,cut:item.cut,notes:item.notes})),p_payment:selectedPayment.toUpperCase(),p_coupon:couponCode || null,p_expected_total:displayTotal});
      if(error) throw error;
      if(!order?.id) throw new Error('No order confirmation received.');
      localStorage.setItem('meatghar_last_order_id',order.id);
      clearCart();setIsSuccessModal(true);onPlaceOrder();
    }catch(error:any){setErrorMessage(error.message || 'Order could not be placed. Your cart has been kept.');}
    finally {submitting.current=false;setIsSubmitting(false);}
  };

  return (
    <div className="w-full h-full bg-slate-50 text-slate-800 flex flex-col justify-between relative overflow-hidden select-none">
      {/* Top Header */}
      <div className="shrink-0 bg-white px-4 pt-3 pb-3 border-b border-slate-200 shadow-2xs z-30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="p-1.5 rounded-full hover:bg-slate-100 text-[#A8071A] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-extrabold text-slate-900">Checkout</h2>
        </div>

        <HeaderMeatGharLogo />
      </div>

      {/* Main Content */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-3.5 no-scrollbar pb-6">
        {/* Delivery Address Summary */}
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#A8071A] fill-[#A8071A]" />
              <span className="text-xs font-extrabold text-slate-900">Delivery Address</span>
            </div>
            <button onClick={onBack} className="text-xs font-bold text-[#A8071A]">
              Change &gt;
            </button>
          </div>

          <div>
            <span className="text-[10px] bg-red-50 text-[#A8071A] px-2 py-0.5 rounded-md font-bold">Home</span>
            <p className="text-xs font-bold text-slate-900 mt-1">{customerName}</p>
            <p className="text-xs text-slate-600 font-medium leading-snug">
              {savedDeliveryAddress}
            </p>
          </div>
        </div>

        {/* Delivery Guarantee Banner */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-3 flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-950">
              <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Est. Delivery Time</span>
            </div>
            <p className="text-sm font-black text-emerald-900 mt-1">35 - 55 minutes</p>
          </div>

          <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-3 flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-950">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>70-MIN GUARANTEE</span>
            </div>
            <p className="text-[10px] font-medium text-emerald-800 leading-tight mt-1">
              Delivery estimates depend on your address. Contact support for delays.
            </p>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-extrabold text-slate-900">Order Summary</h3>
          </div>

          <div className="space-y-2">{cartItems.map(item=><div key={item.id} className="flex justify-between text-xs"><span>{item.name} · {item.weight} × {item.quantity}</span><strong>₹{(item.price*item.quantity).toFixed(2)}</strong></div>)}</div>
          {/* Charges */}
          <div className="pt-2 border-t border-slate-100 space-y-1 text-xs">
            <div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
            {discount>0 && <div className="flex justify-between"><span>Discount</span><span>−₹{discount.toFixed(2)}</span></div>}
            <div className="flex justify-between"><span>Delivery fee</span><span>₹{deliveryFee}</span></div>
            <div className="flex justify-between"><span>Tax ({taxRate}%)</span><span>₹{taxes}</span></div>
            <div className="flex justify-between font-black text-slate-900 text-sm pt-1 border-t border-slate-100">
              <span>Grand Total</span>
              <span className="text-[#A8071A] text-base">₹{displayTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Payment Methods - 2 Options Per Row */}
        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-extrabold text-slate-900">Select Payment Method</h3>
            <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>100% Secure</span>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {/* Row 1: UPI */}
            <button
              type="button"
              disabled title="Payment gateway is not configured"
              className={`p-3 rounded-2xl border flex items-center gap-3 transition-all cursor-pointer text-left ${
                selectedPayment === 'upi'
                  ? 'border-[#A8071A] bg-red-50/60 text-[#A8071A] ring-2 ring-red-500/20 shadow-2xs'
                  : 'border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-red-100 text-[#A8071A] font-black flex items-center justify-center text-xs shrink-0">
                UPI
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-extrabold leading-tight">UPI / GPay</h4>
                <p className="text-[9px] text-slate-500 font-medium">Not configured</p>
              </div>
            </button>

            {/* Row 1: Wallet */}
            <button
              type="button"
              onClick={() => setSelectedPayment('wallet')}
              className={`p-3 rounded-2xl border flex items-center gap-3 transition-all cursor-pointer text-left ${
                selectedPayment === 'wallet'
                  ? 'border-[#A8071A] bg-red-50/60 text-[#A8071A] ring-2 ring-red-500/20 shadow-2xs'
                  : 'border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 font-bold flex items-center justify-center shrink-0">
                <Wallet className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-extrabold leading-tight">Wallet (₹{walletBalance})</h4>
                <p className="text-[9px] text-emerald-600 font-bold">MeatGhar Balance</p>
              </div>
            </button>

            {/* Row 2: Cash On Delivery (Full Width) */}
            <button
              type="button"
              onClick={() => setSelectedPayment('cod')}
              className={`col-span-2 p-3 rounded-2xl border flex items-center gap-3 transition-all cursor-pointer text-left ${
                selectedPayment === 'cod'
                  ? 'border-[#A8071A] bg-red-50/60 text-[#A8071A] ring-2 ring-red-500/20 shadow-2xs'
                  : 'border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0">
                <DollarSign className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-extrabold leading-tight">Cash on Delivery (COD)</h4>
                <p className="text-[9px] text-slate-500 font-medium">Pay cash / UPI at your doorstep</p>
              </div>
            </button>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex flex-col items-center justify-center gap-0.5 text-center">
            <span className="flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Secure checkout
            </span>
            <span className="font-mono text-slate-500 font-extrabold text-[10px] tracking-wider">
              WALLET | COD
            </span>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Place Order Button (Never scrolls) */}
      <div className="shrink-0 bg-white border-t border-slate-200 p-3 z-30 shadow-lg space-y-2">
        {errorMessage && (
          <div className="bg-red-50 text-red-600 text-xs font-bold px-3 py-2 rounded-xl border border-red-100 text-center animate-fade-in">
            {errorMessage}
          </div>
        )}
        <button
          disabled={isSubmitting || !cartItems.length || !storeOpen || !!pricingError || couponLoading || !!couponError}
            onClick={handlePlaceOrderClick}
          className="w-full py-3.5 px-6 bg-[#A8071A] hover:bg-red-800 active:bg-red-900 text-white font-bold text-sm sm:text-base rounded-xl shadow-md shadow-red-900/20 transition-all duration-200 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
        >
          <Lock className="w-4 h-4" />
          <span>Pay &amp; Place Order (₹{displayTotal}) &rarr;</span>
        </button>
      </div>

      {/* Order Placed Success Modal with Green Tick Lottie */}
      {isSuccessModal && (
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 text-center shadow-2xl max-w-xs w-full space-y-3 border border-slate-100 animate-scale-up">
            <GreenTickLottie className="w-24 h-24 mx-auto" loop={true} />
            <h3 className="text-lg font-black text-slate-900">
              Order Placed Successfully!
            </h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Your order <span className="font-bold text-slate-800">{localStorage.getItem('meatghar_last_order_id')}</span> is confirmed. Opening order details…
            </p>
            <div className="w-full bg-emerald-50 rounded-xl p-2.5 border border-emerald-200 flex items-center justify-center gap-1.5 text-[11px] font-bold text-emerald-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Order confirmed by the store</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
