/**
 * Shared Story Modes Configuration
 * Used by both client (UI labels) and server (Prompt generation).
 */

export const STORY_MODES_CONFIG = {
  judge_en: {
    id: 'judge_en',
    // UI Properties
    ui_language: 'en',
    label_en: 'Judge Mode (English)',
    label_ar: 'وضع التحكيم (إنجليزي)',
    // Server/Prompt Properties
    name: 'Judge Mode (English)',
    languageName: 'English',
    narrativeRules: [
      'Write in clear cinematic English with poetic clarity.',
      'Keep each narrative line compact: 2-3 sentences maximum.',
      'Avoid niche local references so judges can follow quickly.',
    ],
    choiceRules: [
      'Choices must be in English.',
      'Choice 1 should lean toward confrontation/exploration.',
      'Choice 2 should lean toward reflection/acceptance.',
    ],
    interleavedHint: 'Interleaved block text should be in English.',
  },
  ar_fusha: {
    id: 'ar_fusha',
    // UI Properties
    ui_language: 'ar',
    label_en: 'Arabic (Fusha)',
    label_ar: 'العربية الفصحى',
    // Server/Prompt Properties
    name: 'Arabic Fusha',
    languageName: 'Arabic Fusha',
    narrativeRules: [
      'اكتب بالعربية الفصحى الأدبية بلغة شاعرية واضحة.',
      'كل سطر سردي من جملتين إلى ثلاث فقط.',
      'استخدم استعارات معمارية دقيقة ومفهومة.',
    ],
    choiceRules: [
      'الاختيارات تكون بالعربية الفصحى.',
      'الاختيار الأول للمواجهة والاستكشاف.',
      'الاختيار الثاني للتأمل والتقبّل.',
    ],
    interleavedHint: 'نصوص interleaved تكون بالعربية الفصحى.',
  },
  ar_egyptian: {
    id: 'ar_egyptian',
    // UI Properties
    ui_language: 'ar',
    label_en: 'Egyptian Colloquial',
    label_ar: 'عامية مصرية',
    // Server/Prompt Properties
    name: 'Egyptian Colloquial Arabic',
    languageName: 'Egyptian Arabic',
    narrativeRules: [
      'اكتب بلهجة مصرية طبيعية مفهومة بدون ابتذال.',
      'حافظ على النبرة الشعرية لكن بصياغة مصرية قريبة.',
      'كل سطر سردي من جملتين إلى ثلاث فقط.',
    ],
    choiceRules: [
      'الاختيارات تكون بالعامية المصرية الواضحة.',
      'الاختيار الأول يميل للمواجهة والاكتشاف.',
      'الاختيار الثاني يميل للتأمل والهدوء.',
    ],
    interleavedHint: 'نصوص interleaved تكون بالعامية المصرية.',
  },
};
