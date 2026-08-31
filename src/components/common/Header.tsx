import React, { useState, useRef, useEffect } from 'react';
import {
  LogOut,
  QrCode,
  ShieldAlert,
  User,
  ChevronDown,
  Sparkles,
  Calendar,
  Clock,
  ShieldCheck,
  KeyRound,
  Activity,
  Gift,
  Camera,
  CheckCircle2,
  AlertTriangle,
  Bell
} from 'lucide-react';
import { GymSettings, AuthSession, Member } from '../../types';
import { GymLogo } from './GymLogo';
import { ProfileEditModal } from './ProfileEditModal';
import { SubscriptionDetailsModal } from './SubscriptionDetailsModal';
import { MemberCardModal } from './MemberCardModal';
import { AdminNotificationsModal } from '../admin/AdminNotificationsModal';
import { AddEditMemberModal } from '../admin/AddEditMemberModal';
import { storage } from '../../services/storage';

interface HeaderProps {
  settings: GymSettings;
  session: AuthSession;
  inHallCount: number;
  onLogout: () => void;
  onOpenReceptionQR: () => void;
  onRefreshData?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  session,
  inHallCount,
  onLogout,
  onOpenReceptionQR,
  onRefreshData,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSubDetailsModalOpen, setIsSubDetailsModalOpen] = useState(false);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [isAdminNotifsOpen, setIsAdminNotifsOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [viewingCardMember, setViewingCardMember] = useState<Member | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const maxCap = settings.maxHallCapacity || 50;
  const capacityPercent = Math.min(100, Math.round((inHallCount / maxCap) * 100));

  const getCapacityBadge = () => {
    if (capacityPercent < 45) {
      return {
        label: 'هادئة',
        color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
        dot: 'bg-emerald-400',
      };
    }
    if (capacityPercent < 80) {
      return {
        label: 'معتدلة',
        color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
        dot: 'bg-yellow-400',
      };
    }
    return {
      label: 'مزدحمة',
      color: 'text-red-400 bg-red-500/10 border-red-500/30',
      dot: 'bg-red-400',
    };
  };

  const occupancy = getCapacityBadge();
  const currentMember = session.member;
  const memberPhoto = currentMember?.photoUrl;

  // Member Subscription Calculations
  const getDaysRemaining = (member?: Member) => {
    if (!member) return 0;
    const end = new Date(member.endDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const daysLeft = currentMember ? getDaysRemaining(currentMember) : 0;
  const isExpiringSoon = daysLeft > 0 && daysLeft <= 7;
  const isExpired = currentMember?.status === 'expired' || daysLeft === 0;

  // Check if current member is inside hall
  const attendanceList = storage.getAttendance();
  const isInsideNow = currentMember
    ? !!attendanceList.find((a) => a.memberId === currentMember.id && a.status === 'inside')
    : false;

  // Admin Subscriptions notifications calculation
  const allMembers = storage.getMembers();
  const adminExpiredCount = allMembers.filter((m) => {
    if (m.status === 'expired') return true;
    const end = new Date(m.endDate);
    const now = new Date();
    return end.getTime() < now.getTime();
  }).length;

  const adminExpiringSoonCount = allMembers.filter((m) => {
    if (m.status !== 'active') return false;
    const end = new Date(m.endDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 && diff <= 7;
  }).length;

  const totalAdminAlerts = adminExpiredCount + adminExpiringSoonCount;

  return (
    <>
      <header id="app-header" className="sticky top-0 z-40 bg-[#0A0A0A]/95 backdrop-blur-md border-b border-white/10 w-full max-w-full">
        <div className="max-w-7xl mx-auto px-2.5 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-1.5 sm:gap-4">
          {/* Gym Brand (Compact) */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0 min-w-0">
            <GymLogo settings={settings} size="sm" showText={true} />
          </div>

          {/* Center: Occupancy Percentage Badge & Admin Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <div
              id="header-live-capacity-badge"
              className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 rounded-full border text-[10px] sm:text-xs font-black uppercase tracking-wider ${occupancy.color} transition-all`}
              title={`نسبة إشغال الصالة الحالية بناءً على السعة القصوى (${maxCap} مشترك)`}
            >
              <span className="relative flex h-2 w-2 shrink-0">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${occupancy.dot} opacity-75`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${occupancy.dot}`}></span>
              </span>
              <span className="hidden md:inline text-zinc-300 font-bold">الإشغال:</span>
              <span className="font-mono font-black text-white">{capacityPercent}%</span>
              <span className="hidden xs:inline text-[9px] sm:text-[10px] font-bold opacity-80">({occupancy.label})</span>
            </div>

            {session.role === 'admin' && (
              <>
                {/* Admin Notification Bell Icon in Header */}
                <button
                  id="header-admin-bell-btn"
                  type="button"
                  onClick={() => setIsAdminNotifsOpen(true)}
                  className="relative p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/10 hover:border-red-500/50 transition-all cursor-pointer shadow-sm group"
                  title="تنبيهات الاشتراكات المنتهية"
                >
                  <Bell className="w-4 h-4 group-hover:text-lime-400 transition-colors" />
                  {totalAdminAlerts > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-red-500 text-white font-black text-[9px] animate-pulse">
                      {adminExpiredCount > 0 ? adminExpiredCount : totalAdminAlerts}
                    </span>
                  )}
                </button>

                <button
                  id="header-qr-reception-btn"
                  onClick={onOpenReceptionQR}
                  className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-black uppercase tracking-wider border border-white/10 hover:border-lime-400 transition-all shadow-sm cursor-pointer"
                  title="عرض كيو ار شاشة الاستقبال"
                >
                  <QrCode className="w-3.5 h-3.5 text-lime-400" />
                  <span>كيو ار الاستقبال</span>
                </button>
              </>
            )}
          </div>

          {/* User Session Info & Interactive Dropdown Trigger */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 relative" ref={dropdownRef}>
            {/* Clickable Profile Card / Avatar Pill */}
            <button
              id="header-user-profile-btn"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-1.5 sm:gap-2 bg-zinc-900 hover:bg-zinc-800 px-2 sm:px-2.5 py-1 rounded-xl border border-white/10 hover:border-lime-400/50 transition-all cursor-pointer group shadow-sm select-none"
              title="انقر لفتح قائمة الحساب وتفاصيل الاشتراك"
            >
              {session.role === 'admin' ? (
                <div className="w-7 h-7 rounded-lg bg-lime-400 flex items-center justify-center text-black font-black text-xs shrink-0 shadow-sm">
                  <ShieldAlert className="w-4 h-4 text-black" />
                </div>
              ) : memberPhoto ? (
                <img
                  src={memberPhoto}
                  alt={session.member?.name || 'Avatar'}
                  className="w-7 h-7 rounded-lg object-cover border border-lime-400/50 shrink-0"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-7 h-7 rounded-lg bg-lime-400/20 text-lime-400 border border-lime-400/30 flex items-center justify-center font-bold text-xs shrink-0">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}

              <div className="text-right hidden sm:block">
                <div className="text-xs font-black text-white leading-tight truncate max-w-[90px] md:max-w-[120px]">
                  {session.role === 'admin' ? 'الإدارة' : session.member?.name}
                </div>
                <div className="text-[10px] font-mono text-zinc-400 leading-tight">
                  {session.role === 'admin' ? 'Admin' : session.member?.phone}
                </div>
              </div>

              <ChevronDown
                className={`w-3.5 h-3.5 text-zinc-400 group-hover:text-lime-400 transition-transform duration-200 ${
                  isDropdownOpen ? 'rotate-180 text-lime-400' : ''
                }`}
              />
            </button>

            {/* Quick Logout button for fast exit */}
            <button
              id="header-logout-btn"
              onClick={onLogout}
              className="flex items-center gap-1 p-2 sm:px-2.5 sm:py-1.5 rounded-xl bg-zinc-900 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 border border-white/10 hover:border-red-500/30 text-xs font-black uppercase tracking-wider transition-all cursor-pointer shrink-0"
              title="تسجيل الخروج"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden xl:inline text-[11px]">خروج</span>
            </button>

            {/* ========================================================= */}
            {/* DROPDOWN MENU (Profile, Subscription Details & Logout) */}
            {/* ========================================================= */}
            {isDropdownOpen && (
              <div className="absolute left-0 sm:left-auto sm:right-0 top-full mt-2 w-[300px] sm:w-[330px] bg-[#121212] border border-white/15 rounded-3xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 font-sans">
                {/* 1. Header with Avatar & User Info */}
                <div className="p-4 bg-zinc-950 border-b border-white/10 relative overflow-hidden">
                  <div className="absolute -top-10 -left-10 w-24 h-24 bg-lime-400/10 rounded-full blur-xl pointer-events-none" />

                  <div className="flex items-center gap-3 relative z-10">
                    {/* User Avatar with Quick Camera Trigger */}
                    <div className="relative group shrink-0">
                      {session.role === 'admin' ? (
                        <div className="w-12 h-12 rounded-2xl bg-lime-400 flex items-center justify-center text-black font-black text-lg shadow-md">
                          <ShieldAlert className="w-6 h-6 text-black" />
                        </div>
                      ) : memberPhoto ? (
                        <img
                          src={memberPhoto}
                          alt={currentMember?.name}
                          className="w-12 h-12 rounded-2xl object-cover border-2 border-lime-400 shadow-md"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center text-lime-400 font-bold">
                          <User className="w-6 h-6" />
                        </div>
                      )}

                      {session.role === 'member' && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsDropdownOpen(false);
                            setIsProfileModalOpen(true);
                          }}
                          className="absolute -bottom-1 -right-1 p-1 rounded-lg bg-lime-400 text-black hover:bg-lime-300 shadow transition-all cursor-pointer"
                          title="تعديل الصورة"
                        >
                          <Camera className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>

                    {/* Name, Phone & Role Badge */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-sm font-black text-white truncate">
                          {session.role === 'admin' ? 'لوحة تحكم الإدارة' : currentMember?.name}
                        </h4>
                      </div>

                      <div className="text-[11px] font-mono text-zinc-400" dir="ltr">
                        {session.role === 'admin' ? 'Admin Access' : currentMember?.phone}
                      </div>

                      {session.role === 'member' && currentMember && (
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="px-2 py-0.5 rounded-md bg-zinc-900 border border-white/10 text-lime-400 text-[10px] font-black truncate">
                            {currentMember.planName}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[9px] font-black border ${
                              isExpired
                                ? 'bg-red-500/10 border-red-500/30 text-red-400'
                                : isExpiringSoon
                                ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
                                : 'bg-lime-400/10 border-lime-400/30 text-lime-400'
                            }`}
                          >
                            {isExpired ? 'منتهي' : isExpiringSoon ? 'قارب الانتهاء' : 'ساري'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 2. Quick Subscription Snapshot (For Members) */}
                {session.role === 'member' && currentMember && (
                  <div className="p-3.5 bg-zinc-900/60 border-b border-white/10 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-zinc-400">
                        <Clock className="w-3.5 h-3.5 text-lime-400" />
                        <span>الأيام المتبقية:</span>
                      </div>
                      <span
                        className={`font-black font-mono text-sm ${
                          isExpired ? 'text-red-400' : isExpiringSoon ? 'text-yellow-400' : 'text-lime-400'
                        }`}
                      >
                        {daysLeft} يوم
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-zinc-400">
                        <Calendar className="w-3.5 h-3.5 text-lime-400" />
                        <span>تاريخ الانتهاء:</span>
                      </div>
                      <span className="font-mono text-zinc-200 text-xs" dir="ltr">
                        {currentMember.endDate}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-white/5">
                      <div className="flex items-center gap-1.5 text-zinc-400">
                        <Activity className="w-3.5 h-3.5 text-lime-400" />
                        <span>حالة الصالة:</span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          isInsideNow
                            ? 'bg-lime-400/20 text-lime-400 border border-lime-400/30'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {isInsideNow ? 'داخل الصالة الآن 💪' : 'خارج الصالة'}
                      </span>
                    </div>
                  </div>
                )}

                {/* 3. Action Menu Items */}
                <div className="p-2 space-y-1">
                  {session.role === 'member' && currentMember && (
                    <>
                      {/* View Full Subscription Details */}
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          setIsSubDetailsModalOpen(true);
                        }}
                        className="w-full px-3 py-2.5 rounded-2xl hover:bg-zinc-900 text-right text-xs font-bold text-white hover:text-lime-400 transition-all flex items-center justify-between group cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 rounded-xl bg-lime-400/10 text-lime-400 group-hover:bg-lime-400 group-hover:text-black transition-colors">
                            <Sparkles className="w-4 h-4" />
                          </div>
                          <span>تفاصيل الاشتراك والمزايا</span>
                        </div>
                        <span className="text-[10px] text-zinc-500 font-mono">عرض</span>
                      </button>

                      {/* View Digital VIP Card */}
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          setIsCardModalOpen(true);
                        }}
                        className="w-full px-3 py-2.5 rounded-2xl hover:bg-zinc-900 text-right text-xs font-bold text-white hover:text-lime-400 transition-all flex items-center justify-between group cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 rounded-xl bg-lime-400/10 text-lime-400 group-hover:bg-lime-400 group-hover:text-black transition-colors">
                            <ShieldCheck className="w-4 h-4" />
                          </div>
                          <span>كارت العضوية الرقمي (VIP Pass)</span>
                        </div>
                        <span className="text-[10px] text-zinc-500 font-mono">QR</span>
                      </button>

                      {/* Edit Profile / Password */}
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          setIsProfileModalOpen(true);
                        }}
                        className="w-full px-3 py-2.5 rounded-2xl hover:bg-zinc-900 text-right text-xs font-bold text-white hover:text-lime-400 transition-all flex items-center justify-between group cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 rounded-xl bg-lime-400/10 text-lime-400 group-hover:bg-lime-400 group-hover:text-black transition-colors">
                            <KeyRound className="w-4 h-4" />
                          </div>
                          <span>تعديل الحساب وكلمة المرور</span>
                        </div>
                        <span className="text-[10px] text-zinc-500 font-mono">تعديل</span>
                      </button>
                    </>
                  )}

                  {session.role === 'admin' && (
                    <>
                      {/* Admin Notifications Trigger */}
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          setIsAdminNotifsOpen(true);
                        }}
                        className="w-full px-3 py-2.5 rounded-2xl hover:bg-zinc-900 text-right text-xs font-bold text-white hover:text-red-400 transition-all flex items-center justify-between group cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 rounded-xl bg-red-500/10 text-red-400 group-hover:bg-red-500 group-hover:text-white transition-colors">
                            <Bell className="w-4 h-4" />
                          </div>
                          <span>تنبيهات الاشتراكات المنتهية</span>
                        </div>
                        {totalAdminAlerts > 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-red-500 text-white font-black text-[10px]">
                            {adminExpiredCount > 0 ? `${adminExpiredCount} منتهي` : totalAdminAlerts}
                          </span>
                        )}
                      </button>

                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          onOpenReceptionQR();
                        }}
                        className="w-full px-3 py-2.5 rounded-2xl hover:bg-zinc-900 text-right text-xs font-bold text-white hover:text-lime-400 transition-all flex items-center justify-between group cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 rounded-xl bg-lime-400/10 text-lime-400 group-hover:bg-lime-400 group-hover:text-black transition-colors">
                            <QrCode className="w-4 h-4" />
                          </div>
                          <span>عرض كيو ار شاشة الاستقبال</span>
                        </div>
                        <span className="text-[10px] text-zinc-500">فتح</span>
                      </button>
                    </>
                  )}

                  {/* Log Out */}
                  <div className="pt-1 border-t border-white/10">
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onLogout();
                      }}
                      className="w-full px-3 py-2.5 rounded-2xl hover:bg-red-500/15 text-right text-xs font-bold text-red-400 transition-all flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-xl bg-red-500/10 text-red-400 group-hover:bg-red-500 group-hover:text-white transition-colors">
                          <LogOut className="w-4 h-4" />
                        </div>
                        <span>تسجيل الخروج من الحساب</span>
                      </div>
                      <span className="text-[10px] text-red-400/60 font-mono">خروج</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Profile Edit Modal */}
      {currentMember && (
        <ProfileEditModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          member={currentMember}
          onUpdateSuccess={() => {
            if (onRefreshData) onRefreshData();
          }}
        />
      )}

      {/* Subscription Details Modal */}
      {currentMember && (
        <SubscriptionDetailsModal
          isOpen={isSubDetailsModalOpen}
          onClose={() => setIsSubDetailsModalOpen(false)}
          member={currentMember}
          settings={settings}
          onOpenCardPass={() => setIsCardModalOpen(true)}
        />
      )}

      {/* Member Card Digital VIP Pass Modal */}
      {currentMember && (
        <MemberCardModal
          isOpen={isCardModalOpen}
          onClose={() => setIsCardModalOpen(false)}
          member={currentMember}
          settings={settings}
        />
      )}

      {/* Admin Notifications Modal */}
      {session.role === 'admin' && (
        <>
          <AdminNotificationsModal
            isOpen={isAdminNotifsOpen}
            onClose={() => setIsAdminNotifsOpen(false)}
            members={allMembers}
            settings={settings}
            onEditMember={(m) => {
              setEditingMember(m);
              setIsEditModalOpen(true);
            }}
            onViewCard={(m) => setViewingCardMember(m)}
          />

          <AddEditMemberModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setEditingMember(null);
            }}
            onSave={(memberData, memberId) => {
              if (memberId) {
                storage.updateMember(memberId, memberData);
              } else {
                storage.addMember(memberData);
              }
              if (onRefreshData) onRefreshData();
            }}
            initialMember={editingMember}
            settings={settings}
          />

          {viewingCardMember && (
            <MemberCardModal
              isOpen={!!viewingCardMember}
              onClose={() => setViewingCardMember(null)}
              member={viewingCardMember}
              settings={settings}
            />
          )}
        </>
      )}
    </>
  );
};
