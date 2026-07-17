/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PLAYABLE_CHARACTERS } from '../data/characters';
import { WEAPONS_DATABASE } from '../data/weapons';
import { PlayableCharacter, ElementType, Weapon } from '../types';
import { Sparkles, HelpCircle, History, RefreshCw, Star, X, Info, Shield, Sword, Eye, Sparkle } from 'lucide-react';
import { AetheriaAudioEngine } from '../utils/audio';
import { LanguageType, t } from '../utils/i18n';
import { DAY_MS, getLimitedCharacterBannerForTime, getStandardFiveStarCharacters } from '../utils/limitedBanners';
import {
  FIVE_STAR_BASE_RATE,
  FOUR_STAR_BASE_RATE,
  getDuplicateWeaponMoraRefund,
  isFiveStarRoll,
  isFourStarRoll
} from '../utils/gachaEconomy';
import aureliaBanner from '../../assets/aurelia_banner.jpg';
import kaelenBanner from '../../assets/kaelen_banner.jpg';
import maelisBanner from '../../assets/maelis_banner.jpg';
import veyraBanner from '../../assets/veyra_banner.jpg';
import weaponBanner from '../../assets/weapon_banner.jpg';
import standardBanner from '../../assets/standard_banner.jpg';

const getBannerImage = (featured5StarId: string, type: 'character' | 'weapon') => {
  if (type === 'weapon') return weaponBanner;
  if (featured5StarId === 'aurelia') return aureliaBanner;
  if (featured5StarId === 'kaelen') return kaelenBanner;
  if (featured5StarId === 'maelis') return maelisBanner;
  if (featured5StarId === 'veyra') return veyraBanner;
  if (featured5StarId === 'standard_banner') return standardBanner;
  return aureliaBanner;
};

interface BannerArtworkLayout {
  desktopPosition: string;
  mobilePosition: string;
}

const BANNER_ARTWORK_LAYOUTS: Record<string, BannerArtworkLayout> = {
  aurelia: { desktopPosition: 'center 26%', mobilePosition: '66% 16%' },
  kaelen: { desktopPosition: 'center 26%', mobilePosition: '66% 16%' },
  maelis: { desktopPosition: 'center 24%', mobilePosition: '66% 16%' },
  veyra: { desktopPosition: 'center 28%', mobilePosition: '66% 14%' },
  standard_banner: { desktopPosition: '58% 30%', mobilePosition: '68% 25%' },
  weapon: { desktopPosition: '60% 40%', mobilePosition: '66% 38%' },
};

const getBannerArtworkLayout = (featured5StarId: string, type: 'character' | 'weapon'): BannerArtworkLayout => {
  if (type === 'weapon') return BANNER_ARTWORK_LAYOUTS.weapon;
  return BANNER_ARTWORK_LAYOUTS[featured5StarId] ?? {
    desktopPosition: 'center 24%',
    mobilePosition: '66% 18%',
  };
};

const getBannerGradient = (featured5StarId: string, type: 'character' | 'weapon') => {
  if (type === 'weapon') {
    return 'linear-gradient(to right, rgba(15, 10, 15, 0.95) 0%, rgba(15, 10, 15, 0.7) 55%, rgba(15, 10, 15, 0.2) 100%)';
  }
  if (featured5StarId === 'aurelia') {
    return 'linear-gradient(to right, rgba(16, 10, 10, 0.95) 0%, rgba(16, 10, 10, 0.7) 55%, rgba(16, 10, 10, 0.2) 100%)';
  }
  if (featured5StarId === 'kaelen') {
    return 'linear-gradient(to right, rgba(10, 16, 28, 0.95) 0%, rgba(10, 16, 28, 0.7) 55%, rgba(10, 16, 28, 0.2) 100%)';
  }
  if (featured5StarId === 'maelis') {
    return 'linear-gradient(to right, rgba(5, 20, 13, 0.96) 0%, rgba(5, 20, 13, 0.72) 55%, rgba(5, 20, 13, 0.24) 100%)';
  }
  if (featured5StarId === 'veyra') {
    return 'linear-gradient(to right, rgba(12, 8, 28, 0.96) 0%, rgba(12, 8, 28, 0.72) 55%, rgba(12, 8, 28, 0.24) 100%)';
  }
  if (featured5StarId === 'standard_banner') {
    return 'linear-gradient(to right, rgba(15, 12, 28, 0.95) 0%, rgba(15, 12, 28, 0.7) 55%, rgba(15, 12, 28, 0.2) 100%)';
  }
  return 'linear-gradient(to right, rgba(11, 15, 25, 0.95) 0%, rgba(11, 15, 25, 0.75) 55%, rgba(11, 15, 25, 0.3) 100%)';
};

interface GachaCanvasAnimationProps {
  pullResults: { rarity: number; isCharacter: boolean; name: string; element?: ElementType }[];
  onComplete: () => void;
}

function GachaCanvasAnimation({ pullResults, onComplete }: GachaCanvasAnimationProps) {
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
    <div className="absolute inset-0 bg-[#04060c] z-50 flex items-center justify-center overflow-hidden">
      <button
        onClick={onComplete}
        className="absolute top-6 right-6 z-55 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg backdrop-blur-md text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 shadow-md shadow-black/30 select-none"
      >
        Skip Sequence
      </button>
      <canvas ref={canvasRef} className="w-full h-full bg-transparent" />
    </div>
  );
}

interface GachaRadarScannerProps {
  pullResults: { rarity: number; name: string }[];
  isScanning: boolean;
  onScanComplete: () => void;
}

function GachaRadarScanner({ pullResults, isScanning, onScanComplete }: GachaRadarScannerProps) {
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

interface GachaSimulatorProps {
  aetherGems: number;
  mora: number;
  onModifyCurrencies: (gemsDiff: number, moraDiff: number) => void;
  ownedCharacterIds: string[];
  onUnlockCharacter: (id: string) => void;
  onAddWeapon?: (weapon: Weapon) => void;
  inventoryWeapons?: Weapon[];
  characterPortraits?: Record<string, number>;
  bannerPity5Star: Record<string, number>;
  bannerPity4Star: Record<string, number>;
  bannerGuaranteed5Star: Record<string, boolean>;
  onUpdatePity: (bannerId: string, pity5: number, pity4: number, guaranteed5?: boolean) => void;
  onLogPulls: (items: { name: string; rarity: number }[]) => void;
  pullHistoryList: { name: string; rarity: number; time: string }[];
  onShowAlert: (msg: string, solution?: string, type?: 'success' | 'error' | 'info') => void;
  devCheatsEnabled?: boolean;
  language?: LanguageType;
  onNavigateToWikiChar?: (charId: string) => void;
  onNavigateToWikiWeapon?: (weaponName: string) => void;
}

interface BannerDetails {
  id: string;
  title: string;
  subtitle: string;
  desc: string;
  type: 'character' | 'weapon';
  featured5Star: string;
  featured5StarId: string; // character id or weapon spec
  featured4Stars: string[];
  tag: string;
  themeColor: string; // border/glow class
  gradientStyle: string; // bg gradient
  details: string;
}

const BANNERS: BannerDetails[] = [
  {
    id: 'char_banner_1',
    title: 'Solar Crucible Dawning',
    subtitle: 'LIMITED BANNER',
    desc: 'Unleash the ultimate power of solar flames! Greatly enhanced drop-rates for 5★ Aurelia Sunflare. Commands lightning fast Sword slashes.',
    type: 'character',
    featured5Star: 'Aurelia Sunflare',
    featured5StarId: 'aurelia',
    featured4Stars: ['Ignis Hearthward', 'Raijin Volt'],
    tag: 'LIMITED BANNER',
    themeColor: 'border-orange-500/50 shadow-[0_0_20px_rgba(244,63,94,0.15)]',
    gradientStyle: 'from-orange-950/70 via-[#100d1c] to-[#08070f]',
    details: '5★ Rate: 50% chance to summon Aurelia Sunflare [EVENT LIMITED]. If not, any other random 5★ champion.'
  },
  {
    id: 'char_banner_2',
    title: 'Wanderlust Invocation',
    subtitle: 'STANDARD BANNER',
    desc: 'Summon standard characters with standard rates. A random 5★ champion is guaranteed on every 5★ drop. Includes Lyra, Zephyr, Goliath, and Raijin.',
    type: 'character',
    featured5Star: 'Lyra Frostbloom',
    featured5StarId: 'standard_banner',
    featured4Stars: ['Ignis Hearthward', 'Marina Dewdrop', 'Lyra Frostbloom', 'Raijin Volt', 'Tessa Shardweaver', 'Varek Ironfist'],
    tag: 'STANDARD BANNER',
    themeColor: 'border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.15)]',
    gradientStyle: 'from-indigo-950/70 via-[#0d1020] to-[#05060f]',
    details: '5★ Rate: 100% chance to summon a random standard 5★ character. Excludes limited event characters.'
  },
  {
    id: 'weapon_banner_1',
    title: 'Epitome Invocation: Custom Armory',
    subtitle: 'LEGENDARY WEAPON INVOCATION',
    desc: 'Forge your armaments with absolute accuracy! Select your desired 5★ Legendary Weapon and obtain it with a 100% guarantee on your next 5★ pull!',
    type: 'weapon',
    featured5Star: 'Solar Searing Blade (Sword)',
    featured5StarId: 'w_solar_searing',
    featured4Stars: ['Favonius Greatsword', 'Sacrificial Sword'],
    tag: '5★ Custom Weapon Selector',
    themeColor: 'border-rose-500/50 shadow-[0_0_20px_rgba(239,68,68,0.15)]',
    gradientStyle: 'from-rose-950/60 via-[#1c0d12] to-[#0f0709]',
    details: 'Guaranteed selected 5★ target weapon on roll. Select your weapon below.'
  }
];

export default function GachaSimulator({
  aetherGems,
  mora,
  onModifyCurrencies,
  ownedCharacterIds,
  onUnlockCharacter,
  onAddWeapon,
  inventoryWeapons = [],
  characterPortraits = {},
  bannerPity5Star,
  bannerPity4Star,
  bannerGuaranteed5Star = {},
  onUpdatePity,
  onLogPulls,
  pullHistoryList,
  onShowAlert,
  devCheatsEnabled = true,
  language = 'en',
  onNavigateToWikiChar,
  onNavigateToWikiWeapon
}: GachaSimulatorProps) {
  const [selectedBannerIdx, setSelectedBannerIdx] = useState(0);
  const [pulling, setPulling] = useState(false);
  const [currentPullResults, setCurrentPullResults] = useState<{ id: string; name: string; rarity: number; isCharacter: boolean; element?: ElementType; isNew?: boolean; nextPortrait?: number | null }[]>([]);
  const [showSplashItem, setShowSplashItem] = useState<{ id: string; name: string; rarity: number; isCharacter: boolean; element?: ElementType } | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [showRatesInfo, setShowRatesInfo] = useState(false);
  const [showBannerDetails, setShowBannerDetails] = useState(false);
  const [animationPhase, setAnimationPhase] = useState<'none' | 'radar' | 'meteor' | 'showcase'>('none');
  const [maxRarityInPull, setMaxRarityInPull] = useState(3);
  const [selectedWeaponName, setSelectedWeaponName] = useState<string>('Solar Searing Blade');
  const [devFeaturedOffset, setDevFeaturedOffset] = useState(0);

  const [msRemaining, setMsRemaining] = useState(DAY_MS - (Date.now() % DAY_MS));
  
  useEffect(() => {
    const timer = setInterval(() => {
      setMsRemaining(DAY_MS - (Date.now() % DAY_MS));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const activeLimitedBanner = getLimitedCharacterBannerForTime(Date.now(), devFeaturedOffset);

  const limitedRotationBanners = BANNERS.map(banner => {
    if (banner.id === 'char_banner_1') {
      return { ...banner, ...activeLimitedBanner };
    }
    return banner;
  });

  const rawActiveBanner = limitedRotationBanners[selectedBannerIdx] || limitedRotationBanners[0];
  const activeBanner = rawActiveBanner.type === 'weapon' ? {
    ...rawActiveBanner,
    featured5Star: selectedWeaponName,
    tag: `5★ ${selectedWeaponName}`,
    details: `GUARANTEED target: 5★ ${selectedWeaponName}. No 50/50. Select your target below.`
  } : rawActiveBanner;
  const artworkLayout = getBannerArtworkLayout(activeBanner.featured5StarId, activeBanner.type);

  const hours = Math.floor(msRemaining / 3600000);
  const minutes = Math.floor((msRemaining % 3600000) / 60000);
  const seconds = Math.floor((msRemaining % 60000) / 1000);
  const timerString = `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;

  const activePity5 = bannerPity5Star[activeBanner.id] ?? 0;
  const activePity4 = bannerPity4Star[activeBanner.id] ?? 0;

  const getElementColor = (element?: ElementType) => {
    if (!element) return 'text-slate-400';
    switch (element) {
      case 'Pyro': return 'text-rose-400';
      case 'Hydro': return 'text-cyan-300';
      case 'Cryo': return 'text-sky-200';
      case 'Electro': return 'text-purple-300';
      case 'Anemo': return 'text-emerald-350';
      case 'Geo': return 'text-amber-400';
      case 'Dendro': return 'text-green-300';
    }
  };

  const createWeaponFromPull = (name: string, rarity: 3 | 4 | 5): Weapon => {
    // Attempt to lookup exact template properties from our complete 30-weapons database
    const template = WEAPONS_DATABASE.find(w => w.name.toLowerCase().replace(/\s*\(.*\)/, '') === name.toLowerCase().replace(/\s*\(.*\)/, '')) 
      || WEAPONS_DATABASE.find(w => w.rarity === rarity) 
      || WEAPONS_DATABASE[0];

    return {
      id: 'w_' + Date.now() + '_' + Math.floor(Math.random() * 1000000),
      name: template.name,
      rarity: template.rarity,
      weaponType: template.weaponType,
      baseAtk: template.baseAtk,
      statBonus: template.statBonus,
      level: 1
    };
  };

  const executeWishPulls = (pullCount: number) => {
    // 10 Pull gets a nice discount: only 1440 Gems instead of 1600!
    const cost = pullCount === 10 ? 1440 : pullCount * 160;
    if (aetherGems < cost) {
      onShowAlert(
        "Insufficient Aether Gems to perform celestial wishes.",
        devCheatsEnabled
          ? "Claim free developer rewards using '+20,000 Gems Tool' in the upper summon header, or clear campaign waves to claim massive quest tokens!"
          : "Clear campaign waves, complete quests, or advance in story mode to claim massive quest tokens!",
        "error"
      );
      return;
    }

    onModifyCurrencies(-cost, 0);
    setPulling(true);
    setAnimationPhase('radar');
    AetheriaAudioEngine.playClick();
    
    let localPity5 = activePity5;
    let localPity4 = activePity4;
    let localGuaranteed5 = bannerGuaranteed5Star[activeBanner.id] ?? false;
    let maxRarity = 3;

    const initialOwnedChars = new Set(ownedCharacterIds);
    const initialOwnedWeapons = new Set(inventoryWeapons.map(w => w.name));
    const tempPortraits = { ...characterPortraits };

    const results: { id: string; name: string; rarity: number; isCharacter: boolean; element?: ElementType; isNew?: boolean; nextPortrait?: number | null }[] = [];
    const pullsToLog: { name: string; rarity: number }[] = [];
    let duplicateWeaponRefundTotal = 0;
    const duplicateWeaponRefunds: { name: string; rarity: 3 | 4 | 5; mora: number }[] = [];

    for (let i = 0; i < pullCount; i++) {
      localPity5++;
      localPity4++;

      let rolledRarity = 3;
      let isChar = false;
      let rolledId = '';
      let rolledName = '';
      let element: ElementType | undefined = undefined;

      const rand = Math.random();

      // check 5-star threshold (Hard pity at 90)
      const isFiveStar = isFiveStarRoll(rand, localPity5);
      
      if (isFiveStar) {
        rolledRarity = 5;
        localPity5 = 0;

        if (activeBanner.type === 'character') {
          isChar = true;
          
          if (activeBanner.id === 'char_banner_2') {
            const standardFiveStars = getStandardFiveStarCharacters(PLAYABLE_CHARACTERS);
            const chosen = standardFiveStars.length > 0 
              ? standardFiveStars[Math.floor(Math.random() * standardFiveStars.length)]
              : PLAYABLE_CHARACTERS.find(c => c.id === 'lyra')!;
            rolledId = chosen.id;
            rolledName = chosen.name;
            element = chosen.element;
            localGuaranteed5 = false;
          } else {
            // LIMITED BANNER: 50/50 chance to get featured current character
            const isGuaranteed = localGuaranteed5;
            if (isGuaranteed || Math.random() < 0.5) {
              const chosen = PLAYABLE_CHARACTERS.find(c => c.id === activeBanner.featured5StarId);
              if (chosen) {
                rolledId = chosen.id;
                rolledName = chosen.name;
                element = chosen.element;
              }
              localGuaranteed5 = false;
            } else {
              // Losing 50/50 always rolls from standard 5-stars only.
              const standardFiveStars = getStandardFiveStarCharacters(PLAYABLE_CHARACTERS);
              const chosen = standardFiveStars.length > 0 
                ? standardFiveStars[Math.floor(Math.random() * standardFiveStars.length)]
                : PLAYABLE_CHARACTERS.find(c => c.id === activeBanner.featured5StarId)!;
              rolledId = chosen.id;
              rolledName = chosen.name;
              element = chosen.element;
              
              localGuaranteed5 = true;
            }
          }
        } else {
          // WEAPON CUSTOM BANNER: 100% Guaranteed self-selected 5★ Weapon drop!
          isChar = false;
          rolledId = 'weapon_5star';
          rolledName = selectedWeaponName;
        }
      } 
      // check 4-star threshold (Hard pity at 10)
      else if (isFourStarRoll(rand, localPity4)) {
        rolledRarity = 4;
        localPity4 = 0;

        if (activeBanner.type === 'character') {
          isChar = true;
          const fourStars = PLAYABLE_CHARACTERS.filter(c => c.rarity === 4);
          const chosen = fourStars[Math.floor(Math.random() * fourStars.length)];
          rolledId = chosen.id;
          rolledName = chosen.name;
          element = chosen.element;
        } else {
          // Weapon banner four star: 100% Weapon
          isChar = false;
          const fourStarWeapons = WEAPONS_DATABASE.filter(w => w.rarity === 4);
          const chosen = fourStarWeapons[Math.floor(Math.random() * fourStarWeapons.length)];
          rolledName = chosen.name;
          rolledId = 'weapon_4star';
        }
      } 
      // 3-star standard roll (Hero on hero banner, Weapon on weapon banner)
      else {
        rolledRarity = 3;
        if (activeBanner.type === 'character') {
          isChar = true;
          const threeStars = PLAYABLE_CHARACTERS.filter(c => c.rarity === 3);
          const chosen = threeStars[Math.floor(Math.random() * threeStars.length)] || PLAYABLE_CHARACTERS[0];
          rolledId = chosen.id;
          rolledName = chosen.name;
          element = chosen.element;
        } else {
          isChar = false;
          const threeStarWeapons = WEAPONS_DATABASE.filter(w => w.rarity === 3);
          const chosen = threeStarWeapons[Math.floor(Math.random() * threeStarWeapons.length)];
          rolledName = chosen.name;
          rolledId = 'weapon_3star';
        }
      }

      if (rolledRarity > maxRarity) {
        maxRarity = rolledRarity;
      }

      let isNew = false;
      let nextPortrait: number | null = null;
      let duplicateWeaponRefund = 0;

      if (isChar && rolledId) {
        if (!initialOwnedChars.has(rolledId)) {
          isNew = true;
          initialOwnedChars.add(rolledId);
        } else {
          const currentLvl = tempPortraits[rolledId] || 0;
          const nextLvl = Math.min(6, currentLvl + 1);
          tempPortraits[rolledId] = nextLvl;
          nextPortrait = nextLvl;
        }
      } else {
        // Weapon
        if (!initialOwnedWeapons.has(rolledName)) {
          isNew = true;
          initialOwnedWeapons.add(rolledName);
        } else {
          duplicateWeaponRefund = getDuplicateWeaponMoraRefund(rolledRarity as 3 | 4 | 5);
          duplicateWeaponRefundTotal += duplicateWeaponRefund;
          duplicateWeaponRefunds.push({
            name: rolledName,
            rarity: rolledRarity as 3 | 4 | 5,
            mora: duplicateWeaponRefund
          });
        }
      }

      results.push({
        id: rolledId,
        name: rolledName,
        rarity: rolledRarity,
        isCharacter: isChar,
        element,
        isNew,
        nextPortrait
      });
      
      // Handle actual inventory unlocks and transfers in database ledger
      if (isChar && rolledId) {
        onUnlockCharacter(rolledId);
      } else {
        // If it is a weapon, dynamically forge and gift to player roster inventory so they can equip and refine!
        if (duplicateWeaponRefund > 0) {
          // Duplicate weapon copies are converted to Mora below.
        } else if (onAddWeapon) {
          const weaponObj = createWeaponFromPull(rolledName, rolledRarity as 3 | 4 | 5);
          onAddWeapon(weaponObj);
        }
      }
      
      pullsToLog.push({ name: rolledName, rarity: rolledRarity });
    }

    onLogPulls(pullsToLog);
    if (duplicateWeaponRefundTotal > 0) {
      onModifyCurrencies(0, duplicateWeaponRefundTotal);
      const topRefund = duplicateWeaponRefunds.sort((a, b) => b.rarity - a.rarity)[0];
      onShowAlert(
        "Duplicate weapon converted to Mora.",
        `${topRefund.name} and duplicate weapon copies returned +${duplicateWeaponRefundTotal.toLocaleString()} Mora to your account.`,
        "success"
      );
    }
    setMaxRarityInPull(maxRarity);
    onUpdatePity(activeBanner.id, localPity5, localPity4, localGuaranteed5);
    setCurrentPullResults(results);

    // Play the rising swoop audio sweep
    AetheriaAudioEngine.playSummonSwoop(maxRarity);

  };

  const handleAnimationComplete = () => {
    setAnimationPhase('showcase');
    if (maxRarityInPull >= 4) {
      AetheriaAudioEngine.playUltimate();
    } else {
      AetheriaAudioEngine.playWaveClear();
    }
    setPulling(false);
  };

  const getMeteorImageColor = () => {
    if (maxRarityInPull === 5) return 'shadow-[0_0_80px_rgba(251,191,36,0.7)] border-amber-300';
    if (maxRarityInPull === 4) return 'shadow-[0_0_60px_rgba(168,85,247,0.6)] border-purple-400';
    return 'shadow-[0_0_40px_rgba(6,182,212,0.4)] border-cyan-500';
  };

  return (
    <div className="bg-[#0b0f19]/85 border border-white/10 rounded-xl overflow-hidden p-5 relative flex flex-col h-full shadow-[0_10px_40px_rgba(0,0,0,0.6)] backdrop-blur-md min-h-[600px]" id="gacha_main_container">
      
      {/* Absolute floating glowing overlay during wishing meteor */}
      {animationPhase === 'meteor' && (
        <GachaCanvasAnimation 
          pullResults={currentPullResults} 
          onComplete={handleAnimationComplete} 
        />
      )}

      {/* Splash card popup for 4* or 5* characters/weapons */}
      <AnimatePresence>
        {showSplashItem && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 bg-[#04060c]/95 z-55 flex items-center justify-center p-4"
            onClick={() => setShowSplashItem(null)}
          >
            <motion.div 
              initial={{ scale: 0.85, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.85, y: -30 }}
              transition={{ type: "spring", damping: 15 }}
              className="bg-[#0b101e] max-w-md w-full border border-white/10 rounded-2xl p-6 shadow-[0_0_120px_rgba(251,191,36,0.15)] relative text-center flex flex-col justify-between min-h-[460px]"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setShowSplashItem(null)} 
                className="absolute top-4 right-4 p-2 bg-white/5 text-slate-400 hover:text-slate-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-6 flex-1 flex flex-col justify-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-amber-400 font-display flex justify-center items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> NEW UNLOCKED ACQUISITION
                </p>
                
                {/* Visual Avatar / Weapon icon frame */}
                <div className="flex justify-center">
                  <div className={`w-28 h-28 rounded-2xl flex items-center justify-center text-4xl font-black text-slate-950 relative border shadow-[0_0_35px_rgba(0,0,0,0.5)] ${
                    showSplashItem.isCharacter 
                      ? (PLAYABLE_CHARACTERS.find(c => c.id === showSplashItem.id)?.avatarPlaceholder || 'bg-amber-550')
                      : 'bg-gradient-to-tr from-slate-700 via-indigo-950 to-slate-900 border-indigo-400/30 text-indigo-200'
                  }`}>
                    {showSplashItem.isCharacter ? (
                      showSplashItem.name.charAt(0)
                    ) : (
                      <Sword className="w-12 h-12 text-amber-400" />
                    )}
                    {showSplashItem.isCharacter && (
                      <span className="absolute -bottom-2.5 bg-slate-900 border border-white/10 text-[9px] text-slate-200 font-black px-3 py-0.5 rounded-full uppercase tracking-wider">
                        {showSplashItem.element}
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-black text-slate-100 flex items-center justify-center gap-1.5 uppercase font-display tracking-widest">
                    {showSplashItem.name}
                  </h3>
                  <div className="flex justify-center gap-0.5 mt-2">
                    {Array.from({ length: showSplashItem.rarity }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 max-w-sm mx-auto leading-relaxed italic border-t border-white/5 pt-4">
                  {showSplashItem.isCharacter 
                    ? (PLAYABLE_CHARACTERS.find(c => c.id === showSplashItem.id)?.backstory || 'A mighty wandering companion joining your cosmic legion.')
                    : (WEAPONS_DATABASE.find(w => w.name === showSplashItem.name)?.featureDesc || "Elite grade master armaments forged in Aetheric furnaces, complete with dynamic status parameters.")
                  }
                </p>
              </div>

              <div className="pt-4 border-t border-white/5 flex justify-between items-center gap-3">
                <div className="text-left">
                  <span className="text-[8.5px] text-slate-500 uppercase tracking-widest block font-bold">Category</span>
                  <span className="text-[10px] font-black text-slate-200 uppercase tracking-wider font-mono">
                    {showSplashItem.isCharacter ? 'Playable Hero' : 'Equipment Armament'}
                  </span>
                </div>
                <button 
                  onClick={() => setShowSplashItem(null)}
                  className="bg-amber-400 hover:bg-amber-300 text-slate-950 text-[10px] font-black uppercase tracking-wider px-5 py-2.5 rounded-lg active:scale-95 transition-all shadow-[0_0_15px_rgba(251,191,36,0.30)] cursor-pointer"
                >
                  CONFIRM ACQUISITION
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SUMMON RESULTS CASCADE SHOWCASE MODAL */}
      <AnimatePresence>
        {animationPhase === 'showcase' && currentPullResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#020308]/97 z-55 flex flex-col items-center justify-center p-4 md:p-8 overflow-y-auto select-none"
          >
            {/* Ambient Background Particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div
                  key={idx}
                  className={`absolute rounded-full filter blur-xl animate-pulse ${
                    maxRarityInPull === 5 ? 'bg-amber-500/20' : maxRarityInPull === 4 ? 'bg-purple-500/10' : 'bg-cyan-500/10'
                  }`}
                  style={{
                    width: `${120 + Math.random() * 100}px`,
                    height: `${120 + Math.random() * 100}px`,
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDuration: `${4 + Math.random() * 4}s`,
                    animationDelay: `${idx * 0.5}s`,
                  }}
                />
              ))}
            </div>

            <div className="relative z-10 max-w-5xl w-full flex flex-col items-center space-y-8">
              <div className="text-center space-y-1">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-400 font-mono"
                >
                  ⚡ SUMMON RIFT RESULTS STABILIZED ⚡
                </motion.div>
                <motion.h3
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl md:text-3xl font-black text-slate-100 uppercase tracking-widest font-display text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-indigo-200 to-slate-200"
                >
                  Acquisition Showcase
                </motion.h3>
              </div>

              {/* Staggered Cards Grid */}
              <div className={`grid gap-4 w-full justify-center ${
                currentPullResults.length === 1 
                  ? 'grid-cols-1 max-w-xs' 
                  : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-5'
              }`}>
                {currentPullResults.map((item, i) => {
                  const elColor = item.element ? getElementColor(item.element) : 'text-slate-400';
                  const isGold = item.rarity === 5;
                  const isPurple = item.rarity === 4;
                  
                  return (
                    <motion.div
                      key={i}
                      initial={{ scale: 0.8, opacity: 0, y: 30 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      exit={{ scale: 0.8, opacity: 0, y: -30 }}
                      transition={{ 
                        type: "tween", 
                        ease: "easeOut",
                        duration: 0.3, 
                        delay: i * 0.04 
                      }}
                      style={{ willChange: "transform, opacity" }}
                      onClick={() => {
                        if (item.isCharacter && onNavigateToWikiChar) {
                          AetheriaAudioEngine.playClick();
                          setAnimationPhase('none');
                          onNavigateToWikiChar(item.id);
                        } else if (!item.isCharacter && onNavigateToWikiWeapon) {
                          AetheriaAudioEngine.playClick();
                          setAnimationPhase('none');
                          onNavigateToWikiWeapon(item.name);
                        }
                      }}
                      className={`relative rounded-xl border p-4 flex flex-col justify-between items-center text-center min-h-[190px] transition-all overflow-hidden group cursor-pointer hover:scale-[1.03] active:scale-[0.98] ${
                        isGold 
                          ? 'bg-[#15130b] border-amber-400/50 shadow-[0_0_25px_rgba(245,158,11,0.2)] hover:border-amber-400' 
                          : isPurple 
                            ? 'bg-[#110c1b] border-purple-400/40 shadow-[0_0_20px_rgba(168,85,247,0.15)] hover:border-purple-400' 
                            : 'bg-[#0d1222] border-white/5 shadow-md hover:border-slate-800'
                      }`}
                    >
                      {/* NEW! Badge */}
                      {item.isNew && (
                        <div className="absolute top-1.5 right-1.5 bg-rose-500 text-white text-[7.5px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider z-20 shadow-sm animate-pulse">
                          NEW!
                        </div>
                      )}

                      {/* Element specific glow ripples */}
                      {item.element && (
                        <div className={`absolute -inset-1 opacity-0 group-hover:opacity-10 transition-opacity bg-radial from-current to-transparent pointer-events-none ${elColor}`} />
                      )}

                      {/* Stars count */}
                      <div className="flex gap-0.5 z-10">
                        {Array.from({ length: item.rarity }).map((_, sIdx) => (
                          <Star key={sIdx} className={`w-2.5 h-2.5 fill-current ${
                            isGold ? 'text-amber-400' : isPurple ? 'text-purple-400' : 'text-cyan-400'
                          }`} />
                        ))}
                      </div>

                      {/* Icon representation */}
                      <div className="my-3 z-10">
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-black text-slate-950 border border-white/10 relative shadow-[0_4px_12px_rgba(0,0,0,0.4)] ${
                          item.isCharacter 
                            ? (PLAYABLE_CHARACTERS.find(c => c.id === item.id)?.avatarPlaceholder || 'bg-amber-550')
                            : 'bg-gradient-to-tr from-slate-700 via-indigo-950 to-slate-900 border-indigo-400/20 text-indigo-200'
                        }`}>
                          {item.isCharacter ? (
                            item.name.charAt(0)
                          ) : (
                            <Sword className="w-6 h-6 text-indigo-300" />
                          )}
                        </div>
                      </div>

                      {/* Rarity/Category text */}
                      <div className="space-y-1 z-10 w-full">
                        <span className="text-[10.5px] font-black text-slate-200 block truncate uppercase tracking-tighter w-full">
                          {item.name}
                          {item.nextPortrait !== undefined && item.nextPortrait !== null && (
                            <span className="text-amber-400 font-extrabold ml-1">
                              (P{item.nextPortrait})
                            </span>
                          )}
                        </span>
                        <span className={`text-[8px] font-extrabold uppercase tracking-widest block font-mono ${
                          item.element ? elColor : 'text-slate-500'
                        }`}>
                          {item.element ? item.element : item.rarity === 5 ? '5★ WEAPON' : item.rarity === 4 ? '4★ WEAPON' : '3★ WEAPON'}
                        </span>
                        {item.isCharacter ? (
                          <span className="text-[7px] text-indigo-400/70 group-hover:text-indigo-300 font-black uppercase tracking-wider block font-sans mt-1 opacity-60 group-hover:opacity-100 transition-opacity">
                            🔍 View Lore Wiki
                          </span>
                        ) : (
                          <span className="text-[7px] text-indigo-400/70 group-hover:text-indigo-300 font-black uppercase tracking-wider block font-sans mt-1 opacity-60 group-hover:opacity-100 transition-opacity">
                            🔍 View Armory Wiki
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Actions Footer */}
              <div className="flex flex-wrap justify-center gap-4 z-20">
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: currentPullResults.length * 0.08 + 0.15 }}
                  onClick={() => {
                    executeWishPulls(10);
                  }}
                  className="bg-amber-500 hover:bg-amber-400 hover:scale-105 active:scale-95 text-slate-950 font-black text-xs uppercase tracking-widest px-6 py-3 rounded-lg cursor-pointer transition-all shadow-[0_0_20px_rgba(245,158,11,0.35)] flex items-center gap-1.5"
                >
                  <span>🔄 Summon x10 More</span>
                  <span className="text-[10px] opacity-75 font-mono">(1440 Gems)</span>
                </motion.button>

                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: currentPullResults.length * 0.08 + 0.2 }}
                  onClick={() => {
                    AetheriaAudioEngine.playClick();
                    setAnimationPhase('none');
                  }}
                  className="bg-indigo-600 hover:bg-indigo-500 hover:scale-105 active:scale-95 text-white font-black text-xs uppercase tracking-widest px-6 py-3 rounded-lg cursor-pointer transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)]"
                >
                  📥 Confirm Acquisitions
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Bar with credentials */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center border-b border-white/10 pb-4 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            <h2 className="text-xs font-black text-slate-100 uppercase tracking-widest font-display">
              Celestial Wish Wells
            </h2>
          </div>
          <p className="text-[9px] text-slate-400 mt-0.5 uppercase tracking-wide font-mono">
            Deploy wishes inside the solar rift. All weapon drops transfer to active character loadouts.
          </p>
        </div>

        {/* Currency displays */}
        <div className="flex items-center gap-3">
          {devCheatsEnabled && (
            <button
              type="button"
              onClick={() => {
                const nextFeaturedOffset = devFeaturedOffset + 1;
                setDevFeaturedOffset(nextFeaturedOffset);
                const nextBanner = getLimitedCharacterBannerForTime(Date.now(), nextFeaturedOffset);
                setSelectedBannerIdx(0);
                AetheriaAudioEngine.playClick();
                onShowAlert(
                  'Featured Character Switched',
                  `${nextBanner.featured5Star} is now featured on the limited banner for testing.`,
                  'info'
                );
              }}
              disabled={pulling}
              className="bg-emerald-950/70 hover:bg-emerald-900/80 text-emerald-300 text-[8.5px] font-black uppercase tracking-wider px-3 py-2 rounded-lg border border-emerald-500/25 active:scale-95 transition-all cursor-pointer font-sans disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              <RefreshCw className="w-3 h-3" />
              Switch Featured Characters
            </button>
          )}
          <div className="bg-black/30 border border-white/10 px-3 py-1.5 rounded-lg flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-sky-300" />
            <span className="text-[9px] text-slate-400 font-mono uppercase">GEMS BALANCE:</span>
            <span className="text-[10px] font-black text-sky-300 font-mono">{aetherGems.toLocaleString()}</span>
          </div>

          {devCheatsEnabled && (
            <button 
              type="button"
              onClick={() => onModifyCurrencies(20000, 0)}
              className="bg-[#0e1628] hover:bg-indigo-950/80 text-indigo-400 text-[9px] font-black uppercase tracking-wider px-3.5 py-2 rounded-lg border border-indigo-500/20 active:scale-95 transition-all cursor-pointer font-sans"
            >
              +20,000 Gems Tool
            </button>
          )}
        </div>
      </div>

      {/* Banner selection tabs */}
      <div className="flex flex-wrap gap-2 mt-4">
        {limitedRotationBanners.map((b, idx) => (
          <button
            key={b.id}
            onClick={() => {
              if (!pulling) setSelectedBannerIdx(idx);
            }}
            disabled={pulling}
            className={`px-3 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg border transition-all cursor-pointer ${
              selectedBannerIdx === idx
                ? 'bg-slate-900 border-[#6366f1]/60 text-slate-100 shadow-[0_0_15px_rgba(99,102,241,0.15)] font-display'
                : 'bg-black/30 border-white/5 text-slate-400 hover:border-white/10 hover:text-slate-300'
            }`}
          >
            {b.type === 'character' ? '👤 HERO:' : '⚔️ ARMAMENT:'} {b.tag}
          </button>
        ))}
      </div>

      {/* Main Gacha panel grids */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 my-4 flex-1">
        
        {/* Active Selected Banner details view */}
        <div 
          className={`gacha-banner-art lg:col-span-2 border rounded-xl p-5 relative overflow-hidden flex flex-col justify-between ${activeBanner.themeColor}`}
          style={{
            backgroundImage: `${getBannerGradient(activeBanner.featured5StarId, activeBanner.type)}, url(${getBannerImage(activeBanner.featured5StarId, activeBanner.type)})`,
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            '--banner-position-mobile': artworkLayout.mobilePosition,
            '--banner-position-desktop': artworkLayout.desktopPosition,
          } as React.CSSProperties}
        >
          
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[8px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-black px-2 py-0.5 rounded uppercase tracking-widest">
                {activeBanner.subtitle}
              </span>
              {activeBanner.id === 'char_banner_1' && (
                <span className="text-[8.5px] bg-amber-400/10 text-amber-400 border border-amber-400/30 font-mono font-black px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1 animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.1)]">
                  ⏱️ Rotation Switch: {timerString}
                </span>
              )}
            </div>
            
            <h3 className="text-xl font-black tracking-widest text-[#f8fafc] uppercase leading-none font-display">
              {activeBanner.title}
            </h3>
            
            <p className="text-[11px] text-slate-400 max-w-xl leading-relaxed font-sans mt-2">
              {activeBanner.desc}
            </p>

            <button
              type="button"
              aria-label="Banner Details"
              aria-expanded={showBannerDetails}
              aria-controls="banner-details-panel"
              onClick={() => setShowBannerDetails((visible) => !visible)}
              className="text-[9.5px] bg-black/40 border border-white/5 px-3 py-2 rounded-lg text-slate-300 font-mono uppercase font-black tracking-wider hover:border-white/15 transition-colors cursor-pointer"
            >
              Banner Details
            </button>

            {showBannerDetails && (
              <div id="banner-details-panel" className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-black/45 border border-white/5 p-4 rounded-xl text-[10px] font-mono uppercase w-full">
                {/* 5-Star details */}
                <div className="bg-slate-900/60 p-3 rounded-lg border border-amber-400/20 flex flex-col justify-between gap-1 shadow-inner relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-8 h-8 bg-amber-400/5 rotate-45 transform translate-x-4 -translate-y-4"></div>
                  <span className="text-[9px] text-amber-400 font-black tracking-wider block">5★ GUARANTEE & RATES</span>
                  <div className="space-y-1 mt-1 text-slate-350">
                    <p className="flex justify-between">
                      <span className="text-slate-500">BASE RATE:</span>
                      <span className="font-extrabold text-amber-300">0.60%</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-slate-500">SOFT PITY:</span>
                      <span className="font-bold text-slate-200">74 pulls</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-slate-500">HARD PITY:</span>
                      <span className="font-extrabold text-amber-400">90 rolls</span>
                    </p>
                  </div>
                </div>

                {/* 4-Star details */}
                <div className="bg-slate-900/60 p-3 rounded-lg border border-purple-400/20 flex flex-col justify-between gap-1 shadow-inner relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-8 h-8 bg-purple-400/5 rotate-45 transform translate-x-4 -translate-y-4"></div>
                  <span className="text-[9px] text-purple-400 font-black tracking-wider block">4★ GUARANTEE & RATES</span>
                  <div className="space-y-1 mt-1 text-slate-350">
                    <p className="flex justify-between">
                      <span className="text-slate-500">BASE RATE:</span>
                      <span className="font-extrabold text-purple-300">5.10%</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-slate-500">HARD PITY:</span>
                      <span className="font-extrabold text-purple-400">10 rolls</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-slate-500">FEATURE ODDS:</span>
                      <span className="font-bold text-slate-200">50% chance</span>
                    </p>
                  </div>
                </div>

                {/* Event Drop Rule */}
                <div className="bg-slate-900/60 p-3 rounded-lg border border-indigo-400/20 flex flex-col justify-between gap-1 shadow-inner relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-8 h-8 bg-indigo-500/5 rotate-45 transform translate-x-4 -translate-y-4"></div>
                  <span className="text-[9px] text-indigo-400 font-black tracking-wider block">BANNER SYNERGY RULE</span>
                  <div className="space-y-1 mt-1 text-slate-355">
                    <p className="text-[9px] text-slate-300 leading-relaxed uppercase">
                      {activeBanner.details}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeBanner.type === 'weapon' && (
              <div className="mt-4 space-y-2 border-t border-white/5 pt-4">
                <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest block font-display flex items-center gap-1">
                  🎯 Epitome Selection: Pick your target 5★ Weapon
                </span>
                <p className="text-[8.5px] text-slate-400 font-mono uppercase tracking-tight">
                  No 50/50 block. The next 5★ weapon you roll is guaranteed to be your selected target below.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {WEAPONS_DATABASE.filter(w => w.rarity === 5).map(weap => {
                    const isTarget = selectedWeaponName === weap.name;
                    return (
                      <button
                        key={weap.name}
                        onClick={() => {
                          setSelectedWeaponName(weap.name);
                          AetheriaAudioEngine.playClick();
                        }}
                        className={`p-2 rounded-lg border text-left transition-all relative overflow-hidden cursor-pointer flex flex-col justify-between min-h-[56px] select-none ${
                          isTarget
                            ? 'bg-amber-400/10 border-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.2)] text-white'
                            : 'bg-black/35 border-white/5 text-slate-400 hover:border-white/10 hover:text-slate-300'
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black uppercase tracking-tight line-clamp-1">{weap.name}</span>
                          <span className="text-[8px] opacity-70 uppercase font-mono">{weap.weaponType} • ATK {weap.baseAtk}</span>
                        </div>
                        {isTarget && (
                          <span className="absolute top-1 right-1 text-[7.5px] bg-amber-400 text-slate-950 font-black px-1 rounded uppercase tracking-tighter scale-90 leading-none py-0.5">
                            Target
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-white/5 pt-4 mt-6 flex flex-col xl:flex-row justify-between items-start xl:items-center text-xs text-slate-500 gap-4 w-full">
            <div className="flex flex-wrap gap-4">
              {/* 5★ Pity Ring Widget */}
              <div className="flex items-center gap-3 bg-black/45 border border-white/10 p-2.5 rounded-xl shadow-inner backdrop-blur-sm">
                <div className="relative w-14 h-14 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="28"
                      cy="28"
                      r="22"
                      className="stroke-slate-800"
                      strokeWidth="3.5"
                      fill="transparent"
                    />
                    <circle
                      cx="28"
                      cy="28"
                      r="22"
                      className={`transition-all duration-500 ${
                        activePity5 >= 75
                          ? 'stroke-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.5)]'
                          : 'stroke-cyan-400 drop-shadow-[0_0_6px_rgba(34,211,238,0.5)]'
                      }`}
                      strokeWidth="3.5"
                      fill="transparent"
                      strokeDasharray={2 * Math.PI * 22}
                      strokeDashoffset={2 * Math.PI * 22 * (1 - Math.min(activePity5 / 90, 1))}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className={`absolute font-mono font-black text-xs ${activePity5 >= 75 ? 'text-amber-400' : 'text-cyan-400'}`}>
                    {activePity5}
                  </span>
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">5★ Pity Status</span>
                  <span className="text-[10.5px] font-black font-mono text-slate-100">{activePity5} <span className="text-slate-500">/ 90</span></span>
                  <span className={`text-[8.5px] font-bold tracking-tight font-mono uppercase ${activePity5 >= 75 ? 'text-amber-400 animate-pulse' : 'text-slate-400'}`}>
                    {activePity5 >= 75 ? '⚠️ SOFT PITY ACTIVE' : `${90 - activePity5} to guaranteed`}
                  </span>
                  {activeBanner.type === 'character' && (
                    <span className={`text-[8.5px] font-bold tracking-tight font-mono uppercase mt-0.5 ${
                      activeBanner.id === 'char_banner_2'
                        ? 'text-indigo-400 font-extrabold'
                        : bannerGuaranteed5Star[activeBanner.id] 
                          ? 'text-emerald-400 font-extrabold' 
                          : 'text-slate-500'
                    }`}>
                      {activeBanner.id === 'char_banner_2'
                        ? '✨ RANDOM STANDARD 5★ DROP'
                        : bannerGuaranteed5Star[activeBanner.id] 
                          ? '✨ NEXT 5★ GUARANTEED FEATURED' 
                          : '⚖️ 50/50 FEATURED CHANCE'}
                    </span>
                  )}
                </div>
              </div>

              {/* 4★ Pity Ring Widget */}
              <div className="flex items-center gap-3 bg-black/45 border border-white/10 p-2.5 rounded-xl shadow-inner backdrop-blur-sm">
                <div className="relative w-14 h-14 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="28"
                      cy="28"
                      r="22"
                      className="stroke-slate-800"
                      strokeWidth="3.5"
                      fill="transparent"
                    />
                    <circle
                      cx="28"
                      cy="28"
                      r="22"
                      className="stroke-purple-400 drop-shadow-[0_0_6px_rgba(168,85,247,0.5)] transition-all duration-500"
                      strokeWidth="3.5"
                      fill="transparent"
                      strokeDasharray={2 * Math.PI * 22}
                      strokeDashoffset={2 * Math.PI * 22 * (1 - Math.min(activePity4 / 10, 1))}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute font-mono font-black text-xs text-purple-400">
                    {activePity4}
                  </span>
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">4★ Pity Status</span>
                  <span className="text-[10.5px] font-black font-mono text-slate-100">{activePity4} <span className="text-slate-500">/ 10</span></span>
                  <span className="text-[8.5px] font-bold tracking-tight font-mono uppercase text-slate-400">
                    {activePity4 >= 8 ? '🔥 NEAR GUARANTEE' : `${10 - activePity4} to guaranteed`}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => setShowRatesInfo(true)}
                className="p-1.5 px-3 bg-[#0a0f1d] border border-white/10 hover:border-white/20 rounded-md flex items-center gap-1.5 hover:text-slate-200 transition-colors uppercase text-[9px] font-black tracking-wider cursor-pointer font-mono"
              >
                <Info className="w-3.5 h-3.5 text-slate-400" />
                <span>RATES MATRIX</span>
              </button>
              <button 
                onClick={() => {
                  setHistoryPage(1);
                  setShowHistory(!showHistory);
                }}
                className="p-1.5 px-3 bg-[#0a0f1d] border border-white/10 hover:border-white/20 rounded-md flex items-center gap-1.5 hover:text-slate-200 transition-colors uppercase text-[9px] font-black tracking-wider cursor-pointer font-mono"
              >
                <History className="w-3.5 h-3.5 text-slate-400" />
                <span> Summons HISTORY</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right side live actions and results */}
        <div className="bg-[#060811]/65 p-5 border border-white/10 rounded-xl flex flex-col justify-between">
          <div className="space-y-4 flex-1">
            <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-white/10 pb-2 font-display">
              SUMMON MATRIX BUFFER
            </h4>

            {animationPhase === 'showcase' && currentPullResults.length > 0 ? (
              <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                {currentPullResults.map((r, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={i} 
                    className={`p-2 rounded-lg border flex items-center justify-between ${
                      r.rarity === 5 
                        ? 'bg-amber-500/10 border-amber-500/30' 
                        : r.rarity === 4 
                          ? 'bg-purple-500/10 border-purple-500/30' 
                          : 'bg-slate-950/45 border-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        r.rarity === 5 ? 'bg-amber-400 animate-pulse' : r.rarity === 4 ? 'bg-purple-400' : 'bg-slate-400'
                      }`} />
                      <span className="text-[11px] font-extrabold text-slate-200 uppercase tracking-tighter truncate max-w-[110px]">
                        {r.name}
                      </span>
                      {r.nextPortrait !== undefined && r.nextPortrait !== null && (
                        <span className="text-[9px] text-amber-400 font-black shrink-0">
                          P{r.nextPortrait}
                        </span>
                      )}
                      {r.isNew && (
                        <span className="text-[8px] bg-rose-500 text-white font-black px-1 rounded shrink-0 leading-normal animate-pulse">
                          NEW!
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 bg-black/20 p-1 px-2 rounded shrink-0">
                      <span className={`text-[8.5px] font-extrabold uppercase tracking-wide font-mono ${getElementColor(r.element)}`}>
                        {r.element ? r.element : r.rarity === 5 ? '5★' : r.rarity === 4 ? '4★' : '3★'}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="relative w-full h-[180px] bg-black/20 border border-white/5 rounded-lg overflow-hidden flex flex-col items-center justify-center">
                <GachaRadarScanner 
                  pullResults={currentPullResults}
                  isScanning={animationPhase === 'radar'}
                  onScanComplete={() => {
                    setAnimationPhase('meteor');
                  }}
                />
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-white/10 grid grid-cols-2 gap-3">
            <button
              onClick={() => executeWishPulls(1)}
              disabled={pulling}
              className="bg-black/55 hover:bg-black/85 text-slate-200 border border-white/10 p-3 rounded-lg font-black text-[10px] uppercase tracking-widest flex flex-col items-center justify-center gap-0.5 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <span>Single wish</span>
              <span className="text-[8.5px] text-slate-500 font-mono">160 GEMS</span>
            </button>

            <button
              onClick={() => executeWishPulls(10)}
              disabled={pulling}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 p-3 rounded-lg font-black text-[11px] uppercase tracking-widest flex flex-col items-center justify-center gap-0.5 shadow-lg shadow-amber-400/10 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <div className="flex items-center gap-1">
                <span>Summon x10</span>
                <span className="text-[8px] bg-red-500 text-white font-mono px-1 rounded-sm tracking-tight scale-90">-10%</span>
              </div>
              <div className="flex gap-1 text-[8.5px] font-mono font-black items-center">
                <span className="line-through text-slate-950/40">1600</span>
                <span className="text-red-700 font-bold">1440 GEMS</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Probability Modal info */}
      {showRatesInfo && (
        <div className="fixed inset-0 bg-slate-950/95 z-50 flex items-center justify-center overflow-y-auto p-4">
          <div className="bg-[#0c0f1b] max-w-sm w-full max-h-[calc(100vh-2rem)] overflow-y-auto border border-white/15 rounded-xl p-5 space-y-4 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
            <div className="flex justify-between items-center border-b border-white/10 pb-2">
              <h3 className="text-xs font-black text-slate-100 uppercase tracking-widest font-display">Wishes Probabilities Grid</h3>
              <button onClick={() => setShowRatesInfo(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-[11px] font-mono uppercase">
              {activeBanner.type === 'character' ? (
                <>
                  <div className="flex justify-between border-b border-white/5 pb-1">
                    <span className="font-extrabold text-amber-400">5-Star Hero</span>
                    <span className="text-slate-400">{(FIVE_STAR_BASE_RATE * 100).toFixed(1)}% Base (Hard 90)</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-1">
                    <span className="font-extrabold text-purple-400">4-Star Hero</span>
                    <span className="text-slate-400">{(FOUR_STAR_BASE_RATE * 100).toFixed(1)}% Base (Hard 10)</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-1">
                    <span className="font-semibold text-slate-500">3-Star Hero</span>
                    <span className="text-slate-500">94.3% Base</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between border-b border-white/5 pb-1">
                    <span className="font-extrabold text-amber-400">5-Star Armament Item</span>
                    <span className="text-slate-400">{(FIVE_STAR_BASE_RATE * 100).toFixed(1)}% Base (Hard 90)</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-1">
                    <span className="font-extrabold text-purple-400">4-Star Armament Item</span>
                    <span className="text-slate-400">{(FOUR_STAR_BASE_RATE * 100).toFixed(1)}% Base (Hard 10)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-500">3-Star Armament items</span>
                    <span className="text-slate-500">94.3% Base</span>
                  </div>
                </>
              )}
            </div>

            <div className="bg-slate-950 p-3 rounded border border-white/5 text-[9.5px] text-slate-400 leading-relaxed font-mono uppercase">
              Ledger standards are verified. Rates are guaranteed by local smart contracts. Banners have completely separate pity and do not carry counts over to keep rolls strictly independent.
            </div>
          </div>
        </div>
      )}

      {/* Wish History Log */}
      {showHistory && (
        <div className="fixed inset-0 bg-slate-950/95 z-55 flex items-center justify-center overflow-y-auto p-4" onClick={() => setShowHistory(false)}>
          <div className="bg-[#0c0f1b] max-w-md w-full border border-white/15 rounded-xl p-5 space-y-4 flex flex-col max-h-[calc(100vh-2rem)] shadow-[0_0_50px_rgba(0,0,0,0.8)] animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center border-b border-white/10 pb-2">
              <h3 className="text-xs font-black text-slate-100 uppercase tracking-widest flex items-center gap-2 font-display">
                <History className="w-4 h-4 text-emerald-400" />
                SUMMON MATRIX REPAIR JOURNAL
              </h3>
              <button onClick={() => setShowHistory(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[300px]">
              {pullHistoryList.length > 0 ? (
                (() => {
                  const itemsPerPage = 10;
                  const totalPages = Math.ceil(pullHistoryList.length / itemsPerPage) || 1;
                  const startIndex = (historyPage - 1) * itemsPerPage;
                  const paginatedHistory = pullHistoryList.slice(startIndex, startIndex + itemsPerPage);
                  return (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        {paginatedHistory.map((log, idx) => (
                          <div key={idx} className="p-2 bg-black/45 rounded border border-white/5 flex justify-between items-center text-xs">
                            <div>
                              <span className="text-slate-200 font-extrabold uppercase text-[11px] tracking-tight">{log.name}</span>
                              <span className="text-[9px] text-slate-500 ml-2 font-mono">{log.time}</span>
                            </div>
                            <span className={`text-[9.5px] font-black px-2 py-0.5 rounded uppercase font-mono ${
                              log.rarity === 5 ? 'bg-amber-400/20 text-amber-400' : log.rarity === 4 ? 'bg-purple-400/20 text-purple-400' : 'bg-slate-800 text-slate-400'
                            }`}>
                              {log.rarity} Star
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Pagination Controls */}
                      <div className="flex justify-between items-center pt-3 border-t border-white/10 text-xs">
                        <button
                          disabled={historyPage === 1}
                          onClick={() => setHistoryPage(prev => Math.max(prev - 1, 1))}
                          className="px-3 py-1 bg-slate-900 border border-white/10 hover:border-white/20 hover:text-white rounded disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors uppercase font-mono text-[10px]"
                        >
                          Prev
                        </button>
                        <span className="text-slate-400 font-mono text-[10.5px]">
                          PAGE {historyPage} OF {totalPages}
                        </span>
                        <button
                          disabled={historyPage === totalPages}
                          onClick={() => setHistoryPage(prev => Math.min(prev + 1, totalPages))}
                          className="px-3 py-1 bg-slate-900 border border-white/10 hover:border-white/20 hover:text-white rounded disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors uppercase font-mono text-[10px]"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="text-center py-16 text-slate-500 text-xs italic font-mono uppercase">
                  WISH HISTORY REGISTRY IS VACANT
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
