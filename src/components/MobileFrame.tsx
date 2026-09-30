import React from 'react';

export type ScreenType =
  | 'splash'
  | 'onboarding1'
  | 'onboarding2'
  | 'onboarding3'
  | 'signup'
  | 'signup_form'
  | 'location_perm'
  | 'location_search'
  | 'address_form'
  | 'home'
  | 'category'
  | 'search'
  | 'product_details'
  | 'cart'
  | 'delivery_address'
  | 'checkout'
  | 'order_success'
  | 'track_order'
  | 'rate_order'
  | 'my_orders'
  | 'order_details'
  | 'my_profile'
  | 'profile_edit'
  | 'my_addresses'
  | 'notifications'
  | 'help_support'
  | 'coupons'
  | 'share'
  | 'wallet'
  | 'admin_panel';

interface MobileFrameProps {
  currentScreen?: ScreenType;
  setScreen?: (screen: ScreenType) => void;
  children: React.ReactNode;
}

export const MobileFrame: React.FC<MobileFrameProps> = ({ children }) => {
  return (
    <div className="w-full h-[100dvh] bg-white text-slate-800 flex flex-col items-center justify-start overflow-hidden select-none">
      {/* Container adapts directly to full width & full viewport height without any bottom whitespace */}
      <div className="w-full max-w-lg h-full bg-white flex flex-col relative overflow-hidden shadow-none md:shadow-xl border-none">
        {children}
      </div>
    </div>
  );
};
