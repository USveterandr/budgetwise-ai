import { NextResponse } from 'next/server';

// Configure for static export
export const dynamic = 'force-static';
export const revalidate = 0;

export async function POST(request: Request) {
  try {
    const { email, name, confirmationToken } = await request.json();

    // Validate input
    if (!email || !name || !confirmationToken) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // In Cloudflare Email Service, we would call the binding directly
    // But for the API route, we'll return success and let the worker handle it
    const confirmationUrl = `https://budgetwise-ai.pages.dev/auth/confirm-email?token=${confirmationToken}`;
    console.log('Confirmation URL for development/testing:', confirmationUrl);
    
    return NextResponse.json({
      success: true,
      message: 'User created successfully. Please check your email for confirmation.',
    });
  } catch (error) {
    console.error('Send confirmation email error:', error);
    return NextResponse.json(
      { error: 'Failed to send confirmation email' },
      { status: 500 }
    );
  }
}