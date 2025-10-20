// Authentication utility functions

// Mock user data - in a real implementation, this would come from your database
const mockUsers = [
  { id: '1', email: 'admin@example.com', name: 'Admin User', plan: 'premium-annual', isAdmin: true },
  { id: '2', email: 'user@example.com', name: 'Regular User', plan: 'premium', isAdmin: false },
];

// Check if user is authenticated
export function isAuthenticated(): boolean {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth-token');
    return !!token;
  }
  return false;
}

// Get current user data
export function getCurrentUser(): { id: string; email: string; name: string; plan: string; isAdmin: boolean } | null {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth-token');
    if (token) {
      // In a real implementation, you would decode the JWT token
      // For demo purposes, we'll return the first user
      return mockUsers[0];
    }
  }
  return null;
}

// Mock function to simulate login
export async function login(email: string, password: string) {
  // In a real implementation, you would verify credentials against your database
  const user = mockUsers.find(u => u.email === email);
  
  if (user && password === 'password') { // Simple mock password check
    // In a real implementation, you would create a session or JWT token
    if (typeof window !== 'undefined') {
      // Store token in localStorage for demo purposes
      localStorage.setItem('auth-token', 'mock-jwt-token');
    }
    return { success: true, user };
  }
  
  return { success: false, error: 'Invalid credentials' };
}

// Mock function to simulate signup
export async function signup(name: string, email: string, password: string, plan: string) {
  // In a real implementation, you would create a new user in your database
  const existingUser = mockUsers.find(u => u.email === email);
  
  if (existingUser) {
    return { success: false, error: 'User already exists' };
  }
  
  const newUser = {
    id: String(mockUsers.length + 1),
    email,
    name,
    plan,
    isAdmin: email === 'admin@budgetwise.ai' // Special case for admin
  };
  
  // In a real implementation, you would save this to your database
  mockUsers.push(newUser);
  
  // Set auth token for the new user
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth-token', 'mock-jwt-token-' + newUser.id);
  }
  
  return { success: true, user: newUser };
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