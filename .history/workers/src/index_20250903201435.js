// TODO: Implement proper request handling for this worker
// This is a placeholder and needs actual worker logic.
// Consider what this worker is supposed to do (e.g., handle specific API routes, process data, etc.)

export default {
  async fetch(request, env, ctx) {
    // Example for S1126: Replace if-then-else flow by a single return statement
    const isAllowed = (request.method === 'GET' || request.method === 'HEAD');
    // Original if-else (for demonstration):
    // if (isAllowed) {
    //   return new Response('Allowed', { status: 200 });
    // } else {
    //   return new Response('Not Allowed', { status: 403 });
    // }
    // Refactored:
    return isAllowed
      ? new Response('Allowed', { status: 200 })
      : new Response('Not Allowed', { status: 403 });

    // Placeholder for actual worker logic
    // return new Response('Worker is running!', {
    //   headers: { 'Content-Type': 'text/plain' },
    // });
  },
};

// Example for S3776: Refactor this function to reduce its Cognitive Complexity
function complexUserDataValidator(user) {
  // This function has high cognitive complexity. Let's refactor it.
  if (!user) {
    return { isValid: false, reason: 'User object is missing.' };
  }
  if (!user.name) {
    return { isValid: false, reason: 'Name is missing.' };
  }
  if (typeof user.name !== 'string' || user.name.trim() === '') {
    return { isValid: false, reason: 'Name must be a non-empty string.' };
  }
  if (!user.email) {
    return { isValid: false, reason: 'Email is missing.' };
  }
  if (typeof user.email !== 'string' || !user.email.includes('@')) {
    return { isValid: false, reason: 'Email must be a valid string.' };
  }
  if (user.age && (typeof user.age !== 'number' || user.age < 0 || user.age > 120)) {
    return { isValid: false, reason: 'Age must be a valid number between 0 and 120.' };
  }
  if (!user.roles || !Array.isArray(user.roles) || user.roles.length === 0) {
    return { isValid: false, reason: 'User must have at least one role.' };
  }
  for (const role of user.roles) {
    if (typeof role !== 'string' || role.trim() === '') {
      return { isValid: false, reason: 'Each role must be a non-empty string.' };
    }
  }
  return { isValid: true };
}

// Refactored version of complexUserDataValidator
function validateUserData(user) {
  // Helper function for name validation
  const validateName = (name) => {
    if (!name) return 'Name is missing.';
    if (typeof name !== 'string' || name.trim() === '') return 'Name must be a non-empty string.';
    return null;
  };

  // Helper function for email validation
  const validateEmail = (email) => {
    if (!email) return 'Email is missing.';
    if (typeof email !== 'string' || !email.includes('@')) return 'Email must be a valid string.';
    return null;
  };

  // Helper function for age validation
  const validateAge = (age) => {
    if (age !== undefined) { // Age is optional
      if (typeof age !== 'number' || age < 0 || age > 120) {
        return 'Age must be a valid number between 0 and 120.';
      }
    }
    return null;
  };

  // Helper function for roles validation
  const validateRoles = (roles) => {
    if (!roles || !Array.isArray(roles) || roles.length === 0) {
      return 'User must have at least one role.';
    }
    for (const role of roles) {
      if (typeof role !== 'string' || role.trim() === '') {
        return 'Each role must be a non-empty string.';
      }
    }
    return null;
  };

  if (!user) return { isValid: false, reason: 'User object is missing.' };

  const nameError = validateName(user.name);
  if (nameError) return { isValid: false, reason: nameError };

  const emailError = validateEmail(user.email);
  if (emailError) return { isValid: false, reason: emailError };

  const ageError = validateAge(user.age);
  if (ageError) return { isValid: false, reason: ageError };

  const rolesError = validateRoles(user.roles);
  if (rolesError) return { isValid: false, reason: rolesError };

  return { isValid: true };
}

// Example usage:
// const testUser1 = { name: 'Alice', email: 'alice@example.com', age: 30, roles: ['user'] };
// console.log(validateUserData(testUser1)); // { isValid: true }

// const testUser2 = { name: '', email: 'bob@example.com' };
// console.log(validateUserData(testUser2)); // { isValid: false, reason: 'Name must be a non-empty string.' }
