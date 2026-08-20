import * as THREE from "three";

/* ═══════════════════════════════════════════════════════════════
   Shared point-cloud kit.
   One shader, three morph targets, a soft-dot sprite and a
   four-point-star sprite. Used by the hero sphere and by the
   per-project object in the work frame.
   ═══════════════════════════════════════════════════════════════ */

export const VERT = /* glsl */ `
  uniform vec3  uWeights;   // morph mix across the three targets
  uniform float uTime;
  uniform float uSize;
  uniform float uDpr;
  uniform float uWobble;
  uniform float uBase;
  uniform float uFlash;

  attribute vec3  aTargetB;
  attribute vec3  aTargetC;
  attribute float aScale;
  attribute float aPhase;

  varying float vTwinkle;
  varying float vDepth;

  void main() {
    vec3 pos = position * uWeights.x + aTargetB * uWeights.y + aTargetC * uWeights.z;

    // breathe along the surface normal so the form stays alive
    vec3 dir = normalize(pos + vec3(0.0001));
    float w = sin(uTime * 0.62 + aPhase * 6.2831) * 0.55
            + sin(uTime * 0.37 + pos.y * 3.1)     * 0.45;
    pos += dir * w * uWobble;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;

    float t = 0.5 + 0.5 * sin(uTime * 1.55 + aPhase * 47.0);
    vTwinkle = uBase + (1.0 - uBase) * pow(t, uFlash);

    vDepth = smoothstep(-2.0, 1.7, mv.z);

    float size = uSize * aScale * (0.45 + vTwinkle) * uDpr * (52.0 / max(-mv.z, 0.2));
    gl_PointSize = clamp(size, 0.0, 42.0);
  }
`;

export const FRAG = /* glsl */ `
  precision mediump float;

  uniform sampler2D uMap;
  uniform vec3  uColorCore;
  uniform vec3  uColorSpark;
  uniform float uOpacity;
  uniform float uGain;

  varying float vTwinkle;
  varying float vDepth;

  void main() {
    vec4 tex = texture2D(uMap, gl_PointCoord);
    if (tex.a < 0.01) discard;

    vec3 c = mix(uColorCore, uColorSpark, pow(vTwinkle, 1.6));
    float depthFade = mix(0.16, 1.0, vDepth);

    gl_FragColor = vec4(c, tex.a * vTwinkle * depthFade * uOpacity * uGain);
  }
`;

/* ── sprites ────────────────────────────────────────────────── */

export function dotTexture() {
  const S = 32;
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.35, "rgba(255,255,255,0.55)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, S, S);
  const t = new THREE.CanvasTexture(c);
  t.needsUpdate = true;
  return t;
}

export function starTexture() {
  const S = 64;
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const g = c.getContext("2d")!;
  const mid = S / 2;
  const R = S / 2;
  const pinch = S * 0.05;

  const grad = g.createRadialGradient(mid, mid, 0, mid, mid, R);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.22, "rgba(255,255,255,0.7)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad;

  g.beginPath();
  g.moveTo(mid, mid - R);
  g.quadraticCurveTo(mid + pinch, mid - pinch, mid + R, mid);
  g.quadraticCurveTo(mid + pinch, mid + pinch, mid, mid + R);
  g.quadraticCurveTo(mid - pinch, mid + pinch, mid - R, mid);
  g.quadraticCurveTo(mid - pinch, mid - pinch, mid, mid - R);
  g.fill();

  const t = new THREE.CanvasTexture(c);
  t.needsUpdate = true;
  return t;
}

/* ── shapes ─────────────────────────────────────────────────────
   Every generator returns a Float32Array of xyz roughly inside a
   unit sphere, so any two of them morph cleanly into each other.
   ─────────────────────────────────────────────────────────────── */

const GOLDEN = Math.PI * (3 - Math.sqrt(5));

/** even shell, no polar clumping */
export function sphere(count: number, jitter = 0.07) {
  const out = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / Math.max(count - 1, 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const th = GOLDEN * i;
    const rr = 1 - jitter / 2 + Math.random() * jitter;
    out[i * 3] = Math.cos(th) * r * rr;
    out[i * 3 + 1] = y * rr;
    out[i * 3 + 2] = Math.sin(th) * r * rr;
  }
  return out;
}

/** sphere with standing waves running over it */
export function rippleSphere(count: number) {
  const out = sphere(count, 0.04);
  for (let i = 0; i < count; i++) {
    const x = out[i * 3];
    const y = out[i * 3 + 1];
    const z = out[i * 3 + 2];
    const k = 1 + 0.16 * Math.sin(y * 7.0) * Math.cos(Math.atan2(z, x) * 5.0);
    out[i * 3] = x * k;
    out[i * 3 + 1] = y * k;
    out[i * 3 + 2] = z * k;
  }
  return out;
}

/** sphere pulled into soft spikes — reads as a different creature */
export function spikeSphere(count: number) {
  const out = sphere(count, 0.04);
  for (let i = 0; i < count; i++) {
    const x = out[i * 3];
    const y = out[i * 3 + 1];
    const z = out[i * 3 + 2];
    const lobes =
      Math.sin(x * 4.2) * Math.sin(y * 4.2) * Math.sin(z * 4.2);
    const k = 1 + 0.34 * Math.pow(Math.abs(lobes), 1.6) * Math.sign(lobes);
    out[i * 3] = x * k;
    out[i * 3 + 1] = y * k;
    out[i * 3 + 2] = z * k;
  }
  return out;
}

/**
 * A node-link graph: a dozen dense hubs with points strung along the edges
 * between them, so it reads as a dependency graph rather than a fuzzy ball.
 */
export function graphCloud(count: number) {
  const HUBS = 13;
  const hubs: [number, number, number][] = [];
  const src = sphere(HUBS, 0);
  for (let i = 0; i < HUBS; i++) {
    const k = i === 0 ? 0 : 0.45 + Math.random() * 0.55;
    hubs.push([src[i * 3] * k, src[i * 3 + 1] * k, src[i * 3 + 2] * k]);
  }

  // every hub links back to the centre plus one neighbour — no orphans
  const edges: [number, number][] = [];
  for (let i = 1; i < HUBS; i++) {
    edges.push([0, i]);
    if (i > 1 && i % 2 === 0) edges.push([i, i - 1]);
  }

  const out = new Float32Array(count * 3);
  const nodeShare = Math.floor(count * 0.55);

  for (let i = 0; i < count; i++) {
    let x: number;
    let y: number;
    let z: number;

    if (i < nodeShare) {
      // a puff of points around a hub — bigger puff for the centre
      const h = hubs[i % HUBS];
      const spread = i % HUBS === 0 ? 0.1 : 0.055;
      x = h[0] + (Math.random() - 0.5) * spread * 2;
      y = h[1] + (Math.random() - 0.5) * spread * 2;
      z = h[2] + (Math.random() - 0.5) * spread * 2;
    } else {
      // strung along an edge
      const e = edges[(i - nodeShare) % edges.length];
      const t = Math.random();
      const a = hubs[e[0]];
      const b = hubs[e[1]];
      const j = 0.018;
      x = a[0] + (b[0] - a[0]) * t + (Math.random() - 0.5) * j;
      y = a[1] + (b[1] - a[1]) * t + (Math.random() - 0.5) * j;
      z = a[2] + (b[2] - a[2]) * t + (Math.random() - 0.5) * j;
    }

    out[i * 3] = x;
    out[i * 3 + 1] = y;
    out[i * 3 + 2] = z;
  }
  return out;
}

/** (p,q) torus knot, standard parametrisation, with a thin jittered tube */
export function torusKnot(count: number, p = 2, q = 3) {
  const out = new Float32Array(count * 3);
  const S = 0.33;
  const tube = 0.075;

  for (let i = 0; i < count; i++) {
    const t = (i / count) * Math.PI * 2;
    const r = Math.cos(q * t) + 2;

    const cx = r * Math.cos(p * t) * S;
    const cy = r * Math.sin(p * t) * S;
    const cz = -Math.sin(q * t) * S * 1.15;

    const a = Math.random() * Math.PI * 2;
    const b = Math.acos(2 * Math.random() - 1);
    const rad = tube * Math.cbrt(Math.random());

    out[i * 3] = cx + rad * Math.sin(b) * Math.cos(a);
    out[i * 3 + 1] = cy + rad * Math.sin(b) * Math.sin(a);
    out[i * 3 + 2] = cz + rad * Math.cos(b);
  }
  return out;
}

/** points on the shell of a cube grid — structured, architectural */
export function lattice(count: number, n = 11) {
  const shell: number[] = [];
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      for (let k = 0; k < n; k++) {
        // two extremes = a cube edge, three = a corner. Faces are dropped
        // so the form reads as a wireframe box rather than a solid.
        const onEdge =
          (i === 0 || i === n - 1 ? 1 : 0) +
          (j === 0 || j === n - 1 ? 1 : 0) +
          (k === 0 || k === n - 1 ? 1 : 0);
        if (onEdge < 2) continue;
        shell.push(
          (i / (n - 1)) * 2 - 1,
          (j / (n - 1)) * 2 - 1,
          (k / (n - 1)) * 2 - 1
        );
      }
    }
  }

  const out = new Float32Array(count * 3);
  const total = shell.length / 3;
  for (let i = 0; i < count; i++) {
    const s = (i % total) * 3;
    const jitter = 0.022;
    out[i * 3] = shell[s] * 0.6 + (Math.random() - 0.5) * jitter;
    out[i * 3 + 1] = shell[s + 1] * 0.6 + (Math.random() - 0.5) * jitter;
    out[i * 3 + 2] = shell[s + 2] * 0.6 + (Math.random() - 0.5) * jitter;
  }
  return out;
}

/* ── cloud builder ──────────────────────────────────────────── */

export type CloudOptions = {
  targets: [Float32Array, Float32Array, Float32Array];
  map: THREE.Texture;
  size: number;
  scaleMin: number;
  scaleMax: number;
  core: string;
  spark: string;
  gain: number;
  wobble: number;
  base: number;
  flash: number;
  dpr: number;
};

export function buildCloud(o: CloudOptions) {
  const count = o.targets[0].length / 3;
  const geo = new THREE.BufferGeometry();

  const scales = new Float32Array(count);
  const phases = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    scales[i] = o.scaleMin + Math.random() * (o.scaleMax - o.scaleMin);
    phases[i] = Math.random();
  }

  geo.setAttribute("position", new THREE.BufferAttribute(o.targets[0], 3));
  geo.setAttribute("aTargetB", new THREE.BufferAttribute(o.targets[1], 3));
  geo.setAttribute("aTargetC", new THREE.BufferAttribute(o.targets[2], 3));
  geo.setAttribute("aScale", new THREE.BufferAttribute(scales, 1));
  geo.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 2);

  const mat = new THREE.ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: FRAG,
    uniforms: {
      uWeights: { value: new THREE.Vector3(1, 0, 0) },
      uTime: { value: 0 },
      uSize: { value: o.size },
      uDpr: { value: o.dpr },
      uWobble: { value: o.wobble },
      uBase: { value: o.base },
      uFlash: { value: o.flash },
      uOpacity: { value: 0 },
      uGain: { value: o.gain },
      uMap: { value: o.map },
      uColorCore: { value: new THREE.Color(o.core) },
      uColorSpark: { value: new THREE.Color(o.spark) },
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  return new THREE.Points(geo, mat);
}

export function disposeCloud(p: THREE.Points) {
  p.geometry.dispose();
  (p.material as THREE.Material).dispose();
}
