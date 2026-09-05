"use client";

/*
 * The React Compiler lint rules assume values built during render stay
 * immutable. Driving WebGL means the opposite: every frame writes new values
 * into the same GPU uniform and geometry objects, which is what useFrame is
 * for. Reallocating them per frame would thrash the GPU.
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
  globe,
} from "@/lib/gfx";

/**
 * The hero object — three nested point clouds that rotate against each other
 * and keep morphing between four related forms, so the silhouette is never
 * the same twice. It drifts down the viewport as you scroll and dissolves as
 * the work section arrives.
 */
function Cloud({
  count,
  reduced,
  sizeScale,
  narrow,
}: {
  count: number;
  reduced: boolean;
  sizeScale: number;
  narrow: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  const shell = useRef<THREE.Group>(null);
  const core = useRef<THREE.Group>(null);
  const { gl, viewport } = useThree();
  const pointer = useRef({ x: 0, y: 0 });
  const scroll = useRef(0);

  const { shellClouds, coreCloud, textures } = useMemo(() => {
    const dpr = gl.getPixelRatio();
    const dotMap = dotTexture();
    const starMap = starTexture();

    const forms = (n: number) =>
      [sphere(n), rippleSphere(n), spikeSphere(n), globe(n)] as [
        Float32Array,
        Float32Array,
        Float32Array,
        Float32Array,
      ];

    const dust = buildCloud({
      targets: forms(count),
      map: dotMap,
      size: 0.3 * sizeScale,
      scaleMin: 0.5,
      scaleMax: 1.15,
      core: "#6b6055",
      spark: "#e2d1b8",
      gain: 1.3,
      wobble: reduced ? 0 : 0.034,
      base: 0.5,
      flash: 2.0,
      dpr,
    });

    const sparkCount = Math.round(count * 0.07);
    const sparks = buildCloud({
      targets: forms(sparkCount),
      map: starMap,
      size: 1.3 * sizeScale,
      scaleMin: 0.7,
      scaleMax: 2.3,
      core: "#8a7255",
      spark: "#fff0d6",
      gain: 1.05,
      wobble: reduced ? 0 : 0.06,
      base: 0.07,
      flash: 6.0,
      dpr,
    });

    // an inner shell that turns the other way — this is what stops the object
    // reading as one flat rotating ball
    const innerCount = Math.round(count * 0.42);
    const inner = buildCloud({
      targets: forms(innerCount),
      map: dotMap,
      size: 0.26 * sizeScale,
      scaleMin: 0.4,
      scaleMax: 0.95,
      core: "#4f4740",
      spark: "#c3ae92",
      gain: 1.0,
      wobble: reduced ? 0 : 0.05,
      base: 0.42,
      flash: 2.6,
      dpr,
    });

    return {
      shellClouds: [dust, sparks],
      coreCloud: inner,
      textures: [dotMap, starMap],
    };
  }, [count, reduced, sizeScale, gl]);

  const all = useMemo(
    () => [...shellClouds, coreCloud],
    [shellClouds, coreCloud]
  );

  useEffect(
    () => () => {
      all.forEach(disposeCloud);
      textures.forEach((t) => t.dispose());
    },
    [all, textures]
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

  const w = useRef(new THREE.Vector4(1, 0, 0, 0));

  useFrame((state, delta) => {
    const d = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;
    const s = scroll.current;

    // four overlapping lobes cycling faster than before, so the form is
    // visibly becoming something else rather than gently breathing
    if (!reduced) {
      const SPEED = 0.15;
      const a = Math.max(0, Math.sin(t * SPEED));
      const b = Math.max(0, Math.sin(t * SPEED - 1.571));
      const c = Math.max(0, Math.sin(t * SPEED - 3.142));
      const e = Math.max(0, Math.sin(t * SPEED - 4.712));
      const sum = a + b + c + e || 1;
      w.current.set(a / sum, b / sum, c / sum, e / sum);
    }

    const exit = narrow
      ? 1 - THREE.MathUtils.smoothstep(s, 0.42, 0.85)
      : 1 - THREE.MathUtils.smoothstep(s, 0.6, 1.02);

    for (const cloud of all) {
      const m = cloud.material as THREE.ShaderMaterial;
      m.uniforms.uTime.value = t;
      m.uniforms.uOpacity.value = THREE.MathUtils.damp(
        m.uniforms.uOpacity.value,
        exit,
        2.2,
        d
      );
      (m.uniforms.uWeights.value as THREE.Vector4).copy(w.current);
    }

    if (!group.current || !shell.current || !core.current) return;

    if (!reduced) {
      shell.current.rotation.y += d * 0.14;
      shell.current.rotation.x += d * 0.03;

      // counter-rotation, and a touch faster
      core.current.rotation.y -= d * 0.26;
      core.current.rotation.z += d * 0.07;

      group.current.rotation.x = THREE.MathUtils.damp(
        group.current.rotation.x,
        pointer.current.y * 0.34 + s * 0.5,
        3,
        d
      );
      group.current.rotation.z = THREE.MathUtils.damp(
        group.current.rotation.z,
        pointer.current.x * -0.2,
        3,
        d
      );
    }

    const byHeight = viewport.height * 0.3;
    const byWidth = (viewport.width * (narrow ? 0.68 : 0.78)) / 1.9;
    const scale = THREE.MathUtils.clamp(Math.min(byHeight, byWidth), 0.35, 1.25);
    group.current.scale.setScalar(scale);
    core.current.scale.setScalar(0.55);

    group.current.position.y = THREE.MathUtils.damp(
      group.current.position.y,
      -THREE.MathUtils.smoothstep(s, 0.12, 1.0) * 1.3,
      5,
      d
    );
  });

  return (
    <group ref={group}>
      <group ref={shell}>
        {shellClouds.map((c, i) => (
          <primitive object={c} key={i} />
        ))}
      </group>
      <group ref={core}>
        <primitive object={coreCloud} />
      </group>
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
      count: narrow ? 5000 : weak ? 8000 : 13000,
      sizeScale: narrow ? 1.1 : 1,
      narrow,
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
        narrow={settings.narrow}
      />
    </Canvas>
  );
}
