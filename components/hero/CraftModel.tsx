"use client";

/**
 * CraftModel — the interactive 3D specimen shown in the hero's "craft" window.
 *
 * Behaviour (per the brief): the model auto-rotates on a slow turntable, stops
 * spinning while the cursor is over it, and can be dragged to orbit freely.
 * Drag / auto-rotate / damping come from OrbitControls; zoom + pan are disabled
 * so it stays a clean turntable.
 *
 * The .glb is large, so it is fetched lazily — only the first time the craft
 * channel becomes active — and cached at module scope so it is never re-fetched
 * or re-parsed. The render loop idles (no draw calls) whenever the channel is
 * not the one on screen.
 */

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

const MODEL_URL = "/assets/hero/faa452401f84d0bff390b12ca796c826.glb";

// Module-scope cache so React strict-mode remounts / channel re-entry never
// re-fetch the (large) model. Only one CraftModel is ever live at a time, so a
// single shared scene graph is safe to reuse across mounts.
let cachedScene: THREE.Group | null = null;
let modelPromise: Promise<THREE.Group> | null = null;

function loadModel(onProgress?: (frac: number) => void): Promise<THREE.Group> {
  if (cachedScene) return Promise.resolve(cachedScene);
  if (!modelPromise) {
    modelPromise = new Promise<THREE.Group>((resolve, reject) => {
      new GLTFLoader().load(
        MODEL_URL,
        (gltf) => {
          cachedScene = gltf.scene;
          resolve(gltf.scene);
        },
        (evt) => {
          if (evt.total > 0) onProgress?.(evt.loaded / evt.total);
        },
        (err) => {
          modelPromise = null; // allow a retry on a later mount
          reject(err);
        },
      );
    });
  }
  return modelPromise;
}

export function CraftModel({
  reduced,
  active,
  onInteract,
  zoom = 1,
}: {
  /** prefers-reduced-motion — suppresses the auto-rotate (drag still works). */
  reduced: boolean;
  /** Whether the craft channel is the one currently on screen. Gates loading
   *  and the render loop so off-screen channels cost nothing. */
  active: boolean;
  /** Called when the user grabs the model, so the hero can lock the craft
   *  channel (stop auto-cycling away mid-drag). */
  onInteract?: () => void;
  /** Multiplier on the fitted model size (1 = default; 2 = twice as large). */
  zoom?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [progress, setProgress] = useState(0);

  // Latest props read inside the rAF loop without re-running the setup effect.
  const activeRef = useRef(active);
  const reducedRef = useRef(reduced);
  const hoverRef = useRef(false);
  const onInteractRef = useRef(onInteract);
  useEffect(() => {
    activeRef.current = active;
  }, [active]);
  useEffect(() => {
    reducedRef.current = reduced;
  }, [reduced]);
  useEffect(() => {
    onInteractRef.current = onInteract;
  }, [onInteract]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let disposed = false;
    const w0 = container.clientWidth || 1;
    const h0 = container.clientHeight || 1;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, w0 / h0, 0.1, 100);
    camera.position.set(0, 0, 3.0);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w0, h0);
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.domElement.style.touchAction = "none"; // let OrbitControls own touch drags
    container.appendChild(renderer.domElement);

    // Image-based lighting so PBR materials read well, plus soft key/fill.
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envRT.texture;

    const hemi = new THREE.HemisphereLight(0xffffff, 0xbcc4a4, 0.55);
    scene.add(hemi);
    const key = new THREE.DirectionalLight(0xffffff, 1.5);
    key.position.set(2.5, 3, 2.5);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xe9ff8c, 0.45); // faint lime fill
    fill.position.set(-3, -1.5, 2);
    scene.add(fill);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0, 0);
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.rotateSpeed = 0.9;
    controls.autoRotateSpeed = 0.5;
    controls.autoRotate = !reducedRef.current;

    const onEnter = () => {
      hoverRef.current = true;
    };
    const onLeave = () => {
      hoverRef.current = false;
    };
    const onDown = () => onInteractRef.current?.();
    renderer.domElement.addEventListener("pointerenter", onEnter);
    renderer.domElement.addEventListener("pointerleave", onLeave);
    renderer.domElement.addEventListener("pointerdown", onDown);

    let raf = 0;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      if (!activeRef.current) return; // idle while another channel is on screen
      // Spin only when allowed and the cursor is away; dragging always works.
      controls.autoRotate = !reducedRef.current && !hoverRef.current;
      controls.update();
      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(animate);

    const ro = new ResizeObserver(() => {
      const w = container.clientWidth || 1;
      const h = container.clientHeight || 1;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    ro.observe(container);

    // Lazily fetch the model the first time the craft channel is shown.
    let started = false;
    let pollId = 0;
    const maybeLoad = () => {
      if (disposed) return;
      if (!started && (activeRef.current || cachedScene)) {
        started = true;
        setPhase((p) => (p === "idle" ? "loading" : p));
        loadModel((frac) => {
          if (!disposed) setProgress(frac);
        })
          .then((src) => {
            if (disposed) return;
            // Fit: scale to a consistent size FIRST, then recenter using the
            // scaled bounds so the model's true center lands on the origin
            // (centering before scaling drifts off-center when the model's
            // pivot isn't its bbox center).
            const pre = new THREE.Box3().setFromObject(src);
            const preSize = pre.getSize(new THREE.Vector3());
            const maxDim = Math.max(preSize.x, preSize.y, preSize.z) || 1;
            src.scale.setScalar((3.5 * zoom) / maxDim);
            const box = new THREE.Box3().setFromObject(src);
            const center = box.getCenter(new THREE.Vector3());
            src.position.sub(center);
            src.position.y -= 0.12;
            // Oblique spin: tilt the model so the slow turntable reads as a
            // canted axis rather than a flat horizontal spin.
            src.rotation.z = -0.32;
            src.rotation.x = 0.16;
            scene.add(src);
            setPhase("ready");
          })
          .catch((err) => {
            console.error("[CraftModel] failed to load", err);
            if (!disposed) setPhase("error");
          });
        return;
      }
      if (!started) pollId = window.setTimeout(maybeLoad, 200);
    };
    maybeLoad();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.clearTimeout(pollId);
      ro.disconnect();
      renderer.domElement.removeEventListener("pointerenter", onEnter);
      renderer.domElement.removeEventListener("pointerleave", onLeave);
      renderer.domElement.removeEventListener("pointerdown", onDown);
      controls.dispose();
      // Detach (but DON'T dispose) the cached model so it survives remounts.
      if (cachedScene && cachedScene.parent === scene) scene.remove(cachedScene);
      hemi.dispose();
      key.dispose();
      fill.dispose();
      envRT.dispose();
      pmrem.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative h-full w-full">
      <div
        ref={containerRef}
        className="h-full w-full cursor-grab active:cursor-grabbing"
        style={{ touchAction: "none" }}
      />

      {/* Loading / error overlay — sits above the (empty) canvas until ready. */}
      {phase !== "ready" ? (
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          {phase === "error" ? (
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-textSecondary/70">
              couldn’t load 3D
            </span>
          ) : phase === "loading" ? (
            <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-textSecondary/70">
              <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-nltLime border-t-transparent" />
              loading 3D{progress > 0 ? ` · ${Math.round(progress * 100)}%` : ""}
            </span>
          ) : null}
        </div>
      ) : (
        // Subtle "drag to rotate" affordance once the model is interactive.
        <span className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 font-mono text-[9px] uppercase tracking-[0.18em] text-textSecondary/55">
          drag to rotate
        </span>
      )}
    </div>
  );
}
