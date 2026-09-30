import {supabase} from '../../lib/supabase';
import React, { useState } from 'react';
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  ShieldAlert,
  Save,
  X,
  Smartphone,
  Info,
} from 'lucide-react';
import { HeaderMeatGharLogo } from '../MeatGharLogo';

interface EditProfileScreenProps {
  userName: string;
  userPhone: string;
  userEmail?: string;
  authMethod: 'manual' | 'google';
  onBack: () => void;
  onSaveProfile: (updatedData: { fullName: string; phone: string; email: string }) => Promise<boolean>;
}

export const EditProfileScreen: React.FC<EditProfileScreenProps> = ({
  userName,
  userPhone,
  userEmail = '',
  authMethod,
  onBack,
  onSaveProfile,
}) => {
  const [fullName, setFullName] = useState(userName || '');
  const [phone, setPhone] = useState(userPhone || '');
  const [email] = useState(userEmail);

  // Password fields for manual auth
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  // Status & modal states
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showPhonePopup, setShowPhonePopup] = useState(false);
  const [tempPhone, setTempPhone] = useState(phone);
  const [phoneVerified, setPhoneVerified] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    if (authMethod === 'manual' && (newPassword || currentPassword)) {
      if (!currentPassword) {
        setErrorMsg('Please enter your current password.');
        return;
      }
      if (newPassword.length < 8) {
        setErrorMsg('New password must be at least 8 characters.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setErrorMsg('New password and confirm password do not match.');
        return;
      }
    }

    setErrorMsg('');
    if(authMethod==='manual' && newPassword) {
      const {error:loginError}=await supabase.auth.signInWithPassword({email,password:currentPassword});
      if(loginError){setErrorMsg('Current password is incorrect.');return;}
      const {error}=await supabase.auth.updateUser({password:newPassword});if(error){setErrorMsg(error.message);return;}
    }
    if(await onSaveProfile({fullName:fullName.trim(),phone:phone.replace(/\s/g,''),email})) setSaveSuccessMsg(true);
  };

  const handleSavePhoneFromPopup = () => {
    if (tempPhone.trim().length < 10) {
      setErrorMsg('Please enter a valid 10-digit phone number.');
      return;
    }
    setPhone(tempPhone);
    setPhoneVerified(true);
    setShowPhonePopup(false);
    setErrorMsg('');
  };

  return (
    <div className="w-full h-full min-h-0 bg-slate-50 text-slate-800 flex flex-col justify-between relative overflow-hidden select-none font-sans">
      {/* Header */}
      <div className="bg-white px-4 pt-3 pb-3 border-b border-slate-200 shadow-2xs z-20 shrink-0">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <button
              onClick={onBack}
              className="p-1.5 rounded-full hover:bg-slate-100 text-[#BA181B] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
            </button>
            <h2 className="text-lg font-extrabold text-slate-900">Edit Profile</h2>
          </div>

          <HeaderMeatGharLogo />
        </div>
        <p className="text-xs text-slate-500 font-normal">
          Update your personal details for order delivery and updates.
        </p>
      </div>

      {/* Main Form Content */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-4 no-scrollbar pb-20">
        {/* Success Alert Banner */}
        {saveSuccessMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-3 flex items-center gap-2.5 text-xs font-bold animate-in fade-in duration-200">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Profile changes saved successfully! Redirecting...</span>
          </div>
        )}

        {/* Error Banner */}
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-[#BA181B] rounded-2xl p-3 flex items-center gap-2.5 text-xs font-bold animate-in fade-in duration-200">
            <ShieldAlert className="w-5 h-5 text-[#BA181B] shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Avatar & Auth Badge Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex items-center gap-3.5">
          <div className="relative">
            <div className="w-14 h-14 rounded-full bg-[#1e293b] text-white font-black flex items-center justify-center text-xl shadow-md border-2 border-white">
              {fullName ? fullName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#BA181B] text-white rounded-full flex items-center justify-center border-2 border-white text-[9px] font-bold">
              ✓
            </div>
          </div>

          <div>
            <h3 className="text-sm font-extrabold text-slate-900">{fullName}</h3>
            <div className="flex items-center gap-1.5 mt-1">
              <span
                className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  authMethod === 'google'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}
              >
                {authMethod === 'google' ? 'Google Account' : 'Email Account'}
              </span>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <form
          onSubmit={handleSave}
          className="space-y-3.5"
          autoComplete="off"
          noValidate
          data-form-type="other"
        >
          {/* Full Name Input */}
          <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-2xs space-y-1">
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-[#BA181B]" />
              <span>Full Name</span>
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="prof_fullname_no_autofill"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
              data-lpignore="true"
              data-1p-ignore="true"
              data-form-type="other"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full text-xs font-bold text-slate-900 bg-transparent outline-none py-1 border-b border-slate-200 focus:border-[#BA181B] transition-all"
            />
          </div>

          {/* Phone Number (Locked for Security) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-2xs space-y-1.5 relative">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-[#BA181B]" />
                <span>Phone Number</span>
              </label>
              <div className="flex items-center gap-1 text-[9px] font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                <Lock className="w-2.5 h-2.5 text-amber-600" />
                <span>Locked for Security</span>
              </div>
            </div>

            <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
              <span className="text-xs font-bold text-slate-700 font-mono">
                +91 {phone}
              </span>

              {authMethod === 'google' ? (
                <button
                  type="button"
                  onClick={() => {
                    setTempPhone(phone);
                    setShowPhonePopup(true);
                  }}
                  className="text-[10px] font-extrabold text-[#BA181B] bg-red-50 hover:bg-red-100 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  Verify / Update
                </button>
              ) : (
                <Lock className="w-3.5 h-3.5 text-slate-400" />
              )}
            </div>

            <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
              Phone number cannot be directly changed to protect your order history and delivery verification.
            </p>

            {phoneVerified && (
              <span className="text-[10px] text-emerald-600 font-extrabold flex items-center gap-1 mt-1">
                <CheckCircle2 className="w-3 h-3" /> Phone updated locally. Save your profile to persist it.
              </span>
            )}
          </div>

          {/* Email Address (Locked) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-2xs space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-[#BA181B]" />
                <span>Email Address</span>
              </label>
              <div className="flex items-center gap-1 text-[9px] font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                <Lock className="w-2.5 h-2.5 text-amber-600" />
                <span>Locked</span>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">{email}</span>
              <Lock className="w-3.5 h-3.5 text-slate-400" />
            </div>

            <p className="text-[10px] text-slate-400 font-medium">
              Primary email address used for receipts and account notifications.
            </p>
          </div>

          {/* PASSWORD CHANGE SECTION (Conditional based on authMethod) */}
          {authMethod === 'manual' ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-2xs space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <Lock className="w-4 h-4 text-[#BA181B]" />
                <h4 className="text-xs font-extrabold text-slate-900">Change Password</h4>
              </div>

              {/* Current Password */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500">Current Password</label>
                <div className="relative flex items-center border border-slate-200 rounded-xl px-3 py-1.5 focus-within:border-[#BA181B] bg-slate-50 focus-within:bg-white transition-all">
                  <input
                    type={showCurrentPass ? 'text' : 'password'}
                    name="current_pass_no_autofill"
                    autoComplete="new-password"
                    autoCorrect="off"
                    autoCapitalize="none"
                    spellCheck={false}
                    data-lpignore="true"
                    data-1p-ignore="true"
                    data-form-type="other"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full text-xs font-bold text-slate-800 bg-transparent outline-none pr-6"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showCurrentPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500">New Password</label>
                <div className="relative flex items-center border border-slate-200 rounded-xl px-3 py-1.5 focus-within:border-[#BA181B] bg-slate-50 focus-within:bg-white transition-all">
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    name="new_pass_no_autofill"
                    autoComplete="new-password"
                    autoCorrect="off"
                    autoCapitalize="none"
                    spellCheck={false}
                    data-lpignore="true"
                    data-1p-ignore="true"
                    data-form-type="other"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full text-xs font-bold text-slate-800 bg-transparent outline-none pr-6"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showNewPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500">Confirm New Password</label>
                <div className="flex items-center border border-slate-200 rounded-xl px-3 py-1.5 focus-within:border-[#BA181B] bg-slate-50 focus-within:bg-white transition-all">
                  <input
                    type="password"
                    name="confirm_pass_no_autofill"
                    autoComplete="new-password"
                    autoCorrect="off"
                    autoCapitalize="none"
                    spellCheck={false}
                    data-lpignore="true"
                    data-1p-ignore="true"
                    data-form-type="other"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full text-xs font-bold text-slate-800 bg-transparent outline-none"
                  />
                </div>
              </div>
            </div>
          ) : (
            /* Google Login Notice (No Password Field) */
            <div className="bg-blue-50/80 border border-blue-200/80 rounded-2xl p-3.5 flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-white text-blue-600 border border-blue-200 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                G
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-extrabold text-blue-900">Signed in via Google</h4>
                <p className="text-[10px] text-blue-700 leading-relaxed font-medium">
                  Your password is securely managed by your Google Account. You do not need a separate password for Meat Ghar.
                </p>
              </div>
            </div>
          )}

          {/* Submit Save Button */}
          <button
            type="submit"
            className="w-full py-3 bg-[#BA181B] hover:bg-red-800 text-white font-extrabold text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
          >
            <Save className="w-4 h-4" />
            <span>Save Profile Changes</span>
          </button>
        </form>
      </div>

      {/* GOOGLE LOGIN PHONE VERIFICATION POPUP MODAL */}
      {showPhonePopup && (
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-2xl p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-[#BA181B]" />
                <h3 className="text-sm font-extrabold text-slate-900">Update Phone Number</h3>
              </div>
              <button
                onClick={() => setShowPhonePopup(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-red-50 border border-red-100 p-2.5 rounded-xl flex items-start gap-2 text-xs text-[#BA181B]">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="text-[11px] font-medium leading-relaxed">
                Please enter your correct phone number. The store can use this number to contact you about delivery.
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-extrabold uppercase text-slate-500">
                10-Digit Mobile Number
              </label>
              <div className="flex items-center border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus-within:bg-white focus-within:border-[#BA181B] transition-all">
                <span className="text-xs font-extrabold text-slate-500 pr-2 border-r border-slate-300 mr-2">
                  +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  value={tempPhone}
                  onChange={(e) => setTempPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 10-digit number"
                  className="w-full text-xs font-bold text-slate-800 bg-transparent outline-none font-mono"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setShowPhonePopup(false)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePhoneFromPopup}
                disabled={tempPhone.length < 10}
                className={`flex-1 py-2 text-white font-extrabold text-xs rounded-xl transition-colors cursor-pointer ${
                  tempPhone.length >= 10
                    ? 'bg-[#BA181B] hover:bg-red-800 shadow-xs'
                    : 'bg-slate-300 cursor-not-allowed'
                }`}
              >
                Save Phone
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
