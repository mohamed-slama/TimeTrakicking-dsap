/**
 * Generate a random password with specified length and character set
 * @param length Length of the password to generate
 * @returns A random password
 */
export function generatePassword(length: number = 10): string {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_-+=";
  let password = "";
  
  // Ensure at least one character from each character group
  password += getRandomChar("ABCDEFGHIJKLMNOPQRSTUVWXYZ"); // Capital letter
  password += getRandomChar("abcdefghijklmnopqrstuvwxyz"); // Lowercase letter
  password += getRandomChar("0123456789"); // Number
  password += getRandomChar("!@#$%^&*()_-+="); // Special character
  
  // Fill the rest of the password
  for (let i = password.length; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  
  // Shuffle the password characters
  return shuffleString(password);
}

/**
 * Get a random character from a string
 * @param characters String of characters to choose from
 * @returns A single random character
 */
function getRandomChar(characters: string): string {
  return characters.charAt(Math.floor(Math.random() * characters.length));
}

/**
 * Shuffle a string
 * @param str String to shuffle
 * @returns Shuffled string
 */
function shuffleString(str: string): string {
  const arr = str.split("");
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join("");
}