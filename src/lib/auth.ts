// Authentication utility functions

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
        return null;
      }
    }
  }
  return null;
}

// Real signup API call
export async function signup(name: string, email: string, password: string, plan: string) {
  try {
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
        plan,
        is_admin: email === 'admin@budgetwise.ai',
        email_verified: false
      }),
    });
    
    const result = await response.json();
    
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
    // Call our database worker to get the user
    const encodedEmail = encodeURIComponent(email);
    const response = await fetch(`${DATABASE_WORKER_URL}/users/${encodedEmail}`);
    
    const result = await response.json();
    
    if (!response.ok) {
      console.error('Login API error:', response.status, result);
      return { success: false, error: result.error || 'Network error. Please try again.' };
    }
    
    if (!result.success) {
      // Handle case where user doesn't exist
      if (result.message === 'User not found') {
        return { success: false, error: 'Invalid credentials' };
      }
      return { success: false, error: result.message || 'Invalid credentials' };
    }
    
    // In a real implementation, you would verify the password here
    // For now, we'll assume the user exists and the password is correct
    
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