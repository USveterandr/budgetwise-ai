"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import NotificationCenter from "@/components/notifications/NotificationCenter";
import NotificationPreferences from "@/components/notifications/NotificationPreferences";
import ProtectedRoute from "@/components/ProtectedRoute";
import { getCurrentUser } from "@/lib/auth-client";

interface User {
  id: string;
  email: string;
  name: string;
  plan: string;
  isAdmin: boolean;
  emailVerified: boolean;
}

export default function NotificationsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'notifications' | 'preferences'>('notifications');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const currentUser = getCurrentUser();
      setUser(currentUser);
    }
  }, []);

  const handlePreferencesChange = () => {
    // Refresh notifications when preferences change
  };

  if (!user) {
    return null;
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600">Manage your notifications and preferences</p>
          </div>

          {/* Tabs */}
          <div className="mb-6 border-b border-gray-200">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('notifications')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'notifications'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Notifications
              </button>
              <button
                onClick={() => setActiveTab('preferences')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'preferences'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Preferences
              </button>
            </nav>
          </div>

          {activeTab === 'notifications' ? (
            <NotificationCenter userId={user.id} />
          ) : (
            <NotificationPreferences 
              userId={user.id} 
              onPreferencesChange={handlePreferencesChange} 
            />
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}