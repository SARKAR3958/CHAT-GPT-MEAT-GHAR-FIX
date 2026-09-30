import {supabase} from '../../../lib/supabase';
import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useAdmin } from '../AdminContext';

export const LoginScreen: React.FC = () => {
  const { loginAdmin } = useAdmin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [busy,setBusy]=useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please fill in both email and password.');
      return;
    }
    if(busy)return;setBusy(true);
    setError('');
    if (!(await loginAdmin(email, password))) setError('Sign-in failed. Check your credentials and administrator access.');
    setBusy(false);
  };

  return (
    <div className="w-full h-full bg-white text-slate-800 flex flex-col justify-between p-6 overflow-y-auto no-scrollbar font-sans select-none">
      {/* Top Section / Logo branding */}
      <div className="flex flex-col items-center text-center pt-8">
        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center p-2 mb-3 shadow-xs">
          <img
            src="/images/APP LOGO NEW.png"
            alt="Meat Ghar Logo"
            className="w-12 h-12 object-contain"
          />
        </div>

        <h1 className="text-xl font-black text-slate-900 tracking-tight">Meat Ghar</h1>
        <p className="text-xs font-bold text-red-600 tracking-wide uppercase">Admin Panel</p>
      </div>

      {/* Center Section: Form */}
      <div className="w-full max-w-sm mx-auto my-auto py-6">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome Back</h2>
          <p className="text-xs text-slate-500 font-medium mt-1">Login to your admin account</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email / Username */}
          <div className="relative">
            <label className="sr-only">Email or Username</label>
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email or Username"
              className="w-full pl-10 pr-4 py-3 bg-slate-50/80 border border-slate-200 rounded-2xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 transition-all"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <label className="sr-only">Password</label>
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full pl-10 pr-11 py-3 bg-slate-50/80 border border-slate-200 rounded-2xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between text-xs pt-1">
            <button
              type="button"
              onClick={async () => {
                if(!email.trim()){setError('Enter your administrator email first.');return;}
                const {error}=await supabase.auth.resetPasswordForEmail(email.trim(),{redirectTo:window.location.origin+'/#reset-password'});
                setError(error ? error.message : 'If an account exists for that email, check its inbox for reset instructions.');
              }}
              className="text-red-600 font-semibold hover:underline cursor-pointer"
            >
              Forgot password?
            </button>
          </div>

          {/* Login Button */}
          <button
            type="submit" disabled={busy}
            className="w-full mt-3 py-3.5 bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white font-bold text-sm rounded-2xl shadow-lg shadow-red-600/20 transition-all cursor-pointer"
          >
            Login
          </button>
        </form>
      </div>

      {/* Bottom Footer */}
      <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 pb-2">
        <ShieldCheck className="w-4 h-4 text-slate-400" />
        <span>Secure Admin Access</span>
      </div>
    </div>
  );
};
