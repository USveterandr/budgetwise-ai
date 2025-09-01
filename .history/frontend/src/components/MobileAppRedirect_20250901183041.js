import React, { useState, useEffect } from 'react';
import { X, Download, Smartphone } from 'lucide-react';

const MobileAppRedirect = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detect mobile device
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
      setIsMobile(isMobileDevice);
      
      // Show banner only on mobile and if not dismissed
      const dismissed = localStorage.getItem('mobileAppBannerDismissed');
      if (isMobileDevice && !dismissed) {
        setShowBanner(true);
      }
    };

    checkMobile();
  }, []);

  const dismissBanner = () => {
    setShowBanner(false);
    localStorage.setItem('mobileAppBannerDismissed', 'true');
  };

  const handleDownload = (platform) => {
    // For now, these would link to app stores when apps are published
    if (platform === 'ios') {
      // window.open('https://apps.apple.com/app/budgetwise-ai', '_blank');
      alert('iOS app will be available soon on the App Store!');
    } else if (platform === 'android') {
      // window.open('https://play.google.com/store/apps/details?id=com.isaactrinidad.budgetwise', '_blank');
      alert('Android app will be available soon on Google Play Store!');
    }
  };

  if (!showBanner || !isMobile) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 shadow-lg">
      <div className="flex items-center justify-between max-w-md mx-auto">
        <div className="flex items-center space-x-3">
          <Smartphone className="h-6 w-6" />
          <div>
            <p className="font-semibold text-sm">Get the BudgetWise AI App</p>
            <p className="text-xs opacity-90">Better experience on mobile</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleDownload('ios')}
            className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded text-xs font-medium transition-colors"
          >
            iOS
          </button>
          <button
            onClick={() => handleDownload('android')}
            className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded text-xs font-medium transition-colors"
          >
            Android
          </button>
          <button
            onClick={dismissBanner}
            className="p-1 hover:bg-white/20 rounded transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileAppRedirect;