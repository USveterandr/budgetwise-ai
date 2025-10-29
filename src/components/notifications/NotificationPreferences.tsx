"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { NotificationPreferences as NotificationPreferencesType } from "@/types/notification";

interface NotificationPreferencesProps {
  userId: string;
  onPreferencesChange?: () => void;
}

export default function NotificationPreferences({ 
  userId, 
  onPreferencesChange 
}: NotificationPreferencesProps) {
  const [preferences, setPreferences] = useState<NotificationPreferencesType>({
    user_id: userId,
    email_notifications: true,
    in_app_notifications: true,
    budget_alerts: true,
    spending_alerts: true,
    investment_updates: true,
    newsletter: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('auth-token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/notifications/preferences', {
        headers: getAuthHeaders()
      });
      
      const result = await response.json();
      
      if (result.success) {
        setPreferences(result.preferences);
      } else {
        setError(result.error || 'Failed to fetch notification preferences');
      }
    } catch (err) {
      setError('Failed to fetch notification preferences');
      console.error('Error fetching preferences:', err);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      
      const response = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(preferences)
      });
      
      const result = await response.json();
      
      if (result.success) {
        setPreferences(result.preferences);
        setSuccess('Preferences saved successfully');
        if (onPreferencesChange) {
          onPreferencesChange();
        }
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(result.error || 'Failed to save notification preferences');
      }
    } catch (err) {
      setError('Failed to save notification preferences');
      console.error('Error saving preferences:', err);
    } finally {
      setSaving(false);
    }
  };

  const handlePreferenceChange = (key: keyof NotificationPreferencesType, value: boolean) => {
    setPreferences({
      ...preferences,
      [key]: value,
      updated_at: new Date().toISOString()
    });
  };

  useEffect(() => {
    if (userId) {
      fetchPreferences();
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-700 text-sm">{success}</p>
          </div>
        )}
        
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Channels</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label htmlFor="email-notifications" className="text-sm font-medium text-gray-900">
                    Email Notifications
                  </label>
                  <p className="text-sm text-gray-500">
                    Receive notifications via email
                  </p>
                </div>
                <button
                  type="button"
                  className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                    preferences.email_notifications ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                  onClick={() => handlePreferenceChange('email_notifications', !preferences.email_notifications)}
                >
                  <span className="sr-only">Enable email notifications</span>
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      preferences.email_notifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label htmlFor="in-app-notifications" className="text-sm font-medium text-gray-900">
                    In-App Notifications
                  </label>
                  <p className="text-sm text-gray-500">
                    Show notifications within the app
                  </p>
                </div>
                <button
                  type="button"
                  className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                    preferences.in_app_notifications ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                  onClick={() => handlePreferenceChange('in_app_notifications', !preferences.in_app_notifications)}
                >
                  <span className="sr-only">Enable in-app notifications</span>
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      preferences.in_app_notifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Types</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label htmlFor="budget-alerts" className="text-sm font-medium text-gray-900">
                    Budget Alerts
                  </label>
                  <p className="text-sm text-gray-500">
                    Get notified when approaching budget limits
                  </p>
                </div>
                <button
                  type="button"
                  className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                    preferences.budget_alerts ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                  onClick={() => handlePreferenceChange('budget_alerts', !preferences.budget_alerts)}
                >
                  <span className="sr-only">Enable budget alerts</span>
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      preferences.budget_alerts ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label htmlFor="spending-alerts" className="text-sm font-medium text-gray-900">
                    Spending Alerts
                  </label>
                  <p className="text-sm text-gray-500">
                    Notifications for unusual spending patterns
                  </p>
                </div>
                <button
                  type="button"
                  className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                    preferences.spending_alerts ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                  onClick={() => handlePreferenceChange('spending_alerts', !preferences.spending_alerts)}
                >
                  <span className="sr-only">Enable spending alerts</span>
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      preferences.spending_alerts ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label htmlFor="investment-updates" className="text-sm font-medium text-gray-900">
                    Investment Updates
                  </label>
                  <p className="text-sm text-gray-500">
                    Updates on your investment portfolio
                  </p>
                </div>
                <button
                  type="button"
                  className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                    preferences.investment_updates ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                  onClick={() => handlePreferenceChange('investment_updates', !preferences.investment_updates)}
                >
                  <span className="sr-only">Enable investment updates</span>
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      preferences.investment_updates ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label htmlFor="newsletter" className="text-sm font-medium text-gray-900">
                    Newsletter
                  </label>
                  <p className="text-sm text-gray-500">
                    Receive our monthly financial newsletter
                  </p>
                </div>
                <button
                  type="button"
                  className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                    preferences.newsletter ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                  onClick={() => handlePreferenceChange('newsletter', !preferences.newsletter)}
                >
                  <span className="sr-only">Enable newsletter</span>
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      preferences.newsletter ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button 
              onClick={savePreferences}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {saving ? 'Saving...' : 'Save Preferences'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}