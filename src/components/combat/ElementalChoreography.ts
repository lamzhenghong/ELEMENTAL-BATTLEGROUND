import type { ElementType } from '../../types';
import { ELEMENT_VISUALS, getReactionChoreography, type ReactionMotion } from '../../utils/elementVisualLanguage';

const symbolPaths = new Map<ElementType, Path2D>();

function getSymbolPath(element: ElementType) {
  let path = symbolPaths.get(element);
  if (!path) {
    path = new Path2D(ELEMENT_VISUALS[element].symbolPath);
    symbolPaths.set(element, path);
  }
  return path;
}

type VisualEvent = {
  kind: 'reaction' | 'handoff' | 'entrance';
  x: number;
  y: number;
  age: number;
  duration: number;
  motion: ReactionMotion;
  colors: readonly string[];
  elements: readonly ElementType[];
};

export class ElementalChoreography {
  private events: VisualEvent[] = [];

  get activeCount() { return this.events.length; }

  reaction(id: string, x: number, y: number) {
    const sequence = getReactionChoreography(id);
    this.add({ kind: 'reaction', x, y, age: 0, duration: 410, motion: sequence.motion,
      colors: sequence.elements.map(element => ELEMENT_VISUALS[element].color), elements: sequence.elements });
  }

  handoff(from: ElementType, to: ElementType, x: number, y: number) {
    this.events = this.events.filter(event => event.kind !== 'handoff');
    this.add({ kind: 'handoff', x, y, age: 0, duration: 330, motion: 'ring',
      colors: [ELEMENT_VISUALS[from].color, ELEMENT_VISUALS[to].color], elements: [from, to] });
  }

  entrance(x: number, y: number, color: string) {
    this.add({ kind: 'entrance', x, y, age: 0, duration: 480, motion: 'ring', colors: [color], elements: [] });
  }

  private add(event: VisualEvent) {
    if (this.events.length >= 12) this.events.shift();
    this.events.push(event);
  }

  step(deltaMs: number) {
    for (const event of this.events) event.age += Math.min(50, Math.max(0, deltaMs));
    this.events = this.events.filter(event => event.age < event.duration);
  }

  clear() { this.events = []; }

  draw(ctx: CanvasRenderingContext2D, lowQuality: boolean) {
    for (const event of this.events) {
      const t = event.age / event.duration;
      const alpha = (1 - t) * (lowQuality ? 0.38 : 0.58);
      ctx.save();
      ctx.translate(event.x, event.y);
      ctx.globalAlpha = alpha;
      ctx.lineWidth = lowQuality ? 2.5 : 3.5;
      ctx.lineCap = 'round';
      const primary = event.colors[0];
      const secondary = event.colors[1] ?? primary;

      if (event.kind === 'entrance') {
        ctx.strokeStyle = primary;
        ctx.beginPath();
        ctx.ellipse(0, 0, 45 - t * 16, 19 - t * 8, 0, 0, Math.PI * 2);
        ctx.stroke();
        if (!lowQuality) for (let i = 0; i < 3; i++) {
          const angle = i * Math.PI * 2 / 3;
          ctx.beginPath();
          ctx.moveTo(Math.cos(angle) * 40, Math.sin(angle) * 20 - 22 + t * 25);
          ctx.lineTo(Math.cos(angle) * 40, Math.sin(angle) * 20 + 6 + t * 25);
          ctx.stroke();
        }
      } else if (event.kind === 'handoff') {
        ctx.strokeStyle = secondary;
        ctx.beginPath();
        ctx.arc(0, 0, 24 + t * 38, -Math.PI * 0.85, Math.PI * 0.8);
        ctx.stroke();
        ctx.strokeStyle = primary;
        ctx.beginPath();
        ctx.arc(0, 0, 45 - t * 25, Math.PI * 0.1, Math.PI * 1.3);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-55 + t * 80, -24 + t * 8);
        ctx.quadraticCurveTo(0, -50, 33 + t * 22, -5);
        ctx.stroke();
      } else if (event.motion === 'compress') {
        ctx.strokeStyle = t < 0.35 ? primary : secondary;
        ctx.beginPath();
        ctx.arc(0, 0, t < 0.35 ? 62 - t * 115 : 22 + (t - 0.35) * 85, 0, Math.PI * 2);
        ctx.stroke();
        if (!lowQuality) for (let i = 0; i < 4; i++) {
          const angle = i * Math.PI / 2 + t;
          ctx.beginPath();
          ctx.arc(Math.cos(angle) * 38, Math.sin(angle) * 38, 6, 0, Math.PI * 2);
          ctx.stroke();
        }
      } else if (event.motion === 'fracture' || event.motion === 'branch') {
        const count = lowQuality ? 4 : 7;
        for (let i = 0; i < count; i++) {
          const angle = i * Math.PI * 2 / count;
          const distance = 20 + t * (event.motion === 'branch' ? 85 : 70);
          ctx.strokeStyle = i % 2 ? primary : secondary;
          ctx.beginPath();
          ctx.moveTo(Math.cos(angle) * 15, Math.sin(angle) * 15);
          ctx.lineTo(Math.cos(angle + 0.08) * distance * 0.63, Math.sin(angle + 0.08) * distance * 0.63);
          ctx.lineTo(Math.cos(angle) * distance, Math.sin(angle) * distance);
          ctx.stroke();
        }
      } else if (event.motion === 'bloom') {
        ctx.strokeStyle = primary;
        for (let i = 0; i < (lowQuality ? 4 : 6); i++) {
          const angle = i * Math.PI / 3;
          const r = 15 + t * 55;
          ctx.beginPath();
          ctx.ellipse(Math.cos(angle) * r * 0.55, Math.sin(angle) * r * 0.55, 23 + t * 12, 11 + t * 9, angle, 0, Math.PI * 2);
          ctx.stroke();
        }
      } else {
        ctx.strokeStyle = primary;
        ctx.beginPath();
        ctx.arc(0, 0, 20 + t * 78, 0, Math.PI * 2);
        ctx.stroke();
      }
      if (!lowQuality && event.kind !== 'entrance') {
        event.elements.slice(0, 2).forEach((element, index) => {
          ctx.save();
          ctx.translate((index ? 1 : -1) * (32 + t * 25), -18 - (index ? 8 : 0));
          ctx.scale(0.85, 0.85);
          ctx.strokeStyle = ELEMENT_VISUALS[element].pale;
          ctx.lineWidth = 2;
          ctx.stroke(getSymbolPath(element));
          ctx.restore();
        });
      }
      ctx.restore();
    }
  }
}
