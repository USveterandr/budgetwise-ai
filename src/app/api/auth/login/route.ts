import { NextResponse } from 'next/server';

// Configure for static export
export const dynamic = 'force-static';
export const revalidate = 0;

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
    
    // In a real implementation, you would:
    // 1. Look up user by email
    // 2. Verify password hash
    // 3. Check if email is verified
    // 4. Generate JWT token
    
    // For now, we'll simulate the process
    console.log(`Login attempt for user: ${email}`);
    
    // Simulate user lookup and password verification
    // In a real app, you would check this against your database
    const userExists = true; // Simulate user exists
    const passwordValid = true; // Simulate valid password
    const emailVerified = true; // Simulate email verified
    
    if (!userExists) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    if (!passwordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    if (!emailVerified) {
      return NextResponse.json(
        { error: 'Please verify your email address before logging in' },
        { status: 401 }
      );
    }
    
    // Create a JWT token
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({ 
      id: `user_${Date.now()}`,
      email: email,
      name: email.split('@')[0],
      plan: 'basic',
      isAdmin: email === 'admin@budgetwise.ai',
      emailVerified: true
    }));
    const signature = btoa('mock-signature');
    const token = `${header}.${payload}.${signature}`;
    
    return NextResponse.json({
      success: true,
      token: token,
      user: {
        id: `user_${Date.now()}`,
        email: email,
        name: email.split('@')[0],
        plan: 'basic',
        isAdmin: email === 'admin@budgetwise.ai',
        emailVerified: true
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}