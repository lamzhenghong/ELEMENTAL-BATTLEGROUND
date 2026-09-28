import type { ArenaLocation } from '../../utils/arenaLocation';

export class ArenaFloor {
  private canvas: HTMLCanvasElement | null = null;
  private key = '';

  draw(ctx: CanvasRenderingContext2D, location: ArenaLocation, width: number, height: number) {
    const key = `${location.id}:${width}:${height}`;
    if (key !== this.key) {
      this.key = key;
      this.canvas = document.createElement('canvas');
      this.canvas.width = Math.ceil(width / 2);
      this.canvas.height = Math.ceil(height / 2);
      const floorCtx = this.canvas.getContext('2d');
      if (floorCtx) {
        floorCtx.scale(0.5, 0.5);
        paintFloor(floorCtx, location, width, height);
      } else {
        this.canvas = null;
      }
    }
    if (this.canvas) ctx.drawImage(this.canvas, 0, 0, width, height);
    else {
      ctx.fillStyle = location.ground;
      ctx.fillRect(0, 0, width, height);
    }
  }

  clear() {
    this.canvas = null;
    this.key = '';
  }
}

function paintFloor(ctx: CanvasRenderingContext2D, location: ArenaLocation, width: number, height: number) {
  ctx.fillStyle = location.ground;
  ctx.fillRect(0, 0, width, height);
  const glow = ctx.createRadialGradient(width / 2, height / 2, 80, width / 2, height / 2, width * 0.65);
  glow.addColorStop(0, `${location.accent}18`);
  glow.addColorStop(1, '#02050d80');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = `${location.seam}70`;
  ctx.lineWidth = 4;

  const line = (x1: number, y1: number, x2: number, y2: number) => {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  };
  const ring = (x: number, y: number, radius: number, start = 0, end = Math.PI * 2) => {
    ctx.beginPath();
    ctx.arc(x, y, radius, start, end);
    ctx.stroke();
  };
  const c = width / 2;

  switch (location.motif) {
    case 'ruin':
      for (let y = 80; y < height; y += 190) for (let x = 70; x < width; x += 300) {
        ctx.strokeRect(x + (y % 380 ? 80 : 0), y, 255, 145);
        line(x + 125, y, x + 125, y + 145);
      }
      for (let i = 0; i < 7; i++) ring(120 + i * 285, 160 + (i % 3) * 580, 48, 0.35, 2.65);
      break;
    case 'frontier':
      for (let x = -height; x < width + height; x += 170) line(x, 0, x + height * 0.55, height);
      for (let i = 0; i < 18; i++) line(90 + i * 110, 360 + (i % 4) * 260, 140 + i * 110, 345 + (i % 4) * 260);
      break;
    case 'gate':
      for (let r = 250; r <= 950; r += 155) ring(c, height / 2, r, 0.2, Math.PI * 1.85);
      for (let i = 0; i < 12; i++) {
        const angle = i * Math.PI / 6;
        line(c + Math.cos(angle) * 270, height / 2 + Math.sin(angle) * 270, c + Math.cos(angle) * 880, height / 2 + Math.sin(angle) * 880);
      }
      break;
    case 'abyss':
      for (let i = 0; i < 9; i++) {
        const x = 120 + i * 230;
        line(x, 0, x - 60, 480);
        line(x - 60, 480, x + 45, 950);
        line(x + 45, 950, x - 80, height);
      }
      break;
    case 'astral':
      for (let r = 250; r < 1150; r += 210) ring(c, height / 2, r);
      for (let i = 0; i < 25; i++) {
        const x = (i * 377) % width;
        const y = (i * 613) % height;
        line(x - 12, y, x + 12, y);
        line(x, y - 12, x, y + 12);
      }
      break;
    case 'frostfire':
      for (let i = 0; i < 12; i++) {
        const y = i * 185;
        line(0, y, 800, y + 100);
        line(width - 800, y + 100, width, y - 25);
      }
      ctx.strokeStyle = '#8fd2e077';
      for (let i = 0; i < 12; i++) line(90 + i * 80, 140 + i * 130, 40 + i * 80, 230 + i * 130);
      ctx.strokeStyle = '#ea765b88';
      for (let i = 0; i < 12; i++) line(width - 90 - i * 80, 80 + i * 140, width - 30 - i * 80, 190 + i * 140);
      break;
    case 'sky':
      for (let i = 0; i < 8; i++) {
        ring(c, height / 2, 280 + i * 105, Math.PI * 0.1, Math.PI * 0.9);
        ring(c, height / 2, 280 + i * 105, Math.PI * 1.1, Math.PI * 1.9);
      }
      for (let i = 0; i < 6; i++) line(80 + i * 350, 0, 80 + i * 350, height);
      break;
    case 'volcano':
      for (let i = 0; i < 11; i++) {
        const x = i * 210;
        line(x, 0, x + 65, 540);
        line(x + 65, 540, x - 50, 1060);
        line(x - 50, 1060, x + 50, height);
      }
      ctx.strokeStyle = '#e77d4c77';
      for (let r = 350; r < 1100; r += 250) ring(c, height / 2, r, 0.1, 2.4);
      break;
    case 'rift':
      for (let i = -2; i < 13; i++) {
        const x = i * 220;
        line(x, 0, x + 180, 630);
        line(x + 180, 630, x - 80, 1280);
        line(x - 80, 1280, x + 140, height);
      }
      for (let r = 180; r < 1000; r += 180) ring(c, height / 2, r, 0.4, 2.4);
      break;
    case 'core':
      for (let r = 260; r < 1150; r += 170) ring(c, height / 2, r);
      for (let i = 0; i < 8; i++) {
        const angle = i * Math.PI / 4;
        const x = c + Math.cos(angle) * 760;
        const y = height / 2 + Math.sin(angle) * 760;
        ring(x, y, 45);
        line(c + Math.cos(angle) * 280, height / 2 + Math.sin(angle) * 280, x, y);
      }
      break;
    case 'arena':
      for (let r = 350; r < 1150; r += 215) {
        ctx.beginPath();
        for (let i = 0; i <= 8; i++) {
          const angle = Math.PI * i / 4;
          const x = c + Math.cos(angle) * r;
          const y = height / 2 + Math.sin(angle) * r;
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      break;
    case 'reliquary':
      for (let i = 0; i < 7; i++) {
        const r = 260 + i * 150;
        ctx.beginPath();
        for (let n = 0; n <= 6; n++) {
          const angle = n * Math.PI / 3;
          if (n === 0) ctx.moveTo(c + Math.cos(angle) * r, height / 2 + Math.sin(angle) * r);
          else ctx.lineTo(c + Math.cos(angle) * r, height / 2 + Math.sin(angle) * r);
        }
        ctx.stroke();
      }
      break;
    case 'rogue':
      for (let y = 95; y < height; y += 270) for (let x = 95; x < width; x += 270) {
        ctx.strokeRect(x + ((y / 270) % 2) * 30, y, 220, 220);
        if ((x + y) % 3 < 1) line(x + 30, y + 30, x + 175, y + 170);
      }
      break;
  }

  const shadow = ctx.createRadialGradient(c, height / 2, width * 0.28, c, height / 2, width * 0.68);
  shadow.addColorStop(0, '#00000000');
  shadow.addColorStop(1, '#02050baa');
  ctx.fillStyle = shadow;
  ctx.fillRect(0, 0, width, height);
}
