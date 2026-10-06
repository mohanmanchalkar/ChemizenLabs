"use client";
import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw, MoveUpRight } from "lucide-react";
export function ProteinViewer() {
  const host = useRef<HTMLDivElement>(null);
  const labels = useRef<(HTMLSpanElement | null)[]>([]);
  const pauseRef = useRef(false);
  const resetRef = useRef<() => void>(() => {});
  const [paused, setPaused] = useState(false);
  const [state, setState] = useState<"loading" | "ready" | "fallback">(
    "loading",
  );
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let disposed = false;
    let stopped = false;
    let cleanup = () => {};
    let visible = false;
    let started = false;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    pauseRef.current = reduced.matches;
    setPaused(reduced.matches);
    const onMotion = () => {
      pauseRef.current = reduced.matches;
      setPaused(reduced.matches);
    };
    reduced.addEventListener("change", onMotion);
    async function init() {
      try {
        const [T, { GLTFLoader }, { OrbitControls }] = await Promise.all([
          import("three"),
          import("three/addons/loaders/GLTFLoader.js"),
          import("three/addons/controls/OrbitControls.js"),
        ]);
        if (disposed) return;
        const renderer = new T.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));
        renderer.setClearColor(0, 0);
        el!.appendChild(renderer.domElement);
        renderer.domElement.setAttribute(
          "aria-label",
          "Interactive protein model. Drag or use the arrow keys to rotate.",
        );
        renderer.domElement.setAttribute("role", "img");
        const scene = new T.Scene();
        const camera = new T.PerspectiveCamera(36, 1, 0.1, 100);
        camera.position.set(0, 0.2, 6.5);
        const controls = new OrbitControls(camera, renderer.domElement);
        renderer.domElement.tabIndex = 0;
        renderer.domElement.style.touchAction = "pan-y";
        const onKey = (event: KeyboardEvent) => {
          if (
            !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(
              event.key,
            )
          )
            return;
          event.preventDefault();
          const orbit = new T.Spherical().setFromVector3(
            camera.position.clone().sub(controls.target),
          );
          if (event.key === "ArrowLeft") orbit.theta -= 0.12;
          if (event.key === "ArrowRight") orbit.theta += 0.12;
          if (event.key === "ArrowUp") orbit.phi -= 0.12;
          if (event.key === "ArrowDown") orbit.phi += 0.12;
          orbit.makeSafe();
          camera.position.setFromSpherical(orbit).add(controls.target);
          controls.update();
        };
        renderer.domElement.addEventListener("keydown", onKey);
        controls.enablePan = false;
        controls.enableZoom = false;
        controls.enableDamping = true;
        controls.autoRotateSpeed = 0.55;
        controls.saveState();
        resetRef.current = () => controls.reset();
        scene.add(new T.HemisphereLight(0xffffff, 0x494139, 3));
        const key = new T.DirectionalLight(0xffe6cf, 4);
        key.position.set(3, 5, 4);
        scene.add(key);
        const rim = new T.DirectionalLight(0xffffff, 2);
        rim.position.set(-3, 1, -2);
        scene.add(rim);
        let frame = 0;
        let model: import("three").Group | undefined;
        const resize = new ResizeObserver(() => {
          const w = el!.clientWidth,
            h = el!.clientHeight;
          renderer.setSize(w, h);
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
        });
        resize.observe(el!);
        const onLost = (e: Event) => {
          e.preventDefault();
          cleanup();
          setState("fallback");
        };
        renderer.domElement.addEventListener("webglcontextlost", onLost);
        cleanup = () => {
          if (stopped) return;
          stopped = true;
          cancelAnimationFrame(frame);
          resize.disconnect();
          controls.dispose();
          renderer.domElement.removeEventListener("webglcontextlost", onLost);
          renderer.domElement.removeEventListener("keydown", onKey);
          scene.traverse((o) => {
            if (o instanceof T.Mesh) {
              o.geometry.dispose();
              const materials = Array.isArray(o.material)
                ? o.material
                : [o.material];
              materials.forEach((m) => m.dispose());
            }
          });
          renderer.dispose();
          renderer.domElement.remove();
        };
        const gltf = await new GLTFLoader().loadAsync("/models/protein.glb");
        if (disposed || stopped) {
          gltf.scene.traverse((o) => {
            if (o instanceof T.Mesh) {
              o.geometry.dispose();
              (Array.isArray(o.material) ? o.material : [o.material]).forEach(
                (m) => m.dispose(),
              );
            }
          });
          return;
        }
        model = gltf.scene;
        const bounds = new T.Box3().setFromObject(model),
          center = bounds.getCenter(new T.Vector3()),
          size = bounds.getSize(new T.Vector3());
        const scale = 3.7 / Math.max(size.x, size.y, size.z);
        model.position.copy(center).multiplyScalar(-scale);
        model.scale.setScalar(scale);
        const group = new T.Group();
        group.add(model);
        scene.add(group);
        group.updateMatrixWorld(true);
        const targets = [
          new T.Vector3(-1, 0.6, 0.5),
          new T.Vector3(0.8, -0.6, 0.7),
        ];
        const points = targets.map((target) => {
          let best = new T.Vector3(),
            distance = Infinity;
          model!.traverse((o) => {
            if (!(o instanceof T.Mesh)) return;
            const attr = o.geometry.getAttribute("position");
            for (let i = 0; i < attr.count; i += 3) {
              const p = new T.Vector3()
                .fromBufferAttribute(attr, i)
                .applyMatrix4(o.matrixWorld);
              const d = p.distanceToSquared(target);
              if (d < distance) {
                distance = d;
                best = p;
              }
            }
          });
          return best;
        });
        const ray = new T.Raycaster();
        const projected = new T.Vector3();
        const direction = new T.Vector3();
        let lastLabels = 0;
        let lastTime = 0;
        function animate(time: number) {
          if (disposed || stopped) return;
          frame = requestAnimationFrame(animate);
          const delta = lastTime ? Math.min((time - lastTime) / 1000, 0.05) : 0;
          lastTime = time;
          if (!visible || document.hidden) return;
          controls.autoRotate = !pauseRef.current;
          controls.update(delta);
          if (time - lastLabels > 120) {
            lastLabels = time;
            points.forEach((p, i) => {
              const label = labels.current[i];
              if (!label) return;
              projected.copy(p).project(camera);
              direction.copy(p).sub(camera.position);
              const distance = direction.length();
              ray.set(camera.position, direction.normalize());
              const hit = ray.intersectObject(group, true)[0];
              const hidden =
                (hit && hit.distance < distance - 0.055) ||
                projected.z > 1 ||
                Math.abs(projected.x) > 0.94 ||
                Math.abs(projected.y) > 0.85;
              label.style.opacity = hidden ? "0" : "1";
              label.style.left = `${(projected.x * 0.5 + 0.5) * 100}%`;
              label.style.top = `${(-projected.y * 0.5 + 0.5) * 100}%`;
            });
          }
          renderer.render(scene, camera);
        }
        setState("ready");
        frame = requestAnimationFrame(animate);
      } catch {
        if (!disposed) {
          cleanup();
          setState("fallback");
        }
      }
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible && !started) {
          started = true;
          void init();
        }
      },
      { rootMargin: "120px" },
    );
    observer.observe(el);
    return () => {
      disposed = true;
      observer.disconnect();
      reduced.removeEventListener("change", onMotion);
      cleanup();
    };
  }, []);
  return (
    <div className="protein-stage">
      <div className="protein-caption">
        <span className="eyebrow">EXPLORE A PROTEIN IN 3D</span>
        <MoveUpRight size={17} />
      </div>
      <div ref={host} className="protein-canvas">
        {state !== "ready" && (
          <div className="protein-fallback">
            <img
              src="/models/protein-poster.svg"
              alt="Static illustration of the supplied protein geometry"
            />
            <span>
              {state === "loading"
                ? "Preparing a closer look…"
                : "Protein structure · static view"}
            </span>
          </div>
        )}
        {state === "ready" &&
          ["Molecular surface", "Folded structure"].map((label, i) => (
            <span
              key={label}
              className="protein-label"
              ref={(el) => {
                labels.current[i] = el;
              }}
            >
              {label}
            </span>
          ))}
      </div>
      <div className="protein-controls">
        <span>
          {state === "ready" ? "DRAG TO EXPLORE" : "STRUCTURE, MADE VISIBLE"}
        </span>
        <div>
          <button
            className="icon-button"
            disabled={state !== "ready"}
            aria-label={
              paused ? "Resume protein rotation" : "Pause protein rotation"
            }
            onClick={() => {
              pauseRef.current = !paused;
              setPaused(!paused);
            }}
          >
            {paused ? <Play size={15} /> : <Pause size={15} />}
          </button>
          <button
            className="icon-button"
            disabled={state !== "ready"}
            aria-label="Reset protein view"
            onClick={() => resetRef.current()}
          >
            <RotateCcw size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
