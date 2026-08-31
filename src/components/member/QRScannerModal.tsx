import React, { useEffect, useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import confetti from 'canvas-confetti';
import { X, Camera, Sparkles, CheckCircle2, AlertCircle, RefreshCw, Zap, ShieldCheck } from 'lucide-react';
import { Member, GymSettings } from '../../types';
import { storage } from '../../services/storage';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member;
  settings: GymSettings;
  onCheckInComplete: () => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  member,
  settings,
  onCheckInComplete,
}) => {
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string } | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const qrScannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'qr-reader-container';

  useEffect(() => {
    if (!isOpen) {
      cleanupScanner();
      return;
    }

    setScanResult(null);
    setCameraError(null);
    setIsScanning(true);

    const timer = setTimeout(() => {
      startCamera();
    }, 300);

    return () => {
      clearTimeout(timer);
      cleanupScanner();
    };
  }, [isOpen]);

  const cleanupScanner = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current
        .stop()
        .then(() => qrScannerRef.current?.clear())
        .catch(() => {})
        .finally(() => {
          qrScannerRef.current = null;
          setIsScanning(false);
        });
    }
  };

  const handleScanSuccess = (decodedText: string) => {
    // Check if the decodedText matches the gym token or secret
    cleanupScanner();
    triggerCheckInProcess('qr_scanner');
  };

  const triggerCheckInProcess = (method: 'qr_scanner' | 'member_app' = 'qr_scanner') => {
    const res = storage.checkInMember(member.id, method);
    setScanResult(res);

    if (res.success) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
      onCheckInComplete();
    }
  };

  const startCamera = async () => {
    try {
      if (!document.getElementById(scannerContainerId)) return;
      const html5QrCode = new Html5Qrcode(scannerContainerId);
      qrScannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        handleScanSuccess,
        (errorMessage) => {
          // ignore background frame decoding misses
        }
      );
    } catch (err: any) {
      console.warn('Camera could not be started in this environment:', err);
      setCameraError('لم نتمكن من الوصول للكاميرا تلقائياً. يمكنك استخدام زر التسجيل المباشر أدناه.');
      setIsScanning(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#0A0A0A]/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto font-sans text-white">
      <div className="bg-[#121212] border border-white/10 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-zinc-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-lime-400/10 text-lime-400 border border-lime-400/20">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black uppercase italic tracking-tight text-white">مسح كيو ار الاستقبال والحضور</h3>
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">سجّل دخولك للصالة فور وصولك للجيم</p>
            </div>
          </div>
          <button
            onClick={() => {
              cleanupScanner();
              onClose();
            }}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col items-center">
          {/* Status Message */}
          {scanResult ? (
            <div
              className={`w-full p-4 rounded-2xl mb-5 text-center flex flex-col items-center gap-2 ${
                scanResult.success
                  ? 'bg-lime-400/15 border border-lime-400/30 text-lime-400'
                  : 'bg-red-500/15 border border-red-500/30 text-red-400'
              }`}
            >
              {scanResult.success ? (
                <CheckCircle2 className="w-10 h-10 text-lime-400 animate-bounce" />
              ) : (
                <AlertCircle className="w-10 h-10 text-red-400" />
              )}
              <div className="text-sm font-black uppercase tracking-wider">{scanResult.message}</div>
              <div className="text-xs font-bold text-zinc-300">
                {scanResult.success ? 'تم تحديث عدد المتواجدين بالصالة تلقائياً' : 'تأكد من سريان اشتراكك'}
              </div>
            </div>
          ) : (
            <>
              {/* Camera Scanner Viewport */}
              <div className="relative w-full max-w-[280px] h-[280px] rounded-3xl overflow-hidden bg-zinc-950 border-2 border-lime-400/40 shadow-inner flex items-center justify-center mb-4">
                <div id={scannerContainerId} className="w-full h-full" />

                {/* Overlay Scanning Guide Grid */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-48 h-48 border-2 border-lime-400/80 rounded-2xl relative animate-pulse">
                    <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-lime-400" />
                    <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-lime-400" />
                    <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-lime-400" />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-lime-400" />
                  </div>
                </div>
              </div>

              {cameraError && (
                <div className="text-xs font-bold text-lime-400/90 text-center mb-3 bg-lime-400/10 p-2.5 rounded-xl border border-lime-400/20">
                  {cameraError}
                </div>
              )}

              <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 text-center mb-4">
                وجّه كاميرا هاتفك نحو كيو ار الاستقبال المعروض على شاشة الجيم
              </p>
            </>
          )}

          {/* Direct 1-Tap Simulation / Fast Check-in */}
          <div className="w-full pt-4 border-t border-white/10 space-y-2">
            <button
              onClick={() => triggerCheckInProcess('member_app')}
              className="w-full bg-lime-400 hover:bg-lime-300 text-black font-black uppercase tracking-wider py-3 px-4 rounded-xl text-xs transition-all shadow-lg shadow-lime-400/20 flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4" />
              <span>تسجيل دخول مباشر بنقرة واحدة (تأكيد الحضور بالجيم)</span>
            </button>

            <button
              onClick={() => {
                cleanupScanner();
                onClose();
              }}
              className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-black uppercase tracking-wider transition-colors border border-white/5"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
