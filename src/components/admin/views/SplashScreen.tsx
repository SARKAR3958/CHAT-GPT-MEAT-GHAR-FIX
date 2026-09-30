import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { useAdmin } from '../AdminContext';

export const SplashScreen: React.FC = () => {
  const { navigateAdminScreen, isLoggedIn } = useAdmin();

  return (
    <div className="relative w-full h-full bg-[#0E1015] text-white flex flex-col justify-between items-center p-6 overflow-hidden select-none">
      {/* Background glowing organic gradient waves matching Screen 1 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-red-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-20 w-80 h-80 bg-red-800/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 inset-x-0 h-80 bg-gradient-to-t from-red-600/30 via-red-900/10 to-transparent blur-2xl" />
        {/* Stylized geometric curve lines */}
        <svg className="absolute bottom-0 inset-x-0 w-full opacity-35" viewBox="0 0 375 220" fill="none">
          <path
            d="M-50 180 C 100 80, 250 250, 420 120 L 420 300 L -50 300 Z"
            fill="url(#redGrad1)"
          />
          <path
            d="M-30 210 C 120 120, 230 240, 420 160 L 420 300 L -30 300 Z"
            fill="url(#redGrad2)"
          />
          <defs>
            <linearGradient id="redGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E53935" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#8E0000" stopOpacity="0.9" />
            </linearGradient>
            <linearGradient id="redGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF5252" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#D32F2F" stopOpacity="0.8" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Center Branding Area */}
      <div className="flex flex-col items-center text-center z-10 my-auto">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative mb-6"
        >
          {/* Logo container - Clean fit without extra dark border/inner background mismatch */}
          <div className="w-24 h-24 rounded-3xl bg-white/95 p-2 shadow-2xl shadow-red-600/30 flex items-center justify-center border-2 border-red-500/80 overflow-hidden">
            <img
              src="/images/APP LOGO NEW.png"
              alt="Meat Ghar Logo"
              className="w-full h-full object-contain rounded-2xl"
            />
          </div>
        </motion.div>

        <motion.h1
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-1.5"
        >
          Meat Ghar
        </motion.h1>

        <motion.p
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-base font-semibold text-red-500 tracking-wider uppercase mt-0.5"
        >
          Admin Panel
        </motion.p>

        <motion.p
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-xs text-slate-400 font-medium tracking-wide mt-5"
        >
          Manage • Control • Grow
        </motion.p>
      </div>

      {/* Bottom Action Button */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="w-full z-10 space-y-3 pb-4"
      >
        <button
          onClick={() => navigateAdminScreen(isLoggedIn ? 'dashboard' : 'login')}
          className="w-full py-3.5 bg-gradient-to-r from-red-600 to-[#BA181B] hover:from-red-500 hover:to-red-700 active:scale-[0.98] text-white font-bold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-red-950/60 transition-all cursor-pointer"
        >
          <span>{isLoggedIn ? 'Go to Dashboard' : 'Continue to Login'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-red-500" />
          <span>Authorized Staff Access Only</span>
        </div>
      </motion.div>
    </div>
  );
};
