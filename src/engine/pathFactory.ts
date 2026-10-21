import * as THREE from 'three';
import { createRng, range, sign } from './rng';

export interface BandSpec {
  curve: THREE.CatmullRomCurve3;
  upHint: THREE.Vector3;
  /** Wall height (plate height). */
  height: number;
  /** Distance between plates along the track. */
  spacing: number;
  /** Plate length along the track (overlaps neighbours → domino look). */
  plateLength: number;
  thickness: number;
  /** Base yaw of each plate relative to the track — creates the sawtooth. */
  yaw: number;
  twistBase: number;
  twistAmp: number;
  twistFreq: number;
  twistPhase: number;
  twistSpeed: number;
  rippleFreq: number;
  ripplePhase: number;
  flowDir: number;
  tint: number;
}

/**
 * Lays out irregular closed loops in stacked layers — S-bends and kidney
 * shapes like the reference — each slightly tilted so they cross and weave.
 */
export function generateBands(seed: number, count: number, density: number): BandSpec[] {
  const rng = createRng(seed);
  const specs: BandSpec[] = [];
  const TAU = Math.PI * 2;

  for (let i = 0; i < count; i++) {
    const layer = count > 1 ? i / (count - 1) : 0.5;
    const center = new THREE.Vector3(
      range(rng, -11, 11),
      THREE.MathUtils.lerp(-14, 14, layer) + range(rng, -1.2, 1.2),
      range(rng, -11, 11),
    );

    const R = range(rng, 5, 13);
    const K = 6 + Math.floor(rng() * 5);
    const wobble = range(rng, 0.2, 0.5);
    const lift = range(rng, 0.3, 2.2);
    const pts: THREE.Vector3[] = [];
    for (let k = 0; k < K; k++) {
      const a = (k / K) * TAU + range(rng, -0.3, 0.3) * (TAU / K);
      const r = R * (1 + range(rng, -wobble, wobble));
      pts.push(new THREE.Vector3(Math.cos(a) * r, range(rng, -lift, lift), Math.sin(a) * r));
    }

    const q = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(range(rng, -0.28, 0.28), rng() * TAU, range(rng, -0.28, 0.28)),
    );
    pts.forEach((p) => p.applyQuaternion(q).add(center));

    // ~18% of bands lie "flat" — seen as rungs/steps, like the top-right of the reference.
    const flat = rng() < 0.18;
    const spacing = 0.15 / density;

    specs.push({
      curve: new THREE.CatmullRomCurve3(pts, true, 'centripetal', 0.5),
      upHint: new THREE.Vector3(0, 1, 0).applyQuaternion(q),
      height: flat ? range(rng, 0.9, 1.6) : range(rng, 1.1, 2.6),
      spacing,
      plateLength: spacing * 1.75,
      thickness: 0.035,
      yaw: range(rng, 0.38, 0.62) * sign(rng),
      twistBase: flat ? Math.PI / 2 : 0,
      twistAmp: range(rng, 0.25, 1.1),
      twistFreq: 1 + Math.floor(rng() * 3),
      twistPhase: rng() * TAU,
      twistSpeed: range(rng, 0.05, 0.18) * sign(rng),
      rippleFreq: 4 + Math.floor(rng() * 8),
      ripplePhase: rng() * TAU,
      flowDir: sign(rng),
      tint: range(rng, 0.85, 1.05),
    });
  }
  return specs;
}
