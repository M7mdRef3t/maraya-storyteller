const EMOTION_KEYWORDS = {
  anxiety: ['anxious', 'anxiety', 'worried', 'worry', 'stress', 'stressed', 'panic', 'panic', 'قلق', 'متوتر', 'خايف', 'خوف', 'مرعوب'],
  confusion: ['confused', 'confusion', 'lost', 'unclear', 'unsure', 'حائر', 'حيرة', 'محتار', 'مش فاهم', 'تايه'],
  nostalgia: ['nostalgia', 'nostalgic', 'memory', 'remember', 'home', 'past', 'حنين', 'مشتاق', 'ذكريات', 'زمان'],
  hope: ['hope', 'healing', 'better', 'light', 'tomorrow', 'أمل', 'شفاء', 'بكرة', 'نور', 'أفضل'],
  loneliness: ['alone', 'lonely', 'isolated', 'empty', 'وحيد', 'وحدة', 'لوحدي', 'فاضي', 'معزول'],
  wonder: ['wonder', 'curious', 'magic', 'dream', 'stars', 'دهشة', 'منبهر', 'فضولي', 'سحر', 'حلم'],
};

function normalizeText(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFKC');
}

export function inferEmotionFromWhisper(text) {
  const normalized = normalizeText(text);
  if (!normalized.trim()) {
    return { emotion: 'hope', confidence: 0, matchedKeywords: [] };
  }

  const scores = Object.entries(EMOTION_KEYWORDS).map(([emotion, keywords]) => {
    const matchedKeywords = keywords.filter((keyword) => normalized.includes(keyword));
    return { emotion, matchedKeywords, score: matchedKeywords.length };
  });

  scores.sort((left, right) => right.score - left.score);
  const winner = scores[0];

  if (!winner || winner.score < 1) {
    return { emotion: 'hope', confidence: 0.2, matchedKeywords: [] };
  }

  return {
    emotion: winner.emotion,
    confidence: Math.min(1, 0.35 + (winner.score * 0.2)),
    matchedKeywords: winner.matchedKeywords,
  };
}
