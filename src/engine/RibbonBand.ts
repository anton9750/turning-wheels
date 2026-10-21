import * as THREE from 'three';
import type { SceneSettings } from '../config/sceneConfig';
import type { BandSpec } from './pathFactory';
import { PathSampler } from './PathSampler';
import { createRng, range } from './rng';

const BASE_GOLD = new THREE.Color(0xc9a03a);
const TAU = Math.PI * 2;

/**
 * One winding wall: an InstancedMesh of thin plates that flow along a closed
 * track. Each frame the plates' positions, lean (twist) and domino yaw
 * (ripple) are recomputed directly into the instance matrix buffer.
 */
export class RibbonBand {
  readonly mesh: THREE.InstancedMesh;
  private readonly sampler: PathSampler;
  private readonly spec: BandSpec;
  private readonly count: number;
  private readonly scratch = new Float32Array(12);
  private flow = 0;

  constructor(spec: BandSpec, plateGeometry: THREE.BufferGeometry, material: THREE.Material, seed: number) {
    this.spec = spec;
    const len = spec.curve.getLength();
    this.sampler = new PathSampler(spec.curve, Math.max(512, Math.ceil(len * 40)), spec.upHint);
    this.count = Math.max(16, Math.round(len / spec.spacing));

    this.mesh = new THREE.InstancedMesh(plateGeometry, material, this.count);
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.mesh.frustumCulled = false;

    // Slight per-plate brightness variation — each plate catches light differently.
    const rng = createRng(seed);
    const c = new THREE.Color();
    for (let i = 0; i < this.count; i++) {
      c.copy(BASE_GOLD).multiplyScalar(spec.tint * range(rng, 0.8, 1.06));
      this.mesh.setColorAt(i, c);
    }
    if (this.mesh.instanceColor) this.mesh.instanceColor.needsUpdate = true;
    this.update(0, 0, null);
  }

  update(dt: number, time: number, s: SceneSettings | null): void {
    const spec = this.spec;
    const flowSpeed = s?.flowSpeed ?? 0;
    const ripple = s?.rippleAmount ?? 1;
    const twist = s?.twistAmount ?? 1;

    this.flow = (this.flow + (dt * flowSpeed * spec.flowDir) / this.sampler.length) % 1;

    const arr = this.mesh.instanceMatrix.array as Float32Array;
    const o = this.scratch;
    const L = spec.plateLength;
    const H = spec.height;
    const W = spec.thickness;
    const n = this.count;

    for (let i = 0; i < n; i++) {
      const su = i / n + this.flow;
      this.sampler.sample(su, o);
      const tx = o[3], ty = o[4], tz = o[5];
      const ux = o[6], uy = o[7], uz = o[8];
      const sx = o[9], sy = o[10], sz = o[11];

      // Lean of the wall around the track direction.
      const th = spec.twistBase + twist * spec.twistAmp *
        Math.sin(TAU * spec.twistFreq * su + spec.twistPhase + time * spec.twistSpeed);
      const ct = Math.cos(th), st = Math.sin(th);
      const yx = ux * ct + sx * st, yy = uy * ct + sy * st, yz = uz * ct + sz * st; // up'
      const qx = sx * ct - ux * st, qy = sy * ct - uy * st, qz = sz * ct - uz * st; // side'

      // Domino yaw with a ripple travelling along the track.
      const ps = spec.yaw + ripple * 0.35 * Math.sin(TAU * spec.rippleFreq * su - time * 1.4 + spec.ripplePhase);
      const cp = Math.cos(ps), sp = Math.sin(ps);
      const xx = tx * cp + qx * sp, xy = ty * cp + qy * sp, xz = tz * cp + qz * sp;
      // z = x × y
      const zx = xy * yz - xz * yy, zy = xz * yx - xx * yz, zz = xx * yy - xy * yx;

      const k = i * 16;
      arr[k] = xx * L; arr[k + 1] = xy * L; arr[k + 2] = xz * L; arr[k + 3] = 0;
      arr[k + 4] = yx * H; arr[k + 5] = yy * H; arr[k + 6] = yz * H; arr[k + 7] = 0;
      arr[k + 8] = zx * W; arr[k + 9] = zy * W; arr[k + 10] = zz * W; arr[k + 11] = 0;
      arr[k + 12] = o[0]; arr[k + 13] = o[1]; arr[k + 14] = o[2]; arr[k + 15] = 1;
    }
    this.mesh.instanceMatrix.needsUpdate = true;
  }

  dispose(): void {
    this.mesh.dispose();
  }
}
