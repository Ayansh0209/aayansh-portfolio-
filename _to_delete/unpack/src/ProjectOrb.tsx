"use client";

/*
 * The React Compiler lint rules assume values built during render stay
 * immutable. Driving WebGL means the opposite: every frame writes new values
 * into the same GPU uniform and geometry objects, which is exactly what
 * react-three-fiber's useFrame exists for. Reallocating them per frame would
 * thrash the GPU, so the rules are off for this file only.
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
} from "@/lib/gfx";

/**
 * The object in the left cell of the work frame. One particle system whose
 * points lerp between three forms — a node cloud, a torus knot and a cube
 * lattice — as the active project changes.
 */
function Orb({
  active,
  count,
  reduced,
  dprScale,
}: {
  active: number;
  count: number;
  reduced: boolean;
  dprScale: number;
}) {
  const group = useRef<THREE.Group>(null);
  const { gl, viewport } = useThree();
  const pointer = useRef({ x: 0, y: 0 });
  const spin = useRef(0);
  const prevActive = useRef(active);

  const { clouds, textures } = useMemo(() => {
    const dpr = gl.getPixelRatio() * dprScale;
    const dotMap = dotTexture();
    const starMap = starTexture();

    // the fourth slot is the shared kit's portrait target, unused here
    const graph = graphCloud(count);
    const targets = [graph, torusKnot(count), lattice(count), graph] as [
      Float32Array,
      Float32Array,
      Float32Array,
      Float32Array,
    ];
    const sparkCount = Math.max(90, Math.round(count * 0.07));
    const sparkGraph = graphCloud(sparkCount);
    const sparkTargets = [
      sparkGraph,
      torusKnot(sparkCount),
      lattice(sparkCount),
      sparkGraph,
    ] as [Float32Array, Float32Array, Float32Array, Float32Array];

    const dust = buildCloud({
      targets,
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
      targets: sparkTargets,
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

    return { clouds: [dust, sparks], textures: [dotMap, starMap] };
  }, [count, reduced, dprScale, gl]);

  useEffect(
    () => () => {
      clouds.forEach(disposeCloud);
      textures.forEach((t) => t.dispose());
    },
    [clouds, textures]
  );

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  // a little kick of extra spin whenever the project changes
  useEffect(() => {
    if (prevActive.current !== active) {
      spin.current += 1.5;
      prevActive.current = active;
    }
  }, [active]);

  const target = useRef(new THREE.Vector4(1, 0, 0, 0));

  useFrame((state, delta) => {
    const d = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;

    target.current.set(
      active === 0 ? 1 : 0,
      active === 1 ? 1 : 0,
      active === 2 ? 1 : 0,
      0
    );

    for (const cloud of clouds) {
      const m = cloud.material as THREE.ShaderMaterial;
      m.uniforms.uTime.value = t;
      m.uniforms.uOpacity.value = THREE.MathUtils.damp(
        m.uniforms.uOpacity.value,
        1,
        1.6,
        d
      );
      (m.uniforms.uWeights.value as THREE.Vector4).lerp(
        target.current,
        1 - Math.exp(-3.2 * d)
      );
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
  active,
  inView,
}: {
  active: number;
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
      // stop rendering entirely when the section is off screen
      frameloop={settings.reduced || !inView ? "demand" : "always"}
    >
      <Orb
        active={active}
        count={settings.count}
        reduced={settings.reduced}
        dprScale={settings.dprScale}
      />
    </Canvas>
  );
}
