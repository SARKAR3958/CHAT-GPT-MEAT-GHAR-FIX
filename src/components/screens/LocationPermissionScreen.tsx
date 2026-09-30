import React from 'react';
import { ArrowLeft, MapPin, Edit3, Shield } from 'lucide-react';
import { MeatGharLogo } from '../MeatGharLogo';

interface LocationPermissionScreenProps {
  onBack: () => void;
  onUseCurrentLocation: () => void;
  onEnterAddressManually: () => void;
}

export const LocationPermissionScreen: React.FC<LocationPermissionScreenProps> = ({
  onBack,
  onUseCurrentLocation,
  onEnterAddressManually,
}) => {
  return (
    <div className="w-full h-full min-h-0 bg-white text-slate-800 flex flex-col justify-between relative overflow-hidden select-none">
      {/* Top Navigation */}
      <div className="px-5 pt-3 pb-2 flex items-center justify-between border-b border-slate-100">
        <button
          onClick={onBack}
          className="p-1.5 rounded-full hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="text-xs font-bold text-slate-400">Step 1 of 3 (Location)</span>
      </div>

      {/* Main Content */}
      <div className="px-6 pt-2 pb-6 z-10 flex-1 flex flex-col items-center justify-between">
        <div className="w-full flex flex-col items-center">
          {/* Logo */}
          <div className="mb-4">
            <MeatGharLogo variant="red" size="sm" showTagline={true} />
          </div>

          {/* Map Illustration Asset */}
          <div className="w-full max-w-[280px] aspect-4/3 rounded-2xl overflow-hidden mb-6 shadow-sm border border-slate-100">
            <img
              src="/images/map_delivery_illustration_1790502010289.jpg"
              alt="Map Location"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Heading */}
          <div className="text-center mb-6">
            <h2
              className="text-2xl font-extrabold text-[#111827] tracking-tight mb-2"
              style={{ fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif" }}
            >
              Where should we deliver?
            </h2>
            <p className="text-xs text-slate-500 font-normal leading-relaxed max-w-xs">
              Allow location access to find your delivery area and calculate delivery charges.
            </p>
          </div>
        </div>

        {/* Buttons & Privacy Info */}
        <div className="w-full space-y-3">
          {/* Red Primary Button: Use Current Location */}
          <button
            onClick={onUseCurrentLocation}
            className="w-full py-3.5 px-6 bg-[#A8071A] hover:bg-red-800 active:bg-red-900 text-white font-bold text-sm sm:text-base rounded-xl shadow-md shadow-red-900/20 transition-all duration-200 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
          >
            <MapPin className="w-4 h-4 fill-white" />
            <span>Use Current Location</span>
          </button>

          {/* Outlined Button: Enter Address Manually */}
          <button
            onClick={onEnterAddressManually}
            className="w-full py-3 px-6 bg-white border-2 border-[#A8071A] text-[#A8071A] hover:bg-red-50 font-bold text-xs sm:text-sm rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Edit3 className="w-4 h-4" />
            <span>Enter Address Manually</span>
          </button>

          {/* Privacy note */}
          <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 font-medium pt-2">
            <div className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
              <Shield className="w-2.5 h-2.5" />
            </div>
            <span>Your location is used only to check delivery availability and calculate delivery charges.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
