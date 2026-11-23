import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

/* Real-time 3D brain for the Brain Explorer (2026-11-23, owner picked "asli 3D"). Built in code — no
   downloaded model, so no licence to track: two hemispheres shaped from spheres with ridged-noise folds,
   cerebellum, brainstem, and the deep parts as smooth shapes inside. Drag to turn, pinch/scroll to zoom,
   tap a part to pick it. "X-ray" fades the cortex so the deep parts show. A story plays a glowing signal
   from part to part. Coordinates: x = left/right, y = up, z = front (+) / back (−). */

/* ---------- 3D simplex noise (Gustavson's algorithm, written out compactly) ---------- */
const GRAD = [[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],[1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],[0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]];
function makeNoise(seed = 7) {
  const p = new Uint8Array(256);
  for (let i = 0; i < 256; i++) p[i] = i;
  let s = seed;
  for (let i = 255; i > 0; i--) { s = (s * 16807) % 2147483647; const j = s % (i + 1); const t = p[i]; p[i] = p[j]; p[j] = t; }
  const perm = new Uint8Array(512); for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
  const F3 = 1 / 3, G3 = 1 / 6;
  return (x, y, z) => {
    const s0 = (x + y + z) * F3; const i = Math.floor(x + s0), j = Math.floor(y + s0), k = Math.floor(z + s0);
    const t = (i + j + k) * G3; const x0 = x - i + t, y0 = y - j + t, z0 = z - k + t;
    let i1, j1, k1, i2, j2, k2;
    if (x0 >= y0) { if (y0 >= z0) { i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 1; k2 = 0; } else if (x0 >= z0) { i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 0; k2 = 1; } else { i1 = 0; j1 = 0; k1 = 1; i2 = 1; j2 = 0; k2 = 1; } }
    else if (y0 < z0) { i1 = 0; j1 = 0; k1 = 1; i2 = 0; j2 = 1; k2 = 1; } else if (x0 < z0) { i1 = 0; j1 = 1; k1 = 0; i2 = 0; j2 = 1; k2 = 1; } else { i1 = 0; j1 = 1; k1 = 0; i2 = 1; j2 = 1; k2 = 0; }
    const c = [[x0, y0, z0, 0, 0, 0], [x0 - i1 + G3, y0 - j1 + G3, z0 - k1 + G3, i1, j1, k1], [x0 - i2 + 2 * G3, y0 - j2 + 2 * G3, z0 - k2 + 2 * G3, i2, j2, k2], [x0 - 1 + 3 * G3, y0 - 1 + 3 * G3, z0 - 1 + 3 * G3, 1, 1, 1]];
    let n = 0; const ii = i & 255, jj = j & 255, kk = k & 255;
    for (const [a, b, d, oi, oj, ok] of c) {
      let tt = 0.6 - a * a - b * b - d * d;
      if (tt > 0) { const g = GRAD[perm[ii + oi + perm[jj + oj + perm[kk + ok]]] % 12]; tt *= tt; n += tt * tt * (g[0] * a + g[1] * b + g[2] * d); }
    }
    return 32 * n;
  };
}

const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const FLESH = new THREE.Color("#f1cfc4");

/* which lobe a point on the cortex belongs to (local hemisphere coords, before folds) */
function lobeAt(x, y, z, lateral) {
  if (y < -0.08 && z > -0.5 && z < 0.42 && lateral > 0.45) return "temporal";
  if (z > 0.5) return "prefrontal";
  if (z > 0.08) return "frontal";
  if (z < -0.55) return "occipital";
  return "parietal";
}

function buildHemisphere(side, noise) {
  const geo = new THREE.SphereGeometry(1, 260, 180);
  const pos = geo.attributes.position;
  const lobes = new Array(pos.count);
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const nx = v.x, ny = v.y, nz = v.z;
    const lateral = side * nx; // +1 outer side, −1 the flat inner face
    let x = nx * 0.66, y = ny * 0.64, z = nz;
    if (ny < 0) y *= 0.72; // flatter base
    x *= 1 - 0.16 * Math.max(0, nz) ** 2; // narrower at the front
    y += 0.06 * Math.max(0, -nz) * smooth(-0.2, 0.6, ny); // fuller back-top
    // temporal lobe: a rounded bulge down the side, front-middle
    const tem = smooth(0.25, 0.85, lateral) * smooth(0.1, -0.55, ny) * Math.exp(-(((nz - 0.05) / 0.48) ** 2));
    y -= 0.2 * tem; x += side * 0.05 * tem;
    // frontal pole sits a little lower than the back of the brain
    y -= 0.05 * smooth(0.4, 1, nz);
    // flat inner face, leaving the longitudinal fissure between the halves
    if (lateral < 0) x *= 0.47 + 0.53 * (1 + lateral) ** 1.6;
    const lobe = lobeAt(x, y, z, lateral);
    lobes[i] = lobe;
    // folds: broad rounded gyri with narrow sulci between them — |noise| is ~0 along winding lines, which become
    // the grooves; a second noise warps the lines so they meander like real folds
    const k = 2.5;
    const wx = noise(nx * 1.3 + 4, ny * 1.3, nz * 1.3) * 0.55, wy = noise(nx * 1.3, ny * 1.3 + 9, nz * 1.3) * 0.55;
    const g = Math.abs(noise((nx + wx) * k + side * 9, (ny + wy) * k, nz * k * 1.25));
    let d = 0.046 * smooth(0.0, 0.3, g) - 0.012;
    d *= 0.45 + 0.55 * smooth(-0.9, -0.3, lateral);
    const len = Math.hypot(x, y, z) || 1;
    x += (x / len) * d; y += (y / len) * d; z += (z / len) * d;
    pos.setXYZ(i, x + side * 0.33, y + 0.1, z);
  }
  geo.computeVertexNormals();
  geo.setAttribute("color", new THREE.BufferAttribute(new Float32Array(pos.count * 3), 3));
  return { geo, lobes };
}

function buildCerebellum(noise) {
  const geo = new THREE.SphereGeometry(1, 120, 90);
  const pos = geo.attributes.position; const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    let x = v.x * 0.56, y = v.y * 0.27, z = v.z * 0.36;
    x *= 1 - 0.12 * Math.exp(-((v.x / 0.12) ** 2)) * smooth(-0.2, 0.8, v.y); // two lobes with a soft middle dip
    const d = 0.016 * (0.5 + 0.5 * Math.sin(v.y * 34 + noise(v.x * 3, v.y * 3, v.z * 3) * 2.5));
    const len = Math.hypot(x, y, z) || 1;
    pos.setXYZ(i, x + (x / len) * d, y + (y / len) * d - 0.5, z + (z / len) * d - 0.66);
  }
  geo.computeVertexNormals();
  return geo;
}

function buildStem() {
  const pts = [[0.0, 0.0], [0.13, 0.0], [0.15, -0.12], [0.19, -0.27], [0.17, -0.38], [0.13, -0.52], [0.115, -0.75], [0.0, -0.75]].map(([r, y]) => new THREE.Vector2(r, y));
  const geo = new THREE.LatheGeometry(pts, 48);
  geo.scale(1, 1, 0.85);
  geo.rotateX(-0.28);
  geo.translate(0, -0.2, -0.22);
  return geo;
}

const tube = (pts, r, seg = 60) => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p))), seg, r, 16, false);
const blob = (r) => new THREE.SphereGeometry(1, 40, 28).scale(r[0], r[1], r[2]);

/* the deep parts: each id can have several meshes (left + right) */
function deepParts() {
  const L = [];
  const both = (id, mk, p) => { L.push({ id, geo: mk(), at: [p[0], p[1], p[2]] }); L.push({ id, geo: mk(), at: [-p[0], p[1], p[2]] }); };
  both("thalamus", () => blob([0.1, 0.08, 0.15]), [0.11, 0.06, -0.08]);
  both("basal", () => blob([0.075, 0.12, 0.22]), [0.25, 0.1, 0.1]);
  both("amygdala", () => blob([0.065, 0.06, 0.08]), [0.3, -0.24, 0.16]);
  both("insula", () => blob([0.04, 0.15, 0.24]), [0.5, 0.05, 0.08]);
  for (const s of [1, -1]) {
    L.push({ id: "hippocampus", geo: tube([[0.31 * s, -0.25, 0.08], [0.32 * s, -0.24, -0.08], [0.29 * s, -0.17, -0.26], [0.22 * s, -0.02, -0.38]], 0.045), at: [0, 0, 0] });
    L.push({ id: "cingulate", geo: tube([[0.06 * s, -0.02, 0.5], [0.06 * s, 0.34, 0.42], [0.06 * s, 0.47, 0.05], [0.06 * s, 0.42, -0.33], [0.06 * s, 0.18, -0.52]], 0.045), at: [0, 0, 0] });
  }
  L.push({ id: "callosum", geo: tube([[0, 0.04, 0.38], [0, 0.26, 0.34], [0, 0.34, 0.05], [0, 0.3, -0.28], [0, 0.1, -0.4]], 0.05).scale(2.6, 1, 1), at: [0, 0, 0] });
  L.push({ id: "hypothalamus", geo: blob([0.075, 0.06, 0.08]), at: [0, -0.12, 0.1] });
  L.push({ id: "pituitary", geo: blob([0.045, 0.04, 0.045]), at: [0, -0.3, 0.17] });
  L.push({ id: "pituitary", geo: tube([[0, -0.15, 0.13], [0, -0.27, 0.16]], 0.012, 8), at: [0, 0, 0] });
  return L;
}

// a spot on the surface (or the centre) for each part — the signal travels between these
const SPOT = {
  prefrontal: [0, 0.32, 0.92], frontal: [0.42, 0.62, 0.35], parietal: [0.4, 0.72, -0.35], occipital: [0.3, 0.3, -0.95],
  temporal: [0.66, -0.2, 0.12], insula: [0.5, 0.05, 0.08], cingulate: [0.06, 0.47, 0.05], amygdala: [0.3, -0.24, 0.16],
  hippocampus: [0.3, -0.2, -0.15], hypothalamus: [0, -0.12, 0.1], pituitary: [0, -0.3, 0.17], thalamus: [0.11, 0.06, -0.08],
  basal: [0.25, 0.1, 0.1], callosum: [0, 0.34, 0.05], cerebellum: [0, -0.5, -0.66], brainstem: [0, -0.55, -0.3],
};
const CORTEX = new Set(["prefrontal", "frontal", "parietal", "occipital", "temporal"]);
export const DEEP = new Set(["insula", "cingulate", "amygdala", "hippocampus", "hypothalamus", "pituitary", "thalamus", "basal", "callosum"]);

export default function Brain3D({ colors, selected, hot, cool, dim, xray, onPick, onLabel }) {
  const mount = useRef(null);
  const api = useRef(null);

  // build the scene once
  useEffect(() => {
    const el = mount.current;
    if (!el) return undefined;
    const W = () => el.clientWidth || 600, H = () => el.clientHeight || 460;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(W(), H());
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    el.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, W() / H(), 0.1, 50);
    camera.position.set(3.1, 0.75, 1.1);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; controls.dampingFactor = 0.08; controls.enablePan = false;
    controls.minDistance = 2.1; controls.maxDistance = 6; controls.target.set(0, 0, 0);
    controls.autoRotate = true; controls.autoRotateSpeed = 0.9;

    scene.add(new THREE.HemisphereLight(0xffffff, 0x8a6a60, 1.15));
    const key = new THREE.DirectionalLight(0xffffff, 1.55); key.position.set(3, 4, 3); scene.add(key);
    const rim = new THREE.DirectionalLight(0xbfd8ff, 0.8); rim.position.set(-3, 1.5, -3); scene.add(rim);

    const noise = makeNoise(11);
    const brain = new THREE.Group(); scene.add(brain);
    const cortexMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.58, metalness: 0.02, transparent: true, opacity: 1 });
    const hemis = [1, -1].map((side) => {
      const { geo, lobes } = buildHemisphere(side, noise);
      const m = new THREE.Mesh(geo, cortexMat); m.userData.lobes = lobes; m.userData.cortex = true; brain.add(m);
      return m;
    });
    const mat = (c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.5, metalness: 0.02, emissive: new THREE.Color(c), emissiveIntensity: 0.0, transparent: true });
    const parts = []; // { id, mesh }
    const cb = new THREE.Mesh(buildCerebellum(noise), mat(colors.cerebellum)); cb.userData.id = "cerebellum"; brain.add(cb); parts.push(cb);
    const st = new THREE.Mesh(buildStem(), mat(colors.brainstem)); st.userData.id = "brainstem"; brain.add(st); parts.push(st);
    for (const d of deepParts()) {
      const m = new THREE.Mesh(d.geo, mat(colors[d.id])); m.position.set(...d.at); m.userData.id = d.id; m.userData.deep = true;
      m.renderOrder = 2; brain.add(m); parts.push(m);
    }

    // signal: a small glowing ball that runs along a curve between two parts
    const sig = new THREE.Mesh(new THREE.SphereGeometry(0.035, 16, 12), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    const halo = new THREE.Mesh(new THREE.SphereGeometry(0.075, 16, 12), new THREE.MeshBasicMaterial({ color: 0xffd166, transparent: true, opacity: 0.45, depthWrite: false }));
    sig.add(halo); sig.visible = false; sig.renderOrder = 5; brain.add(sig);

    const state = { selected: null, hot: null, cool: false, dim: false, xray: false, sigCurve: null, sigT: 0 };
    const paintCortex = () => {
      for (const h of hemis) {
        const col = h.geometry.attributes.color; const lobes = h.userData.lobes;
        for (let i = 0; i < lobes.length; i++) {
          const id = lobes[i]; const c = new THREE.Color(colors[id]);
          const on = id === state.selected || id === state.hot;
          const base = FLESH.clone().lerp(c, on ? 0.92 : state.selected || state.hot ? 0.3 : 0.6);
          if (on && state.dim && id === state.hot) base.lerp(new THREE.Color("#c9ced6"), 0.6);
          col.setXYZ(i, base.r, base.g, base.b);
        }
        col.needsUpdate = true;
      }
    };
    const applyLook = () => {
      cortexMat.opacity = state.xray ? 0.16 : 1; cortexMat.depthWrite = !state.xray; cortexMat.needsUpdate = true;
      for (const m of parts) {
        const id = m.userData.id; const on = id === state.selected || id === state.hot;
        m.visible = state.xray || !m.userData.deep; // deep parts only in X-ray
        m.material.opacity = state.xray || !m.userData.deep ? (on || !(state.selected || state.hot) ? 1 : 0.55) : 1;
      }
      paintCortex();
    };
    paintCortex();

    // tap to pick (a short tap, not a drag)
    const ray = new THREE.Raycaster(); const ptr = new THREE.Vector2(); let down = null;
    const pick = (e) => {
      const r = renderer.domElement.getBoundingClientRect();
      ptr.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ptr, camera);
      const targets = state.xray ? [...parts.filter((p) => p.userData.deep), ...parts.filter((p) => !p.userData.deep), ...hemis] : [...hemis, ...parts];
      const hits = ray.intersectObjects(targets, false);
      for (const h of hits) {
        if (h.object.userData.cortex) { if (state.xray) continue; const f = h.face; onPickRef.current?.(h.object.userData.lobes[f.a]); return; }
        if (h.object.userData.id) { onPickRef.current?.(h.object.userData.id); return; }
      }
    };
    const onDown = (e) => { down = { x: e.clientX, y: e.clientY, t: Date.now() }; controls.autoRotate = false; };
    const onUp = (e) => { if (down && Math.hypot(e.clientX - down.x, e.clientY - down.y) < 6 && Date.now() - down.t < 500) pick(e); down = null; };
    renderer.domElement.addEventListener("pointerdown", onDown);
    renderer.domElement.addEventListener("pointerup", onUp);

    const onPickRef = { current: null };
    const labelV = new THREE.Vector3();
    let raf = 0; const clock = new THREE.Clock();
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const t = clock.getElapsedTime();
      controls.update();
      // glow the chosen part
      for (const m of parts) {
        const id = m.userData.id;
        const pulse = id === state.hot ? (state.cool ? 0.25 + 0.2 * Math.sin(t * 2.5) : 0.45 + 0.35 * Math.sin(t * 6)) : id === state.selected ? 0.35 : 0;
        m.material.emissiveIntensity = pulse;
      }
      if (state.sigCurve) {
        state.sigT = Math.min(1, state.sigT + 0.012);
        sig.position.copy(state.sigCurve.getPoint(state.sigT)); sig.visible = state.sigT < 1;
        halo.scale.setScalar(1 + 0.3 * Math.sin(t * 10));
      }
      // label position for the chosen part
      const id = state.hot || state.selected;
      if (id && SPOT[id] && onLabelRef.current) {
        labelV.set(...SPOT[id]).applyMatrix4(brain.matrixWorld).project(camera);
        onLabelRef.current({ x: (labelV.x * 0.5 + 0.5) * W(), y: (-labelV.y * 0.5 + 0.5) * H(), id, behind: labelV.z > 1 });
      }
      renderer.render(scene, camera);
    };
    const onLabelRef = { current: null };
    loop();

    const ro = new ResizeObserver(() => { renderer.setSize(W(), H()); camera.aspect = W() / H(); camera.updateProjectionMatrix(); });
    ro.observe(el);

    api.current = {
      set(next) { Object.assign(state, next); applyLook(); },
      signal(from, to) {
        if (!SPOT[from] || !SPOT[to]) { state.sigCurve = null; sig.visible = false; return; }
        const a = new THREE.Vector3(...SPOT[from]), b = new THREE.Vector3(...SPOT[to]);
        const mid = a.clone().add(b).multiplyScalar(0.5); mid.y += 0.25;
        state.sigCurve = new THREE.QuadraticBezierCurve3(a, mid, b); state.sigT = 0;
      },
      stopSignal() { state.sigCurve = null; sig.visible = false; },
      setHandlers(pickFn, labelFn) { onPickRef.current = pickFn; onLabelRef.current = labelFn; },
      spin(on) { controls.autoRotate = on; },
    };

    return () => {
      cancelAnimationFrame(raf); ro.disconnect(); controls.dispose();
      renderer.domElement.removeEventListener("pointerdown", onDown);
      renderer.domElement.removeEventListener("pointerup", onUp);
      scene.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
      renderer.dispose(); el.removeChild(renderer.domElement); api.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { api.current?.setHandlers(onPick, onLabel); }, [onPick, onLabel]);
  useEffect(() => { api.current?.set({ selected, hot: hot || null, cool: !!cool, dim: !!dim, xray: !!xray }); }, [selected, hot, cool, dim, xray]);

  // a new step in a story: the signal runs from the previous part to this one
  const prevHot = useRef(null);
  useEffect(() => {
    if (hot && prevHot.current && prevHot.current !== hot) api.current?.signal(prevHot.current, hot);
    if (!hot) api.current?.stopSignal();
    prevHot.current = hot || null;
  }, [hot]);

  return <div ref={mount} className="b3-mount" />;
}

export { CORTEX };
