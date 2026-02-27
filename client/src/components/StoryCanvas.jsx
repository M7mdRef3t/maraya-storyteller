import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';

/**
 * StoryCanvas - Full-screen cinematic background canvas.
 * Forked from DawayirCanvas.jsx - keeps particle system and animation loop,
 * replaces nodes with full-screen image rendering + mood-based particles.
 */
const StoryCanvas = forwardRef(({ mood }, ref) => {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const imageRef = useRef(null);        // Current displayed image
  const targetImageRef = useRef(null);   // Image to transition to
  const imageOpacityRef = useRef(0);     // Current image opacity (0-1)
  const targetOpacityRef = useRef(0);    // Target opacity
  const moodRef = useRef(mood || 'ambient_calm');

  // Cache gradients to avoid re-creation on every frame
  const bgGradientRef = useRef(null);
  const vignetteGradientRef = useRef(null);

  // Mood-based particle color mapping
  const MOOD_COLORS = {
    ambient_calm: { r: 100, g: 200, b: 255, speed: 0.15 },
    tense_drone: { r: 255, g: 80, b: 60, speed: 0.4 },
    hopeful_strings: { r: 120, g: 255, b: 120, speed: 0.2 },
    mysterious_wind: { r: 180, g: 120, b: 255, speed: 0.25 },
    triumphant_rise: { r: 255, g: 215, b: 0, speed: 0.3 },
  };

  useEffect(() => {
    moodRef.current = mood || 'ambient_calm';
  }, [mood]);

  // Initialize particles
  useEffect(() => {
    const particles = [];
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 2.5 + 0.5,
        opacity: Math.random() * 0.3 + 0.05,
        speedX: (Math.random() - 0.5) * 0.2,
        speedY: (Math.random() - 0.5) * 0.2,
      });
    }
    particlesRef.current = particles;
  }, []);

  // Expose methods for scene image transitions
  useImperativeHandle(ref, () => ({
    setImage: (base64, mimeType) => {
      const img = new Image();
      img.onload = () => {
        targetImageRef.current = img;
        targetOpacityRef.current = 1;
      };
      img.src = `data:${mimeType};base64,${base64}`;
    },
    clearImage: () => {
      targetOpacityRef.current = 0;
    },
  }));

  // Handle resize and recreate gradients
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const w = canvas.width;
      const h = canvas.height;
      const ctx = canvas.getContext('2d');

      // Create and cache Background Gradient
      const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 1.2);
      bgGrad.addColorStop(0, '#0a0a14');
      bgGrad.addColorStop(1, '#030305');
      bgGradientRef.current = bgGrad;

      // Create and cache Vignette Gradient
      const vignetteGrad = ctx.createRadialGradient(w / 2, h / 2, w * 0.25, w / 2, h / 2, w * 0.7);
      vignetteGrad.addColorStop(0, 'rgba(0,0,0,0)');
      vignetteGrad.addColorStop(1, 'rgba(0,0,0,0.7)');
      vignetteGradientRef.current = vignetteGrad;
    };

    handleResize(); // Initial setup
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const lerp = (a, b, t) => a + (b - a) * t;

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // 1. Background gradient (Use cached)
      if (bgGradientRef.current) {
        ctx.fillStyle = bgGradientRef.current;
        ctx.fillRect(0, 0, w, h);
      }

      // 2. Scene image with smooth opacity transition
      if (targetImageRef.current && targetOpacityRef.current > 0) {
        imageOpacityRef.current = lerp(imageOpacityRef.current, targetOpacityRef.current, 0.03);

        if (imageOpacityRef.current > 0.01) {
          // When transitioning to new image, swap when ready
          if (targetImageRef.current !== imageRef.current && imageOpacityRef.current > 0.5) {
            imageRef.current = targetImageRef.current;
          }
        }
      } else {
        imageOpacityRef.current = lerp(imageOpacityRef.current, 0, 0.03);
      }

      if (imageRef.current && imageOpacityRef.current > 0.01) {
        ctx.globalAlpha = Math.min(imageOpacityRef.current, 0.85);

        // Draw image covering the canvas (cover mode)
        const img = imageRef.current;
        const imgRatio = img.width / img.height;
        const canvasRatio = w / h;
        let drawW, drawH, drawX, drawY;

        if (imgRatio > canvasRatio) {
          drawH = h;
          drawW = h * imgRatio;
          drawX = (w - drawW) / 2;
          drawY = 0;
        } else {
          drawW = w;
          drawH = w / imgRatio;
          drawX = 0;
          drawY = (h - drawH) / 2;
        }

        ctx.drawImage(img, drawX, drawY, drawW, drawH);
        ctx.globalAlpha = 1;
      }

      // 3. Vignette overlay (Use cached)
      if (vignetteGradientRef.current) {
        ctx.fillStyle = vignetteGradientRef.current;
        ctx.fillRect(0, 0, w, h);
      }

      // 4. Mood-based particles
      const moodConfig = MOOD_COLORS[moodRef.current] || MOOD_COLORS.ambient_calm;
      // Set fillStyle ONCE per frame for all particles
      ctx.fillStyle = `rgba(${moodConfig.r}, ${moodConfig.g}, ${moodConfig.b}, 0.6)`;

      particlesRef.current.forEach((p) => {
        // Smoothly adjust speed based on mood
        const targetSpeedX = (Math.random() > 0.5 ? 1 : -1) * moodConfig.speed;
        p.speedX = lerp(p.speedX, targetSpeedX, 0.001);
        p.speedY = lerp(p.speedY, (Math.random() - 0.5) * moodConfig.speed, 0.001);

        p.x += p.speedX;
        p.y += p.speedY;

        // Wrap around
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        ctx.globalAlpha = p.opacity;
        // ctx.fillStyle is already set above loop
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={window.innerWidth}
      height={window.innerHeight}
      style={{
        display: 'block',
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
      }}
    />
  );
});

export default StoryCanvas;
