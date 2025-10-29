"use client";

import React, { useState, useEffect } from "react";
import { BellIcon } from "@heroicons/react/24/outline";
import { getCurrentUser } from "@/lib/auth-client";
import { Notification } from "@/types/notification";

interface NotificationBadgeProps {
  onClick: () => void;
}

export default function NotificationBadge({ onClick }: NotificationBadgeProps) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('auth-token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const fetchUnreadCount = async () => {
    try {
      const user = getCurrentUser();
      if (!user) return;
      
      setLoading(true);
      const response = await fetch('/api/notifications', {
        headers: getAuthHeaders()
      });
      
      const result = await response.json();
      
      if (result.success) {
        const unread = result.notifications.filter((n: Notification) => !n.read).length;
        setUnreadCount(unread);
      }
    } catch (err) {
      console.error('Error fetching unread count:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <button
      onClick={onClick}
      className="relative p-1 text-gray-500 hover:text-gray-700 focus:outline-none"
      aria-label="Notifications"
    >
      <BellIcon className="h-6 w-6" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
      {loading && (
        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-gray-300 text-xs text-white">
          <span className="animate-pulse">•</span>
        </span>
      )}
    </button>
  );
}