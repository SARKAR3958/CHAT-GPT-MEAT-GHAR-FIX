import React, { useState } from 'react';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { MeatGharLogo } from '../MeatGharLogo';
import { AppImage } from '../common/AppImage';
import { supabase } from '../../lib/supabase';

interface LoginScreenProps {
  phoneNumber: string;
  setPhoneNumber: (num: string) => void;
  onLoginSubmit: (phone: string, pass: string) => Promise<void>;
  onGoogleLogin: (email?: string, name?: string) => void;
  onGoToSignUp: () => void;
  onOpenAdmin?: () => void;
}

export const SignupScreen: React.FC<LoginScreenProps> = ({
  phoneNumber,
  setPhoneNumber,
  onLoginSubmit,
  onGoogleLogin,
  onGoToSignUp,
  onOpenAdmin,
}) => {
  const [busy,setBusy]=useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Forgot Password modal states
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotPhone, setForgotPhone] = useState('');
  const [isForgotSending, setIsForgotSending] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(phoneNumber.trim())) {
      setErrorMsg('Please enter a valid email address');
      return;
    }
    if (!password) {
      setErrorMsg('Please enter your password');
      return;
    }
    setErrorMsg('');
    if(busy)return;setBusy(true);try{await onLoginSubmit(phoneNumber,password);}finally{setBusy(false);}
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = forgotPhone.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setForgotError('Enter your registered email address'); return; }
    setIsForgotSending(true); setForgotError('');
    try { const {error} = await supabase.auth.resetPasswordForEmail(email,{redirectTo:window.location.origin+'/#reset-password'}); if(error) throw error; setForgotSuccess(true); }
    catch(error:any) {setForgotError(error.message);} finally {setIsForgotSending(false);}
  };

  return (
    <div className="w-full h-full bg-white text-slate-800 flex flex-col justify-between relative overflow-y-auto no-scrollbar select-none">
      {/* Main Form Area */}
      <div className="px-6 pt-6 pb-2 z-10 flex-1 flex flex-col justify-start">
        {/* Logo */}
        <div className="mb-3 flex justify-center">
          <MeatGharLogo variant="red" size="md" showTagline={true} />
        </div>

        {/* Headings */}
        <div className="text-left mt-1 mb-4">
          <h2
            className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight mb-1"
            style={{ fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif" }}
          >
            Welcome Back to <br />
            <span className="text-[#A8071A]">Meat Ghar</span>
          </h2>
          <p className="text-xs text-slate-500 font-normal leading-relaxed">
            Enter your email address and password to login.
          </p>
        </div>

        {/* Login Form */}
        <form
          onSubmit={handleLogin}
          className="space-y-3"
          autoComplete="off"
          noValidate
          data-form-type="other"
        >
          {/* Phone Input Box with India flag (rounded-8px) */}
          <div className="relative">
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative flex items-center">
              <input
                type="email"
                name="user_phone_no_autofill"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                data-lpignore="true"
                data-1p-ignore="true"
                data-form-type="other"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter your email address"
                className="w-full pl-4 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 outline-none focus:border-[#A8071A] focus:ring-1 focus:ring-[#A8071A] transition-all shadow-2xs"
              />
            </div>
          </div>

          {/* Password Input Box */}
          <div className="relative">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">
                Password <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  setForgotSuccess(false);
                  setForgotError('');
                  setForgotPhone(phoneNumber);
                  setShowForgotModal(true);
                }}
                className="text-[11px] font-bold text-[#A8071A] hover:underline"
              >
                Forgot?
              </button>
            </div>
            <div className="relative flex items-center">
              <input
                type={showPassword ? 'text' : 'password'}
                name="user_password_no_autofill"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                data-lpignore="true"
                data-1p-ignore="true"
                data-form-type="other"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full pl-3.5 pr-10 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 outline-none focus:border-[#A8071A] focus:ring-1 focus:ring-[#A8071A] transition-all shadow-2xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {errorMsg && <p className="text-xs text-red-600 font-semibold">{errorMsg}</p>}

          {/* Primary Action Button (Brand Red, rounded-12px) */}
          <button
            type="submit" disabled={busy}
            className="w-full py-3 px-4 bg-[#A8071A] hover:bg-[#8C0818] active:bg-[#720412] text-white font-extrabold text-sm rounded-xl shadow-md shadow-red-950/20 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <span>LOGIN</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </form>

        {/* Don't have an account? Sign Up Link */}
        <p className="text-center text-xs text-slate-500 mt-4 font-medium">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={onGoToSignUp}
            className="text-[#A8071A] font-extrabold hover:underline cursor-pointer ml-0.5"
          >
            Sign Up
          </button>
        </p>
      </div>

      {/* Pinned Bottom BG Platter Graphic Banner with Smooth Top Blend */}
      <div className="w-full h-36 relative mt-auto overflow-hidden shrink-0">
        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white via-white/80 to-transparent z-10 pointer-events-none" />
        <AppImage
          src="/images/bg_1790503776302.jpg"
          alt="Meat Ghar BG"
          className="w-full h-full object-cover object-center"
        />
      </div>

      {/* FORGOT PASSWORD NATIVE MODAL */}
      {showForgotModal && (
        <div className="absolute inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 shadow-2xl relative max-w-sm w-full border border-slate-100 animate-scale-in">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="text-left">
                <h3 className="text-lg font-bold text-slate-900">Forgot Password</h3>
                <p className="text-xs text-slate-500">We will send a reset link to your registered email address</p>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                disabled={isForgotSending}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1 rounded-full hover:bg-slate-50"
              >
                ✕
              </button>
            </div>

            {forgotSuccess ? (
              /* Success View */
              <div className="text-center py-6 space-y-4">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold animate-bounce">
                  ✓
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-extrabold text-slate-900">Reset Link Sent!</p>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Success! We found your email address and sent a secure password reset link to your registered email. 
                    Please check your inbox or spam folder.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="w-full py-2.5 bg-[#A8071A] text-white font-extrabold text-xs rounded-xl shadow-md"
                >
                  OK, Got It
                </button>
              </div>
            ) : (
              /* Form View */
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="relative text-left">
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Registered Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-3 flex items-center gap-1 text-slate-700 font-semibold text-xs pointer-events-none z-10">
                      <img src="/images/INDIA.png" alt="India" className="w-5 h-5 object-contain" />
                      <span>+91</span>
                      <span className="text-slate-300 ml-1">|</span>
                    </div>
                    <input
                      type="email"
                      required
                      value={forgotPhone}
                      onChange={(e) => setForgotPhone(e.target.value)}
                      placeholder="Enter your registered email"
                      className="w-full pl-4 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-[#A8071A] transition-all"
                    />
                  </div>
                </div>

                {forgotError && (
                  <p className="text-xs text-red-600 font-semibold text-left">{forgotError}</p>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    disabled={isForgotSending}
                    className="flex-1 py-2.5 border border-slate-200 text-slate-600 font-bold text-xs rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isForgotSending}
                    className="flex-1 py-2.5 bg-[#A8071A] text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5"
                  >
                    {isForgotSending ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Finding...</span>
                      </>
                    ) : (
                      <span>Reset Password</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
