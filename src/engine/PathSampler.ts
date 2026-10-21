import * as THREE from 'three';

/**
 * Pre-samples a closed curve at uniform arc-length into flat arrays so that
 * thousands of plates can be positioned every frame without curve math.
 * For each sample stores position, tangent, "up" (wall direction) and side.
 */
export class PathSampler {
  readonly count: number;
  readonly length: number;
  private readonly pos: Float32Array;
  private readonly tan: Float32Array;
  private readonly up: Float32Array;
  private readonly side: Float32Array;

  constructor(curve: THREE.Curve<THREE.Vector3>, count: number, upHint: THREE.Vector3) {
    this.count = count;
    this.length = curve.getLength();
    this.pos = new Float32Array(count * 3);
    this.tan = new Float32Array(count * 3);
    this.up = new Float32Array(count * 3);
    this.side = new Float32Array(count * 3);

    const p = new THREE.Vector3();
    const t = new THREE.Vector3();
    const u = new THREE.Vector3();
    const s = new THREE.Vector3();
    const prevUp = upHint.clone().normalize();

    for (let i = 0; i < count; i++) {
      const a = i / count;
      curve.getPointAt(a, p);
      curve.getTangentAt(a, t).normalize();
      // Keep walls standing "up" relative to the band's plane.
      u.copy(upHint).addScaledVector(t, -upHint.dot(t));
      if (u.lengthSq() < 1e-4) u.copy(prevUp).addScaledVector(t, -prevUp.dot(t));
      u.normalize();
      s.crossVectors(t, u).normalize();
      prevUp.copy(u);
      p.toArray(this.pos, i * 3);
      t.toArray(this.tan, i * 3);
      u.toArray(this.up, i * 3);
      s.toArray(this.side, i * 3);
    }
  }

  /** Sample at normalized arc length u (wraps). Results written into `out` (12 floats: P,T,U,S). */
  sample(u: number, out: Float32Array): void {
    const n = this.count;
    const f = (((u % 1) + 1) % 1) * n;
    const i0 = Math.floor(f) % n;
    const i1 = (i0 + 1) % n;
    const k = f - Math.floor(f);
    const a = i0 * 3;
    const b = i1 * 3;
    const lerp3 = (src: Float32Array, o: number, normalize: boolean) => {
      let x = src[a] + (src[b] - src[a]) * k;
      let y = src[a + 1] + (src[b + 1] - src[a + 1]) * k;
      let z = src[a + 2] + (src[b + 2] - src[a + 2]) * k;
      if (normalize) {
        const l = Math.hypot(x, y, z) || 1;
        x /= l;
        y /= l;
        z /= l;
      }
      out[o] = x;
      out[o + 1] = y;
      out[o + 2] = z;
    };
    lerp3(this.pos, 0, false);
    lerp3(this.tan, 3, true);
    lerp3(this.up, 6, true);
    lerp3(this.side, 9, true);
  }
}
