// Authentication utility functions

// Mock user data - in a real implementation, this would come from your database
const mockUsers = [
  { id: '1', email: 'admin@example.com', name: 'Admin User', plan: 'pro', isAdmin: true },
  { id: '2', email: 'user@example.com', name: 'Regular User', plan: 'premium', isAdmin: false },
];

// Mock function to simulate authentication check
export async function getCurrentUser(): Promise<{ id: string; email: string; name: string; plan: string; isAdmin: boolean } | null> {
  // In a real implementation, you would check the session/token here
  // For now, we'll return null to simulate no user being logged in
  return null;
}

// Mock function to simulate login
export async function login(email: string, password: string) {
  // In a real implementation, you would verify credentials against your database
  const user = mockUsers.find(u => u.email === email);
  
  if (user && password === 'password') { // Simple mock password check
    // In a real implementation, you would create a session or JWT token
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
    isAdmin: email === 'isaac-trinidad.work' // Special case for admin
  };
  
  // In a real implementation, you would save this to your database
  mockUsers.push(newUser);
  
  return { success: true, user: newUser };
}

// Check if user is admin
export async function isAdmin(user: { isAdmin: boolean } | null) {
  return user && user.isAdmin;
}

// Check if user has access to a specific plan feature
export function hasPlanAccess(user: { plan: string } | null, requiredPlan: string) {
  if (!user) return false;
  
  const planHierarchy = {
    'free': 1,
    'premium': 2,
    'pro': 3
  };
  
  return planHierarchy[user.plan as keyof typeof planHierarchy] >= planHierarchy[requiredPlan as keyof typeof planHierarchy];
}