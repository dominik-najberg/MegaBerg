import * as THREE from 'three';

interface Num {
  x: number;
  y: number;
  z: number;
  text: string;
  life: number;
  span: number;
  flag: number;
  ox: number;
}

const MAX = 70;
const _v = new THREE.Vector3();

/** 2D canvas drawn over the 3D view: floating damage numbers. */
export class Overlay {
  private readonly ctx: CanvasRenderingContext2D;
  private readonly nums: Num[] = [];
  private cursor = 0;
  private w = 0;
  private h = 0;
  private dirty = false;

  constructor(private readonly canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    for (let i = 0; i < MAX; i++) this.nums.push({ x: 0, y: 0, z: 0, text: '', life: 0, span: 1, flag: 0, ox: 0 });
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize(): void {
    this.w = this.canvas.clientWidth || window.innerWidth;
    this.h = this.canvas.clientHeight || window.innerHeight;
    this.canvas.width = this.w;
    this.canvas.height = this.h;
  }

  /** flag: 0 normal, 1 crit, 2 burn. */
  number(x: number, y: number, z: number, value: number, flag: number): void {
    const n = this.nums[this.cursor] as Num;
    this.cursor = (this.cursor + 1) % MAX;
    n.x = x;
    n.y = y;
    n.z = z;
    n.text = value >= 10 ? String(Math.round(value)) : String(Math.max(1, Math.round(value)));
    n.span = flag === 1 ? 0.85 : 0.6;
    n.life = n.span;
    n.flag = flag;
    n.ox = (Math.random() - 0.5) * 26;
  }

  clear(): void {
    for (const n of this.nums) n.life = 0;
  }

  draw(camera: THREE.Camera, dt: number): void {
    const ctx = this.ctx;
    if (this.dirty) {
      ctx.clearRect(0, 0, this.w, this.h);
      this.dirty = false;
    }
    ctx.textAlign = 'center';
    ctx.lineJoin = 'round';
    for (let i = 0; i < MAX; i++) {
      const n = this.nums[i] as Num;
      if (n.life <= 0) continue;
      n.life -= dt;
      const k = 1 - n.life / n.span;
      _v.set(n.x, n.y + k * 1.1, n.z).project(camera);
      if (_v.z > 1 || _v.z < -1) continue;
      const sx = (_v.x * 0.5 + 0.5) * this.w + n.ox;
      const sy = (-_v.y * 0.5 + 0.5) * this.h;
      const pop = k < 0.15 ? 0.6 + (k / 0.15) * 0.6 : 1.2 - Math.min(0.2, (k - 0.15) * 0.6);
      const size = (n.flag === 1 ? 26 : n.flag === 2 ? 14 : 18) * pop;
      ctx.globalAlpha = k > 0.6 ? 1 - (k - 0.6) / 0.4 : 1;
      ctx.font = `bold ${size.toFixed(0)}px Georgia, serif`;
      ctx.lineWidth = 4;
      ctx.strokeStyle = 'rgba(20,10,10,0.85)';
      ctx.fillStyle = n.flag === 1 ? '#ffd23a' : n.flag === 2 ? '#ff8a3a' : '#fff6e0';
      const text = n.flag === 1 ? `${n.text}!` : n.text;
      ctx.strokeText(text, sx, sy);
      ctx.fillText(text, sx, sy);
      this.dirty = true;
    }
    ctx.globalAlpha = 1;
  }
}
