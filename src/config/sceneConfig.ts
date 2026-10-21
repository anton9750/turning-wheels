export interface SceneSettings {
  /** Seed for the deterministic layout of the bands. */
  seed: number;
  /** Number of winding gold walls. */
  bandCount: number;
  /** Plate density multiplier (higher = more, thinner-spaced plates). */
  density: number;

  /** Global animation speed. */
  timeScale: number;
  /** How fast plates travel along their track (world units / second). */
  flowSpeed: number;
  /** Strength of the domino-like ripple that travels through the plates. */
  rippleAmount: number;
  /** How much the walls lean / twist along their path. */
  twistAmount: number;
  /** Camera drift speed. */
  cameraSpeed: number;
  /** Mouse parallax strength. */
  parallax: number;

  exposure: number;
  /** 0 = raw render, 1 = full black → gold → cream duotone grade. */
  warmth: number;
  contrast: number;
  blur: number;
  bloom: number;
  grain: number;
  vignette: number;

  paused: boolean;
}

export const DEFAULT_SETTINGS: SceneSettings = {
  seed: 1337,
  bandCount: 26,
  density: 1,
  timeScale: 1,
  flowSpeed: 0.6,
  rippleAmount: 1,
  twistAmount: 1,
  cameraSpeed: 1,
  parallax: 0.6,
  exposure: 1.05,
  warmth: 0.9,
  contrast: 1.18,
  blur: 0.45,
  bloom: 0.35,
  grain: 0.035,
  vignette: 0.7,
  paused: false,
};

/** Changing any of these requires regenerating geometry. */
export const STRUCTURAL_KEYS = ['seed', 'bandCount', 'density'] as const;

export type NumericKey = {
  [K in keyof SceneSettings]: SceneSettings[K] extends number ? K : never;
}[keyof SceneSettings];

export interface SliderMeta {
  key: NumericKey;
  label: string;
  min: number;
  max: number;
  step: number;
}

export interface SliderGroup {
  title: string;
  sliders: SliderMeta[];
}

export const SLIDER_GROUPS: SliderGroup[] = [
  {
    title: 'Motion',
    sliders: [
      { key: 'timeScale', label: 'Speed', min: 0, max: 3, step: 0.01 },
      { key: 'flowSpeed', label: 'Flow', min: 0, max: 3, step: 0.01 },
      { key: 'rippleAmount', label: 'Ripple', min: 0, max: 2.5, step: 0.01 },
      { key: 'twistAmount', label: 'Twist', min: 0, max: 2, step: 0.01 },
      { key: 'cameraSpeed', label: 'Camera drift', min: 0, max: 3, step: 0.01 },
      { key: 'parallax', label: 'Mouse parallax', min: 0, max: 2, step: 0.01 },
    ],
  },
  {
    title: 'Look',
    sliders: [
      { key: 'exposure', label: 'Exposure', min: 0.3, max: 2.5, step: 0.01 },
      { key: 'warmth', label: 'Gold grade', min: 0, max: 1, step: 0.01 },
      { key: 'contrast', label: 'Contrast', min: 0.6, max: 1.8, step: 0.01 },
      { key: 'blur', label: 'Depth of field', min: 0, max: 1.5, step: 0.01 },
      { key: 'bloom', label: 'Bloom', min: 0, max: 1.5, step: 0.01 },
      { key: 'grain', label: 'Film grain', min: 0, max: 0.15, step: 0.001 },
      { key: 'vignette', label: 'Vignette', min: 0, max: 1, step: 0.01 },
    ],
  },
  {
    title: 'Scene',
    sliders: [
      { key: 'bandCount', label: 'Walls', min: 4, max: 48, step: 1 },
      { key: 'density', label: 'Plate density', min: 0.4, max: 1.8, step: 0.01 },
    ],
  },
];

export const PRESETS: Record<string, Partial<SceneSettings>> = {
  Reference: { ...DEFAULT_SETTINGS },
  Calm: { timeScale: 0.45, flowSpeed: 0.3, rippleAmount: 0.5, twistAmount: 0.7, cameraSpeed: 0.5, blur: 0.6 },
  Molten: { timeScale: 1.4, flowSpeed: 1.6, rippleAmount: 2, twistAmount: 1.5, exposure: 1.35, bloom: 0.8, contrast: 1.3 },
  Still: { timeScale: 1, flowSpeed: 0, rippleAmount: 0, twistAmount: 1, cameraSpeed: 0.25 },
};

/** Merge untrusted stored data over defaults, keeping only known keys of the right type. */
export function sanitizeSettings(raw: unknown): SceneSettings {
  const out: SceneSettings = { ...DEFAULT_SETTINGS };
  if (raw && typeof raw === 'object') {
    const rec = raw as Record<string, unknown>;
    (Object.keys(DEFAULT_SETTINGS) as (keyof SceneSettings)[]).forEach((k) => {
      const v = rec[k];
      if (typeof v === typeof DEFAULT_SETTINGS[k] && (typeof v !== 'number' || Number.isFinite(v))) {
        (out as unknown as Record<string, unknown>)[k] = v;
      }
    });
  }
  return out;
}
