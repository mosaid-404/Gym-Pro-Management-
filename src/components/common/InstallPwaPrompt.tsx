import React, { useState, useEffect } from 'react';
import { Download, Share, PlusSquare, X, Check, Smartphone, Sparkles } from 'lucide-react';
import { GymSettings } from '../../types';
import { GymLogo } from './GymLogo';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

interface InstallPwaPromptProps {
  settings: GymSettings;
}

export const InstallPwaPrompt: React.FC<InstallPwaPromptProps> = ({ settings }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    return sessionStorage.getItem('pwa_banner_dismissed') === 'true';
  });
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [showIOSModal, setShowIOSModal] = useState<boolean>(false);
  const [installSuccess, setInstallSuccess] = useState<boolean>(false);

  useEffect(() => {
    // Check if already in standalone / PWA mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Detect iOS devices
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Listen for beforeinstallprompt (Chrome / Android / Edge)
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setInstallSuccess(true);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setInstallSuccess(true);
          setDeferredPrompt(null);
        }
      } catch (err) {
        console.error('PWA install prompt error:', err);
      }
    } else if (isIOS) {
      setShowIOSModal(true);
    } else {
      // Fallback: show instructions or prompt
      setShowIOSModal(true);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('pwa_banner_dismissed', 'true');
  };

  // Don't show if already installed or dismissed
  if (isInstalled || isDismissed) {
    return null;
  }

  return (
    <>
      {/* Floating Bottom PWA Banner */}
      <aside 
        aria-label="تثبيت التطبيق"
        className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300"
      >
        <div className="bg-zinc-950/95 backdrop-blur-xl border border-lime-400/40 p-3.5 sm:p-4 rounded-2xl shadow-2xl shadow-black/80 flex items-center justify-between gap-3 text-white">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 shrink-0">
              <GymLogo settings={settings} size="sm" showText={false} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs sm:text-sm font-black text-white truncate">
                  {settings.name || 'Gym Pro Management'}
                </h4>
                <span className="px-1.5 py-0.5 rounded-full bg-lime-400/20 text-lime-400 text-[9px] font-black uppercase tracking-wider">
                  App
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                ثبّت التطبيق على شاشتك الرئيسية لفتح فوري وسريع
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleInstallClick}
              className="px-3.5 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-black text-xs font-black shadow-lg shadow-lime-400/20 transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تثبيت</span>
            </button>

            <button
              onClick={handleDismiss}
              className="p-2 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title="إغلاق"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* iOS / Manual Add to Home Screen Instructions Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-white/10 rounded-3xl p-5 sm:p-6 max-w-sm w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-lime-400" />
                <h3 className="text-sm sm:text-base font-black text-white">
                  تثبيت تطبيق {settings.name}
                </h3>
              </div>
              <button
                onClick={() => setShowIOSModal(false)}
                className="p-1.5 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-zinc-300 space-y-3">
              <p className="text-zinc-400 leading-relaxed">
                لتثبيت التطبيق على هاتفك (iPhone أو iPad) واستخدامه مثل التطبيقات الأصلية بدون شريط المتصفح:
              </p>

              <div className="p-3 bg-zinc-900 rounded-2xl border border-white/5 space-y-2.5">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-lime-400 text-black text-xs font-black flex items-center justify-center shrink-0">
                    1
                  </span>
                  <p className="flex items-center gap-1.5">
                    اضغط على زر المشاركة <Share className="w-4 h-4 text-lime-400 inline" /> في أسفل متصفح Safari.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-lime-400 text-black text-xs font-black flex items-center justify-center shrink-0">
                    2
                  </span>
                  <p className="flex items-center gap-1.5">
                    اختر <PlusSquare className="w-4 h-4 text-lime-400 inline" /> <strong>"إضافة إلى الصفحة الرئيسية" (Add to Home Screen)</strong>.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-lime-400 text-black text-xs font-black flex items-center justify-center shrink-0">
                    3
                  </span>
                  <p>
                    اضغط على <strong>"إضافة" (Add)</strong> في أعلى الزاوية.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-lime-400/10 border border-lime-400/20 text-lime-400 text-[11px] font-bold">
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>سيظهر التطبيق فوراً على شاشة هاتفك الرئيسية كأيقونة مستقلة!</span>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full py-3 rounded-xl bg-lime-400 hover:bg-lime-300 text-black text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-lime-400/20 cursor-pointer"
            >
              فهمت ذلك
            </button>
          </div>
        </div>
      )}
    </>
  );
};
