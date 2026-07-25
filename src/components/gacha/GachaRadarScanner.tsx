/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AetheriaAudioEngine } from '../../utils/audio';

interface GachaRadarScannerProps {
  pullResults: { rarity: number; name: string }[];
  isScanning: boolean;
  onScanComplete: () => void;
}

export default function GachaRadarScanner({ pullResults, isScanning, onScanComplete }: GachaRadarScannerProps) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  const onScanCompleteRef = React.useRef(onScanComplete);
  const pullResultsRef = React.useRef(pullResults);
  const isScanningRef = React.useRef(isScanning);

  React.useEffect(() => {
    onScanCompleteRef.current = onScanComplete;
    pullResultsRef.current = pullResults;
    isScanningRef.current = isScanning;
  }, [onScanComplete, pullResults, isScanning]);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.parentElement?.clientWidth || 300;
    canvas.height = canvas.parentElement?.clientHeight || 180;

    let width = canvas.width;
    let height = canvas.height;

    let sweepAngle = 0;
    let sweepSpeed = 0.015;
    let targetSpeed = 0.015;

    let radarX = width / 2;
    let radarY = height / 2;
    const radarRadius = Math.min(width, height) * 0.44;
    const rings = [radarRadius * 0.25, radarRadius * 0.5, radarRadius * 0.75, radarRadius];

    interface RadarTarget {
      x: number;
      y: number;
      angle: number;
      radius: number;
      label: string;
      rarity: number;
      isLocked: boolean;
      alpha: number;
      twinkle: number;
      lockFlash: number;
    }

    let targets: RadarTarget[] = [];
    let state = 'idle'; // 'idle' | 'scanning' | 'flash'
    let flashOpacity = 0;
    let maxRarity = 3;

    const stars: Array<{ x: number; y: number; size: number; alpha: number; twinkleSpeed: number }> = [];
    for (let i = 0; i < 35; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.2 + 0.3,
        alpha: Math.random() * 0.7 + 0.2,
        twinkleSpeed: 0.01 + Math.random() * 0.02
      });
    }

    const initIdleTargets = () => {
      targets = [];
      const count = 3 + Math.floor(Math.random() * 3);
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = radarRadius * (0.2 + Math.random() * 0.65);
        const hex = Math.floor(Math.random() * 16777215).toString(16).toUpperCase().padStart(6, '0');
        targets.push({
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius,
          angle,
          radius,
          label: `SEC-${hex.substring(0, 3)}`,
          rarity: 3,
          isLocked: false,
          alpha: Math.random() * 0.5 + 0.3,
          twinkle: Math.random(),
          lockFlash: 0
        });
      }
    };
    initIdleTargets();

    let frameId: number;

    const loop = () => {
      ctx.clearRect(0, 0, width, height);

      stars.forEach(star => {
        star.alpha += star.twinkleSpeed;
        if (star.alpha > 0.95 || star.alpha < 0.1) star.twinkleSpeed = -star.twinkleSpeed;
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.1, star.alpha)})`;
        ctx.fillRect(star.x, star.y, star.size, star.size);
      });

      const currentIsScanning = isScanningRef.current;
      if (currentIsScanning && state === 'idle') {
        state = 'scanning';
        targetSpeed = 0.05;

        targets = [];
        const pulls = pullResultsRef.current || [];
        maxRarity = Math.max(...pulls.map(p => p.rarity), 3);

        pulls.forEach((item, index) => {
          const angle = (index / pulls.length) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
          const rRadius = rings[Math.floor(Math.random() * 3) + 1] - 12 + Math.random() * 8;
          const hex = Math.floor(Math.random() * 16777215).toString(16).toUpperCase().padStart(6, '0');

          targets.push({
            x: Math.cos(angle) * rRadius,
            y: Math.sin(angle) * rRadius,
            angle,
            radius: rRadius,
            label: `SYS-${hex.substring(0, 3)}`,
            rarity: item.rarity,
            isLocked: false,
            alpha: 1.0,
            twinkle: 0,
            lockFlash: 0
          });
        });
      }

      sweepSpeed += (targetSpeed - sweepSpeed) * 0.08;
      sweepAngle += sweepSpeed;

      ctx.save();
      ctx.translate(radarX, radarY);

      rings.forEach((r, idx) => {
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.strokeStyle = idx === rings.length - 1 ? 'rgba(99, 102, 241, 0.25)' : 'rgba(34, 211, 238, 0.08)';
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      ctx.strokeStyle = 'rgba(34, 211, 238, 0.1)';
      ctx.beginPath();
      ctx.moveTo(-radarRadius - 5, 0);
      ctx.lineTo(radarRadius + 5, 0);
      ctx.moveTo(0, -radarRadius - 5);
      ctx.lineTo(0, radarRadius + 5);
      ctx.stroke();

      ctx.save();
      ctx.rotate(sweepAngle);

      const sweepGrad = ctx.createRadialGradient(0, 0, 5, 0, 0, radarRadius);
      const mainColor = maxRarity === 5 ? 'rgba(245, 158, 11,' : maxRarity === 4 ? 'rgba(168, 85, 247,' : 'rgba(34, 211, 238,';
      sweepGrad.addColorStop(0, mainColor + ' 0.2)');
      sweepGrad.addColorStop(1, mainColor + ' 0.0)');

      ctx.fillStyle = sweepGrad;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      const tailAngle = -35 * (Math.PI / 180);
      ctx.arc(0, 0, radarRadius, tailAngle, 0, false);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(radarRadius, 0);
      ctx.strokeStyle = maxRarity === 5 ? '#fbbf24' : maxRarity === 4 ? '#c084fc' : '#22d3ee';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();

      let allLocked = true;
      targets.forEach(t => {
        t.twinkle += 0.04;
        const opacity = t.isLocked ? 1.0 : t.alpha * (0.6 + Math.sin(t.twinkle) * 0.4);

        let color = '#22d3ee';
        if (t.rarity === 5) color = '#fbbf24';
        else if (t.rarity === 4) color = '#c084fc';

        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.beginPath();
        ctx.arc(t.x, t.y, t.rarity >= 4 ? 4.5 : 3, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.shadowBlur = t.isLocked ? 12 : 4;
        ctx.shadowColor = color;
        ctx.fill();

        if (t.isLocked) {
          ctx.strokeStyle = color;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(t.x, t.y - 8);
          ctx.lineTo(t.x + 8, t.y);
          ctx.lineTo(t.x, t.y + 8);
          ctx.lineTo(t.x - 8, t.y);
          ctx.closePath();
          ctx.stroke();
        }

        if (t.lockFlash > 0) {
          ctx.beginPath();
          ctx.arc(t.x, t.y, (8 - t.lockFlash) * 2 + 4, 0, Math.PI * 2);
          ctx.strokeStyle = color;
          ctx.lineWidth = 1.5;
          ctx.globalAlpha = t.lockFlash / 8;
          ctx.stroke();
          t.lockFlash--;
        }

        ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
        ctx.font = '7.5px monospace';
        ctx.fillText(t.label, t.x + 9, t.y + 2.5);
        ctx.restore();

        if (state === 'scanning') {
          const normSweep = sweepAngle % (Math.PI * 2);
          const normTarget = (t.angle + Math.PI * 2) % (Math.PI * 2);
          const diff = Math.abs(normSweep - normTarget);
          if (diff < 0.16 && !t.isLocked) {
            t.isLocked = true;
            t.lockFlash = 8;
            AetheriaAudioEngine.playClick();
          }
          if (!t.isLocked) allLocked = false;
        }
      });

      ctx.restore();

      if (state === 'scanning' && allLocked && targets.length > 0) {
        state = 'flash';
        flashOpacity = 1.0;
      }

      if (state === 'flash') {
        ctx.fillStyle = `rgba(255, 255, 255, ${flashOpacity})`;
        ctx.fillRect(0, 0, width, height);
        flashOpacity -= 0.025;
        if (flashOpacity <= 0) {
          state = 'idle';
          targetSpeed = 0.015;
          initIdleTargets();
          onScanCompleteRef.current();
        }
      }

      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="w-full h-full bg-transparent" />;
}
