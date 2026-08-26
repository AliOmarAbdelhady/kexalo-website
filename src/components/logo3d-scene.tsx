"use client";

import * as React from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { LOGO_RINGS } from "@/components/logo-geometry";

// Shared motion state written by the scroll traveller, read inside the scene.
export type Logo3DMotion = {
  u: number; // 0..1 scroll progress across the whole page
  vel: number; // smoothed scroll velocity (px/frame)
  dock: number; // 1 = parked in the hero lockup, 0 = fully travelling
  gTravel: number; // WebGL group scale for the travelling size
  gPark: number; // WebGL group scale that fits the model over the hero mark slot
  reduce: boolean; // prefers-reduced-motion
  mobile: boolean; // small screens: the model never travels, it sticks to the lockup
};

const X_COLOR_DARK = "#f1f3f7"; // white-silver metal on the dark site
const X_COLOR_LIGHT = "#14161c"; // graphite ink on the light site

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clampVel = (v: number) => Math.max(-1, Math.min(1, v / 90));

function buildExtrusion(rings: [number, number][][]) {
  const parts = rings.map((ring) => {
    const shape = new THREE.Shape(ring.map(([x, y]) => new THREE.Vector2(x, y)));
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.34,
      bevelEnabled: true,
      bevelThickness: 0.05,
      bevelSize: 0.018,
      bevelSegments: 6,
      curveSegments: 2,
    });
    geo.translate(0, 0, -0.17);
    return geo;
  });
  const merged = mergeGeometries(parts, false);
  parts.forEach((p) => p.dispose());
  return merged;
}

function LogoModel({
  motionRef,
  theme,
  brandHex,
}: {
  motionRef: React.RefObject<Logo3DMotion>;
  theme: "dark" | "light";
  brandHex: string; // resolved --brand token, keeps the chevron on the exact site mint
}) {
  const root = React.useRef<THREE.Group>(null);
  const inner = React.useRef<THREE.Group>(null);
  const xMat = React.useRef<THREE.MeshPhysicalMaterial>(null);
  const mintMat = React.useRef<THREE.MeshPhysicalMaterial>(null);

  const darkGeo = React.useMemo(() => buildExtrusion(LOGO_RINGS.dark), []);
  const mintGeo = React.useMemo(() => buildExtrusion(LOGO_RINGS.mint), []);
  React.useEffect(() => () => { darkGeo.dispose(); mintGeo.dispose(); }, [darkGeo, mintGeo]);

  const targetXColor = React.useMemo(
    () => new THREE.Color(theme === "dark" ? X_COLOR_DARK : X_COLOR_LIGHT),
    [theme],
  );
  const brandColor = React.useMemo(() => new THREE.Color(brandHex), [brandHex]);

  // smoothed animation state
  const anim = React.useRef({
    flip: 0, flipTarget: 0, lastSeg: 0,
    rx: 0, ry: 0, rz: 0, scale: 1, glow: 0.5,
    xColor: new THREE.Color(theme === "dark" ? X_COLOR_DARK : X_COLOR_LIGHT),
  });

  useFrame((state, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05);
    const m = motionRef.current;
    if (!m) return;
    const a = anim.current;
    const time = state.clock.elapsedTime;
    const travel = 1 - m.dock;
    const speed = Math.min(Math.abs(m.vel), 120);

    // periodic 360° flip tricks as it rides down the page, always readable face-on otherwise
    if (!m.reduce) {
      const seg = Math.floor(m.u * 5.5);
      if (seg !== a.lastSeg && travel > 0.5) a.flipTarget += Math.PI * 2;
      a.lastSeg = seg;
    }
    a.flip += (a.flipTarget - a.flip) * Math.min(1, dt * 4.5);

    const ryT =
      a.flip +
      Math.sin(time * 0.7 + m.u * Math.PI * 3) * 0.5 * travel +
      Math.sin(time * 0.6) * 0.12 * m.dock * (m.reduce ? 0 : 1);
    const rxB =
      (Math.sin(m.u * Math.PI * 2) * 0.45 +
        clampVel(m.vel) * 0.55 + // dive forward scrolling down, rear up scrolling up
        speed * 0.0012) *
      travel;
    const rzB =
      Math.sin(m.u * Math.PI * 3 + 0.7) * 0.3 * travel +
      Math.sign(m.vel) * Math.min(0.28, Math.abs(m.vel) * 0.002) * travel; // bank into scroll direction

    const k = Math.min(1, dt * 7);
    a.ry += (ryT - a.ry) * k;
    a.rx += (rxB - a.rx) * k;
    a.rz += (rzB - a.rz) * k;

    // velocity pulse; size morphs between travelling scale and hero park scale, all inside WebGL
    const baseG = lerp(m.gTravel, m.gPark, m.dock);
    const scaleT = (1 + Math.min(0.14, speed * 0.0011)) * baseG;
    a.scale += (scaleT - a.scale) * k;

    if (root.current) {
      root.current.rotation.set(a.rx, a.ry, a.rz);
      root.current.scale.setScalar(a.scale);
    }
    if (inner.current && !m.reduce) {
      const bobK = 0.6 * travel + 0.25;
      inner.current.position.y = Math.sin(time * 1.4) * 0.05 * bobK;
      inner.current.position.x = Math.cos(time * 0.9) * 0.035 * bobK;
    }

    const glowT = 0.22 + Math.min(0.5, speed * 0.005) + Math.sin(time * 2.2) * 0.04;
    a.glow += (glowT - a.glow) * k;
    if (mintMat.current) mintMat.current.emissiveIntensity = a.glow;

    a.xColor.lerp(targetXColor, Math.min(1, dt * 4));
    if (xMat.current) xMat.current.color.copy(a.xColor);
  });

  return (
    <group ref={root}>
      <group ref={inner}>
        <mesh geometry={darkGeo} castShadow={false}>
          <meshPhysicalMaterial
            ref={xMat}
            color={theme === "dark" ? X_COLOR_DARK : X_COLOR_LIGHT}
            metalness={0.92}
            roughness={0.22}
            clearcoat={0.55}
            clearcoatRoughness={0.25}
            envMapIntensity={1.25}
          />
        </mesh>
        <mesh geometry={mintGeo}>
          <meshPhysicalMaterial
            ref={mintMat}
            color={brandColor}
            emissive={brandColor}
            emissiveIntensity={0.8}
            metalness={0.05}
            roughness={0.35}
            clearcoat={0.35}
            clearcoatRoughness={0.25}
            envMapIntensity={0.15}
            toneMapped={false}
          />
        </mesh>
      </group>
      {/* key light */}
      <directionalLight position={[4, 6, 8]} intensity={1.6} />
      {/* brand-mint accent */}
      <pointLight position={[-6, -3, 4]} intensity={40} color={brandHex} />
      {/* cool rim for edge highlights while rotating */}
      <pointLight position={[2, 4, -6]} intensity={30} color="#bfd9ff" />
    </group>
  );
}

export default function Logo3DScene({
  motionRef,
  theme,
  brandHex,
  side,
  dpr,
}: {
  motionRef: React.RefObject<Logo3DMotion>;
  theme: "dark" | "light";
  brandHex: string;
  side: number; // canvas CSS size in px (square)
  dpr: number;
}) {
  return (
    <Canvas
      dpr={dpr} // fixed supersampling factor (can exceed devicePixelRatio for crispness)
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ fov: 30, position: [0, 0, 10], near: 0.1, far: 100 }}
      style={{ width: side, height: side, background: "transparent" }}
      onCreated={({ gl, scene }) => {
        // one-time renderer + studio environment setup
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.12;
        const pmrem = new THREE.PMREMGenerator(gl);
        scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
        pmrem.dispose();
      }}
    >
      {/* model height in px = 0.2782 * side * group scale (see traveller's gTravel/gPark) */}
      <group>
        <LogoModel motionRef={motionRef} theme={theme} brandHex={brandHex} />
      </group>
    </Canvas>
  );
}
