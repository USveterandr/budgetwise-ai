import { NextResponse } from 'next/server';

// API routes in static export should not have dynamic configuration
// They will be handled by the server at runtime

export async function GET(request: Request) {
  // For static export, we need to handle the URL parsing differently
  // In a real implementation, this would be handled by the server
  const url = new URL(request.url);
  const token = url.searchParams.get('token');
  
  if (!token) {
    return NextResponse.json(
      { error: 'Missing confirmation token' },
      { status: 400 }
    );
  }
  
  // In a real implementation, you would:
  // 1. Look up the token in your database
  // 2. Verify the token is valid and not expired
  // 3. Mark the user's email as verified
  // 4. Remove the confirmation token
  
  // For now, we'll simulate the process
  console.log(`Confirming email with token: ${token}`);
  
  // Simulate token validation
  // In a real app, you would check this against your database
  const isValidToken = token.startsWith('token_');
  
  if (!isValidToken) {
    return NextResponse.json(
      { error: 'Invalid or expired confirmation token' },
      { status: 400 }
    );
  }
  
  // Simulate updating user's email verification status
  // In a real app, you would update the user record in your database
  
  return NextResponse.json({
    success: true,
    message: 'Email confirmed successfully'
  });
}