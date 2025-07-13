/**
 * String utilities for text processing
 */

/**
 * Capitalizes the first letter of each word in a string
 * @param str - The string to capitalize
 * @returns The capitalized string
 */
export function capitalizeWords(str: string): string {
  if (!str || typeof str !== 'string') {
    return str;
  }

  return str
    .split(' ')
    .map(word => {
      if (word.length === 0) return word;
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}

/**
 * Capitalizes names, preserving certain patterns like "of", "the", etc.
 * @param name - The name to capitalize
 * @returns The properly capitalized name
 */
export function capitalizeName(name: string): string {
  if (!name || typeof name !== 'string') {
    return name;
  }

  // Words that should remain lowercase (unless they're the first word)
  const lowercaseWords = ['of', 'the', 'and', 'in', 'on', 'at', 'to', 'for', 'with', 'by'];

  return name
    .split(' ')
    .map((word, index) => {
      if (word.length === 0) return word;

      const lowerWord = word.toLowerCase();

      // First word is always capitalized
      if (index === 0) {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }

      // Keep certain words lowercase
      if (lowercaseWords.includes(lowerWord)) {
        return lowerWord;
      }

      // Capitalize other words
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}
