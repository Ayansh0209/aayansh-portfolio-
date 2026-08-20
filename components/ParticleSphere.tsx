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
  sphere,
  rippleSphere,
  spikeSphere,
} from "@/lib/gfx";

/**
 * The hero object. A shell of dust with a few hundred four-point stars
 * flashing through it, slowly morphing between three related forms —
 * an even sphere, a rippled one and a spiked one — so it never settles
 * into looking like a static ball.
 *
 * It also rolls forward as you scroll and tilts toward the pointer.
 */
function Cloud({
  count,
  reduced,
  sizeScale,
}: {
  count: number;
  reduced: boolean;
  sizeScale: number;
}) {
  const group = useRef<THREE.Group>(null);
  const { gl, viewport } = useThree();
  const pointer = useRef({ x: 0, y: 0 });
  const scroll = useRef(0);

  const { clouds, textures } = useMemo(() => {
    const dpr = gl.getPixelRatio();
    const dotMap = dotTexture();
    const starMap = starTexture();

    const dustTargets = [
      sphere(count),
      rippleSphere(count),
      spikeSphere(count),
    ] as [Float32Array, Float32Array, Float32Array];

    const sparkCount = Math.round(count * 0.06);
    const sparkTargets = [
      sphere(sparkCount, 0.14),
      rippleSphere(sparkCount),
      spikeSphere(sparkCount),
    ] as [Float32Array, Float32Array, Float32Array];

    const dust = buildCloud({
      targets: dustTargets,
      map: dotMap,
      size: 0.3 * sizeScale,
      scaleMin: 0.5,
      scaleMax: 1.15,
      core: "#6b6055",
      spark: "#e2d1b8",
      gain: 1.25,
      wobble: reduced ? 0 : 0.03,
      base: 0.52,
      flash: 2.0,
      dpr,
    });

    const sparks = buildCloud({
      targets: sparkTargets,
      map: starMap,
      size: 1.25 * sizeScale,
      scaleMin: 0.7,
      scaleMax: 2.2,
      core: "#8a7255",
      spark: "#fff0d6",
      gain: 1.0,
      wobble: reduced ? 0 : 0.05,
      base: 0.08,
      flash: 6.0,
      dpr,
    });

    return { clouds: [dust, sparks], textures: [dotMap, starMap] };
  }, [count, reduced, sizeScale, gl]);

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
    const onScroll = () => {
      scroll.current = window.scrollY / Math.max(window.innerHeight, 1);
    };
    onScroll();
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const weights = useRef(new THREE.Vector3(1, 0, 0));

  useFrame((state, delta) => {
    const d = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;

    // drift the morph weights around a slow triangle so the form keeps
    // becoming something slightly different
    if (!reduced) {
      const a = Math.max(0, Math.sin(t * 0.085));
      const b = Math.max(0, Math.sin(t * 0.085 - 2.094));
      const c = Math.max(0, Math.sin(t * 0.085 - 4.188));
      const sum = a + b + c || 1;
      weights.current.set(a / sum, b / sum, c / sum);
    }

    for (const cloud of clouds) {
      const m = cloud.material as THREE.ShaderMaterial;
      m.uniforms.uTime.value = t;
      m.uniforms.uOpacity.value = THREE.MathUtils.damp(
        m.uniforms.uOpacity.value,
        1,
        1.4,
        d
      );
      (m.uniforms.uWeights.value as THREE.Vector3).copy(weights.current);
    }

    if (!group.current) return;

    if (!reduced) {
      group.current.rotation.y += d * 0.11;
      // the object keeps rolling as the page scrolls away from it
      group.current.rotation.x = THREE.MathUtils.damp(
        group.current.rotation.x,
        pointer.current.y * 0.3 + scroll.current * 0.55,
        3,
        d
      );
      group.current.rotation.z = THREE.MathUtils.damp(
        group.current.rotation.z,
        pointer.current.x * -0.16,
        3,
        d
      );
    }

    const s = Math.min(viewport.width, viewport.height) * 0.33;
    group.current.scale.setScalar(THREE.MathUtils.clamp(s, 0.9, 1.4));
  });

  return (
    <group ref={group}>
      {clouds.map((c, i) => (
        <primitive object={c} key={i} />
      ))}
    </group>
  );
}

export default function ParticleSphere() {
  const onClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const settings = useMemo(() => {
    if (!onClient) return null;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const narrow = window.matchMedia("(max-width: 768px)").matches;
    const weak = (navigator.hardwareConcurrency ?? 4) <= 4;

    return {
      reduced,
      count: narrow ? 3200 : weak ? 3800 : 6000,
      sizeScale: narrow ? 1.15 : 1,
    };
  }, [onClient]);

  if (!settings) return null;

  return (
    <Canvas
      camera={{ position: [0, 0, 4.2], fov: 45 }}
      dpr={[1, 1.75]}
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      frameloop={settings.reduced ? "demand" : "always"}
    >
      <Cloud
        count={settings.count}
        reduced={settings.reduced}
        sizeScale={settings.sizeScale}
      />
    </Canvas>
  );
}
