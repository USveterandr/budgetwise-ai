import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

// Configure for static export
export const dynamic = 'force-static';
export const revalidate = 0;

// Mock notifications data (import from main route in real implementation)
const mockNotifications = [
  {
    id: 'notif_1',
    user_id: 'user_123',
    title: 'Budget Alert',
    message: 'You\'ve spent 80% of your Food budget this month.',
    type: 'warning',
    read: false,
    created_at: '2023-06-15T10:30:00Z',
    updated_at: '2023-06-15T10:30:00Z'
  },
  {
    id: 'notif_2',
    user_id: 'user_123',
    title: 'Success!',
    message: 'Your investment portfolio is up 2.3% this month.',
    type: 'success',
    read: true,
    created_at: '2023-06-14T14:15:00Z',
    updated_at: '2023-06-14T14:15:00Z'
  },
  {
    id: 'notif_3',
    user_id: 'user_123',
    title: 'Welcome!',
    message: 'Thanks for joining BudgetWise. Start by setting up your first budget.',
    type: 'info',
    read: false,
    created_at: '2023-06-10T09:00:00Z',
    updated_at: '2023-06-10T09:00:00Z'
  }
];

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { notificationIds } = body;

    // Validate required parameters
    if (!notificationIds || !Array.isArray(notificationIds)) {
      return NextResponse.json(
        { success: false, error: 'Notification IDs are required' },
        { status: 400 }
      );
    }

    // Mark notifications as read
    const updatedNotifications = mockNotifications.map(notification => {
      if (notification.user_id === user.id && notificationIds.includes(notification.id)) {
        return {
          ...notification,
          read: true,
          updated_at: new Date().toISOString()
        };
      }
      return notification;
    });

    // Update the mock data (in real implementation, this would update the database)
    // For now, we'll just update our local copy
    mockNotifications.length = 0;
    mockNotifications.push(...updatedNotifications);

    return NextResponse.json({ 
      success: true,
      message: `${notificationIds.length} notifications marked as read`
    });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to mark notifications as read' },
      { status: 500 }
    );
  }
}