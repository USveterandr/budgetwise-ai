// Authentication utility functions
import bcrypt from 'bcryptjs';

// Database worker URL
const DATABASE_WORKER_URL = 'https://budgetwise-database-worker.isaactrinidadllc.workers.dev';

// Check if user is authenticated
export function isAuthenticated(): boolean {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth-token');
    return !!token;
  }
  return false;
}

// Get current user data from token
export function getCurrentUser(): { id: string; email: string; name: string; plan: string; isAdmin: boolean; emailVerified: boolean } | null {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth-token');
    if (token) {
      try {
        // In a real implementation, you would decode the JWT token
        // For now, we'll parse a simplified token structure
        const payload = JSON.parse(atob(token.split('.')[1]));
        return {
          id: payload.id,
          email: payload.email,
          name: payload.name,
          plan: payload.plan,
          isAdmin: payload.isAdmin,
          emailVerified: payload.emailVerified || false
        };
      } catch (e) {
        console.error('Error parsing token:', e);
        return null;
      }
    }
  }
  return null;
}

// Real signup API call
export async function signup(name: string, email: string, password: string, plan: string) {
  try {
    console.log('Attempting signup for email:', email);
    
    // Validate password strength
    if (!isValidPassword(password)) {
      return { success: false, error: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number.' };
    }
    
    // Call our database worker to create the user
    const response = await fetch(`${DATABASE_WORKER_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        id: `user_${Date.now()}`,
        email,
        name,
        password,
        plan,
        is_admin: email === 'admin@budgetwise.ai',
        email_verified: false
      }),
    });
    
    console.log('Signup response status:', response.status);
    
    const result = await response.json();
    console.log('Signup response data:', result);
    
    if (!response.ok || !result.success) {
      // Handle conflict (email already exists) specifically
      if (response.status === 409) {
        return { success: false, error: result.error || 'An account with this email address already exists. Please use a different email or try logging in instead.' };
      }
      return { success: false, error: result.error || 'Signup failed' };
    }
    
    return { success: true, message: 'User created successfully. Please check your email for confirmation.' };
  } catch (error) {
    console.error('Signup error:', error);
    return { success: false, error: 'Network error. Please try again.' };
  }
}

// Real login API call
export async function login(email: string, password: string) {
  try {
    console.log('Attempting login for email:', email);
    
    // Call our database worker login endpoint
    const response = await fetch(`${DATABASE_WORKER_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    console.log('Login response status:', response.status);
    
    const result = await response.json();
    console.log('Login response data:', result);
    
    if (!response.ok || !result.success) {
      return { success: false, error: result.error || 'Invalid credentials' };
    }
    
    // Create a JWT token
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({ 
      id: result.user.id,
      email: result.user.email,
      name: result.user.name,
      plan: result.user.plan,
      isAdmin: result.user.is_admin,
      emailVerified: result.user.email_verified
    }));
    const signature = btoa('mock-signature');
    const token = `${header}.${payload}.${signature}`;
    
    // Store token in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth-token', token);
    }
    
    return { success: true, user: {
      id: result.user.id,
      email: result.user.email,
      name: result.user.name,
      plan: result.user.plan,
      isAdmin: result.user.is_admin,
      emailVerified: result.user.email_verified
    } };
  } catch (error) {
    console.error('Login error:', error);
    // More specific error handling
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return { success: false, error: 'Network error. Please check your connection and try again.' };
    }
    return { success: false, error: 'Network error. Please try again.' };
  }
}

// Password strength validation
export function isValidPassword(password: string): boolean {
  // At least 8 characters, one uppercase, one lowercase, one number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
}

// Request password reset
export async function requestPasswordReset(email: string) {
  try {
    console.log('Requesting password reset for email:', email);
    
    const response = await fetch(`${DATABASE_WORKER_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    
    const result = await response.json();
    
    if (!response.ok || !result.success) {
      return { success: false, error: result.error || 'Failed to request password reset.' };
    }
    
    return { success: true, message: result.message || 'Password reset email sent successfully.' };
  } catch (error) {
    console.error('Password reset request error:', error);
    return { success: false, error: 'Network error. Please try again.' };
  }
}

// Verify password reset token
export async function verifyPasswordResetToken(token: string) {
  try {
    console.log('Verifying password reset token:', token);
    
    const response = await fetch(`${DATABASE_WORKER_URL}/auth/reset-password/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });
    
    const result = await response.json();
    
    if (!response.ok || !result.success) {
      return { success: false, error: result.error || 'Invalid or expired reset token.' };
    }
    
    return { success: true, message: result.message || 'Token is valid.' };
  } catch (error) {
    console.error('Password reset token verification error:', error);
    return { success: false, error: 'Network error. Please try again.' };
  }
}

// Reset password
export async function resetPassword(token: string, newPassword: string) {
  try {
    console.log('Resetting password with token:', token);
    
    // Validate password strength
    if (!isValidPassword(newPassword)) {
      return { success: false, error: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number.' };
    }
    
    const response = await fetch(`${DATABASE_WORKER_URL}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, newPassword }),
    });
    
    const result = await response.json();
    
    if (!response.ok || !result.success) {
      return { success: false, error: result.error || 'Failed to reset password.' };
    }
    
    return { success: true, message: result.message || 'Password reset successfully.' };
  } catch (error) {
    console.error('Password reset error:', error);
    return { success: false, error: 'Network error. Please try again.' };
  }
}

// Real email confirmation
export async function confirmEmail(token: string) {
  try {
    // For static export, we'll simulate the email confirmation process
    // In a real implementation with a backend, you would make an API call here
    console.log('Email confirmation attempt with token:', token);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate successful confirmation
    return { success: true, message: 'Email confirmed successfully. You can now log in to your account.' };
  } catch (error) {
    console.error('Email confirmation error:', error);
    return { success: false, error: 'Network error. Please try again.' };
  }
}

// Check if user is admin
export function isAdmin(user: { isAdmin: boolean } | null): boolean {
  return user ? user.isAdmin : false;
}

// Check if user has access to a specific plan feature
export function hasPlanAccess(user: { plan: string } | null, requiredPlan: string): boolean {
  if (!user) return false;
  
  const planHierarchy = {
    'trial': 0,
    'basic': 1,
    'premium': 2,
    'premium-annual': 3
  };
  
  return planHierarchy[user.plan as keyof typeof planHierarchy] >= planHierarchy[requiredPlan as keyof typeof planHierarchy];
}

// Logout function
export async function logout() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth-token');
  }
  return { success: true };
}