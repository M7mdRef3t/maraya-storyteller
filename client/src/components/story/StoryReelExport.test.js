import { describe, expect, it, vi } from 'vitest';
import { buildJourneyFileStem } from './StoryReelExport.jsx';

describe('buildJourneyFileStem', () => {
  it('builds a readable per-journey filename stem', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-08T21:45:00.000Z'));

    const stem = buildJourneyFileStem({
      emotionJourney: ['confusion', 'hope'],
      endingMessage: 'You reached a bright threshold the mirror will remember.',
    });

    expect(stem).toBe(
      'maraya-confusion-to-hope-you-reached-a-bright-20260308-2145',
    );

    vi.useRealTimers();
  });
});
