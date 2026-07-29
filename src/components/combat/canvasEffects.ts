import type { ElementType } from '../../types';
import { BOSS_VISUAL_VARIANTS } from '../../utils/enemyVisuals';

export const WORLD_WIDTH = 2000;
export const WORLD_HEIGHT = 2000;
const IS_MOBILE_DEVICE = typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

// Particle class for beautiful graphics
export class CombatParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  radius: number;
  life: number;
  maxLife: number;

  constructor(x: number, y: number, color: string, radius: number = 3) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 4;
    this.vy = (Math.random() - 0.5) * 4;
    this.color = color;
    this.radius = radius;
    this.life = 0;
    this.maxLife = 20 + Math.random() * 20;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life++;
  }

  draw(ctx: CanvasRenderingContext2D) {
    const alpha = 1 - this.life / this.maxLife;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    if (!IS_MOBILE_DEVICE) {
      ctx.shadowBlur = 10;
      ctx.shadowColor = this.color;
    }
    ctx.fill();
    ctx.restore();
  }
}

// Floating Text class
export class FloatingDamageText {
  x: number;
  y: number;
  text: string;
  color: string;
  size: number;
  life: number;
  maxLife: number;

  constructor(x: number, y: number, text: string, color: string, size: number = 14) {
    this.x = x;
    this.y = y;
    this.text = text;
    this.color = color;
    this.size = size;
    this.life = 0;
    this.maxLife = 40;
  }

  update() {
    this.y -= 1.2;
    this.life++;
  }

  draw(ctx: CanvasRenderingContext2D) {
    const alpha = 1 - this.life / this.maxLife;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.color;
    ctx.font = `bold ${Math.round(this.size * 1.55)}px "Space Grotesk", "JetBrains Mono", monospace`;
    ctx.shadowBlur = 6;
    ctx.shadowColor = '#000000';
    // Stroke outline for maximum visual contrast on busy screens
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3.5;
    ctx.strokeText(this.text, this.x, this.y);
    ctx.fillText(this.text, this.x, this.y);
    ctx.restore();
  }
}

// Crystallyze Shield Shard
export class CrystalShard {
  x: number;
  y: number;
  element: ElementType;
  color: string;
  radius: number;

  constructor(x: number, y: number, element: ElementType, color: string) {
    this.x = x;
    this.y = y;
    this.element = element;
    this.color = color;
    this.radius = 8;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.beginPath();
    // Draw hexagon
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      const sx = this.x + Math.cos(angle) * this.radius;
      const sy = this.y + Math.sin(angle) * this.radius;
      if (i === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.closePath();
    ctx.fillStyle = this.color;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.shadowBlur = 15;
    ctx.shadowColor = this.color;
    ctx.stroke();
    ctx.restore();
  }
}

export const BOSS_TEMPLATES = [
  {
    bossType: 'fire_dragon',
    name: BOSS_VISUAL_VARIANTS.fire_dragon.name,
    color: BOSS_VISUAL_VARIANTS.fire_dragon.color,
    radius: 65,
    maxHp: 25000,
    speed: 0.7
  },
  {
    bossType: 'ice_golem',
    name: BOSS_VISUAL_VARIANTS.ice_golem.name,
    color: BOSS_VISUAL_VARIANTS.ice_golem.color,
    radius: 68,
    maxHp: 27000,
    speed: 0.6
  },
  {
    bossType: 'thunderbird',
    name: BOSS_VISUAL_VARIANTS.thunderbird.name,
    color: BOSS_VISUAL_VARIANTS.thunderbird.color,
    radius: 60,
    maxHp: 23000,
    speed: 0.8
  }
] as const;
