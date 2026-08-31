import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import { X, QrCode, Maximize2, Minimize2, Printer, Users, Sparkles, CheckCircle2, Phone, Search, RefreshCw } from 'lucide-react';
import { GymSettings, Member } from '../../types';
import { GymLogo } from './GymLogo';
import { storage } from '../../services/storage';

interface ReceptionQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GymSettings;
  inHallCount: number;
  onCheckInSuccess?: (memberName: string) => void;
}

export const ReceptionQRModal: React.FC<ReceptionQRModalProps> = ({
  isOpen,
  onClose,
  settings,
  inHallCount,
  onCheckInSuccess,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [quickPhone, setQuickPhone] = useState('');
  const [quickResult, setQuickResult] = useState<{ success: boolean; message: string } | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  const modalRef = useRef<HTMLDivElement>(null);

  // Update clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Generate Reception QR Code
  useEffect(() => {
    if (!isOpen) return;

    // Payload formatted as standard gym check-in token
    const payload = JSON.stringify({
      type: 'GYM_HALL_CHECKIN',
      secret: settings.qrSecret,
      gymName: settings.name,
      timestamp: Date.now(),
    });

    QRCode.toDataURL(payload, {
      width: 450,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Error generating QR code', err));
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      modalRef.current?.requestFullscreen().catch((err) => console.error(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch((err) => console.error(err));
      setIsFullscreen(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleQuickDeskCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPhone.trim()) return;

    const members = storage.getMembers();
    const clean = quickPhone.trim();
    const member = members.find(
      (m) => m.phone.trim() === clean || m.phone.replace(/\s+/g, '') === clean.replace(/\s+/g, '')
    );

    if (!member) {
      setQuickResult({ success: false, message: 'رقم الهاتف غير مسجل في المشتركين' });
      return;
    }

    const res = storage.checkInMember(member.id, 'admin_manual');
    setQuickResult(res);
    if (res.success) {
      setQuickPhone('');
      if (onCheckInSuccess) onCheckInSuccess(member.name);
    }
  };

  return (
    <div
      ref={modalRef}
      id="reception-qr-modal"
      className="fixed inset-0 z-50 bg-[#0A0A0A]/98 backdrop-blur-xl flex flex-col justify-between overflow-y-auto p-4 sm:p-8 text-white font-sans"
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4 max-w-5xl mx-auto w-full">
        <GymLogo settings={settings} size="lg" />

        <div className="flex items-center gap-3">
          {/* Live In-Hall Count */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-lime-400/10 border border-lime-400/30 text-lime-400 font-black text-xs uppercase tracking-wider">
            <Users className="w-4 h-4" />
            <span>المتواجدون الآن:</span>
            <span className="text-xl font-black text-white italic">{inHallCount}</span>
            <span className="text-xs text-zinc-400 font-mono">/ {settings.maxHallCapacity}</span>
          </div>

          <button
            onClick={toggleFullscreen}
            className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-white/10 transition-colors"
            title="ملء الشاشة"
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>

          <button
            onClick={handlePrint}
            className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-white/10 transition-colors"
            title="طباعة الكيو ار"
          >
            <Printer className="w-5 h-5" />
          </button>

          <button
            onClick={onClose}
            className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-colors"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Center Content */}
      <div className="max-w-4xl mx-auto w-full my-auto py-6 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        {/* QR Code Container (left/right) */}
        <div className="md:col-span-7 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-lime-400/10 text-lime-400 text-xs font-black uppercase tracking-wider mb-4 border border-lime-400/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>نقطة تسجيل الدخول الذكية بالصالة</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black uppercase italic tracking-tight text-white mb-2">
            امسح الكيو ار بكاميرا هاتفك لتسجيل دخولك
          </h2>
          <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-400 max-w-md mb-6">
            سجّل حضورك تلقائياً لفتح البوابة واحتساب وقت تمرينك وتحديث عدد المتواجدين بالصالة
          </p>

          {/* QR Paper/Card */}
          <div className="p-4 bg-white rounded-3xl shadow-2xl shadow-lime-400/10 border-4 border-lime-400 flex flex-col items-center">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="Gym Check-In QR"
                className="w-64 h-64 sm:w-72 sm:h-72 object-contain rounded-2xl"
              />
            ) : (
              <div className="w-64 h-64 flex items-center justify-center text-zinc-400 font-bold">
                جاري توليد الكيو ار...
              </div>
            )}
            <div className="mt-2 text-[11px] font-black text-black tracking-widest uppercase">
              {settings.name.toUpperCase()} • CHECK-IN QR
            </div>
          </div>
        </div>

        {/* Quick Reception Desk Check-in & Time (Side column) */}
        <div className="md:col-span-5 space-y-6">
          {/* Real-time Clock */}
          <div className="bg-[#121212] p-6 rounded-3xl border border-white/10 text-center shadow-xl">
            <div className="text-4xl font-black text-lime-400 tracking-widest font-mono italic" dir="ltr">
              {currentTime.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 mt-2">
              {currentTime.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>

          {/* Quick Desk Check-In by Phone */}
          <div className="bg-[#121212] p-6 rounded-3xl border border-white/10 shadow-xl">
            <div className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-white mb-3">
              <Phone className="w-4 h-4 text-lime-400" />
              <span>تسجيل دخول يدوي سريع (الاستقبال)</span>
            </div>

            <form onSubmit={handleQuickDeskCheckIn} className="space-y-3">
              <div className="relative">
                <input
                  type="tel"
                  dir="ltr"
                  value={quickPhone}
                  onChange={(e) => {
                    setQuickPhone(e.target.value);
                    setQuickResult(null);
                  }}
                  placeholder="رقم هاتف المشترك..."
                  className="w-full bg-zinc-900 border border-white/10 focus:border-lime-400 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 text-right font-bold"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-lime-400 hover:bg-lime-300 text-black font-black uppercase tracking-wider py-3 px-4 rounded-xl text-xs transition-all shadow-md shadow-lime-400/20 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>تسجيل حضور المشترك بالصالة</span>
              </button>
            </form>

            {quickResult && (
              <div
                className={`mt-3 p-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 ${
                  quickResult.success
                    ? 'bg-lime-400/15 border border-lime-400/30 text-lime-400'
                    : 'bg-red-500/15 border border-red-500/30 text-red-400'
                }`}
              >
                <span>{quickResult.message}</span>
              </div>
            )}
          </div>

          {/* Tips */}
          <div className="p-4 rounded-2xl bg-zinc-900/40 border border-white/5 text-xs font-bold text-zinc-400 leading-relaxed">
            💡 يمكن فتح هذه الشاشة وتثبيتها على تابلت الاستقبال عند مدخل الجيم ليقوم المشتركون بتصوير الكيو ار من تطبيقهم أو كاميرا هاتفهم لتسجيل حضورهم فوراً.
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="text-center text-xs font-bold uppercase tracking-wider text-zinc-500 border-t border-white/10 pt-4 max-w-5xl mx-auto w-full">
        {settings.name} • نظام التحقق التلقائي وتسجيل الحضور بالصالة
      </div>
    </div>
  );
};
