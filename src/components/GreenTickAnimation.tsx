import React from 'react';
import { motion } from 'motion/react';
import { Check } from 'lucide-react';

interface GreenTickAnimationProps {
  className?: string;
  size?: number;
  loop?: boolean;
}

export const GreenTickAnimation: React.FC<GreenTickAnimationProps> = ({
  className = '',
  size = 120,
}) => {
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative flex items-center justify-center pointer-events-none select-none ${className}`}
    >
      {/* Expanding Ripple Ring 1 */}
      <motion.div
        initial={{ scale: 0.6, opacity: 0.8 }}
        animate={{ scale: [0.7, 1.4, 1.5], opacity: [0.7, 0.2, 0] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
        className="absolute inset-0 rounded-full bg-emerald-400"
      />

      {/* Expanding Ripple Ring 2 */}
      <motion.div
        initial={{ scale: 0.4, opacity: 0.9 }}
        animate={{ scale: [0.5, 1.2, 1.3], opacity: [0.8, 0.3, 0] }}
        transition={{ duration: 1.6, delay: 0.4, repeat: Infinity, ease: 'easeOut' }}
        className="absolute inset-0 rounded-full bg-emerald-500"
      />

      {/* Main Solid Circle */}
      <motion.div
        initial={{ scale: 0, rotate: -30 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{
          type: 'spring',
          damping: 14,
          stiffness: 220,
          mass: 0.8,
        }}
        className="w-4/5 h-4/5 rounded-full bg-gradient-to-tr from-emerald-600 to-emerald-400 shadow-xl shadow-emerald-600/40 flex items-center justify-center text-white border-2 border-emerald-200/60 z-10"
      >
        {/* Animated Checkmark */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            delay: 0.18,
            type: 'spring',
            damping: 12,
            stiffness: 240,
          }}
          className="flex items-center justify-center"
        >
          <Check
            className="text-white drop-shadow-md stroke-[4]"
            style={{ width: size * 0.45, height: size * 0.45 }}
          />
        </motion.div>
      </motion.div>
    </div>
  );
};
