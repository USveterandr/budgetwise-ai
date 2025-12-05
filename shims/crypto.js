// Shim for expo-crypto to work in web environment
// This is a minimal implementation for web compatibility

let randomBytesImplementation;

if (typeof window !== 'undefined' && window.crypto) {
  // Browser environment
  randomBytesImplementation = (length) => {
    const array = new Uint8Array(length);
    window.crypto.getRandomValues(array);
    return array;
  };
} else if (typeof global !== 'undefined' && global.crypto) {
  // Node.js environment
  randomBytesImplementation = (length) => {
    const array = new Uint8Array(length);
    global.crypto.getRandomValues(array);
    return array;
  };
} else {
  // Fallback
  randomBytesImplementation = (length) => {
    const array = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
    return array;
  };
}

export const getRandomBytesAsync = async (length) => {
  return Promise.resolve(randomBytesImplementation(length));
};

export const digestStringAsync = async (algorithm, data) => {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await window.crypto.subtle.digest(algorithm.toUpperCase(), dataBuffer);
    return new Uint8Array(hashBuffer);
  } else if (typeof global !== 'undefined' && global.crypto && global.crypto.subtle) {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await global.crypto.subtle.digest(algorithm.toUpperCase(), dataBuffer);
    return new Uint8Array(hashBuffer);
  } else {
    // Simple fallback for SHA-256 (not cryptographically secure)
    if (algorithm === 'SHA256') {
      // This is a very basic implementation and should not be used in production
      // Just for demonstration purposes
      const hash = 'mock-sha256-hash-for-' + data;
      const encoder = new TextEncoder();
      return encoder.encode(hash);
    }
    throw new Error(`Algorithm ${algorithm} not supported in this environment`);
  }
};

export default {
  getRandomBytesAsync,
  digestStringAsync,
};