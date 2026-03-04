import React from 'react';
import BrandMark from './BrandMark.jsx';

const SLIDES = {
  en: [
    {
      title: 'Maraya listens to what you do not say.',
      body: 'Choose your emotion or upload your space. Maraya shapes the rest.',
    },
    {
      title: 'Every emotion becomes a world.',
      body: 'A branching narrative forms around your choices. No two journeys are alike.',
    },
    {
      title: 'The narrator speaks with you.',
      body: 'Enable voice to experience your story as an intimate cinematic performance.',
    },
  ],
  ar: [
    {
      title: 'مرايا تسمع ما لا تقوله',
      body: 'اختر مشاعرك أو ارفع صورة مكانك، ودع مرايا تكمل الرحلة.',
    },
    {
      title: 'كل مشاعر تصبح عالمًا',
      body: 'قصة متفرعة تتشكل من اختياراتك، ولا تتكرر بنفس الطريقة.',
    },
    {
      title: 'الراوية تتكلم',
      body: 'فعّل الصوت لتعيش التجربة القصصية بحواسك كاملة.',
    },
  ],
};

export default function OnboardingCarousel({
  uiLanguage = 'ar',
  index = 0,
  onNext,
  onBack,
  onSkip,
}) {
  const isEn = uiLanguage === 'en';
  const slides = isEn ? SLIDES.en : SLIDES.ar;
  const slide = slides[Math.max(0, Math.min(index, slides.length - 1))];
  const isLast = index >= slides.length - 1;

  return (
    <section
      className="onboarding"
      aria-label={isEn ? 'Onboarding' : 'التعريف'}
      onTouchStart={(e) => {
        const x = e.touches?.[0]?.clientX ?? 0;
        e.currentTarget.dataset.touchX = String(x);
      }}
      onTouchEnd={(e) => {
        const startX = Number(e.currentTarget.dataset.touchX || 0);
        const endX = e.changedTouches?.[0]?.clientX ?? startX;
        const delta = endX - startX;
        if (delta < -40) onNext?.();
        if (delta > 40) onBack?.();
      }}
    >
      <div className="onboarding__media">
        <BrandMark className="onboarding__brand" withWordmark />
      </div>

      <div className="onboarding__content glass-card">
        <h2 className="onboarding__title">{slide.title}</h2>
        <p className="onboarding__body">{slide.body}</p>

        <div className="onboarding__dots" role="tablist" aria-label={isEn ? 'Slides' : 'الشرائح'}>
          {slides.map((_, i) => (
            <span key={i} className={`onboarding__dot ${i === index ? 'onboarding__dot--active' : ''}`} />
          ))}
        </div>

        <div className="onboarding__actions">
          <button type="button" className="ds-btn ds-btn--ghost" onClick={onSkip}>
            {isEn ? 'Skip' : 'تخطي'}
          </button>
          <button type="button" className="ds-btn ds-btn--primary" onClick={onNext}>
            {isLast ? (isEn ? 'Start' : 'ابدأ') : (isEn ? 'Continue' : 'متابعة')}
          </button>
        </div>
      </div>
    </section>
  );
}
