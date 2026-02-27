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
