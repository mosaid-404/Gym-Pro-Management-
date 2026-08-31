import React, { useState } from 'react';
import {
  X,
  Bell,
  AlertTriangle,
  Clock,
  Phone,
  MessageCircle,
  Edit,
  User,
  CheckCircle2,
  Copy,
  Calendar,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Send
} from 'lucide-react';
import { Member, GymSettings } from '../../types';

interface AdminNotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  settings: GymSettings;
  onEditMember: (member: Member) => void;
  onViewCard: (member: Member) => void;
}

export const AdminNotificationsModal: React.FC<AdminNotificationsModalProps> = ({
  isOpen,
  onClose,
  members,
  settings,
  onEditMember,
  onViewCard,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'expired' | 'expiring_soon'>('all');
  const [copiedNumbers, setCopiedNumbers] = useState(false);

  if (!isOpen) return null;

  // Calculate days remaining or overdue
  const getDaysDiff = (endDateStr: string) => {
    const end = new Date(endDateStr);
    const now = new Date();
    // Normalize to midnight
    const endMidnight = new Date(end.getFullYear(), end.getMonth(), end.getDate());
    const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffTime = endMidnight.getTime() - nowMidnight.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Classify members
  const notificationsList = members
    .map((m) => {
      const days = getDaysDiff(m.endDate);
      const isExpired = m.status === 'expired' || days <= 0;
      const isExpiringSoon = m.status === 'active' && days > 0 && days <= 7;

      let type: 'expired' | 'expiring_soon' | 'active' = 'active';
      if (isExpired) type = 'expired';
      else if (isExpiringSoon) type = 'expiring_soon';

      return {
        member: m,
        days,
        type,
        isExpired,
        isExpiringSoon,
      };
    })
    .filter((item) => item.type === 'expired' || item.type === 'expiring_soon')
    .sort((a, b) => {
      // Sort expired first, then smallest days left
      if (a.type === 'expired' && b.type !== 'expired') return -1;
      if (a.type !== 'expired' && b.type === 'expired') return 1;
      return a.days - b.days;
    });

  const expiredCount = notificationsList.filter((n) => n.type === 'expired').length;
  const expiringSoonCount = notificationsList.filter((n) => n.type === 'expiring_soon').length;

  const filteredItems = notificationsList.filter((item) => {
    if (activeFilter === 'expired') return item.type === 'expired';
    if (activeFilter === 'expiring_soon') return item.type === 'expiring_soon';
    return true;
  });

  // Handle WhatsApp Reminder
  const handleSendWhatsApp = (m: Member, days: number, isExpired: boolean) => {
    const cleanPhone = m.phone.replace(/[^0-9]/g, '');
    const phoneWithCode = cleanPhone.startsWith('0')
      ? `2${cleanPhone}` // Default Egypt / local code adjustment or direct
      : cleanPhone;

    let messageText = '';
    if (isExpired) {
      messageText = `مرحباً كابتن ${m.name} 🌹\nنود تذكيرك بأن اشتراكك في *${settings.name}* (${m.planName}) قد انتهى بتاريخ ${m.endDate}.\n\nيسعدنا تجديد اشتراكك لمتابعة تدريباتك وتحقيق أهدافك الرياضية 💪\nللتواصل والاستفسار: ${settings.phone}`;
    } else {
      messageText = `مرحباً كابتن ${m.name} 🌹\nنود إعلامك بأن اشتراكك في *${settings.name}* (${m.planName}) متبقي عليه *${days}* أيام فقط وسينتهي بتاريخ ${m.endDate}.\n\nيسعدنا زيارتك لتجديد الاشتراك ومواصلة حماسك في الجيم 🔥\nللتواصل: ${settings.phone}`;
    }

    const encoded = encodeURIComponent(messageText);
    const url = `https://wa.me/${phoneWithCode}?text=${encoded}`;
    window.open(url, '_blank');
  };

  // Copy all target phone numbers
  const handleCopyPhones = () => {
    const phones = filteredItems.map((n) => n.member.phone).join('\n');
    navigator.clipboard.writeText(phones);
    setCopiedNumbers(true);
    setTimeout(() => setCopiedNumbers(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0A0A0A]/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto font-sans text-white">
      <div className="bg-[#121212] border border-white/10 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 my-6 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 bg-zinc-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative p-2 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400">
              <Bell className="w-5 h-5" />
              {expiredCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-red-500 text-black font-black text-[10px]">
                  {expiredCount}
                </span>
              )}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>تنبيهات وإشعارات الاشتراكات</span>
              </h2>
              <p className="text-xs text-zinc-400 font-bold">
                متابعة المشتركين المنتهية اشتراكاتهم وتنبيهات التجديد الفورية
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Pills & Actions Bar */}
        <div className="p-3 sm:p-4 border-b border-white/10 bg-zinc-950 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-lime-400 text-black shadow-md shadow-lime-400/20'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-white/5'
              }`}
            >
              الكل ({notificationsList.length})
            </button>

            <button
              onClick={() => setActiveFilter('expired')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                activeFilter === 'expired'
                  ? 'bg-red-500 text-white shadow-md shadow-red-500/20'
                  : 'bg-zinc-900 text-red-400 hover:text-red-300 border border-red-500/20'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>منتهي الصلاحية ({expiredCount})</span>
            </button>

            <button
              onClick={() => setActiveFilter('expiring_soon')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                activeFilter === 'expiring_soon'
                  ? 'bg-yellow-500 text-black shadow-md shadow-yellow-500/20'
                  : 'bg-zinc-900 text-yellow-400 hover:text-yellow-300 border border-yellow-500/20'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>ينتهي قريباً ({expiringSoonCount})</span>
            </button>
          </div>

          {filteredItems.length > 0 && (
            <button
              onClick={handleCopyPhones}
              className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/10 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="نسخ أرقام الهواتف لهذه القائمة"
            >
              {copiedNumbers ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-lime-400" />
                  <span className="text-lime-400 font-bold">تم نسخ الأرقام!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-zinc-400" />
                  <span>نسخ الأرقام</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Notifications List Body */}
        <div className="p-3 sm:p-4 overflow-y-auto flex-1 space-y-3">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 bg-zinc-900/30 rounded-2xl border border-white/5 space-y-2">
              <CheckCircle2 className="w-12 h-12 text-lime-400 mx-auto opacity-70" />
              <h3 className="text-sm font-black text-white">لا توجد اشتراكات منتهية أو متأخرة حالياً!</h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                جميع اشتراكات المشتركين سارية ومنتظمة ولا يوجد أي تنبيهات تتطلب المتابعة.
              </p>
            </div>
          ) : (
            filteredItems.map(({ member: m, days, type, isExpired }) => {
              const overdueDays = Math.abs(days);

              return (
                <div
                  key={m.id}
                  className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 ${
                    isExpired
                      ? 'bg-red-500/5 border-red-500/20 hover:border-red-500/40'
                      : 'bg-yellow-500/5 border-yellow-500/20 hover:border-yellow-500/40'
                  }`}
                >
                  {/* Member Info */}
                  <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto">
                    {m.photoUrl ? (
                      <img
                        src={m.photoUrl}
                        alt={m.name}
                        className="w-12 h-12 rounded-2xl object-cover border-2 border-white/10 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-400 font-bold shrink-0">
                        <User className="w-6 h-6" />
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-black text-white truncate">{m.name}</h4>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-black border ${
                            isExpired
                              ? 'bg-red-500/20 text-red-400 border-red-500/30'
                              : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                          }`}
                        >
                          {isExpired ? (
                            <span>منتهي منذ {overdueDays === 0 ? 'اليوم' : `${overdueDays} يوم`}</span>
                          ) : (
                            <span>ينتهي خلال {days} أيام</span>
                          )}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-zinc-400 mt-1 flex-wrap font-bold">
                        <span className="text-lime-400 font-bold">{m.planName}</span>
                        <span>•</span>
                        <span className="font-mono text-zinc-300" dir="ltr">
                          انتهى: {m.endDate}
                        </span>
                        <span>•</span>
                        <a
                          href={`tel:${m.phone}`}
                          className="font-mono text-zinc-300 hover:text-lime-400 flex items-center gap-1"
                          dir="ltr"
                        >
                          <Phone className="w-3 h-3 text-lime-400" />
                          <span>{m.phone}</span>
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Actions (WhatsApp, Call, Renew/Edit, VIP Pass) */}
                  <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                    {/* WhatsApp Quick Reminder */}
                    <button
                      type="button"
                      onClick={() => handleSendWhatsApp(m, days, isExpired)}
                      className="px-3 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                      title="إرسال رسالة تذكير عبر واتساب"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>واتساب</span>
                    </button>

                    {/* Phone Call */}
                    <a
                      href={`tel:${m.phone}`}
                      className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/10 transition-colors"
                      title="اتصال هاتفي"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>

                    {/* VIP Card Preview */}
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onViewCard(m);
                      }}
                      className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
                      title="عرض كارت العضوية"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-lime-400" />
                    </button>

                    {/* Renew / Edit Member */}
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onEditMember(m);
                      }}
                      className="px-3 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-black text-xs font-black transition-all flex items-center gap-1.5 shadow-md shadow-lime-400/20 cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>تجديد</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-white/10 bg-zinc-900/60 flex items-center justify-between">
          <div className="text-xs text-zinc-400">
            إجمالي التنبيهات: <strong className="text-white">{notificationsList.length}</strong>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-black uppercase tracking-wider transition-colors border border-white/5 cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
