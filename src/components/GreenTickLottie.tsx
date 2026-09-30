import React from 'react';
import { motion } from 'motion/react';
import { Check } from 'lucide-react';

interface GreenTickLottieProps {
  className?: string;
  size?: number;
  loop?: boolean;
}

export const GreenTickLottie: React.FC<GreenTickLottieProps> = ({
  className = 'w-16 h-16',
  size = 64,
  loop = true,
}) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      {/* Outer Pulse Ring */}
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: [0.8, 1.2, 1], opacity: [0.4, 0.2, 0] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut' }}
        className="absolute inset-0 rounded-full bg-emerald-500"
      />
      {/* Circle Background */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 15, stiffness: 260 }}
        className="w-full h-full rounded-full bg-emerald-500 shadow-md shadow-emerald-500/30 flex items-center justify-center text-white"
      >
        {/* Animated Check */}
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.15, type: 'spring', damping: 12, stiffness: 200 }}
        >
          <Check className="w-1/2 h-1/2 stroke-[3.5]" style={{ width: size * 0.55, height: size * 0.55 }} />
        </motion.div>
      </motion.div>
    </div>
  );
};
