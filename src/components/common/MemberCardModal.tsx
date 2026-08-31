import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { X, Printer, User, ShieldCheck } from 'lucide-react';
import { Member, GymSettings } from '../../types';
import { GymLogo } from './GymLogo';

interface MemberCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member;
  settings: GymSettings;
}

export const MemberCardModal: React.FC<MemberCardModalProps> = ({
  isOpen,
  onClose,
  member,
  settings,
}) => {
  const [memberQrUrl, setMemberQrUrl] = useState('');

  useEffect(() => {
    if (!isOpen || !member) return;

    // Payload formatted for direct member identification
    const payload = JSON.stringify({
      type: 'MEMBER_ID_PASS',
      memberId: member.id,
      name: member.name,
      phone: member.phone,
      gymName: settings.name,
    });

    QRCode.toDataURL(payload, {
      width: 250,
      margin: 1,
      color: {
        dark: '#0a0a0a',
        light: '#ffffff',
      },
    })
      .then((url) => setMemberQrUrl(url))
      .catch((err) => console.error(err));
  }, [isOpen, member, settings]);

  if (!isOpen || !member) return null;

  const handlePrint = () => {
    window.print();
  };

  const getDaysRemaining = () => {
    const end = new Date(member.endDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const daysLeft = getDaysRemaining();

  return (
    <div className="fixed inset-0 z-50 bg-[#0A0A0A]/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto font-sans text-white">
      <div className="bg-[#121212] border border-white/10 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 my-6">
        {/* Top Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-zinc-900/60">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-white">
            <ShieldCheck className="w-4 h-4 text-lime-400" />
            <span>بطاقة العضوية الرقمية (VIP Pass)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors border border-white/5"
              title="طباعة البطاقة"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">طباعة</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5 sm:p-6">
          <div
            id="printable-member-vip-card"
            className="relative overflow-hidden rounded-3xl bg-zinc-950 border-2 border-lime-400/40 p-5 sm:p-6 shadow-2xl text-white"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-lime-400/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-lime-400/5 rounded-full blur-2xl pointer-events-none" />

            {/* Top row: Gym logo & Card type */}
            <div className="flex items-start justify-between relative z-10 mb-5">
              <GymLogo settings={settings} size="sm" />
              <span className="px-3 py-1 rounded-full bg-lime-400/10 text-lime-400 border border-lime-400/30 text-[10px] font-black uppercase tracking-widest">
                VIP PASS
              </span>
            </div>

            {/* Member details + Avatar & QR */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center relative z-10">
              <div className="sm:col-span-7 space-y-3">
                <div className="flex items-center gap-3">
                  {member.photoUrl ? (
                    <img
                      src={member.photoUrl}
                      alt={member.name}
                      className="w-12 h-12 rounded-2xl object-cover border-2 border-lime-400 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center text-lime-400 font-bold shrink-0">
                      <User className="w-6 h-6" />
                    </div>
                  )}
                  <div>
                    <div className="text-[10px] text-lime-400 font-black uppercase tracking-wider">
                      اسم المشترك
                    </div>
                    <div className="text-base sm:text-lg font-black uppercase italic tracking-tight text-white leading-tight">
                      {member.name}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">رقم الحساب</div>
                    <div className="font-mono font-bold text-zinc-200" dir="ltr">
                      {member.phone}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">نوع الباقة</div>
                    <div className="font-black text-lime-400 truncate">{member.planName}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">صالح حتى</div>
                    <div className="font-mono font-bold text-zinc-200" dir="ltr">
                      {member.endDate}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">المدة المتبقية</div>
                    <div
                      className={`font-black uppercase tracking-wider ${
                        daysLeft > 7
                          ? 'text-lime-400'
                          : daysLeft > 0
                          ? 'text-yellow-400'
                          : 'text-red-400'
                      }`}
                    >
                      {daysLeft > 0 ? `${daysLeft} يوم` : 'منتهي'}
                    </div>
                  </div>
                </div>
              </div>

              {/* QR Code */}
              <div className="sm:col-span-5 flex flex-col items-center justify-center p-2 bg-white rounded-2xl shadow-lg border-2 border-lime-400/30">
                {memberQrUrl ? (
                  <img
                    src={memberQrUrl}
                    alt="Member QR"
                    className="w-24 h-24 object-contain rounded-lg"
                  />
                ) : (
                  <div className="w-24 h-24 bg-zinc-100 flex items-center justify-center text-[10px] text-zinc-400 font-bold">
                    QR Code
                  </div>
                )}
                <span className="text-[8px] font-black text-black tracking-widest mt-1 uppercase">
                  PASS CODE
                </span>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-zinc-400 relative z-10 font-bold uppercase tracking-wider">
              <span className="truncate">{settings.address || 'Gym Membership'}</span>
              <span className="text-lime-400 font-mono shrink-0">{member.phone}</span>
            </div>
          </div>

          {/* Benefits summary list */}
          <div className="mt-4 p-3.5 rounded-2xl bg-zinc-950 border border-white/10">
            <div className="text-xs font-black uppercase tracking-wider text-zinc-300 mb-2">رصيد المزايا المتبقي:</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(member.benefits || []).map((b, i) => (
                <div key={i} className="p-2 rounded-xl bg-zinc-900 border border-white/5 text-[11px]">
                  <div className="text-zinc-300 font-bold truncate">{b.name}</div>
                  <div className="text-lime-400 font-black font-mono">
                    {Math.max(0, b.totalAllowed - b.usedCount)} / {b.totalAllowed}
                  </div>
                </div>
              ))}
            </div>
          </div>
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
