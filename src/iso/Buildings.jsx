import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { officeTexture } from "./textures";

// ---------- tiny building blocks ----------
export function Box({ s, p, c, r, map, e, ei = 1, shadow = true, rough = 0.85, metal = 0 }) {
  return (
    <mesh position={p} rotation={r} castShadow={shadow} receiveShadow>
      <boxGeometry args={s} />
      <meshStandardMaterial color={c} map={map} emissive={e || "#000"} emissiveIntensity={e ? ei : 0} roughness={rough} metalness={metal} />
    </mesh>
  );
}

function Cyl({ a, p, c, r, e, ei = 1, shadow = true }) {
  return (
    <mesh position={p} rotation={r} castShadow={shadow} receiveShadow>
      <cylinderGeometry args={a} />
      <meshStandardMaterial color={c} emissive={e || "#000"} emissiveIntensity={e ? ei : 0} roughness={0.8} />
    </mesh>
  );
}

// Triangular prism roof: ridge along x, triangle in the y/z plane
function Prism({ w, h, d, p, c }) {
  const geo = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-w / 2, 0);
    shape.lineTo(w / 2, 0);
    shape.lineTo(0, h);
    shape.closePath();
    const g = new THREE.ExtrudeGeometry(shape, { depth: d, bevelEnabled: false });
    g.translate(0, 0, -d / 2);
    g.rotateY(Math.PI / 2);
    return g;
  }, [w, h, d]);
  return (
    <mesh geometry={geo} position={p} castShadow receiveShadow>
      <meshStandardMaterial color={c} roughness={0.8} flatShading />
    </mesh>
  );
}

const WARM = "#ffd27a";

function Window({ p, r, s = [0.6, 0.6], frame = "#ffffff" }) {
  return (
    <group position={p} rotation={r}>
      <Box s={[s[0] + 0.14, s[1] + 0.14, 0.05]} p={[0, 0, 0]} c={frame} />
      <Box s={[s[0], s[1], 0.06]} p={[0, 0, 0.01]} c={WARM} e={WARM} ei={0.9} shadow={false} />
      <Box s={[0.04, s[1], 0.07]} p={[0, 0, 0.02]} c={frame} shadow={false} />
      <Box s={[s[0], 0.04, 0.07]} p={[0, 0, 0.02]} c={frame} shadow={false} />
    </group>
  );
}

// ---------- the six places ----------
function House() {
  return (
    <group>
      <Box s={[3.7, 0.25, 3.1]} p={[0, 0.12, 0]} c="#a89a88" />
      <Box s={[3.4, 2.0, 2.8]} p={[0, 1.25, 0]} c="#f3e7d0" />
      <Prism w={3.4} h={1.45} d={3.9} p={[0, 2.25, 0]} c="#c8574b" />
      <Box s={[3.95, 0.12, 0.2]} p={[0, 2.25, 1.55]} c="#8f3a32" />
      <Box s={[3.95, 0.12, 0.2]} p={[0, 2.25, -1.55]} c="#8f3a32" />
      <Box s={[0.42, 1.1, 0.42]} p={[1.0, 3.05, -0.55]} c="#8f3a32" />
      {/* door */}
      <Box s={[0.78, 1.3, 0.08]} p={[0, 0.9, 1.42]} c="#7a4a2a" />
      <Box s={[0.08, 0.08, 0.08]} p={[0.25, 0.9, 1.48]} c="#ffd27a" e="#ffd27a" />
      <Box s={[1.0, 0.04, 0.6]} p={[0, 0.27, 1.75]} c="#9c5b4a" />
      {/* windows + flower boxes */}
      {[-1.05, 1.05].map((x) => (
        <group key={x}>
          <Window p={[x, 1.45, 1.42]} />
          <Box s={[0.8, 0.16, 0.22]} p={[x, 1.02, 1.52]} c="#7a4a2a" />
          {[-0.25, 0, 0.25].map((fx, i) => (
            <mesh key={fx} position={[x + fx, 1.16, 1.53]}>
              <icosahedronGeometry args={[0.09, 0]} />
              <meshStandardMaterial color={["#ff6b9a", "#ffd23d", "#ff8a3d"][i]} flatShading />
            </mesh>
          ))}
        </group>
      ))}
      <Window p={[1.71, 1.45, 0]} r={[0, Math.PI / 2, 0]} />
    </group>
  );
}

const SKILL_GEMS = ["#61dafb", "#ffd43b", "#f7df1e", "#659ad2", "#68a063", "#38bdf8"];

function Workshop() {
  const gems = useRef();
  useFrame((s) => {
    gems.current.rotation.y = s.clock.elapsedTime * 0.6;
    gems.current.children.forEach((g, i) => {
      g.position.y = Math.sin(s.clock.elapsedTime * 2 + i) * 0.12;
      g.rotation.y = s.clock.elapsedTime * 1.5;
    });
  });
  return (
    <group>
      <Box s={[4.0, 0.25, 3.2]} p={[0, 0.12, 0]} c="#8a8f9c" />
      <Box s={[3.8, 2.4, 3.0]} p={[0, 1.45, 0]} c="#4f6fa8" />
      <Box s={[4.1, 0.22, 3.3]} p={[0, 2.75, 0]} c="#2c3e63" />
      {/* shop window full of light */}
      <Box s={[1.8, 1.1, 0.08]} p={[-0.75, 1.45, 1.51]} c="#bff6ff" e="#7ae8ff" ei={0.7} />
      <Box s={[1.95, 0.08, 0.12]} p={[-0.75, 0.88, 1.54]} c="#e8eef8" />
      {/* door */}
      <Box s={[0.8, 1.4, 0.08]} p={[1.2, 0.95, 1.51]} c="#22314f" />
      <Box s={[0.6, 0.5, 0.09]} p={[1.2, 1.25, 1.52]} c="#bff6ff" e="#7ae8ff" ei={0.5} shadow={false} />
      {/* striped awning */}
      {Array.from({ length: 6 }).map((_, i) => (
        <Box key={i} s={[0.66, 0.06, 0.9]} p={[-1.65 + i * 0.66, 2.2, 1.85]} r={[0.35, 0, 0]} c={i % 2 ? "#ffffff" : "#2ee6ff"} />
      ))}
      {/* crates */}
      <Box s={[0.6, 0.6, 0.6]} p={[-2.35, 0.55, 1.0]} c="#b07a45" />
      <Box s={[0.45, 0.45, 0.45]} p={[-2.3, 1.07, 1.05]} r={[0, 0.4, 0]} c="#c58c52" />
      {/* floating skill crystals */}
      <group ref={gems} position={[0, 3.7, 0]}>
        {SKILL_GEMS.map((c, i) => {
          const a = (i / SKILL_GEMS.length) * Math.PI * 2;
          return (
            <mesh key={c + i} position={[Math.sin(a) * 1.2, 0, Math.cos(a) * 1.2]} castShadow>
              <octahedronGeometry args={[0.28, 0]} />
              <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.55} flatShading roughness={0.3} />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}

function ServerTower() {
  const leds = useMemo(() => ["#39ff88", "#ff3df0", "#2ee6ff"].map((c) => new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 1 })), []);
  const dish = useRef();
  const beacon = useRef();
  useFrame((s) => {
    const t = s.clock.elapsedTime;
    leds.forEach((m, i) => (m.emissiveIntensity = Math.sin(t * (3 + i) + i * 2) > 0 ? 1.4 : 0.15));
    dish.current.rotation.y = t * 0.5;
    beacon.current.material.emissiveIntensity = Math.sin(t * 4) > 0 ? 2 : 0.2;
  });
  return (
    <group>
      <Box s={[3.0, 0.3, 3.0]} p={[0, 0.15, 0]} c="#5a5f70" />
      <Box s={[2.6, 5.4, 2.6]} p={[0, 3.0, 0]} c="#2c3147" rough={0.5} metal={0.3} />
      {/* neon edges */}
      {[[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([x, z]) => (
        <Box key={`${x}${z}`} s={[0.07, 5.4, 0.07]} p={[x * 1.31, 3.0, z * 1.31]} c="#ff3df0" e="#ff3df0" ei={1.6} shadow={false} />
      ))}
      {/* dark roof with a neon rim */}
      <Box s={[2.75, 0.12, 2.75]} p={[0, 5.74, 0]} c="#1c2033" />
      {[[0, 1.34, 2.75, 0.07], [0, -1.34, 2.75, 0.07], [1.34, 0, 0.07, 2.75], [-1.34, 0, 0.07, 2.75]].map(([x, z, w, d]) => (
        <Box key={`${x}${z}`} s={[w, 0.08, d]} p={[x, 5.82, z]} c="#ff3df0" e="#ff3df0" ei={1.6} shadow={false} />
      ))}
      {/* server LED racks on the front */}
      {Array.from({ length: 10 }).map((_, row) =>
        [-0.6, 0.6].map((x, col) => (
          <group key={`${row}-${col}`} position={[x, 1.9 + row * 0.36, 1.31]}>
            <Box s={[0.9, 0.22, 0.04]} p={[0, 0, 0]} c="#141826" shadow={false} />
            <mesh position={[-0.33, 0, 0.03]} material={leds[(row + col) % 3]}>
              <boxGeometry args={[0.08, 0.08, 0.03]} />
            </mesh>
            <mesh position={[-0.2, 0, 0.03]} material={leds[(row * 2 + col + 1) % 3]}>
              <boxGeometry args={[0.08, 0.08, 0.03]} />
            </mesh>
          </group>
        ))
      )}
      {/* door */}
      <Box s={[0.9, 1.3, 0.08]} p={[0, 0.95, 1.31]} c="#ffb3f6" e="#ff3df0" ei={0.6} />
      {/* roof: dish + antenna */}
      <group ref={dish} position={[-0.5, 5.8, -0.3]}>
        <Cyl a={[0.06, 0.06, 0.5, 6]} p={[0, 0.25, 0]} c="#9aa0b5" />
        <mesh position={[0, 0.6, 0.1]} rotation={[-0.9, 0, 0]} castShadow>
          <sphereGeometry args={[0.55, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2.4]} />
          <meshStandardMaterial color="#e8ecf5" side={THREE.DoubleSide} roughness={0.5} />
        </mesh>
      </group>
      <Cyl a={[0.04, 0.06, 1.6, 6]} p={[0.7, 6.5, 0.5]} c="#9aa0b5" />
      <mesh ref={beacon} position={[0.7, 7.35, 0.5]}>
        <sphereGeometry args={[0.1, 10, 10]} />
        <meshStandardMaterial color="#ff4040" emissive="#ff2020" emissiveIntensity={2} />
      </mesh>
    </group>
  );
}

function Office() {
  const tex = useMemo(() => officeTexture(), []);
  const wall = useMemo(() => new THREE.MeshStandardMaterial({ map: tex, roughness: 0.6, emissive: "#ffd27a", emissiveMap: tex, emissiveIntensity: 0.35 }), [tex]);
  const roof = useMemo(() => new THREE.MeshStandardMaterial({ color: "#59627a" }), []);
  const hook = useRef();
  useFrame((s) => (hook.current.position.y = 5.3 + Math.sin(s.clock.elapsedTime) * 0.3));
  return (
    <group>
      <Box s={[3.3, 0.25, 3.3]} p={[0, 0.12, 0]} c="#8a8f9c" />
      <mesh position={[0, 2.45, 0]} castShadow receiveShadow material={[wall, wall, roof, roof, wall, wall]}>
        <boxGeometry args={[3, 4.4, 3]} />
      </mesh>
      <Box s={[3.2, 0.2, 3.2]} p={[0, 4.75, 0]} c="#3d4560" />
      {/* glass door */}
      <Box s={[1.1, 1.3, 0.08]} p={[0, 0.9, 1.52]} c="#bfe3ff" e="#9fd4ff" ei={0.5} />
      {/* caution stripe: floors still being built */}
      {Array.from({ length: 8 }).map((_, i) => (
        <Box key={i} s={[0.38, 0.18, 0.06]} p={[-1.33 + i * 0.38, 4.35, 1.53]} c={i % 2 ? "#1a1a1a" : "#ffd23d"} shadow={false} />
      ))}
      {/* crane */}
      <Box s={[0.26, 3.0, 0.26]} p={[1.1, 6.35, -1.1]} c="#ffc22e" />
      <Box s={[3.6, 0.2, 0.22]} p={[-0.2, 7.9, -1.1]} c="#ffc22e" />
      <Box s={[0.7, 0.5, 0.5]} p={[1.65, 7.65, -1.1]} c="#5a5f70" />
      <Box s={[0.5, 0.45, 0.5]} p={[1.1, 7.3, -1.1]} c="#2e86de" />
      <Box s={[0.03, 2.4, 0.03]} p={[-1.7, 6.7, -1.1]} c="#333" shadow={false} />
      <group ref={hook} position={[-1.7, 5.3, -1.1]}>
        <Box s={[0.6, 0.3, 0.6]} p={[0, 0, 0]} c="#b07a45" />
      </group>
      {/* traffic cones */}
      {[-1.0, 1.0].map((x) => (
        <group key={x} position={[x, 0.25, 2.0]}>
          <mesh position={[0, 0.25, 0]} castShadow>
            <coneGeometry args={[0.18, 0.5, 10]} />
            <meshStandardMaterial color="#ff7a1a" />
          </mesh>
          <Cyl a={[0.11, 0.13, 0.08, 10]} p={[0, 0.25, 0]} c="#ffffff" />
        </group>
      ))}
    </group>
  );
}

function PhoneBooth() {
  const env = useRef();
  useFrame((s) => {
    env.current.rotation.y = s.clock.elapsedTime * 1.2;
    env.current.position.y = 3.3 + Math.sin(s.clock.elapsedTime * 2) * 0.12;
  });
  return (
    <group>
      <Box s={[1.5, 0.2, 1.5]} p={[-0.4, 0.1, 0]} c="#8a8f9c" />
      {/* booth */}
      <Box s={[1.2, 2.5, 1.2]} p={[-0.4, 1.45, 0]} c="#d6453d" />
      <Box s={[0.85, 1.6, 0.06]} p={[-0.4, 1.4, 0.6]} c="#fff1c9" e="#ffd27a" ei={0.6} />
      <Box s={[0.06, 1.6, 0.07]} p={[-0.4, 1.4, 0.62]} c="#d6453d" shadow={false} />
      <Box s={[0.85, 0.06, 0.07]} p={[-0.4, 1.4, 0.62]} c="#d6453d" shadow={false} />
      <Box s={[1.3, 0.25, 1.3]} p={[-0.4, 2.82, 0]} c="#b5382f" />
      <Box s={[0.9, 0.2, 0.05]} p={[-0.4, 2.55, 0.62]} c="#ffffff" e="#ffffff" ei={0.6} shadow={false} />
      {/* mailbox */}
      <Cyl a={[0.06, 0.06, 0.9, 6]} p={[0.85, 0.45, 0.3]} c="#555" />
      <Box s={[0.5, 0.42, 0.75]} p={[0.85, 1.08, 0.3]} c="#3d6fd6" />
      <Cyl a={[0.25, 0.25, 0.75, 12, 1, false, 0, Math.PI]} p={[0.85, 1.29, 0.3]} r={[Math.PI / 2, 0, Math.PI / 2]} c="#3d6fd6" />
      <Box s={[0.04, 0.35, 0.12]} p={[1.12, 1.35, 0.45]} c="#e8433a" />
      {/* floating envelope */}
      <group ref={env} position={[0.2, 3.3, 0]}>
        <Box s={[0.8, 0.5, 0.05]} p={[0, 0, 0]} c="#ffffff" e="#ffffff" ei={0.25} />
        <Box s={[0.5, 0.04, 0.06]} p={[-0.17, 0.08, 0.01]} r={[0, 0, -0.6]} c="#ff6b3d" shadow={false} />
        <Box s={[0.5, 0.04, 0.06]} p={[0.17, 0.08, 0.01]} r={[0, 0, 0.6]} c="#ff6b3d" shadow={false} />
      </group>
    </group>
  );
}

const MODELS = { about: House, skills: Workshop, projects: ServerTower, experience: Office, contact: PhoneBooth };
const LABEL_Y = { about: 4.4, skills: 4.6, projects: 8.0, experience: 8.5, contact: 4.2 };

export default function Building({ place, near, touch, onSelect }) {
  const Model = MODELS[place.id];
  const c = place.color;
  return (
    <group
      position={[place.pos[0], 0, place.pos[1]]}
      rotation={[0, place.angle, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(place);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => (document.body.style.cursor = "")}
    >
      <Model />
      <Html position={[0, LABEL_Y[place.id], 0]} center zIndexRange={[20, 10]}>
        <button
          onClick={() => onSelect(place)}
          className={`flex flex-col items-center gap-1 transition-transform duration-200 ${near ? "scale-110" : "hover:scale-105"}`}
        >
          <span
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-bold font-mono whitespace-nowrap text-slate-900 shadow-lg"
            style={{ background: c, boxShadow: near ? `0 0 18px ${c}` : "0 4px 10px rgba(0,0,0,0.35)" }}
          >
            <place.icon /> {place.title}
          </span>
          {near && (
            <span className="prompt-bob px-2 py-0.5 rounded bg-black/70 text-white text-[11px] font-mono whitespace-nowrap">
              {touch ? "tap ENTER" : "press E"}
            </span>
          )}
        </button>
      </Html>
    </group>
  );
}
