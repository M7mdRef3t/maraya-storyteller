export function uniqueNonEmpty(values) {
  if (!Array.isArray(values)) return [];

  const normalized = values
    .map((value) => {
      if (value === null || value === undefined) return '';
      return String(value).trim();
    })
    .filter(Boolean);

  return [...new Set(normalized)];
}

/**
 * Normalizes Arabic text by unifying similar characters and removing extra diacritics.
 * 
 * @param {string} text The text to normalize
 * @param {boolean} removeDiacritics Whether to remove all Tashkeel
 * @returns {string} Normalized text
 */
export function normalizeArabicText(text, removeDiacritics = true) {
  if (!text || typeof text !== 'string') return '';

  let normalized = text.trim();

  if (removeDiacritics) {
    // Remove Tashkeel (diacritics)
    // 064B to 0652 are Arabic diacritics
    normalized = normalized.replace(/[\u064B-\u0652]/g, '');
  }

  // Remove Tatweel (elongation)
  normalized = normalized.replace(/\u0640/g, '');

  // Unify Alef
  normalized = normalized.replace(/[أإآ]/g, 'ا');

  // Unify Yaa/Alef Maksura
  normalized = normalized.replace(/ى/g, 'ي');

  // Unify Ta Marbuta
  normalized = normalized.replace(/ة/g, 'ه');

  return normalized;
}
