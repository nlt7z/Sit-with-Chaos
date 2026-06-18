"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { BokehPass } from "three/examples/jsm/postprocessing/BokehPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";

/**
 * Lime glass field — an interactive 3D still life in the nltLime palette.
 *
 * - Real depth of field (BokehPass); hovering / tapping an object racks focus
 *   to its depth, like pulling focus on a lens.
 * - Drag orbits the whole arrangement with inertia; wheel dollies the camera.
 * - Everything idles on slow sine drifts so the frame never feels frozen.
 */

const LIME = 0xb8e532;
const LIME_DEEP = 0x9bcf14;

/** Deterministic rng so the composition is identical on every visit. */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Floater = {
  obj: THREE.Object3D;
  base: THREE.Vector3;
  amp: number;
  speed: number;
  phase: number;
  spin: THREE.Vector3;
  /** Entrance stagger offset, seconds. */
  delay: number;
};

/** easeOutBack — slight overshoot so objects "pop" into place. */
function easeOutBack(x: number) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}

export function LimeGlassField({ dolly = true }: { dolly?: boolean } = {}) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const rng = mulberry32(20260610);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.toneMapping = THREE.NeutralToneMapping;
    renderer.toneMappingExposure = 1.22;
    renderer.domElement.style.opacity = "0";
    renderer.domElement.style.transition = "opacity 1.2s ease";
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    // Soft radial wash — warm paper white falling off into pale lime.
    const bgCanvas = document.createElement("canvas");
    bgCanvas.width = bgCanvas.height = 512;
    const bgCtx = bgCanvas.getContext("2d")!;
    const grad = bgCtx.createRadialGradient(190, 170, 60, 256, 256, 430);
    grad.addColorStop(0, "#ffffff");
    grad.addColorStop(0.55, "#f8fcea");
    grad.addColorStop(1, "#edf5cf");
    bgCtx.fillStyle = grad;
    bgCtx.fillRect(0, 0, 512, 512);
    const bgTexture = new THREE.CanvasTexture(bgCanvas);
    bgTexture.colorSpace = THREE.SRGBColorSpace;
    scene.background = bgTexture;

    const camera = new THREE.PerspectiveCamera(
      40,
      mount.clientWidth / mount.clientHeight,
      0.1,
      60,
    );
    camera.position.set(0, 0, 9.5);

    // Bright studio environment — this is what makes the glass read as glass.
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTexture = pmrem.fromScene(new RoomEnvironment(), 0.06).texture;
    scene.environment = envTexture;

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.6);
    keyLight.position.set(4, 6, 6);
    scene.add(keyLight);
    const rimLight = new THREE.DirectionalLight(0xeaffc0, 0.8);
    rimLight.position.set(-5, -2, 4);
    scene.add(rimLight);

    /* ---------------------------------- materials ---------------------------------- */

    // Pure water-clear glass — rods, rings, the hero bubble shell.
    const matClear = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 1,
      roughness: 0.04,
      metalness: 0,
      ior: 1.45,
      thickness: 1.2,
      attenuationColor: new THREE.Color(0xe6f7bb),
      attenuationDistance: 6,
      specularIntensity: 1,
      envMapIntensity: 1.25,
    });
    // Juicy candy glass — the saturated arcs and tubes. Colour comes from
    // attenuation (light travelling through), not surface albedo, so it stays see-through.
    const matLimeGlass = new THREE.MeshPhysicalMaterial({
      color: 0xc6ec48,
      transmission: 1,
      roughness: 0.07,
      metalness: 0,
      ior: 1.4,
      thickness: 0.7,
      attenuationColor: new THREE.Color(LIME_DEEP),
      attenuationDistance: 2.8,
      envMapIntensity: 1.25,
    });
    const matFrost = new THREE.MeshPhysicalMaterial({
      color: 0xf2fad8,
      transmission: 1,
      roughness: 0.3,
      metalness: 0,
      ior: 1.3,
      thickness: 0.3,
      envMapIntensity: 1,
    });
    // Faceted gem — the icosahedron. Flat shading + transmission reads as cut glass.
    const matGem = new THREE.MeshPhysicalMaterial({
      color: 0xaede2e,
      transmission: 0.75,
      roughness: 0.1,
      metalness: 0,
      ior: 1.5,
      thickness: 2.2,
      attenuationColor: new THREE.Color(LIME_DEEP),
      attenuationDistance: 1.8,
      envMapIntensity: 1.2,
      flatShading: true,
    });
    // Small opaque accents only — beads and sparkle needles.
    const matSolid = new THREE.MeshPhysicalMaterial({
      color: LIME,
      roughness: 0.18,
      metalness: 0,
      clearcoat: 1,
      clearcoatRoughness: 0.12,
      envMapIntensity: 1.05,
    });

    const materials = [matClear, matLimeGlass, matFrost, matGem, matSolid];
    const geometries: THREE.BufferGeometry[] = [];
    const track = <G extends THREE.BufferGeometry>(g: G): G => {
      geometries.push(g);
      return g;
    };

    /* ----------------------------------- builders ---------------------------------- */

    const root = new THREE.Group();
    scene.add(root);

    const floaters: Floater[] = [];
    /** Hover/tap targets — focus racks to these. */
    const pickables: THREE.Object3D[] = [];

    const place = (
      obj: THREE.Object3D,
      pos: [number, number, number],
      opts: { amp?: number; pick?: boolean; label?: string } = {},
    ) => {
      obj.position.set(...pos);
      obj.userData.baseScale = obj.scale.x;
      obj.userData.label = opts.label;
      obj.scale.setScalar(0.0001); // entrance: grown back in by the stagger below
      root.add(obj);
      floaters.push({
        obj,
        base: obj.position.clone(),
        amp: opts.amp ?? 0.1,
        speed: 0.25 + rng() * 0.35,
        phase: rng() * Math.PI * 2,
        spin: new THREE.Vector3(rng() - 0.5, rng() - 0.5, rng() - 0.5).multiplyScalar(0.18),
        delay: 0.15 + floaters.length * 0.045 + rng() * 0.12,
      });
      if (opts.pick) pickables.push(obj);
      return obj;
    };

    /** Open glass arc with rounded (sphere-capped) ends. */
    const makeArc = (R: number, tube: number, arc: number, material: THREE.Material) => {
      const group = new THREE.Group();
      group.add(new THREE.Mesh(track(new THREE.TorusGeometry(R, tube, 32, 64, arc)), material));
      const cap = track(new THREE.SphereGeometry(tube, 24, 24));
      for (const angle of [0, arc]) {
        const end = new THREE.Mesh(cap, material);
        end.position.set(R * Math.cos(angle), R * Math.sin(angle), 0);
        group.add(end);
      }
      return group;
    };

    /** 8-point crystal star (stretched octahedra fanned in-plane + one through-axis). */
    const makeStar = (size: number, material: THREE.Material) => {
      const group = new THREE.Group();
      const spike = track(new THREE.OctahedronGeometry(1));
      for (let i = 0; i < 4; i++) {
        const long = i % 2 === 0;
        const m = new THREE.Mesh(spike, material);
        m.scale.set(size * 0.13, size * (long ? 1 : 0.62), size * 0.13);
        m.rotation.z = (i * Math.PI) / 4;
        group.add(m);
      }
      const axial = new THREE.Mesh(spike, material);
      axial.scale.set(size * 0.1, size * 0.45, size * 0.1);
      axial.rotation.x = Math.PI / 2;
      group.add(axial);
      return group;
    };

    /** Thin-needle sparkle burst. */
    const makeSparkle = (size: number, material: THREE.Material) => {
      const group = new THREE.Group();
      const needle = track(new THREE.CylinderGeometry(0.014, 0.014, 1, 8));
      for (let i = 0; i < 9; i++) {
        const m = new THREE.Mesh(needle, material);
        m.scale.y = size * (0.5 + rng() * 0.9);
        m.rotation.set(rng() * Math.PI, rng() * Math.PI, rng() * Math.PI);
        group.add(m);
      }
      return group;
    };

    /* --------------------------- composition (mirrors the ref) --------------------------- */

    // Two big translucent discs, overlapping mid-frame.
    const discGeo = track(new THREE.CylinderGeometry(2.4, 2.4, 0.06, 96));
    const discA = new THREE.Mesh(discGeo, matFrost);
    discA.rotation.set(Math.PI / 2 - 0.18, 0, 0.1);
    place(discA, [1.7, 0.7, -2.6], { amp: 0.06, pick: true, label: "disc / frost" });
    const matDiscLime = new THREE.MeshPhysicalMaterial({
      color: 0xcdea6e,
      transmission: 1,
      roughness: 0.22,
      metalness: 0,
      ior: 1.3,
      thickness: 0.4,
      attenuationColor: new THREE.Color(LIME),
      attenuationDistance: 3,
      envMapIntensity: 0.9,
    });
    materials.push(matDiscLime);
    const discB = new THREE.Mesh(discGeo, matDiscLime);
    discB.scale.setScalar(0.82);
    discB.rotation.set(Math.PI / 2 - 0.12, 0, -0.08);
    place(discB, [-0.3, -0.9, -1.1], { amp: 0.06, pick: true, label: "disc / lime" });

    // The hero bubble — clear glass sphere, nearest to camera.
    const bubble = new THREE.Mesh(track(new THREE.SphereGeometry(0.95, 64, 64)), matClear);
    place(bubble, [-1.1, 0.55, 1.2], { amp: 0.12, pick: true, label: "bubble" });
    const bubbleCore = new THREE.Mesh(track(new THREE.SphereGeometry(0.34, 48, 48)), matLimeGlass);
    bubbleCore.position.set(0.12, -0.1, 0);
    bubble.add(bubbleCore);

    // Faceted lime icosahedron, bottom-left.
    const ico = new THREE.Mesh(track(new THREE.IcosahedronGeometry(1.25, 0)), matGem);
    ico.rotation.set(0.4, 0.7, 0.1);
    place(ico, [-2.5, -1.7, 0.1], { amp: 0.08, pick: true, label: "gem" });

    // Glass arch over the bubble + thick lime hook, bottom-right.
    const arch = makeArc(1.15, 0.24, Math.PI * 0.85, matLimeGlass);
    arch.rotation.set(0.15, 0.45, 0.35);
    place(arch, [0.4, 1.5, -0.4], { amp: 0.1, pick: true, label: "arc" });
    const hook = makeArc(1.0, 0.26, Math.PI * 0.75, matLimeGlass);
    hook.rotation.set(0.2, -0.3, Math.PI * 1.05);
    place(hook, [3.1, -1.9, 0.8], { amp: 0.1, pick: true, label: "hook" });

    // Crystal star, upper-left; sparkle needles, lower-left.
    const star = makeStar(1.5, matLimeGlass);
    place(star, [-2.6, 2.3, -1.6], { amp: 0.1, pick: true, label: "star" });
    const sparkle = makeSparkle(1.6, matSolid);
    place(sparkle, [-3.4, -2.6, -1.4], { amp: 0.06 });

    // Big thin glass rings drifting at the edges.
    const ringGeo = track(new THREE.TorusGeometry(2.6, 0.045, 16, 128));
    const ringA = new THREE.Mesh(ringGeo, matClear);
    ringA.rotation.set(0.3, -0.5, 0.2);
    place(ringA, [-3.6, -0.4, -2.4], { amp: 0.05 });
    const ringB = new THREE.Mesh(ringGeo, matClear);
    ringB.scale.setScalar(1.25);
    ringB.rotation.set(-0.4, 0.3, 0);
    place(ringB, [1.4, 0.4, -3.4], { amp: 0.05 });

    // Diagonal rods crossing the frame.
    const rodGeo = track(new THREE.CylinderGeometry(0.07, 0.07, 5.4, 24));
    const rodSpecs: Array<[[number, number, number], [number, number, number], THREE.Material]> = [
      [[-1.2, 1.6, -1.8], [0, 0, 1.25], matSolid],
      [[-2.0, 0.4, -0.6], [0.2, 0, 1.05], matClear],
      [[2.6, 2.2, -2.2], [0, 0, -0.35], matFrost],
    ];
    for (const [pos, rot, mat] of rodSpecs) {
      const rod = new THREE.Mesh(rodGeo, mat);
      rod.rotation.set(...rot);
      place(rod, pos, { amp: 0.07 });
    }

    // Vertical tube cluster on the right, receding into depth.
    const tubeGeo = track(new THREE.CylinderGeometry(0.11, 0.11, 7, 24));
    const tubeSpecs: Array<[number, number, THREE.Material]> = [
      [2.6, -1.6, matClear],
      [3.15, -2.6, matLimeGlass],
      [3.7, -3.6, matClear],
      [4.2, -1.0, matFrost],
    ];
    for (const [x, z, mat] of tubeSpecs) {
      const tube = new THREE.Mesh(tubeGeo, mat);
      place(tube, [x, 0.4, z], { amp: 0.05 });
    }

    // Scattered beads, clear and lime, across all depths.
    const beadGeo = track(new THREE.SphereGeometry(1, 32, 32));
    for (let i = 0; i < 14; i++) {
      const bead = new THREE.Mesh(beadGeo, rng() > 0.45 ? matSolid : matClear);
      bead.scale.setScalar(0.08 + rng() * 0.16);
      place(
        bead,
        [(rng() - 0.5) * 9.5, (rng() - 0.5) * 6, (rng() - 0.5) * 6],
        { amp: 0.14, pick: true, label: "bead" },
      );
    }

    /* --------------------------------- post: real DoF --------------------------------- */

    // MSAA render target — EffectComposer's default target has no multisampling,
    // which leaves visible jaggies on the glass rims.
    const composerTarget = new THREE.WebGLRenderTarget(
      mount.clientWidth,
      mount.clientHeight,
      { samples: 8, type: THREE.HalfFloatType },
    );
    const composer = new EffectComposer(renderer, composerTarget);
    composer.addPass(new RenderPass(scene, camera));
    const bokeh = new BokehPass(scene, camera, {
      focus: camera.position.distanceTo(bubble.position),
      aperture: 0.00028,
      maxblur: 0.012,
    });
    composer.addPass(bokeh);
    composer.addPass(new OutputPass());
    // BokehPass types its uniforms as a bare `object`; narrow once for runtime updates.
    const focusUniform = (bokeh.uniforms as Record<string, THREE.IUniform<number>>).focus;

    /* ---------------------------------- interaction ---------------------------------- */

    // Cursor chip naming whatever the lens is focused on.
    const chip = document.createElement("div");
    chip.style.cssText = [
      "position:absolute",
      "pointer-events:none",
      "padding:4px 10px",
      "border-radius:999px",
      "background:rgba(255,255,255,0.82)",
      "border:1px solid rgba(90,122,18,0.22)",
      "color:#5A7A12",
      "font-size:10px",
      "font-family:ui-monospace,SFMono-Regular,Menlo,monospace",
      "letter-spacing:0.14em",
      "text-transform:uppercase",
      "white-space:nowrap",
      "opacity:0",
      "transition:opacity 0.25s ease",
      "transform:translate(-50%,-170%)",
      "backdrop-filter:blur(4px)",
      "z-index:10",
    ].join(";");
    mount.appendChild(chip);

    const pointer = { x: 0, y: 0 };
    const raycaster = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    let hovered: THREE.Object3D | null = null;
    let focusTarget = camera.position.distanceTo(bubble.position);
    let dollyTarget = camera.position.z;

    const orbit = { x: 0, y: 0, tx: 0, ty: 0 };
    let dragging = false;
    let lastX = 0;
    let lastY = 0;

    const worldPos = new THREE.Vector3();
    /** Walk up from the hit mesh to the object registered in `pickables`. */
    const toPickRoot = (hit: THREE.Object3D): THREE.Object3D | null => {
      let node: THREE.Object3D | null = hit;
      while (node && !pickables.includes(node)) node = node.parent;
      return node;
    };

    const pick = (clientX: number, clientY: number) => {
      const rect = renderer.domElement.getBoundingClientRect();
      ndc.set(
        ((clientX - rect.left) / rect.width) * 2 - 1,
        -((clientY - rect.top) / rect.height) * 2 + 1,
      );
      raycaster.setFromCamera(ndc, camera);
      const hits = raycaster.intersectObjects(pickables, true);
      return hits.length ? toPickRoot(hits[0].object) : null;
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = mount.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      if (dragging) {
        orbit.ty += (e.clientX - lastX) * 0.005;
        orbit.tx += (e.clientY - lastY) * 0.003;
        orbit.tx = THREE.MathUtils.clamp(orbit.tx, -0.5, 0.5);
        lastX = e.clientX;
        lastY = e.clientY;
        chip.style.opacity = "0";
        return;
      }
      hovered = pick(e.clientX, e.clientY);
      mount.style.cursor = hovered ? "pointer" : "grab";
      const label = hovered?.userData.label as string | undefined;
      if (label) {
        chip.textContent = `focus / ${label}`;
        chip.style.left = `${e.clientX - rect.left}px`;
        chip.style.top = `${e.clientY - rect.top}px`;
        chip.style.opacity = "1";
      } else {
        chip.style.opacity = "0";
      }
    };
    const onPointerDown = (e: PointerEvent) => {
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      mount.style.cursor = "grabbing";
      // Tap-to-focus (covers touch, where hover never fires).
      const tapped = pick(e.clientX, e.clientY);
      if (tapped) hovered = tapped;
    };
    const onPointerUp = () => {
      dragging = false;
      mount.style.cursor = hovered ? "pointer" : "grab";
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      dollyTarget = THREE.MathUtils.clamp(dollyTarget + e.deltaY * 0.004, 6.5, 13);
    };

    mount.addEventListener("pointermove", onPointerMove);
    mount.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointerup", onPointerUp);
    // Wheel dollies the camera — disabled when embedded (e.g. the hero
    // decoration) so the page keeps scrolling normally over the canvas.
    if (dolly) mount.addEventListener("wheel", onWheel, { passive: false });
    mount.style.cursor = "grab";
    // Standalone (lab) takes full touch control; embedded (no dolly) lets the
    // page scroll vertically through the canvas while still orbiting on drag.
    mount.style.touchAction = dolly ? "none" : "pan-y";

    const onResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      composer.setSize(w, h);
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(mount);

    /* ------------------------------------ loop ------------------------------------ */

    const clock = new THREE.Clock();
    const scaleTmp = new THREE.Vector3();
    let raf = 0;
    let revealed = false;

    const animate = () => {
      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.elapsedTime;

      const motion = reduceMotion ? 0 : 1;
      for (const f of floaters) {
        f.obj.position.y = f.base.y + Math.sin(t * f.speed + f.phase) * f.amp * motion;
        f.obj.position.x = f.base.x + Math.cos(t * f.speed * 0.8 + f.phase) * f.amp * 0.5 * motion;
        f.obj.rotation.x += f.spin.x * dt * motion;
        f.obj.rotation.y += f.spin.y * dt * motion;
        // Entrance pop (staggered easeOutBack), then hover swell.
        const intro = reduceMotion ? 1 : THREE.MathUtils.clamp((t - f.delay) / 0.9, 0, 1);
        const target =
          f.obj.userData.baseScale * easeOutBack(intro) * (f.obj === hovered ? 1.12 : 1);
        f.obj.scale.lerp(scaleTmp.setScalar(Math.max(target, 0.0001)), intro < 1 ? 0.4 : 0.1);
      }

      // Idle drift + slow auto-rotate when the user isn't steering.
      if (!dragging && !reduceMotion) orbit.ty += dt * 0.02;
      orbit.x += (orbit.tx - orbit.x) * 0.06;
      orbit.y += (orbit.ty - orbit.y) * 0.06;
      root.rotation.x = orbit.x;
      root.rotation.y = orbit.y;

      // Camera: pointer parallax + wheel dolly.
      camera.position.x += (pointer.x * 0.55 - camera.position.x) * 0.04;
      camera.position.y += (-pointer.y * 0.4 - camera.position.y) * 0.04;
      camera.position.z += (dollyTarget - camera.position.z) * 0.06;
      camera.lookAt(0, 0, 0);

      // Rack focus toward the hovered object's true depth, else back to the bubble.
      const subject = hovered ?? bubble;
      subject.getWorldPosition(worldPos);
      const want = camera.position.distanceTo(worldPos);
      focusTarget += (want - focusTarget) * 0.07;
      focusUniform.value = focusTarget;

      composer.render();
      if (!revealed) {
        revealed = true;
        renderer.domElement.style.opacity = "1";
      }
      raf = requestAnimationFrame(animate);
    };
    const startLoop = () => {
      if (raf) return;
      clock.getDelta(); // discard time accumulated while paused
      raf = requestAnimationFrame(animate);
    };
    const stopLoop = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };
    startLoop();

    // Pause the (expensive bokeh) pipeline whenever the field scrolls offscreen.
    const visibilityIO = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? startLoop() : stopLoop()),
      { threshold: 0 },
    );
    visibilityIO.observe(mount);

    return () => {
      cancelAnimationFrame(raf);
      visibilityIO.disconnect();
      ro.disconnect();
      mount.removeEventListener("pointermove", onPointerMove);
      mount.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      mount.removeEventListener("wheel", onWheel);
      composer.dispose();
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      envTexture.dispose();
      bgTexture.dispose();
      pmrem.dispose();
      renderer.dispose();
      mount.removeChild(chip);
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0" aria-hidden />;
}
