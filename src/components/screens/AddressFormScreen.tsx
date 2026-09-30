import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  MapPin,
  Map,
  User,
  Phone,
  Home,
  Briefcase,
  MoreHorizontal,
  Save,
  Info,
  Building,
} from 'lucide-react';
import { MeatGharLogo } from '../MeatGharLogo';
import { LocationData } from '../../types/location';

interface AddressFormScreenProps {
  onBack: () => void;
  onSaveAddress: (data: any) => void;
  locationData?: LocationData;
}

export const AddressFormScreen: React.FC<AddressFormScreenProps> = ({
  onBack,
  onSaveAddress,
  locationData,
}) => {
  const [addressType, setAddressType] = useState<'Home' | 'Work' | 'Other'>('Home');
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [houseFlat, setHouseFlat] = useState('');
  const [street, setStreet] = useState('');
  const [locality, setLocality] = useState('');
  const [city, setCity] = useState('Guwahati');
  const [area, setArea] = useState<'Boko' | 'Dhupdhara'>('Boko');
  const [pinCode, setPinCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (![fullName,houseFlat,street,locality,city].every(v=>v.trim()) || !/^[+]?[0-9]{10,15}$/.test(mobileNumber.replace(/\s/g,''))) {alert('Complete the address and enter a valid phone number.');return;}
    onSaveAddress({
      fullName,
      mobileNumber: mobileNumber.replace(/\s/g,''),
      houseFlat,
      street,
      locality,
      city,
      area,
      addressType,
      pinCode
    });
  };

  return (
    <div className="w-full h-full min-h-0 bg-slate-50 text-slate-800 flex flex-col justify-between relative overflow-hidden select-none">
      {/* Top Navigation */}
      <div className="bg-white px-4 pt-3 pb-3 border-b border-slate-200 shadow-2xs z-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="p-1.5 rounded-full hover:bg-slate-100 text-[#A8071A] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-base font-extrabold text-slate-900">Add New Address</h2>
        </div>

        <MeatGharLogo variant="red" size="sm" showTagline={false} />
      </div>

      {/* Main Form Fields Container */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-3.5 no-scrollbar">
        
        {/* Address Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-3"
          autoComplete="off"
          noValidate
          data-form-type="other"
        >
          {/* Full Name */}
          <div className="bg-white border border-slate-300 rounded-xl px-3 py-2 focus-within:border-[#A8071A] focus-within:ring-2 focus-within:ring-red-500/20 transition-all">
            <label className="text-[10px] font-semibold text-slate-400 block">
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2 mt-0.5">
              <User className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Rahul Sharma"
                className="w-full text-xs font-semibold text-slate-800 bg-transparent outline-none"
              />
            </div>
          </div>

          {/* Mobile Number */}
          <div className="bg-white border border-slate-300 rounded-xl px-3 py-2 focus-within:border-[#A8071A] focus-within:ring-2 focus-within:ring-red-500/20 transition-all">
            <label className="text-[10px] font-semibold text-slate-400 block">
              Mobile Number <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2 mt-0.5">
              <Phone className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="text-xs font-bold text-slate-600">+91</span>
              <div className="h-3 w-px bg-slate-300" />
              <input
                type="tel"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder="98765 43210"
                className="w-full text-xs font-semibold text-slate-800 bg-transparent outline-none"
              />
            </div>
          </div>

          {/* House / Flat */}
          <div className="bg-white border border-slate-300 rounded-xl px-3 py-2 focus-within:border-[#A8071A] focus-within:ring-2 focus-within:ring-red-500/20 transition-all">
            <label className="text-[10px] font-semibold text-slate-400 block">
              House/Flat <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2 mt-0.5">
              <Home className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={houseFlat}
                onChange={(e) => setHouseFlat(e.target.value)}
                placeholder="B-302"
                className="w-full text-xs font-semibold text-slate-800 bg-transparent outline-none"
              />
            </div>
          </div>

          {/* Street */}
          <div className="bg-white border border-slate-300 rounded-xl px-3 py-2 focus-within:border-[#A8071A] focus-within:ring-2 focus-within:ring-red-500/20 transition-all">
            <label className="text-[10px] font-semibold text-slate-400 block">
              Street <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs font-black text-slate-400 shrink-0">A</span>
              <input
                type="text"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="Green Park Road"
                className="w-full text-xs font-semibold text-slate-800 bg-transparent outline-none"
              />
            </div>
          </div>


          {/* Locality */}
          <div className="bg-white border border-slate-300 rounded-xl px-3 py-2 focus-within:border-[#A8071A] focus-within:ring-2 focus-within:ring-red-500/20 transition-all">
            <label className="text-[10px] font-semibold text-slate-400 block">
              Locality <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2 mt-0.5">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                placeholder="Sector 10"
                className="w-full text-xs font-semibold text-slate-800 bg-transparent outline-none"
              />
            </div>
          </div>

          {/* City & Area (2 columns) */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-white border border-slate-300 rounded-xl px-3 py-2">
              <label className="text-[10px] font-semibold text-slate-400 block">
                City
              </label>
              <input
                type="text"
                value={city}
                disabled
                className="w-full text-xs font-semibold text-slate-800 bg-transparent outline-none"
              />
            </div>

            <div className="bg-white border border-slate-300 rounded-xl px-3 py-2 focus-within:border-[#A8071A] transition-all">
              <label className="text-[10px] font-semibold text-slate-400 block">
                Area <span className="text-red-500">*</span>
              </label>
              <select
                value={area}
                onChange={(e) => setArea(e.target.value as 'Boko' | 'Dhupdhara')}
                className="w-full text-xs font-semibold text-slate-800 bg-transparent outline-none"
              >
                <option value="Boko">Boko</option>
                <option value="Dhupdhara">Dhupdhara</option>
              </select>
            </div>
          </div>


          {/* Address Type Selection */}
          <div className="pt-1">
            <label className="text-[11px] font-bold text-slate-700 block mb-2">
              Address Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setAddressType('Home')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  addressType === 'Home'
                    ? 'bg-[#A8071A] text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Home className="w-3.5 h-3.5" />
                <span>Home</span>
              </button>

              <button
                type="button"
                onClick={() => setAddressType('Work')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  addressType === 'Work'
                    ? 'bg-[#A8071A] text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Work</span>
              </button>

              <button
                type="button"
                onClick={() => setAddressType('Other')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  addressType === 'Other'
                    ? 'bg-[#A8071A] text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <MoreHorizontal className="w-3.5 h-3.5" />
                <span>Other</span>
              </button>
            </div>
          </div>

          {/* Save Address Button */}
          <button
            type="submit"
            className="w-full py-3.5 px-6 bg-[#A8071A] hover:bg-red-800 active:bg-red-900 text-white font-bold text-sm sm:text-base rounded-xl shadow-md shadow-red-900/20 transition-all duration-200 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer mt-4"
          >
            <Save className="w-4 h-4" />
            <span>Save Address</span>
          </button>
        </form>

        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium justify-center pt-1">
          <Info className="w-3.5 h-3.5 text-slate-400" />
          <span>We'll use this address to calculate delivery availability and charges.</span>
        </div>
      </div>
    </div>
  );
};
