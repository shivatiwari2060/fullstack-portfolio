"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import {
  blobFragment,
  blobVertex,
  dustFragment,
  dustVertex,
} from "./shaders";

const ACID = new THREE.Color("#c6f24e");
const BONE = new THREE.Color("#edeae3");

/** Scroll progress through the hero, written by ScrollTrigger, read in useFrame. */
const scrollRef = { current: 0 };

/* -------------------------------------------------------------------------- */

function Blob({ intro }: { intro: number }) {
  const mesh = useRef<THREE.Mesh>(null);
  const mat = useRef<THREE.ShaderMaterial>(null);
  const pointer = useRef(0);
  const smoothed = useRef(new THREE.Vector2());

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAmp: { value: 0.0 },
      uFreq: { value: 1.15 },
      uPointer: { value: 0 },
      uMouse: { value: new THREE.Vector2() },
      uAcid: { value: ACID },
      uBone: { value: BONE },
      uFade: { value: 1 },
    }),
    [],
  );

  useFrame((state, delta) => {
    const u = uniforms;
    u.uTime.value += delta;

    // Ease the pointer so the surface never snaps.
    smoothed.current.lerp(state.pointer, 0.045);
    u.uMouse.value.copy(smoothed.current);

    const wantsPointer = state.pointer.length() > 0.02 ? 1 : 0;
    pointer.current += (wantsPointer - pointer.current) * 0.03;
    u.uPointer.value = pointer.current;

    const s = scrollRef.current;
    // Settles down and dims as the hero leaves — it must not fight the next section.
    u.uAmp.value = (0.30 + s * 0.14) * intro;
    u.uFade.value = 1 - s * 0.85;

    if (mesh.current) {
      mesh.current.rotation.y += delta * 0.055;
      mesh.current.rotation.x = Math.sin(u.uTime.value * 0.13) * 0.14 + s * 0.5;
      mesh.current.position.y = -s * 0.9;
      const scale = (1 - s * 0.25) * (0.35 + 0.65 * intro);
      mesh.current.scale.setScalar(scale);
    }
  });

  return (
    <mesh ref={mesh}>
      <icosahedronGeometry args={[1, 24]} />
      <shaderMaterial
        ref={mat}
        vertexShader={blobVertex}
        fragmentShader={blobFragment}
        uniforms={uniforms}
      />
    </mesh>
  );
}

/* -------------------------------------------------------------------------- */

function Dust({ count = 700 }: { count?: number }) {
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSize: { value: 34 },
      uFade: { value: 1 },
      uColor: { value: BONE },
    }),
    [],
  );

  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const seeds = new Float32Array(count);

    // Seeded so the field is identical on every render and every visit —
    // Math.random() here would make the layout differ run to run.
    let seed = 0x9e3779b9;
    const rand = () => {
      seed ^= seed << 13;
      seed ^= seed >>> 17;
      seed ^= seed << 5;
      return ((seed >>> 0) % 100000) / 100000;
    };

    for (let i = 0; i < count; i++) {
      // A shell, not a ball — keeps the centre clear for the object.
      const r = 1.9 + rand() * 2.4;
      const theta = rand() * Math.PI * 2;
      const phi = Math.acos(2 * rand() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.75;
      positions[i * 3 + 2] = r * Math.cos(phi);
      scales[i] = 0.4 + rand() * 1.1;
      seeds[i] = rand();
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    g.setAttribute("aScale", new THREE.BufferAttribute(scales, 1));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    return g;
  }, [count]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  const group = useRef<THREE.Points>(null);

  useFrame((state, delta) => {
    uniforms.uTime.value += delta;
    uniforms.uFade.value = 1 - scrollRef.current;
    if (group.current) {
      group.current.rotation.y += delta * 0.012;
      group.current.rotation.x = state.pointer.y * 0.06;
      group.current.rotation.z = state.pointer.x * 0.06;
    }
  });

  return (
    <points ref={group} geometry={geometry}>
      <shaderMaterial
        vertexShader={dustVertex}
        fragmentShader={dustFragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* -------------------------------------------------------------------------- */

/** A single hairline ring — a piece of drawn geometry among the organic form. */
function Ring() {
  const ref = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshBasicMaterial>(null);

  useFrame((state, delta) => {
    if (!ref.current || !matRef.current) return;
    ref.current.rotation.z += delta * 0.06;
    ref.current.rotation.x = 1.15 + Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    matRef.current.opacity = 0.22 * (1 - scrollRef.current);
    ref.current.scale.setScalar(1 + scrollRef.current * 0.35);
  });

  return (
    <mesh ref={ref} rotation={[1.15, 0, 0]}>
      <torusGeometry args={[1.85, 0.0035, 3, 220]} />
      <meshBasicMaterial ref={matRef} color={ACID} transparent opacity={0.22} />
    </mesh>
  );
}

/* -------------------------------------------------------------------------- */

function Rig() {
  const { camera } = useThree();
  const target = useRef(new THREE.Vector2());

  useFrame((state) => {
    target.current.lerp(state.pointer, 0.03);
    camera.position.x += (target.current.x * 0.32 - camera.position.x) * 0.06;
    camera.position.y += (target.current.y * 0.22 - camera.position.y) * 0.06;
    camera.lookAt(0, 0, 0);
  });

  return null;
}

/* -------------------------------------------------------------------------- */

export default function HeroScene({ sectionId }: { sectionId: string }) {
  const [visible, setVisible] = useState(true);
  // This component is client-only (dynamic, ssr:false), so reading a media
  // query for the initial value can't cause a hydration mismatch.
  const [intro, setIntro] = useState(() => (prefersReducedMotion() ? 1 : 0));
  const wrap = useRef<HTMLDivElement>(null);

  // Scroll drive
  useEffect(() => {
    const section = document.getElementById(sectionId);
    if (!section) return;
    const st = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "bottom top",
      onUpdate: (self) => {
        scrollRef.current = self.progress;
      },
    });
    return () => st.kill();
  }, [sectionId]);

  // Don't burn GPU on a canvas nobody can see.
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: "120px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // The object scales up as it arrives rather than popping in at full size.
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const state = { v: 0 };
    const tween = gsap.to(state, {
      v: 1,
      duration: 2.6,
      delay: 0.15,
      ease: "expo.out",
      onUpdate: () => setIntro(state.v),
    });
    return () => {
      tween.kill();
    };
  }, []);

  return (
    <div ref={wrap} className="absolute inset-0" aria-hidden>
      <Canvas
        frameloop={visible ? "always" : "never"}
        camera={{ position: [0, 0, 3.6], fov: 42 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, powerPreference: "high-performance", alpha: true }}
      >
        <Blob intro={intro} />
        <Dust />
        <Ring />
        <Rig />
      </Canvas>
    </div>
  );
}
