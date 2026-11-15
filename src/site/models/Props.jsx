import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { codeTexture, shadowTexture } from "./textures";
import { skills } from "../../data/projectsData";

export const ACCENT = "#10b981";

function M({ c, rough = 0.6, metal = 0, e, ei = 1, ...rest }) {
  return <meshStandardMaterial color={c} roughness={rough} metalness={metal} emissive={e || "#000"} emissiveIntensity={e ? ei : 0} {...rest} />;
}

// Soft blob shadow on the "floor" below an object
export function Shadow({ size = 3, y = 0, opacity = 1 }) {
  const tex = useMemo(() => shadowTexture(), []);
  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, y, 0]}>
      <planeGeometry args={[size, size]} />
      <meshBasicMaterial map={tex} transparent opacity={opacity} depthWrite={false} />
    </mesh>
  );
}

// Round white stage the hero avatar stands on
export function Pedestal({ r = 1.4 }) {
  return (
    <group>
      <mesh position={[0, -0.15, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[r, r * 1.04, 0.3, 64]} />
        <M c="#ffffff" rough={0.4} />
      </mesh>
      <mesh position={[0, 0.005, 0]} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[r - 0.12, r - 0.07, 64]} />
        <meshBasicMaterial color={ACCENT} />
      </mesh>
      <Shadow size={r * 3.4} y={-0.31} />
    </group>
  );
}

// Floating padlock — the cybersecurity mascot
export function Padlock(props) {
  const g = useRef();
  useFrame((s) => {
    const t = s.clock.elapsedTime;
    g.current.rotation.y = Math.sin(t * 0.8) * 0.5;
    g.current.position.y = Math.sin(t * 1.3) * 0.15;
  });
  return (
    <group {...props}>
      <group ref={g}>
        <mesh position={[0, 0.55, 0]} castShadow>
          <torusGeometry args={[0.32, 0.08, 16, 32, Math.PI]} />
          <M c="#cbd5e1" metal={0.8} rough={0.25} />
        </mesh>
        <mesh position={[-0.32, 0.42, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.08, 0.26, 16]} />
          <M c="#cbd5e1" metal={0.8} rough={0.25} />
        </mesh>
        <mesh position={[0.32, 0.42, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.08, 0.26, 16]} />
          <M c="#cbd5e1" metal={0.8} rough={0.25} />
        </mesh>
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[0.95, 0.75, 0.4]} />
          <M c={ACCENT} rough={0.35} />
        </mesh>
        <mesh position={[0, 0.05, 0.21]}>
          <cylinderGeometry args={[0.08, 0.08, 0.02, 16]} />
          <M c="#064e3b" />
        </mesh>
        <mesh position={[0, -0.1, 0.21]}>
          <boxGeometry args={[0.06, 0.18, 0.02]} />
          <M c="#064e3b" />
        </mesh>
      </group>
    </group>
  );
}

// Laptop on a little standing desk
export function Laptop(props) {
  const tex = useMemo(() => codeTexture(), []);
  return (
    <group {...props}>
      {/* desk */}
      <mesh position={[0, 1.02, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.4, 0.08, 1.2]} />
        <M c="#f5f5f4" rough={0.5} />
      </mesh>
      {[[-1.05, -0.5], [1.05, -0.5], [-1.05, 0.5], [1.05, 0.5]].map(([x, z]) => (
        <mesh key={`${x}${z}`} position={[x, 0.5, z]} castShadow>
          <boxGeometry args={[0.07, 1.0, 0.07]} />
          <M c="#a8a29e" metal={0.4} />
        </mesh>
      ))}
      {/* laptop, turned towards whoever stands behind the desk */}
      <group rotation-y={Math.PI}>
        <mesh position={[0, 1.08, 0.1]} castShadow>
          <boxGeometry args={[1.3, 0.05, 0.85]} />
          <M c="#d6d3d1" metal={0.5} rough={0.35} />
        </mesh>
        <mesh position={[0, 1.106, 0.05]}>
          <boxGeometry args={[1.1, 0.01, 0.42]} />
          <M c="#57534e" />
        </mesh>
        {/* screen (hinged at the back edge) */}
        <group position={[0, 1.1, -0.32]} rotation-x={-0.35}>
          <mesh position={[0, 0.31, 0]} castShadow>
            <boxGeometry args={[1.3, 0.62, 0.04]} />
            <M c="#d6d3d1" metal={0.5} rough={0.35} />
          </mesh>
          <mesh position={[0, 0.31, 0.021]}>
            <planeGeometry args={[1.2, 0.54]} />
            <meshBasicMaterial map={tex} toneMapped={false} />
          </mesh>
          {/* sticker on the back of the lid */}
          <mesh position={[0, 0.31, -0.022]} rotation-y={Math.PI}>
            <circleGeometry args={[0.16, 32]} />
            <M c={ACCENT} />
          </mesh>
          <mesh position={[0, 0.29, -0.024]} rotation-y={Math.PI}>
            <planeGeometry args={[0.1, 0.08]} />
            <M c="#ecfdf5" />
          </mesh>
          <mesh position={[0, 0.35, -0.024]} rotation-y={Math.PI}>
            <ringGeometry args={[0.03, 0.045, 16, 1, 0, Math.PI]} />
            <M c="#ecfdf5" side={THREE.DoubleSide} />
          </mesh>
        </group>
      </group>
      {/* coffee mug */}
      <group position={[0.9, 1.06, 0.25]}>
        <mesh position={[0, 0.11, 0]} castShadow>
          <cylinderGeometry args={[0.1, 0.09, 0.22, 20]} />
          <M c={ACCENT} />
        </mesh>
        <mesh position={[0.11, 0.11, 0]} rotation-z={Math.PI / 2}>
          <torusGeometry args={[0.055, 0.018, 8, 16]} />
          <M c={ACCENT} />
        </mesh>
      </group>
      <Shadow size={3.6} y={0.005} />
    </group>
  );
}

// Skill crystals orbiting a glowing core
export function SkillOrbit(props) {
  const ring = useRef();
  const core = useRef();
  const gems = useMemo(() => skills.map((s, i) => ({ c: s.color, a: (i / skills.length) * Math.PI * 2, tier: i % 3 })), []);
  useFrame((s) => {
    const t = s.clock.elapsedTime;
    ring.current.rotation.y = t * 0.35;
    core.current.rotation.x = t * 0.4;
    core.current.rotation.y = t * 0.6;
    ring.current.children.forEach((g, i) => {
      g.rotation.y = t * 1.2 + i;
      g.rotation.x = t * 0.7;
      g.position.y = Math.sin(t * 1.5 + i) * 0.15 + (gems[i].tier - 1) * 0.35;
    });
  });
  return (
    <group {...props}>
      <group rotation={[0.35, 0, -0.15]}>
        <mesh ref={core}>
          <icosahedronGeometry args={[0.75, 0]} />
          <M c="#ecfdf5" e={ACCENT} ei={0.35} flatShading rough={0.3} />
        </mesh>
        <mesh>
          <torusGeometry args={[1.9, 0.012, 8, 120]} />
          <meshBasicMaterial color="#a8a29e" />
        </mesh>
        <group ref={ring}>
          {gems.map((g, i) => (
            <mesh key={i} position={[Math.sin(g.a) * 1.9, 0, Math.cos(g.a) * 1.9]} castShadow>
              <octahedronGeometry args={[0.24, 0]} />
              <M c={g.c} rough={0.25} flatShading e={g.c} ei={0.15} />
            </mesh>
          ))}
        </group>
      </group>
      <Shadow size={4.5} y={-2.2} opacity={0.6} />
    </group>
  );
}

// Clean white server rack with blinking LEDs
export function ServerRack(props) {
  const leds = useMemo(() => ["#10b981", "#3b82f6", "#f59e0b"].map((c) => new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 1 })), []);
  useFrame((s) => {
    const t = s.clock.elapsedTime;
    leds.forEach((m, i) => (m.emissiveIntensity = Math.sin(t * (2.5 + i * 1.3) + i) > -0.2 ? 1.6 : 0.1));
  });
  const units = 8;
  return (
    <group {...props}>
      <mesh position={[0, 1.6, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.5, 3.2, 1.3]} />
        <M c="#fafaf9" rough={0.45} />
      </mesh>
      {Array.from({ length: units }).map((_, i) => (
        <group key={i} position={[0, 0.38 + i * 0.36, 0.66]}>
          <mesh>
            <boxGeometry args={[1.3, 0.28, 0.03]} />
            <M c="#292524" rough={0.4} />
          </mesh>
          {[0, 1, 2].map((k) => (
            <mesh key={k} position={[-0.52 + k * 0.12, 0, 0.02]} material={leds[(i + k) % 3]}>
              <boxGeometry args={[0.06, 0.06, 0.02]} />
            </mesh>
          ))}
          {Array.from({ length: 6 }).map((_, k) => (
            <mesh key={`v${k}`} position={[0.05 + k * 0.1, 0, 0.02]}>
              <boxGeometry args={[0.05, 0.16, 0.01]} />
              <M c="#44403c" />
            </mesh>
          ))}
        </group>
      ))}
      <mesh position={[0, 3.24, 0]}>
        <boxGeometry args={[1.55, 0.08, 1.35]} />
        <M c={ACCENT} />
      </mesh>
      <Shadow size={3.4} y={0.005} />
    </group>
  );
}

// Floating steps climbing up to a flag
export function Stairs(props) {
  const flag = useRef();
  const steps = useRef();
  useFrame((s) => {
    const t = s.clock.elapsedTime;
    flag.current.rotation.y = Math.sin(t * 3) * 0.25;
    steps.current.children.forEach((c, i) => (c.position.y = i * 0.55 + Math.sin(t * 1.4 + i * 0.8) * 0.06));
  });
  const colors = ["#e7e5e4", "#d6d3d1", "#a7f3d0", "#6ee7b7", ACCENT];
  return (
    <group {...props}>
      <group ref={steps}>
        {colors.map((c, i) => (
          <mesh key={i} position={[-1.4 + i * 0.7, i * 0.55, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.9, 0.35, 0.9]} />
            <M c={c} rough={0.45} />
          </mesh>
        ))}
      </group>
      <group position={[1.4, 2.4, 0]}>
        <mesh position={[0, 0.6, 0]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 1.2, 8]} />
          <M c="#44403c" />
        </mesh>
        <mesh ref={flag} position={[0.28, 1.0, 0]}>
          <boxGeometry args={[0.55, 0.34, 0.02]} />
          <M c="#f43f5e" />
        </mesh>
      </group>
      <Shadow size={4.6} y={-0.4} opacity={0.7} />
    </group>
  );
}

// Envelope with a paper plane circling it
export function Mail(props) {
  const env = useRef();
  const orbit = useRef();
  const planeGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    // simple folded paper plane: two wings meeting at a centre crease
    const v = new Float32Array([0, 0, 0.5, -0.32, 0.04, -0.3, 0, -0.06, -0.25, 0, 0, 0.5, 0, -0.06, -0.25, 0.32, 0.04, -0.3]);
    g.setAttribute("position", new THREE.BufferAttribute(v, 3));
    g.computeVertexNormals();
    return g;
  }, []);
  const flapGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array([-1, 0.65, 0, 0, -0.08, 0, 1, 0.65, 0]), 3));
    g.computeVertexNormals();
    return g;
  }, []);
  useFrame((s) => {
    const t = s.clock.elapsedTime;
    env.current.rotation.y = Math.sin(t * 0.7) * 0.35;
    env.current.position.y = Math.sin(t * 1.2) * 0.12;
    orbit.current.rotation.y = t * 0.9;
  });
  return (
    <group {...props}>
      <group ref={env}>
        <mesh castShadow>
          <boxGeometry args={[2.0, 1.3, 0.12]} />
          <M c="#ffffff" rough={0.5} e="#ffffff" ei={0.3} />
        </mesh>
        {/* flap: triangle from the top corners down to the middle */}
        <mesh geometry={flapGeo} position={[0, 0, 0.065]}>
          <M c="#f5f5f4" e="#ffffff" ei={0.15} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, -0.1, 0.08]}>
          <circleGeometry args={[0.16, 24]} />
          <M c={ACCENT} />
        </mesh>
      </group>
      <group ref={orbit} rotation-x={0.25}>
        <mesh geometry={planeGeo} position={[1.9, 0.3, 0]} rotation={[0, Math.PI, 0.2]} castShadow>
          <meshStandardMaterial color="#38bdf8" side={THREE.DoubleSide} flatShading />
        </mesh>
      </group>
      <Shadow size={3.2} y={-1.3} opacity={0.6} />
    </group>
  );
}
