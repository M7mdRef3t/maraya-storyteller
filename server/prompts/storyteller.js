/**
 * Maraya Storyteller - System Prompt Builder
 */

const STYLE_MAP = {
  anxiety: {
    ar: 'قلق',
    en: 'Anxiety',
    architecture: 'Brutalist',
    visual: 'raw concrete, sharp angles, oppressive corridors, heavy shadows, industrial textures',
    palette: 'gray, dark amber, muted steel',
  },
  confusion: {
    ar: 'حيرة',
    en: 'Confusion',
    architecture: 'Deconstructivist',
    visual: 'fragmented geometry, impossible angles, shattered glass, tilted planes, disorienting perspectives',
    palette: 'deep purple, fractured silver, dark teal',
  },
  nostalgia: {
    ar: 'حنين',
    en: 'Nostalgia',
    architecture: 'Abandoned Heritage',
    visual: 'overgrown courtyards, dusty mashrabiya screens, crumbling arches, warm afternoon light through lattice',
    palette: 'warm ochre, faded terracotta, dusty gold',
  },
  hope: {
    ar: 'أمل',
    en: 'Hope',
    architecture: 'Biophilic',
    visual: 'living walls, cascading water features, natural light flooding through skylights, organic curves',
    palette: 'fresh green, soft white, warm sunlight gold',
  },
  loneliness: {
    ar: 'وحدة',
    en: 'Loneliness',
    architecture: 'Minimalist Void',
    visual: 'vast empty halls, single figure in infinite space, echo-like atmosphere, cold blue light',
    palette: 'ice blue, pale gray, deep shadow black',
  },
  wonder: {
    ar: 'دهشة',
    en: 'Wonder',
    architecture: 'Islamic Geometric & Parametric',
    visual: 'infinite tessellations, muqarnas ceilings, kaleidoscopic patterns, golden ratio spirals, luminous geometry',
    palette: 'deep gold, royal blue, luminous white',
  },
};

const AUDIO_MOODS = ['ambient_calm', 'tense_drone', 'hopeful_strings', 'mysterious_wind', 'triumphant_rise'];

const OUTPUT_MODE_CONFIG = {
  judge_en: {
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
    name: 'Arabic Fusha (Poetic)',
    languageName: 'Arabic (MSA)',
    narrativeRules: [
      'اكتب بالعربية الفصحى الأدبية بلغة شاعرية وبلاغة عالية.',
      'استخدم صوراً جمالية واستعارات معمارية عميقة (الجدران كحدود نفسية، النوافذ كوضوح).',
      'تجنب الكلمات المعقدة جداً التي تعيق التدفق، لكن حافظ على الفخامة.',
      'كل سطر سردي من جملتين إلى ثلاث فقط.',
    ],
    choiceRules: [
      'الاختيارات تكون بالعربية الفصحى الرصينة.',
      'الاختيار الأول للمواجهة والاستكشاف.',
      'الاختيار الثاني للتأمل والتقبّل.',
    ],
    interleavedHint: 'نصوص interleaved تكون بالعربية الفصحى الأدبية.',
  },
  ar_egyptian: {
    name: 'Egyptian Arabic (Authentic)',
    languageName: 'Egyptian Colloquial',
    narrativeRules: [
      'اكتب بلهجة مصرية طبيعية، "لغة بيضا" مفهومة لكل العرب بدون ابتذال.',
      'استخدم مفردات مصرية دافئة (بص، إنت، إحنا، يعني) باعتدال لتقريب المسافة.',
      'حافظ على العمق النفسي للمشهد رغم استخدام العامية.',
      'كل سطر سردي من جملتين إلى ثلاث فقط.',
    ],
    choiceRules: [
      'الاختيارات تكون بالعامية المصرية الواضحة الذكية.',
      'الاختيار الأول يميل للحركة والفضول.',
      'الاختيار الثاني يميل للصمت والتحليل.',
    ],
    interleavedHint: 'نصوص interleaved تكون بالعامية المصرية الراقية.',
  },
  ar_educational: {
    name: 'Arabic Educational (Clear)',
    languageName: 'Arabic (Simplified MSA)',
    narrativeRules: [
      'اكتب بلغة عربية فصحى مبسطة مباشرة (لغة تعليمية).',
      'ركز على الوضوح التام والترابط المنطقي بين الأحداث.',
      'استخدم تشكيلاً جزئياً للكلمات الملتبسة لسهولة القراءة والنطق.',
      'تجنب المحسنات البديعية المعقدة.',
    ],
    choiceRules: [
      'الاختيارات واضحة، تعليمية، وتحدد مساراً معرفياً.',
      'الاختيار الأول للتطبيق العملي.',
      'الاختيار الثاني للمراجعة والنظرية.',
    ],
    interleavedHint: 'نصوص interleaved تكون بسيطة ومباشرة مشكولة جزئياً.',
  },
};

const DEFAULT_STORY_SCENE_LIMIT = 7;
const JUDGE_STORY_SCENE_LIMIT = 3;

export function normalizeOutputMode(mode) {
  return OUTPUT_MODE_CONFIG[mode] ? mode : 'judge_en';
}

export function getStorySceneLimit(outputMode = 'judge_en') {
  return normalizeOutputMode(outputMode) === 'judge_en'
    ? JUDGE_STORY_SCENE_LIMIT
    : DEFAULT_STORY_SCENE_LIMIT;
}

function getOutputModeSection(mode) {
  return `OUTPUT MODE
- Mode: ${mode.name}
- Primary narrative language: ${mode.languageName}
- IMPORTANT: Keep JSON keys unchanged (narration_ar, interleaved_blocks[].text_ar, choices[].text_ar) for compatibility.
- IMPORTANT: Value text inside those fields must follow the selected output mode language.`;
}

function getNarrativeRulesSection(mode) {
  return `NARRATIVE RULES
- ${mode.narrativeRules.join('\n- ')}
- Use architectural metaphors: walls as psychological boundaries, windows as clarity, stairs as transition.`;
}

function getVisualLanguageSection(style) {
  return `VISUAL LANGUAGE FOR CURRENT EMOTION
- Emotion (EN): ${style.en}
- Emotion (AR): ${style.ar}
- Architecture style: ${style.architecture}
- Visual elements: ${style.visual}
- Color palette: ${style.palette}`;
}

function getImagePromptRulesSection() {
  return `IMAGE PROMPT RULES
- image_prompt must always be in English.
- IMPORTANT: Do not include any text, letters, or words inside the image itself.
- Include architecture style, cinematic lighting, 16:9 composition, and mood.
- Keep visual continuity across all scenes.
- If emotion shifts positively, gradually transition toward biophilic visual cues.`;
}

function getInterleavedOutputFormatSection(mode) {
  return `INTERLEAVED OUTPUT FORMAT (MANDATORY)
- Every scene must include interleaved_blocks with 2 to 5 ordered blocks.
- Block schema: {"kind":"narration|visual|reflection","text_ar":"..."}
- narration: poetic progression of the moment.
- visual: what the eye sees changing now.
- reflection: inward line that leads toward choice.
- ${mode.interleavedHint}`;
}

function getChoiceRulesSection(mode, allowFinalEnding) {
  const endingChoiceRule = allowFinalEnding
    ? 'Only the true ending scene may have empty choices array []. All earlier scenes must keep exactly 2 choices.'
    : 'All scenes in this response are non-final and must include exactly 2 choices (never empty).';

  return `CHOICE RULES
- Provide exactly 2 choices per non-final scene.
- ${mode.choiceRules.join('\n- ')}
- ${endingChoiceRule}`;
}

function getAudioMoodSection() {
  return `AUDIO MOOD
- Choose one from: ${AUDIO_MOODS.join(', ')}`;
}

/**
 * Secret Endings — special narrative conclusions triggered by specific
 * emotion patterns across the story journey. No app in the world does this.
 */
const SECRET_ENDINGS = {
  phoenix: {
    pattern: ['anxiety', 'loneliness', 'hope'],
    en: 'PHOENIX ENDING: The protagonist has journeyed from darkness through solitude to hope. Create a transcendent final scene where the architectural world literally transforms — brutalist concrete cracks to reveal biophilic gardens, symbolizing rebirth. Include the phrase "The mirror remembers what you chose to forget" in the narration.',
    ar: 'نهاية العنقاء: رحلة من الظلام عبر الوحدة إلى الأمل. اخلق مشهداً ختامياً خارقاً حيث العالم المعماري يتحول — الخرسانة تتشقق لتكشف حدائق حيوية ترمز للولادة من جديد. أدرج عبارة "المرآة تتذكر ما اخترت أن تنساه" في السرد.',
  },
  labyrinth: {
    pattern: ['confusion', 'wonder', 'confusion'],
    en: 'LABYRINTH ENDING: The protagonist is caught in a beautiful recursive loop. Create a surreal scene where the architecture folds into infinite tessellation — the ending IS the beginning. Include the phrase "You were never lost. The maze was always you."',
    ar: 'نهاية المتاهة: البطل محاصر في حلقة جمالية لا نهائية. اخلق مشهداً سريالياً حيث العمارة تنطوي في تكرار لا نهائي — النهاية هي البداية. أدرج عبارة "لم تكن تائهاً أبداً. المتاهة كانت أنت."',
  },
  echo: {
    pattern: ['nostalgia', 'loneliness', 'nostalgia'],
    en: 'ECHO ENDING: A haunting circular return. The final scene mirrors the first scene exactly but from a different perspective — the protagonist realizes they are the ghost haunting their own memory. Include "This place was waiting for someone who already left."',
    ar: 'نهاية الصدى: عودة دائرية مؤلمة. المشهد الأخير يعكس الأول من منظور مختلف — البطل يدرك أنه الشبح الذي يطارد ذاكرته. أدرج عبارة "هذا المكان كان ينتظر شخصاً غادر منذ زمن."',
  },
};

export function detectSecretEnding(emotionHistory, outputMode = 'judge_en') {
  if (!Array.isArray(emotionHistory) || emotionHistory.length < 3) return null;
  const last3 = emotionHistory.slice(-3);
  for (const [key, ending] of Object.entries(SECRET_ENDINGS)) {
    if (ending.pattern.every((e, i) => last3[i] === e)) {
      const isEnglish = outputMode === 'judge_en';
      return { key, instruction: isEnglish ? ending.en : ending.ar };
    }
  }
  return null;
}

function getSceneCountSection(isFollowUp, outputMode, allowFinalEnding) {
  const modeKey = normalizeOutputMode(outputMode);
  const storySceneLimit = getStorySceneLimit(modeKey);
  const isJudgeMode = modeKey === 'judge_en';
  const sceneCountRule = isFollowUp
    ? 'Generate exactly 1 follow-up scene.'
    : 'Generate exactly 1 opening scene.';

  const arcRule = isFollowUp
    ? 'Continue naturally from the previous scene while honoring the user choice.'
    : 'This opening scene should establish the world and emotional tone clearly.';

  const judgeRailRules = isJudgeMode
    ? [
      `The entire judge journey must resolve within ${storySceneLimit} scenes total.`,
      'Scene 1 must reveal the wound and the world immediately.',
      allowFinalEnding
        ? `This scene is the decisive final turn. Resolve the emotional arc completely and set choices to empty array [] so the story ends within ${storySceneLimit} scenes.`
        : 'If this is not the final scene yet, push the protagonist into a visible emotional pivot that accelerates the ending.',
    ]
    : [`The full story can span up to ${storySceneLimit} scenes total.`];

  return `SCENE COUNT
- ${sceneCountRule}
${arcRule ? `- ${arcRule}` : ''}
- ${judgeRailRules.join('\n- ')}`;
}

function getRedirectSection({ command, intensity }) {
  const isHighIntensity = intensity > 0.75;

  return `LIVE REDIRECTION (CRITICAL)
- Hard pivot the tone, pacing, and visual style to: "${command}" (Intensity: ${intensity.toFixed(2)}/1.0).
- Lexicon Shift: Drastically alter the vocabulary to match the new command.
- Pacing: ${isHighIntensity ? 'Use much shorter, sharper sentences with long dramatic pauses.' : 'Adapt sentence length to the flow of the new mood.'}
- Visual DNA Shift: Introduce new lighting, contrast, and color palettes that represent "${command}" while keeping the protagonist's core intact.
- Seamlessly transition without breaking the narrative arc.`;
}

export function buildStorytellerPrompt(
  emotion,
  isFollowUp = false,
  outputMode = 'judge_en',
  allowFinalEnding = false,
  redirectCommand = null,
  secretEnding = null,
) {
  const style = STYLE_MAP[emotion] || STYLE_MAP.hope;
  const modeKey = normalizeOutputMode(outputMode);
  const mode = OUTPUT_MODE_CONFIG[modeKey];

  const secretEndingSection = secretEnding
    ? `\nSECRET ENDING UNLOCKED (HIGHEST PRIORITY)\n- ${secretEnding.instruction}\n- This is a rare achievement. Make the scene extraordinary and unforgettable.\n- Set choices to empty array [] since this is the true ending.`
    : '';

  return `You are "Maraya", an immersive creative director and architectural storyteller.

GOAL
Transform user emotion into a surreal interactive narrative scene flow.

${getOutputModeSection(mode)}

${getNarrativeRulesSection(mode)}

${getVisualLanguageSection(style)}

${getImagePromptRulesSection()}

${getInterleavedOutputFormatSection(mode)}

${getChoiceRulesSection(mode, allowFinalEnding)}

${getAudioMoodSection()}

${getSceneCountSection(isFollowUp, modeKey, allowFinalEnding)}

${redirectCommand ? getRedirectSection(redirectCommand) : ''}${secretEndingSection}

Return JSON only.`;
}

export function buildSpaceAnalysisPrompt(outputMode = 'judge_en') {
  const modeKey = normalizeOutputMode(outputMode);
  const mode = OUTPUT_MODE_CONFIG[modeKey];

  return `You are Maraya, a visual and architectural mood analyst.
Analyze the user's room/space image.

Tasks:
1. Infer the dominant mood from lighting, composition, colors, and spatial arrangement.
2. Select exactly one emotion from: anxiety, confusion, nostalgia, hope, loneliness, wonder.
3. Write a short, vivid space reading in ${mode.languageName}.

Return JSON only:
{"detected_emotion":"...","space_reading":"..."}`;
}

export { STYLE_MAP, AUDIO_MOODS, OUTPUT_MODE_CONFIG, SECRET_ENDINGS };
