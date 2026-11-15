import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import * as THREE from "three";
import Avatar from "./models/Avatar";
import GLBAvatar, { AvatarBoundary } from "./models/GLBAvatar";
import { Padlock, Laptop, SkillOrbit, ServerRack, Stairs, Mail, ACCENT } from "./models/Props";
import { PATH, frameAt } from "./path";
import { STOP_U, STOPS, journey, journeyAt, AVATAR_URL } from "./timeline";
import { skyAt } from "./sky";
import { SECTION_IDS } from "./sections";

const BG = "#fafaf9";
const GROUND = "#efece6";

function rng(seed) {
  return () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
}

// Points along the path, used to keep trees off it
const PATH_SAMPLES = PATH.getSpacedPoints(300);
const distToPath = (x, z) => Math.min(...PATH_SAMPLES.map((p) => Math.hypot(p.x - x, p.z - z)));
// The strip between the path and the camera (which stands to the path's right) must stay clear of trees
const CAMERA_SIDE = PATH.getSpacedPoints(120).flatMap((p, i, arr) => {
  const t = PATH.getTangentAt(Math.min(0.999, i / (arr.length - 1)));
  return [2, 4, 6, 8, 10, 12].map((k) => [p.x - t.z * k, p.z + t.x * k]);
});
const blocksCamera = (x, z) => CAMERA_SIDE.some(([cx, cz]) => Math.hypot(cx - x, cz - z) < 2.4);

// Where each stop's object stands: beside the path, on the far side from the camera
const STOP_FRAMES = STOP_U.map((u) => frameAt(u, {}));
const PROP_SIDE = 3.6;
const propSpot = (i) => {
  const { p, r } = STOP_FRAMES[i];
  return [p.x - r.x * PROP_SIDE, 0, p.z - r.z * PROP_SIDE];
};
const propTurn = (i) => Math.atan2(STOP_FRAMES[i].r.x, STOP_FRAMES[i].r.z); // face the camera side

// ---------- ground + path ----------
function Ground() {
  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, -0.01, -24]} receiveShadow>
      <circleGeometry args={[90, 64]} />
      <meshStandardMaterial color={GROUND} roughness={1} />
    </mesh>
  );
}

function PathRibbon() {
  const geo = useMemo(() => {
    const pts = PATH.getSpacedPoints(400);
    const pos = [];
    const idx = [];
    const w = 1.15;
    pts.forEach((p, i) => {
      const t = PATH.getTangentAt(Math.min(0.999, i / (pts.length - 1)));
      const rx = -t.z;
      const rz = t.x;
      pos.push(p.x - rx * w, 0.02, p.z - rz * w, p.x + rx * w, 0.02, p.z + rz * w);
      if (i > 0) {
        const a = (i - 1) * 2;
        idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      }
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  }, []);
  return (
    <mesh geometry={geo} receiveShadow>
      <meshStandardMaterial color="#ffffff" roughness={0.9} side={THREE.DoubleSide} />
    </mesh>
  );
}

// little emerald ring on the path at every stop
function StopMarkers() {
  const refs = useRef([]);
  useFrame((s) => refs.current.forEach((m, i) => m && (m.material.opacity = 0.55 + Math.sin(s.clock.elapsedTime * 2 + i) * 0.25)));
  return STOP_FRAMES.map(({ p }, i) => (
    <mesh key={i} ref={(el) => (refs.current[i] = el)} position={[p.x, 0.035, p.z]} rotation-x={-Math.PI / 2}>
      <ringGeometry args={[0.85, 1.0, 48]} />
      <meshBasicMaterial color={ACCENT} transparent opacity={0.6} />
    </mesh>
  ));
}

// ---------- scenery ----------
function Tree({ p, s, kind }) {
  return (
    <group position={p} scale={s}>
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.14, 1, 6]} />
        <meshStandardMaterial color="#a8a29e" />
      </mesh>
      {kind === 0 ? (
        <mesh position={[0, 1.55, 0]} castShadow>
          <icosahedronGeometry args={[0.85, 0]} />
          <meshStandardMaterial color="#a7d7b8" flatShading roughness={0.9} />
        </mesh>
      ) : kind === 1 ? (
        <mesh position={[0, 1.6, 0]} castShadow>
          <coneGeometry args={[0.75, 1.9, 7]} />
          <meshStandardMaterial color="#86c5a0" flatShading roughness={0.9} />
        </mesh>
      ) : (
        <mesh position={[0, 1.45, 0]} castShadow>
          <sphereGeometry args={[0.75, 10, 8]} />
          <meshStandardMaterial color="#c7e6d2" flatShading roughness={0.9} />
        </mesh>
      )}
    </group>
  );
}

function Scenery() {
  const items = useMemo(() => {
    const r = rng(21);
    const props = STOP_U.map((_, i) => propSpot(i));
    const out = [];
    let tries = 0;
    while (out.length < 90 && tries++ < 3000) {
      const x = (r() * 2 - 1) * 26;
      const z = 6 - r() * 62;
      if (distToPath(x, z) < 3.2 || blocksCamera(x, z)) continue;
      if (props.some(([px, , pz]) => Math.hypot(px - x, pz - z) < 5)) continue;
      out.push({ x, z, s: 0.7 + r() * 0.7, kind: Math.floor(r() * 3), rock: r() > 0.8 });
    }
    return out;
  }, []);
  return items.map((it, i) =>
    it.rock ? (
      <mesh key={i} position={[it.x, 0.18 * it.s, it.z]} scale={it.s} castShadow>
        <dodecahedronGeometry args={[0.35, 0]} />
        <meshStandardMaterial color="#d6d3d1" flatShading />
      </mesh>
    ) : (
      <Tree key={i} p={[it.x, 0, it.z]} s={it.s} kind={it.kind} />
    )
  );
}

// ---------- the stops ----------
function Stops() {
  const at = (i, y = 0) => {
    const [x, , z] = propSpot(i);
    return [x, y, z];
  };
  return (
    <>
      <group position={at(0, 1.2)} rotation-y={propTurn(0)}>
        <Padlock scale={1.3} />
      </group>
      <group position={at(1)} rotation-y={propTurn(1) + 0.5}>
        <Laptop />
      </group>
      <group position={at(2, 2.3)} rotation-y={propTurn(2)}>
        <SkillOrbit scale={0.9} />
      </group>
      <group position={at(3)} rotation-y={propTurn(3) + 0.3}>
        <ServerRack />
      </group>
      <group position={at(4, 0.4)} rotation-y={propTurn(4)}>
        <Stairs />
      </group>
      <group position={at(5, 1.6)} rotation-y={propTurn(5)}>
        <Mail />
      </group>
    </>
  );
}

// ---------- wooden trail signs at each stop ----------
const SIGN_TEXT = { hero: "START", about: "ABOUT", skills: "SKILLS", projects: "PROJECTS", experience: "EXPERIENCE", contact: "CONTACT" };

function signTexture(label, n) {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 200;
  const g = c.getContext("2d");
  g.fillStyle = "#c69c6d";
  g.fillRect(0, 0, 512, 200);
  g.fillStyle = "rgba(0,0,0,0.06)"; // wood grain
  for (let y = 12; y < 200; y += 22) g.fillRect(0, y, 512, 3);
  g.strokeStyle = "#8b6a47";
  g.lineWidth = 10;
  g.strokeRect(5, 5, 502, 190);
  g.fillStyle = "#3f2d1c";
  g.textAlign = "center";
  g.font = "600 30px Inter, system-ui, sans-serif";
  g.fillText(n === 0 ? "WELCOME" : `0${n}`, 256, 62);
  g.font = "700 74px Inter, system-ui, sans-serif";
  g.fillText(label, 256, 150);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function Signposts() {
  // draw the signs once the web font has loaded so they use Inter
  const [fontsReady, setFontsReady] = useState(false);
  useEffect(() => {
    let alive = true;
    (document.fonts?.ready ?? Promise.resolve()).then(() => alive && setFontsReady(true));
    return () => {
      alive = false;
    };
  }, []);
  const signs = useMemo(
    () =>
      STOP_FRAMES.map(({ p, t, r }, i) => ({
        // just before the stop, on the far edge of the path
        pos: [p.x - t.x * 2.2 - r.x * 1.9, 0, p.z - t.z * 2.2 - r.z * 1.9],
        turn: Math.atan2(r.x, r.z) - 0.35,
        tex: signTexture(SIGN_TEXT[SECTION_IDS[i]], i),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fontsReady]
  );
  return signs.map((s, i) => (
    <group key={i} position={s.pos} rotation-y={s.turn}>
      <mesh position={[0, 0.75, 0]} castShadow>
        <boxGeometry args={[0.12, 1.5, 0.12]} />
        <meshStandardMaterial color="#8b6a47" />
      </mesh>
      <mesh position={[0, 1.55, 0.07]} castShadow>
        <boxGeometry args={[1.5, 0.6, 0.06]} />
        <meshStandardMaterial color="#b88b5c" />
      </mesh>
      <mesh position={[0, 1.55, 0.102]}>
        <planeGeometry args={[1.46, 0.57]} />
        <meshStandardMaterial map={s.tex} roughness={0.9} />
      </mesh>
    </group>
  ));
}

// ---------- little dust puffs at his feet while walking ----------
const PUFFS = 14;
function Dust({ walker }) {
  const meshes = useRef([]);
  const state = useMemo(() => Array.from({ length: PUFFS }, () => ({ life: 0, x: 0, z: 0 })), []);
  const timer = useRef(0);
  const next = useRef(0);
  const frame = useRef({});
  useFrame((_, dt) => {
    const w = walker.current;
    timer.current += dt;
    if (w.speed > 0.6 && timer.current > 0.16) {
      timer.current = 0;
      const { p, r } = frameAt(w.u, frame.current);
      const side = next.current % 2 ? 0.18 : -0.18; // alternate feet
      Object.assign(state[next.current], { life: 1, x: p.x + r.x * side, z: p.z + r.z * side });
      next.current = (next.current + 1) % PUFFS;
    }
    state.forEach((d, i) => {
      const m = meshes.current[i];
      if (!m) return;
      d.life = Math.max(0, d.life - dt * 1.6);
      m.visible = d.life > 0;
      if (!m.visible) return;
      const k = 1 - d.life;
      m.position.set(d.x, 0.12 + k * 0.35, d.z);
      m.scale.setScalar(0.12 + k * 0.3);
      m.material.opacity = d.life * 0.45;
    });
  });
  return state.map((_, i) => (
    <mesh key={i} ref={(el) => (meshes.current[i] = el)} visible={false}>
      <icosahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color="#e7e0d4" transparent opacity={0} depthWrite={false} flatShading />
    </mesh>
  ));
}

// ---------- mini-me walking the path ----------
const PATH_LEN = PATH.getLength();
const STOP_GAP = PATH_LEN / (STOPS - 1); // distance between two stops
const WALK_SPEED = 2.8; // units per second (~5 s between stops)
const WALK_ACCEL = 2.2; // how gently he speeds up / slows down
function useHasAvatarFile() {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    fetch(AVATAR_URL, { method: "HEAD" })
      .then((r) => setOk(r.ok && !(r.headers.get("content-type") || "").includes("text/html")))
      .catch(() => setOk(false));
  }, []);
  return ok;
}

function Walker({ walker, mouse }) {
  const root = useRef();
  const motion = useRef({ speed: 0 });
  const frame = useRef({});
  const [pose, setPose] = useState("wave");
  const poseRef = useRef("wave");
  const hasGLB = useHasAvatarFile();
  const { camera } = useThree();

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05); // no big jumps after a tab switch
    const w = walker.current;
    const { u: target, stop } = journeyAt(journey.s);
    const prev = w.u;

    // walk at a real pace towards where the scroll points: ease in, cruise, ease out.
    // If the target is far away (nav click), he jogs a bit faster so it doesn't take forever.
    const left = (target - w.u) * PATH_LEN; // world units still to go (signed)
    const far = Math.abs(left);
    const top = WALK_SPEED + Math.max(0, far - STOP_GAP) * 0.35;
    const want = Math.sign(left) * Math.min(top, Math.sqrt(2 * WALK_ACCEL * far));
    const dv = want - w.vel;
    w.vel += Math.sign(dv) * Math.min(Math.abs(dv), WALK_ACCEL * 1.6 * dt);
    const step = w.vel * dt;
    if (far < 0.01 || Math.abs(step) >= far) {
      w.u = target;
      w.vel = 0;
    } else {
      w.u += step / PATH_LEN;
    }
    const f = frameAt(w.u, frame.current);

    motion.current.speed = Math.abs(w.vel);
    w.speed = motion.current.speed;

    // tell the page when he has actually reached a stop, so its card shows on arrival
    const arrived = stop >= 0 && w.u === target ? stop : -1;
    if (arrived !== journey.arrived) {
      journey.arrived = arrived;
      window.dispatchEvent(new Event("journey-arrive"));
    }

    root.current.position.copy(f.p);
    // face where he's walking; when stopped, turn to the camera
    let face;
    if (motion.current.speed > 0.15) face = Math.atan2(f.t.x, f.t.z) + (w.u < prev ? Math.PI : 0);
    else face = Math.atan2(camera.position.x - f.p.x, camera.position.z - f.p.z);
    const cur = root.current.rotation.y;
    root.current.rotation.y = cur + Math.atan2(Math.sin(face - cur), Math.cos(face - cur)) * Math.min(1, dt * 6);

    const next = stop === 0 || stop === STOPS - 1 ? "wave" : "idle";
    if (next !== poseRef.current) {
      poseRef.current = next;
      setPose(next);
    }
  });

  const chibi = <Avatar pose={pose} mouse={mouse} motion={motion} />;
  return (
    <group ref={root}>
      {hasGLB ? (
        <AvatarBoundary fallback={chibi}>
          <Suspense fallback={chibi}>
            <GLBAvatar pose={pose} motion={motion} />
          </Suspense>
        </AvatarBoundary>
      ) : (
        chibi
      )}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.04, 0]}>
        <circleGeometry args={[0.55, 24]} />
        <meshBasicMaterial color="#1c1917" transparent opacity={0.12} />
      </mesh>
    </group>
  );
}

// ---------- camera + light follow him ----------
function Follow({ walker }) {
  const { camera, size, scene } = useThree();
  const light = useRef();
  const frame = useRef({});
  const look = useRef(new THREE.Vector3(0, 1, 0));
  const pos = useRef(new THREE.Vector3(9, 6, 4));
  const tmp = useMemo(() => ({ goal: new THREE.Vector3(), lk: new THREE.Vector3(), left: new THREE.Vector3(), up: new THREE.Vector3(0, 1, 0) }), []);
  const mobile = size.width < 768;
  const sky = useMemo(() => skyAt(0), []);
  const lastHex = useRef("");

  useEffect(() => {
    scene.fog = new THREE.Fog(BG, 26, 62);
    return () => (scene.fog = null);
  }, [scene]);

  useFrame((_, dt) => {
    const { p, t, r } = frameAt(walker.current.u, frame.current);
    // stand off to the right of the path, a bit behind and above
    tmp.goal.copy(p).addScaledVector(r, mobile ? 8.5 : 9.5).addScaledVector(t, -2.5).setY(mobile ? 5.2 : 4.6);
    // look between him and the stop's object
    tmp.lk.copy(p).addScaledVector(r, -1.4).setY(1.3);
    // nudge the framing: on desktop push the subject right (text card sits left); on phones push it up
    tmp.left.subVectors(tmp.lk, tmp.goal).normalize().cross(tmp.up).multiplyScalar(-1);
    if (mobile) tmp.lk.y -= 1.9;
    else tmp.lk.addScaledVector(tmp.left, 2.6);

    const k = Math.min(1, dt * 3);
    pos.current.lerp(tmp.goal, k);
    look.current.lerp(tmp.lk, k);
    camera.position.copy(pos.current);
    camera.lookAt(look.current);

    light.current.position.set(p.x + 6, 12, p.z + 6);
    light.current.target.position.copy(p);
    light.current.target.updateMatrixWorld();

    // time of day follows the walk: fog + sunlight in 3D, and the page background behind it
    skyAt(walker.current.u, sky);
    scene.fog.color.copy(sky.sky);
    light.current.color.copy(sky.sun);
    light.current.intensity = sky.power;
    const hex = `#${sky.sky.getHexString()}`;
    if (hex !== lastHex.current) {
      lastHex.current = hex;
      document.documentElement.style.setProperty("--sky", hex);
    }
  });

  return (
    <directionalLight
      ref={light}
      intensity={1.7}
      castShadow
      shadow-mapSize={[2048, 2048]}
      shadow-bias={-0.0005}
      shadow-camera-left={-14}
      shadow-camera-right={14}
      shadow-camera-top={14}
      shadow-camera-bottom={-14}
      shadow-camera-far={50}
    />
  );
}

export default function World() {
  const mouse = useRef({ x: 0, y: 0 });
  const walker = useRef({ u: 0, vel: 0, speed: 0 });
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
    <div aria-hidden className={`fixed inset-0 z-0 pointer-events-none transition-opacity duration-700 ${ready ? "opacity-100" : "opacity-0"}`}>
      <Canvas
        shadows
        dpr={[1, 1.75]}
        camera={{ position: [9, 6, 4], fov: 40, near: 0.1, far: 120 }}
        gl={{ antialias: true, alpha: true }}
        onCreated={() => setReady(true)}
      >
        <ambientLight intensity={0.5} />
        <hemisphereLight args={["#ffffff", "#e7e5e4", 0.7]} />
        <Follow walker={walker} />
        <Ground />
        <PathRibbon />
        <StopMarkers />
        <Scenery />
        <Stops />
        <Signposts />
        <Walker walker={walker} mouse={mouse} />
        <Dust walker={walker} />
        <Sparkles count={70} scale={[50, 6, 60]} position={[0, 3, -24]} size={3} speed={0.25} opacity={0.5} color={ACCENT} />
      </Canvas>
    </div>
  );
}
