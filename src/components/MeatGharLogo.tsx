import React from 'react';

interface MeatGharLogoProps {
  variant?: 'red' | 'white';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'header' | 'splash';
  showTagline?: boolean;
}

export const HeaderMeatGharLogo: React.FC<{ variant?: 'red' | 'white' }> = ({
  variant = 'red',
}) => {
  return (
    <div className="flex flex-col items-center shrink-0 select-none h-12 justify-center">
      <img src="/images/APP LOGO NEW.png" alt="Meat Ghar Logo" className="w-10 h-10 object-contain rounded-[3px]" />
    </div>
  );
};

export const MeatGharLogo: React.FC<MeatGharLogoProps> = ({
  variant,
  size = 'md',
  showTagline = false,
}) => {
  const isWhite = variant === 'white' || size === 'splash';
  const iconSizes: Record<'xs' | 'sm' | 'md' | 'lg' | 'splash', string> = {
    xs: 'w-10 h-10',
    sm: 'w-16 h-16',
    md: 'w-32 h-32',
    lg: 'w-40 h-40',
    splash: 'w-52 h-52',
  };

  const activeSize = iconSizes[size === 'header' || size === 'xs' ? 'xs' : size === 'sm' ? 'sm' : size === 'md' ? 'md' : size === 'lg' ? 'lg' : size === 'splash' ? 'splash' : 'md'];
  const radius = size === 'splash' ? 'rounded-[6px]' : 'rounded-[3px]';

  return (
    <div className="flex flex-col items-center text-center select-none">
      <img src="/images/APP LOGO NEW.png" alt="Meat Ghar Logo" className={`${activeSize} object-contain ${radius}`} />
      
      {showTagline && (
        <p className={`mt-3 tracking-widest text-xs font-black uppercase ${isWhite ? 'text-white drop-shadow-md bg-black/15 px-3 py-1 rounded-full border border-white/20' : 'text-[#BA181B]'}`}>
          Fresh Meat • Fast Delivery
        </p>
      )}
    </div>
  );
};
