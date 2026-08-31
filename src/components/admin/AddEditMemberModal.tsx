import React, { useState, useEffect, useRef } from 'react';
import { X, UserPlus, Save, Phone, Camera, Sparkles, Upload, Image as ImageIcon, Trash2 } from 'lucide-react';
import { Member, GymSettings, MemberBenefit } from '../../types';

interface AddEditMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (memberData: Omit<Member, 'id' | 'password' | 'createdAt'>, memberId?: string) => void;
  initialMember?: Member | null;
  settings: GymSettings;
}

export const AddEditMemberModal: React.FC<AddEditMemberModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialMember,
  settings,
}) => {
  const isEditing = !!initialMember;
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const getTodayStr = () => new Date().toISOString().split('T')[0];
  const getFutureDateStr = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined);
  const [planName, setPlanName] = useState('اشتراك شهري شامل');
  const [durationPreset, setDurationPreset] = useState<'1m' | '3m' | '6m' | '1y' | 'custom'>('1m');
  const [startDate, setStartDate] = useState(getTodayStr());
  const [endDate, setEndDate] = useState(getFutureDateStr(30));
  const [price, setPrice] = useState(600);
  const [paidAmount, setPaidAmount] = useState(600);
  const [status, setStatus] = useState<'active' | 'expired' | 'frozen'>('active');
  const [maxGuestInvites, setMaxGuestInvites] = useState(settings.maxGuestInvitationsDefault || 2);
  const [notes, setNotes] = useState('');
  const [benefits, setBenefits] = useState<MemberBenefit[]>([]);

  useEffect(() => {
    if (initialMember) {
      setName(initialMember.name);
      setPhone(initialMember.phone);
      setGender(initialMember.gender || 'male');
      setPhotoUrl(initialMember.photoUrl || '');
      setPlanName(initialMember.planName);
      setStartDate(initialMember.startDate);
      setEndDate(initialMember.endDate);
      setPrice(initialMember.price);
      setPaidAmount(initialMember.paidAmount);
      setStatus(initialMember.status);
      setMaxGuestInvites(initialMember.maxGuestInvites ?? 2);
      setNotes(initialMember.notes || '');
      setBenefits(initialMember.benefits || []);
      setDurationPreset('custom');
    } else {
      setName('');
      setPhone('');
      setGender('male');
      setPhotoUrl('');
      setPlanName('اشتراك شهري شامل');
      setStartDate(getTodayStr());
      setEndDate(getFutureDateStr(30));
      setPrice(600);
      setPaidAmount(600);
      setStatus('active');
      setMaxGuestInvites(settings.maxGuestInvitationsDefault || 2);
      setNotes('');
      setDurationPreset('1m');

      const initBenefits: MemberBenefit[] = (settings.availableServices || []).map((s) => ({
        serviceId: s.id,
        name: s.name,
        totalAllowed: s.defaultCount,
        usedCount: 0,
      }));
      setBenefits(initBenefits);
    }
  }, [initialMember, isOpen, settings]);

  if (!isOpen) return null;

  const handleDurationPresetChange = (preset: '1m' | '3m' | '6m' | '1y' | 'custom') => {
    setDurationPreset(preset);
    const start = new Date(startDate || getTodayStr());
    let days = 30;
    let suggestedPrice = 600;

    if (preset === '1m') {
      days = 30;
      suggestedPrice = 600;
    } else if (preset === '3m') {
      days = 90;
      suggestedPrice = 1500;
    } else if (preset === '6m') {
      days = 180;
      suggestedPrice = 2700;
    } else if (preset === '1y') {
      days = 365;
      suggestedPrice = 4800;
    }

    if (preset !== 'custom') {
      const end = new Date(start);
      end.setDate(end.getDate() + days);
      setEndDate(end.toISOString().split('T')[0]);
      setPrice(suggestedPrice);
      setPaidAmount(suggestedPrice);
    }
  };

  const handleBenefitCountChange = (serviceId: string, count: number) => {
    setBenefits((prev) =>
      prev.map((b) => (b.serviceId === serviceId ? { ...b, totalAllowed: Math.max(0, count) } : b))
    );
  };

  // Image Upload handler
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('حجم الصورة كبير، يرجى اختيار صورة أقل من 2 ميجابايت.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setPhotoUrl(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    onSave(
      {
        name: name.trim(),
        phone: phone.trim(),
        gender,
        photoUrl: photoUrl?.trim() || undefined,
        planName,
        startDate,
        endDate,
        price: Number(price) || 0,
        paidAmount: Number(paidAmount) || 0,
        status,
        maxGuestInvites: Number(maxGuestInvites) || 0,
        usedGuestInvites: initialMember?.usedGuestInvites || 0,
        benefits,
        notes,
      },
      initialMember?.id
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0A0A0A]/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto font-sans text-white">
      <div className="bg-[#121212] border border-white/10 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-lime-400/10 text-lime-400 border border-lime-400/20">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black uppercase italic tracking-tight text-white">
                {isEditing ? 'تعديل بيانات المشترك' : 'إضافة مشترك جديد'}
              </h3>
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                {isEditing ? 'تحديث بيانات الاشتراك والمزايا' : 'اسم المستخدم وكلمة المرور الافتراضية = رقم الهاتف'}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Profile Picture & Personal Info */}
          <div className="space-y-4">
            <div className="text-xs font-black text-lime-400 uppercase tracking-wider">
              البيانات الشخصية والصورة (اختيارية)
            </div>

            {/* Photo Picker */}
            <div className="flex flex-col sm:flex-row items-center gap-4 bg-zinc-950 p-4 rounded-2xl border border-white/10">
              <div className="relative group shrink-0">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt="Preview"
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-lime-400 shadow-md"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-zinc-900 border-2 border-dashed border-zinc-700 flex flex-col items-center justify-center text-zinc-400">
                    <Camera className="w-6 h-6 text-zinc-500" />
                    <span className="text-[9px] font-bold mt-1">اختياري</span>
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageFileChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>

              <div className="flex-1 text-center sm:text-right space-y-1.5">
                <div className="text-xs font-bold text-white flex items-center justify-center sm:justify-start gap-2">
                  <span>الصورة الشخصية للمشترك</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-white/5">غير إجبارية</span>
                </div>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-black uppercase tracking-wider border border-white/10 hover:border-lime-400 transition-all flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5 text-lime-400" />
                    <span>{photoUrl ? 'تغيير الصورة' : 'رفع صورة شخصية'}</span>
                  </button>
                  {photoUrl && (
                    <button
                      type="button"
                      onClick={() => setPhotoUrl('')}
                      className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold transition-colors border border-red-500/20 flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>حذف</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-zinc-300 mb-1.5">
                  اسم المشترك بالكامل <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: أحمد محمود القاضي"
                  className="w-full bg-zinc-900 border border-white/10 focus:border-lime-400 focus:ring-1 focus:ring-lime-400 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-zinc-300 mb-1.5">
                  رقم الهاتف (الحساب والرمز السري) <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    dir="ltr"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01099887766"
                    className="w-full bg-zinc-900 border border-white/10 focus:border-lime-400 focus:ring-1 focus:ring-lime-400 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 text-right pl-9 font-bold font-mono"
                  />
                  <Phone className="w-4 h-4 text-zinc-400 absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-zinc-300 mb-1.5">النوع / الجنس</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setGender('male')}
                    className={`py-2 px-3 rounded-xl text-xs font-black uppercase tracking-wider border transition-all ${
                      gender === 'male'
                        ? 'bg-lime-400 text-black border-lime-400 shadow-sm shadow-lime-400/20'
                        : 'bg-zinc-900 text-zinc-400 border-white/10 hover:border-white/20'
                    }`}
                  >
                    ذكر 👨
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender('female')}
                    className={`py-2 px-3 rounded-xl text-xs font-black uppercase tracking-wider border transition-all ${
                      gender === 'female'
                        ? 'bg-lime-400 text-black border-lime-400 shadow-sm shadow-lime-400/20'
                        : 'bg-zinc-900 text-zinc-400 border-white/10 hover:border-white/20'
                    }`}
                  >
                    أنثى 👩
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-zinc-300 mb-1.5">حالة الاشتراك</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full bg-zinc-900 border border-white/10 focus:border-lime-400 rounded-xl px-3.5 py-2.5 text-sm text-white font-bold"
                >
                  <option value="active">نشط وساري (Active)</option>
                  <option value="frozen">مجمد مؤقتاً (Frozen)</option>
                  <option value="expired">منتهي الصلاحية (Expired)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Subscription Duration & Plan */}
          <div className="space-y-4 pt-4 border-t border-white/10">
            <div className="text-xs font-black text-lime-400 uppercase tracking-wider flex items-center justify-between">
              <span>تفاصيل الاشتراك والمدة</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-zinc-300 mb-1.5">اسم الباقة / الخطة</label>
                <input
                  type="text"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  placeholder="مثال: اشتراك شهري شامل، VIP..."
                  className="w-full bg-zinc-900 border border-white/10 focus:border-lime-400 rounded-xl px-3.5 py-2.5 text-sm text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-zinc-300 mb-1.5">المدة السريعة</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { id: '1m', label: 'شهر' },
                    { id: '3m', label: '3 شهور' },
                    { id: '6m', label: '6 شهور' },
                    { id: '1y', label: 'سنة' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleDurationPresetChange(p.id as any)}
                      className={`py-2 px-1 text-xs font-black uppercase tracking-wider rounded-xl border transition-all ${
                        durationPreset === p.id
                          ? 'bg-lime-400 text-black border-lime-400'
                          : 'bg-zinc-900 text-zinc-300 border-white/10 hover:border-white/20'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-zinc-300 mb-1.5">تاريخ البداية</label>
                <input
                  type="date"
                  dir="ltr"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setDurationPreset('custom');
                  }}
                  className="w-full bg-zinc-900 border border-white/10 focus:border-lime-400 rounded-xl px-3.5 py-2.5 text-sm text-white font-bold font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-zinc-300 mb-1.5">تاريخ النهاية</label>
                <input
                  type="date"
                  dir="ltr"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setDurationPreset('custom');
                  }}
                  className="w-full bg-zinc-900 border border-white/10 focus:border-lime-400 rounded-xl px-3.5 py-2.5 text-sm text-white font-bold font-mono"
                />
              </div>
            </div>

            {/* Price & Paid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-zinc-300 mb-1.5">
                  سعر الاشتراك ({settings.currency})
                </label>
                <input
                  type="number"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-white/10 focus:border-lime-400 rounded-xl px-3.5 py-2.5 text-sm text-white font-bold font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-zinc-300 mb-1.5">
                  المبلغ المدفوع ({settings.currency})
                </label>
                <input
                  type="number"
                  min="0"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-white/10 focus:border-lime-400 rounded-xl px-3.5 py-2.5 text-sm text-white font-bold font-mono"
                />
              </div>
            </div>
          </div>

          {/* Benefits & Extra Services */}
          <div className="space-y-4 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between">
              <div className="text-xs font-black text-lime-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>جلسات المزايا (سونا، حمام ملح، إن بادي...)</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(settings.availableServices || []).map((service) => {
                const curBenefit = benefits.find((b) => b.serviceId === service.id);
                const count = curBenefit ? curBenefit.totalAllowed : 0;
                const used = curBenefit ? curBenefit.usedCount : 0;

                return (
                  <div
                    key={service.id}
                    className="p-3 rounded-2xl bg-zinc-950 border border-white/10 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="text-xs font-bold text-white">{service.name}</div>
                      <div className="text-[10px] text-zinc-400 font-bold">
                        {isEditing && <span>مستخدم: {used} / </span>}
                        <span>الوحدة: {service.unit}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleBenefitCountChange(service.id, count - 1)}
                        className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-black flex items-center justify-center text-sm border border-white/5"
                      >
                        -
                      </button>
                      <span className="w-6 text-center font-black text-lime-400 text-sm font-mono">
                        {count}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleBenefitCountChange(service.id, count + 1)}
                        className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-black flex items-center justify-center text-sm border border-white/5"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-zinc-300 mb-1.5">ملاحظات إضافية</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="أي ملاحظات طبية أو خاصة..."
              className="w-full bg-zinc-900 border border-white/10 focus:border-lime-400 rounded-xl p-3 text-sm text-white placeholder-zinc-500 resize-none font-bold"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-black uppercase tracking-wider transition-colors border border-white/5"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-black text-xs font-black uppercase tracking-wider shadow-lg shadow-lime-400/20 transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{isEditing ? 'حفظ التعديلات' : 'إضافة المشترك'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
