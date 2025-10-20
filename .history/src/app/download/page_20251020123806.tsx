"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  DevicePhoneMobileIcon, 
  ArrowDownTrayIcon, 
  CheckCircleIcon,
  InformationCircleIcon
} from "@heroicons/react/24/outline";

export default function DownloadPage() {
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Detect mobile OS
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    
    if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
      setIsIOS(true);
    } else if (/android/i.test(userAgent)) {
      setIsAndroid(true);
    }
    
    // Handle PWA installation prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const installPWA = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the A2HS prompt');
        }
        setDeferredPrompt(null);
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12 pt-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Download BudgetWise AI</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get the full BudgetWise AI experience on your mobile device
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* iOS Installation */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-center mb-6">
              <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <DevicePhoneMobileIcon className="h-8 w-8 text-gray-700" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">iPhone / iPad</h2>
              <p className="text-gray-600">Install BudgetWise AI as an app on your iOS device</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="bg-blue-100 rounded-full w-6 h-6 flex items-center justify-center">
                    <span className="text-blue-800 text-xs font-bold">1</span>
                  </div>
                </div>
                <p className="ml-3 text-gray-700">
                  Open this page in Safari browser
                </p>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="bg-blue-100 rounded-full w-6 h-6 flex items-center justify-center">
                    <span className="text-blue-800 text-xs font-bold">2</span>
                  </div>
                </div>
                <p className="ml-3 text-gray-700">
                  Tap the Share button at the bottom of the screen
                </p>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="bg-blue-100 rounded-full w-6 h-6 flex items-center justify-center">
                    <span className="text-blue-800 text-xs font-bold">3</span>
                  </div>
                </div>
                <p className="ml-3 text-gray-700">
                  Scroll down and tap "Add to Home Screen"
                </p>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="bg-blue-100 rounded-full w-6 h-6 flex items-center justify-center">
                    <span className="text-blue-800 text-xs font-bold">4</span>
                  </div>
                </div>
                <p className="ml-3 text-gray-700">
                  Tap "Add" to confirm
                </p>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start">
                <InformationCircleIcon className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <p className="ml-2 text-sm text-blue-700">
                  The app will appear on your home screen and work like a native app
                </p>
              </div>
            </div>
          </div>

          {/* Android Installation */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-center mb-6">
              <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <DevicePhoneMobileIcon className="h-8 w-8 text-gray-700" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Android</h2>
              <p className="text-gray-600">Install BudgetWise AI as an app on your Android device</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="bg-blue-100 rounded-full w-6 h-6 flex items-center justify-center">
                    <span className="text-blue-800 text-xs font-bold">1</span>
                  </div>
                </div>
                <p className="ml-3 text-gray-700">
                  Open this page in Chrome browser
                </p>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="bg-blue-100 rounded-full w-6 h-6 flex items-center justify-center">
                    <span className="text-blue-800 text-xs font-bold">2</span>
                  </div>
                </div>
                <p className="ml-3 text-gray-700">
                  Tap the three dots menu in the top right corner
                </p>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="bg-blue-100 rounded-full w-6 h-6 flex items-center justify-center">
                    <span className="text-blue-800 text-xs font-bold">3</span>
                  </div>
                </div>
                <p className="ml-3 text-gray-700">
                  Tap "Install" or "Add to Home screen"
                </p>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="bg-blue-100 rounded-full w-6 h-6 flex items-center justify-center">
                    <span className="text-blue-800 text-xs font-bold">4</span>
                  </div>
                </div>
                <p className="ml-3 text-gray-700">
                  Tap "Install" to confirm
                </p>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start">
                <InformationCircleIcon className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <p className="ml-2 text-sm text-blue-700">
                  The app will appear on your home screen and work like a native app
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Direct Installation Button */}
        <div className="mt-12 text-center">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Install</h2>
            <p className="text-gray-600 mb-6">
              If your browser supports it, you can install the app directly
            </p>
            
            <Button 
              onClick={installPWA}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 text-lg"
              disabled={!deferredPrompt}
            >
              <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
              Install BudgetWise AI App
            </Button>
            
            {!deferredPrompt && (
              <p className="mt-4 text-sm text-gray-500">
                Installation option not available. Use the instructions above for your device.
              </p>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">App Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircleIcon className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Offline Access</h3>
              <p className="text-gray-600">
                Access your financial data even without an internet connection
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <DevicePhoneMobileIcon className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Native Experience</h3>
              <p className="text-gray-600">
                Works like a native app with full-screen experience
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <ArrowDownTrayIcon className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Easy Access</h3>
              <p className="text-gray-600">
                Launch directly from your home screen without opening a browser
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link href="/" className="text-blue-600 hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}