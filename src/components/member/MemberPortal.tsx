import React, { useState, useRef } from 'react';
import {
  Calendar,
  Clock,
  Users,
  QrCode,
  Sparkles,
  Gift,
  ShieldCheck,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Activity,
  Dumbbell,
  Waves,
  HeartHandshake,
  UserPlus,
  Copy,
  Check,
  Camera,
  Upload,
  Trash2,
  User,
  History
} from 'lucide-react';
import { Member, GymSettings, GuestInvitation } from '../../types';
import { storage } from '../../services/storage';
import { QRScannerModal } from './QRScannerModal';
import { MemberCardModal } from '../common/MemberCardModal';

interface MemberPortalProps {
  member: Member;
  settings: GymSettings;
  inHallCount: number;
  onRefreshData: () => void;
  onLogout: () => void;
}

export const MemberPortal: React.FC<MemberPortalProps> = ({
  member,
  settings,
  inHallCount,
  onRefreshData,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'benefits' | 'invite' | 'history' | 'profile'>('benefits');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Invite Friend Form state
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [inviteResult, setInviteResult] = useState<{ success: boolean; message: string; invite?: GuestInvitation } | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Change Password state
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passMessage, setPassMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Profile Photo state
  const [photoMessage, setPhotoMessage] = useState<string | null>(null);

  // Calculate Days Remaining
  const getDaysRemaining = () => {
    const end = new Date(member.endDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const daysRemaining = getDaysRemaining();
  const isExpiringSoon = daysRemaining > 0 && daysRemaining <= 7;
  const isExpired = member.status === 'expired' || daysRemaining === 0;

  // Check if member is currently inside the gym
  const attendanceList = storage.getAttendance();
  const currentInsideRecord = attendanceList.find((a) => a.memberId === member.id && a.status === 'inside');
  const isInsideNow = !!currentInsideRecord;

  // Check-in / Check-out handler
  const handleCheckOut = () => {
    storage.checkOutByMemberId(member.id);
    onRefreshData();
  };

  // Photo Upload Handler (Optional)
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('حجم الصورة كبير، يرجى اختيار صورة أقل من 2 ميجابايت.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const base64 = event.target.result as string;
        storage.updateMember(member.id, { photoUrl: base64 });
        setPhotoMessage('تم تحديث الصورة الشخصية بنجاح!');
        setTimeout(() => setPhotoMessage(null), 3000);
        onRefreshData();
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    storage.updateMember(member.id, { photoUrl: undefined });
    setPhotoMessage('تم حذف الصورة الشخصية');
    setTimeout(() => setPhotoMessage(null), 3000);
    onRefreshData();
  };

  // Create Guest Invitation
  const handleCreateInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !guestPhone.trim()) return;

    const res = storage.createGuestInvite(member.id, guestName, guestPhone);
    setInviteResult(res);
    if (res.success) {
      setGuestName('');
      setGuestPhone('');
      onRefreshData();
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Change Password handler
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPassMessage(null);

    if (currentPass !== member.password) {
      setPassMessage({ type: 'error', text: 'كلمة المرور الحالية غير صحيحة' });
      return;
    }

    if (newPass.length < 4) {
      setPassMessage({ type: 'error', text: 'يجب أن تتكون كلمة المرور من 4 رموز على الأقل' });
      return;
    }

    if (newPass !== confirmPass) {
      setPassMessage({ type: 'error', text: 'كلمة المرور الجديدة وتأكيدها غير متطابقين' });
      return;
    }

    storage.updateMember(member.id, { password: newPass });
    setPassMessage({ type: 'success', text: 'تم تحديث كلمة المرور بنجاح!' });
    setCurrentPass('');
    setNewPass('');
    setConfirmPass('');
    onRefreshData();
  };

  // Format attendance records for this member
  const myAttendanceHistory = attendanceList
    .filter((a) => a.memberId === member.id)
    .slice(0, 10);

  // My Guest Invites
  const myInvites = storage.getGuestInvitations().filter((inv) => inv.memberId === member.id);
  const remainingInvites = Math.max(0, (member.maxGuestInvites || 0) - (member.usedGuestInvites || 0));

  // Occupancy level (Percentage)
  const maxCap = settings.maxHallCapacity || 50;
  const capacityPercent = Math.min(100, Math.round((inHallCount / maxCap) * 100));
  const getOccupancyBadge = () => {
    if (capacityPercent < 45) return { label: 'هادئة', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
    if (capacityPercent < 80) return { label: 'متوسطة', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30' };
    return { label: 'مزدحمة', color: 'text-red-400 bg-red-500/10 border-red-500/30' };
  };
  const occupancy = getOccupancyBadge();

  // Helper to pick icons for benefits
  const getBenefitIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('سونا') || lower.includes('sauna') || lower.includes('بخار')) {
      return <Flame className="w-5 h-5 text-orange-400" />;
    }
    if (lower.includes('ملح') || lower.includes('salt') || lower.includes('جاكوزي') || lower.includes('spa')) {
      return <Waves className="w-5 h-5 text-cyan-400" />;
    }
    if (lower.includes('بادي') || lower.includes('body') || lower.includes('وزن') || lower.includes('فحص')) {
      return <Activity className="w-5 h-5 text-lime-400" />;
    }
    if (lower.includes('مساج') || lower.includes('massage') || lower.includes('ريكفري')) {
      return <HeartHandshake className="w-5 h-5 text-pink-400" />;
    }
    return <Dumbbell className="w-5 h-5 text-lime-400" />;
  };

  return (
    <div id="member-portal-view" className="w-full max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6 text-white font-sans overflow-x-hidden">
      {/* 1. Member Main Pass Card */}
      <div className="relative overflow-hidden rounded-3xl bg-zinc-950 border-2 border-white/10 p-5 sm:p-7 shadow-2xl">
        <div className="absolute -top-16 -left-16 w-40 h-40 bg-lime-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          {/* Member Name & Status with Profile Picture */}
          <div className="flex items-center gap-4">
            {/* Optional Avatar Photo */}
            <div className="relative group shrink-0">
              {member.photoUrl ? (
                <img
                  src={member.photoUrl}
                  alt={member.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-lime-400 shadow-xl"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-zinc-900 border-2 border-white/10 flex items-center justify-center text-lime-400 shadow-inner">
                  <User className="w-8 h-8 sm:w-10 sm:h-10 text-lime-400" />
                </div>
              )}

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 p-1.5 rounded-xl bg-lime-400 text-black hover:bg-lime-300 transition-all shadow-md"
                title="تعديل أو رفع الصورة الشخصية (اختياري)"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoUpload}
                accept="image/*"
                className="hidden"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
                <span className="text-xs font-bold text-zinc-400">عضوية المشترك</span>
              </div>

              <h1 className="text-xl sm:text-2xl font-black text-white italic tracking-tight">
                {member.name}
              </h1>

              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                <span className="px-2.5 py-0.5 rounded-lg bg-zinc-900 border border-white/10 text-lime-400 text-xs font-black">
                  {member.planName}
                </span>

                <span
                  className={`px-2.5 py-0.5 rounded-lg text-xs font-black border ${
                    isExpired
                      ? 'bg-red-500/10 border-red-500/30 text-red-400'
                      : isExpiringSoon
                      ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
                      : 'bg-lime-400/10 border-lime-400/30 text-lime-400'
                  }`}
                >
                  {isExpired ? 'منتهي' : isExpiringSoon ? 'ينتهي قريباً' : 'نشط وساري'}
                </span>
              </div>
            </div>
          </div>

          {/* Days Remaining Big Badge */}
          <div className="bg-zinc-900/90 border border-white/10 rounded-2xl p-4 sm:p-5 flex sm:flex-col items-center justify-between sm:justify-center text-center gap-2 min-w-[130px]">
            <span className="text-xs font-bold text-zinc-400">المتبقي باشتراكك</span>
            <div className="flex items-baseline gap-1">
              <span
                className={`text-3xl sm:text-4xl font-black font-mono italic ${
                  isExpired
                    ? 'text-red-400'
                    : isExpiringSoon
                    ? 'text-yellow-400'
                    : 'text-lime-400'
                }`}
              >
                {daysRemaining}
              </span>
              <span className="text-xs font-bold text-zinc-400">يوم</span>
            </div>
            <span className="text-[10px] text-zinc-500 font-mono" dir="ltr">
              حتى: {member.endDate}
            </span>
          </div>
        </div>

        {/* Action Buttons: 1-Tap Attendance & VIP Card */}
        <div className="mt-5 pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {isInsideNow ? (
            <div className="bg-lime-400/15 border border-lime-400/30 p-3 rounded-2xl flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-lime-400 text-xs font-black">
                <span className="w-2 h-2 rounded-full bg-lime-400 animate-ping" />
                <span>أنت متواجد بالصالة الآن 💪</span>
              </div>
              <button
                onClick={handleCheckOut}
                className="px-3.5 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-black transition-colors"
              >
                تسجيل الخروج
              </button>
            </div>
          ) : (
            <button
              id="btn-scan-reception-qr"
              onClick={() => setIsScannerOpen(true)}
              className="bg-lime-400 hover:bg-lime-300 text-black font-black py-3.5 px-4 rounded-2xl text-xs sm:text-sm shadow-lg shadow-lime-400/20 transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
            >
              <QrCode className="w-5 h-5" />
              <span>تسجيل حضور بالصالة (Scan QR)</span>
            </button>
          )}

          <button
            onClick={() => setIsCardModalOpen(true)}
            className="bg-zinc-900 hover:bg-zinc-800 text-white font-black py-3.5 px-4 rounded-2xl text-xs sm:text-sm border border-white/10 hover:border-lime-400 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <ShieldCheck className="w-5 h-5 text-lime-400" />
            <span>عرض كارت العضوية الرقمي</span>
          </button>
        </div>
      </div>

      {/* 2. Quick Glance 2-Column Summary (Percentage Occupancy) */}
      <div className="grid grid-cols-2 gap-3">
        {/* Live Gym Capacity as Percentage */}
        <div className="bg-zinc-900/70 border border-white/10 rounded-2xl p-3.5 sm:p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-lime-400/10 text-lime-400">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-zinc-400">إشغال الصالة</div>
              <div className="text-base sm:text-lg font-black text-white font-mono">
                {capacityPercent}%
              </div>
            </div>
          </div>
          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${occupancy.color}`}>
            {occupancy.label}
          </span>
        </div>

        {/* Free Guest Invites Left */}
        <div className="bg-zinc-900/70 border border-white/10 rounded-2xl p-3.5 sm:p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-lime-400/10 text-lime-400">
              <Gift className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-zinc-400">دعوات الأصدقاء</div>
              <div className="text-base sm:text-lg font-black text-lime-400 font-mono">
                {remainingInvites} <span className="text-[10px] text-zinc-500 font-normal">متبقية</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('invite')}
            className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-bold transition-colors"
          >
            دعوة 🎁
          </button>
        </div>
      </div>

      {/* 3. Streamlined Tab Navigation */}
      <div className="flex items-center gap-1.5 p-1.5 bg-zinc-950 border border-white/10 rounded-2xl overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('benefits')}
          className={`flex-1 min-w-[90px] py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'benefits'
              ? 'bg-lime-400 text-black shadow-md'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>المزايا والجلسات</span>
        </button>

        <button
          onClick={() => setActiveTab('invite')}
          className={`flex-1 min-w-[90px] py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'invite'
              ? 'bg-lime-400 text-black shadow-md'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <Gift className="w-4 h-4" />
          <span>دعوة صديق</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 min-w-[90px] py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'history'
              ? 'bg-lime-400 text-black shadow-md'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <History className="w-4 h-4" />
          <span>سجل الحضور</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex-1 min-w-[90px] py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'profile'
              ? 'bg-lime-400 text-black shadow-md'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <User className="w-4 h-4" />
          <span>الملف والأمان</span>
        </button>
      </div>

      {/* 4. Tab Content Area */}
      <div className="bg-[#121212] border border-white/10 rounded-3xl p-5 sm:p-6 shadow-xl">
        {/* TAB 1: Benefits & Sessions */}
        {activeTab === 'benefits' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-lime-400" />
                <h3 className="text-sm font-black text-white">رصيد الجلسات والمزايا المتبقية</h3>
              </div>
              <span className="text-[11px] text-zinc-400 font-medium">
                {member.benefits?.length || 0} خدمات مشمولة
              </span>
            </div>

            {(!member.benefits || member.benefits.length === 0) ? (
              <div className="text-center py-10 text-zinc-500 text-xs font-bold bg-zinc-900/40 rounded-2xl border border-white/5">
                لا توجد جلسات إضافية مسجلة لباقة اشتراكك الحالية
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {member.benefits.map((benefit, idx) => {
                  const remaining = Math.max(0, benefit.totalAllowed - benefit.usedCount);

                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-zinc-900/80 border border-white/10 hover:border-lime-400/40 transition-all flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                            {getBenefitIcon(benefit.name)}
                          </div>
                          <div>
                            <div className="text-sm font-black text-white">{benefit.name}</div>
                            <div className="text-[10px] text-zinc-400 font-bold">
                              تم استخدام {benefit.usedCount} من {benefit.totalAllowed}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-xl font-black text-lime-400 font-mono">{remaining}</div>
                          <div className="text-[9px] text-zinc-500 font-bold">متبقي</div>
                        </div>
                      </div>

                      {/* Visual Progress Bar */}
                      <div className="space-y-1">
                        <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-lime-400 rounded-full transition-all duration-500"
                            style={{ width: `${Math.max(5, ((benefit.totalAllowed - benefit.usedCount) / (benefit.totalAllowed || 1)) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Guest Invites */}
        {activeTab === 'invite' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-lime-400" />
                <h3 className="text-sm font-black text-white">إهداء دعوة مجانية لصديق (Guest Pass)</h3>
              </div>
              <span className="text-xs font-black text-lime-400 font-mono">
                رصيدك: {remainingInvites} دعوة
              </span>
            </div>

            <form onSubmit={handleCreateInvite} className="bg-zinc-900/60 p-4 sm:p-5 rounded-2xl border border-white/10 space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">اسم الصديق</label>
                  <input
                    type="text"
                    required
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="مثال: محمود علي"
                    className="w-full bg-zinc-900 border border-white/10 focus:border-lime-400 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">رقم هاتفه</label>
                  <input
                    type="tel"
                    dir="ltr"
                    required
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    placeholder="01011223344"
                    className="w-full bg-zinc-900 border border-white/10 focus:border-lime-400 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white font-bold font-mono text-right"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={remainingInvites <= 0}
                className="w-full bg-lime-400 hover:bg-lime-300 text-black font-black py-3 px-4 rounded-xl text-xs shadow-md shadow-lime-400/20 disabled:opacity-40 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Gift className="w-4 h-4" />
                <span>إصدار وتوليد كود الدعوة</span>
              </button>

              {inviteResult && (
                <div
                  className={`p-3 rounded-xl text-xs font-bold flex items-center justify-between gap-2 ${
                    inviteResult.success
                      ? 'bg-lime-400/15 border border-lime-400/30 text-lime-400'
                      : 'bg-red-500/15 border border-red-500/30 text-red-400'
                  }`}
                >
                  <span>{inviteResult.message}</span>
                  {inviteResult.invite && (
                    <button
                      type="button"
                      onClick={() => handleCopyCode(inviteResult.invite!.code)}
                      className="px-3 py-1 rounded-lg bg-lime-400 text-black font-black text-xs flex items-center gap-1"
                    >
                      {copiedCode === inviteResult.invite.code ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{inviteResult.invite.code}</span>
                    </button>
                  )}
                </div>
              )}
            </form>

            {myInvites.length > 0 && (
              <div className="space-y-2 pt-2">
                <div className="text-xs font-bold text-zinc-400">الدعوات الصادرة منك:</div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {myInvites.map((inv) => (
                    <div
                      key={inv.id}
                      className="p-3 rounded-xl bg-zinc-900/80 border border-white/5 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-white">{inv.guestName}</div>
                        <div className="text-[10px] text-zinc-400 font-mono" dir="ltr">{inv.guestPhone}</div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleCopyCode(inv.code)}
                          className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-lime-400 font-mono font-bold text-[11px] flex items-center gap-1"
                          title="نسخ كود الدعوة"
                        >
                          {copiedCode === inv.code ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          <span>{inv.code}</span>
                        </button>
                        <span
                          className={`px-2 py-0.5 rounded-lg text-[9px] font-bold ${
                            inv.status === 'used'
                              ? 'bg-lime-400/10 text-lime-400 border border-lime-400/20'
                              : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                          }`}
                        >
                          {inv.status === 'used' ? 'تم الدخول' : 'بانتظار الزيارة'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Attendance History */}
        {activeTab === 'history' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-lime-400" />
                <h3 className="text-sm font-black text-white">سجل حضورك بالصالة</h3>
              </div>
              <span className="text-[11px] text-zinc-400">آخر {myAttendanceHistory.length} زيارات</span>
            </div>

            {myAttendanceHistory.length === 0 ? (
              <div className="text-center py-10 text-zinc-500 text-xs font-bold bg-zinc-900/40 rounded-2xl border border-white/5">
                لم يتم تسجيل أي حضور بعد. امسح كيو ار الصالة عند وصولك للجيم!
              </div>
            ) : (
              <div className="space-y-2">
                {myAttendanceHistory.map((att) => (
                  <div
                    key={att.id}
                    className="p-3 rounded-xl bg-zinc-900/80 border border-white/5 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-lime-400/10 text-lime-400 flex items-center justify-center font-bold">
                        🏋️
                      </div>
                      <div>
                        <div className="font-bold text-white">
                          تمرين بالصالة ({att.method === 'qr_scanner' ? 'كيو ار الهاتف' : 'الاستقبال'})
                        </div>
                        <div className="text-[10px] text-zinc-400 font-mono" dir="ltr">
                          {new Date(att.checkInTime).toLocaleString('ar-EG', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </div>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        att.status === 'inside'
                          ? 'bg-lime-400/20 text-lime-400 border border-lime-400/30'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {att.status === 'inside' ? 'متواجد حالياً' : 'مكتمل'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: Profile & Password */}
        {activeTab === 'profile' && (
          <div className="space-y-6 max-w-md mx-auto">
            {/* Optional Photo Management */}
            <div className="bg-zinc-900/60 p-4 rounded-2xl border border-white/10 space-y-3">
              <div className="text-xs font-black text-lime-400 uppercase tracking-wider flex items-center gap-2">
                <Camera className="w-4 h-4" />
                <span>الصورة الشخصية (اختيارية)</span>
              </div>

              {photoMessage && (
                <div className="p-2.5 rounded-xl bg-lime-400/15 border border-lime-400/30 text-lime-400 text-xs font-bold">
                  {photoMessage}
                </div>
              )}

              <div className="flex items-center gap-4">
                {member.photoUrl ? (
                  <img
                    src={member.photoUrl}
                    alt={member.name}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-lime-400 shadow-md"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-zinc-950 border border-white/10 flex items-center justify-center text-zinc-500 font-bold">
                    <User className="w-8 h-8" />
                  </div>
                )}

                <div className="space-y-2 flex-1">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold border border-white/10 hover:border-lime-400 transition-all flex items-center justify-center gap-2"
                  >
                    <Upload className="w-3.5 h-3.5 text-lime-400" />
                    <span>{member.photoUrl ? 'تغيير الصورة' : 'رفع صورة شخصية'}</span>
                  </button>

                  {member.photoUrl && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="w-full px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>حذف الصورة</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Change Password */}
            <div className="bg-zinc-900/60 p-4 rounded-2xl border border-white/10 space-y-3">
              <div className="flex items-center gap-2 text-xs font-black text-lime-400 uppercase tracking-wider">
                <KeyRound className="w-4 h-4" />
                <span>تغيير كلمة المرور</span>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-3">
                {passMessage && (
                  <div
                    className={`p-3 rounded-xl text-xs font-bold ${
                      passMessage.type === 'success'
                        ? 'bg-lime-400/15 border border-lime-400/30 text-lime-400'
                        : 'bg-red-500/15 border border-red-500/30 text-red-400'
                    }`}
                  >
                    {passMessage.text}
                  </div>
                )}

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
                  className="w-full bg-lime-400 hover:bg-lime-300 text-black font-black py-3 px-4 rounded-xl text-xs shadow-md shadow-lime-400/20 transition-all cursor-pointer"
                >
                  حفظ كلمة المرور الجديدة
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        member={member}
        settings={settings}
        onCheckInComplete={() => {
          onRefreshData();
        }}
      />

      <MemberCardModal
        isOpen={isCardModalOpen}
        onClose={() => setIsCardModalOpen(false)}
        member={member}
        settings={settings}
      />
    </div>
  );
};
