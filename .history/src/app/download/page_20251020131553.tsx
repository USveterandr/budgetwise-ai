"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { DevicePhoneMobileIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";

export default function DownloadPage() {
  useEffect(() => {
    // Check if beforeinstallprompt event is supported
    if ('beforeinstallprompt' in window) {
      console.log("PWA installation supported");
    }
  }, []);

  const handleInstallClick = () => {
    // In a real implementation, you would trigger the installation prompt
    // For now, we'll just show an alert
    alert("In a real implementation, this would trigger the PWA installation prompt. For now, you can install this app by using your browser's menu and selecting 'Add to Home Screen'.");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Download BudgetWise AI</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Install our app on your mobile device for the best experience. Works offline, loads instantly, and feels like a native app.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* iOS Installation */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <div className="text-center mb-6">
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <DevicePhoneMobileIcon className="h-8 w-8 text-gray-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">iPhone / iPad</h2>
            </div>
            <ol className="space-y-4 mb-6">
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium mr-3">1</span>
                <span className="text-gray-600">Open this website in Safari</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium mr-3">2</span>
                <span className="text-gray-600">Tap the Share button</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium mr-3">3</span>
                <span className="text-gray-600">Select &quot;Add to Home Screen&quot;</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium mr-3">4</span>
                <span className="text-gray-600">Tap &quot;Add&quot;</span>
              </li>
            </ol>
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              <Link href="https://apps.apple.com/app/budgetwise-ai" className="w-full h-full flex items-center justify-center">
                <DevicePhoneMobileIcon className="h-5 w-5 mr-2" />
                App Store (Coming Soon)
              </Link>
            </Button>
          </div>

          {/* Android Installation */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <div className="text-center mb-6">
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <DevicePhoneMobileIcon className="h-8 w-8 text-gray-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Android</h2>
            </div>
            <ol className="space-y-4 mb-6">
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium mr-3">1</span>
                <span className="text-gray-600">Open this website in Chrome</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium mr-3">2</span>
                <span className="text-gray-600">Tap the menu button (three dots)</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium mr-3">3</span>
                <span className="text-gray-600">Select &quot;Install app&quot; or &quot;Add to Home screen&quot;</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium mr-3">4</span>
                <span className="text-gray-600">Tap &quot;Install&quot;</span>
              </li>
            </ol>
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleInstallClick}
            >
              <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
              Install App
            </Button>
          </div>
        </div>

        <div className="mt-12 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
          <h3 className="font-medium text-blue-700 mb-2">Having trouble installing?</h3>
          <p className="text-blue-600 text-sm">
            If you don&apos;t see the install option, make sure you&apos;re using the latest version of your browser. 
            Some browsers may require you to manually enable PWA installation in settings.
          </p>
        </div>
      </div>
    </div>
  );
}
