import {
  getBossIdentityById,
  getBossIdentityForEnemy,
  type BossIdentity
} from '../../utils/bossIdentities';

export interface BossModelEnemy {
  x: number;
  y: number;
  radius: number;
  name: string;
  bossType?: 'fire_dragon' | 'ice_golem' | 'thunderbird';
  bossIdentityId?: string;
}

export interface BossModelFrame {
  bobOffset: number;
  rotation: number;
  pulse: number;
  phase: number;
}

export const getBossParticleBudget = (isMobile: boolean) => isMobile ? 4 : 8;

export const getBossModelFrame = (
  identity: BossIdentity,
  timeMs: number,
  prefersReducedMotion: boolean
): BossModelFrame => {
  if (prefersReducedMotion) {
    return { bobOffset: 0, rotation: 0, pulse: 1, phase: 0 };
  }
  const phase = timeMs / 1000 + (identity.seed % 1000) / 211;
  return {
    bobOffset: Math.sin(phase * 1.35) * 3,
    rotation: Math.sin(phase * 0.72) * 0.035,
    pulse: 1 + Math.sin(phase * 2.1) * 0.045,
    phase
  };
};

const polygon = (
  ctx: CanvasRenderingContext2D,
  points: readonly (readonly [number, number])[],
  fill: string,
  stroke: string,
  lineWidth = 1.5
) => {
  if (points.length === 0) return;
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let index = 1; index < points.length; index += 1) {
    ctx.lineTo(points[index][0], points[index][1]);
  }
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
};

const glowCircle = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  fill: string,
  glow: string,
  isMobile: boolean,
  stroke?: string
) => {
  ctx.save();
  ctx.shadowColor = glow;
  ctx.shadowBlur = isMobile ? 4 : Math.max(8, radius * 0.9);
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
  ctx.restore();
};

const glowPath = (
  ctx: CanvasRenderingContext2D,
  draw: (context: CanvasRenderingContext2D) => void,
  color: string,
  lineWidth: number,
  isMobile: boolean
) => {
  ctx.save();
  ctx.beginPath();
  draw(ctx);
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.shadowColor = color;
  ctx.shadowBlur = isMobile ? 3 : Math.max(7, lineWidth * 3);
  ctx.stroke();
  ctx.restore();
};

const drawOrbitMotes = (
  ctx: CanvasRenderingContext2D,
  identity: BossIdentity,
  size: number,
  frame: BossModelFrame,
  isMobile: boolean
) => {
  const count = getBossParticleBudget(isMobile);
  for (let index = 0; index < count; index += 1) {
    const angle = frame.phase * 0.26 + index * Math.PI * 2 / count;
    const orbit = size * (0.82 + (index % 3) * 0.12);
    const x = Math.cos(angle) * orbit;
    const y = Math.sin(angle) * orbit * 0.48;
    const radius = Math.max(1.2, size * (0.022 + (index % 2) * 0.008));
    glowCircle(
      ctx,
      x,
      y,
      radius,
      index % 2 ? identity.secondaryColor : identity.color,
      identity.color,
      isMobile
    );
  }
};

const drawCalamityDragon = (
  ctx: CanvasRenderingContext2D,
  size: number,
  identity: BossIdentity,
  frame: BossModelFrame,
  isMobile: boolean,
  campaign: boolean
) => {
  glowPath(ctx, path => {
    path.moveTo(-size * 0.9, size * 0.18);
    path.bezierCurveTo(-size * 0.42, size * 0.75, size * 0.5, size * 0.55, size * 0.55, -size * 0.35);
  }, identity.color, size * 0.22, isMobile);
  polygon(ctx, [
    [-size * 0.1, -size * 0.02],
    [-size * 0.94, -size * 0.62],
    [-size * 0.64, size * 0.08],
    [-size * 0.08, size * 0.27]
  ], '#2b1010', identity.color, 2);
  polygon(ctx, [
    [size * 0.1, -size * 0.02],
    [size * 0.94, -size * 0.62],
    [size * 0.64, size * 0.08],
    [size * 0.08, size * 0.27]
  ], '#2b1010', identity.color, 2);
  polygon(ctx, [
    [-size * 0.23, -size * 0.16],
    [-size * 0.09, -size * 0.63],
    [0, -size * 0.34],
    [size * 0.12, -size * 0.67],
    [size * 0.25, -size * 0.13],
    [0, size * 0.31]
  ], identity.color, identity.secondaryColor, 1.6);
  glowCircle(ctx, 0, size * 0.02, size * 0.13 * frame.pulse, identity.secondaryColor, identity.color, isMobile);
  if (campaign) {
    for (let index = -2; index <= 2; index += 1) {
      polygon(ctx, [
        [index * size * 0.12 - size * 0.04, size * 0.2],
        [index * size * 0.12, size * (0.46 + Math.abs(index) * 0.06)],
        [index * size * 0.12 + size * 0.04, size * 0.2]
      ], index === 0 ? identity.secondaryColor : identity.color, identity.color, 0.7);
    }
  }
};

const drawFrostGolem = (
  ctx: CanvasRenderingContext2D,
  size: number,
  identity: BossIdentity,
  frame: BossModelFrame,
  isMobile: boolean,
  campaign: boolean
) => {
  const armShift = Math.sin(frame.phase * 1.1) * size * 0.035;
  polygon(ctx, [
    [-size * 0.48, -size * 0.36],
    [-size * 0.2, -size * 0.72],
    [size * 0.25, -size * 0.65],
    [size * 0.52, -size * 0.24],
    [size * 0.39, size * 0.5],
    [-size * 0.34, size * 0.55]
  ], '#123243', identity.color, 2.4);
  polygon(ctx, [
    [-size * 0.46, -size * 0.2],
    [-size * 0.96, -size * 0.03 + armShift],
    [-size * 0.77, size * 0.48],
    [-size * 0.4, size * 0.28]
  ], '#18465c', identity.color, 2);
  polygon(ctx, [
    [size * 0.46, -size * 0.2],
    [size * 0.96, -size * 0.03 - armShift],
    [size * 0.77, size * 0.48],
    [size * 0.4, size * 0.28]
  ], '#18465c', identity.color, 2);
  polygon(ctx, [
    [-size * 0.27, -size * 0.61],
    [0, -size * 0.96],
    [size * 0.28, -size * 0.58],
    [0, -size * 0.34]
  ], identity.secondaryColor, identity.color, 1.4);
  glowCircle(ctx, 0, -size * 0.05, size * 0.2 * frame.pulse, '#effdff', identity.color, isMobile, identity.secondaryColor);
  if (campaign) {
    [-1, 1].forEach(side => {
      const angle = frame.phase * 0.42 + side * 2;
      polygon(ctx, [
        [Math.cos(angle) * size * 0.74, Math.sin(angle) * size * 0.31],
        [Math.cos(angle) * size * 0.74 + side * size * 0.08, Math.sin(angle) * size * 0.31 - size * 0.13],
        [Math.cos(angle) * size * 0.74 + side * size * 0.14, Math.sin(angle) * size * 0.31 + size * 0.07]
      ], identity.secondaryColor, identity.color, 1);
    });
  }
};

const drawTempestBird = (
  ctx: CanvasRenderingContext2D,
  size: number,
  identity: BossIdentity,
  frame: BossModelFrame,
  isMobile: boolean,
  campaign: boolean
) => {
  const flap = Math.sin(frame.phase * 2) * size * 0.08;
  polygon(ctx, [
    [-size * 0.08, -size * 0.08],
    [-size * 0.98, -size * 0.42 - flap],
    [-size * 0.66, size * 0.04],
    [-size * 0.94, size * 0.25],
    [-size * 0.24, size * 0.35]
  ], '#24143d', identity.color, 2);
  polygon(ctx, [
    [size * 0.08, -size * 0.08],
    [size * 0.98, -size * 0.42 - flap],
    [size * 0.66, size * 0.04],
    [size * 0.94, size * 0.25],
    [size * 0.24, size * 0.35]
  ], '#24143d', identity.color, 2);
  polygon(ctx, [
    [0, -size * 0.68],
    [size * 0.28, -size * 0.08],
    [size * 0.12, size * 0.4],
    [0, size * 0.22],
    [-size * 0.12, size * 0.4],
    [-size * 0.28, -size * 0.08]
  ], '#21113d', identity.secondaryColor, 2);
  glowCircle(ctx, 0, -size * 0.05, size * 0.17 * frame.pulse, identity.color, identity.secondaryColor, isMobile, '#ffffff');
  polygon(ctx, [
    [-size * 0.16, size * 0.26],
    [-size * 0.08, size * 0.82],
    [0, size * 0.44],
    [size * 0.08, size * 0.84],
    [size * 0.18, size * 0.24]
  ], identity.color, identity.secondaryColor, 1);
  glowPath(ctx, path => {
    path.moveTo(-size * 0.8, -size * 0.22 - flap);
    path.lineTo(-size * 0.52, -size * 0.08);
    path.lineTo(-size * 0.65, size * 0.08);
    path.lineTo(-size * 0.26, size * 0.03);
    if (campaign) {
      path.moveTo(size * 0.78, -size * 0.22 - flap);
      path.lineTo(size * 0.5, -size * 0.05);
      path.lineTo(size * 0.65, size * 0.1);
      path.lineTo(size * 0.27, size * 0.02);
    }
  }, identity.secondaryColor, 2, isMobile);
};

const drawVoidOverlord = (
  ctx: CanvasRenderingContext2D,
  size: number,
  identity: BossIdentity,
  frame: BossModelFrame,
  isMobile: boolean
) => {
  ctx.save();
  ctx.rotate(frame.phase * 0.08);
  ctx.strokeStyle = identity.color;
  ctx.lineWidth = size * 0.08;
  ctx.shadowColor = identity.color;
  ctx.shadowBlur = isMobile ? 4 : size * 0.22;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.72, 0.15, 1.78);
  ctx.arc(0, 0, size * 0.72, 2.15, 3.88);
  ctx.arc(0, 0, size * 0.72, 4.22, 5.92);
  ctx.stroke();
  ctx.restore();
  polygon(ctx, [
    [-size * 0.36, -size * 0.35],
    [-size * 0.16, -size * 0.75],
    [0, -size * 0.45],
    [size * 0.18, -size * 0.8],
    [size * 0.38, -size * 0.32],
    [size * 0.23, size * 0.42],
    [0, size * 0.72],
    [-size * 0.25, size * 0.4]
  ], '#05020a', identity.color, 2);
  glowCircle(ctx, 0, -size * 0.02, size * 0.23 * frame.pulse, '#020105', identity.secondaryColor, isMobile, identity.secondaryColor);
};

const drawEternityKnight = (
  ctx: CanvasRenderingContext2D,
  size: number,
  identity: BossIdentity,
  frame: BossModelFrame,
  isMobile: boolean
) => {
  polygon(ctx, [
    [-size * 0.3, -size * 0.55],
    [0, -size * 0.86],
    [size * 0.31, -size * 0.54],
    [size * 0.24, size * 0.58],
    [0, size * 0.8],
    [-size * 0.25, size * 0.58]
  ], '#171329', identity.color, 2);
  polygon(ctx, [
    [-size * 0.16, -size * 0.62],
    [0, -size * 0.96],
    [size * 0.14, -size * 0.61]
  ], identity.secondaryColor, identity.color, 1);
  ctx.save();
  ctx.translate(-size * 0.46, 0);
  ctx.rotate(-frame.phase * 0.12);
  glowCircle(ctx, 0, 0, size * 0.32, '#0a1020', identity.color, isMobile, identity.secondaryColor);
  for (let index = 0; index < 8; index += 1) {
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = identity.secondaryColor;
    ctx.fillRect(-1, -size * 0.29, 2, size * 0.09);
  }
  ctx.restore();
  glowPath(ctx, path => {
    path.moveTo(size * 0.46, -size * 0.82);
    path.lineTo(size * 0.46, size * 0.78);
    path.moveTo(size * 0.46, -size * 0.68);
    path.lineTo(size * 0.29, -size * 0.43);
    path.moveTo(size * 0.46, -size * 0.68);
    path.lineTo(size * 0.63, -size * 0.43);
  }, identity.secondaryColor, size * 0.055, isMobile);
};

const drawFrostfireWyrm = (
  ctx: CanvasRenderingContext2D,
  size: number,
  frame: BossModelFrame,
  isMobile: boolean
) => {
  const frost = '#75e6ff';
  const fire = '#ff4d35';
  glowPath(ctx, path => {
    path.moveTo(-size * 0.72, -size * 0.35);
    path.bezierCurveTo(-size * 0.18, -size * 0.78, size * 0.32, size * 0.4, size * 0.02, size * 0.7);
  }, frost, size * 0.23, isMobile);
  glowPath(ctx, path => {
    path.moveTo(size * 0.72, -size * 0.35);
    path.bezierCurveTo(size * 0.18, -size * 0.78, -size * 0.32, size * 0.4, -size * 0.02, size * 0.7);
  }, fire, size * 0.23, isMobile);
  polygon(ctx, [
    [-size * 0.82, -size * 0.4],
    [-size * 0.5, -size * 0.68],
    [-size * 0.42, -size * 0.27]
  ], '#e4fbff', frost, 1.5);
  polygon(ctx, [
    [size * 0.82, -size * 0.4],
    [size * 0.5, -size * 0.68],
    [size * 0.42, -size * 0.27]
  ], '#ffb21c', fire, 1.5);
  ctx.save();
  ctx.rotate(frame.phase * 0.35);
  for (let index = 0; index < 6; index += 1) {
    ctx.rotate(Math.PI / 3);
    ctx.fillStyle = index % 2 ? fire : frost;
    ctx.fillRect(-size * 0.045, -size * 0.5, size * 0.09, size * 0.2);
  }
  ctx.restore();
  glowCircle(ctx, 0, 0, size * 0.18 * frame.pulse, '#f8fafc', '#ffffff', isMobile);
};

const drawSkywardAvian = (
  ctx: CanvasRenderingContext2D,
  size: number,
  identity: BossIdentity,
  frame: BossModelFrame,
  isMobile: boolean
) => {
  const spread = Math.sin(frame.phase * 0.9) * size * 0.04;
  ([-1, 1] as const).forEach(side => {
    for (let index = 0; index < 4; index += 1) {
      const x = side * size * (0.2 + index * 0.18);
      const y = -size * 0.15 + index * size * 0.08;
      polygon(ctx, [
        [x, y],
        [side * (size * (0.52 + index * 0.18) + spread), y - size * 0.2],
        [side * size * (0.46 + index * 0.13), y + size * 0.18]
      ], index % 2 ? '#49350d' : '#2d230c', identity.color, 1.4);
    }
  });
  polygon(ctx, [
    [0, -size * 0.72],
    [size * 0.27, -size * 0.1],
    [size * 0.12, size * 0.56],
    [0, size * 0.78],
    [-size * 0.12, size * 0.56],
    [-size * 0.27, -size * 0.1]
  ], '#3d2d0b', identity.secondaryColor, 2);
  glowCircle(ctx, 0, -size * 0.06, size * 0.14 * frame.pulse, identity.secondaryColor, identity.color, isMobile);
};

const drawMoltenOverlord = (
  ctx: CanvasRenderingContext2D,
  size: number,
  identity: BossIdentity,
  frame: BossModelFrame,
  isMobile: boolean
) => {
  polygon(ctx, [
    [-size * 0.44, -size * 0.34],
    [-size * 0.22, -size * 0.72],
    [-size * 0.1, -size * 0.46],
    [0, -size * 0.86],
    [size * 0.14, -size * 0.45],
    [size * 0.37, -size * 0.73],
    [size * 0.45, -size * 0.24],
    [size * 0.32, size * 0.52],
    [0, size * 0.76],
    [-size * 0.35, size * 0.48]
  ], '#152817', identity.color, 2.4);
  glowPath(ctx, path => {
    path.moveTo(-size * 0.28, -size * 0.26);
    path.lineTo(-size * 0.08, size * 0.02);
    path.lineTo(-size * 0.22, size * 0.4);
    path.moveTo(size * 0.27, -size * 0.32);
    path.lineTo(size * 0.06, size * 0.03);
    path.lineTo(size * 0.21, size * 0.39);
  }, '#ff7048', size * 0.06, isMobile);
  glowCircle(ctx, 0, 0, size * 0.2 * frame.pulse, identity.secondaryColor, '#ff7048', isMobile, identity.color);
  ([-1, 1] as const).forEach(side => {
    glowPath(ctx, path => {
      path.moveTo(side * size * 0.18, size * 0.42);
      path.quadraticCurveTo(side * size * 0.62, size * 0.67, side * size * 0.8, size * 0.44);
    }, identity.color, size * 0.07, isMobile);
  });
};

const drawChronosMonarch = (
  ctx: CanvasRenderingContext2D,
  size: number,
  identity: BossIdentity,
  frame: BossModelFrame,
  isMobile: boolean
) => {
  polygon(ctx, [
    [-size * 0.34, -size * 0.54],
    [size * 0.34, -size * 0.54],
    [size * 0.1, -size * 0.06],
    [size * 0.34, size * 0.56],
    [-size * 0.34, size * 0.56],
    [-size * 0.1, -size * 0.06]
  ], '#24100c', identity.color, 2);
  polygon(ctx, [
    [-size * 0.36, -size * 0.5],
    [-size * 0.19, -size * 0.88],
    [0, -size * 0.64],
    [size * 0.2, -size * 0.9],
    [size * 0.37, -size * 0.5]
  ], identity.secondaryColor, identity.color, 1.5);
  glowCircle(ctx, 0, size * 0.29, size * 0.16 * frame.pulse, identity.color, identity.secondaryColor, isMobile);
  ctx.save();
  ctx.rotate(-frame.phase * 0.16);
  for (let index = 0; index < 7; index += 1) {
    ctx.rotate(Math.PI * 2 / 7);
    ctx.fillStyle = index % 2 ? identity.color : identity.secondaryColor;
    ctx.fillRect(-size * 0.055, -size * 0.8, size * 0.11, size * 0.22);
  }
  ctx.restore();
};

const drawCorePrime = (
  ctx: CanvasRenderingContext2D,
  size: number,
  identity: BossIdentity,
  frame: BossModelFrame,
  isMobile: boolean
) => {
  ctx.save();
  ctx.rotate(frame.phase * 0.12);
  for (let ring = 0; ring < 3; ring += 1) {
    ctx.save();
    ctx.rotate(ring * Math.PI / 3);
    ctx.scale(1, 0.42 + ring * 0.12);
    ctx.strokeStyle = ring === 1 ? identity.secondaryColor : identity.color;
    ctx.lineWidth = size * (0.025 + ring * 0.007);
    ctx.shadowColor = identity.color;
    ctx.shadowBlur = isMobile ? 3 : size * 0.12;
    ctx.setLineDash([size * (0.32 - ring * 0.04), size * 0.11]);
    ctx.beginPath();
    ctx.arc(0, 0, size * (0.48 + ring * 0.16), 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
  const points: Array<[number, number]> = [];
  for (let index = 0; index < 10; index += 1) {
    const angle = -Math.PI / 2 + index * Math.PI * 2 / 10;
    const radius = index % 2 ? size * 0.3 : size * 0.46;
    points.push([Math.cos(angle) * radius, Math.sin(angle) * radius]);
  }
  polygon(ctx, points, '#e8fbff', identity.color, 2);
  glowCircle(ctx, 0, 0, size * 0.16 * frame.pulse, identity.color, '#ffffff', isMobile, '#ffffff');
};

const drawTrialBody = (
  ctx: CanvasRenderingContext2D,
  size: number,
  identity: BossIdentity,
  frame: BossModelFrame,
  isMobile: boolean
) => {
  const weapon = identity.weaponType ?? 'Sword';
  const variant = identity.seed % 4;

  if (weapon === 'Sword') {
    polygon(ctx, [
      [0, -size * 0.62],
      [size * 0.32, -size * 0.18],
      [size * 0.2, size * 0.48],
      [0, size * 0.72],
      [-size * 0.21, size * 0.48],
      [-size * 0.32, -size * 0.18]
    ], '#171d2a', identity.color, 2);
    glowCircle(ctx, 0, -size * 0.08, size * 0.15 * frame.pulse, identity.color, identity.secondaryColor, isMobile);
    ctx.save();
    ctx.translate(size * (variant % 2 ? 0.48 : -0.48), size * 0.03);
    ctx.rotate(variant % 2 ? 0.34 : -0.34);
    polygon(ctx, [
      [0, -size * 0.72],
      [size * 0.09, size * 0.18],
      [0, size * 0.5],
      [-size * 0.09, size * 0.18]
    ], identity.secondaryColor, identity.color, 1.3);
    ctx.restore();
  } else if (weapon === 'Claymore') {
    polygon(ctx, [
      [-size * 0.44, -size * 0.38],
      [-size * 0.17, -size * 0.68],
      [size * 0.3, -size * 0.55],
      [size * 0.42, size * 0.4],
      [size * 0.14, size * 0.7],
      [-size * 0.42, size * 0.44]
    ], '#171d2a', identity.color, 2.4);
    glowCircle(ctx, -size * 0.02, -size * 0.02, size * 0.15 * frame.pulse, identity.secondaryColor, identity.color, isMobile);
    ctx.save();
    ctx.translate(size * (variant % 2 ? 0.55 : -0.55), 0);
    ctx.rotate(variant % 2 ? 0.18 : -0.18);
    polygon(ctx, [
      [-size * 0.12, -size * 0.78],
      [size * 0.17, -size * 0.66],
      [size * 0.12, size * 0.54],
      [0, size * 0.74],
      [-size * 0.13, size * 0.48]
    ], identity.color, identity.secondaryColor, 1.4);
    ctx.restore();
  } else if (weapon === 'Bow') {
    glowPath(ctx, path => {
      path.moveTo(-size * 0.68, -size * 0.55);
      path.quadraticCurveTo(-size * 0.18, 0, -size * 0.68, size * 0.55);
      path.moveTo(size * 0.68, -size * 0.55);
      path.quadraticCurveTo(size * 0.18, 0, size * 0.68, size * 0.55);
    }, identity.color, size * 0.1, isMobile);
    polygon(ctx, [
      [0, -size * 0.68],
      [size * 0.25, -size * 0.18],
      [size * 0.15, size * 0.52],
      [0, size * 0.72],
      [-size * 0.15, size * 0.52],
      [-size * 0.25, -size * 0.18]
    ], '#171d2a', identity.secondaryColor, 2);
    glowCircle(ctx, 0, -size * 0.06, size * 0.14 * frame.pulse, identity.color, identity.secondaryColor, isMobile);
  } else if (weapon === 'Catalyst') {
    ctx.save();
    ctx.rotate(frame.phase * (variant % 2 ? 0.22 : -0.19));
    for (let ring = 0; ring < 2; ring += 1) {
      ctx.save();
      ctx.rotate(ring * Math.PI / 2);
      ctx.scale(1, 0.42 + ring * 0.18);
      ctx.strokeStyle = ring ? identity.secondaryColor : identity.color;
      ctx.lineWidth = size * 0.045;
      ctx.shadowColor = identity.color;
      ctx.shadowBlur = isMobile ? 3 : size * 0.14;
      ctx.beginPath();
      ctx.arc(0, 0, size * (0.5 + ring * 0.13), 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
    const sides = 5 + variant;
    const points: Array<[number, number]> = [];
    for (let index = 0; index < sides; index += 1) {
      const angle = -Math.PI / 2 + index * Math.PI * 2 / sides;
      points.push([Math.cos(angle) * size * 0.34, Math.sin(angle) * size * 0.34]);
    }
    polygon(ctx, points, '#171d2a', identity.secondaryColor, 2);
    glowCircle(ctx, 0, 0, size * 0.13 * frame.pulse, identity.color, identity.secondaryColor, isMobile);
  } else {
    glowPath(ctx, path => {
      path.moveTo(0, -size * 0.92);
      path.lineTo(0, size * 0.86);
    }, identity.secondaryColor, size * 0.07, isMobile);
    polygon(ctx, [
      [0, -size * 0.96],
      [size * (0.22 + variant * 0.02), -size * 0.58],
      [size * 0.07, -size * 0.65],
      [0, -size * 0.45],
      [-size * 0.07, -size * 0.65],
      [-size * (0.22 + variant * 0.02), -size * 0.58]
    ], identity.color, identity.secondaryColor, 1.4);
    polygon(ctx, [
      [-size * 0.28, -size * 0.16],
      [0, -size * 0.42],
      [size * 0.28, -size * 0.16],
      [size * 0.2, size * 0.42],
      [0, size * 0.62],
      [-size * 0.2, size * 0.42]
    ], '#171d2a', identity.color, 2);
    glowCircle(ctx, 0, size * 0.02, size * 0.13 * frame.pulse, identity.color, identity.secondaryColor, isMobile);
  }
};

const drawTrialMotif = (
  ctx: CanvasRenderingContext2D,
  size: number,
  identity: BossIdentity,
  frame: BossModelFrame,
  isMobile: boolean
) => {
  const motif = identity.motif ?? '';
  const isRootMotif = ['heartwood', 'roots', 'bower', 'thorn', 'boltwood'].includes(motif);
  const isStormMotif = ['prism', 'thunder-spear', 'moon-coil', 'coil', 'storm'].includes(motif);
  const isShieldMotif = ['anvil', 'ironfist', 'bastion', 'quarry', 'pickaxe'].includes(motif);
  const isWaterMotif = ['fleet', 'compass', 'satchel', 'torrent', 'leviathan'].includes(motif);

  if (isRootMotif) {
    ([-1, 1] as const).forEach(side => {
      glowPath(ctx, path => {
        path.moveTo(side * size * 0.16, size * 0.35);
        path.quadraticCurveTo(side * size * 0.54, size * 0.6, side * size * 0.78, size * 0.34);
      }, identity.secondaryColor, size * 0.045, isMobile);
    });
  } else if (isStormMotif) {
    glowPath(ctx, path => {
      path.moveTo(-size * 0.72, -size * 0.34);
      path.lineTo(-size * 0.45, -size * 0.02);
      path.lineTo(-size * 0.62, size * 0.2);
      path.lineTo(-size * 0.3, size * 0.4);
      path.moveTo(size * 0.7, -size * 0.31);
      path.lineTo(size * 0.44, 0);
      path.lineTo(size * 0.62, size * 0.2);
      path.lineTo(size * 0.31, size * 0.4);
    }, identity.secondaryColor, size * 0.035, isMobile);
  } else if (isShieldMotif) {
    ([-1, 1] as const).forEach(side => {
      polygon(ctx, [
        [side * size * 0.44, -size * 0.2],
        [side * size * 0.86, -size * 0.02],
        [side * size * 0.68, size * 0.36],
        [side * size * 0.36, size * 0.24]
      ], '#222a36', identity.secondaryColor, 1.4);
    });
  } else if (isWaterMotif) {
    glowPath(ctx, path => {
      path.moveTo(-size * 0.62, size * 0.44);
      path.quadraticCurveTo(0, size * 0.72, size * 0.62, size * 0.43);
    }, identity.secondaryColor, size * 0.05, isMobile);
  } else {
    const spikes = 4 + identity.seed % 4;
    for (let index = 0; index < spikes; index += 1) {
      const angle = index * Math.PI * 2 / spikes + frame.phase * 0.08;
      polygon(ctx, [
        [Math.cos(angle) * size * 0.48, Math.sin(angle) * size * 0.48],
        [Math.cos(angle) * size * 0.78, Math.sin(angle) * size * 0.78],
        [Math.cos(angle + 0.1) * size * 0.51, Math.sin(angle + 0.1) * size * 0.51]
      ], identity.secondaryColor, identity.color, 0.6);
    }
  }

  if (identity.role === 'support') {
    ctx.save();
    ctx.rotate(frame.phase * 0.13);
    ctx.strokeStyle = identity.secondaryColor;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([size * 0.08, size * 0.06]);
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.68, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  } else if (identity.role === 'tank') {
    ctx.strokeStyle = identity.secondaryColor;
    ctx.lineWidth = size * 0.05;
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.68, Math.PI * 0.16, Math.PI * 0.84);
    ctx.arc(0, 0, size * 0.68, Math.PI * 1.16, Math.PI * 1.84);
    ctx.stroke();
  }
};

export const drawBossModel = (
  ctx: CanvasRenderingContext2D,
  enemy: BossModelEnemy,
  timeMs: number,
  isMobile: boolean,
  prefersReducedMotion = false
) => {
  const identity = getBossIdentityById(enemy.bossIdentityId)
    ?? getBossIdentityForEnemy(enemy.name, enemy.bossType);
  const frame = getBossModelFrame(identity, timeMs, prefersReducedMotion);
  const size = enemy.radius * 1.22;

  ctx.save();
  ctx.translate(enemy.x, enemy.y + frame.bobOffset);
  ctx.rotate(frame.rotation);

  ctx.save();
  ctx.scale(1, 0.28);
  ctx.globalAlpha = 0.48;
  ctx.beginPath();
  ctx.arc(0, size * 2.5, size * 0.92, 0, Math.PI * 2);
  ctx.fillStyle = '#000000';
  ctx.fill();
  ctx.globalAlpha = 0.28;
  ctx.strokeStyle = identity.color;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();

  drawOrbitMotes(ctx, identity, size, frame, isMobile);

  switch (identity.visualKind) {
    case 'calamity-dragon':
      drawCalamityDragon(ctx, size, identity, frame, isMobile, true);
      break;
    case 'frost-golem':
      drawFrostGolem(ctx, size, identity, frame, isMobile, true);
      break;
    case 'tempest-bird':
      drawTempestBird(ctx, size, identity, frame, isMobile, true);
      break;
    case 'void-overlord':
      drawVoidOverlord(ctx, size, identity, frame, isMobile);
      break;
    case 'eternity-knight':
      drawEternityKnight(ctx, size, identity, frame, isMobile);
      break;
    case 'frostfire-wyrm':
      drawFrostfireWyrm(ctx, size, frame, isMobile);
      break;
    case 'skyward-avian':
      drawSkywardAvian(ctx, size, identity, frame, isMobile);
      break;
    case 'molten-overlord':
      drawMoltenOverlord(ctx, size, identity, frame, isMobile);
      break;
    case 'chronos-monarch':
      drawChronosMonarch(ctx, size, identity, frame, isMobile);
      break;
    case 'core-prime':
      drawCorePrime(ctx, size, identity, frame, isMobile);
      break;
    case 'world-drake':
      drawCalamityDragon(ctx, size * 0.9, identity, frame, isMobile, false);
      break;
    case 'world-golem':
      drawFrostGolem(ctx, size * 0.9, identity, frame, isMobile, false);
      break;
    case 'world-bird':
      drawTempestBird(ctx, size * 0.92, identity, frame, isMobile, false);
      break;
    case 'trial':
      drawTrialBody(ctx, size, identity, frame, isMobile);
      drawTrialMotif(ctx, size, identity, frame, isMobile);
      break;
  }

  ctx.restore();
  return identity;
};
