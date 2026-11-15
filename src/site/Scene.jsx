import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import Avatar from "./models/Avatar";
import { Pedestal, Padlock, Laptop, SkillOrbit, ServerRack, Stairs, Mail, ACCENT } from "./models/Props";
import { codeTexture } from "./models/textures";
import { SECTION_IDS } from "./sections";

const SPACING = 9; // world units between section objects (≈ one screen height)
const SIDES = [1, -1, 1, -1, 1, -1]; // which side of the screen each object sits on (desktop)

// How far down the page we are, as a smooth "section index":
// 0 = hero, 1 = about … A section counts as fully reached once its top passes 25% of the screen,
// and the camera holds there (sticky) while you read the rest of it.
function sectionProgress() {
  const vh = window.innerHeight;
  let f = 0;
  for (let i = 1; i < SECTION_IDS.length; i++) {
    const el = document.getElementById(SECTION_IDS[i]);
    if (!el) continue;
    const top = el.getBoundingClientRect().top;
    f += Math.min(1, Math.max(0, (vh * 0.75 - top) / (vh * 0.5)));
  }
  return f;
}

function FloatingCode(props) {
  const tex = useMemo(() => codeTexture(), []);
  const ref = useRef();
  useFrame((s) => (ref.current.position.y = props.position[1] + Math.sin(s.clock.elapsedTime * 1.1) * 0.1));
  return (
    <group ref={ref} {...props}>
      <mesh position={[0, 0, -0.03]}>
        <planeGeometry args={[2.06, 1.36]} />
        <meshBasicMaterial color="#e7e5e4" />
      </mesh>
      <mesh>
        <planeGeometry args={[2, 1.3]} />
        <meshBasicMaterial map={tex} toneMapped={false} />
      </mesh>
    </group>
  );
}

// Mini decorative shapes floating around the hero
function Confetti() {
  const g = useRef();
  const items = useMemo(
    () => [
      { p: [-2.6, 2.8, -1], c: ACCENT, s: 0.18, kind: "ico" },
      { p: [2.4, 3.4, -0.5], c: "#38bdf8", s: 0.14, kind: "box" },
      { p: [2.7, 0.6, 0.5], c: "#f59e0b", s: 0.12, kind: "ico" },
      { p: [-2.2, 0.2, 0.6], c: "#f43f5e", s: 0.1, kind: "box" },
    ],
    []
  );
  useFrame((s) => {
    g.current.children.forEach((m, i) => {
      m.rotation.x = s.clock.elapsedTime * (0.6 + i * 0.2);
      m.rotation.y = s.clock.elapsedTime * (0.4 + i * 0.1);
      m.position.y = items[i].p[1] + Math.sin(s.clock.elapsedTime + i) * 0.15;
    });
  });
  return (
    <group ref={g}>
      {items.map((it, i) => (
        <mesh key={i} position={it.p}>
          {it.kind === "ico" ? <icosahedronGeometry args={[it.s * 1.4, 0]} /> : <boxGeometry args={[it.s * 2, it.s * 2, it.s * 2]} />}
          <meshStandardMaterial color={it.c} flatShading roughness={0.4} />
        </mesh>
      ))}
    </group>
  );
}

function Rig({ mouse }) {
  const { camera, size } = useThree();
  const y = useRef(0);
  const groups = useRef([]);
  const light = useRef();
  const mobile = size.width < 768;

  useFrame((_, dt) => {
    const f = sectionProgress();
    const targetY = -f * SPACING - (mobile ? 2.3 : 0);
    y.current += (targetY - y.current) * Math.min(1, dt * 5);
    camera.position.set(mouse.current.x * 0.35, y.current - mouse.current.y * 0.25, 14);
    camera.lookAt(0, y.current, 0);
    // the sun travels with the camera so every section gets soft shadows
    light.current.position.set(6, y.current + 10, 8);
    light.current.target.position.set(0, y.current, 0);
    light.current.target.updateMatrixWorld();

    // each object pops in (grows + spins into place) as its section arrives,
    // shrinks away as you leave, and turns gently towards the cursor
    const k = Math.min(1, dt * 4);
    groups.current.forEach((g, i) => {
      if (!g) return;
      const near = Math.max(0, 1 - Math.abs(f - i) * 1.25);
      const ease = near * near * (3 - 2 * near); // smoothstep
      const spin = (1 - ease) * 1.6 * SIDES[i];
      g.rotation.y += (mouse.current.x * 0.35 + spin - g.rotation.y) * k;
      g.rotation.x += (mouse.current.y * 0.08 - g.rotation.x) * k;
      const sc = 0.45 + 0.55 * ease;
      g.scale.setScalar(g.scale.x + (sc - g.scale.x) * k);
    });
  });

  const X = mobile ? 0 : Math.min(4, (size.width / size.height) * 2.1);
  const s = mobile ? 0.72 : 1;
  const at = (i, dy = 0) => [SIDES[i] * X, -i * SPACING + dy, 0];
  const keep = (i) => (el) => (groups.current[i] = el);

  return (
    <>
      <directionalLight
        ref={light}
        intensity={1.6}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0005}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-camera-far={60}
      />

      {/* floating dust through the whole scroll column */}
      <Sparkles
        count={mobile ? 50 : 110}
        scale={[mobile ? 8 : 18, SPACING * 6 + 6, 8]}
        position={[0, -SPACING * 2.5, -2]}
        size={3}
        speed={0.25}
        opacity={0.55}
        color={ACCENT}
      />
      <Sparkles count={mobile ? 30 : 60} scale={[mobile ? 8 : 18, SPACING * 6 + 6, 8]} position={[0, -SPACING * 2.5, -1]} size={2.2} speed={0.2} opacity={0.45} color="#38bdf8" />

      {/* 0 · hero: mini-me waving on a stage, with the security padlock */}
      <group position={at(0, -1.2)} scale={s}>
        <group ref={keep(0)}>
          <Pedestal />
          <Avatar pose="wave" mouse={mouse} position={[0, 0, 0]} scale={1.15} />
          <Padlock position={[-1.75, 1.9, 0.3]} scale={0.85} />
          <Confetti />
        </group>
      </group>

      {/* 1 · about: coding at a standing desk */}
      <group position={at(1, -1.4)} scale={s}>
        <group ref={keep(1)}>
          {/* turned 3/4 so his face shows beside the laptop lid */}
          <group rotation-y={-0.6}>
            <Laptop />
            <Avatar pose="type" mouse={mouse} position={[0, 0, -0.95]} />
          </group>
          <FloatingCode position={[-1.6, 2.9, -1.2]} rotation={[0, 0.35, 0]} />
        </group>
      </group>

      {/* 2 · skills */}
      <group position={at(2, 0)} scale={s * 1.05}>
        <group ref={keep(2)}>
          <SkillOrbit />
        </group>
      </group>

      {/* 3 · projects */}
      <group position={at(3, -1.7)} scale={s}>
        <group ref={keep(3)}>
          <ServerRack />
        </group>
      </group>

      {/* 4 · experience */}
      <group position={at(4, -1)} scale={s}>
        <group ref={keep(4)}>
          <Stairs />
        </group>
      </group>

      {/* 5 · contact */}
      <group position={at(5, 0)} scale={s}>
        <group ref={keep(5)}>
          <Mail />
        </group>
      </group>
    </>
  );
}

export default function Scene() {
  const mouse = useRef({ x: 0, y: 0 });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const onMove = (e) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <div
      aria-hidden
      className={`fixed inset-0 z-0 pointer-events-none transition-opacity duration-700 ${ready ? "opacity-100" : "opacity-0"}`}
    >
      <Canvas
        shadows
        dpr={[1, 1.75]}
        camera={{ position: [0, 0, 14], fov: 35, near: 0.1, far: 100 }}
        gl={{ antialias: true, alpha: true }}
        onCreated={() => setReady(true)}
      >
        <ambientLight intensity={0.55} />
        <hemisphereLight args={["#ffffff", "#e7e5e4", 0.6]} />
        <Rig mouse={mouse} />
      </Canvas>
    </div>
  );
}
