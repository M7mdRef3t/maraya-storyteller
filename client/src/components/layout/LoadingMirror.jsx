import React, { useEffect, useMemo, useState } from 'react';
import BrandMark from '../BrandMark.jsx';

export default function LoadingMirror({
  statusText,
  uiLanguage = 'ar',
  whisperText = '',
  whisperReflection = '',
}) {
  const isEn = uiLanguage === 'en';
  const fallbackMessages = useMemo(
    () => (
      isEn
        ? [
          'Maraya is taking shape...',
          'Reading between your words...',
          'Composing your next cinematic beat...',
        ]
        : [
          'المرايا تتشكل...',
          'نقرأ ما بين الكلمات...',
          'نجهز إيقاعك السينمائي التالي...',
        ]
    ),
    [isEn],
  );

  const [messageIndex, setMessageIndex] = useState(0);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const messageTimer = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % fallbackMessages.length);
    }, 2200);
    const timeoutTimer = setTimeout(() => {
      setTimedOut(true);
    }, 30000);

    return () => {
      clearInterval(messageTimer);
      clearTimeout(timeoutTimer);
    };
  }, [fallbackMessages.length]);

  const visibleMessage = statusText || fallbackMessages[messageIndex];
  const timeoutText = isEn
    ? 'This is taking longer than usual. Please retry if needed.'
    : 'الأمر أطول من المعتاد. حاول مرة أخرى إذا لزم.';
  const whisperLabel = isEn ? 'The mirror heard' : 'المرآة سمعت';

  return (
    <section
      className="loading-mirror"
      role="status"
      aria-live="polite"
      aria-label={isEn ? 'Generating story' : 'جاري إنشاء القصة'}
    >
      <BrandMark className="loading-mirror__brand" compact />
      <div className="loading-mirror__orb">
        <div className="loading-mirror__orb-inner" />
        <div className="loading-mirror__orb-reflection" />
      </div>
      <p className="loading-mirror__text">{visibleMessage}</p>
      {(whisperText || whisperReflection) && (
        <div className="loading-mirror__echo">
          <p className="loading-mirror__echo-label">{whisperLabel}</p>
          {whisperText && <p className="loading-mirror__echo-quote">"{whisperText}"</p>}
          {whisperReflection && <p className="loading-mirror__echo-text">{whisperReflection}</p>}
        </div>
      )}
      {timedOut && (
        <p className="loading-mirror__timeout" role="alert">
          {timeoutText}
        </p>
      )}
    </section>
  );
}
