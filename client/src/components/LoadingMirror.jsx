import React, { useEffect, useMemo, useState } from 'react';
import BrandMark from './BrandMark.jsx';

export default function LoadingMirror({ statusText, uiLanguage = 'ar' }) {
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
          'نقرأ ما بين السطور...',
          'نجهز مشهدك القادم...',
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
    }, 15000);

    return () => {
      clearInterval(messageTimer);
      clearTimeout(timeoutTimer);
    };
  }, [fallbackMessages.length]);

  const visibleMessage = statusText || fallbackMessages[messageIndex];
  const timeoutText = isEn
    ? 'This is taking longer than usual. Please retry if needed.'
    : 'الأمر أطول من المعتاد. حاول مرة أخرى إذا لزم.';

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
      {timedOut && (
        <p className="loading-mirror__timeout" role="alert">
          {timeoutText}
        </p>
      )}
    </section>
  );
}
