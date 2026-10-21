import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import type { SceneSettings } from '../config/sceneConfig';
import { GradeShader } from './shaders/GradeShader';

type Uniforms = Record<string, { value: number }>;

/** Render → depth of field → bloom → tone map/sRGB → gold grade. */
export class PostFX {
  readonly composer: EffectComposer;
  private readonly bokeh: BokehPass;
  private readonly bloom: UnrealBloomPass;
  private readonly grade: ShaderPass;

  constructor(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.PerspectiveCamera, w: number, h: number) {
    this.composer = new EffectComposer(renderer);
    this.composer.addPass(new RenderPass(scene, camera));
    this.bokeh = new BokehPass(scene, camera, { focus: 24, aperture: 0.002, maxblur: 0.01 });
    this.composer.addPass(this.bokeh);
    this.bloom = new UnrealBloomPass(new THREE.Vector2(w, h), 0.35, 0.6, 0.8);
    this.composer.addPass(this.bloom);
    this.composer.addPass(new OutputPass());
    this.grade = new ShaderPass(GradeShader);
    this.composer.addPass(this.grade);
  }

  setSize(w: number, h: number, pixelRatio: number): void {
    this.composer.setPixelRatio(pixelRatio);
    this.composer.setSize(w, h);
  }

  update(s: SceneSettings, time: number, focus: number): void {
    const bu = this.bokeh.uniforms as unknown as Uniforms;
    bu.focus.value = focus;
    bu.aperture.value = s.blur * 0.004;
    bu.maxblur.value = s.blur * 0.012;
    this.bokeh.enabled = s.blur > 0.001;

    this.bloom.strength = s.bloom;
    this.bloom.enabled = s.bloom > 0.001;

    const gu = this.grade.uniforms as unknown as Uniforms;
    gu.uTime.value = time;
    gu.uWarmth.value = s.warmth;
    gu.uContrast.value = s.contrast;
    gu.uVignette.value = s.vignette;
    gu.uGrain.value = s.grain;
  }

  render(): void {
    this.composer.render();
  }

  dispose(): void {
    this.bokeh.dispose();
    this.bloom.dispose();
    this.grade.dispose();
    this.composer.dispose();
  }
}
