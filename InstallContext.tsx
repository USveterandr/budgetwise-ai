import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface InstallContextType {
  isInstalled: boolean;
  deferredPrompt: BeforeInstallPromptEvent | null;
  showInstallPrompt: () => void;
  hideInstallPrompt: () => void;
  showBanner: boolean;
  promptToInstall: () => Promise<void>;
  isIOS: boolean;
  dismissBanner: () => void;
}

const InstallContext = createContext<InstallContextType>({
  isInstalled: false,
  deferredPrompt: null,
  showInstallPrompt: () => {},
  hideInstallPrompt: () => {},
  showBanner: false,
  promptToInstall: async () => {},
  isIOS: false,
  dismissBanner: () => {},
});

export const useInstall = () => useContext(InstallContext);

const DISMISS_DURATION_DAYS = 7;

export const InstallProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    // Check if installed
    const checkInstalled = () => {
      if (
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true ||
        localStorage.getItem('budgetwise_installed') === 'true'
      ) {
        setIsInstalled(true);
        return true;
      }
      return false;
    };

    if (checkInstalled()) return;

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const _isIOS = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(_isIOS);

    // Initial check for dismissal
    const dismissedUntil = localStorage.getItem('install-prompt-dismissed-until');
    const isDismissed = dismissedUntil && Date.now() < parseInt(dismissedUntil, 10);

    // Handle beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Auto-show if not dismissed
      if (!isDismissed && !_isIOS) {
        setTimeout(() => setShowBanner(true), 3000);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    // Handle App Installed
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowBanner(false);
      setDeferredPrompt(null);
      localStorage.removeItem('install-prompt-dismissed-until');
    };
    window.addEventListener('appinstalled', handleAppInstalled);

    // iOS specific auto-show logic
    if (_isIOS && !isDismissed && !checkInstalled()) {
      setTimeout(() => setShowBanner(true), 3000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const showInstallPrompt = () => {
    setShowBanner(true);
  };

  const hideInstallPrompt = () => {
    setShowBanner(false);
  };

  const dismissBanner = () => {
    setShowBanner(false);
    const dismissUntil = Date.now() + (DISMISS_DURATION_DAYS * 24 * 60 * 60 * 1000);
    localStorage.setItem('install-prompt-dismissed-until', dismissUntil.toString());
  };

  const promptToInstall = async () => {
    if (isIOS) {
        // Just show the banner or instructions. 
        // We'll let the UI handle the "How to" display, usually via the banner.
        setShowBanner(true);
        return;
    }

    if (!deferredPrompt) {
        // If no prompt, user likely has done it or browser doesn't support it.
        // Or we are on desktop where it might not fire.
        alert('Install option not available. Check your browser address bar for an install icon.');
        return;
    }

    setShowBanner(false);
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
      localStorage.setItem('budgetwise_installed', 'true');
    }
    setDeferredPrompt(null);
  };

  return (
    <InstallContext.Provider value={{
      isInstalled,
      deferredPrompt,
      showInstallPrompt,
      hideInstallPrompt,
      showBanner,
      promptToInstall,
      isIOS,
      dismissBanner
    }}>
      {children}
    </InstallContext.Provider>
  );
};
