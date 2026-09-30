import React from 'react';
import { AppImage } from '../common/AppImage';

interface Onboarding3ScreenProps {
  onNext: () => void;
  onSkip: () => void;
}

export const Onboarding3Screen: React.FC<Onboarding3ScreenProps> = ({
  onNext,
  onSkip,
}) => {
  return (
    <div className="w-full h-full bg-white text-slate-800 flex flex-col justify-between py-6 px-6 relative select-none overflow-hidden font-sans">
      {/* Top Header - Skip Button */}
      <div className="flex justify-end pt-1 z-10">
        <button
          onClick={onSkip}
          className="text-xs font-bold text-[#A8071A] hover:text-red-800 transition-colors py-1.5 px-3 rounded-lg active:scale-95 cursor-pointer"
        >
          Skip
        </button>
      </div>

      {/* Center Image / Graphic Container */}
      <div className="my-auto flex flex-col items-center">
        <div className="relative w-full max-w-[320px] aspect-4/3 rounded-2xl overflow-hidden shadow-md border border-slate-100 mb-6 group bg-red-50/30 flex items-center justify-center">
          <AppImage
            src="/images/meat_delivery_70_1790501379469.jpg"
            alt="70 Minute Express Meat Delivery"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        {/* Content Details */}
        <div className="text-left w-full px-1">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#800a1d] tracking-tight leading-tight mb-2">
            Order Updates
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed">
            Track your order status from preparation to delivery. Contact support if you need help.
          </p>
        </div>
      </div>

      {/* Bottom Controls Area */}
      <div className="w-full flex flex-col items-center gap-5 pb-2">
        {/* Pagination Dots (3 dots, 3rd active) */}
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
          <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
          <span className="w-3 h-3 rounded-full bg-[#A8071A] transition-all" />
        </div>

        {/* Get Started Button */}
        <button
          onClick={onNext}
          className="w-full py-3.5 px-6 bg-[#A8071A] hover:bg-red-800 active:bg-red-900 text-white font-bold text-sm sm:text-base rounded-xl shadow-md shadow-red-900/20 transition-all duration-200 active:scale-[0.99] flex items-center justify-center cursor-pointer"
        >
          Get Started &rarr;
        </button>
      </div>
    </div>
  );
};
