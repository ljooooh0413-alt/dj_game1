import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { LaserBeam, Particle, ScorePopup } from '../types/game';

export interface ParticleCanvasRef {
  addExplosion: (x: number, y: number, color: string, count?: number) => void;
  addScorePopup: (x: number, y: number, text: string, color?: string, isCombo?: boolean) => void;
  addLaserBeam: (type: 'row' | 'col', index: number, color: string) => void;
  triggerScreenShake: (intensity?: number) => void;
}

interface ParticleCanvasProps {
  width: number;
  height: number;
}

export const ParticleCanvas = forwardRef<ParticleCanvasRef, ParticleCanvasProps>(({ width, height }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const popupsRef = useRef<ScorePopup[]>([]);
  const lasersRef = useRef<LaserBeam[]>([]);
  const shakeRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);

  useImperativeHandle(ref, () => ({
    addExplosion: (x: number, y: number, color: string, count = 16) => {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 6;
        particlesRef.current.push({
          id: Math.random(),
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1.5,
          color,
          size: 3 + Math.random() * 5,
          alpha: 1,
          decay: 0.02 + Math.random() * 0.025,
          rotation: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 0.3,
          shape: Math.random() > 0.4 ? 'shard' : 'star',
        });
      }
    },
    addScorePopup: (x: number, y: number, text: string, color = '#FDE047', isCombo = false) => {
      popupsRef.current.push({
        id: Math.random(),
        x,
        y: y - 10,
        text,
        color,
        alpha: 1,
        scale: isCombo ? 1.4 : 1.0,
        isCombo,
      });
    },
    addLaserBeam: (type: 'row' | 'col', index: number, color = '#38BDF8') => {
      lasersRef.current.push({
        id: Math.random(),
        type,
        index,
        color,
        alpha: 1,
      });
    },
    triggerScreenShake: (intensity = 6) => {
      shakeRef.current = intensity;
    },
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;

    const render = () => {
      if (!isRunning) return;
      ctx.clearRect(0, 0, width, height);

      // 1. Draw Lasers
      const cellSize = width / 8;
      for (let i = lasersRef.current.length - 1; i >= 0; i--) {
        const laser = lasersRef.current[i];
        laser.alpha -= 0.04;
        if (laser.alpha <= 0) {
          lasersRef.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = laser.alpha;
        if (laser.type === 'row') {
          const cy = laser.index * cellSize + cellSize / 2;
          // Outer glow
          const grad = ctx.createLinearGradient(0, cy - cellSize / 2, 0, cy + cellSize / 2);
          grad.addColorStop(0, 'rgba(56, 189, 248, 0)');
          grad.addColorStop(0.5, laser.color);
          grad.addColorStop(1, 'rgba(56, 189, 248, 0)');
          ctx.fillStyle = grad;
          ctx.fillRect(0, cy - cellSize / 2, width, cellSize);

          // Intense core white beam
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, cy - 3, width, 6);
        } else {
          const cx = laser.index * cellSize + cellSize / 2;
          const grad = ctx.createLinearGradient(cx - cellSize / 2, 0, cx + cellSize / 2, 0);
          grad.addColorStop(0, 'rgba(56, 189, 248, 0)');
          grad.addColorStop(0.5, laser.color);
          grad.addColorStop(1, 'rgba(56, 189, 248, 0)');
          ctx.fillStyle = grad;
          ctx.fillRect(cx - cellSize / 2, 0, cellSize, height);

          // Intense core white beam
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(cx - 3, 0, 6, height);
        }
        ctx.restore();
      }

      // 2. Draw Particles (Gem Shards & Sparkles)
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.18; // gravity
        p.rotation += p.vRot;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particlesRef.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;

        if (p.shape === 'star') {
          // Draw 4-point sparkle star
          ctx.beginPath();
          const s = p.size;
          ctx.moveTo(0, -s);
          ctx.quadraticCurveTo(0, 0, s, 0);
          ctx.quadraticCurveTo(0, 0, 0, s);
          ctx.quadraticCurveTo(0, 0, -s, 0);
          ctx.quadraticCurveTo(0, 0, 0, -s);
          ctx.fill();
        } else {
          // Triangular faceted gem shard
          ctx.beginPath();
          ctx.moveTo(0, -p.size);
          ctx.lineTo(p.size * 0.8, p.size * 0.8);
          ctx.lineTo(-p.size * 0.8, p.size * 0.8);
          ctx.closePath();
          ctx.fill();

          // Highlight facet line
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }

        ctx.restore();
      }

      // 3. Draw Floating Popups (Score & Combos)
      for (let i = popupsRef.current.length - 1; i >= 0; i--) {
        const popup = popupsRef.current[i];
        popup.y -= 1.2;
        popup.alpha -= 0.02;

        if (popup.alpha <= 0) {
          popupsRef.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, popup.alpha);
        ctx.font = popup.isCombo ? 'bold 20px "Outfit", sans-serif' : 'bold 15px "Outfit", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Dark glow outline
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.lineWidth = 3;
        ctx.strokeText(popup.text, popup.x, popup.y);

        // Core text
        ctx.fillStyle = popup.color;
        ctx.fillText(popup.text, popup.x, popup.y);
        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute inset-0 pointer-events-none z-20"
      style={{
        transform: shakeRef.current > 0 ? `translate(${(Math.random() - 0.5) * shakeRef.current}px, ${(Math.random() - 0.5) * shakeRef.current}px)` : undefined,
      }}
    />
  );
});

ParticleCanvas.displayName = 'ParticleCanvas';
