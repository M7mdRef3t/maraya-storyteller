import { STYLE_MAP } from './prompts/storyteller.js';

export function validateEmotion(emotion) {
  if (!emotion || typeof emotion !== 'string') {
    return 'hope';
  }
  const normalized = emotion.trim().toLowerCase();
  // Check if it exists in STYLE_MAP (the keys are lowercase)
  return Object.prototype.hasOwnProperty.call(STYLE_MAP, normalized) ? normalized : 'hope';
}

export function validateChoiceText(text) {
  if (!text || typeof text !== 'string') {
    return '';
  }
  // Trim
  let cleaned = text.trim();

  // Limit length to 200 chars
  if (cleaned.length > 200) {
    cleaned = cleaned.substring(0, 200);
  }

  // Remove control characters (ASCII 0-31 and 127) to prevent injection/log spoofing
  // Specifically \n, \r might be used to break prompt lines if not careful,
  // although JSON stringify handles them, better safe for "choice text".
  cleaned = cleaned.replace(/[\x00-\x1F\x7F]/g, '');

  return cleaned;
}

export function validateBase64(data) {
  if (!data || typeof data !== 'string') return false;

  const trimmed = data.trim();
  if (trimmed.length === 0) return false;

  // Basic Base64 regex
  // A-Z, a-z, 0-9, +, / and = for padding
  // Length should be multiple of 4
  if (trimmed.length % 4 !== 0) return false;

  return /^[A-Za-z0-9+/]*={0,2}$/.test(trimmed);
}
