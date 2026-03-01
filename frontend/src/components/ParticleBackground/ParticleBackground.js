import { useEffect, useRef } from 'react';

/**
 * ParticleBackground
 * Full-viewport canvas particle system — floating dots with connecting lines.
 * Props:
 *   count  {number}  — particle count (default 80)
 *   color  {string}  — base particle color (default '#7c3aed')
 *   speed  {number}  — move speed multiplier (default 1)
 */
export default function ParticleBackground({
  count = 80,
  color = '#7c3aed',
  speed = 1,
}) {
  const canvasRef = useRef(null);
  const animRef   = useRef(null);
  const mouse     = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Resize helper
    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Mouse tracking for parallax
    const onMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    window.addEventListener('mousemove', onMouseMove);

    // Parse hex color → rgb components
    const hexToRgb = (hex) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `${r},${g},${b}`;
    };
    const rgb = hexToRgb(color);
    const rgb2 = hexToRgb('#06b6d4'); // cyan accent

    // Build particles
    const particles = Array.from({ length: count }, () => ({
      x:    Math.random() * canvas.width,
      y:    Math.random() * canvas.height,
      vx:   (Math.random() - 0.5) * 0.5 * speed,
      vy:   (Math.random() - 0.5) * 0.5 * speed,
      r:    Math.random() * 2 + 1,
      life: Math.random(), // for pulsing opacity
      speed: Math.random() * 0.01 + 0.005,
      useAccent: Math.random() > 0.6,
    }));

    const CONNECT_DIST = 120;
    const MOUSE_REPEL  = 80;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update particles
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.life += p.speed;

        // Wrap edges
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        // Mouse repel
        const dx = p.x - mouse.current.x;
        const dy = p.y - mouse.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_REPEL) {
          const force = (MOUSE_REPEL - dist) / MOUSE_REPEL;
          p.x += (dx / dist) * force * 2;
          p.y += (dy / dist) * force * 2;
        }
      }

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < CONNECT_DIST) {
            const alpha = (1 - d / CONNECT_DIST) * 0.18;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(${rgb},${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Draw particles
      for (const p of particles) {
        const pulse = 0.4 + 0.6 * Math.abs(Math.sin(p.life));
        const c = p.useAccent ? rgb2 : rgb;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${c},${pulse * 0.8})`;
        ctx.fill();

        // Outer glow dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${c},${pulse * 0.06})`;
        ctx.fill();
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, [count, color, speed]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
}
