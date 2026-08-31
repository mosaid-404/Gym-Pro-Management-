import React, { useState, useRef } from 'react';
import { X, Camera, Upload, Trash2, KeyRound, User, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Member } from '../../types';
import { storage } from '../../services/storage';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member;
  onUpdateSuccess: () => void;
}

export const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  isOpen,
  onClose,
  member,
  onUpdateSuccess,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Password state
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen || !member) return null;

  // Handle Photo Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'حجم الصورة كبير، يرجى اختيار صورة أقل من 2 ميجابايت.' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const base64 = event.target.result as string;
        storage.updateMember(member.id, { photoUrl: base64 });
        setMessage({ type: 'success', text: 'تم تحديث الصورة الشخصية بنجاح!' });
        onUpdateSuccess();
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Remove Photo
  const handleRemovePhoto = () => {
    storage.updateMember(member.id, { photoUrl: undefined });
    setMessage({ type: 'success', text: 'تمت إزالة الصورة الشخصية' });
    onUpdateSuccess();
  };

  // Handle Password Change
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (currentPass !== member.password) {
      setMessage({ type: 'error', text: 'كلمة المرور الحالية غير صحيحة' });
      return;
    }

    if (newPass.length < 4) {
      setMessage({ type: 'error', text: 'يجب أن تتكون كلمة المرور من 4 خانات على الأقل' });
      return;
    }

    if (newPass !== confirmPass) {
      setMessage({ type: 'error', text: 'كلمة المرور الجديدة وتأكيدها غير متطابقين' });
      return;
    }

    storage.updateMember(member.id, { password: newPass });
    setMessage({ type: 'success', text: 'تم تحديث كلمة المرور بنجاح!' });
    setCurrentPass('');
    setNewPass('');
    setConfirmPass('');
    onUpdateSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0A0A0A]/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto font-sans text-white">
      <div className="bg-[#121212] border border-white/10 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 my-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-zinc-900/60">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-white">
            <User className="w-4 h-4 text-lime-400" />
            <span>تعديل الحساب والملف الشخصي</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5">
          {/* Notification Feedback */}
          {message && (
            <div
              className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                message.type === 'success'
                  ? 'bg-lime-400/15 border border-lime-400/30 text-lime-400'
                  : 'bg-red-500/15 border border-red-500/30 text-red-400'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <span className="shrink-0">⚠️</span>
              )}
              <span>{message.text}</span>
            </div>
          )}

          {/* Member Profile Avatar Section */}
          <div className="bg-zinc-900/80 p-4 rounded-2xl border border-white/10 space-y-3">
            <div className="text-xs font-black text-lime-400 uppercase tracking-wider flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5" />
              <span>الصورة الشخصية</span>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="relative group shrink-0">
                {member.photoUrl ? (
                  <img
                    src={member.photoUrl}
                    alt={member.name}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-lime-400 shadow-md"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-zinc-950 border border-white/10 flex items-center justify-center text-zinc-400 font-bold">
                    <User className="w-8 h-8 text-zinc-500" />
                  </div>
                )}
              </div>

              <div className="space-y-2 flex-1 min-w-0">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full px-3 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-black text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{member.photoUrl ? 'تغيير الصورة' : 'رفع صورة شخصية'}</span>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                  accept="image/*"
                  className="hidden"
                />

                {member.photoUrl && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="w-full px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 border border-red-500/20"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>حذف الصورة</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Member Info Overview */}
          <div className="bg-zinc-900/50 p-3.5 rounded-2xl border border-white/5 space-y-1.5 text-xs">
            <div className="flex justify-between text-zinc-400">
              <span>اسم المشترك:</span>
              <strong className="text-white">{member.name}</strong>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>رقم الهاتف (الحساب):</span>
              <strong className="text-lime-400 font-mono" dir="ltr">{member.phone}</strong>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>باقة الاشتراك:</span>
              <strong className="text-white">{member.planName}</strong>
            </div>
          </div>

          {/* Change Password Form */}
          <form onSubmit={handleChangePassword} className="bg-zinc-900/80 p-4 rounded-2xl border border-white/10 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-black text-lime-400 uppercase tracking-wider">
              <KeyRound className="w-3.5 h-3.5" />
              <span>تغيير كلمة المرور</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">كلمة المرور الحالية</label>
              <input
                type="password"
                required
                value={currentPass}
                onChange={(e) => setCurrentPass(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-zinc-900 border border-white/10 focus:border-lime-400 rounded-xl px-3.5 py-2.5 text-xs text-white font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">كلمة المرور الجديدة</label>
              <input
                type="password"
                required
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                placeholder="أدخل كلمة المرور الجديدة"
                className="w-full bg-zinc-900 border border-white/10 focus:border-lime-400 rounded-xl px-3.5 py-2.5 text-xs text-white font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">تأكيد كلمة المرور الجديدة</label>
              <input
                type="password"
                required
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                placeholder="أعد إدخال كلمة المرور"
                className="w-full bg-zinc-900 border border-white/10 focus:border-lime-400 rounded-xl px-3.5 py-2.5 text-xs text-white font-bold"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-lime-400 hover:bg-lime-300 text-black font-black py-2.5 px-4 rounded-xl text-xs shadow-md shadow-lime-400/20 transition-all cursor-pointer"
            >
              حفظ كلمة المرور الجديدة
            </button>
          </form>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-white/10 bg-zinc-900/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-black uppercase tracking-wider transition-colors border border-white/5"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
