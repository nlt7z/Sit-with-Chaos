"use client";

import { useEffect, useRef, type MutableRefObject } from "react";
import * as THREE from "three";

/** Shared cursor channel — written by parent on mousemove, read by the render
 *  loop every frame. Using a ref keeps Hero from re-rendering on cursor motion. */
export type OrbPointerRef = MutableRefObject<{
  /** Normalized X in [-1, 1], measured against the hero section box. */
  x: number;
  /** Normalized Y in [-1, 1], flipped to WebGL convention (up positive). */
  y: number;
  /** Whether the cursor is currently inside the hero (controls reveal strength). */
  active: boolean;
}>;

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform vec2 uPointer;
  uniform float uPointerStrength;

  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  varying float vNoise;
  varying float vPointerInfluence;

  // Ashima 3D simplex noise (https://github.com/ashima/webgl-noise)
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
        i.z + vec4(0.0, i1.z, i2.z, 1.0))
        + i.y + vec4(0.0, i1.y, i2.y, 1.0))
        + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  float fbm(vec3 p, float t) {
    float n1 = snoise(p * 1.0 + t * 0.14);
    float n2 = snoise(p * 2.3 - t * 0.18);
    return n1 * 0.7 + n2 * 0.3;
  }

  void main() {
    float n = fbm(position, uTime);

    // Project cursor onto the front-facing hemisphere; vertices whose normal
    // points toward the cursor get extra displacement & brightness later.
    vec3 cursorDir = normalize(vec3(uPointer * 1.5, 1.0));
    vec3 vertexDir = normalize(position);
    float angleCos = max(dot(vertexDir, cursorDir), 0.0);
    float influence = smoothstep(0.55, 1.0, angleCos) * uPointerStrength;

    float displacement = n * 0.14 + influence * 0.12;
    vec3 displacedPos = position + normal * displacement;

    vNormal = normalize(normalMatrix * normal);
    vec4 worldPos = modelMatrix * vec4(displacedPos, 1.0);
    vWorldPosition = worldPos.xyz;
    vNoise = n;
    vPointerInfluence = influence;

    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uRimColor;
  uniform vec3 uWarmColor;
  uniform vec3 uCameraPos;

  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  varying float vNoise;
  varying float vPointerInfluence;

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(uCameraPos - vWorldPosition);

    float fresnel = 1.0 - max(dot(normal, viewDir), 0.0);
    fresnel = pow(fresnel, 2.4);

    vec3 base = mix(uColorA, uColorB, vNoise * 0.5 + 0.5);
    vec3 color = mix(base, uRimColor, fresnel * 0.65);
    color = mix(color, uWarmColor, vPointerInfluence * 0.4);
    color *= 0.78 + vNoise * 0.14;

    gl_FragColor = vec4(color, 1.0);
  }
`;

export default function HeroOrb({
  pointerRef,
  onReady,
}: {
  pointerRef: OrbPointerRef;
  onReady?: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  // Latest onReady kept in a ref so we don't re-init the scene when the
  // parent re-renders with a new inline callback.
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const w0 = container.clientWidth || 1;
    const h0 = container.clientHeight || 1;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, w0 / h0, 0.1, 100);
    camera.position.set(0, 0, 3.4);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w0, h0);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const geometry = new THREE.IcosahedronGeometry(1.4, 32);
    const uniforms = {
      uTime: { value: 0 },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uPointerStrength: { value: 0 },
      uColorA: { value: new THREE.Color(0.16, 0.18, 0.26) },
      uColorB: { value: new THREE.Color(0.34, 0.30, 0.44) },
      uRimColor: { value: new THREE.Color(0.92, 0.95, 1.0) },
      uWarmColor: { value: new THREE.Color(0.92, 0.83, 0.68) },
      uCameraPos: { value: new THREE.Vector3(0, 0, 3.4) },
    };
    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    let raf = 0;
    let last = performance.now();
    let frameCount = 0;
    let readyFired = false;

    const animate = (now: number) => {
      const delta = Math.min((now - last) / 1000, 0.05);
      last = now;
      const t = now / 1000;

      uniforms.uTime.value += delta;

      const target = pointerRef.current;
      uniforms.uPointer.value.x += (target.x - uniforms.uPointer.value.x) * 0.09;
      uniforms.uPointer.value.y += (target.y - uniforms.uPointer.value.y) * 0.09;
      const targetStrength = target.active ? 1 : 0;
      uniforms.uPointerStrength.value +=
        (targetStrength - uniforms.uPointerStrength.value) * 0.06;

      mesh.rotation.y = t * 0.06;
      mesh.rotation.x = Math.sin(t * 0.04) * 0.14;

      renderer.render(scene, camera);

      frameCount += 1;
      if (frameCount === 2 && !readyFired) {
        readyFired = true;
        onReadyRef.current?.();
      }

      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);

    const handleResize = () => {
      const w = container.clientWidth || 1;
      const h = container.clientHeight || 1;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const ro = new ResizeObserver(handleResize);
    ro.observe(container);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [pointerRef]);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100%" }}
      aria-hidden
    />
  );
}
