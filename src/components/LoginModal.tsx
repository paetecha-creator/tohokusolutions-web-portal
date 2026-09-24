/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useApp } from '../context/AppContext';
import { TohokuLogo } from './TohokuLogo';
import { 
  X, 
  Lock, 
  User, 
  AlertCircle, 
  ShieldCheck, 
  ArrowRight,
  Eye,
  EyeOff
} from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { login, setSessionExpiryMinutes, sessionExpiryMinutes } = useAuth();
  const { users } = useData();
  const { t, language } = useApp();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [rememberDuration, setRememberDuration] = useState<number>(sessionExpiryMinutes);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // Real-time matched user hint (department/role info)
  const matchedUser = username.trim()
    ? users.find(u => 
        u.username.toLowerCase() === username.trim().toLowerCase() ||
        (u.email && u.email.toLowerCase() === username.trim().toLowerCase())
      )
    : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!username.trim()) {
      setErrorMessage(language === 'th' ? 'กรุณาระบุชื่อผู้ใช้งาน (Username) หรืออีเมล' : 'Please enter your username or email');
      return;
    }

    if (!password.trim()) {
      setErrorMessage(language === 'th' ? 'กรุณาระบุรหัสผ่าน (Password)' : 'Please enter your password');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setSessionExpiryMinutes(rememberDuration);
      const res = login(username, password);
      setLoading(false);

      if (res.success) {
        onClose();
        if (onSuccess) onSuccess();
      } else {
        setErrorMessage(res.message);
      }
    }, 200);
  };

  const getRoleBadgeStyle = (role: string) => {
    return role === 'admin'
      ? 'bg-red-50 text-red-700 border-red-200'
      : 'bg-blue-50 text-[#0060AA] border-blue-200';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div 
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header with Close */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <TohokuLogo size="sm" showText={false} />
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {t('login.title')}
              </h2>
              <p className="text-[11px] text-slate-500">
                {t('login.subtitle')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 sm:p-6 space-y-4">
          {/* Info Notice */}
          <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200/80 text-xs text-blue-950 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#0060AA] shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold">ระบบตรวจสอบสิทธิ์เข้าถึงตาม In-charge:</span> ระบบจะแสดงเฉพาะเว็บแอปที่ตรงกับสิทธิ์ In-charge ของบัญชีผู้ใช้งานที่ล็อกอิน
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Secure Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                {t('login.username_label')}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={username}
                  onChange={e => {
                    setUsername(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder={t('login.username_placeholder')}
                  autoComplete="username"
                  autoFocus
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0060AA]/20 focus:border-[#0060AA] transition-all"
                />
              </div>

              {matchedUser && (
                <div className="text-[11px] text-slate-600 flex items-center gap-1.5 pt-0.5">
                  <span>ผู้ใช้: <strong className="text-slate-900">{matchedUser.name}</strong></span>
                  <span>•</span>
                  <span>แผนก: {matchedUser.department}</span>
                  <span>•</span>
                  <span className={`px-1.5 py-0.2 rounded border text-[10px] font-bold uppercase ${getRoleBadgeStyle(matchedUser.role)}`}>
                    {matchedUser.role}
                  </span>
                </div>
              )}
            </div>

            {/* Password field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                {t('login.password_label', 'รหัสผ่าน (Password)')}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder={t('login.password_placeholder', 'กรอกรหัสผ่านของคุณ')}
                  autoComplete="current-password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0060AA]/20 focus:border-[#0060AA] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Helpful Hint & Autofill */}
              <div className="mt-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span>
                    🔑 <strong>สำหรับ Admin:</strong> รหัสผ่านคือ <code className="bg-white px-1.5 py-0.5 rounded border border-slate-300 font-bold text-[#0060AA]">admin</code> หรือ <code className="bg-white px-1.5 py-0.5 rounded border border-slate-300 font-bold text-slate-700">122333</code>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setUsername('admin');
                      setPassword('admin');
                      if (errorMessage) setErrorMessage(null);
                    }}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-[#0060AA] text-white font-semibold hover:bg-[#004f8c] transition-colors cursor-pointer shrink-0"
                  >
                    เติมรหัส Admin
                  </button>
                </div>
                <div className="text-[10px] text-slate-400 pt-0.5 border-t border-slate-200/60">
                  พนักงานทั่วไป: ระบุรหัสพนักงาน (เช่น <code className="text-slate-600">15046</code>) / รหัสผ่าน: <code className="text-slate-600">122333</code>
                </div>
              </div>
            </div>

            {/* Remember Session Option */}
            <div className="flex items-center justify-between text-xs text-slate-600 pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberDuration > 0}
                  onChange={e => setRememberDuration(e.target.checked ? 480 : 60)}
                  className="rounded text-[#0060AA] focus:ring-[#0060AA]"
                />
                <span>จดจำการเข้าใช้งานชั่วคราว</span>
              </label>
              <span className="text-[11px] text-slate-400">
                {rememberDuration >= 480 ? '8 ชั่วโมง' : '1 ชั่วโมง'}
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-[#0060AA] hover:bg-[#004f8c] shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span>กำลังตรวจสอบความถูกต้อง...</span>
              ) : (
                <>
                  <span>{t('login.submit_btn')}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
