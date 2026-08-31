import React from 'react';
import {
  X,
  Sparkles,
  Calendar,
  Clock,
  Gift,
  ShieldCheck,
  Activity,
  Flame,
  Waves,
  HeartHandshake,
  Dumbbell,
  CheckCircle2,
  AlertTriangle,
  User,
  QrCode
} from 'lucide-react';
import { Member, GymSettings } from '../../types';
import { storage } from '../../services/storage';

interface SubscriptionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member;
  settings: GymSettings;
  onOpenCardPass?: () => void;
}

export const SubscriptionDetailsModal: React.FC<SubscriptionDetailsModalProps> = ({
  isOpen,
  onClose,
  member,
  settings,
  onOpenCardPass,
}) => {
  if (!isOpen || !member) return null;

  const getDaysRemaining = () => {
    const end = new Date(member.endDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const daysLeft = getDaysRemaining();
  const isExpiringSoon = daysLeft > 0 && daysLeft <= 7;
  const isExpired = member.status === 'expired' || daysLeft === 0;

  // Check if member is in gym now
  const attendanceList = storage.getAttendance();
  const currentInsideRecord = attendanceList.find((a) => a.memberId === member.id && a.status === 'inside');
  const isInside = !!currentInsideRecord;

  // Guest passes remaining
  const remainingInvites = Math.max(0, (member.maxGuestInvites || 0) - (member.usedGuestInvites || 0));

  // Helper to get service icon
  const getServiceIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('سونا') || lower.includes('sauna') || lower.includes('بخار')) {
      return <Flame className="w-4 h-4 text-orange-400" />;
    }
    if (lower.includes('ملح') || lower.includes('salt') || lower.includes('جاكوزي') || lower.includes('spa')) {
      return <Waves className="w-4 h-4 text-cyan-400" />;
    }
    if (lower.includes('بادي') || lower.includes('body') || lower.includes('وزن') || lower.includes('فحص')) {
      return <Activity className="w-4 h-4 text-lime-400" />;
    }
    if (lower.includes('مساج') || lower.includes('massage')) {
      return <HeartHandshake className="w-4 h-4 text-pink-400" />;
    }
    return <Dumbbell className="w-4 h-4 text-lime-400" />;
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0A0A0A]/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto font-sans text-white">
      <div className="bg-[#121212] border border-white/10 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 my-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-zinc-900/60">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-white">
            <Sparkles className="w-4 h-4 text-lime-400" />
            <span>تفاصيل باقة الاشتراك والمزايا</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 sm:p-6 space-y-4">
          {/* Member Overview Card */}
          <div className="p-4 rounded-2xl bg-zinc-950 border border-white/10 relative overflow-hidden flex items-center justify-between gap-3">
            <div className="absolute top-0 right-0 w-32 h-32 bg-lime-400/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center gap-3 relative z-10 min-w-0">
              {member.photoUrl ? (
                <img
                  src={member.photoUrl}
                  alt={member.name}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-lime-400 shrink-0"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center text-lime-400 shrink-0 font-bold">
                  <User className="w-7 h-7" />
                </div>
              )}

              <div className="min-w-0">
                <h3 className="text-base font-black text-white truncate">{member.name}</h3>
                <div className="text-xs text-lime-400 font-bold">{member.planName}</div>
                <div className="text-[11px] font-mono text-zinc-400" dir="ltr">{member.phone}</div>
              </div>
            </div>

            <div className="text-left shrink-0">
              <span
                className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-black border ${
                  isExpired
                    ? 'bg-red-500/10 border-red-500/30 text-red-400'
                    : isExpiringSoon
                    ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
                    : 'bg-lime-400/10 border-lime-400/30 text-lime-400'
                }`}
              >
                {isExpired ? 'منتهي' : isExpiringSoon ? 'ينتهي قريباً' : 'ساري ونشط'}
              </span>
            </div>
          </div>

          {/* Subscription Dates & Status Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {/* Days Left */}
            <div className="p-3 rounded-xl bg-zinc-900/80 border border-white/5 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-zinc-400">الأيام المتبقية</span>
              <div className="my-1">
                <span
                  className={`text-2xl font-black font-mono italic ${
                    isExpired ? 'text-red-400' : isExpiringSoon ? 'text-yellow-400' : 'text-lime-400'
                  }`}
                >
                  {daysLeft}
                </span>
                <span className="text-[10px] text-zinc-400 mr-1">يوم</span>
              </div>
              <span className="text-[9px] text-zinc-500 font-mono">
                {isExpired ? 'بحاجة للتجديد' : 'اشتراك ساري'}
              </span>
            </div>

            {/* End Date */}
            <div className="p-3 rounded-xl bg-zinc-900/80 border border-white/5 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-zinc-400">تاريخ الانتهاء</span>
              <div className="my-1 text-sm sm:text-base font-black text-white font-mono" dir="ltr">
                {member.endDate}
              </div>
              <span className="text-[9px] text-zinc-500 font-mono" dir="ltr">
                بدأ: {member.startDate}
              </span>
            </div>

            {/* In-Hall Presence */}
            <div className="col-span-2 sm:col-span-1 p-3 rounded-xl bg-zinc-900/80 border border-white/5 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-zinc-400">التواجد بالصالة</span>
              <div className="my-1 flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isInside ? 'bg-lime-400 animate-ping' : 'bg-zinc-500'
                  }`}
                />
                <span
                  className={`text-xs font-black ${
                    isInside ? 'text-lime-400' : 'text-zinc-400'
                  }`}
                >
                  {isInside ? 'داخل الصالة' : 'خارج الصالة'}
                </span>
              </div>
              <span className="text-[9px] text-zinc-500">
                {isInside ? 'جلسة تمرين جارية' : 'سجل عند الوصول'}
              </span>
            </div>
          </div>

          {/* Guest Invites Balance */}
          <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-lime-400/10 text-lime-400">
                <Gift className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-black text-white">دعوات الأصدقاء المجانية</div>
                <div className="text-[10px] text-zinc-400">
                  تم استخدام {member.usedGuestInvites || 0} من {member.maxGuestInvites || 0}
                </div>
              </div>
            </div>
            <span className="text-lg font-black text-lime-400 font-mono">
              {remainingInvites} <span className="text-[10px] text-zinc-400 font-normal">متبقية</span>
            </span>
          </div>

          {/* Benefits & Included Sessions Breakdown */}
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center justify-between text-xs font-black text-white">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-lime-400" />
                <span>رصيد الجلسات والخدمات المشمولة</span>
              </div>
              <span className="text-[10px] text-zinc-400">
                {member.benefits?.length || 0} خدمات
              </span>
            </div>

            {(!member.benefits || member.benefits.length === 0) ? (
              <div className="text-center py-6 text-zinc-500 text-xs font-bold bg-zinc-900/40 rounded-xl border border-white/5">
                لا توجد جلسات إضافية مسجلة لهذه الباقة
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {member.benefits.map((b, idx) => {
                  const rem = Math.max(0, b.totalAllowed - b.usedCount);
                  const percent = Math.min(100, Math.round((rem / (b.totalAllowed || 1)) * 100));

                  return (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-zinc-950 border border-white/10 flex flex-col justify-between space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-zinc-900 border border-white/5">
                            {getServiceIcon(b.name)}
                          </div>
                          <div>
                            <div className="text-xs font-black text-white">{b.name}</div>
                            <div className="text-[9px] text-zinc-400">
                              مستهلك {b.usedCount} من {b.totalAllowed}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-base font-black text-lime-400 font-mono">{rem}</span>
                          <span className="text-[9px] text-zinc-500 block">متبقي</span>
                        </div>
                      </div>

                      <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-lime-400 h-full rounded-full transition-all duration-300"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Action to Digital Card */}
          {onOpenCardPass && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenCardPass();
              }}
              className="w-full py-3 px-4 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-lime-400 font-black text-xs border border-lime-400/30 hover:border-lime-400 transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
              <span>عرض بطاقة العضوية الرقمية (VIP Pass)</span>
            </button>
          )}
        </div>

        {/* Footer */}
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
