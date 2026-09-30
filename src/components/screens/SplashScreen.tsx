import React, { useEffect } from 'react';
import { MeatGharLogo } from '../MeatGharLogo';
import { preloadImages } from '../../utils/imagePreloader';

interface SplashScreenProps {
  onNext: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onNext }) => {
  useEffect(() => {
    // Preload all app images while splash loading screen is visible
    preloadImages();

    const timer = setTimeout(() => {
      onNext();
    }, 6000);
    return () => clearTimeout(timer);
  }, [onNext]);

  return (
    <div
      onClick={onNext}
      className="relative w-full h-full bg-[#A8071A] text-white flex flex-col items-center justify-between py-12 px-6 select-none cursor-pointer overflow-hidden"
    >
      {/* Background Subtle Gradient & Glow */}
      <div className="absolute inset-0 bg-radial from-red-600/30 via-transparent to-black/30 pointer-events-none" />

      {/* Top Spacer */}
      <div className="h-6" />

      {/* Center Main Logo Lockup */}
      <div className="relative z-10 flex flex-col items-center animate-fade-in my-auto">
        <MeatGharLogo size="splash" showTagline={true} />
      </div>

      {/* Bottom Loading Indicator */}
      <div className="relative z-10 flex flex-col items-center gap-2.5 pb-4">
        {/* Smooth Circular Loading Spinner */}
        <div className="w-8 h-8 border-3 border-white/20 border-t-white rounded-full animate-spin-slow shadow-sm" />

        <p className="text-xs font-medium tracking-wide text-white/90">
          Loading fresh cuts...
        </p>
      </div>
    </div>
  );
};
