import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { NotificationPreferences } from '@/types/notification';

// Configure for static export
export const dynamic = 'force-static';
export const revalidate = 0;

// Mock notification preferences data
const mockPreferences: Record<string, NotificationPreferences> = {
  'user_123': {
    user_id: 'user_123',
    email_notifications: true,
    in_app_notifications: true,
    budget_alerts: true,
    spending_alerts: true,
    investment_updates: true,
    newsletter: false,
    created_at: '2023-06-10T09:00:00Z',
    updated_at: '2023-06-10T09:00:00Z'
  }
};

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

    // Get user preferences or create default
    let preferences = mockPreferences[user.id];
    if (!preferences) {
      preferences = {
        user_id: user.id,
        email_notifications: true,
        in_app_notifications: true,
        budget_alerts: true,
        spending_alerts: true,
        investment_updates: true,
        newsletter: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      mockPreferences[user.id] = preferences;
    }

    return NextResponse.json({ 
      success: true,
      preferences
    });
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notification preferences' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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
    
    // Update preferences
    const updatedPreferences = {
      ...mockPreferences[user.id] || {
        user_id: user.id,
        email_notifications: true,
        in_app_notifications: true,
        budget_alerts: true,
        spending_alerts: true,
        investment_updates: true,
        newsletter: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      ...body,
      updated_at: new Date().toISOString()
    };

    mockPreferences[user.id] = updatedPreferences;

    return NextResponse.json({ 
      success: true,
      preferences: updatedPreferences
    });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update notification preferences' },
      { status: 500 }
    );
  }
}