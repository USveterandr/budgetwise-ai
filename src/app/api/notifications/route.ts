import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

// Configure for static export
export const dynamic = 'force-static';
export const revalidate = 0;

// Mock notifications data
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

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const user = getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Filter notifications for the current user
    const userNotifications = mockNotifications.filter(n => n.user_id === user.id);

    return NextResponse.json({ 
      success: true,
      notifications: userNotifications
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

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
    const { title, message, type } = body;

    // Validate required parameters
    if (!title || !message) {
      return NextResponse.json(
        { success: false, error: 'Title and message are required' },
        { status: 400 }
      );
    }

    // Create new notification
    const newNotification = {
      id: `notif_${Date.now()}`,
      user_id: user.id,
      title,
      message,
      type: type || 'info',
      read: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // In a real implementation, this would be stored in the database
    mockNotifications.push(newNotification);

    return NextResponse.json({ 
      success: true,
      notification: newNotification
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create notification' },
      { status: 500 }
    );
  }
}