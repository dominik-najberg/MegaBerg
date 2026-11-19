import { Ev, type GameEvent } from '../sim/events';
import type { World } from '../sim/world';

type Wave = OscillatorType;

/** D dorian: D E F G A B C (semitones from D). */
const DORIAN = [0, 2, 3, 5, 7, 9, 10];
const D3 = 146.83;

function degFreq(deg: number, octave = 0): number {
  const n = DORIAN.length;
  const o = Math.floor(deg / n);
  const s = DORIAN[((deg % n) + n) % n] as number;
  return D3 * Math.pow(2, (s + 12 * (o + octave)) / 12);
}

/** Chords as scale degrees (root, third, fifth) for the 8-bar loop: i VII IV i | i v IV VII. */
const CHORDS: number[][] = [
  [0, 2, 4],
  [6, 8, 10],
  [3, 5, 7],
  [0, 2, 4],
  [0, 2, 4],
  [4, 6, 8],
  [3, 5, 7],
  [6, 8, 10],
];

/** Flute phrases: [eighth-note step in bar, scale degree, length in eighths]. */
const PHRASES: number[][][] = [
  [[0, 7, 3], [3, 8, 1], [4, 9, 2], [6, 7, 2]],
  [[0, 11, 2], [2, 9, 2], [4, 8, 4]],
  [[0, 7, 2], [2, 9, 1], [3, 10, 1], [4, 11, 4]],
  [[1, 8, 1], [2, 7, 2], [4, 4, 4]],
  [[0, 4, 2], [2, 7, 2], [4, 9, 2], [6, 8, 2]],
  [[0, 11, 3], [3, 12, 1], [4, 14, 4]],
  [],
  [[0, 9, 6]],
];

/**
 * All sound is synthesised with Web Audio: no audio files.
 * Effects are throttled per type so 300 enemies dying do not blow the mix.
 */
export class AudioSys {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private sfx: GainNode | null = null;
  private music: GainNode | null = null;
  private delay: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  private vol = { master: 0.8, music: 0.6, sfx: 0.8 };
  private readonly last: Record<string, number> = {};
  private gemCombo = 0;
  private gemLast = 0;
  // music state
  private musicOn = false;
  private timer: ReturnType<typeof setInterval> | null = null;
  private nextTime = 0;
  private step = 0;
  private bar = 0;
  private phrase: number[][] = [];
  private droneGain: GainNode | null = null;
  private droneFilter: BiquadFilterNode | null = null;
  private seed = 7;
  /** 0 calm (menu) .. 1 boss fight. */
  intensity = 0.15;

  /** Must be called from a user gesture (click / key). Safe to call repeatedly. */
  unlock(): void {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') void this.ctx.resume();
      return;
    }
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    try {
      const ctx = new Ctor();
      this.ctx = ctx;
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -16;
      comp.ratio.value = 5;
      comp.connect(ctx.destination);
      this.master = ctx.createGain();
      this.master.connect(comp);
      this.sfx = ctx.createGain();
      this.sfx.connect(this.master);
      this.music = ctx.createGain();
      this.music.connect(this.master);
      // Feedback delay shared by the music for a sense of space.
      const d = ctx.createDelay(1);
      d.delayTime.value = 0.34;
      const fb = ctx.createGain();
      fb.gain.value = 0.36;
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 1800;
      this.delay = ctx.createGain();
      this.delay.gain.value = 0.5;
      this.delay.connect(d);
      d.connect(lp);
      lp.connect(fb);
      fb.connect(d);
      lp.connect(this.music);
      // Shared white-noise buffer.
      const buf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      this.noise = buf;
      this.applyVolumes();
      this.startMusic();
    } catch {
      this.ctx = null;
    }
  }

  setVolumes(master: number, music: number, sfx: number): void {
    this.vol = { master, music, sfx };
    this.applyVolumes();
  }

  private applyVolumes(): void {
    if (!this.ctx || !this.master || !this.music || !this.sfx) return;
    const t = this.ctx.currentTime;
    this.master.gain.setTargetAtTime(this.vol.master, t, 0.05);
    this.music.gain.setTargetAtTime(this.vol.music * 0.55, t, 0.05);
    this.sfx.gain.setTargetAtTime(this.vol.sfx * 0.7, t, 0.05);
  }

  private ok(key: string, gap: number): boolean {
    const now = this.ctx ? this.ctx.currentTime : 0;
    if (now - (this.last[key] ?? -10) < gap) return false;
    this.last[key] = now;
    return true;
  }

  // ------------------------------------------------------------ synthesis primitives

  /** Oscillator with pitch glide and percussive envelope. */
  private tone(type: Wave, f0: number, f1: number, dur: number, gain: number, when = 0, dest?: AudioNode, attack = 0.004): void {
    const ctx = this.ctx;
    const out = dest ?? this.sfx;
    if (!ctx || !out) return;
    const t = ctx.currentTime + when;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(Math.max(20, f0), t);
    if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g);
    g.connect(out);
    o.start(t);
    o.stop(t + dur + 0.02);
  }

  /** Filtered noise burst with an optional filter sweep. */
  private hiss(type: BiquadFilterType, f0: number, f1: number, dur: number, gain: number, when = 0, q = 1): void {
    const ctx = this.ctx;
    if (!ctx || !this.sfx || !this.noise) return;
    const t = ctx.currentTime + when;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    src.loop = true;
    src.loopStart = Math.random() * 0.5;
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.Q.value = q;
    f.frequency.setValueAtTime(Math.max(30, f0), t);
    if (f1 !== f0) f.frequency.exponentialRampToValueAtTime(Math.max(30, f1), t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f);
    f.connect(g);
    g.connect(this.sfx);
    src.start(t, Math.random() * 0.5);
    src.stop(t + dur + 0.02);
  }

  // ------------------------------------------------------------ game events

  handleEvents(world: World): void {
    if (!this.ctx) return;
    const ev = world.events;
    for (let i = 0; i < ev.count; i++) this.onEvent(ev.items[i] as GameEvent);
  }

  private onEvent(e: GameEvent): void {
    switch (e.type) {
      case Ev.Hit:
        if (e.b === 2) break;
        if (e.b === 1) {
          if (this.ok('crit', 0.06)) {
            this.hiss('bandpass', 3200, 1600, 0.08, 0.28, 0, 2);
            this.tone('square', 880, 440, 0.07, 0.07);
          }
        } else if (this.ok('hit', 0.045)) {
          this.hiss('bandpass', 2000 + Math.random() * 600, 900, 0.05, 0.2, 0, 1.5);
        }
        break;
      case Ev.Kill:
        if (e.c > 2) {
          this.tone('sawtooth', 110, 30, 1.6, 0.5);
          this.hiss('lowpass', 2400, 80, 1.8, 0.6);
        } else if (e.b > 0 || e.c > 1) {
          if (this.ok('bigkill', 0.1)) {
            this.tone('sine', 200, 50, 0.3, 0.4);
            this.hiss('lowpass', 1800, 200, 0.3, 0.35);
          }
        } else if (this.ok('kill', 0.055)) {
          this.tone('sine', 170 + Math.random() * 50, 60, 0.11, 0.26);
          this.hiss('highpass', 1500, 3000, 0.06, 0.08);
        }
        break;
      case Ev.Gem: {
        if (!this.ok('gem', 0.03)) break;
        const now = this.ctx ? this.ctx.currentTime : 0;
        this.gemCombo = now - this.gemLast < 0.5 ? Math.min(this.gemCombo + 1, 21) : 0;
        this.gemLast = now;
        // Rising pitch while gems keep flowing in: climbs the dorian scale.
        const f = degFreq(this.gemCombo, 2);
        this.tone('triangle', f, f * 1.01, 0.12, 0.13);
        this.tone('sine', f * 2, f * 2, 0.07, 0.05);
        break;
      }
      case Ev.Coin:
        if (this.ok('coin', 0.05)) {
          this.tone('square', 1320, 1320, 0.05, 0.07);
          this.tone('square', 1760, 1760, 0.14, 0.07, 0.05);
        }
        break;
      case Ev.LevelUp:
        [0, 2, 4, 7, 9].forEach((d, i) => this.tone('triangle', degFreq(d, 1), degFreq(d, 1), 0.34, 0.2, i * 0.07));
        this.tone('sine', degFreq(7, 2), degFreq(7, 2), 0.7, 0.1, 0.35);
        break;
      case Ev.PlayerHit:
        if (this.ok('hurt', 0.1)) {
          this.tone('sawtooth', 320, 90, 0.2, 0.3);
          this.hiss('lowpass', 1200, 300, 0.16, 0.3);
        }
        break;
      case Ev.Lightning:
        if (this.ok('bolt', 0.07)) {
          this.hiss('highpass', 6000, 400, 0.16, 0.38);
          this.hiss('lowpass', 900, 60, 0.55, 0.42, 0.03);
          this.tone('sine', 90, 35, 0.4, 0.4, 0.02);
        }
        break;
      case Ev.Sweep:
        if (this.ok('sweep', 0.08)) this.hiss('bandpass', 500, 2600, 0.16, 0.26, 0, 0.8);
        break;
      case Ev.Shoot:
        if (!this.ok(`shoot${e.a}`, 0.09)) break;
        if (e.a === 1) this.hiss('bandpass', 400, 1800, 0.14, 0.16, 0, 1.2);
        else if (e.a === 2) this.tone('triangle', 700, 380, 0.07, 0.12);
        else if (e.a === 3) this.hiss('highpass', 5000, 2500, 0.5, 0.14);
        else if (e.a === 4) this.tone('sine', 300, 520, 0.16, 0.12);
        else this.hiss('bandpass', 900, 2400, 0.22, 0.12, 0, 2);
        break;
      case Ev.Explosion:
      case Ev.Hazard:
        if (this.ok('boom', 0.07)) {
          const big = e.a > 5 ? 1.6 : 1;
          this.hiss('lowpass', 1600, 90, 0.36 * big, 0.42);
          this.tone('sine', 130, 38, 0.3 * big, 0.42);
        }
        break;
      case Ev.Jump:
        this.tone('sine', 300, 540, 0.11, 0.1);
        break;
      case Ev.AirJump:
        this.tone('sine', 480, 900, 0.13, 0.12);
        this.hiss('highpass', 3000, 6000, 0.12, 0.07);
        break;
      case Ev.Dash:
        this.hiss('bandpass', 300, 2400, 0.2, 0.25, 0, 0.7);
        break;
      case Ev.Land:
        if (e.b > 0) this.hiss('bandpass', 1400, 500, 0.22, 0.22, 0, 0.6);
        else this.tone('sine', 120, 55, 0.09, 0.14 + e.a * 0.2);
        break;
      case Ev.Heal:
      case Ev.Pickup:
        if (this.ok('heal', 0.15)) {
          this.tone('sine', degFreq(4, 1), degFreq(4, 1), 0.3, 0.14);
          this.tone('sine', degFreq(7, 1), degFreq(7, 1), 0.4, 0.14, 0.1);
        }
        break;
      case Ev.ChestOpen:
        [0, 4, 7, 9, 11, 14].forEach((d, i) => this.tone('triangle', degFreq(d, 1), degFreq(d, 1), 0.3, 0.16, i * 0.05));
        this.hiss('highpass', 4000, 8000, 0.5, 0.08);
        break;
      case Ev.Shrine:
        [1, 2, 3.01, 4.2].forEach((h, i) => this.tone('sine', degFreq(0, 1) * h, degFreq(0, 1) * h, 1.8 - i * 0.3, 0.2 / (i + 1)));
        break;
      case Ev.Evolve:
        [0, 2, 4, 7, 9, 11, 14, 16].forEach((d, i) => this.tone('sawtooth', degFreq(d, 0), degFreq(d, 0), 0.5, 0.1, i * 0.06));
        this.tone('sine', degFreq(14, 1), degFreq(14, 1), 1.2, 0.16, 0.5);
        break;
      case Ev.BossSpawn:
        this.tone('sawtooth', 55, 52, 2.2, 0.4, 0, undefined, 0.5);
        this.tone('sawtooth', 82.5, 80, 2.2, 0.26, 0.1, undefined, 0.5);
        this.hiss('lowpass', 200, 900, 2, 0.3);
        break;
      case Ev.BossPhase:
        this.tone('sawtooth', 70, 40, 1.4, 0.5);
        this.hiss('bandpass', 300, 1200, 1.2, 0.45, 0, 0.5);
        break;
      case Ev.Quake:
        this.tone('sine', 70, 28, 0.6, 0.55);
        this.hiss('lowpass', 500, 60, 0.6, 0.45);
        break;
      case Ev.Teleport:
        this.tone('sine', 1200, 200, 0.22, 0.1);
        break;
      case Ev.EnemyShoot:
        if (this.ok('eshoot', 0.1)) this.tone('square', 240, 520, 0.14, 0.08);
        break;
      case Ev.ChargeWarn:
        if (this.ok('warn', 0.2)) this.tone('sawtooth', 180, 260, 0.3, 0.12);
        break;
      case Ev.Fuse:
        if (this.ok('fuse', 0.1)) this.tone('square', 900, 1500, 0.4, 0.05);
        break;
      case Ev.Death:
        [9, 7, 4, 2, 0].forEach((d, i) => this.tone('sawtooth', degFreq(d, 0), degFreq(d, -1), 0.6, 0.2, i * 0.18));
        this.hiss('lowpass', 800, 60, 1.6, 0.4);
        break;
      case Ev.Win:
        [0, 4, 7, 9, 11, 14, 11, 14, 16, 18].forEach((d, i) => this.tone('triangle', degFreq(d, 1), degFreq(d, 1), 0.5, 0.2, i * 0.11));
        break;
      case Ev.Revive:
        [0, 4, 7, 11, 14].forEach((d, i) => this.tone('sine', degFreq(d, 1), degFreq(d, 2), 0.8, 0.18, i * 0.08));
        break;
      case Ev.Magnet:
        this.tone('sine', 200, 1600, 0.7, 0.14);
        this.tone('triangle', 100, 800, 0.7, 0.1, 0.05);
        break;
      case Ev.Bonus:
        // Two rising bells: something good has appeared nearby.
        [e.a ? 7 : 4, e.a ? 11 : 9, 14].forEach((d, i) => this.tone('sine', degFreq(d, 1), degFreq(d, 1), 0.7, 0.13, i * 0.12));
        break;
      case Ev.Zone:
        if (this.ok('zone', 0.1)) this.hiss('lowpass', 2400, 300, 0.4, 0.25);
        break;
      default:
        break;
    }
  }

  private stepDist = 0;
  private heartT = 0;

  /** Continuous sounds that depend on state rather than events: footsteps, low-health heartbeat. */
  update(world: World, dt: number): void {
    if (!this.ctx) return;
    const p = world.player;
    const speed = Math.hypot(p.vx, p.vz);
    if (p.onGround && speed > 1.5 && p.dashT <= 0) {
      this.stepDist += speed * dt;
      if (this.stepDist > 2.4) {
        this.stepDist = 0;
        if (p.inPuddle) this.hiss('bandpass', 1500, 600, 0.12, 0.1, 0, 0.7);
        else this.hiss('lowpass', 500 + Math.random() * 200, 200, 0.05, 0.11);
      }
    }
    if (p.hp > 0 && p.hp < world.stats.maxHp * 0.3) {
      this.heartT -= dt;
      if (this.heartT <= 0) {
        this.heartT = 0.85;
        this.tone('sine', 70, 45, 0.14, 0.4);
        this.tone('sine', 62, 40, 0.16, 0.3, 0.17);
      }
    } else {
      this.heartT = 0;
    }
  }

  ui(kind: 'click' | 'hover' | 'buy' | 'deny' | 'card'): void {
    if (!this.ctx) return;
    if (kind === 'hover') {
      if (this.ok('hover', 0.04)) this.tone('sine', 660, 700, 0.04, 0.04);
    } else if (kind === 'click') {
      this.tone('triangle', 520, 780, 0.08, 0.12);
    } else if (kind === 'buy') {
      this.tone('square', 990, 990, 0.06, 0.08);
      this.tone('square', 1480, 1480, 0.16, 0.08, 0.06);
      this.tone('triangle', degFreq(7, 1), degFreq(7, 1), 0.3, 0.12, 0.1);
    } else if (kind === 'deny') {
      this.tone('sawtooth', 160, 110, 0.18, 0.12);
    } else {
      this.tone('triangle', degFreq(4, 1), degFreq(7, 1), 0.16, 0.14);
      this.hiss('highpass', 3000, 7000, 0.12, 0.06);
    }
  }

  // ------------------------------------------------------------ music

  private rand(): number {
    this.seed = (this.seed * 1664525 + 1013904223) >>> 0;
    return this.seed / 4294967296;
  }

  private startMusic(): void {
    const ctx = this.ctx;
    if (!ctx || !this.music || this.musicOn) return;
    this.musicOn = true;
    // Drone: detuned saws on D and A through a slowly breathing low-pass filter.
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = 320;
    f.Q.value = 2;
    const g = ctx.createGain();
    g.gain.value = 0.0001;
    g.gain.exponentialRampToValueAtTime(0.16, ctx.currentTime + 4);
    for (const [freq, det] of [
      [D3 / 2, -6],
      [D3 / 2, 7],
      [(D3 / 2) * 1.5, 3],
      [D3 / 4, 0],
    ] as Array<[number, number]>) {
      const o = ctx.createOscillator();
      o.type = 'sawtooth';
      o.frequency.value = freq;
      o.detune.value = det;
      o.connect(f);
      o.start();
    }
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.07;
    const lg = ctx.createGain();
    lg.gain.value = 140;
    lfo.connect(lg);
    lg.connect(f.frequency);
    lfo.start();
    f.connect(g);
    g.connect(this.music);
    this.droneGain = g;
    this.droneFilter = f;
    this.nextTime = ctx.currentTime + 0.2;
    this.timer = setInterval(() => this.schedule(), 90);
  }

  private pluck(freq: number, t: number, gain: number): void {
    const ctx = this.ctx;
    if (!ctx || !this.music || !this.delay) return;
    const o = ctx.createOscillator();
    const o2 = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'triangle';
    o2.type = 'sine';
    o.frequency.value = freq;
    o2.frequency.value = freq * 2.003;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);
    o.connect(g);
    o2.connect(g);
    g.connect(this.music);
    g.connect(this.delay);
    o.start(t);
    o2.start(t);
    o.stop(t + 1);
    o2.stop(t + 1);
  }

  private flute(freq: number, t: number, dur: number, gain: number): void {
    const ctx = this.ctx;
    if (!ctx || !this.music || !this.delay) return;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    const vib = ctx.createOscillator();
    const vg = ctx.createGain();
    o.type = 'triangle';
    o.frequency.value = freq;
    vib.frequency.value = 5.2;
    vg.gain.value = freq * 0.008;
    vib.connect(vg);
    vg.connect(o.frequency);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.09);
    g.gain.setValueAtTime(gain, t + Math.max(0.1, dur - 0.12));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.25);
    o.connect(g);
    g.connect(this.music);
    g.connect(this.delay);
    o.start(t);
    vib.start(t);
    o.stop(t + dur + 0.3);
    vib.stop(t + dur + 0.3);
  }

  private drum(t: number, gain: number, freq: number): void {
    const ctx = this.ctx;
    if (!ctx || !this.music) return;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(freq, t);
    o.frequency.exponentialRampToValueAtTime(freq * 0.45, t + 0.18);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
    o.connect(g);
    g.connect(this.music);
    o.start(t);
    o.stop(t + 0.32);
  }

  /** Look-ahead scheduler: queues notes ~0.3 s into the future on the audio clock. */
  private schedule(): void {
    const ctx = this.ctx;
    if (!ctx) return;
    if (ctx.state !== 'running') {
      this.nextTime = ctx.currentTime + 0.1;
      return;
    }
    const k = this.intensity;
    const bpm = 66 + k * 38;
    const eighth = 60 / bpm / 2;
    if (this.nextTime < ctx.currentTime) this.nextTime = ctx.currentTime + 0.05;
    while (this.nextTime < ctx.currentTime + 0.3) {
      const t = this.nextTime;
      const s = this.step;
      if (s === 0) this.phrase = this.rand() < 0.2 + (1 - k) * 0.25 ? [] : (PHRASES[Math.floor(this.rand() * PHRASES.length)] as number[][]);
      const chord = CHORDS[this.bar % CHORDS.length] as number[];
      // plucked arpeggio (gusli)
      const pattern = [0, 1, 2, 1, 0, 2, 1, 2];
      const playPluck = k > 0.55 || s % 2 === 0;
      if (playPluck) {
        const d = chord[pattern[s] as number] as number;
        this.pluck(degFreq(d, s === 0 ? -1 : 0), t, s === 0 ? 0.16 : 0.09);
      }
      for (const n of this.phrase) {
        if (n[0] === s) this.flute(degFreq(n[1] as number, 0), t, (n[2] as number) * eighth, 0.075 + k * 0.03);
      }
      if (k > 0.3) {
        if (s === 0) this.drum(t, 0.3 + k * 0.2, 82);
        if (s === 4) this.drum(t, 0.18 + k * 0.2, 110);
        if (k > 0.7 && (s === 3 || s === 6)) this.drum(t, 0.16, 140);
        if (k > 0.85 && s % 2 === 1) this.drum(t, 0.08, 220);
      }
      this.step = (s + 1) % 8;
      if (this.step === 0) this.bar++;
      this.nextTime += eighth;
    }
    if (this.droneFilter && this.droneGain) {
      this.droneFilter.frequency.setTargetAtTime(260 + k * 520, ctx.currentTime, 1.5);
      this.droneGain.gain.setTargetAtTime(0.13 + k * 0.07, ctx.currentTime, 1.5);
    }
  }

  dispose(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }
}
