import React, { useState, useCallback } from 'react';
import { ArrowLeft } from 'lucide-react';
import { MeatGharLogo } from '../MeatGharLogo';
import { InteractiveLocationPickerMap } from '../map/InteractiveLocationPickerMap';
import { LocationData } from '../../types/location';

interface LocationSearchScreenProps {
  onBack: () => void;
  onConfirmLocation: (location: LocationData) => void;
}

export const LocationSearchScreen: React.FC<LocationSearchScreenProps> = ({
  onBack,
  onConfirmLocation,
}) => {
  const [, setCurrentLocation] = useState<LocationData>({
    address: 'Select delivery location',
    lat: 26.1445,
    lng: 91.7362,
    road: 'Main Road',
    suburb: '',
    city: 'Guwahati',
    state: 'Assam',
    postcode: '',
  });

  const handleLocationSelect = useCallback((loc: LocationData) => {
    setCurrentLocation(loc);
  }, []);

  const handleConfirmLocation = useCallback((loc: LocationData) => {
    onConfirmLocation(loc);
  }, [onConfirmLocation]);

  return (
    <div className="w-full h-full min-h-0 bg-slate-50 text-slate-800 flex flex-col justify-between relative overflow-hidden select-none">
      {/* Top Bar Header */}
      <div className="bg-white px-4 pt-3 pb-3 border-b border-slate-200 shadow-2xs z-30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="p-1.5 rounded-full hover:bg-slate-100 text-[#A8071A] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-base font-extrabold text-slate-900 leading-none">Search location</h2>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">Drag map or search address</p>
          </div>
        </div>

        <MeatGharLogo variant="red" size="sm" showTagline={false} />
      </div>

      {/* Main Interactive Map View */}
      <div className="flex-1 relative overflow-hidden flex flex-col">
        <InteractiveLocationPickerMap
          initialLat={26.1445}
          initialLng={91.7362}
          onLocationSelect={handleLocationSelect}
          onConfirm={handleConfirmLocation}
        />
      </div>
    </div>
  );
};
