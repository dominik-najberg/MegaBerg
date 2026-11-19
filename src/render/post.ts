import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

/**
 * Final pass: the scene arrives in linear HDR (with bloom already added) and leaves as the picture on screen.
 * Tone mapping, a gentle filmic grade (cool shadows, warm highlights), vignette and a trace of grain.
 */
const FinalShader = {
  uniforms: {
    tDiffuse: { value: null as THREE.Texture | null },
    toneMappingExposure: { value: 1.3 },
    uTime: { value: 0 },
    uVignette: { value: 0.36 },
    uGrain: { value: 0.014 },
    uSaturation: { value: 1.06 },
    uContrast: { value: 1.04 },
    /** 0 at dusk, 1 at night: the grade drifts from warm to cold. */
    uNight: { value: 0 },
    /** 0..1 red pulse when the hero is hurt (kept in the DOM overlay; reserved). */
    uAspect: { value: 1.6 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position.xy, 0.0, 1.0);
    }`,
  fragmentShader: /* glsl */ `
    #include <common>
    #include <tonemapping_pars_fragment>
    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform float uVignette;
    uniform float uGrain;
    uniform float uSaturation;
    uniform float uContrast;
    uniform float uNight;
    uniform float uAspect;
    varying vec2 vUv;

    void main() {
      vec3 col = texture2D(tDiffuse, vUv).rgb;
      col = ACESFilmicToneMapping(col);
      // Grade in display space, where equal steps look equal: a tint added in linear light would flood the shadows.
      col = sRGBTransferOETF(vec4(max(col, 0.0), 1.0)).rgb;

      float l = dot(col, vec3(0.2126, 0.7152, 0.0722));
      // Split toning: shadows lean violet-blue, highlights lean amber.
      vec3 shadowTint = mix(vec3(0.012, -0.004, 0.022), vec3(-0.004, 0.004, 0.026), uNight);
      vec3 lightTint = mix(vec3(0.03, 0.012, -0.02), vec3(0.016, 0.012, -0.006), uNight);
      col += shadowTint * (1.0 - smoothstep(0.0, 0.5, l));
      col += lightTint * smoothstep(0.45, 1.0, l);
      col = mix(vec3(l), col, uSaturation);
      col = (col - 0.5) * uContrast + 0.5;

      vec2 q = (vUv - 0.5) * vec2(min(uAspect, 1.9) / 1.6, 1.0);
      float v = smoothstep(0.32, 0.98, length(q));
      col *= 1.0 - v * uVignette;

      float n = rand(vUv * 913.0 + fract(uTime) * 61.0) - 0.5;
      col += n * uGrain;

      gl_FragColor = vec4(max(col, 0.0), 1.0);
    }`,
};

/** HDR render target with MSAA, bloom and the final grade. Used on medium and high quality. */
export class Post {
  readonly composer: EffectComposer;
  readonly bloom: UnrealBloomPass;
  private readonly final: ShaderPass;
  private readonly target: THREE.WebGLRenderTarget;

  constructor(
    private readonly renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    camera: THREE.Camera,
    samples: number,
  ) {
    const size = renderer.getDrawingBufferSize(new THREE.Vector2());
    this.target = new THREE.WebGLRenderTarget(size.x, size.y, { type: THREE.HalfFloatType, samples });
    this.composer = new EffectComposer(renderer, this.target);
    this.composer.addPass(new RenderPass(scene, camera));
    this.bloom = new UnrealBloomPass(new THREE.Vector2(size.x / 2, size.y / 2), 0.55, 0.7, 0.92);
    this.composer.addPass(this.bloom);
    this.final = new ShaderPass(FinalShader);
    // The pass includes the tone mapping functions itself; keep three.js from injecting them a second time.
    this.final.material.toneMapped = false;
    this.composer.addPass(this.final);
  }

  setSize(w: number, h: number, pixelRatio: number): void {
    this.composer.setPixelRatio(pixelRatio);
    this.composer.setSize(w, h);
    // Bloom at half resolution: the blur hides it and the fill-rate cost drops fourfold.
    this.bloom.setSize(Math.max(2, Math.floor((w * pixelRatio) / 2)), Math.max(2, Math.floor((h * pixelRatio) / 2)));
    (this.final.uniforms.uAspect as THREE.IUniform<number>).value = w / Math.max(1, h);
  }

  render(dt: number, clock: number, night: number, exposure: number): void {
    const u = this.final.uniforms as Record<string, THREE.IUniform<number>>;
    u.uTime!.value = clock;
    u.uNight!.value = night;
    u.toneMappingExposure!.value = exposure;
    const tm = this.renderer.toneMapping;
    // The scene is rendered linear; the final pass tone-maps the whole frame including the bloom.
    this.renderer.toneMapping = THREE.NoToneMapping;
    this.composer.render(dt);
    this.renderer.toneMapping = tm;
  }

  dispose(): void {
    // The composer only frees its own buffers; passes own render targets and materials of their own.
    this.bloom.dispose();
    this.final.dispose();
    this.composer.dispose();
    this.target.dispose();
  }
}
