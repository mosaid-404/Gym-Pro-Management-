import React, { useState, useRef } from 'react';
import {
  Users,
  UserPlus,
  QrCode,
  Sparkles,
  Search,
  Trash2,
  Edit,
  Clock,
  AlertTriangle,
  Flame,
  Gift,
  Settings,
  UserCheck,
  Eye,
  Activity,
  Lock,
  Camera,
  User,
  CheckCircle2,
  Percent,
  TrendingUp,
  Save,
  Check,
  Copy,
  Bell,
  Upload,
  Image as ImageIcon,
  Dumbbell,
  Trophy,
  Crown,
  Shield,
  Zap,
  Phone
} from 'lucide-react';
import { Member, GymSettings, HallAttendance, GuestInvitation } from '../../types';
import { storage } from '../../services/storage';
import { AddEditMemberModal } from './AddEditMemberModal';
import { MemberCardModal } from '../common/MemberCardModal';
import { AdminNotificationsModal } from './AdminNotificationsModal';
import { GymLogo } from '../common/GymLogo';

interface AdminDashboardProps {
  settings: GymSettings;
  onUpdateSettings: (newSettings: GymSettings) => void;
  onOpenReceptionQR: () => void;
  onRefreshData: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  settings,
  onUpdateSettings,
  onOpenReceptionQR,
  onRefreshData,
}) => {
  const [activeTab, setActiveTab] = useState<'members' | 'hall' | 'services' | 'invites' | 'settings'>('members');

  // Modal States
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [viewingCardMember, setViewingCardMember] = useState<Member | null>(null);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);

  // Search & Filters for Members
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expired' | 'frozen' | 'expiring_soon'>('all');
  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female'>('all');

  // Service logger state
  const [selectedMemberForService, setSelectedMemberForService] = useState<Member | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');

  // Guest invite redeem code input
  const [redeemCodeInput, setRedeemCodeInput] = useState('');
  const [redeemMessage, setRedeemMessage] = useState<{ success: boolean; message: string } | null>(null);

  // Settings form state
  const [gymName, setGymName] = useState(settings.name);
  const [gymTagline, setGymTagline] = useState(settings.tagline);
  const [gymLogo, setGymLogo] = useState(settings.logo || 'dumbbell');
  const [gymPhone, setGymPhone] = useState(settings.phone);
  const [gymAddress, setGymAddress] = useState(settings.address);
  const [maxCapacity, setMaxCapacity] = useState(settings.maxHallCapacity || 50);
  const [defaultGuestInvites, setDefaultGuestInvites] = useState(settings.maxGuestInvitationsDefault || 2);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [settingsSavedMessage, setSettingsSavedMessage] = useState(false);
  const logoFileInputRef = useRef<HTMLInputElement | null>(null);

  // Load latest data
  const members = storage.getMembers();
  const attendanceList = storage.getAttendance();
  const currentInside = storage.getCurrentlyInsideMembers();
  const guestInvites = storage.getGuestInvitations();

  // Helper calculations
  const maxCap = settings.maxHallCapacity || 50;
  const occupancyPercent = Math.min(100, Math.round((currentInside.length / maxCap) * 100));

  const activeMembersCount = members.filter((m) => m.status === 'active').length;
  const expiredMembersCount = members.filter((m) => m.status === 'expired').length;

  // Calculate expiring soon (< 7 days)
  const expiringSoonCount = members.filter((m) => {
    if (m.status !== 'active') return false;
    const end = new Date(m.endDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 && diff <= 7;
  }).length;

  // Total notification alerts count
  const totalAlertsCount = expiredMembersCount + expiringSoonCount;

  // Filter members list
  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.phone.includes(searchTerm) ||
      m.planName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesGender = genderFilter === 'all' || m.gender === genderFilter;

    let matchesStatus = true;
    if (statusFilter === 'active') matchesStatus = m.status === 'active';
    else if (statusFilter === 'expired') matchesStatus = m.status === 'expired';
    else if (statusFilter === 'frozen') matchesStatus = m.status === 'frozen';
    else if (statusFilter === 'expiring_soon') {
      const end = new Date(m.endDate);
      const now = new Date();
      const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      matchesStatus = m.status === 'active' && diff > 0 && diff <= 7;
    }

    return matchesSearch && matchesGender && matchesStatus;
  });

  // Actions
  const handleSaveMember = (memberData: Omit<Member, 'id' | 'password' | 'createdAt'>, memberId?: string) => {
    if (memberId) {
      storage.updateMember(memberId, memberData);
    } else {
      storage.addMember(memberData);
    }
    onRefreshData();
  };

  const handleDeleteMember = (id: string, name: string) => {
    if (window.confirm(`هل أنت متأكد من رغبتك في حذف المشترك (${name}) نهائياً؟`)) {
      storage.deleteMember(id);
      onRefreshData();
    }
  };

  const handleResetPassword = (id: string, phone: string, name: string) => {
    if (window.confirm(`إعادة تعيين كلمة مرور المشترك (${name}) لتصبح رقم هاتفه (${phone})؟`)) {
      storage.updateMember(id, { password: phone });
      alert(`تمت إعادة تعيين كلمة المرور بنجاح إلى: ${phone}`);
      onRefreshData();
    }
  };

  const handleToggleFreeze = (member: Member) => {
    const newStatus = member.status === 'frozen' ? 'active' : 'frozen';
    storage.updateMember(member.id, { status: newStatus });
    onRefreshData();
  };

  const handleCheckOutFromHall = (attendanceId: string) => {
    storage.checkOutMember(attendanceId);
    onRefreshData();
  };

  // Consume a service session
  const handleConsumeService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberForService || !selectedServiceId) return;

    const member = selectedMemberForService;
    const updatedBenefits = (member.benefits || []).map((b) => {
      if (b.serviceId === selectedServiceId) {
        return { ...b, usedCount: Math.min(b.totalAllowed, b.usedCount + 1) };
      }
      return b;
    });

    storage.updateMember(member.id, { benefits: updatedBenefits });
    alert(`تم تسجيل استهلاك جلسة بنجاح للمشترك ${member.name}`);
    setSelectedMemberForService(null);
    setSelectedServiceId('');
    onRefreshData();
  };

  // Redeem Guest Invite
  const handleRedeemInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!redeemCodeInput.trim()) return;

    const res = storage.redeemGuestInvite(redeemCodeInput);
    setRedeemMessage(res);
    if (res.success) {
      setRedeemCodeInput('');
      onRefreshData();
    }
  };

  // Handle Logo Upload from local file
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      alert('حجم الصورة كبير، يرجى اختيار ملف أقل من 3 ميجابايت.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setGymLogo(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Save Gym Settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();

    const newSettings: GymSettings = {
      ...settings,
      name: gymName.trim(),
      tagline: gymTagline.trim(),
      logo: gymLogo,
      phone: gymPhone.trim(),
      address: gymAddress.trim(),
      maxHallCapacity: Number(maxCapacity) || 50,
      maxGuestInvitationsDefault: Number(defaultGuestInvites) || 2,
    };

    if (adminPasswordInput.trim()) {
      storage.saveAdminPassword(adminPasswordInput.trim());
      setAdminPasswordInput('');
    }

    onUpdateSettings(newSettings);
    setSettingsSavedMessage(true);
    setTimeout(() => setSettingsSavedMessage(false), 3000);
  };

  return (
    <div id="admin-dashboard-container" className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-5 text-white font-sans overflow-x-hidden">
      {/* 1. Quick Stats Cards (Compact & Percentage-based) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Live Occupancy % */}
        <div
          onClick={() => setActiveTab('hall')}
          className="cursor-pointer bg-[#121212] hover:bg-zinc-900 border border-white/10 rounded-2xl p-4 transition-all hover:border-lime-400 flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-400">نسبة إشغال الصالة</span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-lime-400"></span>
            </span>
          </div>
          <div className="my-2">
            <div className="text-3xl font-black text-lime-400 font-mono italic">{occupancyPercent}%</div>
            <div className="text-[10px] text-zinc-500 font-bold">
              (من السعة القصوى: {maxCap} مشترك)
            </div>
          </div>
          <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-lime-400 h-full rounded-full" style={{ width: `${occupancyPercent}%` }} />
          </div>
        </div>

        {/* Card 2: Total Members */}
        <div
          onClick={() => {
            setActiveTab('members');
            setStatusFilter('all');
          }}
          className="cursor-pointer bg-[#121212] hover:bg-zinc-900 border border-white/10 rounded-2xl p-4 transition-all hover:border-lime-400 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-400">إجمالي المشتركين</span>
            <Users className="w-4 h-4 text-lime-400" />
          </div>
          <div className="my-2">
            <div className="text-3xl font-black text-white font-mono italic">{members.length}</div>
            <div className="text-[10px] text-zinc-500 font-bold">مسجل بالنظام</div>
          </div>
          <div className="text-[10px] text-lime-400 font-bold">النشط: {activeMembersCount} مشترك</div>
        </div>

        {/* Card 3: Expiring Soon */}
        <div
          onClick={() => {
            setActiveTab('members');
            setStatusFilter('expiring_soon');
          }}
          className="cursor-pointer bg-[#121212] hover:bg-zinc-900 border border-white/10 rounded-2xl p-4 transition-all hover:border-yellow-400 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-400">ينتهي خلال 7 أيام</span>
            <Clock className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="my-2">
            <div className="text-3xl font-black text-yellow-400 font-mono italic">{expiringSoonCount}</div>
            <div className="text-[10px] text-zinc-500 font-bold">بحاجة للتجديد</div>
          </div>
          <div className="text-[10px] text-yellow-400/80 font-bold">متابعة الاشتراكات</div>
        </div>

        {/* Card 4: Expired */}
        <div
          onClick={() => {
            setActiveTab('members');
            setStatusFilter('expired');
          }}
          className="cursor-pointer bg-[#121212] hover:bg-zinc-900 border border-white/10 rounded-2xl p-4 transition-all hover:border-red-400 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-400">اشتراكات منتهية</span>
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
          <div className="my-2">
            <div className="text-3xl font-black text-red-400 font-mono italic">{expiredMembersCount}</div>
            <div className="text-[10px] text-zinc-500 font-bold">غير سارية</div>
          </div>
          <div className="text-[10px] text-red-400/80 font-bold">تواصل لتجديد الاشتراك</div>
        </div>
      </div>

      {/* 2. Top Navigation Tabs + Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-zinc-950 border border-white/10 rounded-2xl overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('members')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'members'
                ? 'bg-lime-400 text-black shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>المشتركين</span>
          </button>

          <button
            onClick={() => setActiveTab('hall')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'hall'
                ? 'bg-lime-400 text-black shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>الصالة والحضور</span>
          </button>

          <button
            onClick={() => setActiveTab('services')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'services'
                ? 'bg-lime-400 text-black shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>المزايا والجلسات</span>
          </button>

          <button
            onClick={() => setActiveTab('invites')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'invites'
                ? 'bg-lime-400 text-black shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Gift className="w-3.5 h-3.5" />
            <span>دعوات الأصدقاء</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'settings'
                ? 'bg-lime-400 text-black shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>الإعدادات</span>
          </button>
        </div>

        {/* Global Action: Add Member & Notifications Bell */}
        <div className="flex items-center gap-2">
          {/* Notification Bell Button */}
          <button
            id="admin-notifications-bell-btn"
            type="button"
            onClick={() => setIsNotificationsModalOpen(true)}
            className="relative px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 hover:border-red-500/50 text-white transition-all flex items-center gap-2 cursor-pointer shadow-sm group"
            title="تنبيهات وإشعارات الاشتراكات المنتهية"
          >
            <div className="relative">
              <Bell className="w-4 h-4 text-zinc-300 group-hover:text-lime-400 transition-colors" />
              {totalAlertsCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-red-500 text-white font-black text-[10px] animate-pulse">
                  {expiredMembersCount > 0 ? expiredMembersCount : totalAlertsCount}
                </span>
              )}
            </div>
            <span className="text-xs font-black hidden xs:inline">
              الإشعارات
            </span>
            {expiredMembersCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-md bg-red-500/20 text-red-400 text-[10px] font-black border border-red-500/30">
                {expiredMembersCount} منتهي
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setEditingMember(null);
              setIsAddEditModalOpen(true);
            }}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-black text-xs font-black shadow-md shadow-lime-400/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>إضافة مشترك جديد</span>
          </button>
        </div>
      </div>

      {/* 3. TAB CONTENT */}

      {/* TAB 1: MEMBERS MANAGEMENT */}
      {activeTab === 'members' && (
        <div className="space-y-4">
          {/* Filter & Search Bar */}
          <div className="bg-[#121212] border border-white/10 rounded-2xl p-3 sm:p-4 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            <div className="md:col-span-6 relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="البحث بالاسم، برقم الهاتف، أو بنوع الباقة..."
                className="w-full bg-zinc-900 border border-white/10 focus:border-lime-400 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 pr-9 font-bold"
              />
              <Search className="w-4 h-4 text-zinc-500 absolute right-3 top-3" />
            </div>

            <div className="md:col-span-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full bg-zinc-900 border border-white/10 focus:border-lime-400 rounded-xl px-3 py-2.5 text-xs text-white font-bold"
              >
                <option value="all">جميع الحالات</option>
                <option value="active">الاشتراكات السارية</option>
                <option value="expiring_soon">تنتهي قريباً (أقل من أسبوع)</option>
                <option value="expired">الاشتراكات المنتهية</option>
                <option value="frozen">الاشتراكات المجمدة</option>
              </select>
            </div>

            <div className="md:col-span-3">
              <select
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value as any)}
                className="w-full bg-zinc-900 border border-white/10 focus:border-lime-400 rounded-xl px-3 py-2.5 text-xs text-white font-bold"
              >
                <option value="all">الكل (رجال وسيدات)</option>
                <option value="male">رجال 👨</option>
                <option value="female">سيدات 👩</option>
              </select>
            </div>
          </div>

          {/* Members Table */}
          <div className="bg-[#121212] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-lime-400" />
                <h3 className="text-sm font-black text-white">
                  المشتركون ({filteredMembers.length})
                </h3>
              </div>
            </div>

            {filteredMembers.length === 0 ? (
              <div className="text-center py-12 text-zinc-500 text-xs font-bold">
                لا يوجد مشتركين يطابقون خيارات البحث
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-black/60 text-zinc-400 font-black border-b border-white/10 text-[10px] uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-3">المشترك</th>
                      <th className="py-3 px-3">الهاتف والرمز</th>
                      <th className="py-3 px-3">الباقة والانتهاء</th>
                      <th className="py-3 px-3">الحالة</th>
                      <th className="py-3 px-3">المزايا</th>
                      <th className="py-3 px-3 text-center">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredMembers.map((member) => {
                      const end = new Date(member.endDate);
                      const now = new Date();
                      const daysLeft = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

                      return (
                        <tr key={member.id} className="hover:bg-zinc-900/60 transition-colors">
                          {/* Member Photo & Name */}
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2.5">
                              {member.photoUrl ? (
                                <img
                                  src={member.photoUrl}
                                  alt={member.name}
                                  className="w-9 h-9 rounded-xl object-cover border border-lime-400/40 shrink-0"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-400 font-bold shrink-0">
                                  <User className="w-4 h-4 text-zinc-500" />
                                </div>
                              )}
                              <div>
                                <div className="font-black text-white text-xs">
                                  {member.name}
                                </div>
                                <div className="text-[10px] text-zinc-400 font-bold">
                                  {member.gender === 'female' ? 'أنثى 👩' : 'ذكر 👨'}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Phone & Password */}
                          <td className="py-3 px-3">
                            <div className="font-mono font-bold text-white text-xs" dir="ltr">
                              {member.phone}
                            </div>
                            <div className="text-[10px] text-lime-400 font-mono font-bold flex items-center gap-1">
                              <Lock className="w-3 h-3" />
                              <span>{member.password}</span>
                            </div>
                          </td>

                          {/* Plan & Expiry */}
                          <td className="py-3 px-3">
                            <div className="font-bold text-lime-400">{member.planName}</div>
                            <div className="text-[10px] text-zinc-400 font-mono" dir="ltr">
                              {member.endDate}
                            </div>
                            <div
                              className={`text-[10px] font-bold ${
                                daysLeft > 7
                                  ? 'text-lime-400'
                                  : daysLeft > 0
                                  ? 'text-yellow-400'
                                  : 'text-red-400'
                              }`}
                            >
                              {daysLeft > 0 ? `متبقي ${daysLeft} يوم` : 'منتهي'}
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-3 px-3">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black ${
                                member.status === 'active'
                                  ? 'bg-lime-400/15 text-lime-400 border border-lime-400/30'
                                  : member.status === 'frozen'
                                  ? 'bg-zinc-800 text-zinc-300'
                                  : 'bg-red-500/15 text-red-400 border border-red-500/30'
                              }`}
                            >
                              {member.status === 'active'
                                ? 'ساري'
                                : member.status === 'frozen'
                                ? 'مجمد'
                                : 'منتهي'}
                            </span>
                          </td>

                          {/* Benefits */}
                          <td className="py-3 px-3">
                            <div className="flex flex-wrap gap-1 max-w-[160px]">
                              {(member.benefits || []).map((b, i) => (
                                <span
                                  key={i}
                                  className="text-[9px] font-bold bg-black/60 px-1.5 py-0.5 rounded text-zinc-300 border border-white/5"
                                >
                                  {b.name.split(' ')[0]}: {Math.max(0, b.totalAllowed - b.usedCount)}
                                </span>
                              ))}
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-3">
                            <div className="flex items-center justify-center gap-1">
                              {/* Digital Card */}
                              <button
                                onClick={() => setViewingCardMember(member)}
                                className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-lime-400 border border-white/10 hover:border-lime-400 transition-colors"
                                title="عرض كارت العضوية"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              {/* Edit */}
                              <button
                                onClick={() => {
                                  setEditingMember(member);
                                  setIsAddEditModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white border border-white/10 hover:border-lime-400 transition-colors"
                                title="تعديل المشترك"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>

                              {/* Reset Password */}
                              <button
                                onClick={() => handleResetPassword(member.id, member.phone, member.name)}
                                className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-yellow-400 border border-white/10 hover:border-yellow-400 transition-colors"
                                title="إعادة تعيين كلمة المرور لرقم الهاتف"
                              >
                                <Lock className="w-3.5 h-3.5" />
                              </button>

                              {/* Freeze/Unfreeze */}
                              <button
                                onClick={() => handleToggleFreeze(member)}
                                className="px-2 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-white/10 text-[10px] font-bold"
                                title={member.status === 'frozen' ? 'إلغاء التجميد' : 'تجميد الاشتراك'}
                              >
                                {member.status === 'frozen' ? 'تنشيط' : 'تجميد'}
                              </button>

                              {/* Delete */}
                              <button
                                onClick={() => handleDeleteMember(member.id, member.name)}
                                className="p-1.5 rounded-lg bg-zinc-900 hover:bg-red-500/20 text-red-400 border border-white/10 hover:border-red-500/40 transition-colors"
                                title="حذف نهائي"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: IN-HALL & ATTENDANCE LOG (Auto checkout 1.5h active) */}
      {activeTab === 'hall' && (
        <div className="space-y-5">
          {/* Live In-Hall Active Members */}
          <div className="bg-[#121212] border border-white/10 rounded-2xl p-4 sm:p-5 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-lime-400" />
                  <h3 className="text-sm font-black text-white">
                    المتواجدون في الصالة الآن (نسبة الإشغال: {occupancyPercent}%)
                  </h3>
                </div>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  النظام يقوم بتسجيل الخروج تلقائياً بعد مرور ساعة ونصف (90 دقيقة) لحفظ الدقة
                </p>
              </div>

              <button
                onClick={onOpenReceptionQR}
                className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-black text-xs font-black shadow-md shadow-lime-400/20 transition-all cursor-pointer"
              >
                <QrCode className="w-4 h-4" />
                <span>كيو ار الاستقبال</span>
              </button>
            </div>

            {currentInside.length === 0 ? (
              <div className="text-center py-10 text-zinc-500 text-xs font-bold bg-zinc-900/40 rounded-xl border border-white/5">
                الصالة هادئة حالياً - لا يوجد مشتركين مسجلين بالداخل
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {currentInside.map((att) => {
                  const checkInTime = new Date(att.checkInTime);
                  const elapsedMin = Math.round((Date.now() - checkInTime.getTime()) / (1000 * 60));
                  const currentMember = members.find((m) => m.id === att.memberId);

                  return (
                    <div
                      key={att.id}
                      className="p-4 rounded-2xl bg-zinc-900/80 border border-white/10 hover:border-lime-400 transition-all flex flex-col justify-between space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          {currentMember?.photoUrl ? (
                            <img
                              src={currentMember.photoUrl}
                              alt={att.memberName}
                              className="w-10 h-10 rounded-xl object-cover border border-lime-400/40 shrink-0"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-white/10 flex items-center justify-center text-lime-400 font-bold shrink-0">
                              <User className="w-5 h-5" />
                            </div>
                          )}
                          <div>
                            <div className="text-xs font-black text-white">{att.memberName}</div>
                            <div className="text-[10px] font-mono text-zinc-400" dir="ltr">
                              {att.memberPhone}
                            </div>
                          </div>
                        </div>

                        <span className="px-2 py-0.5 rounded-full bg-lime-400/20 text-lime-400 text-[9px] font-black border border-lime-400/30">
                          بالصالة
                        </span>
                      </div>

                      <div className="pt-2 border-t border-white/10 text-[11px] text-zinc-400 space-y-1">
                        <div className="flex items-center justify-between">
                          <span>وقت الدخول:</span>
                          <strong className="text-white font-mono" dir="ltr">
                            {checkInTime.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                          </strong>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>المدة المنقضية:</span>
                          <span className="text-lime-400 font-bold font-mono">{elapsedMin} دقيقة</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleCheckOutFromHall(att.id)}
                        className="w-full bg-zinc-900 hover:bg-red-500/20 text-red-400 border border-white/10 hover:border-red-500/30 text-xs font-black py-2 rounded-xl transition-all"
                      >
                        تسجيل خروج المشترك
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Full Attendance History */}
          <div className="bg-[#121212] border border-white/10 rounded-2xl p-4 shadow-xl overflow-hidden">
            <h3 className="text-xs font-black text-white mb-3 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-lime-400" />
              <span>سجل الحضور الأخير</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-black/60 text-zinc-400 font-black border-b border-white/10 text-[10px] uppercase">
                  <tr>
                    <th className="py-2.5 px-3">المشترك</th>
                    <th className="py-2.5 px-3">التاريخ</th>
                    <th className="py-2.5 px-3">وقت الدخول</th>
                    <th className="py-2.5 px-3">وقت الخروج</th>
                    <th className="py-2.5 px-3">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {attendanceList.slice(0, 10).map((att) => (
                    <tr key={att.id} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="py-2.5 px-3 font-bold text-white">{att.memberName}</td>
                      <td className="py-2.5 px-3 text-zinc-400 font-mono" dir="ltr">
                        {att.date}
                      </td>
                      <td className="py-2.5 px-3 text-zinc-300 font-mono" dir="ltr">
                        {new Date(att.checkInTime).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-2.5 px-3 text-zinc-400 font-mono" dir="ltr">
                        {att.checkOutTime
                          ? new Date(att.checkOutTime).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
                          : '—'}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            att.status === 'inside'
                              ? 'bg-lime-400/20 text-lime-400 border border-lime-400/30'
                              : 'bg-zinc-800 text-zinc-400'
                          }`}
                        >
                          {att.status === 'inside' ? 'داخل الصالة' : 'تم الخروج'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SERVICES & BENEFITS */}
      {activeTab === 'services' && (
        <div className="space-y-5">
          <div className="bg-[#121212] border border-white/10 rounded-2xl p-4 sm:p-5 shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-lime-400" />
              <h3 className="text-sm font-black text-white">
                تسجيل استهلاك جلسة لمشترك (سونا / حمام ملح / إن بادي)
              </h3>
            </div>

            <form onSubmit={handleConsumeService} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
              <div className="md:col-span-5">
                <label className="block text-xs font-bold text-zinc-300 mb-1">اختر المشترك</label>
                <select
                  required
                  value={selectedMemberForService?.id || ''}
                  onChange={(e) => {
                    const m = members.find((x) => x.id === e.target.value);
                    setSelectedMemberForService(m || null);
                    setSelectedServiceId('');
                  }}
                  className="w-full bg-zinc-900 border border-white/10 focus:border-lime-400 rounded-xl px-3.5 py-2.5 text-xs text-white font-bold"
                >
                  <option value="">-- اختر المشترك --</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.phone}) - {m.planName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-4">
                <label className="block text-xs font-bold text-zinc-300 mb-1">اختر الجلسة المطلوب خصمها</label>
                <select
                  required
                  disabled={!selectedMemberForService}
                  value={selectedServiceId}
                  onChange={(e) => setSelectedServiceId(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/10 focus:border-lime-400 rounded-xl px-3.5 py-2.5 text-xs text-white font-bold disabled:opacity-50"
                >
                  <option value="">-- اختر الخدمة --</option>
                  {selectedMemberForService?.benefits?.map((b) => {
                    const remaining = Math.max(0, b.totalAllowed - b.usedCount);
                    return (
                      <option key={b.serviceId} value={b.serviceId} disabled={remaining <= 0}>
                        {b.name} (المتبقي: {remaining} من {b.totalAllowed})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="md:col-span-3">
                <button
                  type="submit"
                  disabled={!selectedMemberForService || !selectedServiceId}
                  className="w-full bg-lime-400 hover:bg-lime-300 text-black font-black py-2.5 px-4 rounded-xl text-xs shadow-md shadow-lime-400/20 disabled:opacity-40 transition-all cursor-pointer"
                >
                  خصم وتأكيد الجلسة ⚡
                </button>
              </div>
            </form>
          </div>

          {/* Standard services overview */}
          <div className="bg-[#121212] border border-white/10 rounded-2xl p-4 shadow-xl">
            <h3 className="text-xs font-black text-white mb-3">الخدمات المتاحة بالجيم</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {(settings.availableServices || []).map((srv) => (
                <div key={srv.id} className="p-3.5 rounded-xl bg-zinc-900/80 border border-white/5">
                  <div className="text-xs font-black text-lime-400">{srv.name}</div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">{srv.description}</div>
                  <div className="text-[10px] text-zinc-500 font-bold mt-2">
                    العدد الافتراضي: {srv.defaultCount} {srv.unit}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: GUEST INVITATIONS */}
      {activeTab === 'invites' && (
        <div className="space-y-5">
          <div className="bg-[#121212] border border-white/10 rounded-2xl p-4 sm:p-5 shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <Gift className="w-4 h-4 text-lime-400" />
              <h3 className="text-sm font-black text-white">تأكيد وقبول دعوة تجربة الجيم للضيف</h3>
            </div>

            <form onSubmit={handleRedeemInvite} className="flex flex-col sm:flex-row gap-2.5 max-w-md">
              <input
                type="text"
                required
                value={redeemCodeInput}
                onChange={(e) => setRedeemCodeInput(e.target.value)}
                placeholder="أدخل كود الدعوة (مثال: VIP-7429)"
                className="flex-1 bg-zinc-900 border border-white/10 focus:border-lime-400 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white font-mono font-bold"
              />
              <button
                type="submit"
                className="bg-lime-400 hover:bg-lime-300 text-black font-black px-4 py-2 rounded-xl text-xs shadow-md shadow-lime-400/20 transition-all cursor-pointer"
              >
                تفعيل ودخول الضيف
              </button>
            </form>

            {redeemMessage && (
              <div
                className={`mt-3 p-3 rounded-xl text-xs font-bold ${
                  redeemMessage.success
                    ? 'bg-lime-400/15 border border-lime-400/30 text-lime-400'
                    : 'bg-red-500/15 border border-red-500/30 text-red-400'
                }`}
              >
                {redeemMessage.message}
              </div>
            )}
          </div>

          {/* Invites list */}
          <div className="bg-[#121212] border border-white/10 rounded-2xl p-4 shadow-xl overflow-hidden">
            <h3 className="text-xs font-black text-white mb-3">جميع دعوات الأصدقاء الصادرة ({guestInvites.length})</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-black/60 text-zinc-400 font-black border-b border-white/10 text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">المشترك الداعي</th>
                    <th className="py-2.5 px-3">اسم الضيف</th>
                    <th className="py-2.5 px-3">رقم الهاتف</th>
                    <th className="py-2.5 px-3">كود الدعوة</th>
                    <th className="py-2.5 px-3">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {guestInvites.map((inv) => (
                    <tr key={inv.id} className="hover:bg-zinc-900/40">
                      <td className="py-2.5 px-3 font-bold text-white">{inv.memberName}</td>
                      <td className="py-2.5 px-3 font-bold text-lime-400">{inv.guestName}</td>
                      <td className="py-2.5 px-3 text-zinc-400 font-mono" dir="ltr">{inv.guestPhone}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-white">{inv.code}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            inv.status === 'used'
                              ? 'bg-lime-400/20 text-lime-400 border border-lime-400/30'
                              : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                          }`}
                        >
                          {inv.status === 'used' ? 'تم الدخول' : 'بانتظار الزيارة'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: SETTINGS */}
      {activeTab === 'settings' && (
        <div className="bg-[#121212] border border-white/10 rounded-2xl p-4 sm:p-6 shadow-xl max-w-3xl space-y-6">
          <div className="flex items-center gap-2 border-b border-white/10 pb-3">
            <Settings className="w-5 h-5 text-lime-400" />
            <div>
              <h3 className="text-base font-black text-white">إعدادات الجيم والشعار ونظام السعة</h3>
              <p className="text-xs text-zinc-400 font-bold">تخصيص هوية النادي الرياضي، رفع الشعار، وتعديل إعدادات التشغيل</p>
            </div>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-5">
            {settingsSavedMessage && (
              <div className="p-3 rounded-xl bg-lime-400/15 border border-lime-400/30 text-lime-400 text-xs font-black flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-lime-400" />
                <span>تم حفظ وتحديث إعدادات وشعار الجيم بنجاح!</span>
              </div>
            )}

            {/* Gym Logo Upload & Selection Section */}
            <div className="p-4 rounded-2xl bg-zinc-950 border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-lime-400" />
                    <span>شعار وهوية الجيم (Gym Logo)</span>
                  </h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    يمكنك رفع صورة شعار خاصة بناديك أو الاختيار من الأيقونات الرياضية الجاهزة
                  </p>
                </div>

                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={logoFileInputRef}
                  onChange={handleLogoUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>

              {/* Logo Preview and Actions */}
              <div className="flex flex-col sm:flex-row items-center gap-4 bg-zinc-900/60 p-3.5 rounded-xl border border-white/5">
                {/* Live Preview Display */}
                <div className="shrink-0 flex flex-col items-center gap-1.5">
                  <span className="text-[10px] font-bold text-zinc-400">معاينة الشعار:</span>
                  <div className="w-20 h-20 rounded-2xl bg-zinc-950 border-2 border-lime-400/40 p-2 flex items-center justify-center shadow-lg">
                    {gymLogo?.startsWith('http') || gymLogo?.startsWith('data:image') ? (
                      <img
                        src={gymLogo}
                        alt="Logo Preview"
                        className="w-full h-full object-contain rounded-xl"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="text-lime-400">
                        {gymLogo === 'flame' && <Flame className="w-10 h-10" />}
                        {gymLogo === 'trophy' && <Trophy className="w-10 h-10" />}
                        {gymLogo === 'crown' && <Crown className="w-10 h-10" />}
                        {gymLogo === 'shield' && <Shield className="w-10 h-10" />}
                        {gymLogo === 'zap' && <Zap className="w-10 h-10" />}
                        {(gymLogo === 'dumbbell' || !gymLogo) && <Dumbbell className="w-10 h-10" />}
                      </div>
                    )}
                  </div>
                </div>

                {/* Upload Buttons */}
                <div className="flex-1 space-y-2 w-full">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => logoFileInputRef.current?.click()}
                      className="px-3.5 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-black text-xs font-black shadow-md shadow-lime-400/20 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>رفع صورة الشعار من جهازك</span>
                    </button>

                    {(gymLogo?.startsWith('http') || gymLogo?.startsWith('data:image')) && (
                      <button
                        type="button"
                        onClick={() => setGymLogo('dumbbell')}
                        className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-bold transition-all border border-white/10 cursor-pointer"
                      >
                        حذف الصورة واستخدام أيقونة
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-zinc-500">
                    يدعم جميع صيغ الصور (PNG, JPG, WebP, SVG) بأعلى دقة وتجاوب.
                  </p>

                  {/* Preset Vector Icons */}
                  <div className="pt-2 border-t border-white/5">
                    <span className="text-[10px] font-bold text-zinc-400 block mb-1.5">
                      أو اختر أيقونة رياضية جاهزة:
                    </span>
                    <div className="flex items-center gap-2 flex-wrap">
                      {[
                        { id: 'dumbbell', label: 'دمبل', Icon: Dumbbell },
                        { id: 'flame', label: 'شعلة', Icon: Flame },
                        { id: 'trophy', label: 'كأس', Icon: Trophy },
                        { id: 'crown', label: 'تاج VIP', Icon: Crown },
                        { id: 'shield', label: 'درع', Icon: Shield },
                        { id: 'zap', label: 'طاقة', Icon: Zap },
                      ].map((item) => {
                        const isSelected = gymLogo === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setGymLogo(item.id)}
                            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-lime-400 text-black font-black shadow-sm'
                                : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700'
                            }`}
                          >
                            <item.Icon className="w-3.5 h-3.5" />
                            <span>{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Gym Info Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">اسم الجيم</label>
                <input
                  type="text"
                  required
                  value={gymName}
                  onChange={(e) => setGymName(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/10 focus:border-lime-400 rounded-xl px-3.5 py-2.5 text-xs text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">الشعار اللفظي (Tagline)</label>
                <input
                  type="text"
                  value={gymTagline}
                  onChange={(e) => setGymTagline(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/10 focus:border-lime-400 rounded-xl px-3.5 py-2.5 text-xs text-white font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  السعة القصوى للصالة (لحساب نسبة الإشغال %)
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={maxCapacity}
                  onChange={(e) => setMaxCapacity(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-white/10 focus:border-lime-400 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  الدعوات المجانية الافتراضية لكل مشترك
                </label>
                <input
                  type="number"
                  min="0"
                  value={defaultGuestInvites}
                  onChange={(e) => setDefaultGuestInvites(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-white/10 focus:border-lime-400 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">رقم هاتف الجيم / الاستقبال</label>
                <input
                  type="tel"
                  dir="ltr"
                  value={gymPhone}
                  onChange={(e) => setGymPhone(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/10 focus:border-lime-400 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono font-bold text-right"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">العنوان / الفرع</label>
                <input
                  type="text"
                  value={gymAddress}
                  onChange={(e) => setGymAddress(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/10 focus:border-lime-400 rounded-xl px-3.5 py-2.5 text-xs text-white font-bold"
                />
              </div>
            </div>

            {/* Change Admin Password */}
            <div className="pt-3 border-t border-white/10">
              <label className="block text-xs font-bold text-zinc-300 mb-1">
                تغيير كلمة مرور الإدارة (Admin Password)
              </label>
              <input
                type="password"
                value={adminPasswordInput}
                onChange={(e) => setAdminPasswordInput(e.target.value)}
                placeholder="اتركه فارغاً إذا لم ترغب في التغيير"
                className="w-full bg-zinc-900 border border-white/10 focus:border-lime-400 rounded-xl px-3.5 py-2.5 text-xs text-white font-bold"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="bg-lime-400 hover:bg-lime-300 text-black font-black px-6 py-2.5 rounded-xl text-xs shadow-md shadow-lime-400/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>حفظ جميع الإعدادات والشعار</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modals */}
      <AddEditMemberModal
        isOpen={isAddEditModalOpen}
        onClose={() => {
          setIsAddEditModalOpen(false);
          setEditingMember(null);
        }}
        onSave={handleSaveMember}
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

      {/* Notifications Modal for Expired/Expiring Subscriptions */}
      <AdminNotificationsModal
        isOpen={isNotificationsModalOpen}
        onClose={() => setIsNotificationsModalOpen(false)}
        members={members}
        settings={settings}
        onEditMember={(m) => {
          setEditingMember(m);
          setIsAddEditModalOpen(true);
        }}
        onViewCard={(m) => setViewingCardMember(m)}
      />
    </div>
  );
};
