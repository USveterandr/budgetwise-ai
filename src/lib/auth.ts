// Authentication utility functions

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
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password, plan }),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      return { success: false, error: result.error || 'Signup failed' };
    }
    
    return { success: true, message: result.message };
  } catch (error) {
    console.error('Signup error:', error);
    return { success: false, error: 'Network error. Please try again.' };
  }
}

// Real login API call
export async function login(email: string, password: string) {
  try {
    // In a real implementation, you would make an API call to your backend
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      return { success: false, error: result.error || 'Login failed' };
    }
    
    // Store token in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth-token', result.token);
    }
    
    return { success: true, user: result.user };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'Network error. Please try again.' };
  }
}

// Real email confirmation
export async function confirmEmail(token: string) {
  try {
    const response = await fetch(`/api/auth/confirm-email?token=${token}`);
    const result = await response.json();
    
    if (!response.ok) {
      return { success: false, error: result.error || 'Email confirmation failed' };
    }
    
    return { success: true, message: result.message };
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