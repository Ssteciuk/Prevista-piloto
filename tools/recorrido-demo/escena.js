// Departamento de ejemplo para el recorrido de demo. No es un proyecto real: sirve para que la landing tenga
// vídeo desde el primer día y para probar el scrub antes de recibir el render del arquitecto.
//
// Unidades en metros. Y hacia arriba, -Z hacia el frente (balcón y vista abierta).
// Planta: living-comedor y cocina integrados (x -6..2), dormitorio (x 2..6), balcón corrido (z -6..-4).
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export const FPS = 24;

// Paradas del recorrido, en orden. Cada tramo va de una parada a la siguiente; el último sigue en el balcón.
export const paradas = ['acceso', 'cocina', 'living', 'dormitorio', 'balcon'];

// Cada tramo: duración en segundos, puntos de cámara y puntos a los que mira. Los extremos de un tramo coinciden
// con los del siguiente, así el último fotograma de un clip es el primero del otro.
const P = (x, y, z) => new THREE.Vector3(x, y, z);
const tramos = [
  {
    seg: 5,
    pos: [P(-1, 1.6, 3.4), P(-1.6, 1.6, 2.2), P(-2.2, 1.6, 0.9)],
    mira: [P(-1, 1.35, -4), P(-3.5, 1.2, -1), P(-5.6, 1.05, 2)],
  },
  {
    seg: 5,
    pos: [P(-2.2, 1.6, 0.9), P(-1.8, 1.58, -0.2), P(-1.1, 1.5, -1.1)],
    mira: [P(-5.6, 1.05, 2), P(-5.5, 1.1, -1.5), P(-4.2, 1.05, -4.4)],
  },
  {
    seg: 5,
    pos: [P(-1.1, 1.5, -1.1), P(0.6, 1.55, -1.0), P(2.2, 1.55, -0.95), P(3.2, 1.55, -0.9)],
    mira: [P(-4.2, 1.05, -4.4), P(1.5, 1.3, -4), P(5.5, 1.0, -1.5), P(5.4, 0.7, -2.2)],
  },
  {
    seg: 5,
    pos: [P(3.2, 1.55, -0.9), P(3.15, 1.6, -2.6), P(3.1, 1.6, -4.4), P(2.9, 1.6, -5.0)],
    mira: [P(5.4, 0.7, -2.2), P(3.1, 1.45, -8), P(0, 1.2, -14), P(-4, 1.0, -16)],
  },
  {
    seg: 6,
    pos: [P(2.9, 1.6, -5.0), P(2.2, 1.6, -5.35), P(1.2, 1.62, -5.55)],
    mira: [P(-4, 1.0, -16), P(-7, 0.8, -18), P(-10, 0.6, -20)],
  },
];

export const tiempos = tramos.reduce((acc, t) => [...acc, acc[acc.length - 1] + t.seg], [0]);
export const totalFrames = Math.round(tiempos[tiempos.length - 1] * FPS);

const curvas = tramos.map((t) => ({
  seg: t.seg,
  pos: new THREE.CatmullRomCurve3(t.pos, false, 'centripetal'),
  mira: new THREE.CatmullRomCurve3(t.mira, false, 'centripetal'),
}));

// Arranca y frena suave en cada parada: ahí es donde el visitante se detiene a leer.
const ease = (t) => t * t * t * (t * (t * 6 - 15) + 10);

export function crearEscena(canvas, ancho, alto) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1);
  renderer.setSize(ancho, alto, false);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.55;
  scene.fog = new THREE.Fog(0xe9d6c0, 30, 140);

  const camera = new THREE.PerspectiveCamera(62, ancho / alto, 0.05, 400);

  const mat = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.85, ...extra });
  const m = {
    pared: mat(0xf1ece4),
    techo: mat(0xf7f4ef),
    piso: mat(0xb48a62, { roughness: 0.55 }),
    pisoExt: mat(0x9c9a95, { roughness: 0.9 }),
    marco: mat(0x2b2a28, { roughness: 0.4, metalness: 0.6 }),
    vidrio: new THREE.MeshPhysicalMaterial({
      color: 0xdfeaf0,
      roughness: 0.05,
      transmission: 0,
      transparent: true,
      opacity: 0.12,
      depthWrite: false,
    }),
    tela: mat(0x8a8f86),
    telaClara: mat(0xd9d2c5),
    madera: mat(0x7a5638, { roughness: 0.6 }),
    maderaClara: mat(0xc9a77f, { roughness: 0.6 }),
    mesada: mat(0xe7e3dc, { roughness: 0.25 }),
    mueble: mat(0x3b3a37, { roughness: 0.5 }),
    planta: mat(0x4f6b45),
    maceta: mat(0xb9714a),
    alfombra: mat(0xcfc3ae, { roughness: 1 }),
  };

  const caja = (w, h, d, material, x, y, z, { sombra = true } = {}) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
    mesh.position.set(x, y, z);
    mesh.castShadow = sombra;
    mesh.receiveShadow = true;
    scene.add(mesh);
    return mesh;
  };
  // Caja dada por sus límites, más fácil de leer en planta.
  const bloque = (x0, x1, y0, y1, z0, z1, material, opts) =>
    caja(x1 - x0, y1 - y0, z1 - z0, material, (x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2, opts);

  const H = 2.7;
  const e = 0.12;

  // Losa, techo y balcón.
  bloque(-6, 6, -0.1, 0, -4, 4, m.piso, { sombra: false });
  bloque(-6, 6, H, H + 0.25, -4, 4, m.techo, { sombra: false });
  bloque(-6.4, 6.4, -0.2, -0.02, -6.2, -4, m.pisoExt, { sombra: false });
  bloque(-6.4, 6.4, H, H + 0.25, -6.2, -4, m.techo, { sombra: false });

  // Muros perimetrales (el frente z = -4 es todo vidrio).
  bloque(-6 - e, -6, 0, H, -6.2, 4, m.pared);
  bloque(6, 6 + e, 0, H, -6.2, 4, m.pared);
  bloque(-6, 6, 0, H, 4, 4 + e, m.pared);
  // Puerta de acceso, detrás de la cámara al empezar.
  bloque(-1.5, -0.5, 0, 2.1, 3.95, 4.05, m.madera);

  // Tabique del dormitorio con hueco de puerta entre z -1.5 y -0.3, y el baño/vestidor cerrado detrás.
  bloque(2, 2 + e, 0, H, -4, -1.5, m.pared);
  bloque(2, 2 + e, 0, H, -0.3, 4, m.pared);
  bloque(2, 2 + e, 2.1, H, -1.5, -0.3, m.pared);
  bloque(2, 6, 0, H, 0.5, 0.5 + e, m.pared);

  // Fachada vidriada con carpintería. En el dormitorio queda una hoja abierta (x 2.5..3.7) para salir al balcón.
  const fachada = (x0, x1) => {
    bloque(x0, x1, 0, H, -4.03, -3.98, m.vidrio, { sombra: false });
    for (let x = x0; x <= x1 + 0.01; x += (x1 - x0) / Math.max(1, Math.round((x1 - x0) / 1.6))) {
      bloque(x - 0.03, x + 0.03, 0, H, -4.05, -3.96, m.marco);
    }
    bloque(x0, x1, 0, 0.05, -4.05, -3.96, m.marco);
    bloque(x0, x1, H - 0.06, H, -4.05, -3.96, m.marco);
  };
  fachada(-6, 2);
  fachada(3.7, 6);
  bloque(2, 2.5, 0, H, -4.05, -3.96, m.marco);

  // Baranda de vidrio del balcón.
  bloque(-6.4, 6.4, 0, 1.05, -6.22, -6.17, m.vidrio, { sombra: false });
  bloque(-6.4, 6.4, 1.03, 1.08, -6.24, -6.15, m.marco);

  // Cocina: mesada contra el muro oeste, alacenas y una isla.
  bloque(-6, -5.35, 0, 0.88, -0.2, 3.6, m.mueble);
  bloque(-6, -5.3, 0.88, 0.92, -0.2, 3.6, m.mesada);
  bloque(-6, -5.6, 1.5, 2.3, -0.2, 3.6, m.maderaClara);
  bloque(-4.1, -3.1, 0, 0.9, 0.6, 2.8, m.maderaClara);
  bloque(-4.15, -3.05, 0.9, 0.94, 0.55, 2.85, m.mesada);
  for (const z of [1.0, 1.7, 2.4]) {
    bloque(-2.95, -2.6, 0, 0.72, z - 0.17, z + 0.17, m.mueble);
  }
  // Colgantes sobre la isla.
  for (const z of [1.1, 2.3]) {
    const luz = new THREE.Mesh(new THREE.SphereGeometry(0.13, 24, 16), new THREE.MeshStandardMaterial({ color: 0xfff1d6, emissive: 0xffd9a0, emissiveIntensity: 2.2 }));
    luz.position.set(-3.6, 1.95, z);
    scene.add(luz);
    bloque(-3.605, -3.595, 2.08, H, z - 0.005, z + 0.005, m.marco, { sombra: false });
    const p = new THREE.PointLight(0xffd9a0, 1.6, 4, 2);
    p.position.set(-3.6, 1.85, z);
    scene.add(p);
  }

  // Living: alfombra, sillón en L, mesa ratona, mueble bajo, planta.
  bloque(-5.4, -2.2, 0, 0.012, -3.7, -1.0, m.alfombra, { sombra: false });
  bloque(-5.2, -2.6, 0, 0.42, -1.6, -0.75, m.tela);
  bloque(-5.2, -2.6, 0.42, 0.85, -0.95, -0.75, m.tela);
  bloque(-5.2, -4.4, 0, 0.42, -3.0, -1.6, m.tela);
  bloque(-5.2, -5.0, 0.42, 0.85, -3.0, -0.75, m.tela);
  for (const x of [-4.9, -4.2, -3.5]) bloque(x - 0.3, x + 0.3, 0.42, 0.56, -1.55, -1.0, m.telaClara);
  bloque(-3.9, -2.9, 0, 0.36, -2.8, -2.0, m.madera);
  const planta = (x, z, s = 1) => {
    const maceta = new THREE.Mesh(new THREE.CylinderGeometry(0.22 * s, 0.17 * s, 0.45 * s, 24), m.maceta);
    maceta.position.set(x, 0.225 * s, z);
    maceta.castShadow = true;
    scene.add(maceta);
    for (let i = 0; i < 5; i++) {
      const hoja = new THREE.Mesh(new THREE.SphereGeometry(0.28 * s, 16, 12), m.planta);
      hoja.position.set(x + Math.sin(i * 2.4) * 0.18 * s, (0.75 + i * 0.22) * s, z + Math.cos(i * 2.4) * 0.18 * s);
      hoja.castShadow = true;
      scene.add(hoja);
    }
  };
  planta(-5.6, -3.6, 1.2);
  planta(1.5, -3.55);
  planta(-5.5, 3.7, 0.9);

  // Comedor.
  bloque(-0.2, 1.6, 0.72, 0.76, 1.0, 2.6, m.madera);
  for (const [x, z] of [[0.1, 1.05], [1.3, 1.05], [0.1, 2.55], [1.3, 2.55]]) bloque(x - 0.03, x + 0.03, 0, 0.72, z - 0.03, z + 0.03, m.marco);
  for (const [x, z] of [[0.2, 0.7], [1.2, 0.7], [0.2, 2.9], [1.2, 2.9]]) {
    bloque(x - 0.22, x + 0.22, 0.44, 0.48, z - 0.22, z + 0.22, m.maderaClara);
    bloque(x - 0.22, x + 0.22, 0, 0.44, z - 0.02, z + 0.02, m.marco);
  }

  // Dormitorio: cama con respaldo contra el muro este, mesas de luz, alfombra.
  bloque(3.6, 5.95, 0, 0.012, -3.3, -0.4, m.alfombra, { sombra: false });
  bloque(4.0, 5.95, 0, 0.5, -2.9, -1.0, m.madera);
  bloque(4.05, 5.9, 0.5, 0.62, -2.85, -1.05, m.telaClara);
  bloque(4.0, 5.0, 0.6, 0.68, -2.85, -1.05, m.tela);
  bloque(5.85, 5.95, 0.5, 1.4, -3.0, -0.9, m.maderaClara);
  for (const z of [-3.35, -0.55]) bloque(5.45, 5.95, 0, 0.5, z - 0.25, z + 0.25, m.madera);
  for (const z of [-2.4, -1.5]) bloque(5.3, 5.75, 0.62, 0.78, z - 0.32, z + 0.32, m.telaClara);

  // Balcón: dos sillas y una mesita.
  bloque(-1.2, -0.7, 0, 0.45, -5.9, -5.4, m.maderaClara);
  bloque(-0.4, 0.1, 0, 0.45, -5.9, -5.4, m.maderaClara);
  bloque(-0.6, -0.3, 0, 0.55, -5.4, -5.1, m.marco);
  planta(5.8, -5.6, 1.1);

  // Ciudad: torres hacia el horizonte, por debajo y alrededor del piso 9.
  const rng = (() => {
    let s = 7;
    return () => ((s = (s * 16807) % 2147483647) / 2147483647);
  })();
  const fachadas = [0xd8c9b6, 0xcbbfae, 0xbfb6a8, 0xe2d5c3, 0xa9a39a];
  // Las cercanas quedan por debajo del balcón para que se vea por encima; las lejanas dibujan el horizonte.
  for (let i = 0; i < 320; i++) {
    const x = (rng() - 0.5) * 320;
    const z = -24 - rng() * 190;
    const w = 6 + rng() * 14;
    const h = 6 + rng() * (z < -110 ? 52 : z < -60 ? 30 : 20);
    bloque(x - w / 2, x + w / 2, -30, -30 + h, z - w / 2, z + w / 2, mat(fachadas[i % fachadas.length]), { sombra: false });
  }
  bloque(-300, 300, -30.5, -30, -320, -6.5, mat(0x9a9b8d), { sombra: false });

  // Cielo de atardecer: degradé vertical en una esfera.
  const cielo = new THREE.Mesh(
    new THREE.SphereGeometry(300, 32, 16),
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
      uniforms: {},
      vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader:
        'varying vec3 vP; void main(){ float h = clamp(vP.y * 2.2 + 0.08, 0.0, 1.0); vec3 hor = vec3(0.98, 0.83, 0.66); vec3 alto = vec3(0.55, 0.70, 0.86); gl_FragColor = vec4(mix(hor, alto, smoothstep(0.0, 1.0, h)), 1.0); }',
    }),
  );
  scene.add(cielo);

  // Sol bajo entrando por el ventanal, más luz de cielo.
  const sol = new THREE.DirectionalLight(0xffe2bf, 3.2);
  sol.position.set(-14, 9, -18);
  sol.target.position.set(0, 0, 0);
  sol.castShadow = true;
  sol.shadow.mapSize.set(2048, 2048);
  sol.shadow.camera.left = -10;
  sol.shadow.camera.right = 10;
  sol.shadow.camera.top = 10;
  sol.shadow.camera.bottom = -10;
  sol.shadow.camera.far = 60;
  sol.shadow.bias = -0.0004;
  sol.shadow.normalBias = 0.02;
  scene.add(sol, sol.target);
  scene.add(new THREE.HemisphereLight(0xdde8f2, 0x8a7560, 0.6));

  // Pone la cámara en el segundo `t` del recorrido completo.
  const ubicar = (t) => {
    let i = tiempos.findIndex((fin, k) => k > 0 && t <= fin) - 1;
    if (i < 0) i = curvas.length - 1;
    const local = ease(Math.min(1, Math.max(0, (t - tiempos[i]) / curvas[i].seg)));
    camera.position.copy(curvas[i].pos.getPoint(local));
    camera.lookAt(curvas[i].mira.getPoint(local));
  };

  return {
    frame(n) {
      ubicar(n / FPS);
      renderer.render(scene, camera);
    },
  };
}
