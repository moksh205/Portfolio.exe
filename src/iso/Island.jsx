import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import { Box } from "./Buildings";
import { PLACES, ISLAND, FOUNTAIN } from "./places";

const GRASS = "#78b85a";
const STONE = "#d8c9a8";

function rng(seed) {
  return () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
}

// ---------- ground ----------
function Ground({ onGround }) {
  const r = useMemo(() => rng(11), []);
  const drips = useMemo(
    () =>
      Array.from({ length: 48 }).map((_, i) => {
        const side = i % 4;
        const t = -ISLAND + 0.6 + r() * (ISLAND * 2 - 1.2);
        const h = 0.3 + r() * 0.6;
        const x = side === 0 ? t : side === 1 ? t : side === 2 ? -ISLAND - 0.05 : ISLAND + 0.05;
        const z = side === 0 ? ISLAND + 0.05 : side === 1 ? -ISLAND - 0.05 : t;
        return { x, z, h, w: 0.4 + r() * 0.8, along: side < 2 ? "x" : "z" };
      }),
    [r]
  );
  return (
    <group>
      {/* grass top (click to walk) */}
      <mesh
        position={[0, -0.25, 0]}
        receiveShadow
        onClick={(e) => {
          e.stopPropagation();
          onGround(e.point.x, e.point.z);
        }}
      >
        <boxGeometry args={[ISLAND * 2, 0.5, ISLAND * 2]} />
        <meshStandardMaterial color={GRASS} roughness={1} />
      </mesh>
      {/* dirt + rock underside */}
      <Box s={[ISLAND * 2 - 0.3, 1.8, ISLAND * 2 - 0.3]} p={[0, -1.4, 0]} c="#8a5a3b" shadow={false} />
      <Box s={[ISLAND * 2 - 0.6, 0.12, ISLAND * 2 - 0.6]} p={[0, -0.95, 0]} c="#6e4630" shadow={false} />
      <mesh position={[0, -6.3, 0]} rotation={[0, Math.PI / 4, 0]}>
        <cylinderGeometry args={[ISLAND * 1.38, 0.8, 9.6, 4, 3]} />
        <meshStandardMaterial color="#6b4a3a" flatShading roughness={1} />
      </mesh>
      {/* grass dripping over the edge */}
      {drips.map((d, i) => (
        <Box key={i} s={d.along === "x" ? [d.w, d.h, 0.12] : [0.12, d.h, d.w]} p={[d.x, -0.5 - d.h / 2 + 0.05, d.z]} c={GRASS} shadow={false} />
      ))}
    </group>
  );
}

// ---------- plaza, paths, fountain ----------
function Paths() {
  return (
    <group>
      <mesh position={[0, 0.03, 0]} receiveShadow>
        <cylinderGeometry args={[3.9, 3.9, 0.06, 40]} />
        <meshStandardMaterial color={STONE} roughness={1} />
      </mesh>
      {PLACES.map((p) => {
        const len = Math.hypot(p.door[0], p.door[1]);
        const angle = Math.atan2(p.door[0], p.door[1]);
        return (
          <group key={p.id} rotation={[0, angle, 0]}>
            <mesh position={[0, 0.025, len / 2 + 0.4]} receiveShadow>
              <boxGeometry args={[1.3, 0.05, len + 0.8]} />
              <meshStandardMaterial color={STONE} roughness={1} />
            </mesh>
            {/* stepping-stone texture */}
            {Array.from({ length: Math.floor(len / 0.9) }).map((_, i) => (
              <mesh key={i} position={[(i % 2 ? 0.25 : -0.25), 0.055, 4 + i * 0.9]} receiveShadow>
                <boxGeometry args={[0.5, 0.02, 0.5]} />
                <meshStandardMaterial color="#c4b38f" roughness={1} />
              </mesh>
            ))}
          </group>
        );
      })}
    </group>
  );
}

function Fountain() {
  const spout = useRef();
  const ripple = useRef();
  useFrame((s) => {
    const t = s.clock.elapsedTime;
    spout.current.scale.y = 1 + Math.sin(t * 6) * 0.15;
    const k = (t * 0.6) % 1;
    ripple.current.scale.setScalar(0.4 + k * 1.1);
    ripple.current.material.opacity = 0.5 * (1 - k);
  });
  const [x, z] = FOUNTAIN.pos;
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[FOUNTAIN.radius, FOUNTAIN.radius + 0.1, 0.5, 24]} />
        <meshStandardMaterial color="#b7aa92" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.46, 0]}>
        <cylinderGeometry args={[FOUNTAIN.radius - 0.2, FOUNTAIN.radius - 0.2, 0.1, 24]} />
        <meshStandardMaterial color="#5fc4ff" emissive="#2b8bd6" emissiveIntensity={0.35} roughness={0.2} />
      </mesh>
      <mesh ref={ripple} position={[0, 0.52, 0]} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[0.9, 1.0, 32]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.4} />
      </mesh>
      <mesh position={[0, 0.9, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.28, 0.9, 10]} />
        <meshStandardMaterial color="#b7aa92" />
      </mesh>
      <mesh position={[0, 1.38, 0]} castShadow>
        <cylinderGeometry args={[0.7, 0.35, 0.18, 16]} />
        <meshStandardMaterial color="#c9bda5" />
      </mesh>
      <mesh ref={spout} position={[0, 1.65, 0]}>
        <sphereGeometry args={[0.22, 12, 12]} />
        <meshStandardMaterial color="#9fe0ff" emissive="#5fc4ff" emissiveIntensity={0.6} transparent opacity={0.85} />
      </mesh>
    </group>
  );
}

// ---------- nature ----------
function Tree({ p, kind, s = 1 }) {
  return (
    <group position={[p[0], 0, p[1]]} scale={s}>
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.13, 0.18, 1, 6]} />
        <meshStandardMaterial color="#7a4f33" flatShading />
      </mesh>
      {kind === "pine" ? (
        [0, 1, 2].map((i) => (
          <mesh key={i} position={[0, 1.2 + i * 0.55, 0]} castShadow>
            <coneGeometry args={[0.95 - i * 0.25, 1.0, 7]} />
            <meshStandardMaterial color={["#3f8f55", "#4ea463", "#5fb872"][i]} flatShading />
          </mesh>
        ))
      ) : (
        <>
          <mesh position={[0, 1.55, 0]} castShadow>
            <icosahedronGeometry args={[0.9, 0]} />
            <meshStandardMaterial color="#5aa55a" flatShading />
          </mesh>
          <mesh position={[0.35, 2.05, 0.2]} castShadow>
            <icosahedronGeometry args={[0.55, 0]} />
            <meshStandardMaterial color="#6dbb63" flatShading />
          </mesh>
        </>
      )}
    </group>
  );
}

const TREES = [
  [[10.6, 10.4], "round", 1.1], [[6.4, 10.8], "pine", 0.9], [[10.7, 6.6], "pine", 1], [[1.8, 10.9], "round", 0.85],
  [[-3.2, 10.7], "pine", 1], [[10.9, -3.0], "round", 0.9], [[-10.8, -4.2], "pine", 1.1], [[-3.8, -10.8], "round", 1],
  [[4.6, -10.9], "pine", 0.9], [[-10.8, 4.6], "round", 0.9], [[-10.8, 10.7], "pine", 1.2], [[10.7, -10.7], "pine", 1.1],
  [[-10.9, -10.9], "round", 1.2], [[-0.5, 6.8], "round", 0.7], [[6.5, -2.8], "round", 0.7], [[9.6, -8.4], "round", 1.15], [[8.6, -10.7], "pine", 0.9],
];

function Flowers() {
  const items = useMemo(() => {
    const r = rng(5);
    const out = [];
    while (out.length < 70) {
      const x = (r() * 2 - 1) * (ISLAND - 0.8);
      const z = (r() * 2 - 1) * (ISLAND - 0.8);
      if (Math.hypot(x, z) < 4.5) continue;
      if (PLACES.some((p) => Math.hypot(x - p.pos[0], z - p.pos[1]) < p.radius + 0.8)) continue;
      // keep paths clear
      if (PLACES.some((p) => {
        const L = Math.hypot(p.door[0], p.door[1]);
        const t = (x * p.door[0] + z * p.door[1]) / (L * L);
        return t > 0 && t < 1.1 && Math.hypot(x - t * p.door[0], z - t * p.door[1]) < 1.0;
      })) continue;
      out.push({ x, z, c: ["#ff6b9a", "#ffd23d", "#ffffff", "#b388ff", "#ff8a3d"][Math.floor(r() * 5)], grass: r() > 0.45 });
    }
    return out;
  }, []);
  return items.map((f, i) =>
    f.grass ? (
      <mesh key={i} position={[f.x, 0.15, f.z]}>
        <coneGeometry args={[0.08, 0.3, 4]} />
        <meshStandardMaterial color="#5a9a45" flatShading />
      </mesh>
    ) : (
      <group key={i} position={[f.x, 0, f.z]}>
        <mesh position={[0, 0.12, 0]}>
          <boxGeometry args={[0.03, 0.24, 0.03]} />
          <meshStandardMaterial color="#3f7a35" />
        </mesh>
        <mesh position={[0, 0.27, 0]}>
          <icosahedronGeometry args={[0.08, 0]} />
          <meshStandardMaterial color={f.c} flatShading emissive={f.c} emissiveIntensity={0.15} />
        </mesh>
      </group>
    )
  );
}

function Lamp({ p }) {
  return (
    <group position={[p[0], 0, p[1]]}>
      {/* base + pole */}
      <mesh position={[0, 0.12, 0]} castShadow>
        <cylinderGeometry args={[0.16, 0.2, 0.24, 8]} />
        <meshStandardMaterial color="#3a3d4c" />
      </mesh>
      <mesh position={[0, 1.15, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.07, 2.0, 8]} />
        <meshStandardMaterial color="#3a3d4c" />
      </mesh>
      {/* lantern: glowing glass with a dark frame and roof */}
      <mesh position={[0, 2.35, 0]}>
        <boxGeometry args={[0.34, 0.4, 0.34]} />
        <meshBasicMaterial color="#ffe6a3" toneMapped={false} />
      </mesh>
      {[[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([x, z]) => (
        <mesh key={`${x}${z}`} position={[x * 0.18, 2.35, z * 0.18]}>
          <boxGeometry args={[0.04, 0.44, 0.04]} />
          <meshStandardMaterial color="#2a2c38" />
        </mesh>
      ))}
      <mesh position={[0, 2.66, 0]} rotation-y={Math.PI / 4}>
        <coneGeometry args={[0.32, 0.24, 4]} />
        <meshStandardMaterial color="#2a2c38" flatShading />
      </mesh>
      {/* soft halo */}
      <mesh position={[0, 2.35, 0]}>
        <sphereGeometry args={[0.6, 16, 16]} />
        <meshBasicMaterial color="#ffd27a" transparent opacity={0.16} depthWrite={false} />
      </mesh>
      <pointLight position={[0, 2.2, 0]} color="#ffcf7a" intensity={6} distance={6} decay={1.6} />
    </group>
  );
}

function Clouds() {
  const group = useRef();
  const clouds = useMemo(
    () => [
      { p: [-16, -1.5, 6], s: 1.4 }, { p: [14, 0.5, -14], s: 1.1 }, { p: [-6, -3.5, 17], s: 1.6 },
      { p: [18, -3, 8], s: 1.2 }, { p: [-18, 1, -12], s: 1.0 },
    ],
    []
  );
  useFrame((s, dt) => {
    group.current.children.forEach((c, i) => {
      c.position.x += dt * (0.25 + i * 0.05);
      if (c.position.x > 26) c.position.x = -26;
    });
  });
  return (
    <group ref={group}>
      {clouds.map((c, i) => (
        <group key={i} position={c.p} scale={c.s}>
          {[[0, 0, 0, 1.1], [1.1, -0.2, 0.2, 0.8], [-1.0, -0.25, 0, 0.75], [0.3, 0.5, -0.2, 0.7]].map(([x, y, z, r], j) => (
            <mesh key={j} position={[x, y, z]}>
              <icosahedronGeometry args={[r, 1]} />
              <meshStandardMaterial color="#fff4fb" flatShading transparent opacity={0.92} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

// Ring that shows where you clicked
export function TargetMarker({ ctrl }) {
  const ring = useRef();
  useFrame((s) => {
    const t = ctrl.current.target;
    ring.current.visible = !!t && !t.hideMarker;
    if (t) {
      ring.current.position.set(t.x, 0.08, t.z);
      ring.current.scale.setScalar(1 + Math.sin(s.clock.elapsedTime * 8) * 0.12);
    }
  });
  return (
    <mesh ref={ring} rotation-x={-Math.PI / 2} visible={false}>
      <ringGeometry args={[0.28, 0.4, 24]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.85} />
    </mesh>
  );
}

export default function Island({ onGround }) {
  return (
    <group>
      <Ground onGround={onGround} />
      <Paths />
      <Fountain />
      {TREES.map(([p, kind, s], i) => (
        <Tree key={i} p={p} kind={kind} s={s} />
      ))}
      <Flowers />
      {[[-3.6, -2.2], [1.6, -3.7], [-3.4, 1.8], [3.2, 2.4]].map((p) => (
        <Lamp key={p.join()} p={p} />
      ))}
      <Clouds />
      <Sparkles count={50} scale={[ISLAND * 2, 3, ISLAND * 2]} position={[0, 1.8, 0]} size={4} speed={0.35} color="#fff3b0" opacity={0.9} />
    </group>
  );
}
