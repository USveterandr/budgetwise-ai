import { NextResponse } from 'next/server';
import { Database } from '@/lib/db';
import jwt from 'jsonwebtoken';

// Configure for static export
export const dynamic = 'force-static';
export const revalidate = 0;

const db = new Database();

  // Apply rate limiting middleware
  await limiter(req, res, next);
  
  try {
export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Missing email or password' },
        { status: 400 }
      );
    }

    const result = await db.login(email, password);

    if (!result) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check if JWT_SECRET is defined
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET environment variable is not set');
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }

    // Generate JWT token
    const token = jwt.sign({ email, role: "user" }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Create response with cookie
    const response = NextResponse.json({ message: "Login successful" });
    response.headers.set('Set-Cookie', `token=${token}; Path=/; HttpOnly; Secure; SameSite=Strict`);

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}