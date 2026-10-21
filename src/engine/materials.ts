import * as THREE from 'three';

/** Polished metal; per-instance colour supplies the gold tint. */
export function createGoldMaterial(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 1,
    roughness: 0.3,
    envMapIntensity: 1.25,
  });
}

/** Unit plate; scaled per instance via the instance matrix. */
export function createPlateGeometry(): THREE.BoxGeometry {
  return new THREE.BoxGeometry(1, 1, 1);
}
