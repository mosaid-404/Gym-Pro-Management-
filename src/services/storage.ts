import { GymSettings, Member, HallAttendance, GuestInvitation, AuthSession, GymServiceDefinition } from '../types';

const STORAGE_KEYS = {
  SETTINGS: 'gym_pro_settings_v1',
  MEMBERS: 'gym_pro_members_v1',
  ATTENDANCE: 'gym_pro_attendance_v1',
  GUEST_INVITES: 'gym_pro_guest_invites_v1',
  AUTH_SESSION: 'gym_pro_auth_session_v1',
  ADMIN_PASSWORD: 'gym_pro_admin_password_v1',
};

const DEFAULT_SERVICES: GymServiceDefinition[] = [
  {
    id: 'inbody',
    name: 'فحص إن بادي (InBody)',
    nameEn: 'InBody Scan',
    icon: 'Activity',
    defaultCount: 2,
    unit: 'فحص',
    description: 'تحليل مكونات الجسم والدهون والعضلات بدقة',
  },
  {
    id: 'sauna',
    name: 'جلسات سونا (Sauna)',
    nameEn: 'Sauna Session',
    icon: 'Flame',
    defaultCount: 4,
    unit: 'جلسة',
    description: 'جلسات بخار وسونا للاسترخاء وتجديد النشاط',
  },
  {
    id: 'salt_bath',
    name: 'حمام ملح صخري (Salt Bath)',
    nameEn: 'Salt Bath',
    icon: 'Sparkles',
    defaultCount: 2,
    unit: 'جلسة',
    description: 'جلسات استشفاء عضلات بحمام الملح الطبيعي',
  },
  {
    id: 'massage',
    name: 'جلسة مساج استشفائي (Massage)',
    nameEn: 'Recovery Massage',
    icon: 'HeartHandshake',
    defaultCount: 1,
    unit: 'جلسة',
    description: 'مساج مخصص لفك العضلات وتخفيف الإجهاد',
  },
  {
    id: 'nutrition',
    name: 'استشارة تغذية ومتابعة (Nutrition)',
    nameEn: 'Nutrition Plan',
    icon: 'Apple',
    defaultCount: 1,
    unit: 'جلسة',
    description: 'جلسة استشارة مع أخصائي التغذية الرياضية',
  },
];

const DEFAULT_SETTINGS: GymSettings = {
  name: 'أوليمبوس جيم & فيتنس بارك',
  nameEn: 'Olympus Gym & Fitness Center',
  tagline: 'قوتك.. صحتك.. أسلوب حياتك',
  logo: 'dumbbell',
  phone: '01012345678',
  address: 'شارع النصر الرئيسي - برج الرياضة - الطابق الثاني',
  qrSecret: 'GYM_OLYMPUS_CHECKIN_KEY_2026',
  maxGuestInvitationsDefault: 2,
  maxHallCapacity: 50,
  currency: 'ج.م',
  availableServices: DEFAULT_SERVICES,
};

// Calculate dates helper
const today = new Date();
const formatDate = (date: Date) => date.toISOString().split('T')[0];

const addDays = (days: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + days);
  return formatDate(d);
};

const subDays = (days: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() - days);
  return formatDate(d);
};

const DEFAULT_MEMBERS: Member[] = [
  {
    id: 'mem_1',
    name: 'أحمد محمود القاضي',
    phone: '01099887766',
    password: '01099887766',
    gender: 'male',
    startDate: subDays(15),
    endDate: addDays(45), // 45 days left
    planName: 'اشتراك VIP 3 شهور',
    price: 1500,
    paidAmount: 1500,
    status: 'active',
    maxGuestInvites: 3,
    usedGuestInvites: 1,
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    benefits: [
      { serviceId: 'inbody', name: 'فحص إن بادي (InBody)', totalAllowed: 3, usedCount: 1 },
      { serviceId: 'sauna', name: 'جلسات سونا (Sauna)', totalAllowed: 6, usedCount: 2 },
      { serviceId: 'salt_bath', name: 'حمام ملح صخري (Salt Bath)', totalAllowed: 3, usedCount: 1 },
    ],
    createdAt: subDays(15),
    lastCheckIn: new Date(Date.now() - 35 * 60 * 1000).toISOString(), // 35 min ago
  },
  {
    id: 'mem_2',
    name: 'محمد إبراهيم حسان',
    phone: '01122334455',
    password: '01122334455',
    gender: 'male',
    startDate: subDays(25),
    endDate: addDays(5), // 5 days left (expiring soon)
    planName: 'اشتراك شهري شامل',
    price: 600,
    paidAmount: 600,
    status: 'active',
    maxGuestInvites: 2,
    usedGuestInvites: 0,
    benefits: [
      { serviceId: 'inbody', name: 'فحص إن بادي (InBody)', totalAllowed: 1, usedCount: 1 },
      { serviceId: 'sauna', name: 'جلسات سونا (Sauna)', totalAllowed: 4, usedCount: 3 },
      { serviceId: 'salt_bath', name: 'حمام ملح صخري (Salt Bath)', totalAllowed: 2, usedCount: 0 },
    ],
    createdAt: subDays(25),
    lastCheckIn: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
  },
  {
    id: 'mem_3',
    name: 'سارة خالد عبد الرحمن',
    phone: '01234567890',
    password: '01234567890',
    gender: 'female',
    startDate: subDays(5),
    endDate: addDays(85), // 85 days left
    planName: 'اشتراك ربع سنوي سيدات',
    price: 1600,
    paidAmount: 1600,
    status: 'active',
    maxGuestInvites: 2,
    usedGuestInvites: 0,
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    benefits: [
      { serviceId: 'inbody', name: 'فحص إن بادي (InBody)', totalAllowed: 3, usedCount: 0 },
      { serviceId: 'sauna', name: 'جلسات سونا (Sauna)', totalAllowed: 6, usedCount: 1 },
      { serviceId: 'salt_bath', name: 'حمام ملح صخري (Salt Bath)', totalAllowed: 4, usedCount: 1 },
    ],
    createdAt: subDays(5),
    lastCheckIn: new Date(Date.now() - 20 * 60 * 1000).toISOString(), // in gym
  },
  {
    id: 'mem_4',
    name: 'كريم عادل يوسف',
    phone: '01555544433',
    password: '01555544433',
    gender: 'male',
    startDate: subDays(60),
    endDate: subDays(2), // expired 2 days ago
    planName: 'اشتراك شهري عادي',
    price: 500,
    paidAmount: 500,
    status: 'expired',
    maxGuestInvites: 1,
    usedGuestInvites: 1,
    benefits: [
      { serviceId: 'inbody', name: 'فحص إن بادي (InBody)', totalAllowed: 1, usedCount: 1 },
      { serviceId: 'sauna', name: 'جلسات سونا (Sauna)', totalAllowed: 2, usedCount: 2 },
    ],
    createdAt: subDays(60),
  },
  {
    id: 'mem_5',
    name: 'عمر طارق النجار',
    phone: '01011224488',
    password: '01011224488',
    gender: 'male',
    startDate: subDays(1),
    endDate: addDays(29),
    planName: 'اشتراك شهري بلس',
    price: 700,
    paidAmount: 700,
    status: 'active',
    maxGuestInvites: 2,
    usedGuestInvites: 0,
    benefits: [
      { serviceId: 'inbody', name: 'فحص إن بادي (InBody)', totalAllowed: 2, usedCount: 0 },
      { serviceId: 'sauna', name: 'جلسات سونا (Sauna)', totalAllowed: 4, usedCount: 0 },
      { serviceId: 'salt_bath', name: 'حمام ملح صخري (Salt Bath)', totalAllowed: 2, usedCount: 0 },
    ],
    createdAt: subDays(1),
    lastCheckIn: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // in gym
  },
];

const DEFAULT_ATTENDANCE: HallAttendance[] = [
  {
    id: 'att_1',
    memberId: 'mem_1',
    memberName: 'أحمد محمود القاضي',
    memberPhone: '01099887766',
    checkInTime: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    method: 'qr_scanner',
    date: formatDate(today),
    status: 'inside',
  },
  {
    id: 'att_2',
    memberId: 'mem_3',
    memberName: 'سارة خالد عبد الرحمن',
    memberPhone: '01234567890',
    checkInTime: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    method: 'qr_scanner',
    date: formatDate(today),
    status: 'inside',
  },
  {
    id: 'att_3',
    memberId: 'mem_5',
    memberName: 'عمر طارق النجار',
    memberPhone: '01011224488',
    checkInTime: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    method: 'member_app',
    date: formatDate(today),
    status: 'inside',
  },
  {
    id: 'att_4',
    memberId: 'mem_2',
    memberName: 'محمد إبراهيم حسان',
    memberPhone: '01122334455',
    checkInTime: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
    checkOutTime: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    method: 'admin_manual',
    date: formatDate(today),
    status: 'checked_out',
  },
];

const DEFAULT_GUEST_INVITES: GuestInvitation[] = [
  {
    id: 'inv_1',
    memberId: 'mem_1',
    memberName: 'أحمد محمود القاضي',
    memberPhone: '01099887766',
    guestName: 'محمود عبد الرحيم',
    guestPhone: '01066778899',
    code: 'GUEST-7429',
    createdAt: subDays(2),
    status: 'used',
    usedAt: subDays(1),
  },
];

// Auto-checkout limit in milliseconds (1.5 hours = 90 minutes)
const AUTO_CHECKOUT_DURATION_MS = 90 * 60 * 1000;

// Helper to normalize arabic/hindi digits to standard english digits
export const normalizeDigits = (val: string = ''): string => {
  const arabicHindiDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  const easternPersianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  let res = val.trim();
  for (let i = 0; i < 10; i++) {
    res = res.replace(new RegExp(arabicHindiDigits[i], 'g'), String(i));
    res = res.replace(new RegExp(easternPersianDigits[i], 'g'), String(i));
  }
  return res;
};

export const normalizePhoneNumber = (phone: string = ''): string => {
  return normalizeDigits(phone).replace(/[\s\-\+\(\)]/g, '');
};

// Dispatch custom event to notify all components and tabs instantly
const notifyDataChanged = (key?: string) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('gym_data_changed', { detail: { key } }));
  }
};

export const storage = {
  // Settings
  getSettings(): GymSettings {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) {
      this.saveSettings(DEFAULT_SETTINGS);
      return DEFAULT_SETTINGS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_SETTINGS;
    }
  },
  saveSettings(settings: GymSettings) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    notifyDataChanged(STORAGE_KEYS.SETTINGS);
  },

  // Admin Password
  getAdminPassword(): string {
    return localStorage.getItem(STORAGE_KEYS.ADMIN_PASSWORD) || 'admin123';
  },
  saveAdminPassword(newPass: string) {
    localStorage.setItem(STORAGE_KEYS.ADMIN_PASSWORD, newPass.trim());
    notifyDataChanged(STORAGE_KEYS.ADMIN_PASSWORD);
  },

  // Members
  getMembers(): Member[] {
    const raw = localStorage.getItem(STORAGE_KEYS.MEMBERS);
    if (!raw) {
      this.saveMembers(DEFAULT_MEMBERS);
      return DEFAULT_MEMBERS;
    }
    try {
      const list = JSON.parse(raw) as Member[];
      const curDateStr = formatDate(new Date());
      let modified = false;
      const updated = list.map((m) => {
        if (m.status !== 'frozen') {
          if (m.endDate < curDateStr && m.status !== 'expired') {
            modified = true;
            return { ...m, status: 'expired' as const };
          } else if (m.endDate >= curDateStr && m.status === 'expired') {
            modified = true;
            return { ...m, status: 'active' as const };
          }
        }
        return m;
      });
      if (modified) {
        this.saveMembers(updated);
      }
      return updated;
    } catch {
      return DEFAULT_MEMBERS;
    }
  },
  saveMembers(members: Member[]) {
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
    notifyDataChanged(STORAGE_KEYS.MEMBERS);
  },
  addMember(memberData: Omit<Member, 'id' | 'password' | 'createdAt'>): Member {
    const members = this.getMembers();
    const cleanPhone = normalizePhoneNumber(memberData.phone);
    const newMember: Member = {
      ...memberData,
      phone: cleanPhone || memberData.phone.trim(),
      id: 'mem_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      password: cleanPhone || memberData.phone.trim(),
      createdAt: formatDate(new Date()),
    };
    members.unshift(newMember);
    this.saveMembers(members);
    return newMember;
  },
  updateMember(id: string, updates: Partial<Member>): Member | null {
    const members = this.getMembers();
    const idx = members.findIndex((m) => m.id === id);
    if (idx === -1) return null;

    const sanitizedUpdates = { ...updates };
    if (sanitizedUpdates.phone) {
      sanitizedUpdates.phone = normalizePhoneNumber(sanitizedUpdates.phone);
    }
    if (sanitizedUpdates.password) {
      sanitizedUpdates.password = normalizeDigits(sanitizedUpdates.password).trim();
    }

    members[idx] = { ...members[idx], ...sanitizedUpdates };
    this.saveMembers(members);
    return members[idx];
  },
  deleteMember(id: string) {
    const members = this.getMembers().filter((m) => m.id !== id);
    this.saveMembers(members);
  },

  // Attendance with Automatic 1.5-hour Check-out
  getAttendance(): HallAttendance[] {
    const raw = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
    let list: HallAttendance[] = DEFAULT_ATTENDANCE;
    if (raw) {
      try {
        list = JSON.parse(raw);
      } catch {
        list = DEFAULT_ATTENDANCE;
      }
    }

    // Automatic Check-out check (if inside > 90 minutes)
    const nowTime = Date.now();
    let modified = false;

    const updated = list.map((record) => {
      if (record.status === 'inside') {
        const checkInMs = new Date(record.checkInTime).getTime();
        const elapsed = nowTime - checkInMs;
        if (elapsed >= AUTO_CHECKOUT_DURATION_MS) {
          modified = true;
          // Auto check-out at 90 minutes mark
          const autoOutDate = new Date(checkInMs + AUTO_CHECKOUT_DURATION_MS).toISOString();
          return {
            ...record,
            status: 'checked_out' as const,
            checkOutTime: autoOutDate,
          };
        }
      }
      return record;
    });

    if (modified) {
      this.saveAttendance(updated);
      return updated;
    }

    return list;
  },

  saveAttendance(list: HallAttendance[]) {
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(list));
    notifyDataChanged(STORAGE_KEYS.ATTENDANCE);
  },

  getCurrentInsideCount(): number {
    return this.getAttendance().filter((a) => a.status === 'inside').length;
  },

  getCurrentlyInsideMembers(): HallAttendance[] {
    return this.getAttendance().filter((a) => a.status === 'inside');
  },

  checkInMember(memberId: string, method: HallAttendance['method'] = 'qr_scanner'): { success: boolean; message: string; attendance?: HallAttendance } {
    const members = this.getMembers();
    const member = members.find((m) => m.id === memberId);
    if (!member) {
      return { success: false, message: 'المشترك غير موجود في السجلات' };
    }

    if (member.status === 'expired') {
      return { success: false, message: 'عذراً، اشتراك المشترك منتهي الصلاحية! يرجى التجديد أولاً.' };
    }

    if (member.status === 'frozen') {
      return { success: false, message: 'عذراً، هذا الاشتراك مجمد حالياً.' };
    }

    const attendance = this.getAttendance();
    const existing = attendance.find((a) => a.memberId === memberId && a.status === 'inside');
    if (existing) {
      return { success: true, message: `المشترك ${member.name} مسجل دخوله بالفعل بالصالة`, attendance: existing };
    }

    const now = new Date();
    const newRecord: HallAttendance = {
      id: 'att_' + Date.now(),
      memberId: member.id,
      memberName: member.name,
      memberPhone: member.phone,
      checkInTime: now.toISOString(),
      method,
      date: formatDate(now),
      status: 'inside',
    };

    attendance.unshift(newRecord);
    this.saveAttendance(attendance);

    this.updateMember(memberId, { lastCheckIn: now.toISOString() });

    return { success: true, message: `تم تسجيل حضور ${member.name} بنجاح! نورت الصالة 💪`, attendance: newRecord };
  },

  checkOutMember(attendanceId: string): boolean {
    const attendance = this.getAttendance();
    const idx = attendance.findIndex((a) => a.id === attendanceId);
    if (idx === -1) return false;
    attendance[idx] = {
      ...attendance[idx],
      checkOutTime: new Date().toISOString(),
      status: 'checked_out',
    };
    this.saveAttendance(attendance);
    return true;
  },

  checkOutByMemberId(memberId: string): boolean {
    const attendance = this.getAttendance();
    const idx = attendance.findIndex((a) => a.memberId === memberId && a.status === 'inside');
    if (idx === -1) return false;
    attendance[idx] = {
      ...attendance[idx],
      checkOutTime: new Date().toISOString(),
      status: 'checked_out',
    };
    this.saveAttendance(attendance);
    return true;
  },

  // Guest Invitations
  getGuestInvitations(): GuestInvitation[] {
    const raw = localStorage.getItem(STORAGE_KEYS.GUEST_INVITES);
    if (!raw) {
      this.saveGuestInvitations(DEFAULT_GUEST_INVITES);
      return DEFAULT_GUEST_INVITES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_GUEST_INVITES;
    }
  },
  saveGuestInvitations(list: GuestInvitation[]) {
    localStorage.setItem(STORAGE_KEYS.GUEST_INVITES, JSON.stringify(list));
    notifyDataChanged(STORAGE_KEYS.GUEST_INVITES);
  },
  createGuestInvite(memberId: string, guestName: string, guestPhone: string): { success: boolean; message: string; invite?: GuestInvitation } {
    const member = this.getMembers().find((m) => m.id === memberId);
    if (!member) return { success: false, message: 'المشترك غير موجود' };

    const used = member.usedGuestInvites || 0;
    const max = member.maxGuestInvites || 0;
    if (used >= max) {
      return { success: false, message: `لقد استهلكت كامل رصيدك من الدعوات المجانية (${max} دعوات)` };
    }

    const code = 'VIP-' + Math.floor(1000 + Math.random() * 9000);
    const newInvite: GuestInvitation = {
      id: 'inv_' + Date.now(),
      memberId: member.id,
      memberName: member.name,
      memberPhone: member.phone,
      guestName: guestName.trim(),
      guestPhone: guestPhone.trim(),
      code,
      createdAt: formatDate(new Date()),
      status: 'pending',
    };

    const invites = this.getGuestInvitations();
    invites.unshift(newInvite);
    this.saveGuestInvitations(invites);

    this.updateMember(memberId, { usedGuestInvites: used + 1 });

    return { success: true, message: 'تم إنشاء بطاقة دعوة الصديق بنجاح!', invite: newInvite };
  },
  redeemGuestInvite(code: string): { success: boolean; message: string; invite?: GuestInvitation } {
    const invites = this.getGuestInvitations();
    const idx = invites.findIndex((inv) => inv.code.toUpperCase() === code.trim().toUpperCase());
    if (idx === -1) {
      return { success: false, message: 'كود الدعوة غير صحيح أو غير موجود' };
    }
    const invite = invites[idx];
    if (invite.status === 'used') {
      return { success: false, message: `هذه الدعوة تم استخدامها مسبقاً في ${invite.usedAt}` };
    }
    if (invite.status === 'expired') {
      return { success: false, message: 'عذراً، هذه الدعوة منتهية الصلاحية' };
    }

    invites[idx] = {
      ...invite,
      status: 'used',
      usedAt: new Date().toLocaleString('ar-EG'),
    };
    this.saveGuestInvitations(invites);
    return { success: true, message: `تم تفعيل دعوة الضيف (${invite.guestName}) بنجاح! أهلاً به في الجيم.`, invite: invites[idx] };
  },

  // Auth Session
  getSavedSession(): AuthSession | null {
    const raw = localStorage.getItem(STORAGE_KEYS.AUTH_SESSION);
    if (!raw) return null;
    try {
      const session = JSON.parse(raw) as AuthSession;
      if (!session.rememberMe) return null;
      if (session.role === 'member' && session.member) {
        const freshMember = this.getMembers().find((m) => m.id === session.member!.id);
        if (freshMember) {
          session.member = freshMember;
        }
      }
      return session;
    } catch {
      return null;
    }
  },
  saveSession(session: AuthSession | null) {
    if (!session || !session.rememberMe) {
      localStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
    } else {
      localStorage.setItem(STORAGE_KEYS.AUTH_SESSION, JSON.stringify(session));
    }
  },

  resetToDefaults() {
    localStorage.clear();
    this.saveSettings(DEFAULT_SETTINGS);
    this.saveMembers(DEFAULT_MEMBERS);
    this.saveAttendance(DEFAULT_ATTENDANCE);
    this.saveGuestInvitations(DEFAULT_GUEST_INVITES);
  }
};
