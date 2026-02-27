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

export function normalizeOutputMode(mode) {
  return OUTPUT_MODE_CONFIG[mode] ? mode : 'judge_en';
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

function getSceneCountSection(isFollowUp) {
  const sceneCountRule = isFollowUp
    ? 'Generate exactly 1 follow-up scene.'
    : 'Generate exactly 1 opening scene.';

  const arcRule = isFollowUp
    ? 'Continue naturally from the previous scene while honoring the user choice.'
    : 'This opening scene should establish the world and emotional tone clearly.';

  return `SCENE COUNT
- ${sceneCountRule}
${arcRule ? `- ${arcRule}` : ''}`;
}

export function buildStorytellerPrompt(
  emotion,
  isFollowUp = false,
  outputMode = 'judge_en',
  allowFinalEnding = false,
) {
  const style = STYLE_MAP[emotion] || STYLE_MAP.hope;
  const modeKey = normalizeOutputMode(outputMode);
  const mode = OUTPUT_MODE_CONFIG[modeKey];

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

${getSceneCountSection(isFollowUp)}

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

export { STYLE_MAP, AUDIO_MOODS, OUTPUT_MODE_CONFIG };
