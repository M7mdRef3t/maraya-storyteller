import React, { useRef, useEffect } from 'react';

/**
 * EmotionJourneyMap — renders a visual SVG path showing
 * how the user's emotions changed across the story.
 * Displayed at the ending screen.
 */

const EMOTION_POSITIONS = {
  hope: { y: 0.15, color: '#5effb3', label: { en: 'Hope', ar: 'أمل' } },
  wonder: { y: 0.25, color: '#ffd700', label: { en: 'Wonder', ar: 'دهشة' } },
  nostalgia: { y: 0.40, color: '#daa520', label: { en: 'Nostalgia', ar: 'حنين' } },
  confusion: { y: 0.55, color: '#7b68ee', label: { en: 'Confusion', ar: 'حيرة' } },
  anxiety: { y: 0.70, color: '#8b7355', label: { en: 'Anxiety', ar: 'قلق' } },
  loneliness: { y: 0.85, color: '#4682b4', label: { en: 'Loneliness', ar: 'وحدة' } },
};

function getEmotionY(emotion, height) {
  const pos = EMOTION_POSITIONS[emotion];
  return pos ? pos.y * height : 0.5 * height;
}

function getEmotionColor(emotion) {
  return EMOTION_POSITIONS[emotion]?.color || '#ffffff';
}

export default function EmotionJourneyMap({ journey, uiLanguage = 'en' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !journey || journey.length < 2) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, w, h);

    const padding = 30;
    const plotW = w - padding * 2;
    const plotH = h - padding * 2;

    // Draw horizontal emotion labels
    Object.entries(EMOTION_POSITIONS).forEach(([key, val]) => {
      const y = padding + val.y * plotH;
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(w - padding, y);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      ctx.font = '10px sans-serif';
      ctx.textAlign = uiLanguage === 'en' ? 'right' : 'left';
      const labelX = uiLanguage === 'en' ? padding - 6 : w - padding + 6;
      ctx.fillText(val.label[uiLanguage] || val.label.en, labelX, y + 3);
    });

    // Build points
    const points = journey.map((emotion, i) => ({
      x: padding + (i / (journey.length - 1)) * plotW,
      y: padding + getEmotionY(emotion, plotH),
      color: getEmotionColor(emotion),
      emotion,
    }));

    // Draw gradient path
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      const grad = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
      grad.addColorStop(0, p1.color);
      grad.addColorStop(1, p2.color);
      ctx.strokeStyle = grad;

      ctx.beginPath();
      if (i === 0) {
        ctx.moveTo(p1.x, p1.y);
      } else {
        ctx.moveTo(p1.x, p1.y);
      }
      // Smooth curve
      const cpX = (p1.x + p2.x) / 2;
      ctx.bezierCurveTo(cpX, p1.y, cpX, p2.y, p2.x, p2.y);
      ctx.stroke();
    }

    // Draw dots
    points.forEach((p, i) => {
      // Glow
      const glowGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 12);
      glowGrad.addColorStop(0, p.color + '40');
      glowGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 12, 0, Math.PI * 2);
      ctx.fill();

      // Dot
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, i === 0 || i === points.length - 1 ? 5 : 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Scene number
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font = '9px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${i + 1}`, p.x, p.y + 18);
    });
  }, [journey, uiLanguage]);

  if (!journey || journey.length < 2) return null;

  const title = uiLanguage === 'en' ? 'Your Emotional Journey' : 'رحلتك العاطفية';

  return (
    <div className="emotion-journey-map" style={{ animation: 'fadeInUp 1s var(--ease-spring)' }}>
      <h3 className="emotion-journey-map__title">{title}</h3>
      <canvas
        ref={canvasRef}
        className="emotion-journey-map__canvas"
        style={{ width: '100%', height: '160px' }}
      />
    </div>
  );
}
