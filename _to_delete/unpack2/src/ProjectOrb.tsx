"use client";

/*
 * The React Compiler lint rules assume values built during render stay
 * immutable. Driving WebGL means the opposite: every frame writes new values
 * into the same GPU uniform and geometry objects, which is exactly what
 * react-three-fiber's useFrame exists for.
 */
/* eslint-disable react-hooks/immutability */

import { useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import {
  buildCloud,
  disposeCloud,
  dotTexture,
  starTexture,
  graphCloud,
  torusKnot,
  lattice,
  sphere,
  globe,
  grid,
} from "@/lib/gfx";
import type { OrbShape } from "@/lib/content";

const GENERATORS: Record<OrbShape, (n: number) => Float32Array> = {
  graph: graphCloud,
  knot: (n) => torusKnot(n),
  lattice: (n) => lattice(n),
  sphere: (n) => sphere(n, 0.08),
  globe: (n) => globe(n),
  grid: (n) => grid(n),
};

/**
 * The object in the left cell of the work frame — one particle system that
 * morphs into a different form for each project.
 *
 * It ping-pongs between two morph slots rather than holding one target per
 * project: the incoming shape is written into whichever slot is currently at
 * zero weight, then the weights cross-fade. That scales to any number of
 * projects with a fixed amount of GPU memory.
 */
function Orb({
  shape,
  count,
  reduced,
  dprScale,
}: {
  shape: OrbShape;
  count: number;
  reduced: boolean;
  dprScale: number;
}) {
  const group = useRef<THREE.Group>(null);
  const { gl, viewport } = useThree();
  const pointer = useRef({ x: 0, y: 0 });
  const spin = useRef(0);

  /** which slot currently holds the visible shape: 0 = position, 1 = aTargetB */
  const slot = useRef(0);
  const shownShape = useRef<OrbShape>("sphere");

  const { clouds, textures, cache } = useMemo(() => {
    const dpr = gl.getPixelRatio() * dprScale;
    const dotMap = dotTexture();
    const starMap = starTexture();
    const sparkCount = Math.max(90, Math.round(count * 0.07));

    // per-point-count cache of generated shapes, so revisiting a project is free
    const cache = new Map<string, Float32Array>();
    const gen = (s: OrbShape, n: number) => {
      const key = `${s}:${n}`;
      let v = cache.get(key);
      if (!v) {
        v = GENERATORS[s](n);
        cache.set(key, v);
      }
      return v;
    };

    const zeros = (n: number) => new Float32Array(n * 3);

    const dust = buildCloud({
      targets: [
        gen("sphere", count).slice(),
        zeros(count),
        zeros(count),
        zeros(count),
      ],
      map: dotMap,
      size: 0.3,
      scaleMin: 0.5,
      scaleMax: 1.15,
      core: "#6b6055",
      spark: "#e2d1b8",
      gain: 1.2,
      wobble: reduced ? 0 : 0.028,
      base: 0.55,
      flash: 2.0,
      dpr,
    });

    const sparks = buildCloud({
      targets: [
        gen("sphere", sparkCount).slice(),
        zeros(sparkCount),
        zeros(sparkCount),
        zeros(sparkCount),
      ],
      map: starMap,
      size: 1.25,
      scaleMin: 0.7,
      scaleMax: 2.1,
      core: "#8a7255",
      spark: "#fff0d6",
      gain: 1.0,
      wobble: reduced ? 0 : 0.05,
      base: 0.08,
      flash: 6.0,
      dpr,
    });

    return { clouds: [dust, sparks], textures: [dotMap, starMap], gen, cache };
  }, [count, reduced, dprScale, gl]);

  useEffect(
    () => () => {
      clouds.forEach(disposeCloud);
      textures.forEach((t) => t.dispose());
      cache.clear();
    },
    [clouds, textures, cache]
  );

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  /* write the incoming shape into the idle slot and hand it the weight */
  useEffect(() => {
    if (shape === shownShape.current) return;

    const next = slot.current === 0 ? 1 : 0;

    for (const cloud of clouds) {
      const geo = cloud.geometry;
      const n = geo.getAttribute("position").count;
      const key = `${shape}:${n}`;
      let data = cache.get(key);
      if (!data) {
        data = GENERATORS[shape](n);
        cache.set(key, data);
      }

      const attr = (
        next === 0 ? geo.getAttribute("position") : geo.getAttribute("aTargetB")
      ) as THREE.BufferAttribute;
      (attr.array as Float32Array).set(data);
      attr.needsUpdate = true;
    }

    slot.current = next;
    shownShape.current = shape;
    spin.current += 1.6; // a kick of extra rotation on the change
  }, [shape, clouds, cache]);

  useFrame((state, delta) => {
    const d = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;
    const want = slot.current === 0 ? 1 : 0; // weight on x when slot 0 is live

    for (const cloud of clouds) {
      const m = cloud.material as THREE.ShaderMaterial;
      m.uniforms.uTime.value = t;
      m.uniforms.uOpacity.value = THREE.MathUtils.damp(
        m.uniforms.uOpacity.value,
        1,
        1.6,
        d
      );

      const w = m.uniforms.uWeights.value as THREE.Vector4;
      w.x = THREE.MathUtils.damp(w.x, want, 3.4, d);
      w.y = 1 - w.x;
      w.z = 0;
      w.w = 0;
    }

    if (!group.current) return;

    if (!reduced) {
      spin.current = THREE.MathUtils.damp(spin.current, 0, 2.2, d);
      group.current.rotation.y += d * (0.2 + spin.current);
      group.current.rotation.x = THREE.MathUtils.damp(
        group.current.rotation.x,
        pointer.current.y * 0.4 + 0.15,
        3,
        d
      );
      group.current.rotation.z = THREE.MathUtils.damp(
        group.current.rotation.z,
        pointer.current.x * -0.22,
        3,
        d
      );
    }

    const s = Math.min(viewport.width, viewport.height) * 0.42;
    group.current.scale.setScalar(THREE.MathUtils.clamp(s, 0.7, 1.5));
  });

  return (
    <group ref={group}>
      {clouds.map((c, i) => (
        <primitive object={c} key={i} />
      ))}
    </group>
  );
}

export default function ProjectOrb({
  shape,
  inView,
}: {
  shape: OrbShape;
  inView: boolean;
}) {
  const onClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const settings = useMemo(() => {
    if (!onClient) return null;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const narrow = window.matchMedia("(max-width: 900px)").matches;
    const weak = (navigator.hardwareConcurrency ?? 4) <= 4;
    return {
      reduced,
      count: narrow ? 2200 : weak ? 3000 : 4200,
      dprScale: narrow ? 1.1 : 1,
    };
  }, [onClient]);

  if (!settings) return null;

  return (
    <Canvas
      camera={{ position: [0, 0, 3.6], fov: 45 }}
      dpr={[1, 1.75]}
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      frameloop={settings.reduced || !inView ? "demand" : "always"}
    >
      <Orb
        shape={shape}
        count={settings.count}
        reduced={settings.reduced}
        dprScale={settings.dprScale}
      />
    </Canvas>
  );
}
