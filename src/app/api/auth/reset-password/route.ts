import { NextResponse } from 'next/server';
import { verifyPasswordResetToken, resetPassword } from '@/lib/auth';

// Configure for static export
export const dynamic = 'force-static';
export const revalidate = 0;

export async function POST(request: Request) {
  try {
    const { token, newPassword } = await request.json();

    // Validate input
    if (!token || !newPassword) {
      return NextResponse.json(
        { error: 'Missing token or new password' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Verify token
    const tokenVerification = await verifyPasswordResetToken(token);
    if (!tokenVerification.success) {
      return NextResponse.json(
        { error: tokenVerification.error || 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Update password
    const passwordUpdate = await resetPassword(token, newPassword);
    if (!passwordUpdate.success) {
      return NextResponse.json(
        { error: passwordUpdate.error || 'Failed to update password' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}