import * as THREE from 'three';
import { STRUCTURAL_KEYS, type SceneSettings } from '../config/sceneConfig';
import { CameraRig } from './CameraRig';
import { createStudioEnvironment } from './environment';
import { LightRig } from './LightRig';
import { createGoldMaterial, createPlateGeometry } from './materials';
import { generateBands } from './pathFactory';
import { PostFX } from './PostFX';
import { QualityManager } from './QualityManager';
import { RibbonBand } from './RibbonBand';

export interface EngineCallbacks {
  onFps?: (fps: number) => void;
  onReady?: () => void;
}

/** Owns the renderer, scene and render loop. Framework-agnostic. */
export class GoldEngine {
  private readonly container: HTMLElement;
  private readonly callbacks: EngineCallbacks;
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly camera: THREE.PerspectiveCamera;
  private readonly world = new THREE.Group();
  private readonly rig: CameraRig;
  private readonly lights = new LightRig();
  private readonly post: PostFX;
  private readonly quality: QualityManager;
  private readonly envMap: THREE.Texture;
  private readonly material = createGoldMaterial();
  private readonly plateGeometry = createPlateGeometry();
  private readonly resizeObserver: ResizeObserver;
  private readonly clock = new THREE.Clock();
  private bands: RibbonBand[] = [];
  private settings: SceneSettings;
  private time = 0;
  private raf = 0;
  private ready = false;

  constructor(container: HTMLElement, settings: SceneSettings, callbacks: EngineCallbacks = {}) {
    this.container = container;
    this.callbacks = callbacks;
    this.settings = { ...settings };

    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = settings.exposure;
    container.appendChild(this.renderer.domElement);

    const w = Math.max(1, container.clientWidth);
    const h = Math.max(1, container.clientHeight);
    this.camera = new THREE.PerspectiveCamera(38, w / h, 0.1, 200);
    this.rig = new CameraRig(this.camera);

    this.scene.background = new THREE.Color(0x000000);
    this.scene.fog = new THREE.FogExp2(0x000000, 0.02);
    this.envMap = createStudioEnvironment(this.renderer);
    this.scene.environment = this.envMap;
    this.scene.add(this.world, this.lights.group);

    this.post = new PostFX(this.renderer, this.scene, this.camera, w, h);
    const maxRatio = Math.min(window.devicePixelRatio || 1, 2);
    this.quality = new QualityManager(maxRatio, () => this.resize(), callbacks.onFps);

    this.buildBands();
    this.resize();

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(container);
    window.addEventListener('pointermove', this.onPointer);
    this.loop();
  }

  setSettings(next: SceneSettings): void {
    const rebuild = STRUCTURAL_KEYS.some((k) => next[k] !== this.settings[k]);
    this.settings = { ...next };
    this.renderer.toneMappingExposure = next.exposure;
    if (rebuild) this.buildBands();
  }

  /** Renders a fresh frame and returns it as a PNG data URL. */
  screenshot(): string {
    this.post.render();
    return this.renderer.domElement.toDataURL('image/png');
  }

  dispose(): void {
    cancelAnimationFrame(this.raf);
    this.resizeObserver.disconnect();
    window.removeEventListener('pointermove', this.onPointer);
    this.bands.forEach((b) => b.dispose());
    this.plateGeometry.dispose();
    this.material.dispose();
    this.envMap.dispose();
    this.post.dispose();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }

  private buildBands(): void {
    this.bands.forEach((b) => {
      this.world.remove(b.mesh);
      b.dispose();
    });
    const { seed, bandCount, density } = this.settings;
    this.bands = generateBands(seed, bandCount, density).map(
      (spec, i) => new RibbonBand(spec, this.plateGeometry, this.material, seed * 97 + i),
    );
    this.bands.forEach((b) => this.world.add(b.mesh));
  }

  private resize(): void {
    const w = Math.max(1, this.container.clientWidth);
    const h = Math.max(1, this.container.clientHeight);
    const ratio = this.quality.pixelRatio;
    this.renderer.setPixelRatio(ratio);
    this.renderer.setSize(w, h, false);
    this.post.setSize(w, h, ratio);
    this.camera.aspect = w / h;
    // Keep framing on portrait screens by widening the FOV.
    this.camera.fov = w / h < 1 ? 55 : 38;
    this.camera.updateProjectionMatrix();
  }

  private onPointer = (e: PointerEvent): void => {
    this.rig.setPointer((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1);
  };

  private loop = (): void => {
    this.raf = requestAnimationFrame(this.loop);
    const realDt = Math.min(this.clock.getDelta(), 0.1);
    const s = this.settings;
    const dt = s.paused ? 0 : realDt * s.timeScale;
    this.time += dt;

    if (dt > 0 || !this.ready) {
      for (const b of this.bands) b.update(dt, this.time, s);
      this.lights.update(this.time);
    }
    this.rig.update(realDt, dt, s);
    this.post.update(s, this.time, this.rig.focusDistance);
    this.post.render();
    this.quality.tick(realDt);

    if (!this.ready) {
      this.ready = true;
      this.callbacks.onReady?.();
    }
  };
}
