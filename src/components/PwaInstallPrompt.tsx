'use client';

import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    const onInstallable = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setShowBanner(true);
    };
    window.addEventListener('beforeinstallprompt', onInstallable);

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Ignore registration errors in unsupported environments.
      });
    }

    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
      window.removeEventListener('beforeinstallprompt', onInstallable);
    };
  }, []);

  async function installApp() {
    if (!deferredPrompt) {
      return;
    }
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  }

  return (
    <>
      {!isOnline && (
        <div className="fixed inset-x-0 top-[72px] z-40 mx-auto max-w-xl rounded-b-2xl border border-white/10 bg-[#361010]/95 px-4 py-2 text-center text-sm text-[#ffcbcb]">
          You are offline. Last loaded pages still work.
        </div>
      )}
      {showBanner && deferredPrompt && (
        <div className="fixed inset-x-0 bottom-[88px] z-40 mx-auto flex max-w-xl items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[rgba(8,10,16,0.96)] px-4 py-3 text-sm text-white shadow-[0_18px_48px_rgba(0,0,0,0.5)] lg:bottom-4">
          <div>
            <p className="font-medium">Install app</p>
            <p className="text-xs text-white/55">Add Momos to your home screen like an APK.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowBanner(false)}
              className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/65"
            >
              Later
            </button>
            <button type="button" onClick={() => void installApp()} className="btn-primary px-4 py-2 text-xs">
              Install
            </button>
          </div>
        </div>
      )}
    </>
  );
}
