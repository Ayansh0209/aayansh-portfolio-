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
  loadPortrait,
  sphere,
  rippleSphere,
  spikeSphere,
} from "@/lib/gfx";

/**
 * The hero object. It starts as a shell of sparkling dust drifting between
 * three related forms, and as you scroll it gathers into a portrait — a real
 * point cloud built from a photo, with depth from a head bulge and tonal
 * relief, so it holds up when it turns. It also drifts downward as the page
 * moves, lagging behind the scroll.
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
  const { gl, viewport } = useThree();
  const pointer = useRef({ x: 0, y: 0 });
  const scroll = useRef(0);
  const spin = useRef(0);

  const { clouds, textures } = useMemo(() => {
    const dpr = gl.getPixelRatio();
    const dotMap = dotTexture();
    const starMap = starTexture();

    const base = sphere(count);
    const dustTargets = [
      base,
      rippleSphere(count),
      spikeSphere(count),
      base.slice(), // replaced by the portrait once it loads
    ] as [Float32Array, Float32Array, Float32Array, Float32Array];

    const sparkCount = Math.round(count * 0.05);
    const sparkBase = sphere(sparkCount, 0.14);
    const sparkTargets = [
      sparkBase,
      rippleSphere(sparkCount),
      spikeSphere(sparkCount),
      sparkBase.slice(),
    ] as [Float32Array, Float32Array, Float32Array, Float32Array];

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

  /* ── pull the portrait in and swap it into the fourth target ── */
  const hasPortrait = useRef(false);

  useEffect(() => {
    const ac = new AbortController();
    let cancelled = false;

    (async () => {
      try {
        for (const cloud of clouds) {
          const geo = cloud.geometry;
          const n = geo.getAttribute("position").count;
          const { positions, bright } = await loadPortrait(
            "/portrait.bin",
            n,
            ac.signal
          );
          if (cancelled) return;

          const target = geo.getAttribute("aTargetD") as THREE.BufferAttribute;
          (target.array as Float32Array).set(positions);
          target.needsUpdate = true;

          const b = geo.getAttribute("aBright") as THREE.BufferAttribute;
          (b.array as Float32Array).set(bright);
          b.needsUpdate = true;
        }
        hasPortrait.current = true;
      } catch {
        // no portrait file — the hero just stays a sparkling cloud
      }
    })();

    return () => {
      cancelled = true;
      ac.abort();
    };
  }, [clouds]);

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

  const weights = useRef(new THREE.Vector4(1, 0, 0, 0));

  useFrame((state, delta) => {
    const d = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;
    const s = scroll.current;

    // resolve into the face early, so there is a long stretch where it is
    // fully formed and travelling rather than still assembling
    const portrait = hasPortrait.current
      ? THREE.MathUtils.smoothstep(s, 0.05, 0.42)
      : 0;
    const rest = 1 - portrait;

    if (reduced) {
      weights.current.set(rest, 0, 0, portrait);
    } else {
      // the three abstract forms keep cycling in whatever share is left
      const a = Math.max(0, Math.sin(t * 0.085));
      const b = Math.max(0, Math.sin(t * 0.085 - 2.094));
      const c = Math.max(0, Math.sin(t * 0.085 - 4.188));
      const sum = a + b + c || 1;
      weights.current.set(
        (a / sum) * rest,
        (b / sum) * rest,
        (c / sum) * rest,
        portrait
      );
    }

    // fade out as the hero leaves rather than letting the canvas edge cut it
    // on a phone the object shares the screen with the copy, so it clears
    // out sooner
    const exit = narrow
      ? 1 - THREE.MathUtils.smoothstep(s, 0.42, 0.85)
      : 1 - THREE.MathUtils.smoothstep(s, 0.6, 1.02);

    for (const cloud of clouds) {
      const m = cloud.material as THREE.ShaderMaterial;
      m.uniforms.uTime.value = t;
      m.uniforms.uPortrait.value = portrait;
      m.uniforms.uOpacity.value = THREE.MathUtils.damp(
        m.uniforms.uOpacity.value,
        exit,
        2.2,
        d
      );
      (m.uniforms.uWeights.value as THREE.Vector4).copy(weights.current);
    }

    // alpha now tracks the photo's tone, which costs a lot of light — put it
    // back so the face reads as brightly as the sphere did
    const dustMat = clouds[0].material as THREE.ShaderMaterial;
    dustMat.uniforms.uGain.value = 1.25 * (1 + 0.85 * portrait);

    // the stars would read as noise across a face, so fade them as it forms
    const sparkMat = clouds[1].material as THREE.ShaderMaterial;
    sparkMat.uniforms.uGain.value = 1 - portrait * 0.72;

    if (!group.current) return;

    if (!reduced) {
      // free spin while it is abstract; once it is a face, settle into a
      // slow yaw so you are never looking at the back of someone's head
      spin.current += d * 0.11 * (1 - portrait);
      const yaw = Math.sin(t * 0.24) * 0.3 + pointer.current.x * 0.22;
      group.current.rotation.y = THREE.MathUtils.lerp(spin.current, yaw, portrait);

      group.current.rotation.x = THREE.MathUtils.damp(
        group.current.rotation.x,
        pointer.current.y * 0.3 * (1 - portrait * 0.55) + s * 0.55 * (1 - portrait),
        3,
        d
      );
      group.current.rotation.z = THREE.MathUtils.damp(
        group.current.rotation.z,
        pointer.current.x * -0.16 * (1 - portrait * 0.7),
        3,
        d
      );
    }

    // the portrait is ~2 units tall and ~1.7 wide, so fit it to whichever
    // axis runs out first — otherwise it swamps a phone screen
    const byHeight = viewport.height * 0.3;
    const byWidth = (viewport.width * (narrow ? 0.62 : 0.72)) / 1.7;
    const scale = THREE.MathUtils.clamp(Math.min(byHeight, byWidth), 0.35, 1.2);
    group.current.scale.setScalar(scale);

    // the layer is fixed to the viewport, so this is a real journey down the
    // screen rather than the object simply scrolling out of frame
    group.current.position.y = THREE.MathUtils.damp(
      group.current.position.y,
      -THREE.MathUtils.smoothstep(s, 0.12, 1.0) * 1.3,
      5,
      d
    );
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
      // a face needs far more points than a sphere before it reads
      count: narrow ? 7000 : weak ? 10000 : 16000,
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
