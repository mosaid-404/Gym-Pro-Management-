export interface GymServiceDefinition {
  id: string;
  name: string;
  nameEn: string;
  icon: string;
  defaultCount: number;
  unit: string;
  description: string;
}

export interface MemberBenefit {
  serviceId: string;
  name: string;
  totalAllowed: number;
  usedCount: number;
}

export interface Member {
  id: string;
  name: string;
  phone: string;
  password: string;
  email?: string;
  gender: 'male' | 'female';
  nationalId?: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  planName: string;
  price: number;
  paidAmount: number;
  status: 'active' | 'expired' | 'frozen';
  benefits: MemberBenefit[];
  maxGuestInvites: number;
  usedGuestInvites: number;
  notes?: string;
  photoUrl?: string;
  createdAt: string;
  lastCheckIn?: string;
}

export interface HallAttendance {
  id: string;
  memberId: string;
  memberName: string;
  memberPhone: string;
  checkInTime: string; // ISO
  checkOutTime?: string; // ISO
  method: 'qr_scanner' | 'admin_manual' | 'member_app' | 'barcode';
  date: string; // YYYY-MM-DD
  status: 'inside' | 'checked_out';
}

export interface GuestInvitation {
  id: string;
  memberId: string;
  memberName: string;
  memberPhone: string;
  guestName: string;
  guestPhone: string;
  code: string;
  createdAt: string;
  status: 'pending' | 'used' | 'expired';
  usedAt?: string;
}

export interface GymSettings {
  name: string;
  nameEn: string;
  tagline: string;
  logo: string; // preset icon name or data-url
  phone: string;
  address: string;
  qrSecret: string;
  maxGuestInvitationsDefault: number;
  maxHallCapacity: number;
  currency: string;
  availableServices: GymServiceDefinition[];
}

export interface AuthSession {
  role: 'admin' | 'member';
  member?: Member;
  adminUsername?: string;
  rememberMe: boolean;
}
