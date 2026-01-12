// XOR Cipher implementation
// Uses the secret key defined in .env (VITE_IP_KEY)

const SECRET_KEY = import.meta.env.VITE_IP_KEY || 'default-insecure-key';

export const revealIp = (encoded: string): string => {
  try {
    // 1. Base64 Decode
    const binaryString = atob(encoded);
    
    // 2. XOR Decrypt
    let result = '';
    for (let i = 0; i < binaryString.length; i++) {
      result += String.fromCharCode(binaryString.charCodeAt(i) ^ SECRET_KEY.charCodeAt(i % SECRET_KEY.length));
    }
    return result;
  } catch (e) {
    console.error("Failed to decrypt IP", e);
    return "";
  }
};

// This function is mainly for manual testing if needed, mostly handled by build script now.
export const hideIp = (plain: string): string => {
    let result = '';
    for (let i = 0; i < plain.length; i++) {
      result += String.fromCharCode(plain.charCodeAt(i) ^ SECRET_KEY.charCodeAt(i % SECRET_KEY.length));
    }
    return btoa(result);
};