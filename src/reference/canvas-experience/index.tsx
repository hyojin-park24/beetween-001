import { useEffect, useRef, useState } from 'react';
import type { StandaloneFeatureProps } from '../../shared/types';
import styles from './CanvasExperience.module.css';

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  accent: boolean;
};

const MAX_PARTICLES = 600;
const FRAME_MS = 1000 / 60;
/** dt is clamped so a backgrounded tab does not resume with one huge step. */
const MAX_DT_MS = 32;
const DAMPING = 0.96;
const LIFE_PER_FRAME = 0.012;
const IDLE_AFTER_MS = 2000;
const IDLE_EVERY_MS = 500;
const PUSH_RADIUS = 200;
const PUSH_FORCE = 0.15;
const ACCENT_CHANCE = 0.05;

/** One pool of particles, reused forever: no allocation inside the loop. */
function createPool(): Particle[] {
  return Array.from({ length: MAX_PARTICLES }, () => ({
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    size: 0,
    life: 0,
    accent: false,
  }));
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export default function CanvasExperience({ active = true }: StandaloneFeatureProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const poolRef = useRef<Particle[]>(createPool());
  /** Write cursor: spawning here overwrites the oldest particle first. */
  const headRef = useRef(0);
  const [hintHidden, setHintHidden] = useState(false);

  useEffect(() => {
    const element = canvasRef.current;
    if (element === null || !active) return;
    const context = element.getContext('2d');
    if (context === null) return;

    // The helpers below are hoisted function declarations, and TypeScript drops
    // narrowing across those. Binding the non-null values once fixes that.
    const canvas: HTMLCanvasElement = element;
    const ctx: CanvasRenderingContext2D = context;

    const pool = poolRef.current;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Token colours are read once; re-reading them per frame would cost a style pass.
    const rootStyle = getComputedStyle(document.documentElement);
    const inkColor = rootStyle.getPropertyValue('--ink').trim();
    const accentColor = rootStyle.getPropertyValue('--accent').trim();

    let width = 0;
    let height = 0;

    // The backing store follows the device pixel ratio; the CSS box does not.
    function resize() {
      const dpr = window.devicePixelRatio || 1;
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      // Assigning width/height resets the context, so this scale never stacks up.
      ctx.scale(dpr, dpr);
    }
    resize();

    function spawn(x: number, y: number, vx: number, vy: number) {
      const particle = pool[headRef.current];
      headRef.current = (headRef.current + 1) % MAX_PARTICLES;
      particle.x = x;
      particle.y = y;
      particle.vx = vx;
      particle.vy = vy;
      particle.size = 2 + Math.random() * 4;
      particle.life = 1;
      particle.accent = Math.random() < ACCENT_CHANCE;
    }

    let pointer: { x: number; y: number } | null = null;
    let pressing = false;
    let lastInputAt = 0;
    let lastIdleBurstAt = 0;

    function handlePointerMove(event: PointerEvent) {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      if (pointer !== null) {
        const dx = x - pointer.x;
        const dy = y - pointer.y;
        const speed = Math.hypot(dx, dy);
        let count = clamp(Math.round(speed / 4), 1, 12);
        if (reduced) count = Math.max(1, Math.round(count / 3));
        for (let i = 0; i < count; i += 1) {
          spawn(x, y, dx * 0.2 + (Math.random() * 2 - 1), dy * 0.2 + (Math.random() * 2 - 1));
        }
      }

      pointer = { x, y };
      lastInputAt = event.timeStamp;
      setHintHidden(true);
    }

    // Forgetting the last point avoids a fake jump when the pointer comes back.
    function handlePointerLeave() {
      pointer = null;
      pressing = false;
    }

    function handlePointerDown(event: PointerEvent) {
      pressing = true;
      lastInputAt = event.timeStamp;
    }

    function handlePointerUp() {
      pressing = false;
    }

    function update(now: number, dt: number) {
      // The constants are tuned per 60fps frame, so scale by how long this one was.
      const frames = dt / FRAME_MS;
      const damping = DAMPING ** frames;
      const lifeDrop = LIFE_PER_FRAME * frames * (reduced ? 2 : 1);

      // Nothing has happened for a while: breathe from the centre instead.
      if (now - lastInputAt > IDLE_AFTER_MS && now - lastIdleBurstAt > IDLE_EVERY_MS) {
        lastIdleBurstAt = now;
        const count = reduced ? 1 : 3;
        for (let i = 0; i < count; i += 1) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 0.3 + Math.random() * 0.5;
          spawn(width / 2, height / 2, Math.cos(angle) * speed, Math.sin(angle) * speed);
        }
      }

      for (const particle of pool) {
        if (particle.life <= 0) continue;

        // Holding the pointer down pulls nearby particles towards it.
        if (pressing && pointer !== null) {
          const dx = pointer.x - particle.x;
          const dy = pointer.y - particle.y;
          const distance = Math.hypot(dx, dy);
          if (distance > 0 && distance < PUSH_RADIUS) {
            particle.vx += (dx / distance) * PUSH_FORCE * frames;
            particle.vy += (dy / distance) * PUSH_FORCE * frames;
          }
        }

        particle.x += particle.vx * frames;
        particle.y += particle.vy * frames;
        particle.vx *= damping;
        particle.vy *= damping;
        particle.life -= lifeDrop;
      }
    }

    function render() {
      ctx.clearRect(0, 0, width, height);
      for (const particle of pool) {
        if (particle.life <= 0) continue;
        ctx.globalAlpha = particle.life;
        ctx.fillStyle = particle.accent ? accentColor : inkColor;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * particle.life, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    let frameId = 0;
    let previous = 0;

    function frame(now: number) {
      const dt = previous === 0 ? FRAME_MS : Math.min(now - previous, MAX_DT_MS);
      previous = now;
      if (lastInputAt === 0) lastInputAt = now;
      update(now, dt);
      render();
      frameId = requestAnimationFrame(frame);
    }
    frameId = requestAnimationFrame(frame);

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerleave', handlePointerLeave);
    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('pointercancel', handlePointerUp);

    return () => {
      cancelAnimationFrame(frameId);
      observer.disconnect();
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerleave', handlePointerLeave);
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('pointercancel', handlePointerUp);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [active]);

  return (
    <div className={styles.stage}>
      <canvas ref={canvasRef} className={styles.canvas} />
      <p className={hintHidden ? `${styles.hint} ${styles.hintHidden}` : styles.hint}>move</p>
    </div>
  );
}
