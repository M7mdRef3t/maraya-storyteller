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

export function buildUiStrings(outputMode) {
  if (outputMode === 'judge_en') {
    return {
      readingSpace: 'Maraya is reading your space...',
      shapingStory: 'Maraya is taking shape...',
      nextScene: 'The next scene is taking shape...',
      storyComplete: 'You have reached the end of this journey. But mirrors never truly end...',
      startErrorPrefix: 'Failed to start story:',
      nextError: 'Failed to generate the next scene.',
    };
  }

  if (outputMode === 'ar_egyptian') {
    return {
      readingSpace: 'مرايا بتقرا المكان بتاعك...',
      shapingStory: 'مرايا بتتشكّل...',
      nextScene: 'المشهد اللي بعده بيتشكّل...',
      storyComplete: 'وصلت لنهاية الرحلة... بس المرايات عمرها ما بتخلص.',
      startErrorPrefix: 'القصة ما بدأتش:',
      nextError: 'ما قدرناش نكمّل المشهد اللي بعده.',
    };
  }

  return {
    readingSpace: 'المرايا تقرأ مكانك...',
    shapingStory: 'المرايا تتشكل...',
    nextScene: 'المشهد التالي يتشكل...',
    storyComplete: 'وصلتَ إلى نهاية هذه الرحلة. لكنّ المرايا لا تنتهي...',
    startErrorPrefix: 'فشل في بدء القصة:',
    nextError: 'فشل في إنشاء المشهد التالي.',
  };
}
