/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ElementType } from '../../types';
import { AetheriaAudioEngine } from '../../utils/audio';

interface GachaCanvasAnimationProps {
  pullResults: { rarity: number; isCharacter: boolean; name: string; element?: ElementType }[];
  onComplete: () => void;
}

export default function GachaCanvasAnimation({ pullResults, onComplete }: GachaCanvasAnimationProps) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  // Store variables in refs to prevent the loop useEffect from restarting on parent re-renders
  const onCompleteRef = React.useRef(onComplete);
  const pullResultsRef = React.useRef(pullResults);

  React.useEffect(() => {
    onCompleteRef.current = onComplete;
    pullResultsRef.current = pullResults;
  }, [onComplete, pullResults]);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
    canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;

    const width = canvas.width;
    const height = canvas.height;

    const currentPulls = pullResultsRef.current || [];
    const maxRarity = Math.max(...currentPulls.map(p => p.rarity), 3);
    const sortedPulls = [...currentPulls].sort((a, b) => b.rarity - a.rarity);

    const targetX = width * 0.35;
    const targetY = height * 0.65;
    const angle = Math.atan2(targetY + 50, targetX - (width + 50));

    // Pre-render glowing particle sprites on offscreen canvases for performance (White, Cyan, Purple, Gold)
    const spriteCache: Record<string, HTMLCanvasElement> = {};
    const spriteColors = {
      cyan: 'rgba(34, 211, 238, ',
      purple: 'rgba(192, 132, 252, ',
      gold: 'rgba(251, 191, 36, ',
      white: 'rgba(255, 255, 255, '
    };

    Object.keys(spriteColors).forEach(colorKey => {
      const offCanvas = document.createElement('canvas');
      offCanvas.width = 32;
      offCanvas.height = 32;
      const offCtx = offCanvas.getContext('2d');
      if (offCtx) {
        const grad = offCtx.createRadialGradient(16, 16, 1, 16, 16, 14);
        const col = spriteColors[colorKey as keyof typeof spriteColors];
        grad.addColorStop(0, col + '1.0)');
        grad.addColorStop(0.3, col + '0.6)');
        grad.addColorStop(0.6, col + '0.15)');
        grad.addColorStop(1, col + '0.0)');

        offCtx.fillStyle = grad;
        offCtx.beginPath();
        offCtx.arc(16, 16, 16, 0, Math.PI * 2);
        offCtx.fill();
        spriteCache[colorKey] = offCanvas;
      }
    });

    const getElementColors = (element?: string) => {
      switch (element?.toLowerCase()) {
        case 'pyro': return ['#ef4444', '#f97316', '#fbbf24'];
        case 'hydro': return ['#3b82f6', '#60a5fa', '#ffffff'];
        case 'electro': return ['#a855f7', '#c084fc', '#e9d5ff'];
        case 'cryo': return ['#22d3ee', '#38bdf8', '#ffffff'];
        case 'anemo': return ['#2dd4bf', '#a7f3d0', '#ffffff'];
        case 'geo': return ['#ca8a04', '#fbbf24', '#fef08a'];
        case 'dendro': return ['#22c55e', '#86efac', '#ffffff'];
        default: return ['#38bdf8', '#06b6d4', '#ffffff'];
      }
    };

    const stars: Array<{
      x: number;
      y: number;
      size: number;
      speed: number;
      vx: number;
      vy: number;
    }> = [];
    for (let i = 0; i < 100; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.5 + 0.4,
        speed: Math.random() * 1.2 + 0.4,
        vx: -(Math.random() * 0.8 + 0.2),
        vy: Math.random() * 0.8 + 0.2
      });
    }

    const meteors = sortedPulls.map((item, index) => {
      let pColor = '#06b6d4'; // 3★ Cyan
      let sColor = '#38bdf8';
      let sCacheKey = 'cyan';
      if (item.rarity === 5) {
        pColor = '#f59e0b'; // 5★ Amber
        sColor = '#fbbf24';
        sCacheKey = 'gold';
      } else if (item.rarity === 4) {
        pColor = '#a855f7'; // 4★ Purple
        sColor = '#c084fc';
        sCacheKey = 'purple';
      }

      // Parallel offset spacing
      const spreadOffset = sortedPulls.length === 1 ? 0 : (index - (sortedPulls.length - 1)/2) * 26;
      const perpX = Math.cos(angle + Math.PI/2) * spreadOffset;
      const perpY = Math.sin(angle + Math.PI/2) * spreadOffset;

      return {
        startX: width + 80 + perpX,
        startY: -80 + perpY,
        endX: targetX + perpX,
        endY: targetY + perpY,
        x: width + 80 + perpX,
        y: -80 + perpY,
        radius: item.rarity === 5 ? 12 : item.rarity === 4 ? 9 : 6,
        progress: 0,
        speed: (0.014 + Math.random() * 0.003) * 0.45, // 2.25x slower (0.45 speed multiplier)
        angle,
        delay: index * 10.2, // 2.25x staggered spacing
        rarity: item.rarity,
        element: item.element,
        primaryColor: pColor,
        secondaryColor: sColor,
        spriteKey: sCacheKey,
        isExploded: false,
        history: [] as Array<{ x: number; y: number }>
      };
    });

    const explosionParticles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      gravity: number;
      spriteKey: string;
      size: number;
      life: number;
      maxLife: number;
    }> = [];

    const shockwaves: Array<{
      x: number;
      y: number;
      radius: number;
      maxRadius: number;
      speed: number;
      color: string;
      alpha: number;
    }> = [];

    const lensFlares: Array<{
      x: number;
      y: number;
      width: number;
      maxWidth: number;
      height: number;
      alpha: number;
      color: string;
    }> = [];

    const cracks: Array<{
      segments: Array<{ x1: number; y1: number; x2: number; y2: number }>;
      alpha: number;
    }> = [];

    const generateScreenCrack = (x: number, y: number) => {
      const crackCount = 6;
      for (let i = 0; i < crackCount; i++) {
        const segments = [];
        let currX = x;
        let currY = y;
        let cAngle = (i / crackCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
        const totalLength = 80 + Math.random() * 120;
        const step = 20;

        for (let len = 0; len < totalLength; len += step) {
          const nextX = currX + Math.cos(cAngle) * step + (Math.random() - 0.5) * 12;
          const nextY = currY + Math.sin(cAngle) * step + (Math.random() - 0.5) * 12;
          segments.push({ x1: currX, y1: currY, x2: nextX, y2: nextY });
          currX = nextX;
          currY = nextY;
          cAngle += (Math.random() - 0.5) * 0.2;
        }
        cracks.push({ segments, alpha: 1.0 });
      }
    };

    let frameId: number;
    let timeScale = 1.0;
    let flashFrameCount = 0;
    let shakeFrameCount = 0;
    let vortexRotation = 0;
    let vortexPulse = 0;

    const loop = () => {
      ctx.save();

      // Screen Shake translation
      if (shakeFrameCount > 0) {
        const shakeIntensity = (maxRarity === 5 ? 12 : maxRarity === 4 ? 7 : 3) * (shakeFrameCount / 15);
        const dx = (Math.random() - 0.5) * 2 * shakeIntensity;
        const dy = (Math.random() - 0.5) * 2 * shakeIntensity;
        ctx.translate(dx, dy);
      }

      ctx.clearRect(0, 0, width, height);

      // Cosmic background
      ctx.fillStyle = '#030409';
      ctx.fillRect(0, 0, width, height);

      // Starfield warp rendering
      stars.forEach(star => {
        const warpMultiplier = (maxRarity === 5) ? 3.5 : 1.0;
        star.x += star.vx * star.speed * timeScale * warpMultiplier;
        star.y += star.vy * star.speed * timeScale * warpMultiplier;

        if (star.x < 0) { star.x = width; star.y = Math.random() * height; }
        if (star.y > height) { star.y = 0; star.x = Math.random() * width; }

        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        if (maxRarity === 5) {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
          ctx.lineWidth = star.size;
          ctx.beginPath();
          ctx.moveTo(star.x, star.y);
          ctx.lineTo(star.x - star.vx * 15, star.y - star.vy * 15);
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Dimensional vortex (Accretion disk)
      vortexRotation += 0.0087 * timeScale; // 2.25x slower accretion rotation
      vortexPulse += 0.022 * timeScale; // 2.25x slower accretion pulsing

      const vX = width * 0.35;
      const vY = height * 0.65;
      const pulseFactor = 1.0 + Math.sin(vortexPulse) * 0.05;

      ctx.save();
      ctx.translate(vX, vY);

      // Swirling outer rings (rendered with uniform stroke arcs to support all devices)
      ctx.rotate(vortexRotation);
      ctx.strokeStyle = maxRarity === 5 ? 'rgba(245, 158, 11, 0.2)' : maxRarity === 4 ? 'rgba(168, 85, 247, 0.15)' : 'rgba(6, 182, 212, 0.12)';
      ctx.lineWidth = 4;

      ctx.beginPath();
      const rX1 = 100 * pulseFactor;
      const rY1 = 30 * pulseFactor;
      for (let a = 0; a <= Math.PI * 2; a += 0.1) {
        const px = Math.cos(a) * rX1;
        const py = Math.sin(a) * rY1;
        if (a === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();

      ctx.rotate(-vortexRotation * 1.5);
      ctx.beginPath();
      const rX2 = 70 * pulseFactor;
      const rY2 = 20 * pulseFactor;
      for (let a = 0; a <= Math.PI * 2; a += 0.1) {
        const px = Math.cos(a) * rX2;
        const py = Math.sin(a) * rY2;
        if (a === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();

      // Dark Event Horizon center core
      ctx.fillStyle = '#020308';
      ctx.beginPath();
      ctx.arc(0, 0, 16 * pulseFactor, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      let activeMeteorsLeft = false;

      // Apply Time-Dilation / Bullet-time for 5-star right before impact
      if (maxRarity === 5) {
        const mainMeteor = meteors[0];
        if (mainMeteor && !mainMeteor.isExploded && mainMeteor.progress >= 0.72 && mainMeteor.progress < 0.94) {
          timeScale = Math.max(0.12, timeScale - 0.08); // Decelerate
        } else {
          timeScale = Math.min(1.0, timeScale + 0.08); // Return to normal
        }
      } else {
        timeScale = 1.0;
      }

      meteors.forEach(m => {
        if (m.delay > 0) {
          m.delay -= timeScale;
          activeMeteorsLeft = true;
          return;
        }

        if (!m.isExploded) {
          activeMeteorsLeft = true;
          m.progress += m.speed * timeScale;

          const t = m.progress;
          const easeT = 1 - Math.pow(1 - t, 3); // Cubic ease out

          // 3D perspective depth sizing
          const mRadius = m.radius * (0.3 + 0.7 * easeT);

          m.x = m.startX + (m.endX - m.startX) * easeT;
          m.y = m.startY + (m.endY - m.startY) * easeT;

          // Spiraling corkscrew wave offset calculation
          const perpAngle = m.angle + Math.PI / 2;
          const waveOffset = Math.sin(easeT * Math.PI * 2.5) * (m.rarity === 5 ? 18 : 12);
          m.x += Math.cos(perpAngle) * waveOffset;
          m.y += Math.sin(perpAngle) * waveOffset;

          // Update coordinate history for ribbon comet rendering
          m.history.push({ x: m.x, y: m.y });
          if (m.history.length > 8) m.history.shift();

          // Render glowing taper comets (smooth ribbon trails)
          if (m.history.length > 1) {
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(m.history[0].x, m.history[0].y);
            for (let hIdx = 1; hIdx < m.history.length; hIdx++) {
              ctx.lineTo(m.history[hIdx].x, m.history[hIdx].y);
            }
            ctx.strokeStyle = m.primaryColor;
            ctx.lineWidth = mRadius * 1.5;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.stroke();
            ctx.restore();
          }

          // Draw comet head
          ctx.save();
          ctx.beginPath();
          ctx.arc(m.x, m.y, mRadius, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.shadowBlur = 15;
          ctx.shadowColor = m.secondaryColor;
          ctx.fill();
          ctx.restore();

          // Destination reached
          if (m.progress >= 1.0) {
            m.isExploded = true;
            m.x = m.endX;
            m.y = m.endY;

            shakeFrameCount = 15;
            flashFrameCount = 12;
            AetheriaAudioEngine.playSummonExplosion(m.rarity);

            // Generate Screen Crack on 5-Star impact
            if (m.rarity === 5) {
              generateScreenCrack(m.endX, m.endY);
            }

            // Shockwave Rings
            const ringColors = m.rarity === 5 ? ['#fbbf24', '#fb7185', '#ffffff'] : m.rarity === 4 ? ['#c084fc', '#818cf8', '#ffffff'] : ['#22d3ee', '#38bdf8'];
            ringColors.forEach((color, idx) => {
              shockwaves.push({
                x: m.endX,
                y: m.endY,
                radius: 5,
                maxRadius: 100 + idx * 40 + (m.rarity === 5 ? 60 : 20),
                speed: 4.5 + idx * 2,
                color,
                alpha: 1.0
              });
            });

            // Anamorphic Lens Flare
            lensFlares.push({
              x: m.endX,
              y: m.endY,
              width: 10,
              maxWidth: width * 0.8,
              height: m.rarity === 5 ? 8 : m.rarity === 4 ? 6 : 4,
              alpha: 1.0,
              color: m.secondaryColor
            });

            // Map colors for Element-Specific explosions
            const sparkColors = m.element ? getElementColors(m.element) : [m.secondaryColor, m.primaryColor, '#ffffff'];

            // Spawn explosion sparks
            const burstCount = m.rarity === 5 ? 85 : m.rarity === 4 ? 50 : 25;
            for (let k = 0; k < burstCount; k++) {
              const angle = Math.random() * Math.PI * 2;
              const speed = Math.random() * (m.rarity === 5 ? 6 : m.rarity === 4 ? 4.5 : 3.5) + 1;
              const color = sparkColors[Math.floor(Math.random() * sparkColors.length)];

              // Assign a sprite cache key for hardware acceleration
              let key = 'white';
              if (color.includes('#fb') || color.includes('#eab') || color.includes('#f97')) key = 'gold';
              else if (color.includes('#c0') || color.includes('#a8') || color.includes('#81')) key = 'purple';
              else if (color.includes('#22') || color.includes('#3b') || color.includes('#60')) key = 'cyan';

              explosionParticles.push({
                x: m.endX,
                y: m.endY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                gravity: Math.random() * 0.08 + 0.03, // curve downward
                spriteKey: key,
                size: Math.random() * (mRadius * 0.85) + 1.5,
                life: 0,
                maxLife: 35 + Math.random() * 30
              });
            }
          }
        }
      });

      // Trigger finish once all active particles/flares have finished exploding
      if (!activeMeteorsLeft && explosionParticles.length === 0 && shockwaves.length === 0 && lensFlares.length === 0 && cracks.length === 0) {
        ctx.restore();
        onCompleteRef.current();
        return;
      }

      // Draw Hardware-Accelerated hardware explosion particles
      const activeGroups: Record<string, Array<{ x: number; y: number; size: number; alpha: number }>> = {
        white: [], gold: [], purple: [], cyan: []
      };

      for (let i = explosionParticles.length - 1; i >= 0; i--) {
        const ep = explosionParticles[i];
        ep.x += ep.vx * timeScale;
        ep.y += ep.vy * timeScale;
        ep.vy += ep.gravity * timeScale; // gravity pull
        ep.vx *= 0.97;
        ep.vy *= 0.97;
        ep.life += timeScale;

        if (ep.life >= ep.maxLife) {
          explosionParticles.splice(i, 1);
        } else {
          const alpha = 1 - ep.life / ep.maxLife;
          activeGroups[ep.spriteKey].push({ x: ep.x, y: ep.y, size: ep.size, alpha });
        }
      }

      // Render batched particle sprites from offscreen canvas
      Object.keys(activeGroups).forEach(key => {
        const items = activeGroups[key];
        if (items.length === 0) return;
        const spriteImg = spriteCache[key];
        if (!spriteImg) return;

        items.forEach(item => {
          ctx.save();
          ctx.globalAlpha = item.alpha;
          ctx.drawImage(
            spriteImg,
            item.x - item.size,
            item.y - item.size,
            item.size * 2,
            item.size * 2
          );
          ctx.restore();
        });
      });

      // Update and draw shockwaves
      for (let i = shockwaves.length - 1; i >= 0; i--) {
        const sw = shockwaves[i];
        sw.radius += sw.speed * timeScale;
        sw.alpha = 1 - sw.radius / sw.maxRadius;

        if (sw.alpha <= 0) {
          shockwaves.splice(i, 1);
        } else {
          ctx.save();
          ctx.globalAlpha = sw.alpha;
          ctx.beginPath();
          ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
          ctx.strokeStyle = sw.color;
          ctx.lineWidth = 3;
          ctx.stroke();
          ctx.restore();
        }
      }

      // Update and draw lens flares
      for (let i = lensFlares.length - 1; i >= 0; i--) {
        const lf = lensFlares[i];
        lf.width += (lf.maxWidth - lf.width) * 0.15 * timeScale;
        lf.alpha -= 0.04 * timeScale;

        if (lf.alpha <= 0) {
          lensFlares.splice(i, 1);
        } else {
          ctx.save();
          ctx.fillStyle = lf.color;
          ctx.globalAlpha = lf.alpha;
          ctx.beginPath();
          ctx.moveTo(lf.x - lf.width, lf.y);
          ctx.lineTo(lf.x, lf.y - lf.height);
          ctx.lineTo(lf.x + lf.width, lf.y);
          ctx.lineTo(lf.x, lf.y + lf.height);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }
      }

      // Draw screen dimensional cracks
      for (let i = cracks.length - 1; i >= 0; i--) {
        const crack = cracks[i];
        crack.alpha -= 0.02 * timeScale;
        if (crack.alpha <= 0) {
          cracks.splice(i, 1);
        } else {
          ctx.save();
          ctx.strokeStyle = `rgba(251, 191, 36, ${crack.alpha * 0.8})`;
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#fbbf24';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          crack.segments.forEach(seg => {
            ctx.moveTo(seg.x1, seg.y1);
            ctx.lineTo(seg.x2, seg.y2);
          });
          ctx.stroke();
          ctx.restore();
        }
      }

      // Bottom HUD message
      if (meteors.length > 0 && meteors[0].progress > 0.05 && meteors[0].progress < 0.98) {
        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
        ctx.font = 'bold 12px "Space Grotesk", "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        const label = maxRarity === 5
          ? '★ D I V I N E   S I G N A L   A L I G N E D ★'
          : maxRarity === 4
            ? '★ S T E L L A R   H A R M O N Y   D E T E C T E D ★'
            : '★ A L I G N I N G   C O S M O S ★';
        ctx.fillText(label, width / 2, height * 0.85);
        ctx.restore();
      }

      ctx.restore(); // Restore shake translation

      // Draw white screen flash
      if (flashFrameCount > 0) {
        const opacity = flashFrameCount / 12;
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.fillRect(0, 0, width, height);
        flashFrameCount--;
      }

      if (shakeFrameCount > 0) shakeFrameCount--;

      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-[#04060c] z-55 flex items-center justify-center overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full bg-transparent z-10" />
      <button
        onClick={onComplete}
        className="absolute bottom-4 left-4 lg:top-6 lg:right-6 lg:bottom-auto lg:left-auto z-50 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg backdrop-blur-md text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 shadow-md shadow-black/30 select-none"
      >
        Skip Sequence
      </button>
    </div>
  );
}
