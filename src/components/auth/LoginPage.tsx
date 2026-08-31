import React, { useState } from 'react';
import { User, Lock, ArrowLeft, AlertCircle, QrCode } from 'lucide-react';
import { GymSettings, Member } from '../../types';
import { GymLogo } from '../common/GymLogo';
import { storage, normalizePhoneNumber, normalizeDigits } from '../../services/storage';

interface LoginPageProps {
  settings: GymSettings;
  onLoginSuccess: (role: 'admin' | 'member', member?: Member, rememberMe?: boolean) => void;
  onOpenReceptionQR: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  settings,
  onLoginSuccess,
  onOpenReceptionQR,
}) => {
  const [usernameOrPhone, setUsernameOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    setTimeout(() => {
      const rawInput = usernameOrPhone.trim();
      const inputLower = rawInput.toLowerCase();
      const cleanPhoneInput = normalizePhoneNumber(rawInput);
      const cleanPass = normalizeDigits(password).trim();

      // 1. Check if admin credentials
      const adminPass = storage.getAdminPassword().trim();
      const isAdminUsername =
        inputLower === 'admin' ||
        inputLower === 'الادمن' ||
        inputLower === 'مدير' ||
        inputLower === 'الإدارة' ||
        inputLower === 'ادمن';

      if (isAdminUsername && (cleanPass === adminPass || password.trim() === adminPass)) {
        onLoginSuccess('admin', undefined, rememberMe);
        setIsLoading(false);
        return;
      }

      // 2. Check if member credentials (by phone number OR name)
      const members = storage.getMembers();
      const foundMember = members.find((m) => {
        const memberCleanPhone = normalizePhoneNumber(m.phone);
        const memberPass = normalizeDigits(m.password || m.phone).trim();

        const phoneMatches =
          (cleanPhoneInput && memberCleanPhone === cleanPhoneInput) ||
          m.phone.trim() === rawInput ||
          m.name.trim().toLowerCase() === rawInput.toLowerCase();

        const passMatches =
          cleanPass === memberPass ||
          password.trim() === (m.password || '').trim() ||
          cleanPass === memberCleanPhone;

        return phoneMatches && passMatches;
      });

      if (foundMember) {
        onLoginSuccess('member', foundMember, rememberMe);
        setIsLoading(false);
        return;
      }

      // 3. Detailed error check if credentials didn't match
      if (isAdminUsername && cleanPass !== adminPass) {
        setErrorMessage('كلمة المرور الخاصة بحساب الإدارة غير صحيحة.');
      } else {
        const phoneExists = members.find((m) => {
          const memberCleanPhone = normalizePhoneNumber(m.phone);
          return (
            (cleanPhoneInput && memberCleanPhone === cleanPhoneInput) ||
            m.phone.trim() === rawInput ||
            m.name.trim().toLowerCase() === rawInput.toLowerCase()
          );
        });

        if (phoneExists) {
          setErrorMessage(
            `كلمة المرور غير صحيحة للمشترك (${phoneExists.name}). كلمة المرور الافتراضية هي رقم هاتفه: ${phoneExists.phone}`
          );
        } else {
          setErrorMessage('بيانات الدخول غير صحيحة. يرجى التأكد من رقم الهاتف أو اسم المستخدم وكلمة المرور.');
        }
      }

      setIsLoading(false);
    }, 150);
  };

  return (
    <div id="login-container" className="min-h-screen bg-[#0A0A0A] text-white flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Bold typographic background watermark */}
      <div className="absolute -top-12 -right-12 text-[160px] sm:text-[220px] font-black text-white/[0.02] italic select-none pointer-events-none uppercase tracking-tighter">
        TITAN
      </div>
      <div className="absolute -bottom-16 -left-12 text-[160px] sm:text-[220px] font-black text-lime-400/[0.02] italic select-none pointer-events-none uppercase tracking-tighter">
        GYM
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* Gym Branding Header */}
        <div className="flex flex-col items-center justify-center text-center mb-8">
          <div className="mb-4 transform hover:scale-105 transition-transform duration-300">
            <GymLogo settings={settings} size="xl" showText={false} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white uppercase italic tracking-tighter">
            {settings.name}
          </h1>
          {settings.tagline && (
            <p className="mt-1 text-xs text-lime-400 font-black uppercase tracking-widest">
              {settings.tagline}
            </p>
          )}
        </div>

        {/* Login Card */}
        <div className="bg-[#121212] border border-white/10 shadow-2xl rounded-3xl p-6 sm:p-8 relative overflow-hidden">
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {errorMessage && (
              <div
                id="login-error-alert"
                className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-2.5 leading-relaxed"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                <span className="font-bold">{errorMessage}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-zinc-300 mb-1.5">
                اسم المستخدم أو رقم الهاتف
              </label>
              <div className="relative">
                <input
                  id="input-username-or-phone"
                  type="text"
                  required
                  value={usernameOrPhone}
                  onChange={(e) => setUsernameOrPhone(e.target.value)}
                  placeholder="اسم المستخدم أو رقم الهاتف"
                  className="w-full bg-zinc-900 border border-white/10 focus:border-lime-400 focus:ring-1 focus:ring-lime-400 rounded-xl px-4 py-3 text-white placeholder-zinc-600 text-sm font-bold transition-colors pl-10"
                />
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <User className="w-4 h-4" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-zinc-300 mb-1.5">
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  id="input-login-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-zinc-900 border border-white/10 focus:border-lime-400 focus:ring-1 focus:ring-lime-400 rounded-xl px-4 py-3 text-white placeholder-zinc-600 text-sm font-bold transition-colors pl-10"
                />
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <Lock className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Remember Me on this device Checkbox */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  id="checkbox-remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-lime-400 focus:ring-lime-400 cursor-pointer accent-lime-400"
                />
                <span className="text-xs font-bold text-zinc-300">
                  حفظ تسجيل الدخول لهذا الجهاز
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              id="btn-submit-login"
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 bg-lime-400 hover:bg-lime-300 text-black font-black uppercase tracking-wider py-3.5 px-4 rounded-xl text-xs sm:text-sm transition-all shadow-lg shadow-lime-400/20 active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <span>جاري تسجيل الدخول...</span>
              ) : (
                <>
                  <span>دخول إلى الحساب</span>
                  <ArrowLeft className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Universal Reception QR Quick Launcher */}
        <div className="mt-6 text-center">
          <button
            id="login-reception-qr-launch"
            type="button"
            onClick={onOpenReceptionQR}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-black uppercase tracking-wider border border-white/10 hover:border-lime-400 transition-all shadow-lg"
          >
            <QrCode className="w-4 h-4 text-lime-400" />
            <span>عرض كيو ار الدخول لشاشة استقبال الجيم</span>
          </button>
        </div>
      </div>
    </div>
  );
};
