import * as THREE from 'three';
import type { SceneSettings } from '../config/sceneConfig';

/**
 * Slow, cinematic drift: a wandering orbit around the tangle that keeps the
 * view mostly level (walls read vertical, like the reference), with soft
 * mouse parallax and a hint of roll.
 */
export class CameraRig {
  private readonly camera: THREE.PerspectiveCamera;
  private readonly target = new THREE.Vector3();
  private readonly pointer = new THREE.Vector2();
  private readonly smoothPointer = new THREE.Vector2();
  private readonly right = new THREE.Vector3();
  private readonly up = new THREE.Vector3();
  private phase = 0;

  constructor(camera: THREE.PerspectiveCamera) {
    this.camera = camera;
  }

  setPointer(x: number, y: number): void {
    this.pointer.set(x, y);
  }

  get focusDistance(): number {
    return this.camera.position.distanceTo(this.target);
  }

  update(realDt: number, dt: number, s: SceneSettings): void {
    this.phase += dt * s.cameraSpeed * 0.05;
    const a = this.phase;

    const radius = 24 + 3 * Math.sin(a * 0.7);
    const angle = a * 0.6;
    const pos = this.camera.position.set(
      Math.cos(angle) * radius,
      2.5 + 4 * Math.sin(a * 0.43),
      Math.sin(angle) * radius,
    );
    this.target.set(Math.sin(a * 0.9) * 3, -1 + 2 * Math.sin(a * 0.5), Math.cos(a * 0.8) * 3);

    this.smoothPointer.lerp(this.pointer, 1 - Math.exp(-realDt * 2.5));
    this.camera.lookAt(this.target);
    this.right.setFromMatrixColumn(this.camera.matrix, 0);
    this.up.setFromMatrixColumn(this.camera.matrix, 1);
    pos.addScaledVector(this.right, this.smoothPointer.x * 2 * s.parallax);
    pos.addScaledVector(this.up, -this.smoothPointer.y * 1.2 * s.parallax);

    this.camera.lookAt(this.target);
    this.camera.rotateZ(Math.sin(a * 0.3) * 0.04);
  }
}
