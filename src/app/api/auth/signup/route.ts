import { NextResponse } from 'next/server';
import { Database } from '@/lib/db';

// Configure for static export
export const dynamic = 'force-static';
export const revalidate = 0;

const db = new Database();

export async function POST(request: Request) {
  try {
    const { name, email, password, plan } = await request.json();

    // Validate input
    if (!name || !email || !password || !plan) {
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

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    const existingUser = await db.getUserByEmail(email);

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
    }

    const newUser = await db.createUser({
      name,
      email,
      password,
      plan,
      is_admin: false,
      email_verified: false,
      trial_ends_at: null,
    });

    if (!newUser) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'User created successfully. Please check your email for confirmation.',
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}