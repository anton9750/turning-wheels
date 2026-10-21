import * as THREE from 'three';

/**
 * A dark "studio" with a few warm softboxes and strip lights, prefiltered
 * into an environment map. Mostly-black surroundings + bright strips is
 * what gives the metal its high-contrast, selective highlights.
 */
export function createStudioEnvironment(renderer: THREE.WebGLRenderer) {
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = new THREE.Scene();
  env.background = new THREE.Color(0x000000);

  const disposables: { dispose(): void }[] = [];
  const room = new THREE.Mesh(
    new THREE.BoxGeometry(40, 40, 40),
    new THREE.MeshBasicMaterial({ color: 0x060402, side: THREE.BackSide }),
  );
  disposables.push(room.geometry, room.material as THREE.Material);
  env.add(room);

  const panel = (w: number, h: number, pos: [number, number, number], rgb: [number, number, number]) => {
    const geo = new THREE.PlaneGeometry(w, h);
    const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(...rgb), side: THREE.DoubleSide });
    const m = new THREE.Mesh(geo, mat);
    m.position.set(...pos);
    m.lookAt(0, 0, 0);
    env.add(m);
    disposables.push(geo, mat);
  };

  panel(14, 6, [0, 18, 4], [5, 3.8, 1.8]); // big overhead softbox
  panel(3, 20, [-18, 2, -6], [3.5, 2.4, 0.9]); // tall strip left
  panel(2, 16, [17, -2, 8], [2.6, 1.8, 0.7]); // strip right
  panel(20, 1.2, [0, -6, -18], [2.2, 1.4, 0.5]); // low horizon strip
  panel(6, 4, [8, 8, 17], [1.6, 1.2, 0.6]); // front fill

  const texture = pmrem.fromScene(env, 0.035).texture;
  disposables.forEach((d) => d.dispose());
  pmrem.dispose();
  return texture;
}
