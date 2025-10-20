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

// Simulate login API call
export async function login(email: string, password: string) {
  // In a real implementation, you would make an API call to your backend
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // For demo purposes, we'll create a mock response
    // In a real app, this would come from your backend API
    const user = {
      id: '1',
      email,
      name: email.split('@')[0],
      plan: 'basic',
      isAdmin: email === 'admin@budgetwise.ai',
      emailVerified: true
    };
    
    // Create a mock JWT token
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({ 
      id: user.id,
      email: user.email,
      name: user.name,
      plan: user.plan,
      isAdmin: user.isAdmin,
      emailVerified: user.emailVerified
    }));
    const signature = btoa('mock-signature');
    const token = `${header}.${payload}.${signature}`;
    
    // Store token in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth-token', token);
    }
    
    return { success: true, user };
  } catch (error) {
    return { success: false, error: 'Invalid credentials' };
  }
}

// Simulate signup API call
export async function signup(name: string, email: string, password: string, plan: string) {
  // In a real implementation, you would make an API call to your backend
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check if user already exists (mock implementation)
    // In a real app, this would be handled by your backend
    const existingUser = false; // Mock value
    
    if (existingUser) {
      return { success: false, error: 'User already exists' };
    }
    
    // Create new user
    const newUser = {
      id: String(Date.now()), // Mock ID generation
      email,
      name,
      plan,
      isAdmin: email === 'admin@budgetwise.ai',
      emailVerified: false // Email not verified yet
    };
    
    // Create a mock JWT token
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({ 
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      plan: newUser.plan,
      isAdmin: newUser.isAdmin,
      emailVerified: newUser.emailVerified
    }));
    const signature = btoa('mock-signature');
    const token = `${header}.${payload}.${signature}`;
    
    // Store token in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth-token', token);
    }
    
    // In a real implementation, you would send a confirmation email here
    console.log(`Confirmation email would be sent to ${email}`);
    
    return { success: true, user: newUser };
  } catch (error) {
    return { success: false, error: 'Signup failed' };
  }
}

// Simulate email confirmation
export async function confirmEmail(token: string) {
  // In a real implementation, you would make an API call to verify the email
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Get current user from token
    const user = getCurrentUser();
    if (!user) {
      return { success: false, error: 'Invalid token' };
    }
    
    // Update user's email verification status
    // In a real implementation, this would be handled by your backend
    const updatedUser = {
      ...user,
      emailVerified: true
    };
    
    // Create a new token with updated email verification status
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({ 
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      plan: updatedUser.plan,
      isAdmin: updatedUser.isAdmin,
      emailVerified: updatedUser.emailVerified
    }));
    const signature = btoa('mock-signature');
    const newToken = `${header}.${payload}.${signature}`;
    
    // Store updated token in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth-token', newToken);
    }
    
    return { success: true, user: updatedUser };
  } catch (error) {
    return { success: false, error: 'Email confirmation failed' };
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