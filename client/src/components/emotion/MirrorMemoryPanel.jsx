import React from 'react';

function formatJourneyLabel(journey, uiLanguage) {
  const date = journey?.endedAt ? new Date(journey.endedAt) : null;
  const day = date && !Number.isNaN(date.getTime())
    ? date.toLocaleDateString(uiLanguage === 'en' ? 'en-US' : 'ar-EG', {
      month: 'short',
      day: 'numeric',
    })
    : '';

  const emotion = journey?.seedEmotion || journey?.finalEmotion || 'hope';
  const secret = journey?.secretEndingKey ? ` • ${journey.secretEndingKey.toUpperCase()}` : '';
  return [day, emotion, secret].filter(Boolean).join(' ');
}

export default function MirrorMemoryPanel({ snapshot, uiLanguage = 'en' }) {
  if (!snapshot || snapshot.rememberedCount < 1) return null;

  const title = uiLanguage === 'en' ? 'Mirror Memory' : 'ذاكرة المرآة';
  const subtitle = uiLanguage === 'en'
    ? `The mirror remembers ${snapshot.rememberedCount} journey${snapshot.rememberedCount === 1 ? '' : 's'}.`
    : `المرآة تتذكر ${snapshot.rememberedCount} رحلة.`;

  return (
    <section className="mirror-memory-panel" aria-label={title}>
      <div className="mirror-memory-panel__header">
        <p className="mirror-memory-panel__eyebrow">{title}</p>
        <p className="mirror-memory-panel__subtitle">{subtitle}</p>
      </div>

      {snapshot.signature?.dominantEmotion && (
        <p className="mirror-memory-panel__signature">
          {uiLanguage === 'en'
            ? `Dominant signature: ${snapshot.signature.dominantEmotion}`
            : `البصمة الغالبة: ${snapshot.signature.dominantEmotion}`}
        </p>
      )}

      <div className="mirror-memory-panel__list">
        {(snapshot.recentJourneys || []).slice(0, 3).map((journey) => (
          <article key={journey.id} className="mirror-memory-panel__card">
            <p className="mirror-memory-panel__meta">{formatJourneyLabel(journey, uiLanguage)}</p>
            <p className="mirror-memory-panel__excerpt">
              {journey.endingMessage || journey.summary || journey.whisperText}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
