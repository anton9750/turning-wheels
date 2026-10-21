import * as THREE from 'three';

/** Warm key/rim lights plus two slowly travelling point lights for moving glints. */
export class LightRig {
  readonly group = new THREE.Group();
  private readonly sweepA: THREE.PointLight;
  private readonly sweepB: THREE.PointLight;

  constructor() {
    this.group.add(new THREE.AmbientLight(0x1a1206, 0.4));

    const key = new THREE.DirectionalLight(0xffdc9a, 2.4);
    key.position.set(6, 14, 8);
    const fill = new THREE.DirectionalLight(0xb08030, 0.8);
    fill.position.set(-12, -6, 4);
    const rim = new THREE.DirectionalLight(0xffc35a, 1.6);
    rim.position.set(-4, 6, -14);
    this.group.add(key, fill, rim);

    this.sweepA = new THREE.PointLight(0xffe0a0, 60, 30, 1.6);
    this.sweepB = new THREE.PointLight(0xffb848, 40, 26, 1.8);
    this.group.add(this.sweepA, this.sweepB);
  }

  update(t: number): void {
    this.sweepA.position.set(Math.sin(t * 0.21) * 14, 6 + Math.sin(t * 0.13) * 5, Math.cos(t * 0.17) * 14);
    this.sweepB.position.set(Math.cos(t * 0.15) * 12, -5 + Math.cos(t * 0.19) * 4, Math.sin(t * 0.23) * 12);
  }
}
